window.__ModuleLoader__.load({
  id: "dsh-reasoning-effort",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var SLOT = "conversation.input.model";
var SETTINGS_SLOT = "settings.general.item";
var ENABLED_STORAGE_KEY = "dsh-reasoning-effort.enabled";
var LEGACY_ENABLED_STORAGE_KEY = "@dsh-external/dsh-reasoning-effort.enabled";
var inject = ["slots", "modelDirectories"];
var LEVELS = [
  { key: "off", label: "off" },
  { key: "high", label: "high" },
  { key: "max", label: "max" }
];
function readEnabledPreference() {
  try {
    const current = window.localStorage.getItem(ENABLED_STORAGE_KEY);
    const stored = current ?? window.localStorage.getItem(LEGACY_ENABLED_STORAGE_KEY);
    return stored !== "false";
  } catch {
    return true;
  }
}
var enabledPreference = readEnabledPreference();
var enabledListeners = /* @__PURE__ */ new Set();
var enabledStore = {
  getSnapshot: () => enabledPreference,
  subscribe: (listener) => {
    enabledListeners.add(listener);
    return () => enabledListeners.delete(listener);
  },
  set: (enabled, persist = true) => {
    if (enabledPreference === enabled) return;
    enabledPreference = enabled;
    if (persist) {
      try {
        window.localStorage.setItem(ENABLED_STORAGE_KEY, String(enabled));
      } catch {
      }
    }
    enabledListeners.forEach((listener) => listener());
  }
};
var CSS = `
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
  left: var(--re-progress);
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
.re-effort-slider[data-effort="max"] .re-effort-track {
  animation: re-effort-dark-breathe 1.9s ease-in-out infinite;
}
.re-effort-slider[data-effort="max"] .re-effort-knob {
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
body:not([data-ds-dark-theme]) .re-effort-slider[data-effort="max"] .re-effort-track::before {
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
body:not([data-ds-dark-theme]) .re-effort-slider[data-effort="max"] .re-effort-track {
  animation-name: re-effort-light-breathe;
}
body:not([data-ds-dark-theme]) .re-effort-slider[data-effort="max"] .re-effort-knob,
body:not([data-ds-dark-theme]) .re-effort.is-dragging .re-effort-knob {
  box-shadow:
    0 0 0 3px rgba(36,105,192,.15),
    0 0 20px rgba(25,100,201,.45),
    0 3px 8px rgba(39,77,119,.18);
}
@keyframes re-effort-dark-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(196,204,255,.16), 0 3px 10px rgba(18,25,72,.4); }
  50% { box-shadow: inset 0 1px 0 rgba(220,214,255,.24), 0 0 21px rgba(111,66,255,.5); }
}
@keyframes re-effort-light-breathe {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(67,124,193,.16), 0 3px 10px rgba(48,101,165,.13); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 0 0 1px rgba(31,102,190,.22), 0 0 19px rgba(31,105,201,.24); }
}
@media (prefers-reduced-motion: reduce) {
  .re-effort-slider[data-effort="max"] .re-effort-track { animation: none; }
  .re-effort-knob,
  .re-effort-flare,
  body:not([data-ds-dark-theme]) .re-effort-track::before { transition: none; }
  .re-model-menu { animation: none; }
}
`;
function normalizeEffort(value) {
  return value === "off" || value === "max" ? value : "high";
}
function effortIndex(effort) {
  return LEVELS.findIndex((level) => level.key === effort);
}
function clampIndex(value) {
  return Math.max(0, Math.min(LEVELS.length - 1, Math.round(value)));
}
function currentModel(state) {
  if (state.current === null) return void 0;
  const group = state.groups.find((candidate) => candidate.id === state.current?.provider);
  return group?.models.find((candidate) => candidate.id === state.current?.model);
}
function supportsThreeLevels(state) {
  const ids = new Set(currentModel(state)?.reasoning?.efforts.map((effort) => effort.id) ?? []);
  return LEVELS.every((level) => ids.has(level.key));
}
function effectiveEffort(state) {
  const fallback = currentModel(state)?.reasoning?.defaultEffort;
  return normalizeEffort(state.current?.reasoningEffort ?? fallback);
}
function drawRadiation(context, width, height, time, state) {
  const origin = state.progress * width;
  const isDark = document.body.hasAttribute("data-ds-dark-theme");
  const cell = 4;
  const speed = state.dragging ? 2.8 : 1;
  context.clearRect(0, 0, width, height);
  if (origin <= 0) return;
  context.save();
  context.beginPath();
  context.rect(0, 0, origin, height);
  context.clip();
  for (let x = 0; x < origin; x += cell) {
    const delta = x + cell * 0.5 - origin;
    const distance = Math.abs(delta);
    const phaseA = distance / 10 - time * 74e-4 * speed;
    const phaseB = distance / 23 - time * 41e-4 * speed + 1.7;
    const phaseC = distance / 40 - time * 22e-4 * speed + 3.4;
    const sinA = Math.max(0, Math.sin(phaseA));
    const sinB = Math.max(0, Math.sin(phaseB));
    const sinC = Math.max(0, Math.sin(phaseC));
    const waveA = Math.pow(sinA, 2.6);
    const waveB = Math.pow(sinB, 3.2);
    const waveC = Math.pow(sinC, 4);
    const crest = Math.pow(sinA, 15) + Math.pow(sinB, 18) * 0.78;
    const wave = Math.min(1, waveA * 0.76 + waveB * 0.58 + waveC * 0.32);
    const trail = 0.38 + 0.62 * Math.exp(-distance / Math.max(55, width * 0.72));
    const pillar = Math.pow(Math.max(0, Math.sin(x / 20 + time * 16e-4)), 3) * 0.27;
    const columnEnergy = trail * (wave * 1.04 + pillar + crest * 0.32);
    if (columnEnergy > 0.012) {
      const nearness = Math.max(0, 1 - distance / Math.max(1, width * 0.78));
      const red = isDark ? Math.round(42 + 124 * nearness + 75 * wave) : Math.round(28 + 58 * nearness + 15 * wave);
      const green = isDark ? Math.round(56 + 58 * nearness + 44 * crest) : Math.round(88 + 72 * nearness + 30 * crest);
      const blue = isDark ? Math.round(175 + 72 * nearness + 8 * wave) : Math.round(182 + 62 * nearness);
      const alpha = isDark ? Math.min(0.88, columnEnergy * 0.72) : Math.min(0.62, columnEnergy * 0.54);
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      context.fillRect(x, 0, cell - 1, height);
    }
    for (let y = 0; y < height; y += cell) {
      const deltaY = y + cell * 0.5 - height * 0.5;
      const radial = Math.hypot(delta / 38, deltaY / 11);
      const halo = Math.exp(-radial * 0.96) * 1.08;
      const verticalShape = 0.58 + 0.42 * Math.cos(deltaY / height * Math.PI);
      const grain = 0.72 + 0.28 * Math.sin(x * 0.73 + y * 1.31 + time * 6e-3);
      const alpha = Math.min(0.96, (columnEnergy * 0.88 + halo + crest * 0.19) * verticalShape * grain);
      if (alpha < 0.035) continue;
      const hot = Math.max(0, 1 - radial / 2.4);
      const red = isDark ? Math.round(54 + 148 * hot + 42 * wave + 35 * crest) : Math.round(25 + 72 * hot + 12 * wave);
      const green = isDark ? Math.round(68 + 78 * hot + 46 * crest) : Math.round(98 + 72 * hot + 24 * crest);
      const blue = isDark ? Math.round(186 + 64 * hot) : Math.round(194 + 56 * hot);
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${isDark ? alpha : alpha * 0.72})`;
      context.fillRect(x, y, cell - 1, cell - 1);
    }
  }
  for (let i = 0; i < 14; i += 1) {
    const travel = (time * (state.dragging ? 0.16 : 0.065) * (0.78 + i % 5 * 0.09) + i * 23) % Math.max(30, origin + 64);
    const particleX = origin - travel;
    if (particleX < -24 || particleX > width + 16) continue;
    const particleY = 3 + (i * 13 + Math.sin(time * 3e-3 + i) * 5) % Math.max(7, height - 6);
    const length = 4 + i % 4 * 4 + (state.dragging ? 6 : 0);
    const alpha = 0.28 + i % 5 * 0.1;
    const streak = context.createLinearGradient(particleX, 0, particleX + length, 0);
    streak.addColorStop(0, isDark ? "rgba(72,118,255,0)" : "rgba(24,94,184,0)");
    streak.addColorStop(0.68, isDark ? `rgba(112,135,255,${alpha})` : `rgba(36,108,202,${alpha * 0.72})`);
    streak.addColorStop(1, isDark ? `rgba(236,222,255,${Math.min(1, alpha + 0.26)})` : `rgba(103,175,248,${Math.min(0.82, alpha + 0.18)})`);
    context.fillStyle = streak;
    context.fillRect(particleX, particleY, length, i % 3 === 0 ? 2 : 1);
  }
  const glow = context.createRadialGradient(origin, height / 2, 0, origin, height / 2, 24);
  glow.addColorStop(0, isDark ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.86)");
  glow.addColorStop(0.14, isDark ? "rgba(183,190,255,.54)" : "rgba(162,210,255,.48)");
  glow.addColorStop(0.44, isDark ? "rgba(103,74,255,.28)" : "rgba(37,112,207,.22)");
  glow.addColorStop(1, isDark ? "rgba(86,31,210,0)" : "rgba(25,91,181,0)");
  context.fillStyle = glow;
  context.fillRect(origin - 26, 0, 52, height);
  context.restore();
}
function EffortSlider({ directory }) {
  const directoryState = (0, import_react.useSyncExternalStore)(
    (notify) => directory.store.subscribe(notify),
    () => directory.store.getSnapshot()
  );
  const [effort, setEffort] = (0, import_react.useState)("high");
  const [preview, setPreview] = (0, import_react.useState)(1);
  const [committing, setCommitting] = (0, import_react.useState)(false);
  const [dragging, setDragging] = (0, import_react.useState)(false);
  const [localError, setLocalError] = (0, import_react.useState)(null);
  const canvasRef = (0, import_react.useRef)(null);
  const inputRef = (0, import_react.useRef)(null);
  const committedRef = (0, import_react.useRef)("high");
  const committingRef = (0, import_react.useRef)(false);
  const previewRef = (0, import_react.useRef)(1);
  const draggingRef = (0, import_react.useRef)(false);
  const pointerActiveRef = (0, import_react.useRef)(false);
  const activePointerIdRef = (0, import_react.useRef)(null);
  const globalPointerMoveRef = (0, import_react.useRef)(null);
  const globalPointerEndRef = (0, import_react.useRef)(null);
  const globalPointerCancelRef = (0, import_react.useRef)(null);
  const radiationRef = (0, import_react.useRef)({ progress: 0.5, dragging: false });
  const redrawRef = (0, import_react.useRef)(null);
  const available = directoryState.current !== null && supportsThreeLevels(directoryState);
  const busy = committing || directoryState.status === "selecting";
  const error = localError ?? directoryState.error;
  (0, import_react.useEffect)(() => {
    if (!available || committingRef.current || draggingRef.current) return;
    const next = effectiveEffort(directoryState);
    committedRef.current = next;
    previewRef.current = effortIndex(next);
    setEffort(next);
    setPreview(effortIndex(next));
    setLocalError(null);
  }, [available, directoryState]);
  (0, import_react.useEffect)(() => {
    directory.load().catch(() => void 0);
  }, [directory]);
  (0, import_react.useEffect)(() => {
    previewRef.current = preview;
    radiationRef.current.progress = preview / (LEVELS.length - 1);
    redrawRef.current?.();
  }, [preview]);
  (0, import_react.useEffect)(() => {
    radiationRef.current.dragging = dragging;
    redrawRef.current?.();
  }, [dragging]);
  (0, import_react.useEffect)(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");
    if (context === null) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let frame = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (time = performance.now()) => {
      drawRadiation(context, width, height, time, radiationRef.current);
    };
    const loop = (time) => {
      draw(time);
      frame = window.requestAnimationFrame(loop);
    };
    const redraw = () => {
      if (reducedMotion.matches) draw();
    };
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    const themeObserver = new MutationObserver(() => draw());
    resizeObserver.observe(canvas);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
    redrawRef.current = redraw;
    resize();
    draw();
    if (!reducedMotion.matches) frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      redrawRef.current = null;
    };
  }, []);
  const rollback = (0, import_react.useCallback)(() => {
    const previous = committedRef.current;
    previewRef.current = effortIndex(previous);
    pointerActiveRef.current = false;
    activePointerIdRef.current = null;
    draggingRef.current = false;
    setEffort(previous);
    setPreview(effortIndex(previous));
    setDragging(false);
  }, []);
  const commit = (0, import_react.useCallback)(async (raw) => {
    if (committingRef.current) return;
    committingRef.current = true;
    const index = clampIndex(raw);
    const next = LEVELS[index]?.key ?? "high";
    const previous = committedRef.current;
    setDragging(false);
    setEffort(next);
    previewRef.current = index;
    setPreview(index);
    setCommitting(true);
    setLocalError(null);
    try {
      const models = await directory.load();
      const fresh = {
        current: models.current,
        routable: models.routable,
        groups: models.groups,
        failures: models.failures,
        status: "ready",
        error: null
      };
      if (!supportsThreeLevels(fresh)) throw new Error("\u5F53\u524D\u6A21\u578B\u672A\u63D0\u4F9B off / high / max \u4E09\u6863\u63A8\u7406\u5F3A\u5EA6");
      await directory.select({
        provider: models.current.provider,
        model: models.current.model,
        reasoningEffort: next
      });
      const accepted = normalizeEffort(directory.store.getSnapshot().current?.reasoningEffort);
      committedRef.current = accepted;
      previewRef.current = effortIndex(accepted);
      setEffort(accepted);
      setPreview(effortIndex(accepted));
    } catch (cause) {
      committedRef.current = previous;
      previewRef.current = effortIndex(previous);
      setEffort(previous);
      setPreview(effortIndex(previous));
      setLocalError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      committingRef.current = false;
      setCommitting(false);
    }
  }, [directory]);
  const rawFromPointer = (input, clientX) => {
    const bounds = input.getBoundingClientRect();
    if (bounds.width <= 0) return previewRef.current;
    return Math.max(
      0,
      Math.min(LEVELS.length - 1, (clientX - bounds.left) / bounds.width * (LEVELS.length - 1))
    );
  };
  const showPointerPreview = (raw) => {
    previewRef.current = raw;
    setPreview(raw);
    setEffort(LEVELS[clampIndex(raw)]?.key ?? "high");
  };
  const beginDragging = (input, pointerId, clientX) => {
    pointerActiveRef.current = true;
    activePointerIdRef.current = pointerId;
    draggingRef.current = true;
    setDragging(true);
    showPointerPreview(rawFromPointer(input, clientX));
    try {
      if (!input.hasPointerCapture(pointerId)) input.setPointerCapture(pointerId);
    } catch {
    }
  };
  const moveDragging = (input, pointerId, clientX) => {
    if (!pointerActiveRef.current || activePointerIdRef.current !== pointerId) return;
    showPointerPreview(rawFromPointer(input, clientX));
  };
  const stopDragging = (input, pointerId, clientX) => {
    if (!pointerActiveRef.current) return;
    if (pointerId !== void 0 && activePointerIdRef.current !== pointerId) return;
    const raw = clientX === void 0 ? previewRef.current : rawFromPointer(input, clientX);
    pointerActiveRef.current = false;
    activePointerIdRef.current = null;
    draggingRef.current = false;
    if (pointerId !== void 0 && input.hasPointerCapture(pointerId)) {
      input.releasePointerCapture(pointerId);
    }
    showPointerPreview(raw);
    void commit(raw);
  };
  globalPointerMoveRef.current = (event) => {
    const input = inputRef.current;
    if (input !== null) moveDragging(input, event.pointerId, event.clientX);
  };
  globalPointerEndRef.current = (event) => {
    const input = inputRef.current;
    if (input !== null) stopDragging(input, event.pointerId, event.clientX);
  };
  globalPointerCancelRef.current = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    rollback();
  };
  (0, import_react.useEffect)(() => {
    const move = (event) => globalPointerMoveRef.current?.(event);
    const end = (event) => globalPointerEndRef.current?.(event);
    const cancel = (event) => globalPointerCancelRef.current?.(event);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", cancel, true);
    return () => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", cancel, true);
    };
  }, []);
  const onKeyDown = (event) => {
    const current = clampIndex(Number(event.currentTarget.value));
    let target;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "PageDown") {
      target = Math.max(0, current - 1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "PageUp") {
      target = Math.min(LEVELS.length - 1, current + 1);
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = LEVELS.length - 1;
    }
    if (target === void 0) return;
    event.preventDefault();
    void commit(target);
  };
  if (!available) return null;
  const progress = preview / (LEVELS.length - 1) * 100;
  const style = { "--re-progress": `${progress}%` };
  const title = error === null ? `\u63A8\u7406\u5F3A\u5EA6 \xB7 ${effort}` : `\u63A8\u7406\u5F3A\u5EA6\u8BBE\u7F6E\u5931\u8D25\uFF1A${error}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: `re-effort${dragging ? " is-dragging" : ""}${busy ? " is-busy" : ""}${error === null ? "" : " is-error"}`,
      title,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "re-effort-slider", "data-effort": effort, style, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-effort-track", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "re-effort-fx", "aria-hidden": "true", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, className: "re-effort-canvas" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-effort-flare" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              ref: inputRef,
              className: "re-effort-input",
              type: "range",
              min: "0",
              max: "2",
              step: "0.01",
              value: preview,
              disabled: busy,
              "aria-label": "\u63A8\u7406\u5F3A\u5EA6",
              "aria-valuetext": effort,
              onChange: (event) => {
                const raw = Number(event.currentTarget.value);
                showPointerPreview(raw);
              },
              onPointerDown: (event) => {
                event.preventDefault();
                event.currentTarget.focus();
                beginDragging(event.currentTarget, event.pointerId, event.clientX);
              },
              onPointerMove: (event) => moveDragging(event.currentTarget, event.pointerId, event.clientX),
              onPointerUp: (event) => stopDragging(event.currentTarget, event.pointerId, event.clientX),
              onPointerCancel: (event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                rollback();
              },
              onBlur: (event) => {
                stopDragging(event.currentTarget);
              },
              onKeyDown
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-effort-knob", "aria-hidden": "true" })
        ] }),
        error === null ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-effort-sr", role: "status", children: error })
      ]
    }
  );
}
function AdvancedModelSelect({
  locked,
  available,
  controller,
  directory,
  load,
  select
}) {
  const state = (0, import_react.useSyncExternalStore)(
    (notify) => directory.subscribe(notify),
    () => directory.getSnapshot()
  );
  const [open, setOpen] = (0, import_react.useState)(false);
  const [modelsOpen, setModelsOpen] = (0, import_react.useState)(false);
  const rootRef = (0, import_react.useRef)(null);
  const triggerRef = (0, import_react.useRef)(null);
  const choice = currentModel(state);
  const effort = effectiveEffort(state);
  const modelLabel = choice?.name ?? state.current?.model ?? "\u9009\u62E9\u6A21\u578B";
  const busy = state.status === "loading" || state.status === "selecting";
  (0, import_react.useEffect)(() => {
    if (!available) return;
    load();
  }, [available, load]);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setModelsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);
  if (!available) return null;
  const close = (restoreFocus = false) => {
    setOpen(false);
    setModelsOpen(false);
    if (restoreFocus) queueMicrotask(() => triggerRef.current?.focus());
  };
  const onKeyDown = (event) => {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    if (modelsOpen) setModelsOpen(false);
    else close(true);
  };
  const chooseModel = async (provider, model, defaultEffort) => {
    if (state.current?.provider === provider && state.current.model === model) {
      setModelsOpen(false);
      return;
    }
    const accepted = await select({
      provider,
      model,
      ...defaultEffort === void 0 ? {} : { reasoningEffort: defaultEffort }
    });
    if (accepted) setModelsOpen(false);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: rootRef, className: "re-model-root", onKeyDown, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        ref: triggerRef,
        type: "button",
        className: "re-model-trigger",
        "aria-label": `\u6A21\u578B ${modelLabel}\uFF0C\u63A8\u7406\u5F3A\u5EA6 ${effort}`,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        title: `${modelLabel} \xB7 ${effort}`,
        disabled: locked,
        onClick: () => {
          if (open) close();
          else {
            setOpen(true);
            setModelsOpen(false);
            load();
          }
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-name", children: modelLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-effort", children: effort }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-chevron", "aria-hidden": "true" })
        ]
      }
    ),
    open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-menu", role: "menu", "aria-label": "\u6A21\u578B\u4E0E\u63A8\u7406\u5F3A\u5EA6", "aria-busy": busy, children: modelsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "re-model-pane", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "re-model-back", onClick: () => setModelsOpen(false), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "\u2039" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u9009\u62E9\u6A21\u578B" })
      ] }),
      state.status === "loading" && state.groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-status", children: "\u6B63\u5728\u52A0\u8F7D\u6A21\u578B\u2026" }) : null,
      state.groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-group-title", children: group.name }),
        group.models.map((model) => {
          const selected = state.current?.provider === group.id && state.current.model === model.id;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              role: "menuitemradio",
              "aria-checked": selected,
              className: "re-model-option",
              disabled: busy,
              onClick: () => void chooseModel(group.id, model.id, model.reasoning?.defaultEffort),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "re-model-option-copy", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-option-name", children: model.name }),
                  model.description === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-option-desc", children: model.description })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-check", "aria-hidden": "true", children: selected ? "\u2713" : "" })
              ]
            },
            model.id
          );
        })
      ] }, group.id)),
      state.status === "ready" && state.groups.every((group) => group.models.length === 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-status", children: "\u6CA1\u6709\u53EF\u7528\u6A21\u578B" }) : null,
      state.error === null ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-error", children: state.error })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-advanced", children: supportsThreeLevels(state) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffortSlider, { directory: controller }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-status", children: "\u5F53\u524D\u6A21\u578B\u672A\u63D0\u4F9B off / high / max \u4E09\u6863" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-menu-separator" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          role: "menuitem",
          className: "re-model-row",
          disabled: busy,
          onClick: () => setModelsOpen(true),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-row-name", children: modelLabel }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-model-row-effort", children: effort }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-row-chevron", "aria-hidden": "true", children: "\u203A" })
          ]
        }
      ),
      state.error === null ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-model-error", children: state.error })
    ] }) }) : null
  ] });
}
function ReasoningEffortSetting() {
  const enabled = (0, import_react.useSyncExternalStore)(enabledStore.subscribe, enabledStore.getSnapshot);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "re-setting-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "re-setting-copy", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-setting-title", children: "\u63A8\u7406\u5F3A\u5EA6\u6ED1\u5757" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "re-setting-description", children: "\u5728\u6A21\u578B\u83DC\u5355\u4E2D\u663E\u793A\u4E09\u6863\u6ED1\u5757\u548C\u52A8\u6001\u8F90\u5C04\u7279\u6548" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "re-setting-control", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-setting-state", children: enabled ? "\u542F\u7528" : "\u505C\u7528" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-label": "\u542F\u7528\u63A8\u7406\u5F3A\u5EA6\u6ED1\u5757",
          "aria-checked": enabled,
          className: `re-setting-switch${enabled ? " is-on" : ""}`,
          onClick: () => enabledStore.set(!enabled),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "re-setting-switch-knob", "aria-hidden": "true" })
        }
      )
    ] })
  ] });
}
function apply(ctx) {
  const modelDirectories = ctx.get("modelDirectories");
  if (modelDirectories === void 0) return;
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.plugin = "dsh-reasoning-effort";
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, "reasoning-effort: styles");
  ctx.effect(() => {
    const syncStorage = (event) => {
      if (event.key !== ENABLED_STORAGE_KEY) return;
      enabledStore.set(event.newValue !== "false", false);
    };
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, "reasoning-effort: preference sync");
  ctx.slots.inject(
    SETTINGS_SLOT,
    () => ctx.slots.register(
      { name: SETTINGS_SLOT, id: "reasoning-effort-enabled", order: 15 },
      ReasoningEffortSetting
    )
  );
  ctx.slots.inject(SLOT, () => {
    let disposeModelSeat;
    const syncModelSeat = () => {
      if (!enabledStore.getSnapshot()) {
        disposeModelSeat?.();
        disposeModelSeat = void 0;
        return;
      }
      if (disposeModelSeat !== void 0) return;
      disposeModelSeat = ctx.slots.register(
        {
          name: SLOT,
          priority: -100,
          inject: (sessionId) => {
            const controller = modelDirectories.directoryFor(sessionId);
            return {
              available: true,
              controller,
              directory: controller.store,
              load: () => controller.load().then(() => void 0, () => void 0),
              select: (selection) => controller.select(selection).then(() => true, () => false)
            };
          }
        },
        AdvancedModelSelect
      );
    };
    const unsubscribe = enabledStore.subscribe(syncModelSeat);
    syncModelSeat();
    return () => {
      unsubscribe();
      disposeModelSeat?.();
    };
  });
}

    return module.exports;
  },
});
