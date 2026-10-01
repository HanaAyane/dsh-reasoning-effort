# Confirm the target and endpoint capabilities

Target configuration: `{{CONFIG_FILE}}`. Model entry location: `{{ENTRY_PATH}}`. These are snapshots from copy time. Confirm the active profile, provider, and model ID again before editing; follow the actual indentation instead of rebuilding the configuration from an example.

Read the model entry and its route's `api`, `baseURL`, existing `reasoningEfforts`, and model-level and route-level `compat`. Check the installed DSH / pi-ai versions. Omitted fields may inherit catalog defaults, so inspect the effective configuration. Missing directory levels mean no metadata is currently exposed, not that the endpoint cannot reason; existing directory levels do not prove that a gateway accepts every parameter.

Use the actual endpoint's official documentation and confirmed request behaviour. Model-vendor documentation is a reference, but proxies, gateways, subscription endpoints, and different protocols may expose different parameters for the same model ID. Model listings usually only identify models and do not establish effort levels. Treat built-in or user knowledge-base suggestions as leads; a mismatch alone is no reason to overwrite valid configuration.

Provide a capability table: control mechanism, endpoint parameters, legal values, effective meaning of each level, off behaviour, and evidence sources. Distinguish effort enums, thinking switches, and token budgets; aliases are not independent strengths. Without reliable evidence, ask for endpoint documentation, desired levels, or a redacted error instead of guessing.

# Rules for reasoningEfforts

DSH's `reasoningEfforts` maps display levels to endpoint values. This is only a structural example: replace every placeholder and adjust `low` / `high` to verified capabilities. They are not recommended levels for this model:

```yaml
reasoningEfforts:
  low: "<value confirmed for this endpoint>"
  high: "<another confirmed endpoint value>"
```

1. Keys must be `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, or `max`. Non-null values are endpoint-value strings; numeric budgets cannot be placed directly in the map.
2. Declare only supported levels. Omitted levels are unsupported; non-`off` levels cannot have null or empty-string values. Do not invent strength differences to populate a slider.
3. Use `off: "<off value>"` for an explicitly supported endpoint off value. `off: null` offers the option while omitting its effort value; it does not by itself guarantee that thinking stops. Verify the protocol, thinking switch, and endpoint default. Other levels cannot be null.
4. `reasoningEfforts: false` withholds reasoning levels from DSH; it does not guarantee that the endpoint stops thinking. Do not use an empty map or declare only `off`: a map needs at least one non-`off` level.
5. The plugin needs at least two levels to display a slider. Report a single level or a thinking-only switch accurately; offer `off` and an enabled level only when their behaviour is confirmed.
6. For budget control, check whether the current adapter supports the protocol and fields such as `thinkingBudgets`. Do not treat effort strings as token counts. If route-level budgets must change, explain the impact on other models and have the user define the scope.

# Check compat against the protocol

Establish the effective `api` first, then inspect the compat fields this DSH version permits. Preserve valid existing fields and add or adjust `compat` only with documentation or specific error evidence. One vendor's format is not a universal endpoint format.

For `openai-completions`, the adapter may use `thinkingFormat` for the endpoint's thinking switch and `supportsReasoningEffort` to decide whether to send an effort field. These settings must match the real endpoint parameters. Suppressing the effort field is not proof that different levels work. Follow the respective adapter rules for other protocols instead of copying these fields.

A 400 error does not necessarily concern the `developer` role. Consider the protocol's `supportsDeveloperRole: false` only when the error names that role or documentation establishes the restriction. History failures also have multiple causes: inspect redacted errors and reasoning-content retention/replay requirements before applying a switch. If the host cannot express a required parameter, report the adapter limitation instead of inventing configuration keys.

# Editing scope and deliverables

Merge the necessary `reasoningEfforts` / `compat` fields into the existing model entry. Preserve `name`, `contextWindow`, `maxTokens`, input capabilities, authentication, and other fields. Do not duplicate `llm-pi-ai`, replace the provider, switch models automatically, or migrate profiles. Leave route-level fields alone by default; explain the reason and impact and confirm scope if they must change.

If you can access the file, inspect existing edits, preserve the original content or a backup, and show the minimal diff. Otherwise provide a correctly indented field patch, its actual location, and user steps. Do not expose secrets; use the model ID, endpoint, and configuration path only to locate the target.

# Validate in separate stages

1. Use the current DSH configuration validation or diagnostics to check parsing and inspect errors for the target model/provider. A catalog failure does not establish that a particular compat field is wrong.
2. Reload the target configuration in the Host and refresh the menu; confirm that directory levels match the declaration. Identify the instance and profile if a restart is needed. A visible slider validates metadata only, not parameter delivery or an effective strength change.
3. When the user permits actual requests, make minimal tests of each level's outgoing parameters and endpoint response, including off behaviour and history replay where needed. Do not infer strength from one response's length or claim unexecuted tests passed.
4. Deliver the evidence and sources, level mapping and alias meanings, diff, completed validation, unverified items, and next steps. If the existing configuration is correct, say no change is needed. If independent effort control is unsupported, explain the actual limitation.
