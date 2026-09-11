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

/** The node request/response pair one Web prefix route owns. */
interface HostRouteRequest {
  readonly method?: string
  readonly url?: string
  readonly headers: Record<string, string | readonly string[] | undefined>
  on(event: 'data', listener: (chunk: Uint8Array) => void): void
  on(event: 'end', listener: () => void): void
  on(event: 'error', listener: (error: unknown) => void): void
}

interface HostRouteResponse {
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string): void
}

interface HostWebServer {
  register(route: {
    readonly kind: 'prefix'
    readonly path: string
    readonly handler: (request: HostRouteRequest, response: HostRouteResponse) => void | Promise<void>
  }): () => void
}

/**
 * The Host/Origin and browser-session fence the `/api` transport applies. This
 * channel reads it from the connection service so it stays exactly as
 * unreachable as the rest of the Host API.
 */
interface HostConnection {
  requestRejection(request: HostRouteRequest): 401 | 403 | undefined
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
  /** `replace` includes an entry head; `insert` contributes only the field block. */
  mode: 'replace' | 'insert'
  /** Built-in note key localized by the browser half. */
  noteKey: KnowledgeEntry['noteKey'] | null
  /** User-authored note shown verbatim; null for built-ins and unknown models. */
  note: string | null
  /** Stable endpoint caveat code localized by the browser half. */
  warning: 'developerRole' | null
  /** Existing entry head for replace mode; null for insert mode. */
  entryHead: string | null
  /** Locale-neutral exact declaration; null selects the localized generic template. */
  fieldBlock: string | null
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
  // `details` is part of the connection envelope: the browser half refuses a
  // failure whose details is not an object.
  return { ok: false, error: { code, message, details: {} } }
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** One decoded `client-request` envelope posted by the browser half. */
interface ClientRequestEnvelope {
  rpcId: string
  method: string
  payload?: unknown
}

/** Accept only the envelope fields this channel answers, mirroring the shared transport. */
function parseEnvelope(value: unknown): ClientRequestEnvelope | undefined {
  if (!isRecord(value) || value.type !== 'client-request') return undefined
  if (typeof value.rpcId !== 'string' || value.rpcId.length === 0) return undefined
  if (typeof value.method !== 'string' || value.method.length === 0) return undefined
  return { rpcId: value.rpcId, method: value.method, payload: value.payload }
}

/** One `server-response` envelope, the only body shape the browser half parses. */
function envelopeOf(rpcId: string, result: JsonObject): string {
  return JSON.stringify({ type: 'server-response', rpcId, result })
}

/** Endpoint segment the browser half addressed, e.g. `diagnose`. */
function endpointOf(url: string | undefined): string | undefined {
  if (url === undefined) return undefined
  const pathname = url.split('?')[0] ?? ''
  const prefix = `${RPC_CHANNEL}/`
  if (!pathname.startsWith(prefix)) return undefined
  const endpoint = pathname.slice(prefix.length)
  return /^[A-Za-z0-9_$.-]+$/u.test(endpoint) ? endpoint : undefined
}

/** Largest request body this channel accepts, in bytes. */
const MAX_REQUEST_BYTES = 64 * 1024

/** Read one JSON request body, refusing anything past {@link MAX_REQUEST_BYTES}. */
function readJsonBody(request: HostRouteRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = []
    const decoder = new TextDecoder()
    let bytes = 0
    request.on('data', (chunk) => {
      bytes += chunk.length
      if (bytes > MAX_REQUEST_BYTES) {
        reject(new Error('body too large'))
        return
      }
      // HTTP chunks can split a UTF-8 character; keep incomplete bytes for the next chunk.
      chunks.push(decoder.decode(chunk, { stream: true }))
    })
    request.on('end', () => {
      try {
        chunks.push(decoder.decode())
        resolve(JSON.parse(chunks.join('')))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('body is not JSON'))
      }
    })
    request.on('error', (error: unknown) => {
      reject(error instanceof Error ? error : new Error('request stream failed'))
    })
  })
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
   * `developer` message role. DSH's pi-ai detection treats a base URL it does
   * not recognize as standard OpenAI (developer role enabled, and overridable
   * through `compat.supportsDeveloperRole`), so an agent request carrying a
   * system prompt can fail with `invalid_parameter_error`. The two Aliyun MaaS
   * hosts below are the ones observed to answer that way; the code stays
   * endpoint-shaped so widening it is a new base URL, not new copy.
   */
  function endpointWarning(provider: string): Guidance['warning'] {
    try {
      const section = settingsService.get(LLM_NS)
      const route = isRecord(section) && isRecord((section as JsonObject).providers)
        ? (section as JsonObject).providers[provider] as JsonObject | undefined
        : undefined
      const baseURL = isRecord(route) && typeof route.baseURL === 'string' ? route.baseURL : ''
      if (baseURL.includes('maas.aliyuncs.com') || baseURL.includes('dashscope.aliyuncs.com')) {
        return 'developerRole'
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

    const block = entry === undefined ? null : fieldBlock(entry)

    // Replace mode carries the complete entry head and declared levels, so the
    // whole-entry replacement cannot drop user data.
    // Insert mode: the entry carries fields this plugin cannot round-trip,
    // so only the field block is offered, to paste under the existing line.
    const head = entryHead(userEntry, model)
    const mode: Guidance['mode'] = head.complete ? 'replace' : 'insert'
    const builtIn = entry !== undefined && BUILTIN_ENTRIES.includes(entry)
    const noteKey = builtIn ? entry.noteKey ?? null : null
    const note = entry !== undefined && !builtIn ? entry.note ?? null : null

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
      noteKey,
      note,
      warning,
      entryHead: head.complete ? head.lines.join('\n') : null,
      fieldBlock: block,
      entryLine,
      entryPath: `${LLM_NS}.providers.${provider}.models`,
      settingsPath: path ?? null,
    }
  }

  /** Answer one decoded endpoint with the result envelope the browser half parses. */
  async function answer(endpoint: string, payload: unknown): Promise<JsonObject> {
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
  }

  // Only Web profiles provide `connection`/`webServer`; mount the channel there
  // without ever blocking this row in terminal-only profiles.
  //
  // The channel is a plain loopback prefix route rather than
  // `connection.rpc.handle`: on DSH 0.1.5-rc.1 the connection plugin injects
  // only `credentials`, while `HostConnectionService.register` still reads
  // `owner.webServer` off its own context, so `rpc.handle` throws
  // `cannot get property "webServer" without inject` for EVERY caller — no
  // inject declaration of ours can repair it. Registering the route here and
  // asking the connection service for the same `requestRejection` fence keeps
  // the channel exactly as reachable as the shared `/api` transport, and keeps
  // the split working on builds where `rpc.handle` does register.
  ctx.inject(['connection', 'webServer'], (routeCtx) => {
    // `ctx.get` rather than the property proxy: both services are declared
    // above, so the callback only runs once they are active, and the global
    // store read is not sensitive to where in the fiber tree they were
    // provided.
    const connection = routeCtx.get('connection') as HostConnection | undefined
    const webServer = routeCtx.get('webServer') as HostWebServer | undefined
    if (connection === undefined || webServer === undefined) return
    routeCtx.effect(() => webServer.register({
      kind: 'prefix',
      path: RPC_CHANNEL,
      handler: async (request, response) => {
        const rejection = connection.requestRejection(request)
        if (rejection !== undefined) {
          response.writeHead(rejection)
          response.end(rejection === 401 ? 'unauthorized' : 'forbidden')
          return
        }
        const endpoint = endpointOf(request.url)
        if (request.method !== 'POST' || endpoint === undefined) {
          response.writeHead(404)
          response.end('not found')
          return
        }
        const mediaType = String(request.headers['content-type'] ?? '').split(';')[0]?.trim().toLowerCase()
        if (mediaType !== 'application/json') {
          response.writeHead(415)
          response.end('content type must be application/json')
          return
        }
        let body: unknown
        try {
          body = await readJsonBody(request)
        } catch {
          response.writeHead(400)
          response.end('body is not JSON')
          return
        }
        const message = parseEnvelope(body)
        if (message === undefined || message.method !== endpoint) {
          response.writeHead(400)
          response.end('invalid client-request message')
          return
        }
        response.writeHead(200, { 'content-type': 'application/json' })
        try {
          response.end(envelopeOf(message.rpcId, await answer(endpoint, message.payload)))
        } catch (error) {
          response.end(envelopeOf(message.rpcId, failResult(
            'channel-failed',
            `channel failed: ${error instanceof Error ? error.message : String(error)}`,
          )))
        }
      },
    }), 'reasoning-effort: rpc channel')
  })
}
