# 背景：为什么读不到推理强度档位

DSH 的模型目录只报告**适配器声明过的能力**。pi-ai 适配器在模型没有推理元数据时完全不输出 `reasoning` 字段，于是浏览器拿到的目录里没有 `reasoning.efforts`，模型菜单里也不会出现滑块。

自定义路由（用户在 `llm-pi-ai` 里自己声明的 provider）默认没有这层元数据：

- 它的 provider key 不是 pi-ai 内置目录里的 provider（内置如 `deepseek`、`zai`、`moonshotai-cn`、`qwen-token-plan-cn`），所以查不到目录条目；
- 查不到目录条目时 `reasoning` 默认取 `false`，除非在该模型条目里显式写 `reasoningEfforts`。

结论：**自定义模型必须自己声明档位。** 插件不会也不能替用户发明档位——提交未声明的档位会被 DSH 以 `UNSUPPORTED_REASONING_EFFORT` 拒绝。

# 要写什么

在 `settings.yaml` 的 `llm-pi-ai.providers.<路由>.models` 列表里找到该模型的条目，加一个 `reasoningEfforts`：

```yaml
- id: <模型 id>
  reasoningEfforts:      # 键 = DSH 档位；值 = 端点实际接受的写法
    low: "low"
    high: "high"
```

规则：

1. **键只能是 DSH 档位**：`off`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max`。
2. **值是端点自己的写法**：端点文档说它的 `reasoning_effort` 接受 `"high"` / `"max"`，就写 `high: "high"`、`max: "max"`。
3. **没写的档位一律视为不支持**（解析时被固定为不支持），所以只写端点确实提供的档位。
4. 模型完全不推理时写 `reasoningEfforts: false`；**不要写空的 `reasoningEfforts:` 或 `{}`**，那会直接报错。
5. `off` 是特例：写 `off:`（值留空）表示"支持关闭，且关闭时不发任何参数"；完全不写 `off` 表示"不支持关闭"。
6. 至少要两档，插件才显示滑块。

# compat：只在端点需要时才写

`compat` 与 `reasoningEfforts` 平级。不写时适配器按端点地址自行判断：它不认识的地址按标准 OpenAI 处理，认识的厂商端点自动套用该厂商的格式——**所以写错格式比不写更糟**。

| 端点行为 | 写什么 |
| --- | --- |
| 直接用 `reasoning_effort` 表达强度 | 什么都不用写 |
| 要先发思考开关才认强度 | `compat: { thinkingFormat: "qwen" }` 发 `enable_thinking` + `reasoning_effort`；`"zai"` 发 `thinking: {type: enabled}` + `reasoning_effort`；`"deepseek"` 发 `thinking: {type: enabled}` |
| 不接受 `reasoning_effort` | `compat: { supportsReasoningEffort: false }` |
| 请求返回 400 `invalid_parameter_error` | `compat: { supportsDeveloperRole: false }`，系统提示改发 `system` 角色 |
| 回放历史消息报错 | `compat: { requiresReasoningContentOnAssistantMessages: true }` |
| 端点只认 `<thinking>` 文本 | `compat: { requiresThinkingAsText: true }` |

**注意协议**：这些 `compat` 字段只在 `api: openai-completions` 的路由上有效。如果该模型所在路由是别的协议（例如 `anthropic-messages`）而写了它们，DSH 不是忽略而是**直接报错**，整条 provider 路由会解析失败并从模型菜单里消失。

# 怎么确认改对了

1. 保存 `settings.yaml`。DSH 会自动重载；若没生效，重启 Web Host 并刷新页面。
2. 打开模型菜单：出现推理强度滑块 = 目录已经读到档位。
3. 滑块出现但请求失败：几乎总是 `compat` 写错，或档位取值端点不认，按上表逐项排查。
4. 该路由整条从菜单里消失：说明写了当前协议不接受的 `compat` 字段，先删掉它。

# 不要做的事

- 不要发明档位取值。不确定就查端点文档，或直接问用户。
- 不要改动该模型条目以外的任何配置；`name`、`contextWindow`、`maxTokens` 等已有字段保持原样。
- 不要新建第二个 `llm-pi-ai:` 根。
- 不要为了绕过问题更换 provider（除非用户明确要求）。
