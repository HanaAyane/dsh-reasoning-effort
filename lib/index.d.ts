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
 *
 * > 🤖 AI-assisted notice: This project includes modifications reviewed and
 * >   refined with AI assistance. The macOS compatibility adaptations
 * >   (documentation, build verification) were AI-assisted.
 * >   本项目的 macOS 适配修改由 AI 辅助完成。
 * > （是 DeepSeek 写的喵～支持 DeepSeek Harenss 喵～）
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-reasoning-effort";
/**
 * Hard dependencies: the loader waits for these services before calling
 * `apply`, so the row never races the boot order of the base bundle rows.
 * `connection` is deliberately absent — only Web profiles provide it, so the
 * RPC channel is mounted through `ctx.inject` instead of blocking this row.
 */
export declare const inject: string[];
export declare function apply(ctx: Context): void;
