<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort brings a Codex-style model and reasoning-effort slider to DeepSeek Harness" width="1200">

# dsh-reasoning-effort

**A Codex-style model and reasoning-effort control, built directly into DeepSeek Harness.**

[中文首页](README.md) · [Latest release](https://github.com/HanaAyane/dsh-reasoning-effort/releases/latest) · [Report an issue](https://github.com/HanaAyane/dsh-reasoning-effort/issues)

[![main 0.6.0](https://img.shields.io/badge/main-0.6.0-6f83ff?style=flat-square)](https://github.com/HanaAyane/dsh-reasoning-effort/tree/main)
[![DSH 0.1.0-rc.6](https://img.shields.io/badge/DSH-0.1.0--rc.6-8b5cf6?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)

</div>

On first launch, the plugin adds a combined model control below the DSH composer. Open it to find the reasoning-effort slider, whose levels adapt to whatever the selected model exposes, above the familiar model picker. The plugin is enabled by default and stays synchronized with DSH's `/model` command.

## First use in three steps

### 1. Install the plugin

#### Ask an agent to install it (recommended)

If your current agent can run terminal commands, send it this complete prompt:

```text
Install dsh-reasoning-effort for the DeepSeek Harness web profile.

Run only these two commands and do not change any other profile:
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#main
dsh --profile web --dump-config

Confirm that dsh-reasoning-effort appears in the output, then report the result.
Do not stop or restart my running DSH process. Remind me to restart the DSH Web Host manually after installation.
```

The agent should report whether `dsh-reasoning-effort` appeared in the resolved configuration.

#### Install manually

Open PowerShell and run:

```powershell
dsh plugin --profile web add github:HanaAyane/dsh-reasoning-effort#main
dsh --profile web --dump-config
```

`main` is currently versioned `0.5.0`, matching the latest release tag `v0.5.0`. `#main` always installs the newest code (which may later include unreleased changes); replace `#main` with `#v0.5.0` to pin this release.

### 2. Restart the DSH Web Host

The plugin loads when the Web Host starts. After installation, stop the current host, start it again, and refresh the DSH page.

### 3. Open the model control

1. Create or open a session.
2. Click the model-and-effort button below the composer.
3. Drag the thumb or click the track; release to snap to the nearest level.
4. Click the model row below the slider to enter DSH's native model list.

Your result should look like this:

<img src="assets/readme/themes.webp" alt="The reasoning effort selector running in DeepSeek Harness dark and light themes" width="1200">

## Where the levels come from

The slider renders exactly the `reasoning.efforts` the selected model exposes in the DSH model directory — count, names, and order are the model's, and the plugin adapts automatically. A common three-level combination:

| Level | Good for | Tendency |
| --- | --- | --- |
| `off` | Simple questions, rewriting, quick actions | Faster |
| `high` | Everyday coding, analysis, multi-step work | Balanced |
| `max` | Complex debugging, planning, difficult tasks | More reasoning |

DeepSeek models typically expose `off` / `high` / `max`; GLM coding models (e.g. GLM-5.2) expose five levels: `off` / `low` / `medium` / `high` / `xhigh`. The slider submits effort values exposed by the selected model; it does not bypass model or deployment limits. When a model exposes fewer than two levels, or none at all, the menu shows "current model provides no reasoning-effort levels" — see the troubleshooting section below for how to declare them.

## Effort guidance for custom providers

Built-in routes get their levels from the pi-ai catalog and the plugin never touches them. Only models you declare yourself in `llm-pi-ai` receive guidance:

1. Open the model menu. If the current model is your own declaration and the directory exposes no levels (or the declaration disagrees with the knowledge base), a **View declaration guidance** entry appears.
2. The panel shows the suggested levels (e.g. GLM-5.2 → minimal/low/medium/high) and a copy-ready complete entry YAML — including the `- id:` line, with your existing `name`/`contextWindow`/`maxTokens` preserved — plus the settings.yaml path.
3. Replace the matching `- id:` entry with the copied content (do not create a second `llm-pi-ai:` root) and save. DSH reloads automatically; if not, restart the Web Host and refresh.

Models the knowledge base does not know get an annotated template to fill from the endpoint's docs. Known-hostile gateways (e.g. Aliyun Bailian `maas/dashscope.aliyuncs.com`, which rejects the `developer` message role) get an explicit warning, because settings.yaml cannot override that behavior.

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

## Enable the Big Fat Fish slider

The first installation uses the plain white thumb. To switch to the eight-frame runner:

1. Open **Settings → General**.
2. Find **Big Fat Fish slider** below Appearance.
3. Enable it and return to the model control.

<img src="assets/readme/settings.webp" alt="The reasoning effort and Big Fat Fish slider switches in DeepSeek Harness General Settings" width="1200">

The runner changes only the thumb artwork. Snapping, keyboard control, radiation effects, and model selection remain unchanged. It animates faster while dragging and freezes on a stable frame when reduced motion is enabled.

The **Reasoning effort selector** switch on the same page disables the complete enhancement without uninstalling it. DSH's built-in model selector returns immediately. Both preferences stay in the current browser.

## What the plugin adds

- **Direct pointer tracking** — the thumb follows the pointer continuously and snaps only on release.
- **Native dark and light themes** — blue-violet-black in dark mode and progressively stronger blues on white in light mode.
- **Left-only motion effects** — waves, shock pulses, pixel radiation, particles, and trails remain behind the thumb.
- **Shared DSH session state** — the slider and `/model` command use the same session model directory.
- **Automatic rollback** — a failed update restores the last confirmed selection.
- **No extra network behavior** — no plugin telemetry, credential handling, or server-side storage.

## Troubleshooting

### The slider does not appear

Check that:

1. You restarted the DSH Web Host after installation.
2. **Settings → General → Reasoning effort selector** is enabled.
3. The selected model exposes at least two effort levels in the DSH model directory (see the next entry for models without any), and thinking is not disabled by the deployment.

### A model declares no effort levels (e.g. GLM-5.3)

Models missing from pi-ai's built-in catalog carry no reasoning levels at all, and the menu shows "current model provides no reasoning-effort levels". Declare them in `~/.dsh/settings.yaml` — for GLM-5.3 on a zai coding route:

```yaml
llm-pi-ai:
  providers:
    zai-coding-cn:
      models:
        - id: glm-5.3
          name: GLM-5.3
          contextWindow: 1000000
          maxTokens: 131072
          reasoningEfforts:   # key = level shown on the slider, value = reasoning_effort sent to the API
            low: "low"
            high: "high"
            xhigh: "max"
          compat:             # the zai route's detection does not send reasoning_effort by default
            thinkingFormat: "zai"
            supportsReasoningEffort: true
```

Notes:

- Level names come from the DSH level vocabulary (`off` / `minimal` / `low` / `medium` / `high` / `xhigh`); values are the `reasoning_effort` spellings the endpoint accepts. Leaving `off` undeclared makes it unselectable, which suits models that cannot turn thinking off.
- Models already in the pi-ai catalog (e.g. GLM-5.2) inherit their levels automatically — no configuration needed.
- Once upstream catalogs include the model, the hand-written declaration can be removed; explicit entries always win over the catalog.
- Submitted levels are validated and dispatched by the host; the plugin never bypasses model or deployment limits.

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

## Compatibility

| Component | Target |
| --- | --- |
| DeepSeek Harness packages | `0.1.0-rc.6` |
| Node.js | `22.19+` |
| React | `18.x` |

DeepSeek Harness is a developer preview. Upstream UI or service changes may require a matching plugin update.

## Development

```powershell
pnpm install
pnpm run check
pnpm pack
```

`pnpm run check` validates TypeScript and rebuilds both the host entry and browser module. See [design/visual-spec.md](design/visual-spec.md) for the complete interaction contract and [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

[MIT](LICENSE) © HanaAyane
