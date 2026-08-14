<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort 为 DeepSeek Harness 提供 Codex 风格的模型与推理强度滑块" width="1200">

# dsh-reasoning-effort

**把 Codex 风格的“模型 + 推理强度”控件直接带进 DeepSeek Harness。**

[English](README.en.md) · [最新发行版](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [反馈问题](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![main 0.4.0](https://img.shields.io/badge/main-0.4.0-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/tree/main)
[![DSH 0.1.0-rc.6](https://img.shields.io/badge/DSH-0.1.0--rc.6-8b5cf6?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)

</div>

第一次打开插件时，你会在 DSH 输入框下方看到新的模型入口。点击后，弹层上方是 `off` / `high` / `max` 推理强度滑块，下方仍然是熟悉的模型选择入口。插件默认启用，并与 DSH 的 `/model` 命令保持同步。

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

`main` 当前版本为 `0.4.0`，已经包含大肥鱼滑块。当前最新 Tag 仍为 `v0.3.0`；如需安装已发布版本，可把命令中的 `#main` 改为 `#v0.3.0`。

### 2. 重启 DSH Web Host

插件在 Web Host 启动时载入。安装命令完成后，请结束当前 Host 并重新启动，再刷新 DSH 页面。

### 3. 打开模型入口

1. 新建或打开一个会话。
2. 点击输入框下方显示“模型 + 当前强度”的按钮。
3. 拖动滑块或点击轨道，释放后会吸附到 `off`、`high` 或 `max`。
4. 点击滑块下方的模型行，可以继续进入 DSH 原生模型列表。

完成后，你看到的效果应当与下面一致：

<img src="assets/readme/themes.webp" alt="推理强度选择器在 DeepSeek Harness 深色和浅色主题中的真实效果" width="1200">

## 三个档位分别是什么

| 档位 | 适合场景 | 体验倾向 |
| --- | --- | --- |
| `off` | 简单问答、改写、快速操作 | 更快 |
| `high` | 日常编程、分析和多步骤任务 | 速度与推理平衡 |
| `max` | 复杂调试、规划和高难度任务 | 更充分的推理 |

滑块只是提交当前模型公开的 effort 值，不会绕过模型或部署本身的能力限制。模型未提供完整三档、部署关闭 thinking，或只支持 `off` 时，滑块会自动隐藏。

## 启用大肥鱼滑块

插件首次安装后默认使用纯白按钮。若想换成八帧奔跑小人：

1. 打开 **设置 → 通用设置**。
2. 找到“外观”下方的 **大肥鱼滑块**。
3. 打开开关，再回到模型入口。

<img src="assets/readme/settings.webp" alt="DeepSeek Harness 通用设置中的推理强度滑块和大肥鱼滑块开关" width="1200">

大肥鱼只替换按钮外观，不改变三档吸附、键盘控制、辐射特效或模型选择。拖动时动画会自动加速；系统启用“减少动态效果”后会停留在稳定帧。

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
3. 当前模型同时公开 `off`、`high`、`max` 三档，且部署没有关闭 thinking。

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
