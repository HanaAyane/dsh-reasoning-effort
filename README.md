# dsh-reasoning-effort

[简体中文](README.zh.md)

A Codex-style model and reasoning-effort selector for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). It replaces the composer model control with a single popover: an `off` / `high` / `max` slider above the model picker.

## Features

- Three reasoning levels with continuous pointer tracking and snap-on-release.
- Blue-violet-black dark theme and blue-white light theme.
- White thumb with waves, shock pulses, pixel radiation, particles, and trails clipped strictly to its left side.
- One combined model + effort control that stays synchronized with DSH's `/model` command.
- Per-session model selection through DSH's existing model directory and RPC layer.
- Persistent enable switch under **Settings → General → Appearance**.
- Automatic fallback to DSH's built-in model selector when disabled or uninstalled.
- No network requests, analytics, credentials, or server-side storage added by the plugin.

The approved interaction and color decisions are recorded in [design/visual-spec.md](design/visual-spec.md).

## Compatibility

The current release targets:

- DeepSeek Harness packages `0.1.0-rc.6`
- Node.js `22.19+`
- React `18.x`

DeepSeek Harness is currently a developer preview. Breaking upstream changes may require a new plugin release.

## Install from GitHub

The repository commits its built `lib/` output, so the GitHub installation does not need a TypeScript `prepare` build.

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.3.0
dsh --profile web --dump-config
```

Restart the DSH Web host after installation.

## Install the release archive

Download `dsh-reasoning-effort-0.3.0.tgz` from the GitHub Release, then run:

```powershell
dsh plugin --profile web add .\dsh-reasoning-effort-0.3.0.tgz
dsh --profile web --dump-config
```

The release also includes a SHA-256 checksum file.

## Usage

Open the model control in the composer. The effort slider is shown above the current-model row whenever the selected model exposes all three values: `off`, `high`, and `max`. Drag the thumb or click the track, then choose a model from the row below it.

To disable the enhanced control without uninstalling the plugin, open **Settings → General** and turn off **Reasoning effort selector** below Appearance. The preference is stored as one boolean in the browser's `localStorage`.

## How it integrates with DSH

The client registers a low-priority replacement for the single `conversation.input.model` seat. It reads the current session through `modelDirectories.directoryFor(sessionId)` and submits the full selection through the same directory used by DSH's built-in selector. The underlying RPC is `sessions.selectModel`; global provider settings are never changed.

If a deployment disables thinking or a model exposes only `off`, the effort slider is hidden. A failed update rolls the UI back to the last confirmed value.

## Development

```powershell
pnpm install
pnpm run check
pnpm pack
```

`pnpm run check` runs TypeScript validation and rebuilds both the host entry and the browser module. The browser bundle is wrapped for DSH's `window.__ModuleLoader__` runtime.

## Privacy and security

This plugin does not make independent network requests or collect telemetry. It uses DSH's existing client services to read and update the active session's model selection. The only plugin-owned persisted value is the local enable/disable preference.

Please report security issues according to [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
