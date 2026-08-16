<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort 为 DeepSeek Harness 提供 Codex 风格的模型与推理强度滑块" width="1200">

# dsh-reasoning-effort

**把 Codex 风格的“模型 + 推理强度”控件直接带进 DeepSeek Harness。**

[English](README.en.md) · [最新发行版](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [反馈问题](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![main 0.6.0](https://img.shields.io/badge/main-0.6.0-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/tree/main)
[![DSH 0.1.0-rc.6](https://img.shields.io/badge/DSH-0.1.0--rc.6-8b5cf6?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)

</div>

第一次打开插件时，你会在 DSH 输入框下方看到新的模型入口。点击后，弹层上方是推理强度滑块，档位随当前模型自动适配，下方仍然是熟悉的模型选择入口。插件默认启用，并与 DSH 的 `/model` 命令保持同步。

## 第一次使用：三步完成

### 1. 安装插件

#### 让 Agent 安装（推荐）

如果当前 Agent 可以执行终端命令，把下面这段话完整发送给它：

```text
请为 DeepSeek Harness 的 web Profile 安装 dsh-reasoning-effort 插件。

只执行下面两条命令，不要修改其他 Profile：
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#main
dsh --profile web --dump-config

确认输出中出现 dsh-reasoning-effort 后告诉我安装结果。
不要替我关闭或重启正在运行的 DSH；安装完成后提醒我手动重启 DSH Web Host。
```

Agent 应当返回安装结果，并明确告诉你配置中是否已经出现 `dsh-reasoning-effort`。

#### 手动安装

也可以自己打开 PowerShell 执行：

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#main
dsh --profile web --dump-config
```

`main` 当前版本为 `0.6.0`，与最新发行 Tag `v0.6.0` 一致。`#main` 始终安装最新代码（之后可能包含未发布改动）；如需固定在当前版本，可把命令中的 `#main` 改为 `#v0.6.0`。

### 2. 重启 DSH Web Host

插件在 Web Host 启动时载入。安装命令完成后，请结束当前 Host 并重新启动，再刷新 DSH 页面。

### 3. 打开模型入口

1. 新建或打开一个会话。
2. 点击输入框下方显示“模型 + 当前强度”的按钮。
3. 拖动滑块或点击轨道，释放后会吸附到最近的档位。
4. 点击滑块下方的模型行，可以继续进入 DSH 原生模型列表。

完成后，你看到的效果应当与下面一致：

<img src="assets/readme/themes.webp" alt="推理强度选择器在 DeepSeek Harness 深色和浅色主题中的真实效果" width="1200">

## 档位从哪里来

滑块显示的档位完全来自当前模型在 DSH 模型目录中公开的 `reasoning.efforts`——档数、名称与顺序都由模型决定，插件自动适配。以常见的三档组合为例：

| 档位 | 适合场景 | 体验倾向 |
| --- | --- | --- |
| `off` | 简单问答、改写、快速操作 | 更快 |
| `high` | 日常编程、分析和多步骤任务 | 速度与推理平衡 |
| `max` | 复杂调试、规划和高难度任务 | 更充分的推理 |

DeepSeek 系模型通常公开 `off` / `high` / `max`；GLM coding 系模型（如 GLM-5.2）公开 `off` / `low` / `medium` / `high` / `xhigh` 五档。滑块只是提交当前模型公开的 effort 值，不会绕过模型或部署本身的能力限制。模型公开的档位少于两档、或没有声明任何档位时，菜单会显示"当前模型未提供推理强度档位"。

## 档位指引（自定义 provider）

DSH 内置路由的档位来自 pi-ai 目录，插件**完全只读、绝不修改**。只有你在 `settings.yaml` 的 `llm-pi-ai` 里自己声明的模型，插件才会给指引：

1. 打开模型菜单。若当前模型是你自定义声明、且目录读不到档位（或声明与知识库不符），菜单里会出现 **查看档位声明指引**；
2. 面板展示建议档位（知识库命中时，如 GLM-5.2 的 minimal/low/medium/high）、一段可直接复制的完整条目 YAML（含 `- id:` 行，原有 name 等字段自动保留）以及 settings.yaml 的路径；
3. 复制后用其**整体替换** settings.yaml 里对应的 `- id:` 条目（不要复制出第二个 `llm-pi-ai:` 根）并保存。DSH 会自动加载；若未生效，重启 Web Host 并刷新页面。

知识库未收录的模型会得到带注释的通用模板，按端点文档填值即可。遇到"端点因 developer 角色拒绝请求"之类的情况，面板会直接给出警告与替代建议（例如阿里云百炼端点建议改用内置 zai 路由）。

内置知识库目前收录 GLM-5.2（`minimal/low/medium/high`）与 Kimi K3（`low/high/max`）。要补充其他模型，在 `settings.yaml` 里追加到插件自己的命名空间即可，条目优先于内置：

```yaml
dsh-reasoning-effort:
  entries:
    - id: my-model
      provider: "*"          # provider 路由名，* 通配
      model: "my-model-id"   # 模型 id，* 通配
      note: 说明文字
      efforts:               # 档位名 → 端点实际接受的取值
        low: "low"
        high: "high"
        max: "max"
      compat:                # 仅 openai-completions 路由需要
        thinkingFormat: "openai"
        supportsReasoningEffort: true
```

注意：插件只提供片段，**不会替你修改任何配置**；内置目录里的档位集合（即使只有一档）也不会被标记——那是上游的刻意数据。

## 启用大肥鱼滑块

插件首次安装后默认使用纯白按钮。若想换成八帧奔跑小人：

1. 打开 **设置 → 通用设置**。
2. 找到“外观”下方的 **大肥鱼滑块**。
3. 打开开关，再回到模型入口。

<img src="assets/readme/settings.webp" alt="DeepSeek Harness 通用设置中的推理强度滑块和大肥鱼滑块开关" width="1200">

大肥鱼只替换按钮外观，不改变档位吸附、键盘控制、辐射特效或模型选择。拖动时动画会自动加速；系统启用“减少动态效果”后会停留在稳定帧。

同一页面中的 **推理强度滑块** 总开关可以临时关闭整个增强控件。关闭后无需卸载，DSH 原生模型选择器会立即恢复。两个开关都只保存在当前浏览器。

## 你会得到什么

- **真正跟手的拖动**：按钮按指针位置连续移动，释放后才吸附到有效档位。
- **深浅主题适配**：深色为蓝紫黑渐变，浅色为蓝白渐变，强度越高蓝色越深。
- **只向左侧发射的特效**：波浪、冲击波、像素辐射、粒子和拖尾不会越过按钮。
- **与 DSH 状态同步**：滑块和 `/model` 命令读写同一个会话模型目录。
- **失败自动回滚**：更新失败时恢复到上一个已确认档位。
- **无额外网络行为**：插件不新增遥测、凭据处理或服务端存储。

## 常见问题

### 安装后看不到滑块

请依次确认：

1. 安装后已经重启 DSH Web Host。
2. **设置 → 通用设置 → 推理强度滑块** 处于启用状态。
3. 当前模型在 DSH 模型目录中公开了至少两档推理强度（未声明的模型见下一条），且部署没有关闭 thinking。

### 模型没有声明档位怎么办（如 GLM-5.3）

不在 pi-ai 自带目录中的新模型没有任何推理档位，菜单会显示"当前模型未提供推理强度档位"。此时在 `~/.dsh/settings.yaml` 中为它声明档位即可，以 zai coding 路由下的 GLM-5.3 为例：

```yaml
llm-pi-ai:
  providers:
    zai-coding-cn:
      models:
        - id: glm-5.3
          name: GLM-5.3
          contextWindow: 1000000
          maxTokens: 131072
          reasoningEfforts:   # 键＝滑块显示的档位名，值＝实际发给 API 的 reasoning_effort
            low: "low"
            high: "high"
            xhigh: "max"
          compat:             # zai 路由检测默认不发 reasoning_effort，需要显式打开
            thinkingFormat: "zai"
            supportsReasoningEffort: true
```

几点说明：

- 档位名使用 DSH 档位体系（`off` / `minimal` / `low` / `medium` / `high` / `xhigh`），值是端点实际接受的 `reasoning_effort` 取值；`off` 不声明即不可选，适合无法关闭思考的模型。
- 已收录在 pi-ai 目录中的模型（如 GLM-5.2）自动继承档位，无需任何配置。
- 上游目录收录该模型后，手写声明即可删除；手写条目始终优先于目录。
- 提交的档位值最终由 host 校验并发送，插件不会绕过模型或部署的能力限制。

### 如何确认插件已经载入

运行：

```powershell
dsh --profile web --dump-config
```

配置中应当出现 `name: dsh-reasoning-effort`。

### 如何卸载

```powershell
dsh plugin --profile web remove dsh-reasoning-effort
```

卸载后重启 DSH Web Host，原生模型选择器会自动恢复。

## 兼容性

| 组件 | 目标版本 |
| --- | --- |
| DeepSeek Harness packages | `0.1.0-rc.6` |
| Node.js | `22.19+` |
| React | `18.x` |

DeepSeek Harness 仍处于开发者预览阶段；上游 UI 或服务变更可能需要同步更新插件。

## 开发与构建

```powershell
pnpm install
pnpm run check
pnpm pack
```

`pnpm run check` 会进行 TypeScript 校验，并重建 Host 入口与浏览器模块。完整交互与颜色约定见 [design/visual-spec.md](design/visual-spec.md)，安全问题请按照 [SECURITY.md](SECURITY.md) 报告。

## 许可证

[MIT](LICENSE) © HanaAyane
