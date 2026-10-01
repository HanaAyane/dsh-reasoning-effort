import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types';
import type { ModelDirectory, ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { ReasoningEffortTranslate } from './locales.js';
export interface EffortLevel {
    readonly id: string;
    readonly name: string;
}
export type EffortSelection = ModelSelection & {
    readonly reasoningEffort: string;
};
export declare function currentModel(state: ModelDirectoryState): import("@deepseek-ai/dsh-api-session-controller/types").ModelCatalogModel | undefined;
export declare function sliderLevels(state: ModelDirectoryState): readonly EffortLevel[];
export declare function effortIndex(levels: readonly EffortLevel[], id: string | undefined): number;
export declare function clampIndex(value: number, count: number): number;
export declare function effectiveEffortIndex(levels: readonly EffortLevel[], state: ModelDirectoryState): number;
/**
 * The index the slider has to write back so the thumb stops describing a level
 * the session never received, or undefined when the session already holds one.
 *
 * The slider draws `effectiveEffortIndex`. A session with no effort for the
 * route therefore draws the adapter default or the middle notch while the
 * request carries nothing at all, and the backend then decides on its own.
 * Drawing a level is a claim that it is in effect, so the drawn level gets
 * submitted instead of only being painted.
 * @param levels - the levels the current model advertises.
 * @param state - the current directory projection.
 * @returns the index to submit, or undefined when nothing needs submitting.
 */
export declare function pendingEffortIndex(levels: readonly EffortLevel[], state: ModelDirectoryState): number | undefined;
/** Revalidate a captured route and effort ID, never a position in a new catalog. */
export declare function selectEffort(directory: ModelDirectory, target: EffortSelection, signal: AbortSignal, t: ReasoningEffortTranslate, timeoutMs?: number): Promise<ModelDirectoryState>;
