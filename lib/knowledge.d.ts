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
    readonly [level: string]: string | null;
}
/** One knowledge-base entry with provider/model glob matching. */
export interface KnowledgeEntry {
    /** Stable id shown in UI copy. */
    readonly id: string;
    /** Provider route pattern; `*` matches any route. */
    readonly provider: string;
    /** Model id pattern; `*` matches any run of characters. */
    readonly model: string;
    /** Human-readable provenance note shown in the guidance panel. */
    readonly note: string;
    /** Declared levels: display level -> endpoint wire value (`null` pins unsupported). */
    readonly efforts: KnowledgeEfforts;
    /** Wire compat hints; carried only onto `openai-completions` routes. */
    readonly compat?: {
        readonly thinkingFormat?: string;
        readonly supportsReasoningEffort?: boolean;
    };
}
/** Built-in entries; user entries (settings.yaml) take precedence. */
export declare const BUILTIN_ENTRIES: readonly KnowledgeEntry[];
/**
 * Find the most specific entry matching a provider/model pair.
 * Exact (non-wildcard) matches beat wildcard ones on each axis; user
 * entries are searched before built-in entries, so user overrides win.
 */
export declare function matchEntry(entries: readonly KnowledgeEntry[], provider: string, model: string): KnowledgeEntry | undefined;
/** Display levels (non-null) an entry offers, in declaration order. */
export declare function displayLevels(entry: KnowledgeEntry): string[];
