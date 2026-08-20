/**
 * Stylesheet for the reasoning-effort slider and the composer model seat.
 *
 * The slider visualizes whatever effort levels the current model exposes, so
 * the "peak intensity" effects key off the `[data-top]` existence flag the
 * component stamps on the highest level rather than any hardcoded effort id.
 *
 * Supports dynamic model-themed styles:
 * - DeepSeek (Classic Blue)
 * - OpenAI (Codex Violet / Purple)
 * - Claude (Anthropic Warm Terracotta Orange)
 * - Gemini (Google Star Nebula: Multi-Color Star Gradient with Deep Indigo Core)
 * - Kimi (Moonshot Starry Midnight Navy with Golden Constellation Accents)
 * - GLM (Zhipu GLM / ZCode Obsidian Jet Black with Cyber Cyan-Blue Accents)
 * - Qwen (Alibaba Qwen Ethereal Azure Sky Blue with Celestial Gold Accents)
 * - MiniMax (MiniMax / Hailuo Vibrant Coral Red-Orange with Sunset Peach Accents)
 *
 * @module dsh-reasoning-effort/client/styles
 */
import chibiRunnerSprite from '../../assets/chibi-runner-strip.png'
import gptRunnerSprite from '../../assets/gpt-runner-strip.png'
import claudeRunnerSprite from '../../assets/claude-runner-strip.png'
import geminiRunnerSprite from '../../assets/gemini-runner-strip.png'
import kimiRunnerSprite from '../../assets/kimi-runner-strip.png'
import glmRunnerSprite from '../../assets/glm-runner-strip.png'
import qwenRunnerSprite from '../../assets/qwen-runner-strip.png'
import minimaxRunnerSprite from '../../assets/minimax-runner-strip.png'

