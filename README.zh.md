# dsh-reasoning-effort

[English](README.md)

为 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness)提供 Codex 风格的“模型 + 推理强度”一体化选择器。组件接管 composer 原模型入口：触发器显示当前模型和强度，弹层上方是 `off` / `high` / `max` 滑块，下方进入模型列表。

## 功能

- 三档滑块：拖动时连续跟手，释放后吸附到 `off` / `high` / `max`。
- 拖动由组件按指针位置计算，并由窗口级释放监听兜底；拖出滑轨后松手也能可靠提交。
- 纯白滑块按钮，无旋转动画。
- 波浪、冲击波、像素辐射、粒子和拖尾只出现在按钮左侧。
- Dark：蓝、紫、近黑渐变。
- Light：蓝白渐变；`high` 使用中蓝，`max` 使用更深蓝。
- 主题直接跟随 DSH 的 `body[data-ds-dark-theme]`，周边文字、焦点和错误状态复用 `--dsw-*` token。
- 模型与推理强度合并在同一个弹层中，不额外占用 composer 工具栏位置。
- 与 DSH 的 `/model` 命令共用会话 store；任一入口修改模型或 Effort，另一入口都会同步。
- 在“设置 → 通用设置 → 外观”下方提供持久化启用开关；关闭后立即回退到 DSH 原生模型选择器。
- 可选“大肥鱼滑块”；启用后用大肥鱼替换滑块按钮，拖动时自动加快播放。
- 写入失败会回滚到上一个已确认档位，并通过辅助状态与悬停提示报告错误。
- 插件不新增网络请求、遥测、凭据处理或服务端存储。

视觉决策记录在 [design/visual-spec.md](design/visual-spec.md)。

## 兼容性

当前版本面向：

- DeepSeek Harness packages：`0.1.0-rc.6`
- Node.js：`22.19+`
- React：18.x

DSH 当前仍是开发者预览版，上游破坏性变更可能需要插件发布适配版本。

## 从 GitHub 安装

仓库已提交构建后的 `lib/`，因此从 GitHub 安装时无需执行 TypeScript `prepare` 构建。

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.3.0
dsh --profile web --dump-config
```

安装完成后重启 DSH Web Host。

## 从 Release 压缩包安装

从 GitHub Release 下载 `dsh-reasoning-effort-0.3.0.tgz`，然后执行：

```powershell
dsh plugin --profile web add .\dsh-reasoning-effort-0.3.0.tgz
dsh --profile web --dump-config
```

Release 同时提供 SHA-256 校验文件。

## 使用方式

点击 composer 中的模型入口。当前模型明确公开 `off`、`high`、`max` 三档推理元数据时，弹层上方显示强度滑块；拖动按钮或点击轨道即可切换，下面的模型行用于进入模型列表。

如需暂时关闭增强控件而不卸载插件，请进入“设置 → 通用设置”，在“外观”下方关闭“推理强度选择器”。偏好仅以一个布尔值保存在当前浏览器的 `localStorage`。

设置页会在该开关下面显示“大肥鱼滑块”，简介为“用大肥鱼替换滑块按钮”。此选项默认关闭；启用后只替换白色按钮，不改变原有轨道、辐射特效、三档吸附、键盘操作和模型选择流程。八帧严格按上排从左到右、再下排从左到右播放。

## DSH 接入边界

客户端以低优先级覆盖单占位 `conversation.input.model` seat，原注册项仍保留为禁用或卸载后的自动回退。组件从 `modelDirectories.directoryFor(sessionId)` 取得当前会话目录，并通过与 DSH 原生模型选择器相同的目录提交完整选择；底层使用 `sessions.selectModel`，不会修改全局 provider 设置。

DSH 会在下一次 prompt assembly 边界采用新选择，已经运行中的步骤不受影响。部署锁定 `thinking: disabled` 或模型只公开 `off` 时，滑块会自动隐藏。

## 开发与构建

```powershell
pnpm install
pnpm run check
pnpm pack
```

`pnpm run check` 会执行 TypeScript 校验并重建 Host 入口与浏览器模块。浏览器产物会额外包装为 DSH `window.__ModuleLoader__` 可加载格式。

## 隐私与安全

插件不独立发起网络请求或收集遥测，只使用 DSH 已有的客户端服务读取、更新当前会话的模型选择。插件自行持久化的唯一数据是本地启用开关。

安全问题请参阅 [SECURITY.md](SECURITY.md)。

## 许可证

[MIT](LICENSE)
