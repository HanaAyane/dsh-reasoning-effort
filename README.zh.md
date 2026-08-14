<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort 为 DeepSeek Harness 提供 Codex 风格的模型与推理强度滑块" width="1200">

# dsh-reasoning-effort

**把 Codex 风格的“模型 + 推理强度”控件直接带进 DeepSeek Harness。**

[English](README.md) · [最新发行版](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [反馈问题](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

![Release](https://img.shields.io/github/v/release/HanaAyane/dsh-reasoning-effort?style=flat-square&color=6f83ff)
![DSH](https://img.shields.io/badge/DSH-0.1.0--rc.6-8b5cf6?style=flat-square)
![License](https://img.shields.io/github/license/HanaAyane/dsh-reasoning-effort?style=flat-square&color=536990)

</div>

插件将 DSH composer 原本的模型入口替换成一个紧凑弹层：上方是 `off` / `high` / `max` 推理强度滑块，下方是当前模型。它直接融入 DSH、与 `/model` 双向同步，关闭后还能无缝回退到原生控件。

## 在 DSH 中的实际效果

<img src="assets/readme/themes.webp" alt="推理强度选择器在 DeepSeek Harness 深色和浅色主题中的真实效果" width="1200">

- **拖动真正跟手**：按钮按指针位置连续移动，释放后才吸附到三个有效档位。
- **原生适配主题**：深色为蓝紫黑渐变；浅色为蓝白渐变，强度越高蓝色越深。
- **特效有明确方向**：波浪、冲击波、像素辐射、粒子和拖尾始终裁切在按钮左侧。
- **共用会话状态**：视觉控件与 DSH `/model` 命令读写同一个 session model directory。
- **随时安全回退**：关闭或卸载插件，DSH 原生模型选择器会自动恢复。

## 安装

### 从 `main` 安装

大肥鱼滑块已经直接包含在 `main` 中，当前版本为 `0.4.0`：

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#main
dsh --profile web --dump-config
```

安装后请重启 DSH Web Host。

### 已发布压缩包

当前最新的正式 Tag 仍为 `v0.3.0`：

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.3.0
dsh --profile web --dump-config
```

如需离线安装，请从[最新 Release](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest)下载 `.tgz` 与校验文件，再通过 `dsh plugin --profile web add <压缩包路径>` 添加。

## 使用

1. 点击 composer 中的模型入口。
2. 拖动按钮或点击轨道，释放后会吸附到 `off`、`high` 或 `max`。
3. 点击滑块下方的模型行，进入 DSH 模型列表。

只有当前模型明确公开全部三档 effort 时才显示滑块；部署关闭 thinking 或模型只支持 `off` 时会自动隐藏。

## 大肥鱼滑块

<img src="assets/readme/settings.webp" alt="DeepSeek Harness 通用设置中已启用推理强度滑块和大肥鱼滑块" width="1200">

进入 **设置 → 通用设置 → 外观** 即可控制插件：

- **推理强度滑块**：启用或关闭增强模型控件。
- **大肥鱼滑块**：仅用八帧奔跑小人替换纯白按钮；拖动时动画会自动加速，三档吸附、键盘控制、辐射特效和模型选择逻辑都保持不变。

两个偏好都只保存在当前浏览器。系统启用“减少动态效果”时，小人会停留在稳定帧。

## 如何接入 DSH

```mermaid
flowchart LR
    A[Composer 模型按钮] --> B[插件替换 seat]
    B --> C[会话模型目录]
    D[/model 命令] --> C
    C --> E[sessions.selectModel]
    E --> F[确认模型与强度]
```

客户端以低优先级替换单占位 `conversation.input.model` seat，通过 `modelDirectories.directoryFor(sessionId)` 读取活动会话，并使用 DSH 原生选择器相同的目录提交完整选择。插件不会修改全局 provider 设置。

写入失败时，界面会回滚到上一个已确认值。完整的交互与颜色约定记录在 [design/visual-spec.md](design/visual-spec.md)。

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

`pnpm run check` 会进行 TypeScript 校验，并重建 Host 入口与浏览器模块。浏览器产物会封装为 DSH `window.__ModuleLoader__` 可加载格式；仓库已提交构建后的 `lib/`，所以从 GitHub 安装时不需要执行 `prepare` 构建。

## 隐私与安全

插件不新增独立网络请求、遥测、凭据处理或服务端存储，只通过 DSH 已有客户端服务读写当前会话。插件自己的偏好仅保存在浏览器 `localStorage`。

安全问题请按照 [SECURITY.md](SECURITY.md) 报告。

## 许可证

[MIT](LICENSE) © HanaAyane
