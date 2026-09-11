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
- **Custom-model guidance** — copy a configuration snippet, or one-click copy a whole brief for an agent to diagnose and fill in.

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

## Declaring levels for any custom model

This section is vendor-neutral and applies to every model you declare yourself under `llm-pi-ai`.

**Why the levels are missing**: DSH's model directory only reports what the adapter declares. A model you declare has no catalog entry, so the directory exposes no levels — and no slider — until you write `reasoningEfforts`.

**What to write**: find the model's entry in `settings.yaml` and add `reasoningEfforts` — each key is a DSH level, each value is the spelling that endpoint accepts, and a level you leave out counts as unsupported:

```yaml
      models:
        - id: <your model id>
          reasoningEfforts:
            low: "<value the endpoint accepts>"
            high: "<value the endpoint accepts>"
```

**When to add `compat`** (beside `reasoningEfforts`, only when the endpoint needs it):

| Endpoint behaviour | What to add |
| --- | --- |
| expresses effort directly through `reasoning_effort` | nothing |
| needs its thinking switch turned on first | `compat.thinkingFormat`: `"qwen"` (sends `enable_thinking`) / `"zai"` / `"deepseek"` |
| does not accept `reasoning_effort` | `compat.supportsReasoningEffort: false` |
| fails with 400 `invalid_parameter_error` | `compat.supportsDeveloperRole: false` |
| fails while replaying history | `compat.requiresReasoningContentOnAssistantMessages: true` |
| does not reason at all | `reasoningEfforts: false` |

With no `compat`, the adapter decides from the endpoint address: an address it does not recognize is treated as standard OpenAI, and a recognized vendor endpoint gets that vendor's format automatically. **Guessing the format is worse than leaving it out.**

**How to verify**: open the model menu after saving — the slider appearing means it worked. If the slider appears but requests fail, work through the table above. The plugin's built-in knowledge entries are shortcuts, not a requirement.

## Effort guidance for custom providers

Built-in routes get their levels from the pi-ai catalog and the plugin never touches them. Only models you declare yourself in `llm-pi-ai` receive guidance:

1. Open the model menu. If the current model is your own declaration and the directory exposes no levels (or the declaration disagrees with the knowledge base), a **View declaration guidance** entry appears.
2. The panel shows the suggested levels (the ones the knowledge base records for that model, or a generic template when it is not covered) and a copy-ready complete entry YAML — including the `- id:` line, with your existing `name`/`contextWindow`/`maxTokens` preserved — plus the settings.yaml path.
3. Replace the matching `- id:` entry with the copied content (do not create a second `llm-pi-ai:` root) and save. DSH reloads automatically; if not, restart the Web Host and refresh.

Models the knowledge base does not know get a generic template you can edit directly. When a gateway rejects requests for a reason the template cannot express — an endpoint refusing the `developer` message role, for instance — the panel names the matching `compat` switch (`supportsDeveloperRole: false`).

If you would rather not fill it in yourself, or the declaration still fails, press **Copy for your agent** beside the panel: it puts a single brief on the clipboard — the observed facts (route, model id, settings.yaml path, entry line, levels the directory reads, knowledge-base suggestion, endpoint caveat), your task, the complete declaration rules, and a starting snippet. Paste it into any coding agent and it can read settings.yaml, check the endpoint documentation, write the configuration, and tell you what was wrong.

<details>
<summary>Advanced: extend the plugin knowledge base</summary>

The built-in entries cover only a few models, purely to save typing. Add more models under the plugin's own settings namespace; user entries win over built-ins:

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
      # compat:              # only when the endpoint needs a fixed format
      #   thinkingFormat: "qwen"
      #   supportsReasoningEffort: false
```

A `compat` block is copied into the generated snippet **verbatim**, so fill it in only when the endpoint really needs a fixed format: with none, the adapter decides from the endpoint address (an unrecognized address is treated as standard OpenAI, a recognized vendor gets that vendor's format), and a wrong format overrides that correct decision. On a protocol that does not take the field (e.g. `anthropic-messages`) the pasted entry makes the whole route fail to resolve.

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
