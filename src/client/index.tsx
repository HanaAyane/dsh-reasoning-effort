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
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ModelSelection, SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type {
  ModelDirectory,
  ModelDirectoryResolver,
  ModelDirectoryState,
} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { CSS } from './styles.js'

/** One selectable effort exactly as the owning adapter advertised it. */
interface EffortLevel {
  readonly id: string
  readonly name: string
}

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
  readonly note: string | null
  readonly warning: string | null
  readonly snippet: string
  readonly entryLine: string
  readonly entryPath: string
  readonly settingsPath: string | null
}

/** The client-facing guidance service (Client→Host over the Connection RPC). */
interface AdaptationService {
  diagnose(provider: string, model: string): Promise<AdaptGuidance | null>
}

const LEVEL_NAMES: Record<string, string> = {
  off: '关闭',
  minimal: '极低',
  low: '低',
  medium: '中',
  high: '高',
  xhigh: '极高',
  max: '最大',
}

function levelName(level: string): string {
  return LEVEL_NAMES[level] ?? level
}

function levelsText(levels: readonly string[]): string {
  return levels.length === 0 ? '无档位' : levels.map((level) => levelName(level)).join(' / ')
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

interface ModelSeatProps {
  readonly locked: boolean
  readonly available: boolean
  readonly controller: ModelDirectory
  readonly directory: SnapshotStore<ModelDirectoryState>
  readonly load: () => void
  readonly select: (selection: ModelSelection) => Promise<boolean>
  readonly adapt: AdaptationService | null
}

const SLOT = 'conversation.input.model'
const SETTINGS_SLOT = 'settings.general.item'
const ENABLED_STORAGE_KEY = 'dsh-reasoning-effort.enabled'
const LEGACY_ENABLED_STORAGE_KEY = '@dsh-external/dsh-reasoning-effort.enabled'
const CHIBI_THUMB_STORAGE_KEY = 'dsh-reasoning-effort.chibi-thumb'
export const inject = ['slots', 'modelDirectories', 'connection']

export type ModelThemeKind = 'deepseek' | 'openai' | 'claude' | 'gemini' | 'kimi' | 'glm' | 'qwen' | 'minimax'

/** Detect model theme: 'claude' for Claude/Anthropic, 'openai' for OpenAI/GPT/Codex, 'gemini' for Google/Gemini, 'kimi' for Moonshot/Kimi, 'glm' for Zhipu GLM/ZCode, 'qwen' for Alibaba Qwen/Tongyi, 'minimax' for MiniMax/Hailuo, 'deepseek' for others. */
export function detectModelTheme(
  provider?: string | null,
  modelId?: string | null,
  modelName?: string | null,
): ModelThemeKind {
  const p = (provider ?? '').toLowerCase()
  const m = `${modelId ?? ''} ${modelName ?? ''}`.toLowerCase()

  // 1. Check Model ID & Model Name first (aggregators / multi-model providers like Vertex/Bedrock/Antigravity/OpenRouter host models from various brands)
  if (
    m.includes('claude') ||
    m.includes('anthropic') ||
    m.includes('opus') ||
    m.includes('sonnet') ||
    m.includes('haiku')
  ) {
    return 'claude'
  }

  if (
    m.includes('gemini') ||
    m.includes('gemma') ||
    m.includes('google')
  ) {
    return 'gemini'
  }

  if (
    m.includes('kimi') ||
    m.includes('moonshot') ||
    m.includes('kimi-k1') ||
    m.includes('kimi-chat')
  ) {
    return 'kimi'
  }

  if (
    m.includes('glm') ||
    m.includes('zcode') ||
    m.includes('zhipu') ||
    m.includes('chatglm') ||
    m.includes('codegeex') ||
    m.includes('cogview')
  ) {
    return 'glm'
  }

  if (
    m.includes('qwen') ||
    m.includes('qwq') ||
    m.includes('tongyi') ||
    m.includes('aliyun') ||
    m.includes('alibaba')
  ) {
    return 'qwen'
  }

  if (
    m.includes('minimax') ||
    m.includes('abab') ||
    m.includes('hailuo') ||
    m.includes('mini-max')
  ) {
    return 'minimax'
  }

  if (
    m.includes('gpt') ||
    m.includes('chatgpt') ||
    m.includes('openai') ||
    m.includes('codex') ||
    m.includes('davinci') ||
    /(?:^|[\b\s/_.-])o[1-9](?:[\b\s/_.-]|$)/.test(m)
  ) {
    return 'openai'
  }

  if (
    m.includes('deepseek') ||
    m.includes('deep-seek') ||
    /(?:^|[\b\s/_.-])r1(?:[\b\s/_.-]|$)/.test(m) ||
    /(?:^|[\b\s/_.-])v3(?:[\b\s/_.-]|$)/.test(m)
  ) {
    return 'deepseek'
  }

  // 2. Fall back to Provider if model identifier is generic / ambiguous
  if (p.includes('claude') || p.includes('anthropic')) {
    return 'claude'
  }

  if (p.includes('gemini') || p.includes('google')) {
    return 'gemini'
  }

  if (p.includes('kimi') || p.includes('moonshot')) {
    return 'kimi'
  }

  if (p.includes('zhipu') || p.includes('bigmodel') || p.includes('zcode') || p.includes('glm')) {
    return 'glm'
  }

  if (p.includes('qwen') || p.includes('aliyun') || p.includes('alibaba') || p.includes('tongyi') || p.includes('dashscope') || p.includes('bailian')) {
    return 'qwen'
  }

  if (p.includes('minimax') || p.includes('hailuo')) {
    return 'minimax'
  }

  if (p.includes('openai') || p.includes('chatgpt') || p.includes('codex')) {
    return 'openai'
  }

  if (p.includes('deepseek') || p.includes('deep-seek')) {
    return 'deepseek'
  }

  return 'deepseek'
}

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

function currentModel(state: ModelDirectoryState) {
  if (state.current === null) return undefined
  const group = state.groups.find((candidate) => candidate.id === state.current?.provider)
  return group?.models.find((candidate) => candidate.id === state.current?.model)
}

/**
 * Effort levels the current model advertises, in adapter order. A model needs
 * at least two before a slider says anything a plain label would not, so
 * fewer-than-two collapses to none.
 */
function sliderLevels(state: ModelDirectoryState): readonly EffortLevel[] {
  const efforts = currentModel(state)?.reasoning?.efforts
  return efforts !== undefined && efforts.length >= 2 ? efforts : []
}

function effortIndex(levels: readonly EffortLevel[], id: string | undefined): number {
  return levels.findIndex((level) => level.id === id)
}

function clampIndex(value: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(value)))
}

/**
 * Level index the slider should rest at: the session's current effort when the
 * model still offers it, else the adapter default, else the middle level.
 */
