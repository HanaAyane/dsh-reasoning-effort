import deepseek from '../../assets/runners/deepseek.png'
import deepseekWinter from '../../assets/runners/deepseek-winter.png'
import openai from '../../assets/runners/openai.png'
import claude from '../../assets/runners/claude.png'
import gemini from '../../assets/runners/gemini.png'
import grok from '../../assets/runners/grok.png'
import kimi from '../../assets/runners/kimi.png'
import glm from '../../assets/runners/glm.png'
import qwen from '../../assets/runners/qwen.png'
import minimax from '../../assets/runners/minimax.png'

const modelTokens = {
  deepseek: /^deepseek\d*$|^深度求索/u,
  openai: /^(?:openai|chatgpt|gpt\d*|codex|o[134])$/u,
  claude: /^(?:anthropic|claude\d*)$/u,
  gemini: /^(?:gemini\d*|gemma\d*)$/u,
  grok: /^(?:grok\d*|xai)$/u,
  kimi: /^(?:kimi\d*|moonshot(?:ai)?)$/u,
  glm: /^(?:glm\d*|chatglm\d*|zhipu(?:ai)?)$|^智谱/u,
  qwen: /^(?:qwen\d*|qwq|tongyi)$|^(?:通义千问|千问)/u,
  minimax: /^(?:minimax|hailuo|abab\d*)$|^海螺/u,
}
export type RunnerFamily = keyof typeof modelTokens
const modelFamilies = Object.keys(modelTokens) as RunnerFamily[]

interface RunnerSprite {
  image: string
  frames: number
  family: RunnerFamily
}

export const runnerSprites = {
  deepseek: { image: deepseek, frames: 16, family: 'deepseek' },
  'deepseek-winter': { image: deepseekWinter, frames: 16, family: 'deepseek' },
  openai: { image: openai, frames: 16, family: 'openai' },
  claude: { image: claude, frames: 16, family: 'claude' },
  gemini: { image: gemini, frames: 16, family: 'gemini' },
  grok: { image: grok, frames: 16, family: 'grok' },
  kimi: { image: kimi, frames: 16, family: 'kimi' },
  glm: { image: glm, frames: 16, family: 'glm' },
  qwen: { image: qwen, frames: 16, family: 'qwen' },
  minimax: { image: minimax, frames: 16, family: 'minimax' },
} satisfies Record<RunnerFamily, RunnerSprite> & Record<string, RunnerSprite>
export type RunnerId = keyof typeof runnerSprites
export type RunnerPreference = RunnerId | 'auto' | 'off'
export const runnerIds = Object.keys(runnerSprites) as RunnerId[]
export const RUNNER_LOOP_MS = 720
export const RUNNER_DRAG_LOOP_MS = 420

const providerFamilies = new Map<string, RunnerFamily>([
  ['deepseek', 'deepseek'],
  ['openai', 'openai'], ['openai-codex', 'openai'],
  ['anthropic', 'claude'], ['claude', 'claude'],
  ['gemini', 'gemini'], ['google-gemini', 'gemini'],
  ['grok', 'grok'], ['xai', 'grok'], ['x-ai', 'grok'], ['x.ai', 'grok'],
  ['kimi', 'kimi'], ['moonshot', 'kimi'], ['moonshotai', 'kimi'],
  ['glm', 'glm'], ['zhipu', 'glm'], ['zhipuai', 'glm'], ['zai', 'glm'], ['z.ai', 'glm'],
  ['qwen', 'qwen'], ['dashscope', 'qwen'],
  ['minimax', 'minimax'], ['minimax-cn', 'minimax'],
])

function modelFamily(value: string | undefined): RunnerFamily | undefined {
  const tokens = value?.toLowerCase().match(/[a-z0-9]+|\p{Script=Han}+/gu) ?? []
  for (const token of tokens) {
    const family = modelFamilies.find(id => modelTokens[id].test(token))
    if (family !== undefined) return family
  }
}

export function detectModelFamily(
  modelId?: string,
  modelName?: string,
  provider?: string,
): RunnerFamily {
  return modelFamily(modelId?.split('/').at(-1))
    ?? modelFamily(modelId)
    ?? modelFamily(modelName)
    ?? providerFamilies.get(provider?.trim().toLowerCase() ?? '')
    ?? 'deepseek'
}

export function sliderAppearance(preference: RunnerPreference, modelFamily: RunnerFamily) {
  if (preference === 'off') return { family: modelFamily, runner: undefined }
  const runner = preference === 'auto' ? modelFamily : preference
  return { family: runnerSprites[runner].family, runner }
}

export const RUNNER_STORAGE_KEY = 'dsh-reasoning-effort.chibi-thumb'
export const RUNNER_SIZE_STORAGE_KEY = 'dsh-reasoning-effort.runner-size'
export const RUNNER_SIZE = { min: 50, baseline: 50, max: 125, step: 5 } as const

export function parseRunnerPreference(stored: string | null): RunnerPreference {
  if (stored === 'false' || stored === 'off') return 'off'
  if (stored !== null && Object.hasOwn(runnerSprites, stored)) return stored as RunnerId
  return 'auto'
}

function normalizeRunnerSize(value: number): number {
  if (!Number.isFinite(value)) return RUNNER_SIZE.baseline
  return Math.max(RUNNER_SIZE.min, Math.min(RUNNER_SIZE.max, Math.round(value / RUNNER_SIZE.step) * RUNNER_SIZE.step))
}

export function parseRunnerSize(stored: string | null): number {
  return normalizeRunnerSize(stored === null || stored.trim() === '' ? NaN : Number(stored))
}

function readSetting(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function saveSetting(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // The in-memory choice still applies when storage is unavailable.
  }
}

let preference = parseRunnerPreference(readSetting(RUNNER_STORAGE_KEY))
let size = parseRunnerSize(readSetting(RUNNER_SIZE_STORAGE_KEY))
const listeners = new Set<() => void>()

export const runnerStore = {
  getSnapshot: () => preference,
  getSize: () => size,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  set(next: RunnerPreference, persist = true) {
    if (preference === next) return
    preference = next
    // Keep the stored Off value compatible with the original chibi switch.
    if (persist) saveSetting(RUNNER_STORAGE_KEY, next === 'off' ? 'false' : next)
    listeners.forEach(listener => listener())
  },
  setSize(value: number, persist = true) {
    const next = normalizeRunnerSize(value)
    if (size === next) return
    size = next
    if (persist) saveSetting(RUNNER_SIZE_STORAGE_KEY, String(next))
    listeners.forEach(listener => listener())
  },
}
