import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import type { ModelDirectory, ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { ReasoningEffortTranslate } from './locales.js'

export interface EffortLevel {
  readonly id: string | undefined
  readonly name: string
}

const EFFORT_MEMORY_PREFIX = 'dsh-reasoning-effort.last-selection:'

function catalogModel(state: ModelDirectoryState, selection: ModelSelection) {
  return state.groups.find((group) => group.id === selection.provider)
    ?.models.find((model) => model.id === selection.model)
}

export function currentModel(state: ModelDirectoryState) {
  const current = state.current
  return current === null ? undefined : catalogModel(state, current)
}

export function sliderLevels(state: ModelDirectoryState, t: ReasoningEffortTranslate): readonly EffortLevel[] {
  const reasoning = currentModel(state)?.reasoning
  if (reasoning === undefined) return []
  if (reasoning.efforts.length === 1 && reasoning.defaultEffort === undefined) {
    return [{ id: undefined, name: t('model.defaultEffort') }, ...reasoning.efforts]
  }
  return reasoning.efforts.length >= 2 ? reasoning.efforts : []
}

export function effortIndex(levels: readonly EffortLevel[], id: string | undefined): number {
  return levels.findIndex((level) => level.id === id)
}

export function clampIndex(value: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(value)))
}

function supportsEffort(state: ModelDirectoryState, effort: string | undefined, t: ReasoningEffortTranslate): boolean {
  const levels = effort === undefined ? sliderLevels(state, t) : currentModel(state)?.reasoning?.efforts ?? []
  return effortIndex(levels, effort) >= 0
}

function sameModel(current: ModelSelection | null, target: ModelSelection): boolean {
  return current?.provider === target.provider && current.model === target.model
}

function effortMemoryKey({ provider, model }: ModelSelection): string {
  return EFFORT_MEMORY_PREFIX + JSON.stringify([provider, model])
}

function readRememberedEffort(selection: ModelSelection): string | null | undefined {
  try {
    const stored = window.localStorage.getItem(effortMemoryKey(selection))
    if (stored === null) return undefined
    const effort: unknown = JSON.parse(stored)
    return effort === null || typeof effort === 'string' ? effort : undefined
  } catch {
    return undefined
  }
}

function rememberEffort(selection: ModelSelection): void {
  try {
    // Null is an explicit return to the provider default. A missing key is unlearned.
    window.localStorage.setItem(effortMemoryKey(selection), JSON.stringify(selection.reasoningEffort ?? null))
  } catch {
    // Storage restrictions must not affect model selection.
  }
}

/** Apply a remembered effort only to an actual model switch and a still-valid route. */
export function restoreRememberedEffort(state: ModelDirectoryState, selection: ModelSelection): ModelSelection {
  if (sameModel(state.current, selection)) return selection

  // Seed existing sessions from an already-confirmed choice when there is no memory.
  const previous = state.current
  if (state.status === 'ready' && state.pending === null && previous?.reasoningEffort !== undefined &&
    effortIndex(currentModel(state)?.reasoning?.efforts ?? [], previous.reasoningEffort) >= 0 &&
    readRememberedEffort(previous) === undefined) {
    rememberEffort(previous)
  }

  const remembered = readRememberedEffort(selection)
  if (remembered === undefined) return selection
  const reasoning = catalogModel(state, selection)?.reasoning
  if (remembered === null) {
    return reasoning !== undefined && reasoning.defaultEffort === undefined && reasoning.efforts.length > 0
      ? { provider: selection.provider, model: selection.model }
      : selection
  }
  return effortIndex(reasoning?.efforts ?? [], remembered) >= 0
    ? { ...selection, reasoningEffort: remembered }
    : selection
}

