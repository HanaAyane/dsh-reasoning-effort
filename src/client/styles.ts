/**
 * Stylesheet for the reasoning-effort slider and the composer model seat.
 *
 * The slider visualizes whatever effort levels the current model exposes, so
 * the "peak intensity" effects key off the `[data-top]` existence flag the
 * component stamps on the highest level rather than any hardcoded effort id.
 *
 * @module dsh-reasoning-effort/client/styles
 */
import { RUNNER_LOOP_MS, runnerIds, runnerSprites } from './runners.js'
import { trackThemeCSS } from './track-themes.js'

export const CSS = `
${trackThemeCSS}
${runnerIds.map(id => `
[data-re-runner="${id}"] {
  --re-runner-image: url("${runnerSprites[id].image}");
  --re-runner-frames: ${runnerSprites[id].frames};
}`).join('\n')}
.re-effort {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  color: var(--dsw-alias-label-secondary);
  user-select: none;
  box-sizing: border-box;
}
.re-effort-name {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  overflow-wrap: anywhere;
}
.re-effort-ticks { position: relative; height: 16px; margin-top: 4px; }
.re-effort-tick {
  position: absolute;
  transform: translateX(-50%);
  color: var(--dsw-alias-label-tertiary, #9296a0);
  font-size: 22px;
  line-height: 16px;
  user-select: none;
}
.re-effort-tick.is-selected { color: var(--dsw-static-deepseek-500, #4d70ff); font-weight: 700; }
.re-effort-slider {
  --re-progress: 50%;
  position: relative;
  width: 100%;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 999px;
  isolation: isolate;
  transition: filter 180ms ease;
}
.re-effort-track {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  background: var(--re-track-dark);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--re-track-accent) 24%, transparent),
    inset 0 -1px 0 rgba(0, 0, 0, .55),
    0 3px 10px rgba(12, 17, 55, .34);
}
.re-effort-track::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--re-progress);
  border-radius: inherit;
  transition: width 190ms cubic-bezier(.22,1,.36,1);
}
.re-effort-track::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 45%, color-mix(in srgb, var(--re-track-accent) 14%, transparent), transparent 24%),
    linear-gradient(90deg, rgba(0, 0, 0, .28), transparent 42%, color-mix(in srgb, var(--re-track-accent) 14%, transparent));
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
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.96) 0 4%,
    color-mix(in srgb, var(--re-track-accent), white) 11%,
    color-mix(in srgb, var(--re-track-accent) 50%, transparent) 28%,
    color-mix(in srgb, var(--re-track-accent) 20%, transparent) 49%, transparent 74%);
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
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--re-track-accent) 42%, transparent),
    #fff, color-mix(in srgb, var(--re-track-accent) 65%, transparent), transparent);
  box-shadow: 0 0 7px var(--re-track-accent);
}
.re-effort-flare::after {
  width: 1px;
  height: 20px;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--re-track-accent), white), transparent);
  box-shadow: 0 0 7px var(--re-track-accent);
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
  transition: left 190ms cubic-bezier(.22,1,.36,1), transform 160ms ease, box-shadow 180ms ease, filter 140ms ease;
  pointer-events: none;
}
.re-effort.is-chibi {
  --re-runner-width: calc(40px * var(--re-runner-scale, 1));
  --re-runner-height: calc(55px * var(--re-runner-scale, 1));
  --re-runner-overhang: calc((var(--re-runner-height) - 55px) / 2);
  padding-top: max(0px, calc(12px + var(--re-runner-overhang)));
  padding-inline: max(0px, calc((var(--re-runner-width) - 40px) / 2));
}
.re-effort.is-chibi .re-effort-ticks {
  margin-top: max(4px, calc(14px + var(--re-runner-overhang)));
}
.re-effort.is-chibi .re-effort-knob {
  left: clamp(10px, var(--re-progress), calc(100% - 10px));
  width: var(--re-runner-width);
  height: var(--re-runner-height);
  border: 0;
  border-radius: 8px;
  background-color: transparent;
  background-image: var(--re-runner-image);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: calc(var(--re-runner-frames) * 100%) 100%;
  box-shadow: none !important;
  filter:
    drop-shadow(0 1px 1px rgba(0, 0, 0, .28))
    drop-shadow(0 0 5px rgba(92, 105, 255, .34));
  animation: re-runner-cycle ${RUNNER_LOOP_MS}ms steps(var(--re-runner-frames), jump-none) infinite;
  transform-origin: 50% 68%;
}
.re-effort.is-chibi.is-dragging .re-effort-knob {
  transition: filter 140ms ease;
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
.re-effort.is-chibi .re-effort-input {
  --re-runner-hit-inset: max(5px, calc(var(--re-runner-height) / 2 - 15px));
  top: calc(-1 * var(--re-runner-hit-inset));
  height: calc(100% + 2 * var(--re-runner-hit-inset));
}
.re-effort-input:active { cursor: grabbing; }
.re-effort-input:focus-visible + .re-effort-knob {
  outline: none;
}
.re-effort.is-dragging .re-effort-canvas {
  filter: saturate(1.45) brightness(1.28) contrast(1.06);
}
.re-effort[data-re-theme='gemini'].is-dragging .re-effort-canvas { filter: none; }
.re-effort[data-re-theme='gemini'] .re-effort-flare { opacity: .35; }
.re-effort[data-re-theme='gemini'].is-dragging .re-effort-flare { opacity: .7; }
.re-effort.is-dragging .re-effort-flare {
  filter: blur(1.5px) saturate(1.6) brightness(1.42);
  transition: filter 140ms ease;
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
.re-model-icon {
  display: var(--dsh-composer-model-icon-display, none);
  flex: 0 0 auto;
}
.re-model-name,
.re-model-effort {
  display: var(--dsh-composer-model-text-display, block);
}
.re-model-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--re-composer-font-size, 12px);
  line-height: var(--re-composer-line-height, 1);
}
.re-model-effort {
  flex: 0 0 auto;
  color: var(--dsw-static-deepseek-500, #4d70ff);
  font-size: var(--re-composer-font-size, 12px);
  line-height: var(--re-composer-line-height, 1);
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
  box-sizing: border-box;
  width: min(312px, var(--re-menu-width, calc(100vw - 24px)));
  max-height: var(--re-menu-height, calc(100dvh - 24px));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  translate: var(--re-menu-x, 0px) var(--re-menu-y, 0px);
  border: 0;
  border-radius: 16px;
  color: var(--dsw-alias-label-primary, #15171b);
  /* DSH's menu fill is translucent: pair it with the theme's backdrop material. */
  background: var(--dsw-specific-menu, var(--dsw-alias-bg-layer-3, #fff));
  -webkit-backdrop-filter: var(--dsw-menu-backdrop-filter, blur(40px) saturate(150%));
  backdrop-filter: var(--dsw-menu-backdrop-filter, blur(40px) saturate(150%));
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1, rgba(121,126,145,.2));
  box-shadow: var(--dsw-elevation-prominent, 0 14px 42px rgba(18, 24, 42, .18), 0 3px 10px rgba(18, 24, 42, .08));
  animation: re-menu-in 150ms cubic-bezier(.22,1,.36,1);
}
.re-native-pane {
  outline: none;
  animation: re-native-pane-in 150ms cubic-bezier(.22,1,.36,1);
}
@keyframes re-native-pane-in {
  from { opacity: .65; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.re-native-effort {
  width: min(312px, calc(100vw - 40px));
  max-height: min(312px, calc(100vh - 144px));
  overflow: auto;
  overscroll-behavior: contain;
}
.re-advanced {
  padding: 14px;
}
.re-native-effort .re-advanced { padding: 10px 14px 8px; }
.re-native-effort .re-effort-name { line-height: 18px; }
.re-effort-unavailable {
  padding: 10px 14px 0;
  text-align: center;
  color: var(--dsw-alias-label-tertiary, #9296a0);
  font-size: 12px;
  line-height: 18px;
}
.re-effort-unavailable ~ .re-adapt { padding-top: 0; }
.re-effort-unavailable ~ .re-adapt > .re-adapt-advanced { margin-top: 0; }

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
.re-model-group-title { padding: 10px 9px 5px; color: var(--dsw-alias-label-tertiary, #9296a0); font-size: 11px; }
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
/* Match DSH ui-primitives/Switch.module.css, including its theme tokens and
   round corners (the host globally uses superellipses). */
.re-setting-switch {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  width: 36px;
  height: 20px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-border-l3);
  cursor: pointer;
}
.re-setting-switch:disabled { cursor: default; opacity: .5; }
.re-setting-switch:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}
.re-setting-switch[aria-checked='true'] { background: var(--dsw-alias-brand-primary); }
.re-setting-switch-knob {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsw-alias-label-primary-foreground);
  transition: transform 120ms ease;
}
.re-setting-switch[aria-checked='false'] .re-setting-switch-knob { background: var(--dsw-alias-switch-thumb); }
.re-setting-switch[aria-checked='true'] .re-setting-switch-knob { transform: translateX(16px); }
.re-settings-preview {
  margin-top: 16px;
  padding: 12px 16px 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(121,126,145,.18));
  border-radius: 12px;
}
.re-settings-preview .re-effort { margin-top: 12px; }
.re-settings-preview .re-effort-slider:has(.re-effort-input:focus-visible) {
  outline: 2px solid var(--dsw-focus-ring-color, #4d70ff);
  outline-offset: 3px;
}
.re-runner-size { margin-top: 12px; }
.re-runner-size-label { display: flex; justify-content: space-between; gap: 12px; }
.re-runner-size output {
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 13px;
  line-height: 22px;
  font-variant-numeric: tabular-nums;
}
.re-runner-size input {
  display: block;
  width: 100%;
  margin: 4px 0 0;
  accent-color: var(--dsw-alias-brand-primary, #4d70ff);
}
.re-runner-picker {
  min-inline-size: 0;
  border: 0;
  margin: 20px 0 0;
  padding: 0;
}
.re-runner-picker legend {
  padding: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 600;
}
.re-runner-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}
.re-runner-option {
  position: relative;
  display: flex;
  min-width: 0;
  cursor: pointer;
}
.re-runner-option:nth-child(-n+2) { grid-column: span 2; }
.re-runner-option input {
  position: absolute;
  top: 9px;
  right: 9px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary, #4d70ff);
  cursor: inherit;
}
.re-runner-option-body {
  display: grid;
  flex: 1 1 0;
  place-items: center;
  align-content: center;
  gap: 4px;
  min-width: 0;
  padding: 12px 6px 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(121,126,145,.18));
  border-radius: 10px;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  overflow-wrap: anywhere;
}
.re-runner-option:nth-child(-n+2) .re-runner-option-body { padding: 10px 26px; }
.re-runner-option input:checked + .re-runner-option-body {
  border-color: var(--dsw-alias-brand-primary, #4d70ff);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d70ff) 8%, transparent);
}
.re-runner-option input:focus-visible + .re-runner-option-body {
  outline: 2px solid var(--dsw-focus-ring-color, #4d70ff);
  outline-offset: 2px;
}
.re-runner-preview {
  width: 40px;
  height: 55px;
  background: var(--re-runner-image) 0 0 / calc(var(--re-runner-frames) * 100%) 100% no-repeat;
}
@media (max-width: 680px) {
  .re-runner-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .re-runner-option:nth-child(-n+2) { grid-column: auto; }
}
body[data-ds-dark-theme] .re-model-menu {
  color: var(--dsw-alias-label-primary, #f2f4f8);
  background: var(--dsw-specific-menu, var(--dsw-alias-bg-layer-3, #202126));
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1, rgba(136, 145, 180, .2));
  box-shadow: var(--dsw-elevation-prominent, 0 18px 46px rgba(0,0,0,.48), 0 3px 12px rgba(0,0,0,.32));
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
  background: var(--re-track-light);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9),
    inset 0 0 0 1px color-mix(in srgb, var(--re-track-accent) 16%, transparent),
    0 3px 10px color-mix(in srgb, var(--re-track-accent) 13%, transparent);
}
body:not([data-ds-dark-theme]) .re-effort-track::before {
  content: "";
  z-index: 0;
  background: var(--re-track-fill);
}
body:not([data-ds-dark-theme]) .re-effort-slider[data-top] .re-effort-track::before {
  background: var(--re-track-peak);
}
.re-effort.is-dragging .re-effort-track::before {
  transition: none;
}
body:not([data-ds-dark-theme]) .re-effort-track::after {
  z-index: 1;
  background: linear-gradient(90deg, rgba(255,255,255,.48), transparent 34%,
    color-mix(in srgb, var(--re-track-accent) 9%, transparent));
}
body:not([data-ds-dark-theme]) .re-effort-canvas {
  opacity: .78;
  mix-blend-mode: multiply;
}
body:not([data-ds-dark-theme]) .re-effort-flare {
  background: radial-gradient(ellipse at 100% 50%, rgba(255,255,255,.98) 0 5%,
    color-mix(in srgb, var(--re-track-accent) 30%, white) 13%,
    color-mix(in srgb, var(--re-track-accent) 48%, transparent) 31%,
    color-mix(in srgb, var(--re-track-accent) 16%, transparent) 53%, transparent 75%);
  filter: blur(2px) saturate(1.12);
}
body:not([data-ds-dark-theme]) .re-effort-flare::before {
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--re-track-accent) 34%, transparent),
    #fff, color-mix(in srgb, var(--re-track-accent) 58%, transparent), transparent);
  box-shadow: 0 0 7px color-mix(in srgb, var(--re-track-accent) 50%, transparent);
}
body:not([data-ds-dark-theme]) .re-effort-flare::after {
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.94), transparent);
  box-shadow: 0 0 7px color-mix(in srgb, var(--re-track-accent) 44%, transparent);
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
@keyframes re-effort-dark-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 3px 10px rgba(18,25,72,.4); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.24), 0 0 21px color-mix(in srgb, var(--re-track-accent) 50%, transparent); }
}
@keyframes re-effort-light-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px color-mix(in srgb, var(--re-track-accent) 16%, transparent),
    0 3px 10px color-mix(in srgb, var(--re-track-accent) 13%, transparent); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 0 0 1px color-mix(in srgb, var(--re-track-accent) 22%, transparent),
    0 0 19px color-mix(in srgb, var(--re-track-accent) 24%, transparent); }
}
@keyframes re-runner-cycle {
  from { background-position: 0 0; }
  to { background-position: 100% 0; }
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
.re-adapt-open-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
.re-adapt-agent {
  margin-top: 8px;
  padding: 5px 10px;
  border: 1px solid var(--dsw-alias-border-secondary, rgba(120,125,140,.28));
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #686c75);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}
.re-adapt-agent:hover { filter: brightness(1.06); }
.re-adapt-open:hover { filter: brightness(1.06); }
.re-adapt-panel {
  box-sizing: border-box;
  max-width: 100%;
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
  box-sizing: border-box;
  max-width: 100%;
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
  color: var(--dsw-alias-state-warn-primary, #b7791f);
  background: var(--dsw-alias-state-warn-tertiary, rgba(213, 148, 44, .1));
  font-size: 11px;
  line-height: 1.6;
}
.re-adapt-howto {
  margin-top: 10px;
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 11px;
  line-height: 1.6;
}
.re-settings-guide {
  margin: 10px;
  padding: 12px;
  border-radius: 8px;
  background: var(--dsw-alias-fill-tertiary, rgba(120,125,140,.1));
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 12px;
  line-height: 1.6;
}
.re-settings-guide strong { color: var(--dsw-alias-label-primary, #15171b); font-size: 13px; }
.re-settings-path { margin: 8px 0; color: var(--dsw-static-deepseek-500, #4d70ff); font-weight: 600; }
.re-adapt-advanced { margin-top: 10px; }
.re-adapt-advanced > summary {
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 12px;
  cursor: pointer;
}
.re-adapt-switch-intro {
  margin-top: 8px;
  color: var(--dsw-alias-label-secondary, #686c75);
  font-size: 11px;
  font-weight: 500;
}
.re-adapt-switches {
  margin: 4px 0 0;
  padding-left: 16px;
  color: var(--dsw-alias-label-tertiary, #9296a0);
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
  flex-wrap: wrap;
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
@media (max-width: 600px) {
  .re-model-trigger { max-width: 180px; }
}
@media (prefers-reduced-motion: reduce) {
  .re-effort-slider[data-top] .re-effort-track { animation: none; }
  .re-effort-knob,
  .re-effort.is-chibi.is-dragging .re-effort-knob,
  .re-effort-canvas,
  .re-effort-flare,
  .re-effort.is-dragging .re-effort-flare,
  .re-effort-track::before { transition: none; }
  .re-model-menu,
  .re-native-pane { animation: none; }
  .re-effort.is-chibi .re-effort-knob { animation: none; }
}
`
