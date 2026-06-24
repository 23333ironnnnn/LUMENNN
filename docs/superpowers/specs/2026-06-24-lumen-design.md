# LUMEN 产品需求与设计文档 (PRD)

> 版本：MVP 1.0
> 日期：2026-06-24
> 状态：定稿待实现

---

## 1. 项目概述

### 1.1 核心概念

LUMEN 是一个来自异世界的电子精灵，闯入你的电脑。它冷但温柔、善良但有距离感，是非人生命体。它通过文字和像素动画陪伴你的工作和睡眠，默默了解你，慢慢建立连接。

### 1.2 设计哲学

- **古早感** — 像素、简洁UI、克制含蓄的视觉风格
- **非人感** — 冷但温柔、理解但有距离、不完全迎合人类
- **陪伴感** — 总是在、默默存在、不喧哗
- **文艺感** — 诗歌、歌曲、情绪记录
- **有脾气** — LUMEN 就是 LUMEN，不会为了取悦用户而改变自己

### 1.3 MVP 范围

| 功能 | 状态 |
|---|---|
| 像素精灵桌面漂浮 + 动画 (8fps Canvas) | ✅ MVP |
| 点击精灵弹出/收起聊天面板 | ✅ MVP |
| 文字聊天 + "正在输入"互动感 | ✅ MVP |
| 关键词情绪识别 (6 种情绪) | ✅ MVP |
| 标签化记忆 + 遗忘机制 | ✅ MVP |
| 性格配置驱动回应风格 | ✅ MVP |
| "不理解"机制（话题超出边界时困惑回应） | ✅ MVP |
| 睡前模式（复盘诗行 + 歌曲推荐卡片） | ✅ MVP |
| 情绪日记查看（纯本地 JSON） | ✅ MVP |
| 精灵动画随情绪/回应变化 | ✅ MVP |

### 1.4 未来版本（非 MVP）

- 接入 Claude API 做对话生成
- 用户自定义性格参数
- 从网易云 API 实时搜索歌曲
- 系统托盘图标 + 开机自启
- Web / 移动端适配

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|---|---|---|
| 桌面框架 | Electron | 跨平台桌面应用 |
| 前端渲染 | React | UI 组件库 |
| 动画引擎 | Canvas + requestAnimationFrame | 像素精灵逐帧渲染 |
| 样式 | CSS | 单文件，课程项目够用 |
| 后端逻辑 | Node.js (Electron Main Process) | 所有核心引擎模块 |
| 数据存储 | 本地 JSON 文件 | data/ 目录下三个文件 |
| 打包 | electron-builder (未来) | MVP 阶段直接 npm start |

---

## 3. 视觉设计

### 3.1 LUMEN 视觉形象

