import type { RunnerFamily } from './runners.js';
interface Streak {
    start: number;
    end: number;
    y: number;
    height: number;
    opacity: number;
}
export declare function effectColor(family: RunnerFamily, isDark: boolean, index?: number): string;
export declare function drawRunnerStreak(context: CanvasRenderingContext2D, family: RunnerFamily, index: number, isDark: boolean, { start, end, y, height, opacity }: Streak): void;
export declare function drawDragTrail(context: CanvasRenderingContext2D, family: RunnerFamily, isDark: boolean, head: number, height: number, distance: number, amount: number): void;
export {};
