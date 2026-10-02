/**
 * Session-scoped model and reasoning-effort control for the DSH composer model seat.
 *
 * The control deliberately follows DSH's own session model-selection contract:
 * `sessions.models()` supplies the exact current route and its adapter-owned
 * effort metadata; `sessions.selectModel()` submits the complete selection for
 * the next assembled turn. The slider adapts to whatever effort levels the
 * current model exposes — their count and order are the adapter's, never
 * assumed here.
 *
 * @module dsh-reasoning-effort/client
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import type {
  ModelDirectory,
  ModelDirectoryResolver,
  ModelDirectoryState,
} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import {
  en,
  NS,
  zh,
  type ReasoningEffortLocaleKey,
  type ReasoningEffortTranslate,
} from './locales.js'
import { CSS } from './styles.js'
import { positionModelMenu } from './menu-position.js'
import {
  clampIndex,
  currentModel,
  effortIndex,
  selectEffort,
  sliderLevels,
} from './effort-selection.js'
// Agent briefs inlined as text at build time; the copied document picks one by
// the active locale.
import agentTutorialEn from './agent-tutorial.en.md'
import agentTutorialZh from './agent-tutorial.zh.md'

/** Host RPC result envelope (matches `@deepseek-ai/dsh-host-apiproxy`). */
type ReRpcResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } }

interface HostRpc {
  call(channel: string, endpoint: string, payload?: unknown): Promise<unknown>
}

/** Channel the Host half registers its guidance endpoints on. */
const ADAPT_CHANNEL = '/dsh-reasoning-effort'

/** One guidance result from the Host half. */
interface AdaptGuidance {
  readonly provider: string
  readonly model: string
  readonly userDeclared: boolean
  readonly needsGuide: boolean
  readonly reason: 'missing' | 'mismatch' | 'none'
  readonly current: string[]
  readonly expected: string[]
  readonly matched: boolean
  readonly mode: 'replace' | 'insert'
  readonly noteKey: 'glm52' | 'kimiK3' | null
  readonly note: string | null
  readonly warning: 'developerRole' | null
  readonly entryHead: string | null
  readonly fieldBlock: string | null
  readonly entryLine: string
  readonly entryPath: string
  readonly modelIndent: number
  readonly settingsPath: string | null
}

/** The client-facing guidance service (Client→Host over the Connection RPC). */
interface AdaptationService {
  diagnose(provider: string, model: string): Promise<AdaptGuidance | null>
}

const LEVEL_NAME_KEYS: Record<string, ReasoningEffortLocaleKey> = {
  off: 'level.off',
  minimal: 'level.minimal',
  low: 'level.low',
  medium: 'level.medium',
  high: 'level.high',
  xhigh: 'level.xhigh',
  max: 'level.max',
}

function levelName(level: string, t: ReasoningEffortTranslate): string {
  const key = LEVEL_NAME_KEYS[level]
  return key === undefined ? level : t(key)
}

function levelsText(levels: readonly string[], t: ReasoningEffortTranslate): string {
  return levels.length === 0 ? t('level.none') : levels.map((level) => levelName(level, t)).join(' / ')
}

/**
 * Localized field-block template for a model the knowledge base does not know.
 *
 * `compat` stays a commented example rather than a written block: a guessed
 * `thinkingFormat` is worse than none, because the endpoint then receives a
 * switch it does not read, while an absent `compat` lets the adapter apply its
 * own base-URL detection (which is what an unrecognized OpenAI-compatible
 * endpoint wants anyway, and the correct vendor format for a recognized one).
 */
function templateSnippet(t: ReasoningEffortTranslate, modelIndent: number): string {
  const fieldPrefix = ' '.repeat(modelIndent + 2)
  const valuePrefix = ' '.repeat(modelIndent + 4)
  return [
    `${fieldPrefix}reasoningEfforts:`,
    `${valuePrefix}low: "low"        # ${t('yaml.keyComment')}`,
    `${valuePrefix}high: "high"      # ${t('yaml.valueComment')}`,
    `${fieldPrefix}# ${t('yaml.compatComment')}`,
    `${fieldPrefix}# compat:`,
    `${fieldPrefix}#   thinkingFormat: "qwen"`,
    `${fieldPrefix}#   supportsReasoningEffort: false`,
    `${fieldPrefix}#   supportsDeveloperRole: false`,
  ].join('\n')
}

function configDocumentName(path: string | null): string {
  return path?.split(/[\\/]/u).at(-1) || 'settings.yaml'
}

function guidanceNote(guidance: AdaptGuidance, t: ReasoningEffortTranslate): string {
  if (guidance.note !== null) return guidance.note
  if (guidance.noteKey === 'glm52') return t('knowledge.glm52')
  if (guidance.noteKey === 'kimiK3') return t('knowledge.kimiK3')
  return t('knowledge.unknown')
}

function guidanceWarning(guidance: AdaptGuidance, t: ReasoningEffortTranslate): string | null {
  return guidance.warning === 'developerRole' ? t('warning.developerRole') : null
}

function guidanceSnippet(guidance: AdaptGuidance, t: ReasoningEffortTranslate): string {
  const block = guidance.fieldBlock ?? templateSnippet(t, guidance.modelIndent)
  return guidance.entryHead === null ? block : `${guidance.entryHead}\n${block}`
}

/**
 * Copy observed model/configuration facts and vendor-neutral declaration rules.
 * Knowledge-base suggestions are excluded: the recipient verifies the endpoint.
 * The rules themselves live in the markdown briefs so they can be reviewed and
 * revised as documents rather than as dictionary strings.
 */
