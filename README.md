<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort 为 DeepSeek Harness 提供 Codex 风格的模型与推理强度滑块" width="100%">

# dsh-reasoning-effort

**把 Codex 风格的“模型 + 推理强度”控件直接带进 DeepSeek Harness。**

[English](README.en.md) · [最新发行版](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [反馈问题](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![v0.7.1](https://img.shields.io/badge/release-0.7.1-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.7.1)
[![DSH RC](https://img.shields.io/badge/DSH-RC-8b5cf6?style=flat-square)](#版本支持政策)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)

</div>

在 DSH 输入框下方切换模型、拖动推理强度，并让八帧“大肥鱼”随拖动加速。档位来自当前模型，选择结果与 `/model` 命令保持同步。

- **跟随模型档位**：自动适配档数、名称和顺序，提交失败时回滚。
- **贴合 DSH 界面**：支持深浅主题，简体中文与英文跟随 DSH 语言即时切换。
- **可选动态外观**：默认启用大肥鱼，支持普通按钮及系统“减少动态效果”设置。
- **自定义模型指引**：提供可复制的配置片段，并可一键复制整份简报交给 Agent 排查并代填。

<img src="assets/readme/themes.webp" alt="推理强度选择器在 DeepSeek Harness 深色和浅色主题中的真实效果" width="100%">

[安装与更新](#安装与更新) · [版本支持](#版本支持政策) · [外观设置](#大肥鱼滑块) · [常见问题](#常见问题)

## 版本支持政策

本插件仅针对相对稳定的 **DSH RC 版本**进行适配、测试和问题修复，**不单独维护 alpha 版本**。alpha 阶段的客户端 API、依赖结构和插件加载机制可能频繁发生破坏性变更；持续兼容多个过渡版本会增加维护成本，也难以保证可靠性。

当前支持 **DSH `0.1.5-rc.1`**，继续使用插件 **`v0.7.1`** 即可，无需额外适配。如需继续使用 alpha，请自行进行临时适配。RC 仍属于候选发布版本，不代表所有历史或未来 RC 都自动兼容。

| 项目 | 当前说明 |
| --- | --- |
| 插件发行版 | [v0.7.1](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.7.1) |
| 当前兼容版本 | DSH `0.1.5-rc.1`，Web Profile |
| v0.7.1 原始修复目标 | DSH `0.1.2-rc.1` 的模型控件注入错误 |
| 升级说明 | 插件保持兼容，继续使用 `v0.7.1`，无需修改插件代码 |
| alpha 版本 | 不单独适配，请自行临时修复或切换至目标 RC |

## 安装与更新

### 1. 安装固定发行版

在你启动 DSH 时使用的终端环境执行：

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.7.1
dsh --profile web --dump-config
```

确认输出中出现 `name: dsh-reasoning-effort`。已有安装也使用同一条 `add` 命令更新。开发体验可将 `#v0.7.1` 换成 `#main`，但主分支可能包含未发布改动。

<details>
<summary>让 Agent 帮你安装：复制这段提示词</summary>

```text
请为 DeepSeek Harness 的 web Profile 安装 dsh-reasoning-effort v0.7.1。
只执行下面两条命令，不要修改其他 Profile：
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.7.1
dsh --profile web --dump-config
确认配置中出现 dsh-reasoning-effort 后告诉我结果。
不要关闭或重启正在运行的 DSH；提醒我手动重启 Web Host 并刷新页面。
```

</details>

### 2. 重启并刷新

插件在 Web Host 启动时载入。安装完成后，手动重启 DSH Web Host，再刷新页面。

### 3. 选择模型与强度

打开一个会话，点击输入框下方的模型入口。拖动滑块或点击轨道，释放后吸附到最近的有效档位；点击下方模型行可展开模型列表。

## 档位从哪里来

滑块读取当前模型在 DSH 模型目录中公开的 `reasoning.efforts`。档数、名称和顺序由模型与路由决定，并非固定三档，也不保证不同端点提供相同档位。

模型公开至少两档时显示滑块；不足两档时显示提示。插件提交目录中的档位值，由 DSH 校验和发送，不会绕过模型或部署的能力限制。

## 给任意自定义模型声明档位

这一节与厂商无关，适用于你在 `llm-pi-ai` 里自己声明的任何模型。

**为什么读不到档位**：DSH 的模型目录只报告适配器声明的能力。你自己声明的模型没有目录条目，除非写出 `reasoningEfforts`，否则目录里永远没有档位，滑块也不会出现。

**怎么填**：在 `settings.yaml` 里找到该模型的条目，加一个 `reasoningEfforts` —— 键是 DSH 档位，值是端点自己接受的写法，没写的档位会被当作不支持：

```yaml
      models:
        - id: <你的模型 id>
          reasoningEfforts:
            low: "<端点接受的取值>"
            high: "<端点接受的取值>"
```

**什么时候还要加 `compat`**（与 `reasoningEfforts` 平级，只在端点需要时写）：

| 端点情况 | 加什么 |
| --- | --- |
| 直接用 `reasoning_effort` 表达强度 | 不用写 compat |
| 要先打开思考开关才认强度 | `compat.thinkingFormat`: `"qwen"`（发 `enable_thinking`）/ `"zai"` / `"deepseek"` |
| 不接受 `reasoning_effort` | `compat.supportsReasoningEffort: false` |
| 请求返回 400 `invalid_parameter_error` | `compat.supportsDeveloperRole: false` |
| 回放历史消息报错 | `compat.requiresReasoningContentOnAssistantMessages: true` |
| 模型完全不推理 | `reasoningEfforts: false` |

不写 `compat` 时由适配器按端点地址自行判断：它不认识的地址按标准 OpenAI 处理，认识的厂商端点会自动套用该厂商的格式，所以**猜错格式比不写更糟**。

**怎么验证**：保存后打开模型菜单，滑块出现即成功；滑块出现但请求报错，就按上表逐项排查。插件内置的知识条目只是**快捷方式**，不是必要条件。

## 档位指引（自定义 provider）

DSH 内置路由的档位来自 pi-ai 目录，插件**完全只读、绝不修改**。只有你在 `settings.yaml` 的 `llm-pi-ai` 里自己声明的模型，插件才会给指引：

1. 打开模型菜单。若当前模型是你自定义声明、且目录读不到档位（或声明与知识库不符），菜单里会出现 **查看档位声明指引**；
2. 面板展示建议档位（知识库命中时给出该模型记录的档位，未收录时给出通用模板）、一段可直接复制的完整条目 YAML（含 `- id:` 行，原有 name 等字段自动保留）以及 settings.yaml 的路径；
3. 复制后用其**整体替换** settings.yaml 里对应的 `- id:` 条目（不要复制出第二个 `llm-pi-ai:` 根）并保存。DSH 会自动加载；若未生效，重启 Web Host 并刷新页面。

知识库未收录的模型会得到通用的、可直接修改的模板。遇到"端点因 developer 角色拒绝请求"之类的情况，面板会给出警告和对应的 `compat` 开关（例如提示 `supportsDeveloperRole: false`）。

不想自己填、或者填完仍然报错，就点面板旁的 **复制给 Agent**：它会把当前模型的现象与位置（路由、模型 id、settings.yaml 路径、条目行、目录读到的档位、知识库建议、端点提示）、你的任务、完整的档位声明规则和一份起始片段合成一篇简报放进剪贴板。直接粘给任意 coding agent，它就能去读 settings.yaml、查端点文档、把配置写好并告诉你原因。

<details>
<summary>高级配置：扩展插件知识库</summary>

内置条目只覆盖少数模型，作用仅是省去手填。要补充其他模型，在 `settings.yaml` 里追加到插件自己的命名空间即可，条目优先于内置：

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
      # compat:              # 只在端点需要固定格式时才写
      #   thinkingFormat: "qwen"
      #   supportsReasoningEffort: false
```

条目里的 `compat` 会**原样**写进生成的片段，所以只在端点确实需要固定格式时才填：不填时适配器按端点地址自行判断（未识别地址按标准 OpenAI，已识别厂商自动套用该厂商格式），写错格式会覆盖掉这个正确判断；而在不接受该字段的协议上（例如 `anthropic-messages`），粘贴后那条路由会直接解析失败。

注意：插件只提供片段，**不会替你修改任何配置**；内置目录里的档位集合（即使只有一档）也不会被标记——那是上游的刻意数据。

</details>

## 大肥鱼滑块

插件**默认启用**八帧奔跑小人作为滑块按钮。若想换回纯白按钮：

1. 打开 **设置 → 通用设置**。
2. 找到“外观”下方的 **大肥鱼滑块**。
3. 关闭开关，再回到模型入口。

<img src="assets/readme/settings.webp" alt="DeepSeek Harness 通用设置中的推理强度滑块和大肥鱼滑块开关" width="100%">

大肥鱼只替换按钮外观，不改变档位吸附、键盘控制、辐射特效或模型选择。拖动时动画会自动加速；系统启用“减少动态效果”后会停留在稳定帧。

同一页面中的 **推理强度滑块** 总开关可以临时关闭整个增强控件。关闭后无需卸载，DSH 原生模型选择器会立即恢复。两个开关都只保存在当前浏览器。

## 常见问题

### 安装后看不到滑块

请依次确认：

1. 用 `dsh --version` 确认实际运行版本；DSH `0.1.5-rc.1` 可继续搭配插件 `v0.7.1` 使用。
2. 安装后已经重启 DSH Web Host。
3. **设置 → 通用设置 → 推理强度滑块** 处于启用状态。
4. 当前模型在 DSH 模型目录中公开了至少两档推理强度（未声明的模型见下一条），且部署没有关闭 thinking。

### 模型没有声明档位怎么办

先查看模型菜单中的 **查看档位声明指引**。若需要手动配置，请根据当前模型和端点文档填写 `settings.yaml` 中对应模型的 `reasoningEfforts` 与 `compat`，不要直接套用其他模型的档位或上下文参数。

知识库只提供参考；实际支持的取值以端点能力为准。保存后若未生效，重启 Web Host 并刷新页面。

### RC 版本仍有问题，如何反馈

请在 [Issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues) 中附上 DSH 版本、插件版本、客户端类型（Web 或桌面封装）、复现步骤，以及相关控制台报错。报告前请隐去令牌和凭据。

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

## 开发与构建

```powershell
pnpm install
pnpm run check
pnpm pack
```

开发环境使用 Node.js `22.19+`（同时满足目标 DSH 的要求）和 `pnpm@11.7.0`。`pnpm run check` 会进行 TypeScript 与国际化校验，并重建 Host 入口、浏览器模块及类型声明。完整交互与颜色约定见 [design/visual-spec.md](design/visual-spec.md)，安全问题请按照 [SECURITY.md](SECURITY.md) 报告。

## 许可证

[MIT](LICENSE) © HanaAyane
