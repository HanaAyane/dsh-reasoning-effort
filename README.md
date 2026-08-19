<div align="center">

<img src="assets/readme/hero.webp" alt="dsh-reasoning-effort 为 DeepSeek Harness 提供 Codex 风格的模型与推理强度滑块" width="1200">

# dsh-reasoning-effort

**把 Codex 风格的“模型 + 推理强度”滑块控件与 8 大主流大模型 Q 版奔跑小人主题带进 DeepSeek Harness。**

[English](README.en.md) · [项目源码 (GitHub)](https://github.com/xihucuyudaichi/dsh-reasoning-effort) · [原作者项目致谢](https://github.com/HanaAyane/dsh-reasoning-effort) · [反馈问题](https://github.com/xihucuyudaichi/dsh-reasoning-effort/issues)

[![main](https://img.shields.io/badge/branch-main-6f83ff?style=flat-square)](https://github.com/xihucuyudaichi/dsh-reasoning-effort/tree/main)
[![DSH 0.1.0-rc.6](https://img.shields.io/badge/DSH-0.1.0--rc.6-8b5cf6?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
[![MIT License](https://img.shields.io/badge/license-MIT-536990?style=flat-square)](LICENSE)

</div>

---

## 🌟 项目来源与致谢声明 (Attribution)

本项目基于原作者 [HanaAyane/dsh-reasoning-effort](https://github.com/HanaAyane/dsh-reasoning-effort) 进行深度二次开发与扩展。

在原作者优雅的 Cordis 插件架构、连续跟手推理强度滑块、自定义 Provider 档位声明与额度监控系统的坚实基础上，本项目新增并完善了：
1. **8 大主流大模型家族专属 Q 版奔跑小人**：采用全通道 2D 连通域低谷分割与测地线独立隔离算法重绘，做到 8 帧逐帧 100% 纯净无残影、无毛边、居中防抖。
2. **8 大模型专属双模主题色彩与 Canvas 能量辐射波**：为每一个模型品牌定制深色/浅色轨道渐变、能量柱光波、径向热斑、专属流星粒子拖尾与满档呼吸特效。
3. **模型优先的智能品牌探测引擎（`detectModelTheme`）**：模型 ID / 显示名称第一优先级匹配，无缝支持第三方聚合转发、中转平台（OpenRouter、OneAPI、NewAPI、AWS Bedrock 等）及本地自建模型。

---

## 🎭 8 大模型家族专属形象与主题矩阵

插件会根据当前会话所选模型，**毫秒级自动切换**对应的 Q 版奔跑小人形象与滑块轨道能量光效：

| 模型家族 | 主题 Key | Q 版奔跑小人形象 | 深色模式轨道 (Dark) | 浅色模式轨道 (Light) | 专属粒子与光晕特效 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DeepSeek** | `deepseek` | 蓝发女仆（经典大肥鱼） | 经典科技深蓝 (`#03040a` → `#5d35a0`) | 晴空冰蓝底 + 科技蓝进度 | 经典科技蓝能量波与流星 |
| **OpenAI / GPT** | `openai` | 白发龙娘小人 | Codex 霓虹深紫 (`#090412` → `#6b21a8`) | 丁香柔紫底 + 霓虹紫进度 | 霓虹紫罗兰星芒粒子 |
| **Claude** | `claude` | 橙发花饰少女 | Anthropic 陶土暗橙 (`#120803` → `#c2410c`) | 暖杏浅橙底 + 陶土橙进度 | 陶土金辉与暖橙光环 |
| **Gemini** | `gemini` | 星芒紫发猫耳少女 | Google 官方四色星芒全光谱渐变 (`#120902` → `#84184c`) | 丁香冷紫底 + 四色星轨填充 | 金/绿/蓝/紫/红五色星芒粒子 |
| **Kimi** | `kimi` | 银白发月相女仆少女 | 星空午夜深蓝 (`#090c1e` → `#4359b8`) | 月光水晶蓝底 + 星空深蓝填充 | 午夜蓝光柱 + 金色星辰流星 |
| **GLM / 智谱** | `glm` | 黑发眼罩（Z标）女仆少女 | 曜石暗夜黑渐变 (`#05070c` → `#223f66`) | 冰川冷青白底 + 曜石青蓝填充 | 赛博青蓝能量柱 + 冷银星芒粒子 |
| **Qwen / 通义千问** | `qwen` | 空色长卷发星徽披肩少女 | 空灵天蓝晴空渐变 (`#0c1538` → `#5f9ef8`) | 晴空微曦蓝底 + 天蓝金辉填充 | 空灵天蓝能量柱 + 金色星辉粒子 |
| **MiniMax / 海螺** | `minimax` | 暖橙粉发贝雷帽信使少女 | 鲜艳珊瑚橙红渐变 (`#24090b` → `#ff6f43`) | 暖桃杏粉底 + 鲜亮落日橙红填充 | 珊瑚橙红流光 + 霓虹夕照霞光 |

---

## ⚡ 智能模型优先匹配机制 (`detectModelTheme`)

为了在复杂的自定义模型与第三方聚合分发场景下依然能 100% 准确识别模型品牌，插件严格遵循：
- **模型 ID / 显示名称第一优先级（Model ID / Display Name）**：
  只要模型 ID 或名称包含 `gpt`, `o1`, `o3`, `deepseek`, `claude`, `gemini`, `kimi`, `glm`, `qwen`, `minimax` 等关键词，就会直接绑定到对应品牌主题，**完全不受反向代理服务商名称修改的影响**。
- **供应商 Provider 第二优先级兜底**：当模型名称为通用化自定义命名（如 `chat` / `default`）时，自动回退检查供应商标识。
- **全局安全兜底**：若全未匹配，以 DeepSeek 经典蓝发女仆主题兜底呈现，确保永不报错白屏。

---

## 🚀 安装与使用

### 方式一：让 Agent 一键安装（推荐）

把下面这段指令发送给你的 DeepSeek Harness 任意 Agent：

```text
请为 DeepSeek Harness 的 web Profile 安装 dsh-reasoning-effort 插件。

只执行下面两条命令，不要修改其他 Profile：
dsh plugin --profile web add github:xihucuyudaichi/dsh-reasoning-effort#main
dsh --profile web --dump-config

确认输出中出现 dsh-reasoning-effort 后告诉我安装结果。
安装完成后提醒我手动重启 DSH Web Host。
```

### 方式二：终端命令行安装

打开 PowerShell / Terminal 执行：

```powershell
dsh plugin --profile web add github:xihucuyudaichi/dsh-reasoning-effort#main
dsh --profile web --dump-config
```

### 方式三：离线解压 / 局域网 / 好友分享迁移（免编译即插即用）

所有 8 款小人精灵图均已通过 Base64 内嵌编译打包在 `lib/client/index.js` 中，无需任何编译环境。

1. 解压插件文件夹至本地（例如 `~/.dsh/plugins/dsh-reasoning-effort`）；
2. 在 `~/.dsh/profiles/web/package.json` 中配置挂载：
   ```json
   {
     "name": "dsh-profile-web",
     "private": true,
     "dependencies": {
       "dsh-reasoning-effort": "link:C:\\Users\\<你的用户名>\\.dsh\\plugins\\dsh-reasoning-effort"
     },
     "dsh": {
       "profile": {
         "bundles": [
           "@deepseek-ai/dsh-base",
           "@deepseek-ai/dsh-web-app",
           "dsh-reasoning-effort"
         ]
       }
     }
   }
   ```
3. 重启 `dsh web` 并在浏览器刷新即可！

---

## 🎮 交互特性与设置

1. **跟手拖拽与档位吸附**：滑块支持连续指针拖拽，松手后自动吸附到当前模型支持的有效推理强度档位。
2. **拖动加速动画**：拖拽滑块时，8 帧奔跑小人会自动由悠闲跑切换为疾速冲刺跑；系统开启“减少动态效果”时自动停留于稳定静止帧。
3. **设置面板独立开关**：进入 **设置 → 通用设置**，可单独开启/关闭 **推理强度滑块** 总开关或 **Q版奔跑小人** 开关（关掉后恢复纯白圆形旋钮）。
4. **单向能量波限制**：所有能量辐射、冲击波、光斑粒子均向滑块左侧（已激活区域）发射，不会越过右侧旋钮。

---

## 📊 多模型额度系统集成 (Quota Integration)

本插件原生集成了反代上游服务（Codex、Google Anti-Gravity / CLIProxyAPI、ClinePass）的实时额度拉取与可视化徽标：
- **Codex 官方额度**：在厂商分组标题处显示全局剩余百分比及重置时间徽标（支持低于 30% `.warn` / 低于 10% `.danger` 告警色）。
- **Google Anti-Gravity (CLIProxyAPI)**：在 Gemini、Claude、GPT 等子模型右侧显示 5 小时高优先级额度及多账号负载均衡可用数 `5h: XX% (X/X可用)`。
- **ClinePass**：展示三周期全局额度徽标 `5h: XX% · 周: XX% · 月: XX%`。

---

## 🛠️ 开发者与构建指引

```powershell
# 1. 安装依赖
pnpm install

# 2. 编译 Host 端与 Client 端 Bundle（含 Base64 精灵图自动内嵌）
pnpm run build

# 3. 校验检查
pnpm run check
```

- **开发规范文档**：详见 [THEME_GUIDE.md](THEME_GUIDE.md)（包含新增模型主题的标准 5 步 SOP、2D 连通域低谷分割与防残影指南）。
- **项目交接与上下文**：详见 [CONTEXT_HANDOVER.md](CONTEXT_HANDOVER.md)。

---

## 📄 许可证

[MIT License](LICENSE)

- **本项目维护者**：xihucuyudaichi
- **上游原项目**：[HanaAyane/dsh-reasoning-effort](https://github.com/HanaAyane/dsh-reasoning-effort)
