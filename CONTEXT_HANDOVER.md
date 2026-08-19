# dsh-reasoning-effort 项目上下文与交接文档 (CONTEXT_HANDOVER)

本文档记录了 `dsh-reasoning-effort` 插件从安装、多模型主题定制、动画精灵图重构到当前状态的全部技术细节、架构设计与交接信息，供在新的对话中无缝继续开发。

---

## 1. 核心定位与项目路径

- **插件源码目录**：`C:\Users\15528\.dsh\plugins\dsh-reasoning-effort`
- **DSH Web Profile 挂载**：`C:\Users\15528\.dsh\profiles\web\package.json`（通过 `link:C:\Users\15528\.dsh\plugins\dsh-reasoning-effort` 软链接集成）
- **开发规范文档**：`C:\Users\15528\.dsh\plugins\dsh-reasoning-effort\THEME_GUIDE.md`
- **全局代理指令**：`C:\Users\15528\.dsh\AGENTS.md`（已声明遵循 `THEME_GUIDE.md` 规范）

---

## 2. 当前各模型主题进度与状态矩阵

| 主题 Key | 覆盖模型家族 | Q 版奔跑小人形象 | 轨道渐变风格 (Dark / Light) | 粒子与流星光晕 | 状态 | 精灵图文件 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `deepseek` | DeepSeek 系列（R1, V3, 默认兜底） | 蓝发女仆（大肥鱼） | 经典科技深蓝 (`#03040a` → `#5d35a0`) / 晴空冰蓝 | 科技蓝能量波与流星 | ✅ 已完成并验证 | `assets/chibi-runner-strip.png` |
| `openai` | OpenAI / GPT / Codex / O 系列 (`o1`, `o3`, `o4`, `gpt-5.6`) | 白发龙娘小人 | Codex 霓虹深紫 (`#090412` → `#6b21a8`) / 丁香柔紫 | 霓虹紫罗兰星芒粒子 | ✅ 已完成并验证 | `assets/gpt-runner-strip.png` |
| `claude` | Anthropic Claude 系列 (`Opus`, `Sonnet`, `Haiku`) | 橙发花饰少女 | Anthropic 陶土暖橙 (`#120803` → `#c2410c`) / 暖杏浅橙 | 陶土金辉与暖橙光环 | ✅ 已完成并验证 | `assets/claude-runner-strip.png` |
| `gemini` | Google Gemini 系列 (`Flash`, `Pro`, `Gemma`) | 星芒紫发猫耳少女 | Google 官方四色星芒全光谱渐变 (`#120902` → `#84184c`) | 金/绿/蓝/紫/红五色星芒粒子 | ✅ 已完成并验证 | `assets/gemini-runner-strip.png` |
| `kimi` | Moonshot Kimi 系列 (`Kimi K2.5`, `K1`, `Chat`) | 银白发月相女仆少女 | 星空午夜深蓝 (`#090c1e` → `#4359b8`) / 月光水晶蓝 | 午夜蓝光柱 + 金色星辰流星 | ✅ 已完成并验证 | `assets/kimi-runner-strip.png` |
| `glm` | 智谱 GLM / ZCode / ChatGLM 系列 (`GLM-4`, `GLM-Zero`, `CodeGeeX`) | 黑发眼罩（Z标）女仆少女 | 曜石暗夜黑渐变 (`#05070c` → `#223f66`) / 冰川冷青白 (`#edf2f7` → `#0284c7`) | 赛博青蓝能量柱 + 冷银星芒粒子 | ✅ 已完成并验证 | `assets/glm-runner-strip.png` |
| `qwen` | 阿里通义千问 Qwen / QwQ 系列 (`Qwen-Max`, `Qwen-Plus`, `Qwen2.5`) | 空色长卷发星徽披肩少女 | 空灵天蓝晴空渐变 (`#0c1538` → `#5f9ef8`) / 晴空微曦蓝 (`#edf4fe` → `#4d8df6` → `#f6c845`) | 空灵天蓝能量柱 + 金色星辉粒子 | ✅ 已完成并验证 | `assets/qwen-runner-strip.png` |
| `minimax` | MiniMax / 海螺 Hailuo / ABAB 系列 (`MiniMax-Text-01`, `abab6.5`) | 暖橙粉发贝雷帽信使少女 | 丝绒红霞至珊瑚橙红渐变 (`#180408` → `#ff5436`) / 浅粉绯云珊瑚底 (`#fef2f2` → `#e11d48` → `#ff6b4a`) | 珊瑚橙红流光 + 霓虹红霞粒子 | ✅ 已完成并验证 | `assets/minimax-runner-strip.png` |

---

## 3. 待处理的关键问题（当前未完结任务）

（目前 8 个核心模型主题 DeepSeek、OpenAI、Claude、Gemini、Kimi、GLM、Qwen、MiniMax 均已完成构建与全通道像素隔离验证，等待安排后续其他新模型版本的制作）

---

## 4. 关键核心技术细节

1. **精灵图动画标准（CSS Sprite）**：
   - 所有精灵图统一为 **`2304 × 395 px`**（8 帧 × 288px 等宽单元格）；
   - CSS 动画为 `background-size: 800% 100%`，配合 `@keyframes re-chibi-run` 逐帧切换；
   - 旋钮尺寸为 `40 × 55 px`，单帧比例与旋钮比例高度契合（$\approx 0.727$）。
2. **像素级独立抠图与低谷分割（Valley Detection）**：
   - 严禁对用户提供的 8 帧跑步图进行均分切片；
   - 必须通过像素密度积分确定各动作的物理截止线，提取纯净独立帧并映射至各单元格标准中心 `(144, 198)`，四周保留 $\ge 8\text{px}$ 纯透明安全区。
3. **模型优先的主题检测机制（detectModelTheme）**：
   - **模型标识（Model ID / Display Name）永远高于 Provider**；
   - 支持多模型聚合平台（Google Antigravity、Vertex AI、AWS Bedrock、OpenRouter 等）下精准识别真实模型品牌。
4. **Canvas 动态能量辐射系统（drawRadiation）**：
   - 根据滑块进度动态计算：柱状能量波、径向热斑、流星粒子拖尾、旋钮径向光晕；
   - 深浅色双模自适应。

---

## 4. 关键代码文件结构

- `src/client/index.tsx`：
  - 组件入口与 DOM 装配（`EffortSlider`, `ModelSeat`）；
  - Canvas 能量波渲染器 `drawRadiation`；
  - 品牌与模型识别函数 `detectModelTheme`。
- `src/client/styles.ts`：
  - 各主题深浅色 CSS 变量、轨道背景、旋钮发光、流光高耀、呼吸动画关键帧。
- `assets/`：
  - `chibi-runner-strip.png`、`gpt-runner-strip.png`、`claude-runner-strip.png`、`gemini-runner-strip.png`、`kimi-runner-strip.png`、`glm-runner-strip.png`、`qwen-runner-strip.png`、`minimax-runner-strip.png`。
- `scripts/build-client.mjs`：
  - Esbuild 客户端打包脚本（自动将 PNG 转为 DataURL 内嵌打包至 `lib/client/index.js` 并注入 `window.__ModuleLoader__`）。

---

## 5. 构建与调试操作

- **重新构建**：
  ```powershell
  cd C:\Users\15528\.dsh\plugins\dsh-reasoning-effort
  pnpm run build
  ```
- **重启 Web Host（必须重启才可加载新 bundle）**：
  - 在运行 `dsh web` 的控制台按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 退出；
  - 重新执行 `dsh web`；
  - 刷新浏览器页面 [http://127.0.0.1:3080](http://127.0.0.1:3080)。
