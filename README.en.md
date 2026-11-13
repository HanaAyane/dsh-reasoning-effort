<p align="center">
  <img src="./assets/readme/hero-v1.webp" width="420" alt="Big Fat Fish running in a blue maid outfit">
</p>

<h1 align="center">dsh-reasoning-effort 1.0.0</h1>

<p align="center">Drag to adjust reasoning effort inside <strong>DeepSeek Harness</strong>’s native model menu. Version 1.0.0 adds <strong>10 runners across 9 model families</strong> and a dedicated settings page with a draggable preview.</p>

<p align="center">
  <a href="README.md">中文</a> · <a href="#install-and-update">Install</a> · <a href="https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort">npm</a> · <a href="https://github.com/HanaAyane/dsh-reasoning-effort/releases">Releases</a> · <a href="https://github.com/HanaAyane/dsh-reasoning-effort/issues">Report an issue</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort"><img src="https://shieldcn.dev/npm/dt/@ayanehana/dsh-reasoning-effort.svg?label=npm%20total%20downloads" width="153" alt="Total npm downloads"></a>
  <a href="https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort"><img src="https://shieldcn.dev/npm/dm/@ayanehana/dsh-reasoning-effort.svg?label=npm%20downloads" width="163" alt="npm downloads over the last 30 days"></a>
</p>

## Runners and tracks

<p align="center">
  <img src="./assets/readme/model-family-grid.webp" width="600" alt="A three-by-three grid of chibi runners from nine model families">
</p>

<img src="./assets/readme/runners-v1.webp" width="100%" alt="Ten runners with their tracks and trails in light and dark themes">

Choose Big Fat Fish, its winter outfit, or a runner for OpenAI, Claude, Gemini, Grok, Kimi, GLM, Qwen, or MiniMax. Each runner has a **16-frame** animation that speeds up as you drag. The track and trail take on the selected runner’s colors.

## Install and update

### Desktop

Open **Plugins → Add plugin → Package name or address**, enter the package below, and reload when prompted.

```text
@ayanehana/dsh-reasoning-effort@1.0.0
```

### Web

```powershell
dsh plugin --profile web add @ayanehana/dsh-reasoning-effort@1.0.0
```

Restart the DSH Web Host and refresh the page after installation.

## Adjust reasoning effort

Click the current model below the composer and open **Effort**. Drag or click the slider to choose a level the model supports. Press `Esc` to return to the model menu. DSH still provides search, groups, and the Agent Teams toggle. When you switch back to a model, the plugin restores the last confirmed level if it is still supported.

## Customize the slider

Open **Settings → Reasoning effort slider** to follow the active model, choose a fixed runner, or use a plain slider. Runner size ranges from **50% to 125%**, with 50% as the default. Drag the preview to try the effects while your session keeps its current effort.

<img src="./assets/readme/settings-v1-en.webp" width="100%" alt="Reasoning effort settings with a size control, draggable preview, and ten character choices">

## Compatibility and custom models

- Compatibility maintenance targets DSH RC builds. The native menu integration targets **DSH 0.2.2-rc.2**.
- If a custom model has no effort levels, open **Settings → Models → Edit provider → Customized settings → Model options → Reasoning levels** and use the values from the endpoint’s API documentation.

Thanks to @xihucuyudaichi for contributing the original set of model runners. [PR #9](https://github.com/HanaAyane/dsh-reasoning-effort/pull/9)

[Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [MIT license](LICENSE)
