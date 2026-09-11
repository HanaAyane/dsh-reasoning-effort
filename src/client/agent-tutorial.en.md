# Background: why the levels are missing

DSH's model directory only reports **what the adapter declared**. When a model carries no reasoning metadata, the pi-ai adapter omits the `reasoning` field entirely, so the browser catalog has no `reasoning.efforts` and the model menu shows no slider.

A custom route (a provider the user declared under `llm-pi-ai`) carries no such metadata by default:

- its provider key is not one of pi-ai's built-in catalog providers (e.g. `deepseek`, `zai`, `moonshotai-cn`, `qwen-token-plan-cn`), so there is no catalog entry to read;
- with no catalog entry, `reasoning` defaults to `false` unless `reasoningEfforts` is written on that model entry.

Conclusion: **a custom model must declare its own levels.** The plugin cannot invent them — submitting an undeclared level is refused by DSH with `UNSUPPORTED_REASONING_EFFORT`.

# What to write

In `settings.yaml`, find that model's entry under `llm-pi-ai.providers.<route>.models` and add `reasoningEfforts`:

```yaml
- id: <model id>
  reasoningEfforts:      # key = DSH level; value = the spelling the endpoint accepts
    low: "low"
    high: "high"
```

Rules:

1. **A key must be a DSH level**: `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`.
2. **A value is the endpoint's own spelling**: if the endpoint takes `"high"` / `"max"` for `reasoning_effort`, write `high: "high"` and `max: "max"`.
3. **A level left out counts as unsupported** (resolution pins it), so declare only the levels the endpoint really offers.
4. For a model that does not reason at all, write `reasoningEfforts: false`; **never an empty `reasoningEfforts:` or `{}`** — that fails the configuration outright.
5. `off` is special: writing `off:` with an empty value means "supported, and send nothing when off"; leaving `off` out means "off is unsupported".
6. The slider needs at least two levels.

# compat: only when the endpoint needs it

`compat` sits beside `reasoningEfforts`. With none, the adapter decides from the endpoint address: an address it does not recognize is treated as standard OpenAI, and a recognized vendor endpoint gets that vendor's format — **so a guessed format is worse than none**.

| Endpoint behaviour | What to write |
| --- | --- |
| expresses effort directly through `reasoning_effort` | nothing |
| needs its thinking switch sent first | `compat: { thinkingFormat: "qwen" }` sends `enable_thinking` + `reasoning_effort`; `"zai"` sends `thinking: {type: enabled}` + `reasoning_effort`; `"deepseek"` sends `thinking: {type: enabled}` |
| does not accept `reasoning_effort` | `compat: { supportsReasoningEffort: false }` |
| fails with 400 `invalid_parameter_error` | `compat: { supportsDeveloperRole: false }`, sending the system prompt as `system` |
| fails while replaying history | `compat: { requiresReasoningContentOnAssistantMessages: true }` |
| only understands `<thinking>` text | `compat: { requiresThinkingAsText: true }` |

**Mind the protocol**: these `compat` fields are meaningful only on a route whose `api` is `openai-completions`. On another protocol (e.g. `anthropic-messages`) DSH does not ignore them — it **fails resolution**, the provider route disappears from the model menu.

# How to confirm the fix

1. Save `settings.yaml`. DSH reloads automatically; if it does not, restart the Web Host and refresh the page.
2. Open the model menu: the reasoning-effort slider appearing means the directory now reads the levels.
3. Slider present but requests failing: almost always a wrong `compat` or a level value the endpoint rejects — work through the table above.
4. The whole route missing from the menu: a `compat` field the protocol does not take was written; remove it first.

# What not to do

- Do not invent level values. Check the endpoint documentation, or ask the user.
- Do not change anything outside that model entry; keep `name`, `contextWindow`, `maxTokens` and other existing fields as they are.
- Do not create a second `llm-pi-ai:` root.
- Do not switch providers to work around the problem unless the user asks.
