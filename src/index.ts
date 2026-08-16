/**
 * Host half: read-only reasoning-effort guidance.
 *
 * The slider can only offer what the DSH model directory exposes, and the
 * request path validates every submitted effort against that same directory
 * (`UNSUPPORTED_REASONING_EFFORT` otherwise). This half therefore never
 * invents levels and never writes configuration: it diagnoses custom-provider
 * models the directory under-describes and returns copy-ready
 * `reasoningEfforts` declarations (exact when the knowledge base knows the
 * model, a filled template otherwise) for the user to paste into
 * `settings.yaml`. Built-in catalog models are trusted as-is and never
 * flagged.
 *
 * @module dsh-reasoning-effort
 */

import type { Context } from '@deepseek-ai/cordis'
// Activate the host-side `ctx.connection` Context augmentation (type-only).
import type {} from '@deepseek-ai/dsh-client-connection'
import z from '@deepseek-ai/schemastery'
import { BUILTIN_ENTRIES, displayLevels, matchEntry, type KnowledgeEntry } from './knowledge.js'

export const name = 'dsh-reasoning-effort'

/**
 * Hard dependencies: the loader waits for these services before calling
 * `apply`, so the row never races the boot order of the base bundle rows.
 * `connection` is deliberately absent — only Web profiles provide it, so the
 * RPC channel is mounted through `ctx.inject` instead of blocking this row.
 */
export const inject = ['settings', 'llm']

/** Plugin-owned settings namespace (user-extensible knowledge base only). */
const STORE_NS = 'dsh-reasoning-effort'
/** The DSH namespace holding per-provider model declarations. */
const LLM_NS = 'llm-pi-ai'
/** Loopback RPC channel shared with the browser half. */
const RPC_CHANNEL = '/dsh-reasoning-effort'

const StoreSchema = z.object({
  entries: z.array(z.any()).default([]),
})