function effectiveEffortIndex(levels: readonly EffortLevel[], state: ModelDirectoryState): number {
  const reasoning = currentModel(state)?.reasoning
  const current = effortIndex(levels, state.current?.reasoningEffort)
  if (current >= 0) return current
  const fallback = effortIndex(levels, reasoning?.defaultEffort)
  if (fallback >= 0) return fallback
  return Math.floor((levels.length - 1) / 2)
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
  theme: ModelThemeKind = 'deepseek',
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
      let red: number
      let green: number
      let blue: number
      if (theme === 'gemini') {
        // Multi-color Google Gemini Spectrum: Amber -> Emerald -> Blue -> Violet/Indigo -> Coral Pink
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.25) {
          // Amber to Green
          const t = posRatio / 0.25
          red = isDark ? Math.round(210 * (1 - t) + 15 * t + 30 * wave) : Math.round(230 * (1 - t) + 20 * t + 20 * wave)
          green = isDark ? Math.round(140 * (1 - t) + 180 * t + 40 * crest) : Math.round(160 * (1 - t) + 190 * t + 30 * crest)
          blue = isDark ? Math.round(15 * (1 - t) + 100 * t) : Math.round(20 * (1 - t) + 110 * t)
        } else if (posRatio < 0.55) {
          // Green to Blue
          const t = (posRatio - 0.25) / 0.3
          red = isDark ? Math.round(15 * (1 - t) + 50 * t + 35 * wave) : Math.round(20 * (1 - t) + 60 * t + 20 * wave)
          green = isDark ? Math.round(180 * (1 - t) + 120 * t + 35 * crest) : Math.round(190 * (1 - t) + 135 * t + 25 * crest)
          blue = isDark ? Math.round(100 * (1 - t) + 245 * t) : Math.round(110 * (1 - t) + 250 * t)
        } else if (posRatio < 0.82) {
          // Blue to Royal Violet
          const t = (posRatio - 0.55) / 0.27
          red = isDark ? Math.round(50 * (1 - t) + 140 * t + 45 * wave) : Math.round(60 * (1 - t) + 145 * t + 20 * wave)
          green = isDark ? Math.round(120 * (1 - t) + 45 * t + 25 * crest) : Math.round(135 * (1 - t) + 65 * t + 20 * crest)
          blue = isDark ? Math.round(245 * (1 - t) + 235 * t) : Math.round(250 * (1 - t) + 240 * t)
        } else {
          // Violet to Coral Pink
          const t = (posRatio - 0.82) / 0.18
          red = isDark ? Math.round(140 * (1 - t) + 235 * t + 20 * wave) : Math.round(145 * (1 - t) + 240 * t + 15 * wave)
          green = isDark ? Math.round(45 * (1 - t) + 55 * t + 20 * crest) : Math.round(65 * (1 - t) + 70 * t + 15 * crest)
          blue = isDark ? Math.round(235 * (1 - t) + 110 * t) : Math.round(240 * (1 - t) + 125 * t)
        }
      } else if (theme === 'claude') {
        red = isDark
          ? Math.round(180 + 70 * nearness + 35 * wave)
          : Math.round(195 + 55 * nearness + 15 * wave)
        green = isDark
          ? Math.round(55 + 95 * nearness + 45 * wave)
          : Math.round(90 + 75 * nearness + 20 * wave)
        blue = isDark
          ? Math.round(15 + 35 * nearness + 10 * wave)
          : Math.round(25 + 40 * nearness)
      } else if (theme === 'kimi') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.75) {
          const t = posRatio / 0.75
          red = isDark ? Math.round(25 * (1 - t) + 85 * t + 35 * wave) : Math.round(20 * (1 - t) + 75 * t + 20 * wave)
          green = isDark ? Math.round(35 * (1 - t) + 115 * t + 35 * wave) : Math.round(30 * (1 - t) + 105 * t + 20 * wave)
          blue = isDark ? Math.round(90 * (1 - t) + 235 * t + 15 * wave) : Math.round(85 * (1 - t) + 225 * t + 10 * wave)
        } else {
          const t = (posRatio - 0.75) / 0.25
          red = isDark ? Math.round(85 * (1 - t) + 250 * t + 40 * crest) : Math.round(75 * (1 - t) + 245 * t + 30 * crest)
          green = isDark ? Math.round(115 * (1 - t) + 215 * t + 30 * crest) : Math.round(105 * (1 - t) + 205 * t + 25 * crest)
          blue = isDark ? Math.round(235 * (1 - t) + 110 * t) : Math.round(225 * (1 - t) + 100 * t)
        }
      } else if (theme === 'glm') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.7) {
          const t = posRatio / 0.7
          red = isDark ? Math.round(15 * (1 - t) + 35 * t + 20 * wave) : Math.round(10 * (1 - t) + 30 * t + 15 * wave)
          green = isDark ? Math.round(30 * (1 - t) + 95 * t + 35 * wave) : Math.round(25 * (1 - t) + 85 * t + 20 * wave)
          blue = isDark ? Math.round(60 * (1 - t) + 185 * t + 25 * wave) : Math.round(50 * (1 - t) + 175 * t + 15 * wave)
        } else {
          const t = (posRatio - 0.7) / 0.3
          red = isDark ? Math.round(35 * (1 - t) + 56 * t + 35 * wave) : Math.round(30 * (1 - t) + 50 * t + 20 * wave)
          green = isDark ? Math.round(95 * (1 - t) + 189 * t + 40 * crest) : Math.round(85 * (1 - t) + 175 * t + 30 * crest)
          blue = isDark ? Math.round(185 * (1 - t) + 248 * t + 10 * wave) : Math.round(175 * (1 - t) + 240 * t)
        }
      } else if (theme === 'qwen') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.75) {
          const t = posRatio / 0.75
          red = isDark ? Math.round(20 * (1 - t) + 80 * t + 25 * wave) : Math.round(15 * (1 - t) + 65 * t + 15 * wave)
          green = isDark ? Math.round(40 * (1 - t) + 145 * t + 35 * wave) : Math.round(35 * (1 - t) + 130 * t + 20 * wave)
          blue = isDark ? Math.round(110 * (1 - t) + 248 * t + 15 * wave) : Math.round(100 * (1 - t) + 240 * t + 10 * wave)
        } else {
          const t = (posRatio - 0.75) / 0.25
          red = isDark ? Math.round(80 * (1 - t) + 251 * t + 35 * crest) : Math.round(65 * (1 - t) + 246 * t + 25 * crest)
          green = isDark ? Math.round(145 * (1 - t) + 191 * t + 30 * crest) : Math.round(130 * (1 - t) + 200 * t + 25 * crest)
          blue = isDark ? Math.round(248 * (1 - t) + 36 * t) : Math.round(240 * (1 - t) + 69 * t)
        }
      } else if (theme === 'minimax') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.65) {
          const t = posRatio / 0.65
          red = isDark ? Math.round(110 * (1 - t) + 240 * t + 25 * wave) : Math.round(130 * (1 - t) + 245 * t + 15 * wave)
          green = isDark ? Math.round(30 * (1 - t) + 75 * t + 25 * wave) : Math.round(40 * (1 - t) + 85 * t + 15 * wave)
          blue = isDark ? Math.round(25 * (1 - t) + 60 * t + 10 * wave) : Math.round(35 * (1 - t) + 65 * t + 10 * wave)
        } else {
          const t = (posRatio - 0.65) / 0.35
          red = 255
          green = isDark ? Math.round(75 * (1 - t) + 130 * t + 35 * crest) : Math.round(85 * (1 - t) + 140 * t + 25 * crest)
          blue = isDark ? Math.round(60 * (1 - t) + 90 * t + 15 * crest) : Math.round(65 * (1 - t) + 95 * t + 10 * crest)
        }
      } else if (theme === 'openai') {
        red = isDark
          ? Math.round(95 + 120 * nearness + 65 * wave)
          : Math.round(110 + 60 * nearness + 20 * wave)
        green = isDark
          ? Math.round(28 + 42 * nearness + 28 * crest)
          : Math.round(55 + 50 * nearness + 25 * crest)
        blue = isDark
          ? Math.round(195 + 58 * nearness + 10 * wave)
          : Math.round(215 + 40 * nearness)
      } else {
        red = isDark
          ? Math.round(42 + 124 * nearness + 75 * wave)
          : Math.round(28 + 58 * nearness + 15 * wave)
        green = isDark
          ? Math.round(56 + 58 * nearness + 44 * crest)
          : Math.round(88 + 72 * nearness + 30 * crest)
        blue = isDark
          ? Math.round(175 + 72 * nearness + 8 * wave)
          : Math.round(182 + 62 * nearness)
      }
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
      let red: number
      let green: number
      let blue: number
      if (theme === 'gemini') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.5) {
          red = isDark ? Math.round(80 + 110 * hot + 40 * wave) : Math.round(90 + 70 * hot + 20 * wave)
          green = isDark ? Math.round(120 + 70 * hot + 30 * crest) : Math.round(140 + 60 * hot + 20 * crest)
          blue = isDark ? Math.round(160 + 80 * hot) : Math.round(175 + 70 * hot)
        } else {
          red = isDark ? Math.round(140 + 105 * hot + 30 * wave) : Math.round(150 + 65 * hot + 15 * wave)
          green = isDark ? Math.round(50 + 60 * hot + 25 * crest) : Math.round(75 + 50 * hot + 20 * crest)
          blue = isDark ? Math.round(210 + 40 * hot) : Math.round(220 + 30 * hot)
        }
      } else if (theme === 'claude') {
        red = isDark
          ? Math.round(200 + 55 * hot + 25 * wave + 25 * crest)
          : Math.round(210 + 45 * hot + 15 * wave)
        green = isDark
          ? Math.round(75 + 115 * hot + 35 * crest)
          : Math.round(105 + 85 * hot + 25 * crest)
        blue = isDark
          ? Math.round(20 + 40 * hot)
          : Math.round(30 + 35 * hot)
      } else if (theme === 'kimi') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.65) {
          red = isDark ? Math.round(40 + 80 * hot + 25 * wave) : Math.round(35 + 65 * hot + 15 * wave)
          green = isDark ? Math.round(60 + 95 * hot + 30 * crest) : Math.round(65 + 85 * hot + 20 * crest)
          blue = isDark ? Math.round(175 + 75 * hot) : Math.round(185 + 65 * hot)
        } else {
          red = isDark ? Math.round(120 + 130 * hot + 35 * wave) : Math.round(110 + 125 * hot + 20 * wave)
          green = isDark ? Math.round(110 + 115 * hot + 35 * crest) : Math.round(120 + 95 * hot + 20 * crest)
          blue = isDark ? Math.round(160 + 50 * hot) : Math.round(170 + 40 * hot)
        }
      } else if (theme === 'glm') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.65) {
          red = isDark ? Math.round(25 + 50 * hot + 20 * wave) : Math.round(20 + 40 * hot + 10 * wave)
          green = isDark ? Math.round(55 + 85 * hot + 30 * crest) : Math.round(50 + 75 * hot + 20 * crest)
          blue = isDark ? Math.round(110 + 95 * hot) : Math.round(115 + 85 * hot)
        } else {
          red = isDark ? Math.round(45 + 110 * hot + 25 * wave) : Math.round(40 + 95 * hot + 15 * wave)
          green = isDark ? Math.round(110 + 120 * hot + 35 * crest) : Math.round(100 + 105 * hot + 25 * crest)
          blue = isDark ? Math.round(195 + 55 * hot) : Math.round(190 + 50 * hot)
        }
      } else if (theme === 'qwen') {
        const posRatio = Math.min(1, Math.max(0, x / Math.max(1, origin)))
        if (posRatio < 0.65) {
          red = isDark ? Math.round(35 + 75 * hot + 20 * wave) : Math.round(30 + 55 * hot + 15 * wave)
          green = isDark ? Math.round(75 + 115 * hot + 30 * crest) : Math.round(70 + 95 * hot + 20 * crest)
          blue = isDark ? Math.round(190 + 65 * hot) : Math.round(195 + 55 * hot)
        } else {
          red = isDark ? Math.round(110 + 141 * hot + 30 * wave) : Math.round(100 + 135 * hot + 20 * wave)
          green = isDark ? Math.round(120 + 105 * hot + 35 * crest) : Math.round(110 + 95 * hot + 20 * crest)
          blue = isDark ? Math.round(180 + 40 * hot) : Math.round(185 + 30 * hot)
        }
      } else if (theme === 'minimax') {
        red = 255
        green = isDark
          ? Math.round(75 + 85 * hot + 30 * crest)
          : Math.round(95 + 75 * hot + 20 * crest)
        blue = isDark
          ? Math.round(65 + 50 * hot)
          : Math.round(80 + 40 * hot)
      } else if (theme === 'openai') {
        red = isDark
          ? Math.round(120 + 135 * hot + 40 * wave + 30 * crest)
          : Math.round(125 + 65 * hot + 15 * wave)
        green = isDark
          ? Math.round(38 + 58 * hot + 32 * crest)
          : Math.round(65 + 55 * hot + 20 * crest)
        blue = isDark
          ? Math.round(205 + 50 * hot)
          : Math.round(225 + 30 * hot)
      } else {
        red = isDark
          ? Math.round(54 + 148 * hot + 42 * wave + 35 * crest)
          : Math.round(25 + 72 * hot + 12 * wave)
        green = isDark
          ? Math.round(68 + 78 * hot + 46 * crest)
          : Math.round(98 + 72 * hot + 24 * crest)
        blue = isDark
          ? Math.round(186 + 64 * hot)
          : Math.round(194 + 56 * hot)
      }
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
    if (theme === 'gemini') {
      const colors = [
        isDark ? 'rgba(245,158,11,' : 'rgba(220,135,10,',  // Amber
        isDark ? 'rgba(16,185,129,' : 'rgba(12,155,105,',  // Emerald
        isDark ? 'rgba(66,133,244,' : 'rgba(50,110,225,',  // Google Blue
        isDark ? 'rgba(147,51,234,' : 'rgba(125,40,205,',  // Nebula Indigo
        isDark ? 'rgba(235,68,90,'  : 'rgba(215,50,75,',   // Coral Pink
      ]
      const c = colors[i % colors.length]
      streak.addColorStop(0, `${c}0)`)
      streak.addColorStop(0.68, `${c}${alpha})`)
      streak.addColorStop(1, isDark ? `rgba(255,255,255,${Math.min(1, alpha + 0.3)})` : `rgba(255,240,245,${Math.min(0.88, alpha + 0.2)})`)
    } else if (theme === 'claude') {
      streak.addColorStop(0, isDark ? 'rgba(255,95,20,0)' : 'rgba(230,80,15,0)')
      streak.addColorStop(0.68, isDark ? `rgba(255,140,50,${alpha})` : `rgba(245,125,40,${alpha * 0.75})`)
      streak.addColorStop(1, isDark ? `rgba(255,240,210,${Math.min(1, alpha + 0.3)})` : `rgba(255,210,160,${Math.min(0.88, alpha + 0.2)})`)
    } else if (theme === 'kimi') {
      if (i % 4 === 0) {
        // Golden star particle streak
        streak.addColorStop(0, isDark ? 'rgba(255,215,100,0)' : 'rgba(240,185,60,0)')
        streak.addColorStop(0.65, isDark ? `rgba(255,225,140,${alpha})` : `rgba(245,195,75,${alpha * 0.75})`)
        streak.addColorStop(1, isDark ? `rgba(255,255,255,${Math.min(1, alpha + 0.3)})` : `rgba(255,245,210,${Math.min(0.9, alpha + 0.2)})`)
      } else {
        // Midnight celestial indigo streak
        streak.addColorStop(0, isDark ? 'rgba(50,70,180,0)' : 'rgba(35,50,150,0)')
        streak.addColorStop(0.68, isDark ? `rgba(100,135,245,${alpha})` : `rgba(75,105,215,${alpha * 0.72})`)
        streak.addColorStop(1, isDark ? `rgba(225,235,255,${Math.min(1, alpha + 0.28)})` : `rgba(200,215,255,${Math.min(0.85, alpha + 0.2)})`)
      }
    } else if (theme === 'glm') {
      if (i % 3 === 0) {
        // Starlight cyan streak
        streak.addColorStop(0, isDark ? 'rgba(34,211,238,0)' : 'rgba(14,165,233,0)')
        streak.addColorStop(0.65, isDark ? `rgba(56,189,248,${alpha})` : `rgba(14,165,233,${alpha * 0.75})`)
        streak.addColorStop(1, isDark ? `rgba(224,242,254,${Math.min(1, alpha + 0.3)})` : `rgba(200,235,255,${Math.min(0.9, alpha + 0.2)})`)
      } else {
        // Deep obsidian slate-blue streak
        streak.addColorStop(0, isDark ? 'rgba(15,35,65,0)' : 'rgba(10,25,50,0)')
        streak.addColorStop(0.68, isDark ? `rgba(30,65,110,${alpha})` : `rgba(20,50,95,${alpha * 0.72})`)
        streak.addColorStop(1, isDark ? `rgba(186,230,253,${Math.min(1, alpha + 0.28)})` : `rgba(140,200,250,${Math.min(0.85, alpha + 0.2)})`)
      }
    } else if (theme === 'qwen') {
      if (i % 4 === 0) {
        // Starlight gold particle streak
        streak.addColorStop(0, isDark ? 'rgba(251,191,36,0)' : 'rgba(245,158,11,0)')
        streak.addColorStop(0.65, isDark ? `rgba(253,230,138,${alpha})` : `rgba(251,191,36,${alpha * 0.75})`)
        streak.addColorStop(1, isDark ? `rgba(255,255,255,${Math.min(1, alpha + 0.3)})` : `rgba(255,250,220,${Math.min(0.9, alpha + 0.2)})`)
      } else {
        // Ethereal azure sky blue streak
        streak.addColorStop(0, isDark ? 'rgba(37,99,235,0)' : 'rgba(29,78,216,0)')
        streak.addColorStop(0.68, isDark ? `rgba(96,165,250,${alpha})` : `rgba(59,130,246,${alpha * 0.72})`)
        streak.addColorStop(1, isDark ? `rgba(219,234,254,${Math.min(1, alpha + 0.28)})` : `rgba(191,219,254,${Math.min(0.85, alpha + 0.2)})`)
      }
    } else if (theme === 'minimax') {
      if (i % 3 === 0) {
        // Vibrant Sunset Coral Orange streak
        streak.addColorStop(0, isDark ? 'rgba(255,115,70,0)' : 'rgba(255,90,50,0)')
        streak.addColorStop(0.65, isDark ? `rgba(255,145,100,${alpha})` : `rgba(255,115,70,${alpha * 0.75})`)
        streak.addColorStop(1, isDark ? `rgba(255,245,240,${Math.min(1, alpha + 0.3)})` : `rgba(255,235,225,${Math.min(0.9, alpha + 0.2)})`)
      } else {
        // Bright Sunset Peach streak
        streak.addColorStop(0, isDark ? 'rgba(255,80,60,0)' : 'rgba(240,65,45,0)')
        streak.addColorStop(0.68, isDark ? `rgba(255,110,90,${alpha})` : `rgba(245,85,65,${alpha * 0.72})`)
        streak.addColorStop(1, isDark ? `rgba(255,225,210,${Math.min(1, alpha + 0.28)})` : `rgba(255,200,180,${Math.min(0.85, alpha + 0.2)})`)
      }
    } else if (theme === 'openai') {
      streak.addColorStop(0, isDark ? 'rgba(130,50,255,0)' : 'rgba(120,40,210,0)')
      streak.addColorStop(0.68, isDark ? `rgba(175,95,255,${alpha})` : `rgba(165,80,245,${alpha * 0.72})`)
      streak.addColorStop(1, isDark ? `rgba(255,230,255,${Math.min(1, alpha + 0.28)})` : `rgba(220,165,255,${Math.min(0.85, alpha + 0.2)})`)
    } else {
      streak.addColorStop(0, isDark ? 'rgba(72,118,255,0)' : 'rgba(24,94,184,0)')
      streak.addColorStop(0.68, isDark ? `rgba(112,135,255,${alpha})` : `rgba(36,108,202,${alpha * 0.72})`)
      streak.addColorStop(1, isDark ? `rgba(236,222,255,${Math.min(1, alpha + 0.26)})` : `rgba(103,175,248,${Math.min(0.82, alpha + 0.18)})`)
    }
    context.fillStyle = streak
    context.fillRect(particleX, particleY, length, i % 3 === 0 ? 2 : 1)
  }

  const glow = context.createRadialGradient(origin, height / 2, 0, origin, height / 2, 24)
  if (theme === 'gemini') {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.96)')
    glow.addColorStop(0.14, isDark ? 'rgba(230,215,255,.68)' : 'rgba(225,210,255,.58)')
    glow.addColorStop(0.44, isDark ? 'rgba(147,51,234,.38)' : 'rgba(66,133,244,.28)')
    glow.addColorStop(1, 'rgba(235,68,90,0)')
  } else if (theme === 'claude') {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.94)' : 'rgba(255,255,255,.95)')
    glow.addColorStop(0.14, isDark ? 'rgba(255,220,180,.65)' : 'rgba(255,225,190,.58)')
    glow.addColorStop(0.44, isDark ? 'rgba(240,120,30,.36)' : 'rgba(235,115,30,.28)')
    glow.addColorStop(1, isDark ? 'rgba(180,50,0,0)' : 'rgba(190,60,10,0)')
  } else if (theme === 'kimi') {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.96)')
    glow.addColorStop(0.14, isDark ? 'rgba(230,240,255,.68)' : 'rgba(220,230,255,.58)')
    glow.addColorStop(0.44, isDark ? 'rgba(92,116,232,.42)' : 'rgba(75,98,215,.32)')
    glow.addColorStop(0.78, isDark ? 'rgba(255,215,105,.18)' : 'rgba(245,195,75,.12)')
    glow.addColorStop(1, 'rgba(15,22,55,0)')
  } else if (theme === 'glm') {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.96)')
    glow.addColorStop(0.14, isDark ? 'rgba(224,242,254,.68)' : 'rgba(215,235,255,.58)')
    glow.addColorStop(0.44, isDark ? 'rgba(14,165,233,.42)' : 'rgba(2,132,199,.32)')
    glow.addColorStop(0.78, isDark ? 'rgba(56,189,248,.18)' : 'rgba(14,165,233,.12)')
    glow.addColorStop(1, 'rgba(5,15,30,0)')
  } else if (theme === 'qwen') {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.96)')
    glow.addColorStop(0.14, isDark ? 'rgba(219,234,254,.68)' : 'rgba(210,230,255,.58)')
    glow.addColorStop(0.44, isDark ? 'rgba(59,130,246,.42)' : 'rgba(37,99,235,.32)')
    glow.addColorStop(0.78, isDark ? 'rgba(251,191,36,.18)' : 'rgba(245,158,11,.12)')
    glow.addColorStop(1, 'rgba(12,21,56,0)')
  } else if (theme === 'minimax') {
    glow.addColorStop(0, 'rgba(255,255,255,.98)')
    glow.addColorStop(0.14, isDark ? 'rgba(255,225,210,.72)' : 'rgba(255,215,200,.62)')
    glow.addColorStop(0.44, isDark ? 'rgba(255,115,70,.46)' : 'rgba(255,95,55,.36)')
    glow.addColorStop(0.78, isDark ? 'rgba(255,80,50,.2)' : 'rgba(240,65,40,.14)')
    glow.addColorStop(1, 'rgba(50,15,10,0)')
  } else if (theme === 'openai') {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.94)')
    glow.addColorStop(0.14, isDark ? 'rgba(225,180,255,.62)' : 'rgba(220,180,255,.54)')
    glow.addColorStop(0.44, isDark ? 'rgba(160,70,255,.34)' : 'rgba(150,55,230,.26)')
    glow.addColorStop(1, isDark ? 'rgba(110,25,200,0)' : 'rgba(100,20,180,0)')
  } else {
    glow.addColorStop(0, isDark ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.86)')
    glow.addColorStop(0.14, isDark ? 'rgba(183,190,255,.54)' : 'rgba(162,210,255,.48)')
    glow.addColorStop(0.44, isDark ? 'rgba(103,74,255,.28)' : 'rgba(37,112,207,.22)')
    glow.addColorStop(1, isDark ? 'rgba(86,31,210,0)' : 'rgba(25,91,181,0)')
  }
  context.fillStyle = glow
  context.fillRect(origin - 26, 0, 52, height)
  context.restore()
}

