<div align="center">

<img src="https://raw.githubusercontent.com/HanaAyane/dsh-reasoning-effort/v0.9.0/assets/readme/hero.webp" alt="DSH 原生模型入口与插件推理滑块的实际界面截图" width="100%">

# dsh-reasoning-effort

**沿用 DSH 原生模型选择器，在“推理等级”里拖动调节思考强度。**

[English](README.en.md) · [npm](https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort) · [最新发行版](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [反馈问题](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![v0.9.0](https://img.shields.io/badge/release-0.9.0-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.9.0)
[![DSH RC](https://img.shields.io/badge/DSH-RC-8b5cf6?style=flat-square)](#版本支持政策)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)
[![Releases 附件累计下载次数](https://img.shields.io/github/downloads/HanaAyane/dsh-reasoning-effort/total.svg?style=flat-square&label=total%20downloads)](https://github.com/HanaAyane/dsh-reasoning-effort/releases)

</div>

模型列表、搜索和徽标沿用 DSH 原生界面；进入“推理等级”，用带圆点刻度与档位名称的滑块调整强度。八帧“大肥鱼”随拖动加速，调整后弹窗保持打开，选择结果与 `/model` 命令保持同步。

- **跟随模型档位**：自动适配档数、名称和顺序，提交失败时回滚。
- **贴合 DSH 界面**：支持深浅主题，简体中文与英文跟随 DSH 语言即时切换。
- **可选动态外观**：默认启用大肥鱼，支持普通按钮及系统“减少动态效果”设置。
- **按需配置指引**：缺少档位时优先展示图形界面设置路径；手工步骤和复制操作折叠到高级配置，已有有效档位不再提示。

<img src="https://raw.githubusercontent.com/HanaAyane/dsh-reasoning-effort/v0.9.0/assets/readme/themes.webp" alt="插件滑块在 DSH 深色与浅色主题中的实际截图" width="100%">

[本次更新](#v090-更新内容) · [安装与更新](#安装与更新) · [桌面端安装](#dsh-桌面端安装) · [版本支持](#版本支持政策) · [外观设置](#大肥鱼滑块) · [常见问题](#常见问题)

## v0.9.0 更新内容

- **原生选择器接入**：保留 DSH 模型入口、搜索、分组与徽标，在原生“推理等级”入口展示插件滑块，无需修改宿主文件。
- **更直观的调节**：每档对应一个圆点刻度，当前档位高亮并显示名称；拖动后保持弹窗打开，页面更紧凑。
- **图形设置优先**：配置教程置顶，YAML、手动步骤及“复制给 Agent”收进高级配置，并说明手动修改风险。
- **减少打扰**：修复打开时教程闪现、重复加载导致卡死，以及已配置档位仍显示提示的问题。

感谢 [@Y1zy](https://github.com/Y1zy) 在 [#22](https://github.com/HanaAyane/dsh-reasoning-effort/issues/22) 和 [#23](https://github.com/HanaAyane/dsh-reasoning-effort/issues/23) 中的细致反馈。这些建议促使我重新考虑插件与宿主的分工：直接复用原生选择器，让插件专注于推理调节和可视化。

完整记录见 [v0.9.0 发布说明](.github/releases/v0.9.0.md) 和 [CHANGELOG](CHANGELOG.md)。原生接入按 DSH `0.2.1-rc.2` 验证，宿主升级后需重新验证；停用插件或关闭滑块后恢复原生组件。

## 版本支持政策

本插件仅针对相对稳定的 **DSH RC 版本**进行适配、测试和问题修复，**不单独维护 alpha 版本**。alpha 阶段的客户端 API、依赖结构和插件加载机制可能频繁发生破坏性变更；持续兼容多个过渡版本会增加维护成本，也难以保证可靠性。

当前发行版为 **插件 `v0.9.0`**，以 DSH `0.2.1-rc.2` 为最低版本，适用于 Web 和 Desktop Profile。DSH `0.2.0` RC 用户请继续使用 [v0.8.1](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.8.1)。桌面端使用 DSH 的 Web 客户端界面，但有独立的插件安装与激活状态。DSH `0.1.x` 用户请继续使用 [v0.7.3](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.7.3)。RC 仍属于候选发布版本，不代表所有历史或未来 RC 都自动兼容。

| 项目 | 当前说明 |
| --- | --- |
| 插件发行版 | [v0.9.0](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.9.0) |
| Web | DSH `0.2.1-rc.2` 起；使用 `web` Profile |
| 桌面端 | DSH Desktop `0.2.1-rc.2`；使用 `desktop` Profile |
| 升级说明 | 安装 `v0.9.0` 后重新启动对应的 Web Host 或桌面应用 |
| alpha 版本 | 不单独适配，请自行临时修复或切换至目标 RC |

## 安装与更新

顶部下载徽章显示 GitHub Releases 附件的累计下载次数，更新有缓存延迟。重复下载会累计，不代表插件安装量或独立用户数；不包含 npm 下载、GitHub 自动生成的源码 ZIP/TAR 下载和 Git 克隆。

### Web：安装固定发行版

推荐从 npm 安装官方包 `@ayanehana/dsh-reasoning-effort`。npm 上无作用域的同名包由其他维护者发布，对应其他仓库。

[npm 包页面](https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort) · [下载 npm 0.9.0 插件包](https://registry.npmjs.org/@ayanehana/dsh-reasoning-effort/-/dsh-reasoning-effort-0.9.0.tgz)。桌面端可直接使用下方的包名安装步骤。

如果此前已通过 GitHub 安装旧的 `dsh-reasoning-effort`，切换到 npm 包前请先卸载旧包；Web 使用 `dsh plugin --profile web remove dsh-reasoning-effort`，桌面端在 **插件** 页面卸载，避免重复加载。

在你启动 DSH 时使用的终端环境执行：

```powershell
dsh plugin --profile web add @ayanehana/dsh-reasoning-effort@0.9.0
dsh --profile web --dump-config
```

确认输出中出现 `name: '@ayanehana/dsh-reasoning-effort'`（引号形式可能不同）。已有 npm 安装也使用同一条 `add` 命令更新。

GitHub 安装地址仍为 `github:HanaAyane/dsh-reasoning-effort#v0.9.0`，该历史发行版的包名为 `dsh-reasoning-effort`。开发体验可将 `#v0.9.0` 换成 `#main`，但主分支可能包含未发布改动。

也可以从 [v0.9.0 Release 下载插件包](https://github.com/HanaAyane/dsh-reasoning-effort/releases/download/v0.9.0/dsh-reasoning-effort-0.9.0.tgz)。

<details>
<summary>让 Agent 帮你安装：复制这段提示词</summary>

```text
请为 DeepSeek Harness 的 web Profile 安装 dsh-reasoning-effort v0.9.0。
只执行下面两条命令，不要修改其他 Profile：
dsh plugin --profile web add @ayanehana/dsh-reasoning-effort@0.9.0
dsh --profile web --dump-config
确认配置中出现 dsh-reasoning-effort 后告诉我结果。
不要关闭或重启正在运行的 DSH；提醒我手动重启 Web Host 并刷新页面。
```

</details>

### Web：重启并刷新

插件在 Web Host 启动时载入。安装完成后，手动重启 DSH Web Host，再刷新页面。

### 选择模型与强度

打开会话，点击输入框下方的模型入口。选择 **模型** 使用原生搜索与模型列表；选择 **推理等级** 打开插件滑块。拖动或点击轨道，释放后吸附到最近档位，弹窗保持打开。圆点标记各档位置，下方显示当前档位名称；按 Esc 返回，点击外部关闭。

### DSH 桌面端安装

适用于 **DSH Desktop `0.2.1-rc.2`**。请在桌面应用内安装，无需安装终端命令，也无需预先退出应用。

1. 打开 DSH Desktop，在侧栏进入 **插件** 页面。
2. 点击 **添加插件**，在 **包名或地址** 中填写：

   ```text
   @ayanehana/dsh-reasoning-effort@0.9.0
   ```

   这里填写的是插件地址，不是 `dsh plugin ...` 命令。
3. 等待页面解析插件信息，确认来源和版本后安装。
4. 安装完成后，在 **已安装插件** 中确认 `@ayanehana/dsh-reasoning-effort` 已启用，并按界面提示重新加载或重启应用。

若从 npm 安装失败，也可在 **包名或地址** 中填写 GitHub 历史发行版的插件包地址（包名为 `dsh-reasoning-effort`，切换来源前请先卸载原包）：

```text
https://github.com/HanaAyane/dsh-reasoning-effort/releases/download/v0.9.0/dsh-reasoning-effort-0.9.0.tgz
```

桌面端使用独立的 `desktop` Profile；安装在 `web` Profile 的插件不会自动出现在桌面端。若终端提示 `profile "desktop" is managed exclusively by the Electron application`，说明当前 CLI 不允许管理 Desktop Profile，请改用上述应用内入口，不要修改 Profile 名称或绕过限制。参见 [DSH Desktop 官方说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.2/apps/desktop/README.zh.md#installation-ownership)。

## 档位从哪里来

滑块读取当前模型在 DSH 模型目录中公开的 `reasoning.efforts`。档数、名称和顺序由模型与路由决定，并非固定三档，也不保证不同端点提供相同档位。

模型公开至少两档时显示滑块；不足两档时显示提示。插件提交目录中的档位值，由 DSH 校验和发送，不会绕过模型或部署的能力限制。

## 给任意自定义模型声明档位

这一节与厂商无关，适用于你在 `llm-pi-ai` 里自己声明的任何模型。

**为什么读不到档位**：DSH 的模型目录只报告适配器声明的能力。没有继承内置目录元数据的自定义模型，需要显式声明 `reasoningEfforts` 才能公开档位；目录没有档位并不证明端点不能推理。

**优先使用图形界面**：**设置 → 模型 → 编辑提供商 → 自定义设置 → 模型选项（›）→ 推理等级**，按端点文档填写档位与 API 参数值。

<details>
<summary>高级配置：手动填写 YAML</summary>

手动修改前请备份。缩进、键名或参数错误可能导致配置加载失败或请求报错。

**怎么填**：打开指引面板显示的配置文件（目标 Profile 的 `cordis.patch.yml`），在 `llm-pi-ai` 的对应模型条目下加 `reasoningEfforts`，并保持原有缩进。键是 DSH 档位，值是端点接受的写法；没写的档位视为不支持：

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

**怎么验证**：保存后检查配置解析和目录档位，再核对实际请求。滑块出现只说明目录已读到元数据，不能证明端点接受参数或强度确实改变。插件内置的知识条目只是参考，不是必要条件。

</details>

## 档位指引（自定义 provider）

DSH `0.2.1-rc.2` 可直接在 **设置 → 模型 → 编辑提供商 → 自定义设置 → 模型选项（›）→ 推理等级** 中配置自定义 API 的档位和 API 参数值。下面的 YAML 指引保留给高级配置。

DSH 内置路由的档位来自 pi-ai 目录，插件**完全只读、绝不修改**。只有你在 `llm-pi-ai` 配置里自己声明的模型，插件才会给指引：

1. 打开模型菜单中的 **推理等级**。若当前模型是你自定义声明、目录读不到档位且未明确设置 `reasoningEfforts: false`，菜单最前面直接显示图形界面的配置路径，手工指引位于 **高级配置**；已有有效档位不会因与知识库不同而被提示修改；
2. 优先按面板顶部的设置页路径配置；需要手工编辑时，展开 **高级配置**，查看按当前配置文件缩进生成的 YAML、文件路径与条目位置；
3. 按面板提示替换对应的 `- id:` 条目，或把字段块插入该条目；保留其他配置，保存后让 DSH 重新加载。若未生效，重启 Web Host 并刷新页面。

知识库未收录的模型会得到通用的、可直接修改的模板。遇到"端点因 developer 角色拒绝请求"之类的情况，面板会给出警告和对应的 `compat` 开关（例如提示 `supportsDeveloperRole: false`）。

缺少档位且不想手动填写时，展开 **高级配置** 并点击 **复制给 Agent**。已有有效档位或明确关闭推理的模型不再显示这组提示；调整已有档位请使用 DSH 设置页。复制内容包含当前路由、模型 ID、实际配置路径、条目位置、目录档位和通用声明规则；不会把内置知识库的预设档位或兼容字段作为建议配置交给 Agent。

把提示词发给你的 coding agent。它会先读取目标路由的实际 `api` / `baseURL`，查证端点官方文档，区分力度枚举、思考开关、token 预算和别名，再最小修改目标模型条目。资料不足时询问缺失信息；无法访问文件时提供补丁。提示词要求保留已有配置，并分别报告配置解析、目录元数据和实际请求的验证结果。

<details>
<summary>高级配置：扩展插件知识库</summary>

内置条目只覆盖少数模型，作用仅是省去手填。要补充其他模型，在 Profile 中已有 `id: reasoning-effort` 条目的 `config` 下添加 `entries`。下面只展示相对内容，粘贴时保持所在条目的缩进；用户条目优先于内置：

```yaml
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

<img src="https://raw.githubusercontent.com/HanaAyane/dsh-reasoning-effort/v0.9.0/assets/readme/settings.webp" alt="DeepSeek Harness 通用设置中的推理强度滑块和大肥鱼滑块开关" width="100%">

大肥鱼只替换按钮外观，不改变档位吸附、键盘控制、辐射特效或模型选择。拖动时动画会自动加速；系统启用“减少动态效果”后会停留在稳定帧。

同一页面中的 **推理强度滑块** 总开关可以临时关闭整个增强控件。关闭后无需卸载，DSH 原生模型选择器会立即恢复。两个开关都只保存在当前浏览器。

## 常见问题

### 安装后看不到滑块

请依次确认：

1. 确认实际运行版本与上面的支持表一致；桌面端可在 **关于 DeepSeek Harness** 中查看版本。
2. 安装后已经重启对应的 Web Host 或完全退出并重新打开桌面应用。
3. **设置 → 通用设置 → 推理强度滑块** 处于启用状态。
4. 当前模型在 DSH 模型目录中公开了至少两档推理强度（未声明的模型见下一条），且部署没有关闭 thinking。

### 模型没有声明档位怎么办

先按 **设置 → 模型 → 编辑提供商 → 自定义设置 → 模型选项（›）→ 推理等级** 配置。若需要手动配置，请根据面板给出的实际文件路径和当前模型、端点文档填写对应条目的 `reasoningEfforts` 与 `compat`，不要直接套用其他模型的档位或上下文参数。

知识库只提供参考；实际支持的取值以端点能力为准。保存后若未生效，重启 Web Host 并刷新页面。

### RC 版本仍有问题，如何反馈

请在 [Issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues) 中附上 DSH 版本、插件版本、客户端类型（Web 或桌面封装）、复现步骤，以及相关控制台报错。报告前请隐去令牌和凭据。

### 如何确认插件已经载入

运行：

```powershell
dsh --profile web --dump-config
```

npm 安装的 Web 配置中应当出现 `name: '@ayanehana/dsh-reasoning-effort'`（引号形式可能不同）；历史 GitHub 发行版使用 `name: dsh-reasoning-effort`。桌面端请在应用的 **插件 → 已安装插件** 中确认插件已启用。

### 如何卸载

```powershell
dsh plugin --profile web remove @ayanehana/dsh-reasoning-effort
```

桌面端请在应用的 **插件** 页面卸载。卸载后重启对应的 Web Host 或桌面应用，原生模型选择器会自动恢复。

历史 GitHub 发行版使用 `dsh plugin --profile web remove dsh-reasoning-effort` 卸载。

## 开发与构建

```powershell
pnpm install
pnpm run check
pnpm pack
```

开发环境使用 Node.js `22.19+`（同时满足目标 DSH 的要求）和 `pnpm@11.7.0`。`pnpm run check` 会进行 TypeScript 与国际化校验，并重建 Host 入口、浏览器模块及类型声明。完整交互与颜色约定见 [design/visual-spec.md](design/visual-spec.md)，安全问题请按照 [SECURITY.md](SECURITY.md) 报告。

## 许可证

[MIT](LICENSE) © HanaAyane