interface StoreShape {
  entries?: KnowledgeEntry[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type JsonObject = Record<string, any>

interface HostSettingsService {
  readonly writable: boolean
  get(ns: string): unknown
  register(ns: string, schema: unknown, options?: JsonObject): SettingsScopeLike
  describe(): Array<{ ns: string; revision: number; user?: unknown }>
  prepareDocument(): Promise<string | undefined>
}

interface SettingsScopeLike {
  get(): unknown
}

interface HostLlmService {
  listProviders(): Array<{ id: string; name: string }>
  listModels(provider: string): Promise<Array<{ provider: string; id: string; name: string; description?: string }>>
  resolveModelInfo(provider: string, model: string): Promise<{
    provider: string
    id: string
    name: string
    reasoning?: { efforts: Array<{ id: string; name: string }>; defaultEffort?: string }
  }>
}

interface HostConnection {
  rpc: {
    handle(
      channel: string,
      handler: (endpoint: string, payload: unknown, signal: AbortSignal) => Promise<unknown>,
      options: { authority: 'loopback' | 'trusted-host' },
    ): () => Promise<void>
  }
}

/** One guidance result handed to the browser half. */
interface Guidance {
  provider: string
  model: string
  /** Whether the model is declared in the user's llm-pi-ai settings. */
  userDeclared: boolean
  /** Whether guidance should be shown. */
  needsGuide: boolean
  reason: 'missing' | 'mismatch' | 'none'
  /** Level ids the directory currently exposes. */
  current: string[]
  /** Level ids the knowledge base suggests (empty when unmatched). */
  expected: string[]
  /** Whether a knowledge-base entry matched. */
  matched: boolean
  /** `replace` — snippet is the whole entry to swap in; `insert` — field block to paste under the existing line. */
  mode: 'replace' | 'insert'
  note: string | null
  /** Endpoint-level caveat when the route targets a known-hostile gateway. */
  warning: string | null
  /** Copy-ready field block to insert under the model's entry. */
  snippet: string
  /** The existing entry line to find in settings.yaml, e.g. `- id: glm-5.2`. */
  entryLine: string
  /** Where that entry lives, e.g. `llm-pi-ai.providers.aliyun.models`. */
  entryPath: string
  /** Absolute settings.yaml path, when the provider can name one. */
  settingsPath: string | null
}

function okResult(value: unknown): JsonObject {
  return { ok: true, value }
}

function failResult(code: string, message: string): JsonObject {
  return { ok: false, error: { code, message } }
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Accept only well-formed user entries so one typo cannot break matching. */
function isUsableEntry(value: unknown): value is KnowledgeEntry {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || typeof value.provider !== 'string' || typeof value.model !== 'string') return false
  if (typeof value.note !== 'string' || !isRecord(value.efforts)) return false
  for (const wire of Object.values(value.efforts)) {
    if (wire !== null && typeof wire !== 'string') return false
  }
  return true
}

/** The full ordered knowledge base: user entries first, built-ins after. */
function knowledgeOf(store: StoreShape): KnowledgeEntry[] {
  const user = (store.entries ?? []).filter(isUsableEntry)
  return [...user, ...BUILTIN_ENTRIES]
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(b)
  return a.every((level) => set.has(level))
}

/**
 * Field block (10-space indent) carrying the declared levels and compat,
 * to be appended under a `models` list entry.
 */
function fieldBlock(entry: KnowledgeEntry): string {
  const lines: string[] = ['          reasoningEfforts:']
  for (const [level, wire] of Object.entries(entry.efforts)) {
    lines.push(`            ${level}: ${wire === null ? '' : JSON.stringify(wire)}`)
  }
  if (entry.compat !== undefined && Object.keys(entry.compat).length > 0) {
    lines.push('          compat:')
    if (entry.compat.thinkingFormat !== undefined) lines.push(`            thinkingFormat: ${JSON.stringify(entry.compat.thinkingFormat)}`)
    if (entry.compat.supportsReasoningEffort !== undefined) {
      lines.push(`            supportsReasoningEffort: ${String(entry.compat.supportsReasoningEffort)}`)
    }
  }
  return lines.join('\n')
}

/** Field-block template for a model the knowledge base does not know. */
function templateSnippet(): string {
  return [
    '          reasoningEfforts:',
    '            low: "low"        # 键 = DSH 档位体系（off/minimal/low/medium/high/xhigh/max）',
    '            high: "high"      # 值 = 端点实际接受的取值，请按端点文档填写',
    '          # 仅 OpenAI 兼容端点需要；端点不识别 reasoning_effort 时删除整块：',
    '          compat:',
    '            thinkingFormat: "openai"',
    '            supportsReasoningEffort: true',
  ].join('\n')
}

/** Scalar fields a `models` entry may carry that this plugin round-trips. */
const ENTRY_SCALAR_KEYS = new Set(['id', 'name', 'contextWindow', 'maxTokens'])

/**
 * Serialize the existing entry's scalar fields (6-space `- id:` line, then
 * 10-space fields). `complete` is false when the entry carries fields this
 * plugin cannot round-trip — the caller then falls back to insert-below mode
 * so no user data is ever dropped.
 */
function entryHead(existing: JsonObject | undefined, model: string): { lines: string[]; complete: boolean } {
  if (existing === undefined) return { lines: [`- id: ${model}`], complete: true }
  const extra = Object.keys(existing).filter((key) => !ENTRY_SCALAR_KEYS.has(key))
  const lines: string[] = [`- id: ${typeof existing.id === 'string' ? existing.id : model}`]
  if (typeof existing.name === 'string' && existing.name.length > 0) lines.push(`  name: ${JSON.stringify(existing.name)}`)
  if (typeof existing.contextWindow === 'number') lines.push(`  contextWindow: ${existing.contextWindow}`)
  if (typeof existing.maxTokens === 'number') lines.push(`  maxTokens: ${existing.maxTokens}`)
  return { lines, complete: extra.length === 0 }
}

export function apply(ctx: Context): void {
  const settings = ctx.get('settings') as HostSettingsService | undefined
  const llm = ctx.get('llm') as HostLlmService | undefined
  if (settings === undefined || llm === undefined) return
  // Aliased after the guard so closures below keep the narrowed types.
  const settingsService = settings
  const llmService = llm

  const store = settingsService.register(STORE_NS, StoreSchema) as SettingsScopeLike

  const readStore = (): StoreShape => {
    const value = store.get()
    return isRecord(value) ? (value as unknown as StoreShape) : {}
  }

  /** The settings.yaml path, memoized (the file provider names it once). */
  let settingsPathPromise: Promise<string | undefined> | undefined
  const settingsPath = (): Promise<string | undefined> => {
    settingsPathPromise ??= settingsService.prepareDocument().catch(() => undefined)
    return settingsPathPromise
  }

  /** Current directory levels for one model; [] when the model offers none. */
  async function currentLevels(provider: string, model: string): Promise<string[]> {
    try {
      const info = await llmService.resolveModelInfo(provider, model)
      return (info.reasoning?.efforts ?? []).map((effort) => effort.id)
    } catch {
      return []
    }
  }

  /** Whether the model appears in the user's own llm-pi-ai models list. */
  function userDeclaredModel(provider: string, model: string): { declared: boolean; entryLine: string; entry: JsonObject | undefined } {
    const descriptor = settingsService.describe().find((row) => row.ns === LLM_NS)
    const providers = isRecord(descriptor?.user) && isRecord((descriptor?.user as JsonObject).providers)
      ? (descriptor?.user as JsonObject).providers as JsonObject
      : {}
    const route = isRecord(providers[provider]) ? providers[provider] as JsonObject : undefined
    const models = route !== undefined && Array.isArray(route.models) ? (route.models as JsonObject[]) : undefined
    const entry = models?.find((candidate) => isRecord(candidate) && candidate.id === model)
    return {
      declared: entry !== undefined,
      entryLine: entry === undefined
        ? `- id: ${model}`
        : `- id: ${model}${typeof entry.name === 'string' && entry.name.length > 0 ? `  # ${entry.name}` : ''}`,
      entry,
    }
  }

  /**
   * Caveat for gateways whose OpenAI-compatible endpoint rejects the
   * `developer` message role. DSH's pi-ai detection treats these base URLs
   * as standard OpenAI (developer role enabled) and settings.yaml cannot
   * override it, so agent requests with a system prompt fail with
   * `invalid_parameter_error`. The guidance must warn instead of pretending
   * the declaration alone makes the route usable.
   */
  function endpointWarning(provider: string): string | null {
    try {
      const section = settingsService.get(LLM_NS)
      const route = isRecord(section) && isRecord((section as JsonObject).providers)
        ? (section as JsonObject).providers[provider] as JsonObject | undefined
        : undefined
      const baseURL = isRecord(route) && typeof route.baseURL === 'string' ? route.baseURL : ''
      if (baseURL.includes('maas.aliyuncs.com') || baseURL.includes('dashscope.aliyuncs.com')) {
        return '该端点是阿里云百炼的 OpenAI 兼容模式：DSH 会以 developer 角色发送系统提示，百炼会拒绝并返回 400（invalid_parameter_error），且 settings.yaml 目前无法覆盖该行为。建议改用内置 zai 路由（目录已自带 GLM-5.2 档位）或向 DSH 上游反馈支持 supportsDeveloperRole 配置。'
      }
      return null
    } catch {
      return null
    }
  }

  async function diagnose(provider: string, model: string): Promise<Guidance> {
    const storeShape = readStore()
    const entry = matchEntry(knowledgeOf(storeShape), provider, model)
    const current = await currentLevels(provider, model)
    const expected = entry === undefined ? [] : displayLevels(entry)
    const { declared, entryLine, entry: userEntry } = userDeclaredModel(provider, model)
    const path = await settingsPath()

    let reason: Guidance['reason'] = 'none'
    if (current.length === 0) {
      reason = 'missing'
    } else if (entry !== undefined && !sameSet(current, expected)) {
      reason = 'mismatch'
    }

    // Guidance targets custom-provider declarations only; the built-in
    // catalog's data — including deliberately sparse level sets — is trusted.
    const needsGuide = declared && reason !== 'none'

    const block = entry !== undefined
      ? fieldBlock(entry)
      : templateSnippet()

    // Replace mode: the snippet is the COMPLETE replacement entry (existing
    // scalar fields + declared levels), so "整行替换" cannot drop user data.
    // Insert mode: the entry carries fields this plugin cannot round-trip,
    // so only the field block is offered, to paste under the existing line.
    const head = entryHead(userEntry, model)
    const mode: Guidance['mode'] = head.complete ? 'replace' : 'insert'
    const snippet = head.complete ? `${head.lines.join('\n')}\n${block}` : block

    const note = entry === undefined
      ? '知识库未收录该模型，请按端点文档填写档位取值。'
      : entry.note

    const warning = endpointWarning(provider)

    return {
      provider,
      model,
      userDeclared: declared,
      needsGuide,
      reason,
      current,
      expected,
      matched: entry !== undefined,
      mode,
      note,
      warning,
      snippet,
      entryLine,
      entryPath: `${LLM_NS}.providers.${provider}.models`,
      settingsPath: path ?? null,
    }
  }

  // Only Web profiles provide `connection`; mount the channel there without
  // ever blocking this row in terminal-only profiles.
  ctx.inject(['connection'], (connectionCtx) => {
    const connection = connectionCtx.connection as HostConnection | undefined
    if (connection === undefined) return
    connection.rpc.handle(
      RPC_CHANNEL,
      async (endpoint, payload) => {
        switch (endpoint) {
          case 'diagnose': {
            const request = isRecord(payload) ? payload : {}
            const provider = typeof request.provider === 'string' ? request.provider : ''
            const model = typeof request.model === 'string' ? request.model : ''
            if (provider.length === 0 || model.length === 0) {
              return failResult('invalid-request', 'provider and model are required')
            }
            try {
              return okResult(await diagnose(provider, model))
            } catch (error) {
              return failResult('diagnose-failed', `diagnose failed: ${error instanceof Error ? error.message : String(error)}`)
            }
          }
          case 'store':
            return okResult({ entries: readStore().entries ?? [] })
          default:
            return failResult('not-found', `unknown endpoint ${JSON.stringify(endpoint)}`)
        }
      },
      { authority: 'loopback' },
    )
  })
}