function agentBrief(
  guidance: AdaptGuidance,
  tutorial: string,
  t: ReasoningEffortTranslate,
): string {
  const facts = t('agent.facts', {
    provider: guidance.provider,
    model: guidance.model,
    path: guidance.settingsPath ?? t('agent.configUnknown'),
    entryPath: guidance.entryPath,
    entryLine: guidance.entryLine,
    current: levelsText(guidance.current, t),
  })
  return [
    t('agent.intro'),
    '',
    t('agent.factsHeading'),
    facts,
    '',
    t('agent.task'),
    '',
    '---',
    '',
    tutorial.replace(/\r\n/gu, '\n')
      .replaceAll('{{CONFIG_FILE}}', guidance.settingsPath ?? t('agent.configUnknown'))
      .replaceAll('{{ENTRY_PATH}}', guidance.entryPath)
      .trim(),
    '',
  ].join('\n')
}

/** Wrap the Host RPC channel in typed helpers; null while the Host half is absent. */
function makeAdaptationService(rpc: HostRpc | undefined): AdaptationService | null {
  if (rpc === undefined) return null
  const call = async <T,>(endpoint: string, payload?: unknown): Promise<T | null> => {
    try {
      const result = (await rpc.call(ADAPT_CHANNEL, endpoint, payload)) as ReRpcResult<T>
      return result.ok ? result.value : null
    } catch {
      return null
    }
  }
  return {
    diagnose: (provider, model) => call<AdaptGuidance>('diagnose', { provider, model }),
  }
}

/** Copy text to the clipboard, falling back to a transient textarea selection. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      textarea.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** The slice of the locale service this half reads: the active language id. */
interface LocaleRuntimeLike {
  getLocale(): { active: string }
}

interface ModelSeatInjectedProps {
  readonly locked: boolean
  readonly available: boolean
  readonly controller: ModelDirectory
  readonly directory: SnapshotStore<ModelDirectoryState>
  readonly load: () => void
  readonly select: (selection: ModelSelection) => Promise<boolean>
  readonly adapt: AdaptationService | null
  /** Rules document for the active locale, read at copy time. */
  readonly agentTutorial: () => string
}

type ModelSeatProps = ModelSeatInjectedProps & PropsLocale<typeof NS>

const SLOT = 'conversation.input.model'
const SETTINGS_SLOT = 'settings.general.item'
const ENABLED_STORAGE_KEY = 'dsh-reasoning-effort.enabled'
const LEGACY_ENABLED_STORAGE_KEY = '@dsh-external/dsh-reasoning-effort.enabled'
const CHIBI_THUMB_STORAGE_KEY = 'dsh-reasoning-effort.chibi-thumb'
export const inject = ['slots', 'modelDirectories', 'connection', 'locale', 'remote', 'remote.session']

function readEnabledPreference(): boolean {
  try {
    const current = window.localStorage.getItem(ENABLED_STORAGE_KEY)
    const stored = current ?? window.localStorage.getItem(LEGACY_ENABLED_STORAGE_KEY)
    return stored !== 'false'
  } catch {
    return true
  }
}

let enabledPreference = readEnabledPreference()
const enabledListeners = new Set<() => void>()

const enabledStore = {
  getSnapshot: () => enabledPreference,
  subscribe: (listener: () => void) => {
    enabledListeners.add(listener)
    return () => enabledListeners.delete(listener)
  },
  set: (enabled: boolean, persist = true) => {
    if (enabledPreference === enabled) return
    enabledPreference = enabled
    if (persist) {
      try {
        window.localStorage.setItem(ENABLED_STORAGE_KEY, String(enabled))
      } catch {
        // The current page still follows the choice when storage is unavailable.
      }
    }
    enabledListeners.forEach((listener) => listener())
  },
}