function EffortSlider({ directory }: { directory: ModelDirectory }) {
  const directoryState = useSyncExternalStore(
    (notify) => directory.store.subscribe(notify),
    () => directory.store.getSnapshot(),
  )
  const currentProvider = directoryState.current?.provider
  const currentModelId = directoryState.current?.model
  const currentChoice = currentModel(directoryState)
  const theme = detectModelTheme(currentProvider, currentModelId, currentChoice?.name)
  const themeRef = useRef<ModelThemeKind>(theme)
  themeRef.current = theme

  const levels = sliderLevels(directoryState)
  const [effort, setEffort] = useState('')
  const [preview, setPreview] = useState(0)
  const [committing, setCommitting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const chibiThumb = useSyncExternalStore(chibiThumbStore.subscribe, chibiThumbStore.getSnapshot)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const committedRef = useRef('')
  const committingRef = useRef(false)
  const previewRef = useRef(0)
  const draggingRef = useRef(false)
  const pointerActiveRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const globalPointerMoveRef = useRef<((event: PointerEvent) => void) | null>(null)
  const globalPointerEndRef = useRef<((event: PointerEvent) => void) | null>(null)
  const globalPointerCancelRef = useRef<((event: PointerEvent) => void) | null>(null)
  const radiationRef = useRef<RadiationState>({ progress: 0.5, dragging: false })
  const redrawRef = useRef<(() => void) | null>(null)
  const available = directoryState.current !== null && levels.length >= 2
  const busy = committing || directoryState.status === 'selecting'
  const error = localError ?? directoryState.error

  useEffect(() => {
    if (!available || committingRef.current || draggingRef.current) return
    const index = effectiveEffortIndex(levels, directoryState)
    const next = levels[index]?.id ?? ''
    committedRef.current = next
    previewRef.current = index
    setEffort(next)
    setPreview(index)
    setLocalError(null)
  }, [available, levels, directoryState])

  useEffect(() => {
    directory.load().catch(() => undefined)
  }, [directory])

  useEffect(() => {
    previewRef.current = preview
    radiationRef.current.progress = levels.length >= 2 ? preview / (levels.length - 1) : 0.5
    redrawRef.current?.()
  }, [preview, levels.length])

  useEffect(() => {
    radiationRef.current.dragging = dragging
    redrawRef.current?.()
  }, [dragging])

  useEffect(() => {
    themeRef.current = theme
    redrawRef.current?.()
  }, [theme])

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
      drawRadiation(context, width, height, time, radiationRef.current, themeRef.current)
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
    const previous = committedRef.current
    previewRef.current = Math.max(0, effortIndex(levels, previous))
    pointerActiveRef.current = false
    activePointerIdRef.current = null
    draggingRef.current = false
    setEffort(previous)
    setPreview(Math.max(0, effortIndex(levels, previous)))
    setDragging(false)
  }, [levels])

  const commit = useCallback(async (raw: number) => {
    if (committingRef.current) return
    committingRef.current = true
    const previous = committedRef.current

    setDragging(false)
    setCommitting(true)
    setLocalError(null)

    // Optimistic snap from the rendered levels keeps the thumb responsive
    // while the directory round-trip revalidates against fresh data below.
    const optimisticIndex = clampIndex(raw, levels.length)
    const optimistic = levels[optimisticIndex]?.id
    if (optimistic !== undefined) {
      previewRef.current = optimisticIndex
      setPreview(optimisticIndex)
      setEffort(optimistic)
    }

    try {
      const models = await directory.load()
      const fresh: ModelDirectoryState = {
        current: models.current,
        routable: models.routable,
        groups: models.groups,
        failures: models.failures,
        status: 'ready',
        error: null,
      }
      const freshLevels = sliderLevels(fresh)
      const index = clampIndex(raw, freshLevels.length)
      const next = freshLevels[index]?.id
      if (next === undefined) throw new Error('当前模型未提供推理强度档位')

      previewRef.current = index
      setPreview(index)
      setEffort(next)

      await directory.select({
        provider: models.current.provider,
        model: models.current.model,
        reasoningEffort: next,
      })

      const snapshot = directory.store.getSnapshot()
      const accepted = effortIndex(freshLevels, snapshot.current?.reasoningEffort)
      const settled = accepted >= 0 ? accepted : index
      const settledId = freshLevels[settled]?.id ?? next
      committedRef.current = settledId
      previewRef.current = settled
      setEffort(settledId)
      setPreview(settled)
    } catch (cause) {
      const restore = Math.max(0, effortIndex(levels, previous))
      committedRef.current = previous
      previewRef.current = restore
      setEffort(previous)
      setPreview(restore)
      setLocalError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      committingRef.current = false
      setCommitting(false)
    }
  }, [directory, levels])

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
    showPointerPreview(rawFromPointer(input, clientX))
  }

  const stopDragging = (input: HTMLInputElement, pointerId?: number, clientX?: number) => {
    if (!pointerActiveRef.current) return
    if (pointerId !== undefined && activePointerIdRef.current !== pointerId) return
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
  const effortName = levels[effortIndex(levels, effort)]?.name ?? effort
  const isTop = effortIndex(levels, effort) === count - 1
  const progress = preview / (count - 1) * 100
  const style = { '--re-progress': `${progress}%` } as CSSProperties
  const title = error === null ? `推理强度 · ${effortName}` : `推理强度设置失败：${error}`

  return (
    <div
      className={`re-effort theme-${theme}${chibiThumb ? ' is-chibi' : ''}${dragging ? ' is-dragging' : ''}${busy ? ' is-busy' : ''}${error === null ? '' : ' is-error'}`}
      data-re-theme={theme}
      title={title}
    >
      <div
        className="re-effort-slider"
        data-top={isTop ? 'true' : undefined}
        style={style}
      >
        <div className="re-effort-track" aria-hidden="true" />
        <div className="re-effort-fx" aria-hidden="true">
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
          aria-label="推理强度"
          aria-valuetext={effortName}
          onChange={(event) => {
            const raw = Number(event.currentTarget.value)
            showPointerPreview(raw)
          }}
          onPointerDown={(event) => {
            event.preventDefault()
            event.currentTarget.focus()
            beginDragging(event.currentTarget, event.pointerId, event.clientX)
          }}
          onPointerMove={(event) => moveDragging(event.currentTarget, event.pointerId, event.clientX)}
          onPointerUp={(event) => stopDragging(event.currentTarget, event.pointerId, event.clientX)}
          onPointerCancel={(event) => {
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
        <span className="re-effort-knob" aria-hidden="true" />
      </div>
      {error === null ? null : <span className="re-effort-sr" role="status">{error}</span>}
    </div>
  )
}

//#region Quota Store & Service
interface QuotaData {
  ok?: boolean
  codex?: {
    account: string
    planType: string
    remainingPct: number
    usedPct: number
    resetSeconds: number
    resetAt: number
    resetText: string
    label: string
  }
  antigravity?: {
    accountCount: number
    accounts: any[]
    gemini?: {
      fiveHPct: number | null
      weeklyPct: number | null
      fiveHResetText?: string
      availableAccounts?: string
      badgeText?: string
      tooltip?: string
      displayName?: string
      accounts?: any[]
    }
    claudeGpt?: {
      fiveHPct: number | null
      weeklyPct: number | null
      fiveHResetText?: string
      availableAccounts?: string
      badgeText?: string
      tooltip?: string
      displayName?: string
      accounts?: any[]
    }
  }
  clinepass?: {
    fiveHPct: number
    weeklyPct: number
    monthlyPct: number
    planName: string
    badgeText: string
    label: string
  }
  [key: string]: any
}

let globalQuota: QuotaData | null = null
let lastQuotaFetch = 0
let isQuotaFetching = false
const quotaListeners = new Set<(q: QuotaData | null) => void>()
const AUTO_REFRESH_INTERVAL_MS = 120000
const MGMT_KEY = 'wui-Aa9_1ZN3uPNxcli-10lFXXIqHgyhKAsCXnZS0CvF58ifSCY'
const CLINE_KEY = 'sk_7f05fdb800a0e3c9fa40d5cdff40edafaf855ce3b4def50930fa4c7430aff7fc'

function updateQuota(data: QuotaData | null) {
  globalQuota = data
  lastQuotaFetch = Date.now()
  quotaListeners.forEach((fn) => fn(globalQuota))
}

async function fetchClinePassFallback() {
  try {
    const r1 = await fetch('http://127.0.0.1:8317/v0/management/api-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MGMT_KEY}` },
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.cline.bot/api/v1/users/me',
        header: { Authorization: `Bearer ${CLINE_KEY}` },
      }),
    })
    const d1 = await r1.json()
    const b1 = typeof d1.body === 'string' ? JSON.parse(d1.body) : d1.body
    const userId = b1?.data?.id
    if (!userId) return null

    const r2 = await fetch('http://127.0.0.1:8317/v0/management/api-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MGMT_KEY}` },
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.cline.bot/api/v1/users/me/plan',
        header: { Authorization: `Bearer ${CLINE_KEY}` },
      }),
    })
    const d2 = await r2.json()
    const b2 = typeof d2.body === 'string' ? JSON.parse(d2.body) : d2.body
    const caps = b2?.data?.plan?.entitlements?.cline_pass?.inferenceCapThreshold
    if (!caps) return null

    const r3 = await fetch('http://127.0.0.1:8317/v0/management/api-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MGMT_KEY}` },
      body: JSON.stringify({
        method: 'GET',
        url: `https://api.cline.bot/api/v1/users/${userId}/usages?limit=100`,
        header: { Authorization: `Bearer ${CLINE_KEY}` },
      }),
    })
    const d3 = await r3.json()
    const b3 = typeof d3.body === 'string' ? JSON.parse(d3.body) : d3.body

    const now = Date.now()
    const ms5h = 5 * 3600 * 1000
    const ms7d = 7 * 24 * 3600 * 1000
    const ms30d = 30 * 24 * 3600 * 1000

    let cost5h = 0, cost7d = 0, cost30d = 0
    for (const item of b3?.data?.items || []) {
      const t = new Date(item.createdAt).getTime()
      const age = now - t
      const cost = item.costUsd || 0
      if (age <= ms5h) cost5h += cost
      if (age <= ms7d) cost7d += cost
      if (age <= ms30d) cost30d += cost
    }

    const cap5h = caps.last5HoursUsageCostUSDPerUser || 1000000000
    const cap7d = caps.last7daysUsageCostUSDPerUser || 2500000000
    const cap30d = caps.last30daysUsageCostUSDPerUser || 5000000000

    const rem5h = Math.max(0, 100 - Math.round((cost5h / cap5h) * 100))
    const rem7d = Math.max(0, 100 - Math.round((cost7d / cap7d) * 100))
    const rem30d = Math.max(0, 100 - Math.round((cost30d / cap30d) * 100))

    return {
      fiveHPct: rem5h,
      weeklyPct: rem7d,
      monthlyPct: rem30d,
      planName: b2?.data?.plan?.displayName || 'Cline Pass',
      badgeText: `5h: ${rem5h}% · 周: ${rem7d}% · 月: ${rem30d}%`,
      label: `5小时剩余 ${rem5h}% · 周剩余 ${rem7d}% · 月剩余 ${rem30d}%`,
    }
  } catch {
    return null
  }
}

