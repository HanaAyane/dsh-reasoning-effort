import type { RunnerFamily } from './runners.js'

interface TrackTheme {
  dark: string
  light: string
  fill: string
  peak: string
  accent: readonly [dark: string, light: string]
}

const trackThemes = {
  deepseek: {
    dark: 'linear-gradient(100deg, #03040a 0%, #071126 22%, #101d4c 45%, #302262 70%, #5d35a0 100%)',
    light: 'var(--dsw-static-blue-75, #e5f0ff)',
    fill: 'linear-gradient(90deg, #fff 0%, #e2f0ff 20%, #a8d0fb 57%, #438fdf 100%)',
    peak: 'linear-gradient(90deg, #fff 0%, #d7eaff 18%, #75afea 54%, #0751ad 100%)',
    accent: ['#8879ff', '#377ec9'],
  },
  openai: {
    dark: 'linear-gradient(100deg, #090214 0%, #17072e 22%, #2c0f5e 45%, #4e1896 70%, #7c2ae8 100%)',
    light: '#f4ecfd',
    fill: 'linear-gradient(90deg, #fff 0%, #f6ebff 20%, #dab8fb 57%, #9d4fe8 100%)',
    peak: 'linear-gradient(90deg, #fff 0%, #edd4ff 18%, #bd6fed 54%, #7b12d4 100%)',
    accent: ['#b56cff', '#9348c8'],
  },
  claude: {
    dark: 'linear-gradient(100deg, #120601 0%, #260f04 22%, #522108 45%, #8c3b10 70%, #d96323 100%)',
    light: '#fdf5ee',
    fill: 'linear-gradient(90deg, #fff 0%, #fff1e5 20%, #fcd0ab 57%, #ee742d 100%)',
    peak: 'linear-gradient(90deg, #fff 0%, #fedfc4 18%, #f89d58 54%, #cc4e08 100%)',
    accent: ['#ff934f', '#c56334'],
  },
  gemini: {
    dark: 'linear-gradient(100deg, #120902 0%, #061c14 18%, #08224d 38%, #2a105c 64%, #5a146e 84%, #84184c 100%)',
    light: '#f4f2fb',
    fill: 'linear-gradient(90deg, #fff 0%, #fff1d6 15%, #c8f5d6 35%, #bce2fe 55%, #d8c6fc 78%, #fdbcd5 100%)',
    peak: 'linear-gradient(90deg, #fff 0%, #fbbd23 15%, #10b981 35%, #3b82f6 55%, #7c3aed 78%, #f43f5e 100%)',
    accent: ['#b37bff', '#8757ca'],
  },
  grok: {
    dark: 'linear-gradient(100deg, #17060d 0%, #2e0916 22%, #501022 45%, #73162e 70%, #92213b 100%)',
    light: '#f7e6ea',
    fill: 'linear-gradient(90deg, #f9e3e7 0%, #dda0ab 23%, #ae5066 54%, #84233e 100%)',
    peak: 'linear-gradient(90deg, #f4d0d8 0%, #c77c91 20%, #952c4a 55%, #601329 100%)',
    accent: ['#ffcf68', '#ad7719'],
  },
  kimi: {
    dark: 'linear-gradient(90deg, #090c1e 0%, #121838 25%, #1d2757 55%, #2c3c84 80%, #4359b8 100%)',
    light: '#eff2fd',
    fill: 'linear-gradient(90deg, #101633 0%, #1e285a 28%, #31428f 60%, #4d64c9 86%, #dca838 100%)',
    peak: 'linear-gradient(90deg, #0d122b 0%, #1a2350 25%, #2c3b82 55%, #465cb8 80%, #f4b428 100%)',
    accent: ['#879bff', '#515fbc'],
  },
  glm: {
    dark: 'linear-gradient(90deg, #05070c 0%, #0b111c 25%, #111d2e 55%, #182b45 80%, #223f66 100%)',
    light: '#edf2f7',
    fill: 'linear-gradient(90deg, #050811 0%, #0f1c2e 28%, #162b47 60%, #1e3d64 86%, #0284c7 100%)',
    peak: 'linear-gradient(90deg, #03050a 0%, #0b1524 25%, #12243d 55%, #19365c 80%, #0ea5e9 100%)',
    accent: ['#6ad5f5', '#147da7'],
  },
  qwen: {
    dark: 'linear-gradient(90deg, #0c1538 0%, #162862 25%, #244598 55%, #386ad4 80%, #5f9ef8 100%)',
    light: '#edf4fe',
    fill: 'linear-gradient(90deg, #132454 0%, #1e3e8f 28%, #3162d0 60%, #4d8df6 86%, #f6c845 100%)',
    peak: 'linear-gradient(90deg, #0f1c44 0%, #1a357c 25%, #2a55b8 55%, #4681ee 80%, #fbbf24 100%)',
    accent: ['#83c4ff', '#3979cb'],
  },
  minimax: {
    dark: 'linear-gradient(90deg, #24090b 0%, #521312 22%, #99281a 48%, #e04424 74%, #ff6f43 100%)',
    light: '#fff5f2',
    fill: 'linear-gradient(90deg, #7c1a16 0%, #b82d20 28%, #e84c2a 60%, #ff6f43 86%, #ff8e68 100%)',
    peak: 'linear-gradient(90deg, #661210 0%, #a32418 25%, #d94020 55%, #f75d33 80%, #ff7c52 100%)',
    accent: ['#ff826e', '#d25a43'],
  },
} satisfies Record<RunnerFamily, TrackTheme>

export const trackThemeCSS = Object.entries(trackThemes).map(([family, theme]) => `
.re-effort[data-re-theme="${family}"] {
  --re-track-dark: ${theme.dark};
  --re-track-light: ${theme.light};
  --re-track-fill: ${theme.fill};
  --re-track-peak: ${theme.peak};
  --re-track-accent: ${theme.accent[0]};
}
body:not([data-ds-dark-theme]) .re-effort[data-re-theme="${family}"] {
  --re-track-accent: ${theme.accent[1]};
}
`).join('')