export const CSS = `
.re-effort {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: 32px;
  color: var(--dsw-alias-label-secondary);
  user-select: none;
  box-sizing: border-box;
}
.re-effort-slider {
  --re-progress: 50%;
  position: relative;
  width: 100%;
  height: 30px;
  flex: 1 1 auto;
  border-radius: 999px;
  isolation: isolate;
  transition: filter 180ms ease;
}
.re-effort-track {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  background: linear-gradient(100deg, #03040a 0%, #071126 22%, #101d4c 45%, #302262 70%, #5d35a0 100%);
  box-shadow:
    inset 0 1px 0 rgba(189, 199, 255, .15),
    inset 0 -1px 0 rgba(0, 0, 0, .55),
    0 3px 10px rgba(12, 17, 55, .34);
}
.re-effort-track::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 45%, rgba(82, 130, 255, .12), transparent 24%),
    linear-gradient(90deg, rgba(0, 0, 0, .28), transparent 42%, rgba(168, 113, 255, .12));
  pointer-events: none;
}
.re-effort-fx {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}
.re-effort-canvas {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  image-rendering: pixelated;
  mix-blend-mode: screen;
  transition: filter 140ms ease;
}
.re-effort-flare {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: var(--re-progress);
  width: 78px;
  height: 46px;
  border-radius: 50%;
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.96) 0 4%, rgba(188,189,255,.8) 11%, rgba(106,87,255,.5) 28%, rgba(105,31,255,.2) 49%, transparent 74%);
  filter: blur(2px) saturate(1.25);
  mix-blend-mode: screen;
  transform: translate(-100%, -50%);
  transition: left 70ms linear, filter 140ms ease;
  pointer-events: none;
}
.re-effort-flare::before,
.re-effort-flare::after {
  content: "";
  position: absolute;
  inset: 50% auto auto 100%;
  border-radius: 999px;
  transform: translate(-50%, -50%);
}
.re-effort-flare::before {
  width: 52px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(100,160,255,.42), #f1ecff, rgba(193,82,255,.65), transparent);
  box-shadow: 0 0 7px #9b7cff, 0 0 13px rgba(72,132,255,.64);
}
.re-effort-flare::after {
  width: 1px;
  height: 20px;
  background: linear-gradient(180deg, transparent, rgba(196,190,255,.84), transparent);
  box-shadow: 0 0 7px #9c7cff;
}
.re-effort-knob {
  position: absolute;
  z-index: 4;
  top: 50%;
  left: clamp(14px, var(--re-progress), calc(100% - 14px));
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255,255,255,.94);
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 0 2px rgba(92,105,255,.12),
    0 0 14px rgba(121,82,255,.48),
    0 2px 7px rgba(0,0,0,.3);
  transform: translate(-50%, -50%);
  transition: left 190ms cubic-bezier(.22,1,.36,1), transform 160ms ease, box-shadow 180ms ease;
  pointer-events: none;
}
.re-effort.is-chibi {
  height: 56px;
}
.re-effort.is-chibi .re-effort-knob {
  left: clamp(10px, var(--re-progress), calc(100% - 10px));
  width: 40px;
  height: 55px;
  border: 0;
  border-radius: 8px;
  background-color: transparent;
  background-image: url("${chibiRunnerSprite}");
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 800% 100%;
  box-shadow: none !important;
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 5px rgba(92, 105, 255, .34));
  animation: re-chibi-run 720ms step-end infinite;
  transform-origin: 50% 68%;
}
.re-effort.is-chibi.is-dragging .re-effort-knob {
  animation-duration: 420ms;
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 8px rgba(87, 137, 255, .68));
}
.re-effort-input {
  position: absolute;
  z-index: 5;
  inset: -5px 0;
  width: 100%;
  height: calc(100% + 10px);
  margin: 0;
  opacity: 0;
  cursor: grab;
  touch-action: none;
}
.re-effort-input:active { cursor: grabbing; }
.re-effort-input:focus-visible + .re-effort-knob {
  outline: 2px solid var(--dsw-static-blue-400);
  outline-offset: 2px;
}
.re-effort.is-dragging .re-effort-canvas {
  filter: saturate(1.45) brightness(1.28) contrast(1.06);
}
.re-effort.is-dragging .re-effort-flare {
  filter: blur(1.5px) saturate(1.6) brightness(1.42);
  transition: none;
}
.re-effort.is-dragging .re-effort-knob {
  transform: translate(-50%, -50%) scale(1.07);
  transition: none;
  box-shadow:
    0 0 0 3px rgba(113,115,255,.25),
    0 0 20px rgba(74,145,255,.86),
    0 0 31px rgba(171,53,255,.66),
    0 3px 8px rgba(0,0,0,.32);
}
.re-effort-slider[data-top] .re-effort-track {
  animation: re-effort-dark-breathe 1.9s ease-in-out infinite;
}
.re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(119,99,255,.18),
    0 0 22px rgba(135,78,255,.76),
    0 0 34px rgba(53,121,255,.34),
    0 3px 8px rgba(0,0,0,.3);
}
.re-effort.is-error .re-effort-slider {
  outline: 1px solid var(--dsw-alias-state-error-secondary);
  outline-offset: 2px;
}
.re-effort.is-busy { opacity: .72; }
.re-effort-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ==================== OpenAI / GPT Purple Theme ==================== */
.re-effort[data-re-theme="openai"].is-chibi .re-effort-knob,
.re-effort.theme-openai.is-chibi .re-effort-knob {
  background-image: url("${gptRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 6px rgba(165, 75, 255, .45));
}
.re-effort[data-re-theme="openai"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-openai.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 10px rgba(185, 95, 255, .82));
}

.re-effort[data-re-theme="openai"] .re-effort-track,
.re-effort.theme-openai .re-effort-track {
  background: linear-gradient(100deg, #090214 0%, #17072e 22%, #2c0f5e 45%, #4e1896 70%, #7c2ae8 100%);
  box-shadow:
    inset 0 1px 0 rgba(225, 189, 255, .2),
    inset 0 -1px 0 rgba(0, 0, 0, .55),
    0 3px 10px rgba(28, 9, 45, .4);
}
.re-effort[data-re-theme="openai"] .re-effort-track::after,
.re-effort.theme-openai .re-effort-track::after {
  background:
    radial-gradient(circle at 18% 45%, rgba(180, 82, 255, .16), transparent 24%),
    linear-gradient(90deg, rgba(0, 0, 0, .28), transparent 42%, rgba(215, 113, 255, .15));
}
.re-effort[data-re-theme="openai"] .re-effort-flare,
.re-effort.theme-openai .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(232,192,255,.86) 11%, rgba(175,85,255,.55) 28%, rgba(150,30,255,.22) 49%, transparent 74%);
}
.re-effort[data-re-theme="openai"] .re-effort-flare::before,
.re-effort.theme-openai .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(185,100,255,.45), #faecff, rgba(220,82,255,.7), transparent);
  box-shadow: 0 0 7px #ba7cff, 0 0 13px rgba(175,72,255,.7);
}
.re-effort[data-re-theme="openai"] .re-effort-flare::after,
.re-effort.theme-openai .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(235,190,255,.9), transparent);
  box-shadow: 0 0 7px #bc7cff;
}
.re-effort[data-re-theme="openai"] .re-effort-knob,
.re-effort.theme-openai .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(175,92,255,.15),
    0 0 14px rgba(185,82,255,.55),
    0 2px 7px rgba(0,0,0,.3);
}
.re-effort[data-re-theme="openai"].is-dragging .re-effort-knob,
.re-effort.theme-openai.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(195,113,255,.3),
    0 0 20px rgba(190,74,255,.9),
    0 0 31px rgba(225,53,255,.7),
    0 3px 8px rgba(0,0,0,.32);
}
.re-effort[data-re-theme="openai"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-openai .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-purple-breathe;
}
.re-effort[data-re-theme="openai"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-openai .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(190,99,255,.22),
    0 0 22px rgba(195,78,255,.85),
    0 0 34px rgba(175,53,255,.45),
    0 3px 8px rgba(0,0,0,.3);
}

.re-model-root[data-re-theme="openai"] .re-model-effort,
.re-model-root[data-re-theme="openai"] .re-model-row-effort,
.re-model-root[data-re-theme="openai"] .re-model-check,
.re-model-root.theme-openai .re-model-effort,
.re-model-root.theme-openai .re-model-row-effort,
.re-model-root.theme-openai .re-model-check {
  color: #9353ff;
}
.re-model-root[data-re-theme="openai"] .re-adapt-arrow,
.re-model-root[data-re-theme="openai"] .re-adapt-open,
.re-model-root[data-re-theme="openai"] .re-adapt-apply,
.re-model-root.theme-openai .re-adapt-arrow,
.re-model-root.theme-openai .re-adapt-open,
.re-model-root.theme-openai .re-adapt-apply {
  color: #9353ff;
}
.re-model-root[data-re-theme="openai"] .re-adapt-open,
.re-model-root[data-re-theme="openai"] .re-adapt-apply,
.re-model-root.theme-openai .re-adapt-open,
.re-model-root.theme-openai .re-adapt-apply {
  background: #8b44ff;
  color: #fff;
}

/* ==================== Claude / Anthropic Orange Theme ==================== */
.re-effort[data-re-theme="claude"].is-chibi .re-effort-knob,
.re-effort.theme-claude.is-chibi .re-effort-knob {
  background-image: url("${claudeRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 6px rgba(245, 120, 35, .48));
}
.re-effort[data-re-theme="claude"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-claude.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 10px rgba(255, 140, 50, .85));
}

.re-effort[data-re-theme="claude"] .re-effort-track,
.re-effort.theme-claude .re-effort-track {
  background: linear-gradient(100deg, #120601 0%, #260f04 22%, #522108 45%, #8c3b10 70%, #d96323 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 215, 189, .22),
    inset 0 -1px 0 rgba(0, 0, 0, .55),
    0 3px 10px rgba(55, 22, 10, .4);
}
.re-effort[data-re-theme="claude"] .re-effort-track::after,
.re-effort.theme-claude .re-effort-track::after {
  background:
    radial-gradient(circle at 18% 45%, rgba(255, 130, 60, .16), transparent 24%),
    linear-gradient(90deg, rgba(0, 0, 0, .28), transparent 42%, rgba(255, 150, 70, .15));
}
.re-effort[data-re-theme="claude"] .re-effort-flare,
.re-effort.theme-claude .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(255,225,190,.86) 11%, rgba(255,140,60,.58) 28%, rgba(220,70,10,.25) 49%, transparent 74%);
}
.re-effort[data-re-theme="claude"] .re-effort-flare::before,
.re-effort.theme-claude .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(255,150,60,.45), #fff6ee, rgba(255,110,30,.72), transparent);
  box-shadow: 0 0 7px #ff8c3a, 0 0 13px rgba(255,120,40,.72);
}
.re-effort[data-re-theme="claude"] .re-effort-flare::after,
.re-effort.theme-claude .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,220,180,.9), transparent);
  box-shadow: 0 0 7px #ff8c3a;
}
.re-effort[data-re-theme="claude"] .re-effort-knob,
.re-effort.theme-claude .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(255,130,60,.16),
    0 0 14px rgba(255,110,40,.55),
    0 2px 7px rgba(0,0,0,.3);
}
.re-effort[data-re-theme="claude"].is-dragging .re-effort-knob,
.re-effort.theme-claude.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(255,140,70,.32),
    0 0 20px rgba(255,110,30,.92),
    0 0 31px rgba(255,80,10,.72),
    0 3px 8px rgba(0,0,0,.32);
}
.re-effort[data-re-theme="claude"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-claude .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-orange-breathe;
}
.re-effort[data-re-theme="claude"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-claude .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(255,140,60,.24),
    0 0 22px rgba(255,110,30,.88),
    0 0 34px rgba(255,75,10,.48),
    0 3px 8px rgba(0,0,0,.3);
}

.re-model-root[data-re-theme="claude"] .re-model-effort,
.re-model-root[data-re-theme="claude"] .re-model-row-effort,
.re-model-root[data-re-theme="claude"] .re-model-check,
.re-model-root.theme-claude .re-model-effort,
.re-model-root.theme-claude .re-model-row-effort,
.re-model-root.theme-claude .re-model-check {
  color: #e06c28;
}
.re-model-root[data-re-theme="claude"] .re-adapt-arrow,
.re-model-root[data-re-theme="claude"] .re-adapt-open,
.re-model-root[data-re-theme="claude"] .re-adapt-apply,
.re-model-root.theme-claude .re-adapt-arrow,
.re-model-root.theme-claude .re-adapt-open,
.re-model-root.theme-claude .re-adapt-apply {
  color: #e06c28;
}
.re-model-root[data-re-theme="claude"] .re-adapt-open,
.re-model-root[data-re-theme="claude"] .re-adapt-apply,
.re-model-root.theme-claude .re-adapt-open,
.re-model-root.theme-claude .re-adapt-apply {
  background: #d96523;
  color: #fff;
}

/* ==================== Gemini Star Nebula / Quad-Color Rainbow Theme ==================== */
.re-effort[data-re-theme="gemini"].is-chibi .re-effort-knob,
.re-effort.theme-gemini.is-chibi .re-effort-knob {
  background-image: url("${geminiRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 6px rgba(140, 70, 255, .55));
}
.re-effort[data-re-theme="gemini"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-gemini.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 10px rgba(160, 90, 255, .9));
}

/* Gemini Dark Mode: Deep Cosmic Base layered with Amber -> Emerald -> Blue -> Deep Violet -> Coral Pink */
.re-effort[data-re-theme="gemini"] .re-effort-track,
.re-effort.theme-gemini .re-effort-track {
  background: linear-gradient(100deg, #120902 0%, #061c14 18%, #08224d 38%, #2a105c 64%, #5a146e 84%, #84184c 100%);
  box-shadow:
    inset 0 1px 0 rgba(230, 205, 255, .2),
    inset 0 -1px 0 rgba(0, 0, 0, .6),
    0 3px 10px rgba(22, 8, 45, .45);
}
.re-effort[data-re-theme="gemini"] .re-effort-track::after,
.re-effort.theme-gemini .re-effort-track::after {
  background:
    radial-gradient(circle at 18% 45%, rgba(245, 158, 11, .15), transparent 22%),
    radial-gradient(circle at 45% 55%, rgba(16, 185, 129, .14), transparent 25%),
    linear-gradient(90deg, rgba(0, 0, 0, .3), transparent 38%, rgba(66, 133, 244, .18) 65%, rgba(235, 68, 90, .15) 100%);
}
.re-effort[data-re-theme="gemini"] .re-effort-flare,
.re-effort.theme-gemini .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(235,220,255,.88) 11%, rgba(140,90,255,.55) 28%, rgba(66,133,244,.25) 49%, transparent 74%);
}
.re-effort[data-re-theme="gemini"] .re-effort-flare::before,
.re-effort.theme-gemini .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(245,158,11,.4), #fff8f0, rgba(66,133,244,.65), rgba(235,68,90,.7), transparent);
  box-shadow: 0 0 7px #9333ea, 0 0 13px rgba(66,133,244,.65);
}
.re-effort[data-re-theme="gemini"] .re-effort-flare::after,
.re-effort.theme-gemini .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(240,225,255,.9), transparent);
  box-shadow: 0 0 7px #9333ea;
}
.re-effort[data-re-theme="gemini"] .re-effort-knob,
.re-effort.theme-gemini .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(140,80,245,.15),
    0 0 14px rgba(120,60,230,.52),
    0 2px 7px rgba(0,0,0,.3);
}
.re-effort[data-re-theme="gemini"].is-dragging .re-effort-knob,
.re-effort.theme-gemini.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(155,95,255,.3),
    0 0 20px rgba(130,70,245,.9),
    0 0 31px rgba(66,133,244,.7),
    0 3px 8px rgba(0,0,0,.32);
}
.re-effort[data-re-theme="gemini"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-gemini .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-gemini-breathe;
}
.re-effort[data-re-theme="gemini"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-gemini .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(150,90,255,.22),
    0 0 22px rgba(135,70,245,.85),
    0 0 34px rgba(66,133,244,.45),
    0 3px 8px rgba(0,0,0,.3);
}

.re-model-root[data-re-theme="gemini"] .re-model-effort,
.re-model-root[data-re-theme="gemini"] .re-model-row-effort,
.re-model-root[data-re-theme="gemini"] .re-model-check,
.re-model-root.theme-gemini .re-model-effort,
.re-model-root.theme-gemini .re-model-row-effort,
.re-model-root.theme-gemini .re-model-check {
  color: #8247e5;
}
.re-model-root[data-re-theme="gemini"] .re-adapt-arrow,
.re-model-root[data-re-theme="gemini"] .re-adapt-open,
.re-model-root[data-re-theme="gemini"] .re-adapt-apply,
.re-model-root.theme-gemini .re-adapt-arrow,
.re-model-root.theme-gemini .re-adapt-open,
.re-model-root.theme-gemini .re-adapt-apply {
  color: #8247e5;
}
.re-model-root[data-re-theme="gemini"] .re-adapt-open,
.re-model-root[data-re-theme="gemini"] .re-adapt-apply,
.re-model-root.theme-gemini .re-adapt-open,
.re-model-root.theme-gemini .re-adapt-apply {
  background: linear-gradient(90deg, #6c2bd9 0%, #8247e5 100%);
  color: #fff;
}

/* ==================== Kimi / Moonshot Midnight Starry Navy Theme ==================== */
.re-effort[data-re-theme="kimi"].is-chibi .re-effort-knob,
.re-effort.theme-kimi.is-chibi .re-effort-knob {
  background-image: url("${kimiRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .32))
    drop-shadow(0 0 6px rgba(95, 125, 245, .55))
    drop-shadow(0 0 10px rgba(245, 205, 100, .25));
}
.re-effort[data-re-theme="kimi"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-kimi.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .35))
    drop-shadow(0 0 10px rgba(110, 145, 255, .85))
    drop-shadow(0 0 16px rgba(255, 215, 110, .45));
}

/* Kimi Dark Mode: Starry Midnight Navy to Celestial Starlight Blue & Golden Constellation accents */
.re-effort[data-re-theme="kimi"] .re-effort-track,
.re-effort.theme-kimi .re-effort-track {
  background: linear-gradient(90deg, #090c1e 0%, #121838 25%, #1d2757 55%, #2c3c84 80%, #4359b8 100%);
  box-shadow:
    inset 0 1px 0 rgba(220, 230, 255, .18),
    inset 0 -1px 0 rgba(0, 0, 0, .6),
    0 3px 10px rgba(12, 18, 48, .45);
}
.re-effort[data-re-theme="kimi"] .re-effort-track::after,
.re-effort.theme-kimi .re-effort-track::after {
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 220, 120, .12), transparent 22%),
    radial-gradient(circle at 75% 45%, rgba(140, 175, 255, .16), transparent 28%),
    linear-gradient(90deg, rgba(0, 0, 0, .32), transparent 35%, rgba(85, 120, 245, .18) 70%, rgba(255, 215, 105, .2) 100%);
}
.re-effort[data-re-theme="kimi"] .re-effort-flare,
.re-effort.theme-kimi .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(225,235,255,.88) 12%, rgba(100,135,245,.55) 30%, rgba(255,215,105,.28) 50%, transparent 74%);
}
.re-effort[data-re-theme="kimi"] .re-effort-flare::before,
.re-effort.theme-kimi .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(140,175,255,.5), #ffffff, rgba(255,225,140,.75), transparent);
  box-shadow: 0 0 7px #5c74e8, 0 0 13px rgba(255,215,105,.6);
}
.re-effort[data-re-theme="kimi"] .re-effort-flare::after,
.re-effort.theme-kimi .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(235,242,255,.9), transparent);
  box-shadow: 0 0 7px #5c74e8;
}
.re-effort[data-re-theme="kimi"] .re-effort-knob,
.re-effort.theme-kimi .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(100,135,245,.16),
    0 0 14px rgba(85,120,235,.55),
    0 2px 7px rgba(0,0,0,.35);
}
.re-effort[data-re-theme="kimi"].is-dragging .re-effort-knob,
.re-effort.theme-kimi.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(120,155,255,.32),
    0 0 20px rgba(95,130,245,.92),
    0 0 30px rgba(255,215,105,.5),
    0 3px 8px rgba(0,0,0,.35);
}
.re-effort[data-re-theme="kimi"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-kimi .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-kimi-breathe;
}
.re-effort[data-re-theme="kimi"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-kimi .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(120,155,255,.25),
    0 0 22px rgba(95,130,245,.85),
    0 0 34px rgba(255,215,105,.55),
    0 3px 8px rgba(0,0,0,.32);
}

.re-model-root[data-re-theme="kimi"] .re-model-effort,
.re-model-root[data-re-theme="kimi"] .re-model-row-effort,
.re-model-root[data-re-theme="kimi"] .re-model-check,
.re-model-root.theme-kimi .re-model-effort,
.re-model-root.theme-kimi .re-model-row-effort,
.re-model-root.theme-kimi .re-model-check {
  color: #5c74e8;
}
.re-model-root[data-re-theme="kimi"] .re-adapt-arrow,
.re-model-root[data-re-theme="kimi"] .re-adapt-open,
.re-model-root[data-re-theme="kimi"] .re-adapt-apply,
.re-model-root.theme-kimi .re-adapt-arrow,
.re-model-root.theme-kimi .re-adapt-open,
.re-model-root.theme-kimi .re-adapt-apply {
  color: #5c74e8;
}
.re-model-root[data-re-theme="kimi"] .re-adapt-open,
.re-model-root[data-re-theme="kimi"] .re-adapt-apply,
.re-model-root.theme-kimi .re-adapt-open,
.re-model-root.theme-kimi .re-adapt-apply {
  background: linear-gradient(90deg, #3d4fad 0%, #5c74e8 100%);
  color: #fff;
}

/* GLM / ZCode Chibi Runner Knob */
.re-effort[data-re-theme="glm"].is-chibi .re-effort-knob,
.re-effort.theme-glm.is-chibi .re-effort-knob {
  background-image: url("${glmRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .38))
    drop-shadow(0 0 6px rgba(56, 189, 248, .5))
    drop-shadow(0 0 10px rgba(14, 165, 233, .25));
}
.re-effort[data-re-theme="glm"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-glm.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .42))
    drop-shadow(0 0 10px rgba(56, 189, 248, .85))
    drop-shadow(0 0 16px rgba(34, 211, 238, .45));
}

/* GLM Dark Mode: Obsidian Jet Black to Cyan-Teal & Cyber Starlight accents */
.re-effort[data-re-theme="glm"] .re-effort-track,
.re-effort.theme-glm .re-effort-track {
  background: linear-gradient(90deg, #05070c 0%, #0b111c 25%, #111d2e 55%, #182b45 80%, #223f66 100%);
  box-shadow:
    inset 0 1px 0 rgba(186, 230, 253, .16),
    inset 0 -1px 0 rgba(0, 0, 0, .65),
    0 3px 10px rgba(5, 10, 20, .5);
}
.re-effort[data-re-theme="glm"] .re-effort-track::after,
.re-effort.theme-glm .re-effort-track::after {
  background:
    radial-gradient(circle at 18% 50%, rgba(56, 189, 248, .12), transparent 22%),
    radial-gradient(circle at 75% 45%, rgba(14, 165, 233, .15), transparent 28%),
    linear-gradient(90deg, rgba(0, 0, 0, .35), transparent 35%, rgba(34, 211, 238, .15) 70%, rgba(56, 189, 248, .2) 100%);
}
.re-effort[data-re-theme="glm"] .re-effort-flare,
.re-effort.theme-glm .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(224,242,254,.88) 12%, rgba(56,189,248,.55) 30%, rgba(14,165,233,.25) 50%, transparent 74%);
}
.re-effort[data-re-theme="glm"] .re-effort-flare::before,
.re-effort.theme-glm .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(56,189,248,.5), #ffffff, rgba(186,230,253,.75), transparent);
  box-shadow: 0 0 7px #0284c7, 0 0 13px rgba(56,189,248,.6);
}
.re-effort[data-re-theme="glm"] .re-effort-flare::after,
.re-effort.theme-glm .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(224,242,254,.9), transparent);
  box-shadow: 0 0 7px #0284c7;
}
.re-effort[data-re-theme="glm"] .re-effort-knob,
.re-effort.theme-glm .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(56,189,248,.16),
    0 0 14px rgba(14,165,233,.55),
    0 2px 7px rgba(0,0,0,.4);
}
.re-effort[data-re-theme="glm"].is-dragging .re-effort-knob,
.re-effort.theme-glm.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(56,189,248,.32),
    0 0 20px rgba(14,165,233,.92),
    0 0 30px rgba(34,211,238,.5),
    0 3px 8px rgba(0,0,0,.4);
}
.re-effort[data-re-theme="glm"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-glm .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-glm-breathe;
}
.re-effort[data-re-theme="glm"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-glm .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(56,189,248,.25),
    0 0 22px rgba(14,165,233,.85),
    0 0 34px rgba(34,211,238,.55),
    0 3px 8px rgba(0,0,0,.35);
}

.re-model-root[data-re-theme="glm"] .re-model-effort,
.re-model-root[data-re-theme="glm"] .re-model-row-effort,
.re-model-root[data-re-theme="glm"] .re-model-check,
.re-model-root.theme-glm .re-model-effort,
.re-model-root.theme-glm .re-model-row-effort,
.re-model-root.theme-glm .re-model-check {
  color: #0ea5e9;
}
.re-model-root[data-re-theme="glm"] .re-adapt-arrow,
.re-model-root[data-re-theme="glm"] .re-adapt-open,
.re-model-root[data-re-theme="glm"] .re-adapt-apply,
.re-model-root.theme-glm .re-adapt-arrow,
.re-model-root.theme-glm .re-adapt-open,
.re-model-root.theme-glm .re-adapt-apply {
  color: #0ea5e9;
}
.re-model-root[data-re-theme="glm"] .re-adapt-open,
.re-model-root[data-re-theme="glm"] .re-adapt-apply,
.re-model-root.theme-glm .re-adapt-open,
.re-model-root.theme-glm .re-adapt-apply {
  background: linear-gradient(90deg, #0369a1 0%, #0ea5e9 100%);
  color: #fff;
}

/* Qwen / 通义千问 Ethereal Azure Sky Blue Chibi Runner Knob */
.re-effort[data-re-theme="qwen"].is-chibi .re-effort-knob,
.re-effort.theme-qwen.is-chibi .re-effort-knob {
  background-image: url("${qwenRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .32))
    drop-shadow(0 0 6px rgba(96, 165, 250, .55))
    drop-shadow(0 0 10px rgba(251, 191, 36, .25));
}
.re-effort[data-re-theme="qwen"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-qwen.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .35))
    drop-shadow(0 0 10px rgba(120, 180, 255, .85))
    drop-shadow(0 0 16px rgba(251, 191, 36, .45));
}

/* Qwen Dark Mode: Lighter Ethereal Azure Sky Blue to Royal Sapphire with Starlight Gold accents */
.re-effort[data-re-theme="qwen"] .re-effort-track,
.re-effort.theme-qwen .re-effort-track {
  background: linear-gradient(90deg, #0c1538 0%, #162862 25%, #244598 55%, #386ad4 80%, #5f9ef8 100%);
  box-shadow:
    inset 0 1px 0 rgba(220, 235, 255, .2),
    inset 0 -1px 0 rgba(0, 0, 0, .55),
    0 3px 10px rgba(15, 25, 65, .42);
}
.re-effort[data-re-theme="qwen"] .re-effort-track::after,
.re-effort.theme-qwen .re-effort-track::after {
  background:
    radial-gradient(circle at 18% 50%, rgba(251, 191, 36, .12), transparent 22%),
    radial-gradient(circle at 75% 45%, rgba(147, 197, 253, .18), transparent 28%),
    linear-gradient(90deg, rgba(0, 0, 0, .3), transparent 35%, rgba(96, 165, 250, .2) 70%, rgba(251, 191, 36, .2) 100%);
}
.re-effort[data-re-theme="qwen"] .re-effort-flare,
.re-effort.theme-qwen .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(219,234,254,.88) 12%, rgba(96,165,250,.55) 30%, rgba(251,191,36,.28) 50%, transparent 74%);
}
.re-effort[data-re-theme="qwen"] .re-effort-flare::before,
.re-effort.theme-qwen .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(147,197,253,.5), #ffffff, rgba(253,230,138,.75), transparent);
  box-shadow: 0 0 7px #3b82f6, 0 0 13px rgba(251,191,36,.6);
}
.re-effort[data-re-theme="qwen"] .re-effort-flare::after,
.re-effort.theme-qwen .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(239,246,255,.9), transparent);
  box-shadow: 0 0 7px #3b82f6;
}
.re-effort[data-re-theme="qwen"] .re-effort-knob,
.re-effort.theme-qwen .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(96,165,250,.18),
    0 0 14px rgba(59,130,246,.55),
    0 2px 7px rgba(0,0,0,.32);
}
.re-effort[data-re-theme="qwen"].is-dragging .re-effort-knob,
.re-effort.theme-qwen.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(147,197,253,.32),
    0 0 20px rgba(59,130,246,.92),
    0 0 30px rgba(251,191,36,.5),
    0 3px 8px rgba(0,0,0,.32);
}
.re-effort[data-re-theme="qwen"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-qwen .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-qwen-breathe;
}
.re-effort[data-re-theme="qwen"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-qwen .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(147,197,253,.25),
    0 0 22px rgba(59,130,246,.85),
    0 0 34px rgba(251,191,36,.55),
    0 3px 8px rgba(0,0,0,.3);
}

.re-model-root[data-re-theme="qwen"] .re-model-effort,
.re-model-root[data-re-theme="qwen"] .re-model-row-effort,
.re-model-root[data-re-theme="qwen"] .re-model-check,
.re-model-root.theme-qwen .re-model-effort,
.re-model-root.theme-qwen .re-model-row-effort,
.re-model-root.theme-qwen .re-model-check {
  color: #3b82f6;
}
.re-model-root[data-re-theme="qwen"] .re-adapt-arrow,
.re-model-root[data-re-theme="qwen"] .re-adapt-open,
.re-model-root[data-re-theme="qwen"] .re-adapt-apply,
.re-model-root.theme-qwen .re-adapt-arrow,
.re-model-root.theme-qwen .re-adapt-open,
.re-model-root.theme-qwen .re-adapt-apply {
  color: #3b82f6;
}
.re-model-root[data-re-theme="qwen"] .re-adapt-open,
.re-model-root[data-re-theme="qwen"] .re-adapt-apply,
.re-model-root.theme-qwen .re-adapt-open,
.re-model-root.theme-qwen .re-adapt-apply {
  background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
  color: #fff;
}

/* MiniMax / Hailuo Vibrant Coral Orange Chibi Runner Knob */
.re-effort[data-re-theme="minimax"].is-chibi .re-effort-knob,
.re-effort.theme-minimax.is-chibi .re-effort-knob {
  background-image: url("${minimaxRunnerSprite}");
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 6px rgba(255, 107, 74, .68))
    drop-shadow(0 0 12px rgba(255, 145, 110, .4));
}
.re-effort[data-re-theme="minimax"].is-chibi.is-dragging .re-effort-knob,
.re-effort.theme-minimax.is-chibi.is-dragging .re-effort-knob {
  filter:
    drop-shadow(0 2px 1px rgba(0, 0, 0, .32))
    drop-shadow(0 0 10px rgba(255, 115, 75, .95))
    drop-shadow(0 0 18px rgba(255, 160, 122, .6));
}

/* MiniMax Dark Mode: Warm Luminous Amber to Vibrant Sunset Peach-Coral Orange */
.re-effort[data-re-theme="minimax"] .re-effort-track,
.re-effort.theme-minimax .re-effort-track {
  background: linear-gradient(90deg, #24090b 0%, #521312 22%, #99281a 48%, #e04424 74%, #ff6f43 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 218, 205, .25),
    inset 0 -1px 0 rgba(0, 0, 0, .55),
    0 3px 10px rgba(70, 18, 12, .45);
}
.re-effort[data-re-theme="minimax"] .re-effort-track::after,
.re-effort.theme-minimax .re-effort-track::after {
  background:
    radial-gradient(circle at 18% 50%, rgba(255, 145, 110, .22), transparent 22%),
    radial-gradient(circle at 75% 45%, rgba(255, 110, 80, .25), transparent 28%),
    linear-gradient(90deg, rgba(0, 0, 0, .2), transparent 35%, rgba(255, 107, 74, .28) 70%, rgba(255, 138, 92, .32) 100%);
}
.re-effort[data-re-theme="minimax"] .re-effort-flare,
.re-effort.theme-minimax .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 4%, rgba(255,225,210,.9) 12%, rgba(255,107,74,.65) 30%, rgba(255,145,110,.35) 50%, transparent 74%);
}
.re-effort[data-re-theme="minimax"] .re-effort-flare::before,
.re-effort.theme-minimax .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(255,120,85,.55), #ffffff, rgba(255,215,195,.8), transparent);
  box-shadow: 0 0 7px #ff5733, 0 0 13px rgba(255,107,74,.65);
}
.re-effort[data-re-theme="minimax"] .re-effort-flare::after,
.re-effort.theme-minimax .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,245,240,.95), transparent);
  box-shadow: 0 0 7px #ff5733;
}
.re-effort[data-re-theme="minimax"] .re-effort-knob,
.re-effort.theme-minimax .re-effort-knob {
  box-shadow:
    0 0 0 2px rgba(255,107,74,.22),
    0 0 14px rgba(255,107,74,.65),
    0 2px 7px rgba(0,0,0,.3);
}
.re-effort[data-re-theme="minimax"].is-dragging .re-effort-knob,
.re-effort.theme-minimax.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(255,145,110,.35),
    0 0 22px rgba(255,107,74,.95),
    0 0 32px rgba(255,160,122,.6),
    0 3px 8px rgba(0,0,0,.3);
}
.re-effort[data-re-theme="minimax"] .re-effort-slider[data-top] .re-effort-track,
.re-effort.theme-minimax .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-dark-minimax-breathe;
}
.re-effort[data-re-theme="minimax"] .re-effort-slider[data-top] .re-effort-knob,
.re-effort.theme-minimax .re-effort-slider[data-top] .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(255,145,110,.3),
    0 0 22px rgba(255,107,74,.9),
    0 0 34px rgba(255,160,122,.65),
    0 3px 8px rgba(0,0,0,.28);
}

.re-model-root[data-re-theme="minimax"] .re-model-effort,
.re-model-root[data-re-theme="minimax"] .re-model-row-effort,
.re-model-root[data-re-theme="minimax"] .re-model-check,
.re-model-root.theme-minimax .re-model-effort,
.re-model-root.theme-minimax .re-model-row-effort,
.re-model-root.theme-minimax .re-model-check {
  color: #ff643d;
}
.re-model-root[data-re-theme="minimax"] .re-adapt-arrow,
.re-model-root[data-re-theme="minimax"] .re-adapt-open,
.re-model-root[data-re-theme="minimax"] .re-adapt-apply,
.re-model-root.theme-minimax .re-adapt-arrow,
.re-model-root.theme-minimax .re-adapt-open,
.re-model-root.theme-minimax .re-adapt-apply {
  color: #ff643d;
}
.re-model-root[data-re-theme="minimax"] .re-adapt-open,
.re-model-root[data-re-theme="minimax"] .re-adapt-apply,
.re-model-root.theme-minimax .re-adapt-open,
.re-model-root.theme-minimax .re-adapt-apply {
  background: linear-gradient(90deg, #ea3a20 0%, #ff6f43 100%);
  color: #fff;
}

.re-model-root {
  position: relative;
  display: inline-flex;
  min-width: 0;
}
.re-model-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  max-width: 230px;
  height: 28px;
  padding: 0 8px 0 10px;
  border: 0;
  border-radius: 9px;
  color: var(--dsw-alias-label-primary, #15171b);
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: background 140ms ease;
}
.re-model-trigger:hover,
.re-model-trigger[aria-expanded="true"] {
  background: var(--dsw-alias-fill-tertiary, rgba(120,125,140,.1));
}
.re-model-trigger:disabled { cursor: not-allowed; opacity: .5; }
.re-model-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
}
.re-model-effort {
  flex: 0 0 auto;
  color: var(--dsw-static-deepseek-500, #4d70ff);
  font-size: 12px;
  line-height: 1;
}
.re-model-chevron {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin: -3px 1px 0 3px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  opacity: .55;
  transform: rotate(45deg);
  transition: transform 150ms ease, margin 150ms ease;
}
.re-model-trigger[aria-expanded="true"] .re-model-chevron {
  margin-top: 3px;
  transform: rotate(225deg);
}
.re-model-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 1200;
  width: min(312px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid var(--dsw-alias-stroke-secondary, rgba(121,126,145,.2));
  border-radius: 16px;
  color: var(--dsw-alias-label-primary, #15171b);
  background: var(--dsw-alias-bg-elevated, #fff);
  box-shadow: 0 14px 42px rgba(18, 24, 42, .18), 0 3px 10px rgba(18, 24, 42, .08);
  animation: re-menu-in 150ms cubic-bezier(.22,1,.36,1);
}
.re-advanced {
  padding: 14px;
}
.re-menu-separator {
  height: 1px;
  background: var(--dsw-alias-stroke-secondary, rgba(121,126,145,.16));
}
.re-model-row,
.re-model-option,
.re-model-back {
  width: 100%;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.re-model-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  min-height: 45px;
  padding: 0 14px;
  text-align: left;
}
.re-model-row:hover,
.re-model-option:hover,
.re-model-back:hover { background: var(--dsw-alias-fill-tertiary, rgba(120,125,140,.09)); }
.re-model-row-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.re-model-row-effort { color: var(--dsw-static-deepseek-500, #4d70ff); font-size: 12px; }
.re-row-chevron { font-size: 20px; line-height: 1; opacity: .42; }
.re-model-pane { max-height: min(390px, 60vh); overflow-y: auto; padding: 7px; }
.re-model-back {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px;
  border-radius: 8px;
  text-align: left;
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 12px;
}
.re-model-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 9px 5px;
  color: var(--dsw-alias-label-tertiary, #9296a0);
  font-size: 11px;
}
.re-model-option-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
  width: 100%;
}
.re-model-option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 7px 9px;
  border-radius: 9px;
  text-align: left;
}
.re-model-option-copy { min-width: 0; }
.re-model-option-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.re-model-option-desc { display: block; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-tertiary, #9296a0); font-size: 10px; }
.re-model-check { color: var(--dsw-static-deepseek-500, #4d70ff); font-size: 15px; text-align: center; }
.re-model-status { padding: 14px; color: var(--dsw-alias-label-tertiary, #9296a0); font-size: 12px; text-align: center; }
.re-model-error { margin: 8px; padding: 8px 10px; border-radius: 8px; color: var(--dsw-alias-state-error-primary, #c83e4d); background: var(--dsw-alias-state-error-tertiary, rgba(220,55,70,.08)); font-size: 11px; }
.re-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(121,126,145,.18));
}
.re-setting-copy { min-width: 0; }
.re-setting-title {
  color: var(--dsw-alias-label-primary, #15171b);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}
.re-setting-description {
  margin-top: 3px;
  color: var(--dsw-alias-label-tertiary, #9296a0);
  font-size: 12px;
  line-height: 18px;
}
.re-setting-control { display: inline-flex; align-items: center; gap: 10px; flex: none; }
.re-setting-state { color: var(--dsw-alias-label-secondary, #686c75); font-size: 13px; }
.re-setting-switch {
  position: relative;
  width: 38px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--dsw-alias-fill-quaternary, #c7cbd3);
  cursor: pointer;
  transition: background 150ms ease;
}
.re-setting-switch:hover { filter: brightness(.97); }
.re-setting-switch:disabled { cursor: not-allowed; opacity: .45; }
.re-setting-switch:focus-visible {
  outline: 2px solid var(--dsw-static-blue-400, #5d83ff);
  outline-offset: 2px;
}
.re-setting-switch.is-on { background: var(--dsw-alias-state-business-primary, #4f73ff); }
.re-setting-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
  transition: transform 170ms cubic-bezier(.22,1,.36,1);
}
.re-setting-switch.is-on .re-setting-switch-knob { transform: translateX(16px); }
body[data-ds-dark-theme] .re-model-menu {
  border-color: rgba(136, 145, 180, .2);
  color: var(--dsw-alias-label-primary, #f2f4f8);
  background: var(--dsw-alias-bg-elevated, #202126);
  box-shadow: 0 18px 46px rgba(0,0,0,.48), 0 3px 12px rgba(0,0,0,.32);
}
body[data-ds-dark-theme] .re-model-trigger { color: var(--dsw-alias-label-primary, #f2f4f8); }
@keyframes re-menu-in {
  from { opacity: 0; transform: translateY(5px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
body:not([data-ds-dark-theme]) .re-effort-slider {
  filter: none;
}
body:not([data-ds-dark-theme]) .re-effort-track {
  background: var(--dsw-static-blue-75, #e5f0ff);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9),
    inset 0 0 0 1px rgba(80,133,194,.14),
    0 3px 10px rgba(48,101,165,.13);
}
body:not([data-ds-dark-theme]) .re-effort-track::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0 auto 0 0;
  width: var(--re-progress);
  border-radius: inherit;
  background: linear-gradient(90deg, #fff 0%, #e2f0ff 20%, #a8d0fb 57%, #438fdf 100%);
  transition: width 190ms cubic-bezier(.22,1,.36,1);
}
body:not([data-ds-dark-theme]) .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #d7eaff 18%, #75afea 54%, #0751ad 100%);
}
body:not([data-ds-dark-theme]) .re-effort.is-dragging .re-effort-track::before {
  transition: none;
}
body:not([data-ds-dark-theme]) .re-effort-track::after {
  z-index: 1;
  background: linear-gradient(90deg, rgba(255,255,255,.48), transparent 34%, rgba(23,101,201,.07));
}
body:not([data-ds-dark-theme]) .re-effort-canvas {
  opacity: .78;
  mix-blend-mode: multiply;
}
body:not([data-ds-dark-theme]) .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(204,231,255,.88) 13%, rgba(91,162,241,.48) 31%, rgba(37,111,207,.16) 53%, transparent 75%);
  filter: blur(2px) saturate(1.12);
}
body:not([data-ds-dark-theme]) .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(116,177,244,.34), #fff, rgba(66,139,225,.58), transparent);
  box-shadow: 0 0 7px rgba(58,133,222,.5), 0 0 13px rgba(104,176,255,.38);
}
body:not([data-ds-dark-theme]) .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.94), transparent);
  box-shadow: 0 0 7px rgba(64,137,224,.44);
}
body:not([data-ds-dark-theme]) .re-effort-knob {
  border-color: rgba(126,160,197,.32);
  box-shadow:
    0 0 0 2px rgba(58,124,207,.09),
    0 0 13px rgba(48,118,207,.3),
    0 3px 8px rgba(39,77,119,.18);
}
body:not([data-ds-dark-theme]) .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-breathe;
}
body:not([data-ds-dark-theme]) .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(36,105,192,.15),
    0 0 20px rgba(25,100,201,.45),
    0 3px 8px rgba(39,77,119,.18);
}

/* ==================== OpenAI Purple Theme - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-track {
  background: #f4ecfd;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9),
    inset 0 0 0 1px rgba(160,85,210,.16),
    0 3px 10px rgba(130,50,180,.13);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #f6ebff 20%, #dab8fb 57%, #9d4fe8 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #edd4ff 18%, #bd6fed 54%, #7b12d4 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(140,25,215,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(238,206,255,.9) 13%, rgba(190,95,245,.5) 31%, rgba(150,40,215,.18) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(200,120,250,.38), #fff, rgba(170,70,230,.6), transparent);
  box-shadow: 0 0 7px rgba(180,60,230,.5), 0 0 13px rgba(205,110,255,.4);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(190,65,230,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-knob {
  border-color: rgba(185,130,205,.35);
  box-shadow:
    0 0 0 2px rgba(165,60,215,.1),
    0 0 13px rgba(160,50,215,.32),
    0 3px 8px rgba(105,40,125,.2);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-purple-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-openai .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="openai"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-openai.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(160,40,200,.18),
    0 0 20px rgba(165,30,210,.5),
    0 3px 8px rgba(105,40,125,.2);
}

/* ==================== Claude Orange Theme - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-track {
  background: #fdf5ee;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9),
    inset 0 0 0 1px rgba(210,130,80,.18),
    0 3px 10px rgba(180,85,35,.14);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #fff1e5 20%, #fcd0ab 57%, #ee742d 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #fedfc4 18%, #f89d58 54%, #cc4e08 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(200,80,20,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(255,230,200,.9) 13%, rgba(255,150,70,.52) 31%, rgba(220,80,15,.2) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(255,160,70,.4), #fff, rgba(240,110,30,.65), transparent);
  box-shadow: 0 0 7px rgba(240,110,30,.55), 0 0 13px rgba(255,150,60,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(240,110,30,.48);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-knob {
  border-color: rgba(215,145,95,.36);
  box-shadow:
    0 0 0 2px rgba(220,105,35,.12),
    0 0 13px rgba(220,95,30,.34),
    0 3px 8px rgba(130,55,15,.2);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-orange-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-claude .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="claude"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-claude.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(210,85,25,.2),
    0 0 20px rgba(225,80,20,.52),
    0 3px 8px rgba(130,55,15,.2);
}

/* ==================== Gemini Star Rainbow Nebula - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-track {
  background: #f4f2fb;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.95),
    inset 0 0 0 1px rgba(130,71,229,.18),
    0 3px 10px rgba(90,30,170,.14);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #fff1d6 15%, #c8f5d6 35%, #bce2fe 55%, #d8c6fc 78%, #fdbcd5 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #fff 0%, #fbbd23 15%, #10b981 35%, #3b82f6 55%, #7c3aed 78%, #f43f5e 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(130,71,229,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(230,215,255,.88) 13%, rgba(130,71,229,.48) 31%, rgba(66,133,244,.18) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(245,158,11,.38), #fff, rgba(66,133,244,.6), rgba(235,68,90,.65), transparent);
  box-shadow: 0 0 7px rgba(130,71,229,.5), 0 0 13px rgba(66,133,244,.4);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(130,71,229,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-knob {
  border-color: rgba(145,100,225,.35);
  box-shadow:
    0 0 0 2px rgba(130,71,229,.1),
    0 0 13px rgba(130,71,229,.32),
    0 3px 8px rgba(70,25,120,.2);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-gemini-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="gemini"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-gemini.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(130,60,220,.18),
    0 0 20px rgba(130,71,229,.5),
    0 3px 8px rgba(70,25,120,.2);
}

/* ==================== Kimi / Moonshot Midnight Starry Navy - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-track {
  background: #eff2fd;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.95),
    inset 0 0 0 1px rgba(75,95,195,.18),
    0 3px 10px rgba(35,45,110,.14);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-track::before {
  background: linear-gradient(90deg, #101633 0%, #1e285a 28%, #31428f 60%, #4d64c9 86%, #dca838 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #0d122b 0%, #1a2350 25%, #2c3b82 55%, #465cb8 80%, #f4b428 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(92,116,232,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(225,235,255,.88) 13%, rgba(85,115,225,.48) 32%, rgba(245,195,75,.22) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(92,116,232,.38), #fff, rgba(245,195,75,.65), transparent);
  box-shadow: 0 0 7px rgba(92,116,232,.5), 0 0 13px rgba(245,195,75,.4);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(92,116,232,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-knob {
  border-color: rgba(95,120,225,.35);
  box-shadow:
    0 0 0 2px rgba(85,110,215,.1),
    0 0 13px rgba(85,110,215,.32),
    0 3px 8px rgba(25,35,90,.2);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-kimi-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="kimi"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-kimi.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(85,110,215,.18),
    0 0 20px rgba(92,116,232,.52),
    0 0 30px rgba(245,195,75,.35),
    0 3px 8px rgba(25,35,90,.2);
}

/* ==================== GLM / ZCode Obsidian Cyan - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-track {
  background: #edf2f7;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.95),
    inset 0 0 0 1px rgba(14,165,233,.18),
    0 3px 10px rgba(15,23,42,.12);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-track::before {
  background: linear-gradient(90deg, #050811 0%, #0f1c2e 28%, #162b47 60%, #1e3d64 86%, #0284c7 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #03050a 0%, #0b1524 25%, #12243d 55%, #19365c 80%, #0ea5e9 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(14,165,233,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(224,242,254,.88) 13%, rgba(56,189,248,.48) 32%, rgba(14,165,233,.22) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(14,165,233,.38), #fff, rgba(56,189,248,.65), transparent);
  box-shadow: 0 0 7px rgba(14,165,233,.5), 0 0 13px rgba(56,189,248,.4);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(14,165,233,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-knob {
  border-color: rgba(14,165,233,.35);
  box-shadow:
    0 0 0 2px rgba(14,165,233,.1),
    0 0 13px rgba(14,165,233,.32),
    0 3px 8px rgba(15,23,42,.2);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-glm-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-glm .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="glm"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-glm.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(14,165,233,.18),
    0 0 20px rgba(14,165,233,.52),
    0 0 30px rgba(56,189,248,.35),
    0 3px 8px rgba(15,23,42,.2);
}

/* ==================== Qwen / 通义千问 Ethereal Azure Sky Blue - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-track {
  background: #edf4fe;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.95),
    inset 0 0 0 1px rgba(59,130,246,.18),
    0 3px 10px rgba(30,58,138,.12);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-track::before {
  background: linear-gradient(90deg, #132454 0%, #1e3e8f 28%, #3162d0 60%, #4d8df6 86%, #f6c845 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #0f1c44 0%, #1a357c 25%, #2a55b8 55%, #4681ee 80%, #fbbf24 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(59,130,246,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(219,234,254,.88) 13%, rgba(96,165,250,.48) 32%, rgba(251,191,36,.22) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(59,130,246,.38), #fff, rgba(251,191,36,.65), transparent);
  box-shadow: 0 0 7px rgba(59,130,246,.5), 0 0 13px rgba(251,191,36,.4);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(59,130,246,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-knob {
  border-color: rgba(59,130,246,.35);
  box-shadow:
    0 0 0 2px rgba(59,130,246,.1),
    0 0 13px rgba(59,130,246,.32),
    0 3px 8px rgba(30,58,138,.2);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-qwen-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="qwen"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-qwen.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(59,130,246,.18),
    0 0 20px rgba(59,130,246,.52),
    0 0 30px rgba(251,191,36,.35),
    0 3px 8px rgba(30,58,138,.2);
}

/* ==================== MiniMax / Hailuo Vibrant Sunset Coral - Light Mode ==================== */
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-track {
  background: #fff5f2;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.95),
    inset 0 0 0 1px rgba(255,107,74,.2),
    0 3px 10px rgba(180,50,20,.12);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-track::before {
  background: linear-gradient(90deg, #7c1a16 0%, #b82d20 28%, #e84c2a 60%, #ff6f43 86%, #ff8e68 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-slider[data-top] .re-effort-track::before,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-slider[data-top] .re-effort-track::before {
  background: linear-gradient(90deg, #661210 0%, #a32418 25%, #d94020 55%, #f75d33 80%, #ff7c52 100%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-track::after,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-track::after {
  background: linear-gradient(90deg, rgba(255,255,255,.5), transparent 34%, rgba(255,107,74,.08));
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-flare,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%, rgba(255,225,210,.88) 13%, rgba(255,107,74,.5) 32%, rgba(255,145,110,.25) 53%, transparent 75%);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-flare::before,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, rgba(255,107,74,.4), #fff, rgba(255,138,92,.7), transparent);
  box-shadow: 0 0 7px rgba(255,107,74,.55), 0 0 13px rgba(255,138,92,.45);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-flare::after,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.95), transparent);
  box-shadow: 0 0 7px rgba(255,107,74,.5);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-knob {
  border-color: rgba(255,107,74,.38);
  box-shadow:
    0 0 0 2px rgba(255,107,74,.12),
    0 0 13px rgba(255,107,74,.35),
    0 3px 8px rgba(180,50,20,.18);
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-slider[data-top] .re-effort-track,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-slider[data-top] .re-effort-track {
  animation-name: re-effort-light-minimax-breathe;
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"] .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax .re-effort-slider[data-top] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="minimax"].is-dragging .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.theme-minimax.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(255,107,74,.2),
    0 0 20px rgba(255,107,74,.55),
    0 0 30px rgba(255,145,110,.4),
    0 3px 8px rgba(180,50,20,.18);
}

@keyframes re-effort-dark-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(196,204,255,.16), 0 3px 10px rgba(18,25,72,.4); }
  50% { box-shadow: inset 0 1px 0 rgba(220,214,255,.24), 0 0 21px rgba(111,66,255,.5); }
}
@keyframes re-effort-light-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(67,124,193,.16), 0 3px 10px rgba(48,101,165,.13); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 0 0 1px rgba(31,102,190,.22), 0 0 19px rgba(31,105,201,.24); }
}
@keyframes re-effort-dark-purple-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(230,196,255,.2), 0 3px 10px rgba(45,18,72,.45); }
  50% { box-shadow: inset 0 1px 0 rgba(245,220,255,.28), 0 0 21px rgba(175,66,255,.55); }
}
@keyframes re-effort-light-purple-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(150,67,193,.18), 0 3px 10px rgba(120,48,165,.14); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 0 0 1px rgba(145,31,190,.24), 0 0 19px rgba(165,31,201,.26); }
}
@keyframes re-effort-dark-orange-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,215,189,.22), 0 3px 10px rgba(55,22,10,.4); }
  50% { box-shadow: inset 0 1px 0 rgba(255,230,205,.3), 0 0 21px rgba(255,120,30,.58); }
}
@keyframes re-effort-light-orange-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(210,130,80,.18), 0 3px 10px rgba(180,85,35,.14); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 0 0 1px rgba(200,80,20,.25), 0 0 19px rgba(225,85,25,.28); }
}
@keyframes re-effort-dark-gemini-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(230,205,255,.2), 0 3px 10px rgba(22,8,45,.45); }
  50% { box-shadow: inset 0 1px 0 rgba(245,220,255,.28), 0 0 22px rgba(140,70,255,.6), 0 0 32px rgba(66,133,244,.45); }
}
@keyframes re-effort-light-gemini-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(130,71,229,.18), 0 3px 10px rgba(90,30,170,.14); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(130,71,229,.25), 0 0 20px rgba(140,70,255,.32); }
}
@keyframes re-effort-dark-kimi-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(220,230,255,.18), 0 3px 10px rgba(12,18,48,.45); }
  50% { box-shadow: inset 0 1px 0 rgba(235,242,255,.28), 0 0 22px rgba(92,116,232,.65), 0 0 30px rgba(255,215,105,.45); }
}
@keyframes re-effort-light-kimi-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(75,95,195,.18), 0 3px 10px rgba(35,45,110,.14); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(75,95,195,.25), 0 0 20px rgba(92,116,232,.35), 0 0 28px rgba(245,195,75,.25); }
}
@keyframes re-effort-dark-glm-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(186,230,253,.16), 0 3px 10px rgba(5,10,20,.5); }
  50% { box-shadow: inset 0 1px 0 rgba(224,242,254,.26), 0 0 22px rgba(14,165,233,.65), 0 0 30px rgba(56,189,248,.45); }
}
@keyframes re-effort-light-glm-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(14,165,233,.18), 0 3px 10px rgba(15,23,42,.12); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(14,165,233,.25), 0 0 20px rgba(14,165,233,.35), 0 0 28px rgba(56,189,248,.25); }
}
@keyframes re-effort-dark-qwen-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(220,235,255,.2), 0 3px 10px rgba(15,25,65,.42); }
  50% { box-shadow: inset 0 1px 0 rgba(235,245,255,.28), 0 0 22px rgba(59,130,246,.65), 0 0 30px rgba(251,191,36,.45); }
}
@keyframes re-effort-light-qwen-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(59,130,246,.18), 0 3px 10px rgba(30,58,138,.12); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(59,130,246,.25), 0 0 20px rgba(59,130,246,.35), 0 0 28px rgba(251,191,36,.25); }
}
@keyframes re-effort-dark-minimax-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,218,205,.25), 0 3px 10px rgba(70,18,12,.45); }
  50% { box-shadow: inset 0 1px 0 rgba(255,235,225,.35), 0 0 24px rgba(255,107,74,.75), 0 0 34px rgba(255,160,122,.55); }
}
@keyframes re-effort-light-minimax-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(255,107,74,.2), 0 3px 10px rgba(180,50,20,.12); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(255,107,74,.28), 0 0 20px rgba(255,107,74,.4), 0 0 28px rgba(255,145,110,.3); }
}
@keyframes re-chibi-run {
  0% { background-position: 14.285714% 0; }
  14.285714% { background-position: 28.571429% 0; }
  28.571429% { background-position: 42.857143% 0; }
  42.857143% { background-position: 57.142857% 0; }
  57.142857% { background-position: 71.428571% 0; }
  71.428571% { background-position: 85.714286% 0; }
  85.714286%, 100% { background-position: 100% 0; }
}
.re-adapt {
  padding: 10px 14px 12px;
}
.re-adapt-copy { min-width: 0; }
.re-adapt-title {
  color: var(--dsw-alias-label-primary, #15171b);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}
.re-adapt-desc {
  margin-top: 3px;
  color: var(--dsw-alias-label-tertiary, #9296a0);
  font-size: 11px;
  line-height: 1.55;
}
.re-adapt-open {
  margin-top: 8px;
  padding: 5px 10px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: var(--dsw-static-deepseek-500, #4d70ff);
  font-size: 12px;
  cursor: pointer;
}
.re-adapt-open:hover { filter: brightness(1.06); }
.re-adapt-panel {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--dsw-alias-stroke-secondary, rgba(121,126,145,.2));
  border-radius: 10px;
  background: var(--dsw-alias-bg-page, #f7f8fa);
}
body[data-ds-dark-theme] .re-adapt-panel {
  background: rgba(20, 22, 30, .5);
}
.re-adapt-scroll {
  max-height: min(260px, 40vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px;
  scrollbar-width: thin;
}
.re-adapt-panel-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #686c75);
}
.re-adapt-arrow { color: var(--dsw-static-deepseek-500, #4d70ff); font-weight: 500; }
.re-adapt-yaml {
  margin: 9px 0 0;
  padding: 8px 10px;
  overflow: auto;
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #686c75);
  background: rgba(120, 125, 140, .08);
  font: 11px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace;
}
.re-adapt-steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  color: var(--dsw-alias-label-tertiary, #9296a0);
  font-size: 11px;
  line-height: 1.55;
}
.re-adapt-steps code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--dsw-alias-fill-tertiary, rgba(120,125,140,.12));
}
.re-adapt-warning {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--dsw-alias-state-warning-primary, #b7791f);
  background: var(--dsw-alias-state-warning-tertiary, rgba(213, 148, 44, .1));
  font-size: 11px;
  line-height: 1.6;
}
.re-adapt-label {
  margin-top: 10px;
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 11px;
  font-weight: 500;
}
.re-adapt-step-title {
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #686c75);
}
.re-adapt-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.re-adapt-apply,
.re-adapt-cancel {
  padding: 5px 12px;
  border: 0;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.re-adapt-apply {
  color: #fff;
  background: var(--dsw-static-deepseek-500, #4d70ff);
}
.re-adapt-cancel {
  color: var(--dsw-alias-label-secondary, #686c75);
  background: var(--dsw-alias-fill-tertiary, rgba(120,125,140,.12));
}
.re-adapt-apply:disabled,
.re-adapt-cancel:disabled { cursor: wait; opacity: .6; }
@media (prefers-reduced-motion: reduce) {
  .re-effort-slider[data-top] .re-effort-track { animation: none; }
  .re-effort-knob,
  .re-effort-flare,
  body:not([data-ds-dark-theme]) .re-effort-track::before { transition: none; }
  .re-model-menu { animation: none; }
  .re-effort.is-chibi .re-effort-knob { animation: none; }
}

/* Quota badge enhancements */
.dsh-quota-header-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}
.dsh-quota-header-badge.warn {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.12);
}
.dsh-quota-header-badge.danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
}

.dsh-quota-model-badge {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 15px;
  font-variant-numeric: tabular-nums;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
}
.dsh-quota-model-badge.warn {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.1);
}
.dsh-quota-model-badge.danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.1);
}
`
