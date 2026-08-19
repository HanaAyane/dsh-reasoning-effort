import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export declare const inject: string[];
export type ModelThemeKind = 'deepseek' | 'openai' | 'claude' | 'gemini' | 'kimi' | 'glm' | 'qwen' | 'minimax';
/** Detect model theme: 'claude' for Claude/Anthropic, 'openai' for OpenAI/GPT/Codex, 'gemini' for Google/Gemini, 'kimi' for Moonshot/Kimi, 'glm' for Zhipu GLM/ZCode, 'qwen' for Alibaba Qwen/Tongyi, 'minimax' for MiniMax/Hailuo, 'deepseek' for others. */
export declare function detectModelTheme(provider?: string | null, modelId?: string | null, modelName?: string | null): ModelThemeKind;
export declare function apply(ctx: ClientContext): void;