function readChibiThumbPreference(): boolean {
  try {
    // Default on: only an explicit "false" disables the chibi thumb.
    return window.localStorage.getItem(CHIBI_THUMB_STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

let chibiThumbPreference = readChibiThumbPreference()
const chibiThumbListeners = new Set<() => void>()

const chibiThumbStore = {
  getSnapshot: () => chibiThumbPreference,
  subscribe: (listener: () => void) => {
    chibiThumbListeners.add(listener)
    return () => chibiThumbListeners.delete(listener)
  },
  set: (enabled: boolean, persist = true) => {
    if (chibiThumbPreference === enabled) return
    chibiThumbPreference = enabled
    if (persist) {
      try {
        window.localStorage.setItem(CHIBI_THUMB_STORAGE_KEY, String(enabled))
      } catch {
        // The current page still follows the choice when storage is unavailable.
      }
    }
    chibiThumbListeners.forEach((listener) => listener())
  },
}

interface RadiationState {
  progress: number
  dragging: boolean
}

function drawRadiation(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  state: RadiationState,
): void {
  const origin = state.progress * width
  const isDark = document.body.hasAttribute('data-ds-dark-theme')
  const cell = 4
  const speed = state.dragging ? 2.8 : 1

  context.clearRect(0, 0, width, height)
  if (origin <= 0) return

  context.save()
  context.beginPath()
  context.rect(0, 0, origin, height)
  context.clip()

  for (let x = 0; x < origin; x += cell) {
    const delta = x + cell * 0.5 - origin
    const distance = Math.abs(delta)
    const phaseA = distance / 10 - time * 0.0074 * speed
    const phaseB = distance / 23 - time * 0.0041 * speed + 1.7
    const phaseC = distance / 40 - time * 0.0022 * speed + 3.4
    const sinA = Math.max(0, Math.sin(phaseA))
    const sinB = Math.max(0, Math.sin(phaseB))
    const sinC = Math.max(0, Math.sin(phaseC))
    const waveA = Math.pow(sinA, 2.6)
    const waveB = Math.pow(sinB, 3.2)
    const waveC = Math.pow(sinC, 4)
    const crest = Math.pow(sinA, 15) + Math.pow(sinB, 18) * 0.78
    const wave = Math.min(1, waveA * 0.76 + waveB * 0.58 + waveC * 0.32)
    const trail = 0.38 + 0.62 * Math.exp(-distance / Math.max(55, width * 0.72))
    const pillar = Math.pow(Math.max(0, Math.sin(x / 20 + time * 0.0016)), 3) * 0.27
    const columnEnergy = trail * (wave * 1.04 + pillar + crest * 0.32)

    if (columnEnergy > 0.012) {
      const nearness = Math.max(0, 1 - distance / Math.max(1, width * 0.78))
      const red = isDark
        ? Math.round(42 + 124 * nearness + 75 * wave)
        : Math.round(28 + 58 * nearness + 15 * wave)
      const green = isDark
        ? Math.round(56 + 58 * nearness + 44 * crest)
        : Math.round(88 + 72 * nearness + 30 * crest)
      const blue = isDark
        ? Math.round(175 + 72 * nearness + 8 * wave)
        : Math.round(182 + 62 * nearness)
      const alpha = isDark
        ? Math.min(0.88, columnEnergy * 0.72)
        : Math.min(0.62, columnEnergy * 0.54)
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`
      context.fillRect(x, 0, cell - 1, height)
    }

    for (let y = 0; y < height; y += cell) {
      const deltaY = y + cell * 0.5 - height * 0.5
      const radial = Math.hypot(delta / 38, deltaY / 11)
      const halo = Math.exp(-radial * 0.96) * 1.08
      const verticalShape = 0.58 + 0.42 * Math.cos((deltaY / height) * Math.PI)
      const grain = 0.72 + 0.28 * Math.sin(x * 0.73 + y * 1.31 + time * 0.006)
      const alpha = Math.min(0.96, (columnEnergy * 0.88 + halo + crest * 0.19) * verticalShape * grain)
      if (alpha < 0.035) continue

      const hot = Math.max(0, 1 - radial / 2.4)
      const red = isDark
        ? Math.round(54 + 148 * hot + 42 * wave + 35 * crest)
        : Math.round(25 + 72 * hot + 12 * wave)
      const green = isDark
        ? Math.round(68 + 78 * hot + 46 * crest)
        : Math.round(98 + 72 * hot + 24 * crest)
      const blue = isDark
        ? Math.round(186 + 64 * hot)
        : Math.round(194 + 56 * hot)
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${isDark ? alpha : alpha * 0.72})`
      context.fillRect(x, y, cell - 1, cell - 1)
    }
  }

  for (let i = 0; i < 14; i += 1) {
    const travel = (time * (state.dragging ? 0.16 : 0.065) * (0.78 + (i % 5) * 0.09) + i * 23) % Math.max(30, origin + 64)
    const particleX = origin - travel
    if (particleX < -24 || particleX > width + 16) continue
    const particleY = 3 + ((i * 13 + Math.sin(time * 0.003 + i) * 5) % Math.max(7, height - 6))
    const length = 4 + (i % 4) * 4 + (state.dragging ? 6 : 0)
    const alpha = 0.28 + (i % 5) * 0.1
    const streak = context.createLinearGradient(particleX, 0, particleX + length, 0)
    streak.addColorStop(0, isDark ? 'rgba(72,118,255,0)' : 'rgba(24,94,184,0)')
    streak.addColorStop(0.68, isDark ? `rgba(112,135,255,${alpha})` : `rgba(36,108,202,${alpha * 0.72})`)
    streak.addColorStop(1, isDark ? `rgba(236,222,255,${Math.min(1, alpha + 0.26)})` : `rgba(103,175,248,${Math.min(0.82, alpha + 0.18)})`)
    context.fillStyle = streak
    context.fillRect(particleX, particleY, length, i % 3 === 0 ? 2 : 1)
  }

  const glow = context.createRadialGradient(origin, height / 2, 0, origin, height / 2, 24)
  glow.addColorStop(0, isDark ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.86)')
  glow.addColorStop(0.14, isDark ? 'rgba(183,190,255,.54)' : 'rgba(162,210,255,.48)')
  glow.addColorStop(0.44, isDark ? 'rgba(103,74,255,.28)' : 'rgba(37,112,207,.22)')
  glow.addColorStop(1, isDark ? 'rgba(86,31,210,0)' : 'rgba(25,91,181,0)')
  context.fillStyle = glow
  context.fillRect(origin - 26, 0, 52, height)
  context.restore()
}

function EffortSlider({ directory, t }: { directory: ModelDirectory; t: ReasoningEffortTranslate }) {
  const directoryState = useSyncExternalStore(
    (notify) => directory.store.subscribe(notify),
    () => directory.store.getSnapshot(),
  )
  const levels = sliderLevels(directoryState)
  const [effort, setEffort] = useState(directoryState.current?.reasoningEffort ?? '')
  const [preview, setPreview] = useState(Math.max(0, effortIndex(levels, directoryState.current?.reasoningEffort)))
  const [committing, setCommitting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const chibiThumb = useSyncExternalStore(chibiThumbStore.subscribe, chibiThumbStore.getSnapshot)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const committedRef = useRef(directoryState.current?.reasoningEffort ?? '')
  const committingRef = useRef(false)
  const selectionAbortRef = useRef<AbortController | null>(null)
  const previewRef = useRef(preview)
  const draggingRef = useRef(false)
  const pointerActiveRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const gestureCatalogRef = useRef('')
  const catalogKey = JSON.stringify([
    directoryState.current?.provider,
    directoryState.current?.model,
    directoryState.current?.reasoningEffort,
    levels.map((level) => level.id),
  ])
  const globalPointerMoveRef = useRef<((event: PointerEvent) => void) | null>(null)
  const globalPointerEndRef = useRef<((event: PointerEvent) => void) | null>(null)
  const globalPointerCancelRef = useRef<((event: PointerEvent) => void) | null>(null)
  const radiationRef = useRef<RadiationState>({ progress: 0, dragging: false })
  const redrawRef = useRef<(() => void) | null>(null)
  const available = directoryState.current !== null && levels.length >= 2
  const busy = committing || directoryState.status === 'selecting' || directoryState.status === 'loading' || directoryState.pending !== null
  const error = localError ?? directoryState.error

  useEffect(() => {
    if (!available || committingRef.current || draggingRef.current) return
    const next = directoryState.current?.reasoningEffort ?? ''
    const index = Math.max(0, effortIndex(levels, next))
    committedRef.current = next
    previewRef.current = index
    setEffort(next)
    setPreview(index)
  }, [available, levels, directoryState, committing, dragging])

  useEffect(() => () => {
    selectionAbortRef.current?.abort()
    const input = inputRef.current
    const pointerId = activePointerIdRef.current
    if (input !== null && pointerId !== null && input.hasPointerCapture(pointerId)) {
      input.releasePointerCapture(pointerId)
    }
    pointerActiveRef.current = false
    activePointerIdRef.current = null
    draggingRef.current = false
  }, [directory, directoryState.current?.provider, directoryState.current?.model])

  useEffect(() => {
    directory.load().catch(() => undefined)
  }, [directory])

  useEffect(() => {
    previewRef.current = preview
    radiationRef.current.progress = effortIndex(levels, effort) >= 0 ? preview / (levels.length - 1) : 0
    redrawRef.current?.()
  }, [preview, levels, effort])

  useEffect(() => {
    radiationRef.current.dragging = dragging
    redrawRef.current?.()
  }, [dragging])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const context = canvas.getContext('2d')
    if (context === null) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 1
    let height = 1
    let frame = 0

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = (time = performance.now()) => {
      drawRadiation(context, width, height, time, radiationRef.current)
    }

    const loop = (time: number) => {
      draw(time)
      frame = window.requestAnimationFrame(loop)
    }

    const redraw = () => {
      if (reducedMotion.matches) draw()
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    const themeObserver = new MutationObserver(() => draw())
    resizeObserver.observe(canvas)
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
    redrawRef.current = redraw
    resize()
    draw()
    if (!reducedMotion.matches) frame = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      redrawRef.current = null
    }
  }, [])

  const rollback = useCallback(() => {
    const input = inputRef.current
    const pointerId = activePointerIdRef.current
    if (input !== null && pointerId !== null && input.hasPointerCapture(pointerId)) {
      input.releasePointerCapture(pointerId)
    }
    const previous = committedRef.current
    previewRef.current = Math.max(0, effortIndex(levels, previous))
    pointerActiveRef.current = false
    activePointerIdRef.current = null
    draggingRef.current = false
    setEffort(previous)
    setPreview(Math.max(0, effortIndex(levels, previous)))
    setDragging(false)
  }, [levels])

  const cancelChangedGesture = useCallback(() => {
    if (gestureCatalogRef.current === catalogKey) return false
    rollback()
    setLocalError(t('effort.catalogChanged'))
    return true
  }, [catalogKey, rollback, t])

  useEffect(() => {
    if (pointerActiveRef.current) cancelChangedGesture()
  }, [cancelChangedGesture])

  const commit = useCallback(async (raw: number) => {
    if (committingRef.current || busy || directoryState.current === null) return
    const index = clampIndex(raw, levels.length)
    const next = levels[index]?.id
    if (next === undefined) return
    const target = {
      provider: directoryState.current.provider,
      model: directoryState.current.model,
      reasoningEffort: next,
    }
    const operation = new AbortController()
    selectionAbortRef.current = operation
    committingRef.current = true
    setDragging(false)
    setCommitting(true)
    setLocalError(null)
    previewRef.current = index
    setPreview(index)
    setEffort(next)

    try {
      const confirmed = await selectEffort(directory, target, operation.signal, t)
      if (selectionAbortRef.current !== operation) return
      const confirmedIndex = effortIndex(sliderLevels(confirmed), next)
      committedRef.current = next
      previewRef.current = confirmedIndex
      setEffort(next)
      setPreview(confirmedIndex)
    } catch (cause) {
      if (!operation.signal.aborted) {
        setLocalError(cause instanceof Error ? cause.message : String(cause))
      }
    } finally {
      if (selectionAbortRef.current === operation) {
        selectionAbortRef.current = null
        committingRef.current = false
        // Synchronization below resumes with the current directory, including
        // after a failed selection or a route change during the round-trip.
        if (!operation.signal.aborted) setCommitting(false)
      }
    }
  }, [directory, directoryState.current, levels, busy, t])

  useEffect(() => {
    if (selectionAbortRef.current?.signal.aborted) {
      selectionAbortRef.current = null
      committingRef.current = false
      setCommitting(false)
    }
    setDragging(false)
    setLocalError(null)
  }, [directory, directoryState.current?.provider, directoryState.current?.model])

  const rawFromPointer = (input: HTMLInputElement, clientX: number) => {
    const bounds = input.getBoundingClientRect()
    if (bounds.width <= 0 || levels.length < 2) return previewRef.current
    return Math.max(
      0,
      Math.min(levels.length - 1, (clientX - bounds.left) / bounds.width * (levels.length - 1)),
    )
  }

  const showPointerPreview = (raw: number) => {
    previewRef.current = raw
    setPreview(raw)
    setEffort(levels[clampIndex(raw, levels.length)]?.id ?? '')
  }

  const beginDragging = (input: HTMLInputElement, pointerId: number, clientX: number) => {
    if (committingRef.current || busy) return
    gestureCatalogRef.current = catalogKey
    setLocalError(null)
    pointerActiveRef.current = true
    activePointerIdRef.current = pointerId
    draggingRef.current = true
    setDragging(true)
    showPointerPreview(rawFromPointer(input, clientX))
    try {
      if (!input.hasPointerCapture(pointerId)) input.setPointerCapture(pointerId)
    } catch {
      // The window-level pointer listeners below remain the reliable fallback.
    }
  }

  const moveDragging = (input: HTMLInputElement, pointerId: number, clientX: number) => {
    if (!pointerActiveRef.current || activePointerIdRef.current !== pointerId) return
    if (busy) { rollback(); return }
    if (cancelChangedGesture()) return
    showPointerPreview(rawFromPointer(input, clientX))
  }

  const stopDragging = (input: HTMLInputElement, pointerId?: number, clientX?: number) => {
    if (!pointerActiveRef.current) return
    if (pointerId !== undefined && activePointerIdRef.current !== pointerId) return
    if (busy) { rollback(); return }
    if (cancelChangedGesture()) return
    const raw = clientX === undefined ? previewRef.current : rawFromPointer(input, clientX)
    pointerActiveRef.current = false
    activePointerIdRef.current = null
    draggingRef.current = false
    if (pointerId !== undefined && input.hasPointerCapture(pointerId)) {
      input.releasePointerCapture(pointerId)
    }
    showPointerPreview(raw)
    void commit(raw)
  }

  globalPointerMoveRef.current = (event) => {
    const input = inputRef.current
    if (input !== null) moveDragging(input, event.pointerId, event.clientX)
  }
  globalPointerEndRef.current = (event) => {
    const input = inputRef.current
    if (input !== null) stopDragging(input, event.pointerId, event.clientX)
  }
  globalPointerCancelRef.current = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return
    rollback()
  }

  useEffect(() => {
    const move = (event: PointerEvent) => globalPointerMoveRef.current?.(event)
    const end = (event: PointerEvent) => globalPointerEndRef.current?.(event)
    const cancel = (event: PointerEvent) => globalPointerCancelRef.current?.(event)
    window.addEventListener('pointermove', move, true)
    window.addEventListener('pointerup', end, true)
    window.addEventListener('pointercancel', cancel, true)
    return () => {
      window.removeEventListener('pointermove', move, true)
      window.removeEventListener('pointerup', end, true)
      window.removeEventListener('pointercancel', cancel, true)
    }
  }, [])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (busy || committingRef.current) return
    const current = clampIndex(Number(event.currentTarget.value), levels.length)
    let target: number | undefined
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown') {
      target = Math.max(0, current - 1)
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') {
      target = Math.min(levels.length - 1, current + 1)
    } else if (event.key === 'Home') {
      target = 0
    } else if (event.key === 'End') {
      target = levels.length - 1
    }
    if (target === undefined) return
    event.preventDefault()
    void commit(target)
  }

  if (!available) return null

  const count = levels.length
  const selectedIndex = effortIndex(levels, effort)
  const effortName = levels[selectedIndex]?.name ?? (effort || t('model.defaultEffort'))
  const savedEffort = directoryState.current?.reasoningEffort
  const notice = !dragging && !committing && effortIndex(levels, savedEffort) < 0
    ? savedEffort === undefined ? t('effort.unset') : t('effort.unsupported', { effort: savedEffort })
    : null
  const isTop = selectedIndex === count - 1
  const progress = selectedIndex >= 0 ? preview / (count - 1) * 100 : 0
  const style = { '--re-progress': `${progress}%` } as CSSProperties
  const title = error === null
    ? t('effort.title', { effort: effortName })
    : t('effort.failed', { error })

  return (
    <>
      {notice === null ? null : <div className="re-model-status" role="status">{notice}</div>}
      <div
        className={`re-effort${chibiThumb ? ' is-chibi' : ''}${dragging ? ' is-dragging' : ''}${busy ? ' is-busy' : ''}${error === null ? '' : ' is-error'}`}
        title={title}
      >
        <div
          className="re-effort-slider"
          data-top={isTop ? 'true' : undefined}
          style={style}
        >
          <div className="re-effort-track" aria-hidden="true" />
          <div className="re-effort-fx" aria-hidden="true" hidden={selectedIndex < 0}>
            <canvas ref={canvasRef} className="re-effort-canvas" />
            <span className="re-effort-flare" />
          </div>
          <input
            ref={inputRef}
            className="re-effort-input"
            type="range"
            min="0"
            max={count - 1}
            step="0.01"
            value={preview}
            disabled={busy}
            aria-label={t('effort.label')}
            aria-valuetext={effortName}
            onChange={(event) => {
              if (pointerActiveRef.current || committingRef.current || busy) return
              const raw = Number(event.currentTarget.value)
              showPointerPreview(raw)
              void commit(raw)
            }}
            onPointerDown={(event) => {
              event.preventDefault()
              event.currentTarget.focus()
              beginDragging(event.currentTarget, event.pointerId, event.clientX)
            }}
            onPointerMove={(event) => moveDragging(event.currentTarget, event.pointerId, event.clientX)}
            onPointerUp={(event) => stopDragging(event.currentTarget, event.pointerId, event.clientX)}
            onPointerCancel={(event) => {
              if (!pointerActiveRef.current || activePointerIdRef.current !== event.pointerId) return
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
              rollback()
            }}
            onBlur={(event) => {
              stopDragging(event.currentTarget)
            }}
            onKeyDown={onKeyDown}
          />
          {selectedIndex < 0 ? null : <span className="re-effort-knob" aria-hidden="true" />}
        </div>
        {error === null ? null : <span className="re-effort-sr" role="status">{error}</span>}
      </div>
    </>
  )
}

