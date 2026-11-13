declare const modelTokens: {
    deepseek: RegExp;
    openai: RegExp;
    claude: RegExp;
    gemini: RegExp;
    grok: RegExp;
    kimi: RegExp;
    glm: RegExp;
    qwen: RegExp;
    minimax: RegExp;
};
export type RunnerFamily = keyof typeof modelTokens;
export declare const runnerSprites: {
    deepseek: {
        image: string;
        frames: number;
        family: "deepseek";
    };
    'deepseek-winter': {
        image: string;
        frames: number;
        family: "deepseek";
    };
    openai: {
        image: string;
        frames: number;
        family: "openai";
    };
    claude: {
        image: string;
        frames: number;
        family: "claude";
    };
    gemini: {
        image: string;
        frames: number;
        family: "gemini";
    };
    grok: {
        image: string;
        frames: number;
        family: "grok";
    };
    kimi: {
        image: string;
        frames: number;
        family: "kimi";
    };
    glm: {
        image: string;
        frames: number;
        family: "glm";
    };
    qwen: {
        image: string;
        frames: number;
        family: "qwen";
    };
    minimax: {
        image: string;
        frames: number;
        family: "minimax";
    };
};
export type RunnerId = keyof typeof runnerSprites;
export type RunnerPreference = RunnerId | 'auto' | 'off';
export declare const runnerIds: RunnerId[];
export declare const RUNNER_LOOP_MS = 720;
export declare const RUNNER_DRAG_LOOP_MS = 420;
export declare function detectModelFamily(modelId?: string, modelName?: string, provider?: string): RunnerFamily;
export declare function sliderAppearance(preference: RunnerPreference, modelFamily: RunnerFamily): {
    family: "deepseek" | "openai" | "claude" | "gemini" | "grok" | "kimi" | "glm" | "qwen" | "minimax";
    runner: undefined;
} | {
    family: "deepseek" | "openai" | "claude" | "gemini" | "grok" | "kimi" | "glm" | "qwen" | "minimax";
    runner: "deepseek" | "openai" | "claude" | "gemini" | "grok" | "kimi" | "glm" | "qwen" | "minimax" | "deepseek-winter";
};
export declare const RUNNER_STORAGE_KEY = "dsh-reasoning-effort.chibi-thumb";
export declare const RUNNER_SIZE_STORAGE_KEY = "dsh-reasoning-effort.runner-size";
export declare const RUNNER_SIZE: {
    readonly min: 50;
    readonly baseline: 50;
    readonly max: 125;
    readonly step: 5;
};
export declare function parseRunnerPreference(stored: string | null): RunnerPreference;
export declare function parseRunnerSize(stored: string | null): number;
export declare const runnerStore: {
    getSnapshot: () => RunnerPreference;
    getSize: () => number;
    subscribe(listener: () => void): () => boolean;
    set(next: RunnerPreference, persist?: boolean): void;
    setSize(value: number, persist?: boolean): void;
};
export {};
