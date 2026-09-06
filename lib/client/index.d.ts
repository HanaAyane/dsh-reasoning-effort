import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Cordis service edges this half consumes. `modelDirectories.directoryFor()`
 * reaches `remote.session` internally from the slot's inject face, and the 0.1.2
 * client module system only exposes services a module declared here — an
 * undeclared read throws `cannot get property "remote.session" without inject`
 * inside the slot renderer, which crashes the entry and silently falls back to
 * the built-in model control. `remote` and `remote.session` are listed together
 * because the guard keys on the nested path, matching the built-in
 * `ui-model-selection` declaration for this same call.
 */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
