# dsh-reasoning-effort 模型主题与奔跑小人定制开发标准规范 (THEME_GUIDE)

本文档定义了为 `dsh-reasoning-effort` 插件新增模型系列主题（如 DeepSeek、OpenAI、Claude、Gemini、Kimi 等）的标准操作流程（SOP）、设计规范以及历史采坑避错指南。后续新增或修改任何模型主题时，必须严格参照本规范执行。

---

## 目录
1. [架构与核心设计原则](#一架构与核心设计原则)
2. [标准开发五步法 (SOP)](#二标准开发五步法-sop)
   - [第一步：素材处理与精灵图重构](#第一步素材处理与精灵图重构)
   - [第二步：CSS 样式与双模主题定义](#第二步css-样式与双模主题定义)
   - [第三步：Canvas 能量波与粒子动画定制](#第三步canvas-能量波与粒子动画定制)
   - [第四步：模型识别优先级规则编写](#第四步模型识别优先级规则编写)
   - [第五步：构建与校验](#第五步构建与校验)
3. [常见逻辑错误与避坑清单 (Pitfalls & Failure Modes)](#三常见逻辑错误与避坑清单)
4. [各模型家族已落地配色基准表](#四各模型家族已落地配色基准表)

---

## 一、架构与核心设计原则

`dsh-reasoning-effort` 采用双渲染引擎与模块化主题设计：
1. **CSS 8 帧步进动画（Step Animation）**：
   - 动画精灵图标准尺寸固定为 **`2304 × 395 px`**（8 帧 × 288px 等宽单元格）；
   - CSS 配置：`background-size: 800% 100%`，配合 `@keyframes re-chibi-run` 逐帧切换；
   - 滑块旋钮尺寸为 `width: 40px; height: 55px`（宽高比 $40/55 \approx 0.727$），与 $288/395 \approx 0.729$ 精准契合。
2. **Canvas 能量辐射波与粒子流（drawRadiation）**：
   - 底层 Canvas 根据滑块拖拽进度动态渲染：柱状能量波、径向热斑、流星拖尾粒子、旋钮中心光晕；
   - 随深色（Dark）/浅色（Light）模式动态切换透明度与配色。
3. **模型优先的主题检测（detectModelTheme）**：
   - 多模型聚合服务（如 Google Antigravity、AWS Bedrock、Vertex AI、OpenRouter 等）会同时提供不同品牌的模型；
   - **模型标识（Model ID / Display Name）必须严格高于供应商标识（Provider）**。

---

## 二、标准开发五步法 (SOP)

### 第一步：素材处理与精灵图重构

> ⚠️ **严禁直接按算术均分切片！** 原始图片中的 8 帧动作往往重心不一、两脚跨度与向后飘逸的头发间距不均匀。直接均分必导致上一帧露出下一帧的白发或残影。

1. **姿态边界分析（Valley Detection）**：
   - 扫描原始素材各 X 坐标的像素不透明度积分（Column Alpha Density）；
   - 找到 7 处动作交界的“能量低谷”，严格确定每个动作的物理区间 `[minX, maxX]`；
   - 计算每个动作自身的实际几何重心 `(cx, cy)`。
2. **独立隔离重绘至标准网格**：
   - 目标画板：`2304 × 395 px`，8 个 `288 × 395 px` 单元格；
   - 缩放系数：通常取 `scale = 0.88 ~ 0.92`，确保人物高度在 `340 ~ 360 px` 之间；
   - 严格像素约束：渲染第 $i$ 帧时，**仅允许取原始图中属于该动作的 `[minX_i, maxX_i]` 范围像素**，区域外强行设为 `alpha = 0`；
   - 中心对齐：将各动作重心映射至各单元格标准坐标 `(i * 288 + 144, 198)`；
   - 边距检查：确保每一帧单元格的左、右、上、下边距均 $\ge 8\text{px}$ 纯透明。
3. **保存路径**：
   - 保存为 `assets/<theme>-runner-strip.png`。

---

### 第二步：CSS 样式与双模主题定义 (`src/client/styles.ts`)

1. **引入资源**：
   ```ts
   import <theme>RunnerSprite from '../../assets/<theme>-runner-strip.png'
   ```
2. **深色模式配置（Dark Mode）**：
   ```css
   /* 1. 精灵图与光晕 */
   .re-effort[data-re-theme="<theme>"].is-chibi .re-effort-knob,
   .re-effort.theme-<theme>.is-chibi .re-effort-knob {
     background-image: url("${<theme>RunnerSprite}");
     filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .32)) drop-shadow(0 0 6px rgba(...));
   }
   /* 2. 轨道渐变底色与高光纹理 */
   .re-effort[data-re-theme="<theme>"] .re-effort-track,
   .re-effort.theme-<theme> .re-effort-track {
     background: linear-gradient(90deg, #... 0%, #... 100%);
     box-shadow: inset 0 1px 0 rgba(...), 0 3px 10px rgba(...);
   }
   /* 3. 拖拽高亮与光耀 (Flare) */
   .re-effort[data-re-theme="<theme>"] .re-effort-flare,
   .re-effort.theme-<theme> .re-effort-flare { ... }
   /* 4. 满档呼吸效果 */
   .re-effort[data-re-theme="<theme>"] .re-effort-slider[data-top] .re-effort-track {
     animation-name: re-effort-dark-<theme>-breathe;
   }
   /* 5. 菜单与高亮文本色 */
   .re-model-root[data-re-theme="<theme>"] .re-model-effort,
   .re-model-root[data-re-theme="<theme>"] .re-model-check { color: #...; }
   ```
3. **浅色模式配置（Light Mode）**：
   ```css
   body:not([data-ds-dark-theme]) .re-effort[data-re-theme="<theme>"] .re-effort-track {
     background: #...; /* 柔和浅底 */
     box-shadow: inset 0 1px 0 rgba(255,255,255,.95), ...;
   }
   body:not([data-ds-dark-theme]) .re-effort[data-re-theme="<theme>"] .re-effort-track::before {
     background: linear-gradient(90deg, #... 0%, #... 100%); /* 进度的实体填充色 */
   }
   body:not([data-ds-dark-theme]) .re-effort[data-re-theme="<theme>"] .re-effort-slider[data-top] .re-effort-track {
     animation-name: re-effort-light-<theme>-breathe;
   }
   ```
4. **添加呼吸关键帧**：
   - `@keyframes re-effort-dark-<theme>-breathe`
   - `@keyframes re-effort-light-<theme>-breathe`

---

### 第三步：Canvas 能量波与粒子动画定制 (`src/client/index.tsx`)

在 `drawRadiation` 函数中补充 4 处分支：
1. **能量柱颜色（Column Energy）**：
   - 根据 `x / origin` 进度比与 `theme` 计算动态 RGB 渐变；
2. **径向热斑（Halo / Hot Spot）**：
   - 核心波峰附近的强化高亮；
3. **流星粒子拖尾（Particle Streaks）**：
   - 粒子产生的主题标志性颜色与高光尾翼；
4. **旋钮径向光晕（Knob Radial Glow）**：
   - 滑块当前位置的环形外发光。

---

### 第四步：模型识别优先级规则编写 (`src/client/index.tsx`)

在 `detectModelTheme(provider, modelId, modelName)` 中更新：
```ts
export type ModelThemeKind = 'deepseek' | 'openai' | 'claude' | 'gemini' | 'kimi' | '<theme>'

export function detectModelTheme(provider?, modelId?, modelName?): ModelThemeKind {
  const p = (provider ?? '').toLowerCase()
  const m = `${modelId ?? ''} ${modelName ?? ''}`.toLowerCase()

  // 1. 【第一优先级】模型 ID 与展示名称判断（防止多模型聚合 Provider 误判）
  if (m.includes('claude') || m.includes('opus') || m.includes('sonnet')) return 'claude'
  if (m.includes('gemini') || m.includes('gemma')) return 'gemini'
  if (m.includes('kimi') || m.includes('moonshot')) return 'kimi'
  if (m.includes('gpt') || m.includes('openai') || /(?:^|[\b\s/_.-])o[1-9](?:[\b\s/_.-]|$)/.test(m)) return 'openai'
  if (m.includes('deepseek') || /(?:^|[\b\s/_.-])r1(?:[\b\s/_.-]|$)/.test(m)) return 'deepseek'
  if (m.includes('<new_model_keyword>')) return '<theme>'

  // 2. 【第二优先级】供应商 Provider 兜底判断（仅当模型名称无法判定时）
  if (p.includes('claude') || p.includes('anthropic')) return 'claude'
  if (p.includes('gemini') || p.includes('google')) return 'gemini'
  if (p.includes('kimi') || p.includes('moonshot')) return 'kimi'
  if (p.includes('openai')) return 'openai'
  if (p.includes('deepseek')) return 'deepseek'
  if (p.includes('<new_provider_keyword>')) return '<theme>'

  return 'deepseek'
}
```

---

### 第五步：构建与校验

1. 在 `plugins/dsh-reasoning-effort` 执行构建：
   ```powershell
   pnpm run build
   ```
2. 校验输出：
   - `lib/client/index.js`（已包含 Base64 DataURL 嵌入的精灵图）
   - `lib/client/index.d.ts`
3. 重启 `dsh web` 并刷新浏览器测试深色与浅色模式。

---

## 三、常见逻辑错误与避坑清单

| 序号 | 错误现象 | 根本原因 | 标准预防与解决策略 |
| :--- | :--- | :--- | :--- |
| ❌ **1** | **人物切片重影 / 卡在两个动作中间** | 素材图中动作间距不匀，使用等距均分导致切入相邻帧的头发或肢体。 | **必须使用低谷分割法（Valley Detection）**：逐像素扫描每个动作的物理起止坐标，独立采样并映射到 288px 单元格中心，四周必须留有纯透明缓冲区。 |
| ❌ **2** | **使用第三方/聚合渠道时主题识别错乱** | `detectModelTheme` 优先判断了 Provider（如 `google-antigravity` 提供了 Claude 模型，却因命中 `google` 被误判为 Gemini）。 | **模型标识永远优先于供应商**！必须先匹配 Model ID 与 Display Name，无特征时才允许回退检查 Provider。 |
| ❌ **3** | **动画步进抖动 / 变形** | 精灵图总宽度不是 $8 \times 288 = 2304\text{px}$，或高度不匹配。 | 严格保持输出图片为 `2304 × 395px`，单帧比例维持在 `288:395`，与 CSS `40:55` 旋钮契合。 |
| ❌ **4** | **浅色模式下轨道变黑或无进度** | 遗漏了 `body:not([data-ds-dark-theme])` 下的 `.re-effort-track::before` 进度填充渐变。 | 浅色模式下轨道的实体进度是由 `::before` 伪元素控制的，必须同时配置浅色底色与 `::before` 填充渐变。 |
| ❌ **5** | **修改代码或图片后页面无变化** | 客户端 bundle 在 Web Host 启动时加载，仅刷新浏览器无法重载更新。 | 每次重新执行 `pnpm run build` 后，必须在控制台按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 重新运行 `dsh web` 并刷新页面。 |

---

## 四、各模型家族已落地配色基准表

| 模型系列 | 主题 Key | 服饰与形象特征 | 轨道主调渐变 (Dark / Light) | 粒子与光晕特效 |
| :--- | :--- | :--- | :--- | :--- |
| **DeepSeek** | `deepseek` | 蓝发女仆（大肥鱼） | 经典科技深蓝 (`#03040a` → `#5d35a0`) / 晴空冰蓝 (`#eef4fc` → `#246cca`) | 科技蓝能量波与流星 |
| **OpenAI / GPT** | `openai` | 白发龙娘小人 | Codex 霓虹深紫 (`#090412` → `#6b21a8`) / 丁香柔紫 (`#f7f2fc` → `#9333ea`) | 霓虹紫罗兰星芒粒子 |
| **Claude** | `claude` | 橙发花饰少女 | Anthropic 陶土暗橙 (`#120803` → `#c2410c`) / 暖杏浅橙 (`#fdf4ee` → `#ea580c`) | 暖橙金辉与陶土光环 |
| **Gemini** | `gemini` | 星芒紫发猫耳少女 | Google 官方四色星芒全光谱渐变 (`#120902` → `#061c14` → `#08224d` → `#2a105c` → `#5a146e` → `#84184c`) | 金/绿/蓝/紫/红五色星芒粒子 |
| **Kimi** | `kimi` | 银白发月相女仆少女 | 星空午夜深蓝 (`#090c1e` → `#4359b8`) / 月光水晶蓝 (`#eff2fd` → `#101633` → `#dca838`) | 午夜蓝光柱 + 金色星辰流星粒子 |
| **GLM / ZCode** | `glm` | 黑发眼罩（Z标）女仆少女 | 曜石暗夜黑渐变 (`#05070c` → `#223f66`) / 冰川冷青白 (`#edf2f7` → `#0284c7`) | 赛博青蓝能量柱 + 冷银星芒粒子 |
| **Qwen / 通义千问** | `qwen` | 空色长卷发星徽披肩少女 | 空灵天蓝晴空渐变 (`#0c1538` → `#5f9ef8`) / 晴空微曦蓝 (`#edf4fe` → `#4d8df6` → `#f6c845`) | 空灵天蓝能量柱 + 金色星辉粒子 |
| **MiniMax / 海螺** | `minimax` | 暖橙粉发贝雷帽信使少女 | 丝绒红霞至珊瑚橙红渐变 (`#180408` → `#ff5436`) / 浅粉绯云珊瑚底 (`#fef2f2` → `#e11d48` → `#ff6b4a`) | 珊瑚橙红流光 + 霓虹红霞粒子 |
