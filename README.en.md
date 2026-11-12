<div align="center">

<img src="https://raw.githubusercontent.com/HanaAyane/dsh-reasoning-effort/v0.9.1/assets/readme/hero.webp" alt="Actual DSH screenshot with the native model control and plugin effort slider" width="100%">

# dsh-reasoning-effort

**DSH’s native model selector, with a reasoning-effort slider inside its Effort entry.**

[中文首页](README.md) · [npm](https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort) · [Latest release](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [Report an issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![v0.9.3](https://img.shields.io/badge/release-0.9.3-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.9.3)
[![DSH RC](https://img.shields.io/badge/DSH-RC-8b5cf6?style=flat-square)](#version-support-policy)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)
[![Total release asset downloads](https://img.shields.io/github/downloads/HanaAyane/dsh-reasoning-effort/total.svg?style=flat-square&label=total%20downloads)](https://github.com/HanaAyane/dsh-reasoning-effort/releases)
[![npm monthly downloads](https://img.shields.io/npm/dm/@ayanehana/dsh-reasoning-effort.svg?style=flat-square&label=npm%20downloads%2Fmonth)](https://www.npmjs.com/package/@ayanehana/dsh-reasoning-effort)

</div>

The plugin keeps DSH's model search, groups, and Agent Teams toggle, and remembers the last effort level for each model.

<img src="https://raw.githubusercontent.com/HanaAyane/dsh-reasoning-effort/v0.9.1/assets/readme/themes.webp" alt="Actual dark and light DSH screenshots of the plugin slider" width="100%">

## Slider appearance

Under **Settings → Reasoning effort slider**, choose **Follow model**, **Plain slider**, or a fixed runner to use across all models. The track and trail use the displayed runner's colors, which both Big Fat Fish outfits share. The plain slider uses the current model's colors. You can also turn off the plugin slider here to restore the built-in DSH model menu.

Drag the preview slider on the same page to try the runner and its effects. Your session keeps its current effort level.

Thanks to @xihucuyudaichi for contributing the original set of model runners. The Gemini and Qwen sprites are adapted from that contribution. [PR #9](https://github.com/HanaAyane/dsh-reasoning-effort/pull/9)

## Version support policy

Plugin **`v0.9.3` supports DSH `0.2.2-rc.2`**. Compatibility maintenance targets DSH RC versions.

## Install and update

### Web

Run this command in a terminal, then restart the DSH Web Host and refresh the page.

```powershell
dsh plugin --profile web add @ayanehana/dsh-reasoning-effort@0.9.3
```

### Desktop

1. In DSH Desktop, open **Plugins → Add plugin**.
2. Enter `@ayanehana/dsh-reasoning-effort@0.9.3` in **Package name or address** and install it.
3. Reload when prompted.

## How to use it

- Click the current model below the message box, then choose **Effort**. Drag or click the slider to choose a level. Press `Esc` to return to the model menu.
- If a custom model has no levels, open **Settings → Models → Edit provider → Customized settings → Model options → Reasoning levels** and use the values from the model's API documentation.

[Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [MIT license](LICENSE)
