/** Locale dictionaries for the reasoning-effort model control and settings rows. */

/** Namespace registered with DSH's client locale service. */
export const NS = 'reasoning-effort'

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'level.off': '关闭',
  'level.minimal': '极低',
  'level.low': '低',
  'level.medium': '中',
  'level.high': '高',
  'level.xhigh': '极高',
  'level.max': '最大',
  'level.none': '无档位',
  'effort.label': '推理强度',
  'effort.title': '推理强度 · {effort}',
  'effort.failed': '推理强度设置失败：{error}',
  'effort.unavailable': '当前模型未提供推理强度档位',
  'model.defaultEffort': '默认',
  'model.select': '选择模型',
  'model.aria': '模型 {model}，推理强度 {effort}',
  'model.menuAria': '模型与推理强度',
  'model.loading': '正在加载模型…',
  'model.none': '没有可用模型',
  'guidance.mismatch': '档位声明与知识库不一致',
  'guidance.matched': '知识库记录该模型支持 {expected}，目录当前为 {current}。{note}',
  'guidance.unmatched': '目录当前为 {current}。{note}',
  'guidance.paste': '要粘贴的内容',
  'guidance.step1.open': '1. 打开 ',
  'guidance.step1.path': '（{path}）',
  'guidance.step1.find': '，在 ',
  'guidance.step1.list': ' 列表里找到 ',
  'guidance.step1.end': '；',
  'guidance.step2.replacePrefix': '2. 把原有 ',
  'guidance.step2.replaceSuffix': ' 条目整体替换为复制的内容（不要复制出第二个 llm-pi-ai: 根）；',
  'guidance.step2.insertPrefix': '2. 该行末尾回车，粘贴上面复制的内容（缩进与 ',
  'guidance.step2.insertSuffix': ' 差 2 个空格；不要复制出第二个 llm-pi-ai: 根）；',
  'guidance.step3': '3. 保存后自动生效；滑块未出现则重启 Web Host 并刷新页面。',
  'guidance.copied': '已复制 ✓',
  'guidance.copy': '复制字段块',
  'guidance.collapse': '收起',
  'guidance.checking': '检测中…',
  'guidance.open': '查看档位声明指引',
  'knowledge.glm52': 'GLM-5.2 原生档位 minimal / low / medium / high（智谱 z.ai 深度思考文档）；阿里云百炼 OpenAI 兼容端点实测接受这些取值。',
  'knowledge.kimiK3': 'Kimi K3 官方档位 low / high / max（Moonshot 思考力度文档），与 pi-ai 目录 moonshotai 条目一致。',
  'knowledge.unknown': '知识库未收录该模型，请按端点文档填写档位取值。',
  'warning.aliyunDeveloperRole': '该端点是阿里云百炼的 OpenAI 兼容模式：DSH 会以 developer 角色发送系统提示，百炼会拒绝并返回 400（invalid_parameter_error），且 settings.yaml 目前无法覆盖该行为。建议改用内置 zai 路由（目录已自带 GLM-5.2 档位）或向 DSH 上游反馈支持 supportsDeveloperRole 配置。',
  'yaml.keyComment': '键 = DSH 档位体系（off/minimal/low/medium/high/xhigh/max）',
  'yaml.valueComment': '值 = 端点实际接受的取值，请按端点文档填写',
  'yaml.compatComment': '仅 OpenAI 兼容端点需要；端点不识别 reasoning_effort 时删除整块：',
  'settings.effort.title': '推理强度滑块',
  'settings.effort.description': '在模型菜单中显示推理强度滑块和动态辐射特效，档位随当前模型自动适配',
  'settings.effort.aria': '启用推理强度滑块',
  'settings.chibi.title': '大肥鱼滑块',
  'settings.chibi.description': '用大肥鱼替换滑块按钮',
  'settings.chibi.aria': '启用大肥鱼滑块',
  'settings.enabled': '启用',
  'settings.disabled': '停用',
} satisfies Record<string, string>

