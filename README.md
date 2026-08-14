<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort brings a Codex-style model and reasoning-effort slider to DeepSeek Harness" width="1200">

# dsh-reasoning-effort

**A Codex-style model and reasoning-effort control, built directly into DeepSeek Harness.**

[简体中文](README.zh.md) · [Latest release](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [Report an issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

![Release](https://img.shields.io/github/v/release/HanaAyane/dsh-reasoning-effort?style=flat-square&color=6f83ff)
![DSH](https://img.shields.io/badge/DSH-0.1.0--rc.6-8b5cf6?style=flat-square)
![License](https://img.shields.io/github/license/HanaAyane/dsh-reasoning-effort?style=flat-square&color=536990)

</div>

The plugin replaces DSH's composer model control with one compact popover: the `off` / `high` / `max` reasoning slider sits above the current model. It feels native, stays synchronized with `/model`, and falls back cleanly when disabled.

## See it in DSH

<img src="assets/readme/themes.webp" alt="The reasoning effort selector running in DeepSeek Harness dark and light themes" width="1200">

- **Direct and responsive** — the thumb follows the pointer continuously, then snaps to one of three supported levels on release.
- **Project-native themes** — blue-violet-black in dark mode; blue-white with progressively stronger blues in light mode.
- **Effects with direction** — waves, shock pulses, pixel radiation, particles, and trails remain clipped behind the thumb on its left side.
- **One session state** — the visual control and DSH's `/model` command read and update the same session model directory.
- **Safe fallback** — disable or uninstall the plugin and DSH's built-in selector resumes automatically.

## Install

### Install from `main`

The Big Fat Fish slider is included directly in `main`, currently versioned `0.4.0`:

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#main
dsh --profile web --dump-config
```

Restart the DSH Web host after installation.

### Released archive

The latest tagged release is currently `v0.3.0`:

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.3.0
dsh --profile web --dump-config
```

For an offline install, download the `.tgz` and checksum from the [latest release](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest), then add the local archive with `dsh plugin --profile web add <archive>`.

## Use it

1. Open the model control in the composer.
2. Drag or click the effort track; release to snap to `off`, `high`, or `max`.
3. Use the model row below the slider to enter DSH's model list.

The slider appears only when the selected model exposes all three effort values. It stays hidden when thinking is disabled or only `off` is available.

## Big Fat Fish slider

<img src="assets/readme/settings.webp" alt="DeepSeek Harness General Settings with the reasoning effort and Big Fat Fish slider switches enabled" width="1200">

Open **Settings → General → Appearance** to control the plugin:

- **Reasoning effort selector** enables or disables the enhanced model control.
- **Big Fat Fish slider** replaces only the white thumb with the eight-frame runner. The animation accelerates while dragging; snapping, keyboard control, radiation effects, and model selection remain unchanged.

Both preferences stay in the current browser. Reduced-motion mode freezes the runner on a stable frame.

## How it fits into DSH

```mermaid
flowchart LR
    A[Composer model button] --> B[Plugin seat replacement]
    B --> C[Session model directory]
    D[/model command] --> C
    C --> E[sessions.selectModel]
    E --> F[Confirmed model + effort]
```

The client registers a low-priority replacement for the single `conversation.input.model` seat. It reads the active session through `modelDirectories.directoryFor(sessionId)` and submits the complete selection through the same directory used by DSH's native model selector. It never changes global provider settings.

Failed updates roll the interface back to the last confirmed value. The complete interaction and color contract lives in [design/visual-spec.md](design/visual-spec.md).

## Compatibility

| Component | Target |
| --- | --- |
| DeepSeek Harness packages | `0.1.0-rc.6` |
| Node.js | `22.19+` |
| React | `18.x` |

DeepSeek Harness is a developer preview. Upstream UI or service changes may require a matching plugin update.

## Develop

```powershell
pnpm install
pnpm run check
pnpm pack
```

`pnpm run check` runs TypeScript validation and rebuilds both the host entry and browser module. The browser bundle is wrapped for DSH's `window.__ModuleLoader__` runtime; built `lib/` output is committed so GitHub installs do not need a `prepare` build.

## Privacy and security

The plugin adds no independent network requests, analytics, credential handling, or server-side storage. It uses DSH's existing client services to read and update the active session. Plugin-owned preferences are stored only in browser `localStorage`.

Please report vulnerabilities according to [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © HanaAyane