function fetchQuota(force = false) {
  const now = Date.now()
  if (!force && globalQuota && now - lastQuotaFetch < 15000) return
  if (isQuotaFetching) return
  isQuotaFetching = true

  fetch('/api/quota' + (force ? '?force=1' : ''))
    .then((r) => r.json())
    .then(async (data) => {
      isQuotaFetching = false
      if (data && data.ok) {
        if (!data.clinepass) {
          const fallbackCline = await fetchClinePassFallback()
          if (fallbackCline) {
            data.clinepass = fallbackCline
          }
        }
        updateQuota(data)
      }
    })
    .catch(async () => {
      isQuotaFetching = false
      const fallbackCline = await fetchClinePassFallback()
      if (fallbackCline && globalQuota) {
        globalQuota.clinepass = fallbackCline
        updateQuota({ ...globalQuota })
      }
    })
}

if (typeof window !== 'undefined') {
  setInterval(() => {
    fetchQuota(true)
  }, AUTO_REFRESH_INTERVAL_MS)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastQuotaFetch > 60000) {
      fetchQuota(true)
    }
  })
  window.addEventListener('focus', () => {
    if (Date.now() - lastQuotaFetch > 60000) {
      fetchQuota(true)
    }
  })
}

function useQuota(): QuotaData | null {
  const [quota, setQuota] = useState<QuotaData | null>(globalQuota)
  useEffect(() => {
    quotaListeners.add(setQuota)
    fetchQuota()
    return () => {
      quotaListeners.delete(setQuota)
    }
  }, [])
  return quota
}
//#endregion