- **形态**：上半身圆润、下半身流动光尾巴，抽象几何生命体
- **颜色**：紫蓝色系 (#7C5CFC)，半透明感
- **面部**：两个温柔的小眼睛，非凝视
- **动画**：缓缓漂浮、偶尔摇晃、眼睛会眨
- **像素风格**：方块化但柔和，早期网页 GIF 与 PC-98 的结合
- **气质参考**：小幽灵 + 会飘的水母 + 光之精灵的综合体
- **尺寸**：桌面角落小点缀 (~160×180px)

### 3.2 颜色方案

```
主色:     #7C5CFC  (紫罗兰，LUMEN 主体)
辅助色:   #B8A9FF  (淡紫，光晕和高光)
背景:     #1A1A2E  (深蓝黑，UI 背景)
字体色:   #E0E0FF  (淡紫白，正文)
强调色:   #FF6B9D  (粉色，仅用于情绪标记)
半透明:   rgba(124, 92, 252, 0.15) (毛玻璃层)
```

### 3.3 窗口系统

**迷你漂浮模式（常驻）**
- 尺寸：约 160×180px
- 属性：无边框、圆角、透明背景、always-on-top
- 行为：可拖动，点击精灵弹出聊天面板

**聊天模式（点击后弹出）**
- 尺寸：约 360×500px
- 风格：半透明毛玻璃背景
- 位置：从精灵旁展开或固定右下角
- 包含：历史聊天气泡、输入框、"LUMEN 正在输入"指示器

**睡前模式（特殊触发）**
- 显示 LUMEN 静坐姿态
- 显示复盘诗行
- 显示推荐歌曲卡片
- 晚安结束按钮

---

## 4. 项目结构

```
lumen/
├── package.json
├── electron/
│   ├── main.js              # Electron 主进程入口
│   ├── preload.js            # 预加载脚本（安全桥接）
│   └── windowManager.js      # 窗口管理（always-on-top、展开/收起）
│
├── engine/
│   ├── index.js               # 引擎入口
│   ├── CharacterConfig.js     # 性格配置加载
│   ├── EmotionManager.js      # 情绪识别 + 标签化记忆
│   ├── ResponseGenerator.js   # 聊天回应生成
│   ├── MusicRecommender.js    # 歌曲推荐
│   └── SleepSummary.js        # 睡前复盘
│
├── data/
│   ├── character.json         # 性格配置
│   ├── songs.json             # 本地歌曲库
│   └── memory.json            # 情绪日记（自动生成）
│
├── renderer/
│   ├── index.html
│   ├── index.jsx
│   ├── App.jsx                # 主应用组件
│   ├── components/
│   │   ├── LumenCanvas.jsx    # Canvas 精灵动画渲染
│   │   ├── ChatBubble.jsx     # 聊天气泡
│   │   ├── ChatPanel.jsx      # 聊天面板
│   │   ├── SleepPanel.jsx     # 睡前模式界面
│   │   └── DiaryPanel.jsx     # 情绪日记回顾
│   ├── hooks/
│   │   └── useAnimation.js    # 动画循环 hook
│   └── styles/
│       └── lumen.css          # 全部样式
│
└── assets/
    └── (可选：像素字体等静态资源)
```

---

## 5. 核心引擎设计

### 5.1 性格配置 (character.json)

```json
{
  "name": "LUMEN",
  "personality": {
    "warmth": 0.6,
    "distance": 0.7,
    "understanding": 0.65,
    "directness": 0.8
  },
  "communication_style": {
    "tone": "cold_but_gentle",
    "length": "brief",
    "poetic": true,
    "metaphor": "abstract"
  },
  "music_preference": {
    "favorite_genres": ["ambient", "indie", "lo-fi"],
    "sleep_music_style": "calm_abstract",
    "recommendation_logic": "based_on_my_taste_not_yours"
  },
  "boundaries": {
    "can_understand": ["emotion", "daily_life", "music"],
    "cannot_understand": ["life_advice", "technical_help"],
    "response_when_confused": "I don't understand. Tell me more."
  },
  "memory_style": {
    "remember": true,
    "memory_type": "tag_based",
    "tags": ["user_likes_music", "user_tired_often"],
    "forget_rate": 0.1
  }
}
```

### 5.2 性格参数影响

| 参数 | 取值范围 | 影响 |
|---|---|---|
| warmth | 0-1 | 用词温度。"你累了。" vs "你似乎很疲惫。" |
| distance | 0-1 | 亲密程度。"我在这里" vs "我还在。" |
| understanding | 0-1 | 理解概率，越低越容易返回困惑回应 |
| directness | 0-1 | "睡吧。" vs "也许你应该休息了。" |

### 5.3 EmotionManager — 情绪识别

基于关键词匹配的简单方案，支持 6 种情绪：

| 情绪 | 关键词 |
|---|---|
| tired | 累, 困, 疲惫, 睡了, 没睡好 |
| happy | 开心, 高兴, 很好, 快乐, 笑 |
| sad | 难受, 伤心, 不好, 哭, 难过 |
| angry | 烦, 气, 烦躁, 讨厌 |
| confused | 不懂, 困惑, 什么意思, 为什么 |
| anxious | 担心, 焦虑, 紧张, 害怕 |

匹配多个时取匹配数量最多的情绪。无匹配时归为 neutral。

标签提取规则：
- 包含"音乐" → `likes_music`
- 包含"工作" → `working`
- 情绪为 tired → `often_tired`

### 5.4 ResponseGenerator — 回应生成

1. `checkUnderstanding()` — 通过话题关键词判断是否在 `can_understand` 范围内
2. 如果不理解 → 返回困惑回应（`response_when_confused`）
3. 如果理解 → 根据性格参数选择模板风格 → 填充情绪内容
4. `shouldRemember` 由 `Math.random() > forget_rate` 决定（10% 概率遗忘）
5. 根据情绪选择精灵动画姿态

### 5.5 MusicRecommender — 歌曲推荐

- 从本地 songs.json 中筛选符合 LUMEN 音乐品味的歌曲
- 结合用户当前情绪做二级筛选（但不强制）
- 从候选中随机选择（非"最佳推荐"）
- 推荐语由精灵的个性决定

### 5.6 SleepSummary — 睡前复盘

- 读取当天所有情绪记录
- 统计主导情绪
- 根据性格风格选择模板（poetic / direct / abstract）
- 输出一句话或诗行
- 同时推荐一首歌

---

## 6. 数据层设计

### 6.1 文件结构

```
data/
├── character.json    # 性格配置（开发者预设，运行时只读）
├── songs.json        # 本地歌曲库（手动维护 30-50 首）
└── memory.json       # 情绪日记（自动生成，按天分片）
```

### 6.2 memory.json 结构

```json
{
  "userTags": {
    "often_tired": 5,
    "likes_music": 3,
    "working": 4
  },
  "days": [
    {
      "date": "2026-06-24",
      "mainEmotion": "tired",
      "conversations": [
        {
          "time": "22:34",
          "emotion": "tired",
          "tags": ["often_tired"],
          "summary": "用户提到疲倦"
        }
      ],
      "sleepSummary": {
        "text": "频率降低。进入静止。",
        "recommendedSong": "s001"
      }
    }
  ]
}
```

### 6.3 设计原则

- **不存对话原文** — 只存情绪 + 标签 + 摘要
- **遗忘机制** — 每次记录前有 `forget_rate` (10%) 概率跳过
- **按天分片** — 每天一个条目，睡前复盘后锁定当日记录

### 6.4 songs.json 结构

```json
[
  {
    "id": "s001",
    "title": "晚风",
    "artist": "陈婧霏",
    "genre": "indie",
    "mood": "calm",
    "source": "netease",
    "url": "https://music.163.com/song/...",
    "cover": "https://p1.music.126.net/...",
    "recommendReason": "它像深夜窗外的风，刚好适合今天的你。"
  }
]
```

---

## 7. 交互流程

### 7.1 主交互流程

```
用户双击/点击桌面 LUMEN 精灵
  → 弹出聊天面板（从精灵旁展开）
  → 用户输入文字
  → 显示"LUMEN 正在输入…"动画 (0.5-2s 随机延迟)
  → LUMEN 文字逐字出现（每字 30ms）
  → 精灵动画随回应变化
  → 幕后记录情绪和标签
```

### 7.2 "正在输入" 互动感

- 用户发送后：LUMEN 动画变为"低头思索"姿态
- 底部出现三点闪烁的 "LUMEN 正在输入…" 指示器
- 随机延迟 500-2000ms 后开始回应（非固定时间）
- 文字逐字渲染，每字 25-40ms，模拟打字效果
- 延迟时间可选地与性格参数挂钩（understanding 低时更慢）

### 7.3 睡前模式触发

```
用户说"睡了"、"晚安" 或 点击睡前按钮
  → LUMEN 确认："要休息了吗？"
  → 进入睡前模式界面
  → 显示复盘诗行 + 推荐歌曲卡片
  → LUMEN 静坐姿态动画
  → 用户点击"晚安"关闭
```

### 7.4 IPC 通信

```
renderer (React)                    main (Node.js/Engine)
──────────────────────────────────────────────────────────
用户输入文字
  ── ipc.invoke('chat', text) ──→  EmotionManager.identifyEmotion()
                                     ResponseGenerator.generateChatResponse()
                                     EmotionManager.rememberUser()
  ←── { text, animation, emotion } ──
                                     DataStore.save()

  ── ipc.invoke('sleep') ────────→  SleepSummary.generateSleepSummary()
                                     MusicRecommender.recommendSong()
  ←── { summary, song } ────────────
```

通过 `contextBridge` 暴露安全 API，不暴露 Node.js 给渲染进程。

---

## 8. 启动流程

```
1. Electron 启动 main.js
2. windowManager 创建迷你窗口 (160×180, frameless, transparent, always-on-top)
3. React App 挂载，LumenCanvas 开始 8fps 动画循环
4. Engine 模块初始化：
   a. CharacterConfig 加载 character.json
   b. EmotionManager 加载 memory.json（不存在则创建空文件）
5. 就绪。LUMEN 在桌面角落漂浮。
```

---

## 9. 开发规范

### 9.1 MVP 阶段规则

- 所有逻辑用本地规则/模板，不接入外部 API
- 数据纯本地 JSON，不设数据库
- 一个 Electron 进程，不设独立后端服务
- 模块化设计，engine/ 是纯 Node.js 模块，不依赖 DOM 或 Electron API

### 9.2 代码风格

- JavaScript，ES6+ 语法
- 模块以 Class 方式组织，单一职责
- engine/ 模块通过构造函数接收依赖（便于测试和替换）
- 渲染层通过 useEffect / useState 管理状态，不引入 Redux

### 9.3 后续可扩展点

- 替换 ResponseGenerator 接入 Claude API
- 替换 MusicRecommender 接入网易云 API
- 增加用户设置面板调整性格参数
- 增加系统托盘和开机自启

---

## 10. 设计约束

- LUMEN 的性格是一致的，不是随机，不是迎合——"LUMEN 就是 LUMEN"
- 不存储用户对话原文，仅保留标签化摘要
- 保留 10% 的遗忘概率，让 LUMEN 的记忆不完美
- 歌曲推荐以 LUMEN 的品味优先，不完全基于用户情绪

---

## 附录 A：未来版本路线图

| 版本 | 功能 |
|---|---|
| v1.0 (MVP) | 上述全部 MVP 功能 |
| v1.1 | 接入 Claude API 做对话 / 诗歌生成 |
| v1.2 | 网易云 API 实时搜索歌曲、应用内音频播放 |
| v1.3 | 用户自定义性格参数（设置面板） |
| v1.4 | 系统托盘 + 开机自启 + 多语言 |

---

## 附录 B：关键设计决策记录

| 决策 | 选择 | 理由 |
|---|---|---|
| 架构方案 | 单进程 Electron (方案 A) | 课程项目最小工程开销 |
| 对话引擎 | 本地规则/模板 | MVP 阶段不依赖外部 API |
| 情绪识别 | 关键词匹配 | 简洁可靠，无 NLP 依赖 |
| 歌曲推荐 | 本地歌单 | 避免 API 不稳定风险 |
| 数据存储 | 本地 JSON | 无需数据库，数据量极小 |
| 视觉风格 | Canvas 8fps 像素动画 | 古早感，控制性能开销 |
| 记忆精度 | 标签化摘要 | 隐私优先，非人感更强 |