/** Stop waiting locally; the directory API cannot cancel an already-sent RPC. */
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason)
    signal.addEventListener('abort', abort, { once: true })
    promise.then(
      (value) => { signal.removeEventListener('abort', abort); resolve(value) },
      (error: unknown) => { signal.removeEventListener('abort', abort); reject(error) },
    )
    if (signal.aborted) {
      signal.removeEventListener('abort', abort)
      abort()
    }
  })
}

/** An RPC acknowledgement can arrive before the durable selection projection. */
function waitForSelection(
  directory: ModelDirectory,
  target: ModelSelection,
  signal: AbortSignal,
  t: ReasoningEffortTranslate,
  timeoutMs: number,
): Promise<ModelDirectoryState> {
  return new Promise((resolve, reject) => {
    let unsubscribe = () => {}
    let timer: ReturnType<typeof setTimeout> | undefined
    let settled = false
    const finish = (state?: ModelDirectoryState, error?: unknown) => {
      if (settled) return
      settled = true
      unsubscribe()
      clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      if (state !== undefined) resolve(state)
      else reject(error)
    }
    const abort = () => finish(undefined, signal.reason)
    const check = () => {
      if (signal.aborted) return abort()
      const state = directory.store.getSnapshot()
      if (state.pending !== null && (
        !sameModel(state.pending, target) || state.pending.reasoningEffort !== target.reasoningEffort
      )) {
        finish(undefined, new Error(t('effort.selectionChanged')))
      } else if (state.current !== null && !sameModel(state.current, target)) {
        finish(undefined, new Error(t('effort.modelChanged')))
      } else if (state.status === 'error') {
        finish(undefined, new Error(state.error ?? t('effort.unconfirmed')))
      } else if (sameModel(state.current, target) && state.status === 'ready' && state.pending === null) {
        if (!supportsEffort(state, target.reasoningEffort, t)) {
          finish(undefined, new Error(t('effort.unsupported', { effort: target.reasoningEffort ?? t('model.defaultEffort') })))
        } else if (state.current?.reasoningEffort === target.reasoningEffort) {
          finish(state)
        }
      }
    }
    unsubscribe = directory.store.subscribe(check)
    signal.addEventListener('abort', abort, { once: true })
    timer = setTimeout(() => finish(undefined, new Error(t('effort.unconfirmed'))), timeoutMs)
    check()
  })
}

/** Revalidate a captured route and effort ID, never a position in a new catalog. */
export async function selectEffort(
  directory: ModelDirectory,
  target: ModelSelection,
  signal: AbortSignal,
  t: ReasoningEffortTranslate,
  timeoutMs = 5000,
): Promise<ModelDirectoryState> {
  signal.throwIfAborted()
  const initial = directory.store.getSnapshot()
  const originalEffort = initial.current?.reasoningEffort
  if (!sameModel(initial.current, target)) throw new Error(t('effort.modelChanged'))
  if (initial.status === 'loading' || initial.status === 'selecting' || initial.pending !== null) {
    throw new Error(t('effort.busy'))
  }

  const fresh = await abortable(directory.load(), signal)
  signal.throwIfAborted()
  // load() returns a snapshot; a newer selection can start before this continuation.
  for (const state of [fresh, directory.store.getSnapshot()]) {
    if (!sameModel(state.current, target)) throw new Error(t('effort.modelChanged'))
    if (state.status === 'error') throw new Error(state.error ?? t('effort.unconfirmed'))
    if (state.status !== 'ready' || state.pending !== null) throw new Error(t('effort.busy'))
    if (state.current?.reasoningEffort !== originalEffort) {
      throw new Error(t('effort.selectionChanged'))
    }
    if (!supportsEffort(state, target.reasoningEffort, t)) {
      throw new Error(t('effort.unsupported', { effort: target.reasoningEffort ?? t('model.defaultEffort') }))
    }
  }

  const result = await abortable(directory.select(target), signal)
  signal.throwIfAborted()
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  const confirmed = await waitForSelection(directory, target, signal, t, timeoutMs)
  rememberEffort(target)
  return confirmed
}