function AdvancedModelSelect({
  locked,
  available,
  controller,
  directory,
  load,
  select,
  adapt,
}: ModelSeatProps) {
  const state = useSyncExternalStore(
    (notify) => directory.subscribe(notify),
    () => directory.getSnapshot(),
  )
  const [open, setOpen] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)
  const [guidance, setGuidance] = useState<AdaptGuidance | null>(null)
  const [guidanceBusy, setGuidanceBusy] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const quota = useQuota()
  const choice = currentModel(state)
  const levels = sliderLevels(state)
  const effortName = levels[effectiveEffortIndex(levels, state)]?.name ?? '默认'
  const modelLabel = choice?.name ?? state.current?.model ?? '选择模型'
  const busy = state.status === 'loading' || state.status === 'selecting'

  const provider = state.current?.provider
  const modelId = state.current?.model
  const theme = detectModelTheme(provider, modelId, choice?.name)

  useEffect(() => {
    if (!available) return
    load()
  }, [available, load])

  useEffect(() => {
    if (open || modelsOpen) {
      fetchQuota(false)
    }
  }, [open, modelsOpen])

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
    if (adapt === null || provider === undefined || modelId === undefined) {
      setGuidance(null)
      setPanelOpen(false)
      return
    }
    let cancelled = false
    setGuidanceBusy(true)
    adapt.diagnose(provider, modelId).then((result) => {
      if (cancelled) return
      setGuidance(result)
      setGuidanceBusy(false)
      if (result === null || !result.needsGuide) setPanelOpen(false)
    }, () => {
      if (cancelled) return
      setGuidance(null)
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

  const chooseModel = async (providerName: string, selectedModelId: string, defaultEffort?: string) => {
    if (state.current?.provider === providerName && state.current.model === selectedModelId) {
      setModelsOpen(false)
      return
    }
    const accepted = await select({
      provider: providerName,
      model: selectedModelId,
      ...(defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort }),
    })
    if (accepted) setModelsOpen(false)
  }

  return (
    <div ref={rootRef} className={`re-model-root theme-${theme}`} data-re-theme={theme} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className="re-model-trigger"
        aria-label={`模型 ${modelLabel}，推理强度 ${effortName}`}
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
        <div className="re-model-menu" role="menu" aria-label="模型与推理强度" aria-busy={busy}>
          {modelsOpen ? (
            <div className="re-model-pane">
              <button type="button" className="re-model-back" onClick={() => setModelsOpen(false)}>
                <span aria-hidden="true">‹</span>
                <span>选择模型</span>
              </button>
              {state.status === 'loading' && state.groups.length === 0 ? (
                <div className="re-model-status">正在加载模型…</div>
              ) : null}
              {state.groups.map((group) => {
                const isCodex = group.id === 'openai-codex' || group.id.includes('codex') || group.name.includes('Codex')
                const isClinePass = group.id === 'clinepass' || group.id.includes('cline') || group.name.toLowerCase().includes('cline')
                const isAntigravity = group.id === 'google-antigravity' || group.id.includes('antigravity') || group.name.includes('Anti-Gravity')

                const codexQuota = isCodex ? quota?.codex : null
                const clineQuota = isClinePass ? quota?.clinepass : null

                return (
                  <section key={group.id}>
                    <div className="re-model-group-title">
                      <span>{group.name}</span>
                      {codexQuota ? (
                        <span
                          className={`dsh-quota-header-badge${
                            codexQuota.remainingPct <= 10
                              ? ' danger'
                              : codexQuota.remainingPct <= 30
                              ? ' warn'
                              : ''
                          }`}
                          title={`Codex 官方额度: 剩余 ${codexQuota.remainingPct}% (${codexQuota.resetText})`}
                        >
                          {`剩余 ${codexQuota.remainingPct}% · ${codexQuota.resetText}`}
                        </span>
                      ) : null}
                      {clineQuota ? (
                        <span
                          className={`dsh-quota-header-badge${
                            clineQuota.fiveHPct <= 10
                              ? ' danger'
                              : clineQuota.fiveHPct <= 30
                              ? ' warn'
                              : ''
                          }`}
                          title={`ClinePass 全局额度: 5小时剩余 ${clineQuota.fiveHPct}% · 每周剩余 ${clineQuota.weeklyPct}% · 每月剩余 ${clineQuota.monthlyPct}%`}
                        >
                          {clineQuota.badgeText}
                        </span>
                      ) : null}
                    </div>
                    {group.models.map((model) => {
                      const selected = state.current?.provider === group.id && state.current.model === model.id
                      let modelQuota: any = null
                      if (isAntigravity && quota?.antigravity) {
                        const mId = model.id.toLowerCase()
                        if (mId.includes('gemini')) {
                          modelQuota = quota.antigravity.gemini
                        } else if (mId.includes('claude') || mId.includes('gpt')) {
                          modelQuota = quota.antigravity.claudeGpt
                        }
                      }

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
                            <span className="re-model-option-name-row">
                              <span className="re-model-option-name">{model.name}</span>
                              {modelQuota ? (
                                <span
                                  className={`dsh-quota-model-badge${
                                    modelQuota.fiveHPct !== null && modelQuota.fiveHPct <= 10
                                      ? ' danger'
                                      : modelQuota.fiveHPct !== null && modelQuota.fiveHPct <= 30
                                      ? ' warn'
                                      : ''
                                  }`}
                                  title={
                                    modelQuota.tooltip ||
                                    `${modelQuota.displayName || 'Google Anti-Gravity'}: 5小时限额剩余 ${
                                      modelQuota.fiveHPct ?? '-'
                                    }%，周限额剩余 ${modelQuota.weeklyPct ?? '-'}%`
                                  }
                                >
                                  {modelQuota.badgeText ||
                                    (modelQuota.fiveHPct !== null ? `5h: ${modelQuota.fiveHPct}%` : `周: ${modelQuota.weeklyPct}%`)}
                                </span>
                              ) : null}
                            </span>
                            {model.description === undefined ? null : (
                              <span className="re-model-option-desc">{model.description}</span>
                            )}
                          </span>
                          <span className="re-model-check" aria-hidden="true">{selected ? '✓' : ''}</span>
                        </button>
                      )
                    })}
                  </section>
                )
              })}
              {state.status === 'ready' && state.groups.every((group) => group.models.length === 0) ? (
                <div className="re-model-status">没有可用模型</div>
              ) : null}
              {state.error === null ? null : <div className="re-model-error">{state.error}</div>}
            </div>
          ) : (
            <>
              <div className="re-advanced">
                {levels.length >= 2 ? (
                  <EffortSlider directory={controller} />
                ) : (
                  <div className="re-model-status">当前模型未提供推理强度档位</div>
                )}
              </div>
              {guidance !== null && guidance.needsGuide ? (
                <div className="re-adapt">
                  <div className="re-adapt-copy">
                    <div className="re-adapt-title">
                      {guidance.reason === 'missing' ? '当前模型未提供推理强度档位' : '档位声明与知识库不一致'}
                    </div>
                    <div className="re-adapt-desc">
                      {guidance.matched
                        ? `知识库记录该模型支持 ${levelsText(guidance.expected)}，目录当前为 ${levelsText(guidance.current)}。${guidance.note ?? ''}`
                        : `目录当前为 ${levelsText(guidance.current)}。${guidance.note ?? ''}`}
                    </div>
                  </div>
                  {panelOpen ? (
                    <div className="re-adapt-panel">
                      <div className="re-adapt-scroll">
                        {guidance.matched ? (
                          <div className="re-adapt-panel-line">
                            <span className="re-adapt-arrow">{levelsText(guidance.current)}</span>
                            <span aria-hidden="true">→</span>
                            <span className="re-adapt-arrow">{levelsText(guidance.expected)}</span>
                          </div>
                        ) : null}
                        {guidance.warning === null ? null : (
                          <div className="re-adapt-warning">{guidance.warning}</div>
                        )}
                        <div className="re-adapt-label">要粘贴的内容</div>
                        <pre className="re-adapt-yaml">{guidance.snippet}</pre>
                        <div className="re-adapt-steps">
                          <span>
                            1. 打开 settings.yaml
                            {guidance.settingsPath === null ? '' : `（${guidance.settingsPath}）`}，
                            在 <code>{guidance.entryPath}</code> 列表里找到 <code>{guidance.entryLine}</code>；
                          </span>
                          {guidance.mode === 'replace' ? (
                            <span>
                              2. 把原有 <code>{guidance.entryLine}</code> 条目整体替换为复制的内容（不要复制出第二个 <code>llm-pi-ai:</code> 根）；
                            </span>
                          ) : (
                            <span>
                              2. 该行末尾回车，粘贴上面复制的内容（缩进与 <code>id</code> 差 2 个空格；不要复制出第二个 <code>llm-pi-ai:</code> 根）；
                            </span>
                          )}
                          <span>3. 保存后自动生效；滑块未出现则重启 Web Host 并刷新页面。</span>
                        </div>
                      </div>
                      <div className="re-adapt-actions">
                        <button
                          type="button"
                          className="re-adapt-apply"
                          onClick={() => {
                            void copyText(guidance.snippet).then((ok) => setCopied(ok))
                          }}
                        >
                          {copied ? '已复制 ✓' : '复制字段块'}
                        </button>
                        <button type="button" className="re-adapt-cancel" onClick={() => setPanelOpen(false)}>
                          收起
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="re-adapt-open"
                      disabled={guidanceBusy}
                      onClick={() => {
                        setPanelOpen(true)
                        setCopied(false)
                      }}
                    >
                      {guidanceBusy ? '正在分析…' : '查看档位声明指引'}
                    </button>
                  )}
                </div>
              ) : null}
              <div className="re-menu-separator" />
              <button
                type="button"
                className="re-model-row"
                onClick={() => setModelsOpen(true)}
              >
                <span className="re-model-row-name">{modelLabel}</span>
                <span className="re-model-row-effort">{effortName}</span>
                <span className="re-row-chevron" aria-hidden="true">›</span>
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function ReasoningEffortSetting() {
  const enabled = useSyncExternalStore(enabledStore.subscribe, enabledStore.getSnapshot)

  return (
    <div className="re-setting-row">
      <div className="re-setting-copy">
        <div className="re-setting-title">推理强度滑块</div>
        <div className="re-setting-description">在模型菜单中显示推理强度滑块和动态辐射特效，档位随当前模型自动适配</div>
      </div>
      <div className="re-setting-control">
        <span className="re-setting-state">{enabled ? '启用' : '停用'}</span>
        <button
          type="button"
          role="switch"
          aria-label="启用推理强度滑块"
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

function ChibiThumbSetting() {
  const sliderEnabled = useSyncExternalStore(enabledStore.subscribe, enabledStore.getSnapshot)
  const enabled = useSyncExternalStore(chibiThumbStore.subscribe, chibiThumbStore.getSnapshot)

  return (
    <div className="re-setting-row">
      <div className="re-setting-copy">
        <div className="re-setting-title">大肥鱼滑块</div>
        <div className="re-setting-description">用大肥鱼 / Q版形象替换滑块按钮（不同模型自动切换对应专属Q版形象）</div>
      </div>
      <div className="re-setting-control">
        <span className="re-setting-state">{enabled ? '启用' : '停用'}</span>
        <button
          type="button"
          role="switch"
          aria-label="启用大肥鱼滑块"
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
      { name: SETTINGS_SLOT, id: 'reasoning-effort-enabled', order: 15 },
      ReasoningEffortSetting,
    ),
  )

  ctx.slots.inject(SETTINGS_SLOT, () =>
    ctx.slots.register(
      { name: SETTINGS_SLOT, id: 'reasoning-effort-chibi-thumb', order: 16 },
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
          inject: (sessionId: SessionId) => {
            const controller = modelDirectories.directoryFor(sessionId)
            return {
              available: true,
              controller,
              directory: controller.store,
              load: () => controller.load().then(() => undefined, () => undefined),
              select: (selection: ModelSelection) => controller.select(selection).then(() => true, () => false),
              adapt,
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
