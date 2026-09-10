<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort brings a Codex-style model and reasoning-effort slider to DeepSeek Harness" width="100%">

# dsh-reasoning-effort

**A Codex-style model and reasoning-effort control, built directly into DeepSeek Harness.**

[中文首页](README.md) · [Latest release](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [Report an issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![v0.7.1](https://img.shields.io/badge/release-0.7.1-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.7.1)
[![DSH RC](https://img.shields.io/badge/DSH-RC-8b5cf6?style=flat-square)](#version-support-policy)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)

</div>

Switch models and adjust reasoning effort below the DSH composer, with an eight-frame Big Fat Fish runner that speeds up as you drag. Levels come from the selected model, and selections stay synchronized with `/model`.

- **Model-defined levels** — adapts to their count, names, and order; failed updates roll back.
- **Native appearance** — dark and light themes, with Simplified Chinese and English following DSH's active language immediately.
- **Optional motion** — the runner is on by default, with a plain-thumb option and reduced-motion support.
- **Custom-model guidance** — copy configuration snippets, review them, and save them yourself.

<img src="assets/readme/themes.webp" alt="The reasoning effort selector running in DeepSeek Harness dark and light themes" width="100%">

[Install and update](#install-and-update) · [Version support](#version-support-policy) · [Appearance](#the-big-fat-fish-slider) · [Troubleshooting](#troubleshooting)

## Version support policy

This plugin targets relatively stable **DSH RC versions** for compatibility work, testing, and bug fixes. **Individual alpha versions are not maintained.** During alpha development, client APIs, dependencies, and plugin loading may undergo frequent breaking changes. Supporting multiple transitional versions increases maintenance costs and makes compatibility difficult to sustain.

The plugin supports **DSH `0.1.5-rc.1`**. Continue using **plugin `v0.7.1`**; no additional adaptation is needed. If you need an alpha version, maintain a temporary adaptation yourself. RC means release candidate; it does not imply automatic compatibility with every past or future RC.

| Item | Current status |
| --- | --- |
| Plugin release | [v0.7.1](https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.7.1) |
| Currently compatible version | DSH `0.1.5-rc.1`, Web Profile |
| Original v0.7.1 fix target | Model-slot injection error in DSH `0.1.2-rc.1` |
| Upgrade notes | The plugin remains compatible; continue using `v0.7.1` without code changes |
| Alpha versions | No separate adaptations; patch locally or switch to the target RC |

## Install and update

### 0. Install or update DSH

For a global npm installation of DSH, pin the current RC:

```powershell
npm install -g @deepseek-ai/dsh@0.1.5-rc.1
dsh --version
```

Confirm that the version output is `0.1.5-rc.1`. This updates DSH itself; install or update the plugin in the next step. For DSH running from source, follow the upstream source upgrade instructions.

### 1. Install a pinned release

Run these commands in the terminal environment you use to start DSH:

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.7.1
dsh --profile web --dump-config
```

Confirm that the output includes `name: dsh-reasoning-effort`. Use the same `add` command to update an existing installation. To try development changes, replace `#v0.7.1` with `#main`; the main branch may contain unreleased changes.

<details>
<summary>Ask an agent to install it: copy this prompt</summary>

```text
Install dsh-reasoning-effort v0.7.1 for the DeepSeek Harness web profile.
Run only these two commands and do not change any other profile:
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#v0.7.1
dsh --profile web --dump-config
Confirm that dsh-reasoning-effort appears in the configuration and report the result.
Do not stop or restart the running DSH process. Remind me to restart the Web Host and refresh the page manually.
```

</details>

### 2. Restart and refresh

The plugin loads when the Web Host starts. After installation, restart the DSH Web Host manually and refresh the page.

### 3. Choose a model and effort level

Open a session and click the model control below the composer. Drag the thumb or click the track; release to snap to the nearest valid level. Click the model row below it to expand the model list.

## Where the levels come from

The slider reads `reasoning.efforts` from the current model in DSH's model directory. The model and route determine the count, names, and order. Levels are not fixed to three steps and can differ between endpoints.

The slider appears when at least two levels are available; otherwise the menu shows a notice. DSH validates and dispatches the selected value, so the plugin cannot bypass model or deployment limits.

## Effort guidance for custom providers

Built-in routes get their levels from the pi-ai catalog and the plugin never touches them. Only models you declare yourself in `llm-pi-ai` receive guidance:

1. Open the model menu. If the current model is your own declaration and the directory exposes no levels (or the declaration disagrees with the knowledge base), a **View declaration guidance** entry appears.
2. The panel shows the suggested levels (e.g. GLM-5.2 → minimal/low/medium/high) and a copy-ready complete entry YAML — including the `- id:` line, with your existing `name`/`contextWindow`/`maxTokens` preserved — plus the settings.yaml path.
3. Replace the matching `- id:` entry with the copied content (do not create a second `llm-pi-ai:` root) and save. DSH reloads automatically; if not, restart the Web Host and refresh.

Models the knowledge base does not know get an annotated template to fill from the endpoint's docs. Known-hostile gateways (e.g. Aliyun Bailian `maas/dashscope.aliyuncs.com`, which rejects the `developer` message role) get an explicit warning, because settings.yaml cannot override that behavior.

<details>
<summary>Advanced: extend the plugin knowledge base</summary>

The built-in knowledge base covers GLM-5.2 (`minimal/low/medium/high`) and Kimi K3 (`low/high/max`). Add more models under the plugin's own settings namespace; user entries win over built-ins:

```yaml
dsh-reasoning-effort:
  entries:
    - id: my-model
      provider: "*"          # provider route, * wildcard
      model: "my-model-id"   # model id, * wildcard
      note: description
      efforts:               # display level -> wire value the endpoint accepts
        low: "low"
        high: "high"
        max: "max"
      compat:                # openai-completions routes only
        thinkingFormat: "openai"
        supportsReasoningEffort: true
```

The plugin only provides snippets — it never writes configuration, and catalog-declared level sets (even a single level) are never flagged.

</details>

## The Big Fat Fish slider

The eight-frame runner is **enabled by default**. To switch back to the plain white thumb:

1. Open **Settings → General**.
2. Find **Big Fat Fish slider** below Appearance.
3. Disable it and return to the model control.

<img src="assets/readme/settings.webp" alt="The reasoning effort and Big Fat Fish slider switches in DeepSeek Harness General Settings" width="100%">

The runner changes only the thumb artwork. Snapping, keyboard control, radiation effects, and model selection remain unchanged. It animates faster while dragging and freezes on a stable frame when reduced motion is enabled.

The **Reasoning effort selector** switch on the same page disables the complete enhancement without uninstalling it. DSH's built-in model selector returns immediately. Both preferences stay in the current browser.

## Troubleshooting

### The slider does not appear

Check that:

1. Check the running version with `dsh --version`; DSH `0.1.5-rc.1` works with plugin `v0.7.1`.
2. You restarted the DSH Web Host after installation.
3. **Settings → General → Reasoning effort selector** is enabled.
4. The selected model exposes at least two effort levels in the DSH model directory (see the next entry for models without any), and thinking is not disabled by the deployment.

### A model declares no effort levels

First check **View declaration guidance** in the model menu. For manual configuration, fill in the model's `reasoningEfforts` and `compat` fields in `settings.yaml` using the current model and endpoint documentation. Do not reuse another model's levels or context limits without checking them.

The knowledge base provides guidance; the endpoint determines accepted values. If saving does not take effect, restart the Web Host and refresh the page.

### Report a problem on an RC version

Open an [issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues) with your DSH version, plugin version, client type (Web or desktop wrapper), reproduction steps, and relevant console errors. Remove tokens and credentials before posting.

### Confirm that the plugin loaded

```powershell
dsh --profile web --dump-config
```

The output should contain `name: dsh-reasoning-effort`.

### Uninstall

```powershell
dsh plugin --profile web remove dsh-reasoning-effort
```

Restart the DSH Web Host afterward. The native model selector will return automatically.

## Development

```powershell
pnpm install
pnpm run check
pnpm pack
```

Use Node.js `22.19+` (also meeting the target DSH requirements) and `pnpm@11.7.0`. `pnpm run check` validates TypeScript and locale dictionaries, then rebuilds the host entry, browser module, and type declarations. See [design/visual-spec.md](design/visual-spec.md) for the complete interaction contract and [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

[MIT](LICENSE) © HanaAyane
