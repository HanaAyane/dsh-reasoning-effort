/**
 * Built-in model knowledge base for reasoning-effort guidance.
 *
 * Each entry names the display levels (`efforts` keys, the DSH level
 * universe) a model really offers and the wire value the endpoint accepts
 * (`efforts` values). Levels not named are pinned unsupported by
 * `dsh-llm-pi-ai`'s resolution, so an entry with `{ low, high }` offers
 * exactly those two and never a guessed third.
 *
 * The Host half uses these entries ONLY to generate copy-ready YAML for
 * custom-provider models the directory does not describe. It never writes
 * settings itself and never overrides catalog-declared levels.
 *
 * `compat` is only meaningful for `openai-completions` routes; the snippet
 * generator carries it onto those routes and drops it elsewhere.
 *
 * @module dsh-reasoning-effort/knowledge
 */

/** One selectable level declaration: display level -> wire value. */
export interface KnowledgeEfforts {
  readonly [level: string]: string | null
}

/** One knowledge-base entry with provider/model glob matching. */
export interface KnowledgeEntry {
  /** Stable id shown in UI copy. */
  readonly id: string
  /** Provider route pattern; `*` matches any route. */
  readonly provider: string
  /** Model id pattern; `*` matches any run of characters. */
  readonly model: string
  /** Human-readable provenance note shown in the guidance panel. */
  readonly note: string
  /** Declared levels: display level -> endpoint wire value (`null` pins unsupported). */
  readonly efforts: KnowledgeEfforts
  /** Wire compat hints; carried only onto `openai-completions` routes. */
  readonly compat?: {
    readonly thinkingFormat?: string
    readonly supportsReasoningEffort?: boolean
  }
}

/** Built-in entries; user entries (settings.yaml) take precedence. */
export const BUILTIN_ENTRIES: readonly KnowledgeEntry[] = [
  {
    id: 'glm-5.2',
    provider: '*',
    model: 'glm-5.2',
    note: 'GLM-5.2 原生档位 minimal / low / medium / high（智谱 z.ai 深度思考文档）；阿里云百炼 OpenAI 兼容端点实测接受这些取值。',
    efforts: {
      minimal: 'minimal',
      low: 'low',
      medium: 'medium',
      high: 'high',
    },
    compat: { thinkingFormat: 'openai', supportsReasoningEffort: true },
  },
  {
    id: 'kimi-k3',
    provider: '*',
    model: 'kimi/kimi-k3',
    note: 'Kimi K3 官方档位 low / high / max（Moonshot 思考力度文档），与 pi-ai 目录 moonshotai 条目一致。',
    efforts: {
      low: 'low',
      high: 'high',
      max: 'max',
    },
    compat: { thinkingFormat: 'openai', supportsReasoningEffort: true },
  },
  {
    id: 'kimi-k3-plain',
    provider: '*',
    model: 'kimi-k3',
    note: 'Kimi K3 官方档位 low / high / max（Moonshot 思考力度文档），与 pi-ai 目录 moonshotai 条目一致。',
    efforts: {
      low: 'low',
      high: 'high',
      max: 'max',
    },
    compat: { thinkingFormat: 'openai', supportsReasoningEffort: true },
  },
]

/** Compile a knowledge-base pattern (`*` wildcard) to an anchored RegExp. */
function patternRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/gu, '\\$&').replace(/\*/gu, '.*')
  return new RegExp(`^${escaped}$`, 'u')
}

/**
 * Find the most specific entry matching a provider/model pair.
 * Exact (non-wildcard) matches beat wildcard ones on each axis; user
 * entries are searched before built-in entries, so user overrides win.
 */
export function matchEntry(
  entries: readonly KnowledgeEntry[],
  provider: string,
  model: string,
): KnowledgeEntry | undefined {
  let best: KnowledgeEntry | undefined
  let bestScore = -1
  for (const entry of entries) {
    if (!patternRegExp(entry.provider).test(provider)) continue
    if (!patternRegExp(entry.model).test(model)) continue
    const score = (entry.provider.includes('*') ? 0 : 1) + (entry.model.includes('*') ? 0 : 1)
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }
  return best
}

/** Display levels (non-null) an entry offers, in declaration order. */
export function displayLevels(entry: KnowledgeEntry): string[] {
  return Object.entries(entry.efforts)
    .filter(([, wire]) => wire !== null)
    .map(([level]) => level)
}