/** Locale key union for the plugin namespace. */
export type ReasoningEffortLocaleKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'level.off': 'Off',
  'level.minimal': 'Minimal',
  'level.low': 'Low',
  'level.medium': 'Medium',
  'level.high': 'High',
  'level.xhigh': 'Very High',
  'level.max': 'Max',
  'level.none': 'No levels',
  'effort.label': 'Reasoning effort',
  'effort.title': 'Reasoning effort · {effort}',
  'effort.failed': 'Failed to set reasoning effort: {error}',
  'effort.unavailable': 'The current model does not provide reasoning-effort levels',
  'model.defaultEffort': 'Default',
  'model.select': 'Select model',
  'model.aria': 'Model {model}, reasoning effort {effort}',
  'model.menuAria': 'Model and reasoning effort',
  'model.loading': 'Loading models…',
  'model.none': 'No models available',
  'guidance.mismatch': 'Level declaration does not match the knowledge base',
  'guidance.matched': 'The knowledge base records this model as supporting {expected}, but the directory currently shows {current}. {note}',
  'guidance.unmatched': 'The directory currently shows {current}. {note}',
  'guidance.paste': 'Content to paste',
  'guidance.step1.open': '1. Open ',
  'guidance.step1.path': ' ({path})',
  'guidance.step1.find': '; in ',
  'guidance.step1.list': ', find ',
  'guidance.step1.end': '.',
  'guidance.step2.replacePrefix': '2. Replace the existing ',
  'guidance.step2.replaceSuffix': ' entry with the copied content (do not create a second llm-pi-ai: root).',
  'guidance.step2.insertPrefix': '2. Press Enter at the end of that line and paste the copied content (indent the pasted block 2 spaces beyond ',
  'guidance.step2.insertSuffix': '; do not create a second llm-pi-ai: root).',
  'guidance.step3': '3. Takes effect automatically after saving; if the slider does not appear, restart the Web Host and refresh the page.',
  'guidance.copied': 'Copied ✓',
  'guidance.copy': 'Copy field block',
  'guidance.collapse': 'Collapse',
  'guidance.checking': 'Checking…',
  'guidance.open': 'View level declaration guidance',
  'knowledge.glm52': 'GLM-5.2 native levels minimal / low / medium / high (Zhipu z.ai deep-thinking docs); the Aliyun Bailian OpenAI-compatible endpoint accepts these values in practice.',
  'knowledge.kimiK3': 'Kimi K3 official levels low / high / max (Moonshot thinking-effort docs), consistent with the pi-ai catalog moonshotai entry.',
  'knowledge.unknown': 'This model is not in the knowledge base; fill in the level values from the endpoint documentation.',
  'warning.aliyunDeveloperRole': 'This endpoint uses Aliyun Bailian in OpenAI-compatible mode: DSH sends the system prompt with the developer role, which Bailian rejects with a 400 (invalid_parameter_error), and settings.yaml cannot currently override this behavior. Use the built-in zai route instead (the catalog already includes GLM-5.2 levels), or ask DSH upstream to support a supportsDeveloperRole setting.',
  'yaml.keyComment': 'key = DSH level system (off/minimal/low/medium/high/xhigh/max)',
  'yaml.valueComment': 'value = the value accepted by the endpoint; follow its documentation',
  'yaml.compatComment': 'Only needed for OpenAI-compatible endpoints; remove the block if the endpoint does not recognize reasoning_effort:',
  'settings.effort.title': 'Reasoning effort slider',
  'settings.effort.description': 'Show the reasoning-effort slider and dynamic radiation effect in the model menu; levels adapt to the current model automatically',
  'settings.effort.aria': 'Enable reasoning effort slider',
  'settings.chibi.title': 'Big Fat Fish slider',
  'settings.chibi.description': 'Replace the slider thumb with the Big Fat Fish',
  'settings.chibi.aria': 'Enable Big Fat Fish slider',
  'settings.enabled': 'Enabled',
  'settings.disabled': 'Disabled',
} satisfies Record<ReasoningEffortLocaleKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'reasoning-effort': ReasoningEffortLocaleKey
  }
}

/** Translate function injected into components registered with this namespace. */
export type ReasoningEffortTranslate =
  import('@deepseek-ai/dsh-client-ui-slots').TranslateNS<typeof NS>
