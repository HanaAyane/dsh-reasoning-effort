import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import type { ModelDirectory, ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { ReasoningEffortTranslate } from './locales.js'

export interface EffortLevel {
  readonly id: string
  readonly name: string
}

export type EffortSelection = ModelSelection & { readonly reasoningEffort: string }

export function currentModel(state: ModelDirectoryState) {
  const current = state.current
  return state.groups.find((group) => group.id === current?.provider)
    ?.models.find((model) => model.id === current?.model)
}

export function sliderLevels(state: ModelDirectoryState): readonly EffortLevel[] {
  const efforts = currentModel(state)?.reasoning?.efforts
  return efforts !== undefined && efforts.length >= 2 ? efforts : []
}

export function effortIndex(levels: readonly EffortLevel[], id: string | undefined): number {
  return levels.findIndex((level) => level.id === id)
}

export function clampIndex(value: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(value)))
}

function sameModel(current: ModelSelection | null, target: ModelSelection): boolean {
  return current?.provider === target.provider && current.model === target.model
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
  target: EffortSelection,
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
        if (effortIndex(currentModel(state)?.reasoning?.efforts ?? [], target.reasoningEffort) < 0) {
          finish(undefined, new Error(t('effort.unsupported', { effort: target.reasoningEffort })))
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
  target: EffortSelection,
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
    if (effortIndex(currentModel(state)?.reasoning?.efforts ?? [], target.reasoningEffort) < 0) {
      throw new Error(t('effort.unsupported', { effort: target.reasoningEffort }))
    }
  }

  const result = await abortable(directory.select(target), signal)
  signal.throwIfAborted()
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  return waitForSelection(directory, target, signal, t, timeoutMs)
}
