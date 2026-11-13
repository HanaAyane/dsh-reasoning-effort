import type { RunnerFamily } from './runners.js'

type TrailColor = readonly [dark: string, light: string]

const colors: Record<RunnerFamily, readonly TrailColor[]> = {
  deepseek: [['112 135 255', '36 108 202'], ['154 194 255', '27 94 184']],
  openai: [['183 108 255', '122 48 207'], ['230 165 255', '150 62 204']],
  claude: [['255 143 73', '192 72 21'], ['255 193 116', '212 98 25']],
  gemini: [['184 212 255', '100 121 202']],
  grok: [['255 197 74', '198 130 21'], ['255 224 146', '157 97 10']],
  kimi: [['121 149 255', '62 81 185'], ['255 224 143', '169 104 18']],
  glm: [['85 221 255', '12 106 150'], ['132 168 230', '46 72 124']],
  qwen: [['110 185 255', '34 107 189'], ['255 221 133', '172 106 16']],
  minimax: [['255 120 106', '197 63 50'], ['255 174 131', '193 85 47']],
}
const trailRows = [0.53, 0.36, 0.73, 0.25, 0.62]

interface Streak {
  start: number
  end: number
  y: number
  height: number
  opacity: number
}

export function effectColor(family: RunnerFamily, isDark: boolean, index = 0): string {
  const palette = colors[family]
  const [dark, light] = palette[index % palette.length]!
  return isDark ? dark : light
}

export function drawRunnerStreak(
  context: CanvasRenderingContext2D,
  family: RunnerFamily,
  index: number,
  isDark: boolean,
  { start, end, y, height, opacity }: Streak,
): void {
  const color = effectColor(family, isDark, index)
  const tip = family === 'gemini' ? (isDark ? '241 245 255' : '184 203 255') : isDark ? '255 246 255' : color
  const gradient = context.createLinearGradient(start, 0, end, 0)
  gradient.addColorStop(0, `rgb(${color} / 0)`)
  gradient.addColorStop(0.65, `rgb(${color} / ${opacity * 0.65})`)
  gradient.addColorStop(0.94, `rgb(${color} / ${opacity})`)
  gradient.addColorStop(1, `rgb(${tip} / ${opacity})`)
  context.fillStyle = gradient
  context.fillRect(start, y, end - start, height)
}

export function drawDragTrail(
  context: CanvasRenderingContext2D,
  family: RunnerFamily,
  isDark: boolean,
  head: number,
  height: number,
  distance: number,
  amount: number,
): void {
  if (amount <= 0 || head <= 0) return

  const opacity = Math.sqrt(amount)
  const length = 28 + amount * 62
  for (const [i, row] of trailRows.entries()) {
    const drift = i === 0 ? 0 : (distance * (0.75 + i * 0.12) + i * 13) % 36
    const end = head - drift
    if (end <= 0) continue
    drawRunnerStreak(context, family, i, isDark, {
      start: end - length * (1 - i * 0.12),
      end,
      y: height * row,
      height: i === 0 ? 3 : 2,
      opacity: opacity * (i === 0 ? 0.98 : 0.82),
    })
  }
}