function AdvancedModelSelect({
  locked,
  available,
  controller,
  directory,
  load,
  select,
  adapt,
  agentTutorial,
  t,
}: ModelSeatProps) {
  const state = useSyncExternalStore(
    (notify) => directory.subscribe(notify),
    () => directory.getSnapshot(),
  )
  const [open, setOpen] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)
  const [guidanceResult, setGuidanceResult] = useState<AdaptGuidance | null>(null)
  const [guidanceBusy, setGuidanceBusy] = useState(false)
  const [guidanceFailed, setGuidanceFailed] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [agentCopied, setAgentCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!open || rootRef.current === null || menuRef.current === null) return
    return positionModelMenu(rootRef.current, menuRef.current)
  }, [open])
  const choice = currentModel(state)
  const levels = sliderLevels(state)
  const savedEffort = state.current?.reasoningEffort
  const effortName = savedEffort === undefined
    ? t('model.defaultEffort')
    : choice?.reasoning?.efforts.find((level) => level.id === savedEffort)?.name ?? savedEffort
  const modelLabel = choice?.name ?? state.current?.model ?? t('model.select')
  const busy = state.status === 'loading' || state.status === 'selecting' || state.pending !== null
  const provider = state.current?.provider
  const modelId = state.current?.model
  // Hide a previous model's result during the render before the effect clears it.
  const guidance = guidanceResult?.provider === provider && guidanceResult?.model === modelId
    ? guidanceResult
    : null
  const localizedNote = guidance === null ? '' : guidanceNote(guidance, t)
  const localizedWarning = guidance === null ? null : guidanceWarning(guidance, t)
  const localizedSnippet = guidance === null ? '' : guidanceSnippet(guidance, t)

  useEffect(() => {
    if (!available) return
    load()
  }, [available, load])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setModelsOpen(false)
      }
    }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [open])

  useEffect(() => {
    // A brief belongs to the model it describes; never let a stale one be copied.
    setGuidanceResult(null)
    setCopied(false)
    setAgentCopied(false)
    setPanelOpen(false)
    if (provider === undefined || modelId === undefined) {
      setGuidanceBusy(false)
      setGuidanceFailed(false)
      return
    }
    // Without a channel the diagnosis cannot run at all; saying so beats
    // rendering nothing, which reads as "this model needs no guidance".
    if (adapt === null) {
      setGuidanceBusy(false)
      setGuidanceFailed(true)
      return
    }
    let cancelled = false
    setGuidanceBusy(true)
    setGuidanceFailed(false)
    adapt.diagnose(provider, modelId).then((result) => {
      if (cancelled) return
      setGuidanceResult(result)
      setGuidanceFailed(result === null)
      setGuidanceBusy(false)
      if (result === null || !result.needsGuide) setPanelOpen(false)
    }, () => {
      if (cancelled) return
      setGuidanceResult(null)
      setGuidanceFailed(true)
      setGuidanceBusy(false)
    })
    return () => {
      cancelled = true
    }
  }, [adapt, provider, modelId])

  if (!available) return null

  const close = (restoreFocus = false) => {
    setOpen(false)
    setModelsOpen(false)
    if (restoreFocus) queueMicrotask(() => triggerRef.current?.focus())
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    if (modelsOpen) setModelsOpen(false)
    else close(true)
  }

  const chooseModel = async (provider: string, model: string, defaultEffort?: string) => {
    const live = directory.getSnapshot()
    if (live.status === 'loading' || live.status === 'selecting' || live.pending !== null) return
    if (live.current?.provider === provider && live.current.model === model) {
      setModelsOpen(false)
      return
    }
    const accepted = await select({
      provider,
      model,
      ...(defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort }),
    })
    if (accepted) setModelsOpen(false)
  }

  return (
    <div ref={rootRef} className="re-model-root" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className="re-model-trigger"
        aria-label={t('model.aria', { model: modelLabel, effort: effortName })}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`${modelLabel} · ${effortName}`}
        disabled={locked}
        onClick={() => {
          if (open) close()
          else {
            setOpen(true)
            setModelsOpen(false)
            load()
          }
        }}
      >
        <span className="re-model-name">{modelLabel}</span>
        <span className="re-model-effort">{effortName}</span>
        <span className="re-model-chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div ref={menuRef} className="re-model-menu" role="menu" aria-label={t('model.menuAria')} aria-busy={busy}>
          {modelsOpen ? (
            <div className="re-model-pane">
              <button type="button" className="re-model-back" onClick={() => setModelsOpen(false)}>
                <span aria-hidden="true">‹</span>
                <span>{t('model.select')}</span>
              </button>
              {state.status === 'loading' && state.groups.length === 0 ? (
                <div className="re-model-status">{t('model.loading')}</div>
              ) : null}
              {state.groups.map((group) => (
                <section key={group.id}>
                  <div className="re-model-group-title">{group.name}</div>
                  {group.models.map((model) => {
                    const selected = state.current?.provider === group.id && state.current.model === model.id
                    return (
                      <button
                        key={model.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        className="re-model-option"
                        disabled={busy}
                        onClick={() => void chooseModel(group.id, model.id, model.reasoning?.defaultEffort)}
                      >
                        <span className="re-model-option-copy">
                          <span className="re-model-option-name">{model.name}</span>
                          {model.description === undefined ? null : (
                            <span className="re-model-option-desc">{model.description}</span>
                          )}
                        </span>
                        <span className="re-model-check" aria-hidden="true">{selected ? '✓' : ''}</span>
                      </button>
                    )
                  })}
                </section>
              ))}
              {state.status === 'ready' && state.groups.every((group) => group.models.length === 0) ? (
                <div className="re-model-status">{t('model.none')}</div>
              ) : null}
              {state.error === null ? null : <div className="re-model-error">{state.error}</div>}
            </div>
          ) : (
            <>
              <div className="re-advanced">
                {levels.length >= 2 ? (
                  <EffortSlider directory={controller} t={t} />
                ) : (
                  <div className="re-model-status">{t('effort.unavailable')}</div>
                )}
              </div>
              {guidance !== null && guidance.needsGuide ? (
                <div className="re-adapt">
                  <div className="re-adapt-copy">
                    <div className="re-adapt-title">
                      {guidance.reason === 'missing' ? t('effort.unavailable') : t('guidance.mismatch')}
                    </div>
                    <div className="re-adapt-desc">
                      {guidance.matched
                        ? t('guidance.matched', {
                            expected: levelsText(guidance.expected, t),
                            current: levelsText(guidance.current, t),
                            note: localizedNote,
                          })
                        : t('guidance.unmatched', {
                            current: levelsText(guidance.current, t),
                            note: localizedNote,
                          })}
                    </div>
                  </div>
                  {panelOpen ? (
                    <div className="re-adapt-panel">
                      <div className="re-adapt-scroll">
                        {guidance.matched ? (
                          <div className="re-adapt-panel-line">
                            <span className="re-adapt-arrow">{levelsText(guidance.current, t)}</span>
                            <span aria-hidden="true">→</span>
                            <span className="re-adapt-arrow">{levelsText(guidance.expected, t)}</span>
                          </div>
                        ) : null}
                        <div className="re-adapt-howto">{t('guidance.howto')}</div>
                        <div className="re-adapt-switch-intro">{t('guidance.switch.intro')}</div>
                        <ul className="re-adapt-switches">
                          <li>{t('guidance.switch.thinkingFormat')}</li>
                          <li>{t('guidance.switch.reasoningEffort')}</li>
                          <li>{t('guidance.switch.developerRole')}</li>
                          <li>{t('guidance.switch.replay')}</li>
                        </ul>
                        {localizedWarning === null ? null : (
                          <div className="re-adapt-warning">{localizedWarning}</div>
                        )}
                        <div className="re-adapt-label">{t('guidance.paste')}</div>
                        <pre className="re-adapt-yaml">{localizedSnippet}</pre>
                        <div className="re-adapt-steps">
                          <span>
                            {t('guidance.step1.open')}<code>{configDocumentName(guidance.settingsPath)}</code>
                            {guidance.settingsPath === null ? '' : t('guidance.step1.path', { path: guidance.settingsPath })}
                            {t('guidance.step1.find')}<code>{guidance.entryPath}</code>
                            {t('guidance.step1.list')}<code>{guidance.entryLine}</code>{t('guidance.step1.end')}
                          </span>
                          {guidance.mode === 'replace' ? (
                            <span>
                              {t('guidance.step2.replacePrefix')}<code>{guidance.entryLine}</code>
                              {t('guidance.step2.replaceSuffix')}
                            </span>
                          ) : (
                            <span>
                              {t('guidance.step2.insertPrefix')}<code>id</code>
                              {t('guidance.step2.insertSuffix')}
                            </span>
                          )}
                          <span>{t('guidance.step3')}</span>
                        </div>
                      </div>
                      <div className="re-adapt-actions">
                        <button
                          type="button"
                          className="re-adapt-apply"
                          disabled={busy || guidanceBusy}
                          onClick={() => {
                            void copyText(localizedSnippet).then((ok) => setCopied(ok))
                          }}
                        >
                          {copied ? t('guidance.copied') : t('guidance.copy')}
                        </button>
                        <button
                          type="button"
                          className="re-adapt-agent"
                          disabled={busy || guidanceBusy}
                          onClick={() => {
                            void copyText(agentBrief(guidance, agentTutorial(), t))
                              .then((ok) => setAgentCopied(ok))
                          }}
                        >
                          {agentCopied ? t('guidance.copied') : t('agent.copy')}
                        </button>
                        <button type="button" className="re-adapt-cancel" onClick={() => setPanelOpen(false)}>
                          {t('guidance.collapse')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="re-adapt-open-row">
                      <button type="button" className="re-adapt-open" onClick={() => { setCopied(false); setPanelOpen(true) }}>
                        {guidanceBusy ? t('guidance.checking') : t('guidance.open')}
                      </button>
                      <button
                        type="button"
                        className="re-adapt-agent"
                        disabled={busy || guidanceBusy}
                        onClick={() => {
                          void copyText(agentBrief(guidance, agentTutorial(), t))
                            .then((ok) => setAgentCopied(ok))
                        }}
                      >
                        {agentCopied ? t('guidance.copied') : t('agent.copy')}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
              {guidance !== null && guidance.userDeclared && !guidance.needsGuide ? (
                <div className="re-adapt">
                  <div className="re-adapt-desc">{t('agent.customize')}</div>
                  <div className="re-adapt-open-row">
                    <button
                      type="button"
                      className="re-adapt-agent"
                      disabled={busy || guidanceBusy}
                      onClick={() => {
                        void copyText(agentBrief(guidance, agentTutorial(), t))
                          .then((ok) => setAgentCopied(ok))
                      }}
                    >
                      {agentCopied ? t('guidance.copied') : t('agent.copy')}
                    </button>
                  </div>
                </div>
              ) : null}
              {guidanceFailed ? <div className="re-model-status" role="status">{t('guidance.unavailable')}</div> : null}
              <div className="re-menu-separator" />
              <button
                type="button"
                role="menuitem"
                className="re-model-row"
                disabled={busy}
                onClick={() => setModelsOpen(true)}
              >
                <span className="re-model-row-name">{modelLabel}</span>
                <span className="re-model-row-effort">{effortName}</span>
                <span className="re-row-chevron" aria-hidden="true">›</span>
              </button>
              {state.error === null ? null : <div className="re-model-error">{state.error}</div>}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function ReasoningEffortSetting({ t }: PropsLocale<typeof NS>) {
  const enabled = useSyncExternalStore(enabledStore.subscribe, enabledStore.getSnapshot)

  return (
    <div className="re-setting-row">
      <div className="re-setting-copy">
        <div className="re-setting-title">{t('settings.effort.title')}</div>
        <div className="re-setting-description">{t('settings.effort.description')}</div>
      </div>
      <div className="re-setting-control">
        <span className="re-setting-state">{enabled ? t('settings.enabled') : t('settings.disabled')}</span>
        <button
          type="button"
          role="switch"
          aria-label={t('settings.effort.aria')}
          aria-checked={enabled}
          className={`re-setting-switch${enabled ? ' is-on' : ''}`}
          onClick={() => enabledStore.set(!enabled)}
        >
          <span className="re-setting-switch-knob" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function ChibiThumbSetting({ t }: PropsLocale<typeof NS>) {
  const sliderEnabled = useSyncExternalStore(enabledStore.subscribe, enabledStore.getSnapshot)
  const enabled = useSyncExternalStore(chibiThumbStore.subscribe, chibiThumbStore.getSnapshot)

  return (
    <div className="re-setting-row">
      <div className="re-setting-copy">
        <div className="re-setting-title">{t('settings.chibi.title')}</div>
        <div className="re-setting-description">{t('settings.chibi.description')}</div>
      </div>
      <div className="re-setting-control">
        <span className="re-setting-state">{enabled ? t('settings.enabled') : t('settings.disabled')}</span>
        <button
          type="button"
          role="switch"
          aria-label={t('settings.chibi.aria')}
          aria-checked={enabled}
          disabled={!sliderEnabled}
          className={`re-setting-switch${enabled ? ' is-on' : ''}`}
          onClick={() => chibiThumbStore.set(!enabled)}
        >
          <span className="re-setting-switch-knob" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function apply(ctx: ClientContext) {
  const modelDirectories = ctx.get('modelDirectories') as ModelDirectoryResolver | undefined
  if (modelDirectories === undefined) return

  const connection = ctx.get('connection') as { rpc?: HostRpc } | undefined
  const adapt = makeAdaptationService(connection?.rpc)
  const locale = ctx.get('locale') as LocaleRuntimeLike | undefined

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'reasoning-effort: dictionaries')

  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-reasoning-effort'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, 'reasoning-effort: styles')

  ctx.effect(() => {
    const syncStorage = (event: StorageEvent) => {
      if (event.key === ENABLED_STORAGE_KEY) {
        enabledStore.set(event.newValue !== 'false', false)
      } else if (event.key === CHIBI_THUMB_STORAGE_KEY) {
        chibiThumbStore.set(event.newValue === 'true', false)
      }
    }
    window.addEventListener('storage', syncStorage)
    return () => window.removeEventListener('storage', syncStorage)
  }, 'reasoning-effort: preference sync')

  ctx.slots.inject(SETTINGS_SLOT, () =>
    ctx.slots.register(
      { name: SETTINGS_SLOT, id: 'reasoning-effort-enabled', order: 15, locale: NS },
      ReasoningEffortSetting,
    ),
  )

  ctx.slots.inject(SETTINGS_SLOT, () =>
    ctx.slots.register(
      { name: SETTINGS_SLOT, id: 'reasoning-effort-chibi-thumb', order: 16, locale: NS },
      ChibiThumbSetting,
    ),
  )

  ctx.slots.inject(SLOT, () => {
    let disposeModelSeat: (() => void) | undefined
    const syncModelSeat = () => {
      if (!enabledStore.getSnapshot()) {
        disposeModelSeat?.()
        disposeModelSeat = undefined
        return
      }
      if (disposeModelSeat !== undefined) return
      disposeModelSeat = ctx.slots.register(
        {
          name: SLOT,
          priority: -100,
          locale: NS,
          inject: (sessionId: string) => {
            const controller = modelDirectories.directoryFor(sessionId as SessionId)
            return {
              available: true,
              controller,
              directory: controller.store,
              load: () => controller.load().then(() => undefined, () => undefined),
              select: (selection: ModelSelection) => controller.select(selection).then((result) => result.ok, () => false),
              adapt,
              // Read at copy time: a language switch must change the next copy,
              // not require the seat to remount.
              agentTutorial: () => (locale?.getLocale().active === 'zh' ? agentTutorialZh : agentTutorialEn),
            }
          },
        },
        AdvancedModelSelect,
      )
    }

    const unsubscribe = enabledStore.subscribe(syncModelSeat)
    syncModelSeat()
    return () => {
      unsubscribe()
      disposeModelSeat?.()
    }
  })
}
