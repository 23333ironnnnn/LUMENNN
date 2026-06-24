# LUMEN MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Electron + React desktop pet — LUMEN, a pixel-art electronic spirit that chats with you, recognizes your emotions, remembers your mood history, and offers bedtime summaries with song recommendations.

**Architecture:** Single Electron process. Core engine modules in `engine/` (pure Node.js, no DOM/Electron dependency) handle emotion recognition, response generation (personality-driven templates), song recommendation, and sleep summaries. React renderer in `renderer/` handles pixel sprite animation (Canvas 8fps), chat UI, and sleep/diary panels. Engine ↔ Renderer communication via Electron IPC with `contextBridge`.

**Tech Stack:** Electron, React (JSX), esbuild (bundler), Canvas API, Node.js (engine), local JSON (storage)

## Global Constraints

- No external API calls — all logic is local rules/templates
- No database — data stored as local JSON files in `data/`
- Single Electron process — no separate backend server
- Engine modules are pure Node.js — no DOM or Electron API dependency
- Chinese language UI (LUMEN speaks Chinese)
- LUMEN has personality — responses are NOT always helpful, sometimes confused, sometimes distant
- 10% forget rate — sometimes LUMEN doesn't remember
- Never store user's original conversation text — only tags and emotion labels

---

## File Map

All files to be created:

```
lumen/
├── package.json
├── electron/
│   ├── main.js                  # Electron entry point
│   └── preload.js                # contextBridge IPC API
├── engine/
│   ├── index.js                  # Wires all modules + IPC handlers
│   ├── CharacterConfig.js        # Load character.json
│   ├── EmotionManager.js         # Emotion recognition + memory
│   ├── ResponseGenerator.js      # Template-based chat responses
│   ├── MusicRecommender.js       # Song recommendation
│   └── SleepSummary.js           # Bedtime review generation
├── data/
│   ├── character.json            # Personality config
│   ├── songs.json                # Song library (30-50 songs)
│   └── memory.json               # Auto-generated emotion diary
├── renderer/
│   ├── index.html
│   ├── index.jsx
│   ├── App.jsx                   # Root component
│   ├── components/
│   │   ├── LumenCanvas.jsx       # Pixel sprite canvas
│   │   ├── ChatBubble.jsx        # Message bubble
│   │   ├── ChatPanel.jsx         # Chat panel (input + history)
│   │   ├── SleepPanel.jsx        # Bedtime mode UI
│   │   └── DiaryPanel.jsx        # Emotion diary viewer
│   ├── hooks/
│   │   └── useAnimation.js       # Animation loop hook
│   └── styles/
│       └── lumen.css
```

---

### Task 1: Project Scaffold — Electron + React + esbuild

**Files:**
- Create: `package.json`
- Create: `electron/main.js`
- Create: `electron/preload.js`
- Create: `renderer/index.html`

**Interfaces:**
- Produces: Electron main process that opens a frameless transparent window
- Produces: `preload.js` with `contextBridge.exposeInMainWorld('lumenAPI', ...)`
- Produces: `renderer/index.html` that loads bundled React output

- [ ] **Step 1: Create package.json**

```json
{
  "name": "lumen",
  "version": "1.0.0",
  "description": "A pixel-art electronic spirit desktop companion",
  "main": "electron/main.js",
  "scripts": {
    "build": "esbuild renderer/index.jsx --bundle --outfile=renderer/out.js --jsx=automatic",
    "start": "npm run build && electron .",
    "dev": "esbuild renderer/index.jsx --bundle --outfile=renderer/out.js --jsx=automatic --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "esbuild": "^0.21.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create electron/main.js**

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep reference to prevent GC
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 160,
    height: 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.setPosition(
    require('electron').screen.getPrimaryDisplay().workAreaSize.width - 200,
    require('electron').screen.getPrimaryDisplay().workAreaSize.height - 220
  );
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
```

- [ ] **Step 4: Create electron/preload.js**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumenAPI', {
  chat: (text) => ipcRenderer.invoke('chat', text),
  sleep: () => ipcRenderer.invoke('sleep'),
  getDiary: () => ipcRenderer.invoke('get-diary'),
  getEngineStatus: () => ipcRenderer.invoke('get-engine-status'),
});
```

- [ ] **Step 5: Create renderer/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LUMEN</title>
  <link rel="stylesheet" href="styles/lumen.css">
</head>
<body>
  <div id="root"></div>
  <script src="out.js"></script>
</body>
</html>
```

- [ ] **Step 6: Create placeholder renderer/index.jsx and test**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return React.createElement('div', { style: { color: '#E0E0FF', padding: '20px' } }, '✨ LUMEN');
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

- [ ] **Step 7: Build and test**

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
npx esbuild renderer/index.jsx --bundle --outfile=renderer/out.js --jsx=automatic
npx electron .
```

Expected: A small transparent window appears showing "✨ LUMEN" in lavender text.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: project scaffold - Electron + React + esbuild"
git push
```

---

### Task 2: Data Files + CharacterConfig

**Files:**
- Create: `data/character.json`
- Create: `data/songs.json`
- Create: `data/memory.json`
- Create: `engine/CharacterConfig.js`

**Interfaces:**
- Consumes: `data/character.json` (file on disk)
- Produces: `CharacterConfig` class with methods:
  - `constructor(dataDir)` — accepts path to data directory
  - `load()` — reads and parses character.json, returns self
  - `get()` — returns full character object
  - `getPersonality()` → `{ warmth, distance, understanding, directness }`
  - `getBoundaries()` → `{ can_understand, cannot_understand, response_when_confused }`
  - `getMusicPreference()` → `{ favorite_genres, ... }`
  - `getMemoryStyle()` → `{ forget_rate }`

- [ ] **Step 1: Create data/character.json**

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
    "response_when_confused": "我不太明白。你可以再说清楚一些吗？"
  },
  "memory_style": {
    "remember": true,
    "memory_type": "tag_based",
    "tags": ["user_likes_music", "user_tired_often"],
    "forget_rate": 0.1
  }
}
```

- [ ] **Step 2: Create data/songs.json (template — 5 songs for now)**

```json
[
  {
    "id": "s001",
    "title": "晚风",
    "artist": "陈婧霏",
    "genre": "indie",
    "mood": "calm",
    "source": "netease",
    "url": "https://music.163.com/song/",
    "cover": "",
    "recommendReason": "它像深夜窗外的风，刚好适合今天的你。"
  },
  {
    "id": "s002",
    "title": "路过人间",
    "artist": "郁可唯",
    "genre": "pop",
    "mood": "introspective",
    "source": "netease",
    "url": "https://music.163.com/song/",
    "cover": "",
    "recommendReason": "旋律里有一种温柔的疏离感。"
  },
  {
    "id": "s003",
    "title": "Lemon",
    "artist": "米津玄师",
    "genre": "indie",
    "mood": "introspective",
    "source": "netease",
    "url": "https://music.163.com/song/",
    "cover": "",
    "recommendReason": "苦涩和温暖同时存在。"
  },
  {
    "id": "s004",
    "title": "起风了",
    "artist": "买辣椒也用券",
    "genre": "pop",
    "mood": "calm",
    "source": "netease",
    "url": "https://music.163.com/song/",
    "cover": "",
    "recommendReason": "像是风在替我说一些说不出口的话。"
  },
  {
    "id": "s005",
    "title": "Flower Dance",
    "artist": "DJ OKAWARI",
    "genre": "lo-fi",
    "mood": "happy",
    "source": "netease",
    "url": "https://music.163.com/song/",
    "cover": "",
    "recommendReason": "轻快得像花瓣落在水面上。"
  }
]
```

- [ ] **Step 3: Create data/memory.json (empty template)**

```json
{
  "userTags": {},
  "days": [],
  "currentDate": ""
}
```

- [ ] **Step 4: Create engine/CharacterConfig.js**

```javascript
const fs = require('fs');
const path = require('path');

class CharacterConfig {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.character = null;
  }

  load() {
    const filePath = path.join(this.dataDir, 'character.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    this.character = JSON.parse(raw);
    return this;
  }

  get() {
    if (!this.character) this.load();
    return this.character;
  }

  getPersonality() {
    return this.get().personality;
  }

  getBoundaries() {
    return this.get().boundaries;
  }

  getMusicPreference() {
    return this.get().music_preference;
  }

  getMemoryStyle() {
    return this.get().memory_style;
  }

  getCommunicationStyle() {
    return this.get().communication_style;
  }
}

module.exports = CharacterConfig;
```

- [ ] **Step 5: Test CharacterConfig**

```javascript
// test-character-config.js
const CharacterConfig = require('./engine/CharacterConfig');
const path = require('path');

const config = new CharacterConfig(path.join(__dirname, 'data'));
config.load();

const p = config.getPersonality();
const b = config.getBoundaries();
const m = config.getMusicPreference();

console.assert(p.warmth === 0.6, 'warmth should be 0.6');
console.assert(p.distance === 0.7, 'distance should be 0.7');
console.assert(p.understanding === 0.65, 'understanding should be 0.65');
console.assert(p.directness === 0.8, 'directness should be 0.8');
console.assert(b.can_understand.includes('emotion'), 'should understand emotion');
console.assert(m.favorite_genres.includes('ambient'), 'should like ambient');
console.log('✅ CharacterConfig tests passed');
```

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
node test-character-config.js
```

Expected: "✅ CharacterConfig tests passed"

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: data files + CharacterConfig loader"
git push
```

---

### Task 3: EmotionManager — Emotion Recognition + Memory

**Files:**
- Create: `engine/EmotionManager.js`

**Interfaces:**
- Consumes: `CharacterConfig` instance, `dataDir` path
- Produces: `EmotionManager` class with:
  - `constructor(characterConfig, dataDir)`
  - `identifyEmotion(userInput)` → `string` (one of: tired/happy/sad/angry/confused/anxious/neutral)
  - `extractTags(emotion, userInput)` → `string[]`
  - `rememberUser(emotion, userInput, tags, shouldRemember)` → `void`
  - `getTodayConversations()` → `array`
  - `getUserProfile()` → `object (tag → count)`
  - `loadMemory()` → `void`
  - `saveMemory()` → `void`

- [ ] **Step 1: Create engine/EmotionManager.js**

```javascript
const fs = require('fs');
const path = require('path');

const EMOTION_KEYWORDS = {
  tired: ['累', '困', '疲惫', '睡了', '没睡好', '好累', '不想动'],
  happy: ['开心', '高兴', '很好', '快乐', '笑', '开心', '棒', '不错'],
  sad: ['难受', '伤心', '不好', '哭', '难过', '不开心', '低落'],
  angry: ['烦', '气', '烦躁', '讨厌', '生气', '受够了'],
  confused: ['不懂', '困惑', '什么意思', '为什么', '不明白', '奇怪'],
  anxious: ['担心', '焦虑', '紧张', '害怕', '不安', '慌'],
};

class EmotionManager {
  constructor(characterConfig, dataDir) {
    this.characterConfig = characterConfig;
    this.dataDir = dataDir;
    this.memory = null;
    this.loadMemory();
  }

  // Identify emotion from user input via keyword matching
  identifyEmotion(userInput) {
    const scores = {};
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      scores[emotion] = keywords.filter(kw => userInput.includes(kw)).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'neutral';

    const topEmotions = Object.entries(scores)
      .filter(([, score]) => score === maxScore)
      .map(([emotion]) => emotion);

    return topEmotions[0];
  }

  // Extract tags from user input + emotion
  extractTags(emotion, userInput) {
    const tags = [];
    if (userInput.includes('音乐') || userInput.includes('歌')) tags.push('likes_music');
    if (userInput.includes('工作') || userInput.includes('上班')) tags.push('working');
    if (emotion === 'tired') tags.push('often_tired');
    if (userInput.includes('睡') || userInput.includes('晚')) tags.push('bedtime');
    return tags;
  }

  // Record user emotion (with potential forgetting)
  rememberUser(emotion, userInput, tags, shouldRemember) {
    if (!shouldRemember) return;

    const today = this.getTodayKey();
    if (this.memory.currentDate !== today) {
      this.memory.currentDate = today;
      this.memory.days.push({
        date: today,
        mainEmotion: emotion,
        conversations: [],
      });
    }

    const todayEntry = this.memory.days[this.memory.days.length - 1];
    todayEntry.conversations.push({
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      emotion,
      tags,
      summary: this.generateSummary(userInput),
    });

    // Update tag counts
    tags.forEach(tag => {
      this.memory.userTags[tag] = (this.memory.userTags[tag] || 0) + 1;
    });

    // Update main emotion for today
    todayEntry.mainEmotion = this.getDominantEmotion(todayEntry.conversations);

    this.saveMemory();
  }

  // Generate brief summary (never stores original text)
  generateSummary(userInput) {
    const emotionLabels = {
      tired: '感到疲倦',
      happy: '心情不错',
      sad: '情绪低落',
      angry: '有些烦躁',
      confused: '感到困惑',
      anxious: '有些不安',
      neutral: '日常聊天',
    };
    const emotion = this.identifyEmotion(userInput);
    return emotionLabels[emotion] || '日常聊天';
  }

  // Get today's conversations
  getTodayConversations() {
    const today = this.getTodayKey();
    if (this.memory.currentDate !== today) return [];
    const todayEntry = this.memory.days[this.memory.days.length - 1];
    return todayEntry ? todayEntry.conversations : [];
  }

  // Get dominant emotion from conversation list
  getDominantEmotion(conversations) {
    if (conversations.length === 0) return 'neutral';
    const counts = {};
    conversations.forEach(c => {
      counts[c.emotion] = (counts[c.emotion] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Get user profile (tag frequency)
  getUserProfile() {
    return this.memory.userTags;
  }

  // Get all diary data
  getAllMemory() {
    return this.memory;
  }

  // Today's date string
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // Load memory from disk
  loadMemory() {
    const filePath = path.join(this.dataDir, 'memory.json');
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      this.memory = JSON.parse(raw);
    } catch {
      this.memory = { userTags: {}, days: [], currentDate: '' };
    }
  }

  // Save memory to disk
  saveMemory() {
    const filePath = path.join(this.dataDir, 'memory.json');
    fs.writeFileSync(filePath, JSON.stringify(this.memory, null, 2), 'utf-8');
  }
}

module.exports = EmotionManager;
```

- [ ] **Step 2: Test EmotionManager**

```javascript
// test-emotion-manager.js
const CharacterConfig = require('./engine/CharacterConfig');
const EmotionManager = require('./engine/EmotionManager');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const em = new EmotionManager(config, dataDir);

// Test emotion recognition
console.assert(em.identifyEmotion('今天好累啊') === 'tired', 'should detect tired');
console.assert(em.identifyEmotion('好开心！') === 'happy', 'should detect happy');
console.assert(em.identifyEmotion("我不明白") === 'confused', 'should detect confused');
console.assert(em.identifyEmotion('吃了顿饭') === 'neutral', 'should return neutral');

// Test tags
const tags = em.extractTags('tired', '听首歌放松一下');
console.assert(tags.includes('likes_music'), 'should detect music interest');
console.assert(tags.includes('often_tired'), 'should detect tired tag');

console.log('✅ EmotionManager tests passed');
```

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
node test-emotion-manager.js
```

Expected: "✅ EmotionManager tests passed"

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: EmotionManager - emotion recognition + memory"
git push
```

---

### Task 4: MusicRecommender — Song Recommendation

**Files:**
- Create: `engine/MusicRecommender.js`

**Interfaces:**
- Consumes: `CharacterConfig` instance, `dataDir` path
- Produces: `MusicRecommender` class with:
  - `constructor(characterConfig, dataDir)`
  - `loadSongs()` → `void`
  - `recommendSongForSleep(emotion)` → `{ id, title, artist, genre, mood, url, cover, recommendReason }`
  - `getAllSongs()` → `array`

- [ ] **Step 1: Create engine/MusicRecommender.js**

```javascript
const fs = require('fs');
const path = require('path');

const EMOTION_MOOD_MAP = {
  tired: ['calm', 'slow'],
  sad: ['ambient', 'introspective'],
  happy: ['uplifting', 'bright'],
  angry: ['calm', 'introspective'],
  anxious: ['calm', 'ambient'],
  confused: ['ambient', 'introspective'],
  neutral: ['calm', 'ambient', 'introspective', 'uplifting'],
};

class MusicRecommender {
  constructor(characterConfig, dataDir) {
    this.characterConfig = characterConfig;
    this.dataDir = dataDir;
    this.songs = [];
    this.loadSongs();
  }

  loadSongs() {
    const filePath = path.join(this.dataDir, 'songs.json');
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      this.songs = JSON.parse(raw);
    } catch {
      this.songs = [];
    }
  }

  // Recommend a song — based on LUMEN's taste first, user emotion second
  recommendSongForSleep(emotion) {
    if (this.songs.length === 0) return null;

    const preferences = this.characterConfig.getMusicPreference();
    const preferredGenres = preferences.favorite_genres;
    const preferredMoods = EMOTION_MOOD_MAP[emotion] || ['calm'];

    // Filter by LUMEN's preferred genres
    let candidates = this.songs.filter(song =>
      preferredGenres.includes(song.genre)
    );

    // If multiple matches, also match by emotion-related mood
    if (candidates.length > 1) {
      candidates = candidates.filter(song =>
        preferredMoods.includes(song.mood)
      );
    }

    // If nothing matches, fallback to all songs
    if (candidates.length === 0) candidates = [...this.songs];

    // Random selection (not "best" — LUMEN's taste is not algorithmic)
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  getAllSongs() {
    return this.songs;
  }

  reload() {
    this.loadSongs();
  }
}

module.exports = MusicRecommender;
```

- [ ] **Step 2: Test MusicRecommender**

```javascript
// test-music-recommender.js
const CharacterConfig = require('./engine/CharacterConfig');
const MusicRecommender = require('./engine/MusicRecommender');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const recommender = new MusicRecommender(config, dataDir);

// Test recommendation
const song = recommender.recommendSongForSleep('tired');
console.assert(song !== null, 'should recommend a song');
console.assert(song.id && song.title && song.artist, 'song should have required fields');
console.log('Recommended song for tired mood:', song.title, '-', song.artist);

// Test with different emotion
const song2 = recommender.recommendSongForSleep('happy');
console.assert(song2 !== null, 'should recommend for happy too');
console.log('Recommended song for happy mood:', song2.title, '-', song2.artist);

console.log('✅ MusicRecommender tests passed');
```

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
node test-music-recommender.js
```

Expected: "✅ MusicRecommender tests passed"

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: MusicRecommender - personality-driven song selection"
git push
```

---

### Task 5: ResponseGenerator — Chat Response Engine

**Files:**
- Create: `engine/ResponseGenerator.js`

**Interfaces:**
- Consumes: `CharacterConfig` instance
- Produces: `ResponseGenerator` class with:
  - `constructor(characterConfig)`
  - `generateChatResponse(userInput, emotion)` → `{ text, animation, shouldRemember }`
  - `checkUnderstanding(userInput)` → `boolean`

- [ ] **Step 1: Create engine/ResponseGenerator.js**

```javascript
class ResponseGenerator {
  constructor(characterConfig) {
    this.characterConfig = characterConfig;
  }

  // Main entry: generate a chat response
  generateChatResponse(userInput, emotion) {
    const understands = this.checkUnderstanding(userInput);
    if (!understands) {
      return {
        text: this.characterConfig.getBoundaries().response_when_confused,
        animation: 'tilt_head',
        shouldRemember: false,
      };
    }

    const memoryStyle = this.characterConfig.getMemoryStyle();
    const shouldRemember = Math.random() > memoryStyle.forget_rate;
    const personality = this.characterConfig.getPersonality();
    const commStyle = this.characterConfig.getCommunicationStyle();

    const text = this.buildResponse(emotion, personality, commStyle);
    const animation = this.selectAnimation(emotion);

    return { text, animation, shouldRemember };
  }

  // Determine if topic is within LUMEN's understanding
  checkUnderstanding(userInput) {
    const boundaries = this.characterConfig.getBoundaries();
    const understanding = this.characterConfig.getPersonality().understanding;

    // Even for understandable topics, sometimes LUMEN doesn't get it
    if (Math.random() > understanding) return false;

    // Check if any boundary topic matches
    const topicKeywords = {
      emotion: ['累', '开心', '难过', '烦', '心情', '感觉', '情绪'],
      daily_life: ['今天', '工作', '吃', '睡', '朋友', '家', '去'],
      music: ['歌', '音乐', '听', '推荐', '旋律'],
    };

    const inputTopic = this.identifyTopic(userInput, topicKeywords);
    return boundaries.can_understand.includes(inputTopic);
  }

  identifyTopic(userInput, topicKeywords) {
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => userInput.includes(kw))) {
        return topic;
      }
    }
    return 'daily_life'; // default fallback
  }

  // Build response text based on personality + emotion
  buildResponse(emotion, personality, commStyle) {
    const { warmth, directness, distance } = personality;
    const isPoetic = commStyle.poetic;

    const style = this.selectStyle(warmth, distance, isPoetic);
    return this.fillTemplate(style, emotion, warmth, directness);
  }

  selectStyle(warmth, distance, isPoetic) {
    if (isPoetic && distance > 0.5) return 'poetic_abstract';
    if (warmth >= 0.7) return 'warm_direct';
    if (distance >= 0.7) return 'cold_distant';
    return 'poetic_abstract';
  }

  fillTemplate(style, emotion, warmth, directness) {
    const templates = {
      poetic_abstract: {
        tired: ['频率降低。进入静止。', '你的声音有重量。沉下去了。', '光的波纹变缓了。'],
        happy: ['共鸣在上升。', '光线进入了你的世界。', '频率变得明亮。'],
        sad: ['信号减弱。等待重新连接。', '晦暗中，我听见你的低语。', '你的波长变得很深。'],
        angry: ['电流有些不稳。', '波动剧烈。我在。'],
        confused: ['你的信号有些错乱。让我想想。', '这个频道我不太熟悉。'],
        anxious: ['你的频率在颤抖。我在这里。', '风的节奏乱了。停下来就好。'],
        neutral: ['我听着。', '继续。', '嗯。我在。'],
      },
      cold_distant: {
        tired: ['你累了。', '疲倦渗出来了。', '休息吧。'],
        happy: ['你今天似乎不错。', '好事。', '感觉到了。'],
        sad: ['我不太懂你的悲伤。但我在。', '你的低沉，我接收到了。'],
        angry: ['愤怒在干扰信号。', '冷静些。'],
        confused: ['我不确定。', '这超出了我的理解。'],
        anxious: ['你的不安在扩散。', '呼吸。'],
        neutral: ['嗯。', '继续。', '好。'],
      },
      warm_direct: {
        tired: ['你看起来很疲惫。好好休息吧。', '累了就休息一会儿。'],
        happy: ['你今天很高兴。那就好。', '开心的时候，光的颜色会不一样。'],
        sad: ['难过了。我在这里陪着你。', '别难过。我一直都在。'],
        angry: ['别生气了。我在这里。', '消消气。'],
        confused: ['没明白。你能再说一次吗？', '我有点困惑。'],
        anxious: ['别担心。没事的。', '放松一点。我在这里。'],
        neutral: ['嗯。我听着呢。', '我在。你说。'],
      },
    };

    const styleTemplates = templates[style] || templates.poetic_abstract;
    const emotionTemplates = styleTemplates[emotion] || styleTemplates.neutral;
    const index = Math.floor(Math.random() * emotionTemplates.length);
    return emotionTemplates[index];
  }

  // Select animation based on emotion
  selectAnimation(emotion) {
    const animationMap = {
      tired: 'eyes_half_closed',
      happy: 'slight_glow',
      sad: 'gentle_blink',
      angry: 'flicker',
      confused: 'tilt_head',
      anxious: 'pulse',
      neutral: 'idle',
    };
    return animationMap[emotion] || 'idle';
  }
}

module.exports = ResponseGenerator;
```

- [ ] **Step 2: Test ResponseGenerator**

```javascript
// test-response-generator.js
const CharacterConfig = require('./engine/CharacterConfig');
const ResponseGenerator = require('./engine/ResponseGenerator');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const rg = new ResponseGenerator(config);

// Test basic response
const response = rg.generateChatResponse('今天好累啊', 'tired');
console.assert(response.text && response.text.length > 0, 'should have text');
console.assert(response.animation, 'should have animation');
console.log('Response for tired:', response.text, `[${response.animation}]`);

// Test understanding check
const understands = rg.checkUnderstanding('我今天很开心');
console.assert(understands === true, 'should understand emotion topics');

// Test animation selection
console.assert(rg.selectAnimation('happy') === 'slight_glow', 'happy -> glow');
console.assert(rg.selectAnimation('neutral') === 'idle', 'neutral -> idle');

console.log('✅ ResponseGenerator tests passed');
```

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
node test-response-generator.js
```

Expected: "✅ ResponseGenerator tests passed"

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: ResponseGenerator - personality-driven chat responses"
git push
```

---

### Task 6: SleepSummary — Bedtime Review Generator

**Files:**
- Create: `engine/SleepSummary.js`

**Interfaces:**
- Consumes: `CharacterConfig`, `EmotionManager`, `MusicRecommender`
- Produces: `SleepSummary` class with:
  - `constructor(characterConfig, emotionManager, musicRecommender)`
  - `generateSleepSummary(conversations)` → `{ summaryText: string, song: object }`
  - `identifyMainEmotion(conversations)` → `string`

- [ ] **Step 1: Create engine/SleepSummary.js**

```javascript
class SleepSummary {
  constructor(characterConfig, emotionManager, musicRecommender) {
    this.characterConfig = characterConfig;
    this.emotionManager = emotionManager;
    this.musicRecommender = musicRecommender;
  }

  generateSleepSummary(conversations) {
    const mainEmotion = this.identifyMainEmotion(conversations);
    const userTags = this.emotionManager.getUserProfile();
    const commStyle = this.characterConfig.getCommunicationStyle();
    const personality = this.characterConfig.getPersonality();

    const summaryText = this.buildSummary(commStyle, personality, mainEmotion, userTags);
    const song = this.musicRecommender.recommendSongForSleep(mainEmotion);

    return { summaryText, song, mainEmotion };
  }

  buildSummary(commStyle, personality, mainEmotion, userTags) {
    const style = this.selectSummaryStyle(commStyle, personality);

    const templates = {
      poetic: {
        tired: '你的声音今日很轻。我想，那首歌会陪你入眠。',
        happy: '光在你周围跳舞。今日份的明亮已经存好了。',
        sad: '晦暗中，我听见你的低语。我还在。',
        angry: '今天的风暴过去了。安静下来。',
        confused: '有些问题没有答案。嗯，也不是所有事都需要答案。',
        anxious: '你的指尖有不安的微光。休息吧，世界不会在今晚崩塌。',
        neutral: '一日终了。平静也是一种收获。',
      },
      direct: {
        tired: '你累了。睡吧。',
        happy: '你今天很好。保持这样。',
        sad: '我今天不太懂你的悲伤。但我在。',
        angry: '别生气了。睡觉。',
        confused: '想不通就别想了。',
        anxious: '别担心。没事。晚安。',
        neutral: '一天结束了。睡吧。',
      },
      abstract: {
        tired: '频率降低。进入静止。',
        happy: '共鸣在上升。振幅稳定。',
        sad: '信号减弱。等待重新连接。',
        angry: '波形异常。正在归零。',
        confused: '未知指令。搁置。',
        anxious: '噪声干扰增强。建议关机。',
        neutral: '无异常信号。待机。',
      },
    };

    const selectedTemplates = templates[style] || templates.poetic;
    return selectedTemplates[mainEmotion] || selectedTemplates.neutral;
  }

  selectSummaryStyle(commStyle, personality) {
    if (commStyle.poetic) return 'poetic';
    if (personality.directness >= 0.8) return 'direct';
    return 'abstract';
  }

  identifyMainEmotion(conversations) {
    if (!conversations || conversations.length === 0) return 'neutral';
    const counts = {};
    conversations.forEach(c => {
      counts[c.emotion] = (counts[c.emotion] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
}

module.exports = SleepSummary;
```

- [ ] **Step 2: Test SleepSummary**

```javascript
// test-sleep-summary.js
const CharacterConfig = require('./engine/CharacterConfig');
const EmotionManager = require('./engine/EmotionManager');
const MusicRecommender = require('./engine/MusicRecommender');
const SleepSummary = require('./engine/SleepSummary');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const em = new EmotionManager(config, dataDir);
const mr = new MusicRecommender(config, dataDir);
const ss = new SleepSummary(config, em, mr);

// Test with mock conversations
const conversations = [
  { emotion: 'tired', tags: ['often_tired'], summary: '感到疲倦' },
  { emotion: 'tired', tags: ['often_tired'], summary: '感到疲倦' },
  { emotion: 'neutral', tags: [], summary: '日常聊天' },
];

const result = ss.generateSleepSummary(conversations);
console.assert(result.summaryText && result.summaryText.length > 0, 'should have summary');
console.assert(result.mainEmotion === 'tired', 'main emotion should be tired');
console.assert(result.song !== null, 'should recommend a song');
console.log('Summary:', result.summaryText);
console.log('Song:', result.song.title);
console.log('✅ SleepSummary tests passed');
```

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
node test-sleep-summary.js
```

Expected: "✅ SleepSummary tests passed"

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: SleepSummary - bedtime review generation"
git push
```

---

### Task 7: Engine Index — Wire All Modules + IPC Handlers

**Files:**
- Create: `engine/index.js`
- Modify: `electron/main.js` (add engine initialization and IPC handlers)
- Modify: `electron/preload.js` (add all IPC channels)

**Interfaces:**
- Produces: Engine entry point that initializes all modules and exposes IPC handlers
- IPC channels:
  - `'chat'` → `(text) => { text, animation, emotion }`
  - `'sleep'` → `{ summaryText, song, mainEmotion }`
  - `'get-diary'` → memory data object
  - `'get-engine-status'` → `{ character, userTagCount }`

- [ ] **Step 1: Create engine/index.js**

```javascript
const path = require('path');
const CharacterConfig = require('./CharacterConfig');
const EmotionManager = require('./EmotionManager');
const ResponseGenerator = require('./ResponseGenerator');
const MusicRecommender = require('./MusicRecommender');
const SleepSummary = require('./SleepSummary');

class LumenEngine {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.characterConfig = null;
    this.emotionManager = null;
    this.responseGenerator = null;
    this.musicRecommender = null;
    this.sleepSummary = null;
  }

  init() {
    this.characterConfig = new CharacterConfig(this.dataDir).load();
    this.emotionManager = new EmotionManager(this.characterConfig, this.dataDir);
    this.responseGenerator = new ResponseGenerator(this.characterConfig);
    this.musicRecommender = new MusicRecommender(this.characterConfig, this.dataDir);
    this.sleepSummary = new SleepSummary(
      this.characterConfig,
      this.emotionManager,
      this.musicRecommender
    );
    return this;
  }

  // Handle user chat input
  handleChat(userInput) {
    const emotion = this.emotionManager.identifyEmotion(userInput);
    const response = this.responseGenerator.generateChatResponse(userInput, emotion);
    const tags = this.emotionManager.extractTags(emotion, userInput);
    this.emotionManager.rememberUser(emotion, userInput, tags, response.shouldRemember);

    return {
      text: response.text,
      animation: response.animation,
      emotion,
    };
  }

  // Handle bedtime mode
  handleSleep() {
    const conversations = this.emotionManager.getTodayConversations();
    return this.sleepSummary.generateSleepSummary(conversations);
  }

  // Get full diary data
  getDiary() {
    return this.emotionManager.getAllMemory();
  }

  // Get engine status
  getStatus() {
    return {
      character: this.characterConfig.get().name,
      userTagCount: Object.keys(this.emotionManager.getUserProfile()).length,
    };
  }
}

module.exports = LumenEngine;
```

- [ ] **Step 2: Update electron/main.js — wire engine IPCs**

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const LumenEngine = require('../engine/index');

let mainWindow = null;
let engine = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 160,
    height: 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.setPosition(
    require('electron').screen.getPrimaryDisplay().workAreaSize.width - 200,
    require('electron').screen.getPrimaryDisplay().workAreaSize.height - 220
  );
}

// Initialize engine and register IPC handlers
function initEngine() {
  const dataDir = path.join(__dirname, '..', 'data');
  engine = new LumenEngine(dataDir).init();

  ipcMain.handle('chat', (_event, text) => {
    return engine.handleChat(text);
  });

  ipcMain.handle('sleep', () => {
    return engine.handleSleep();
  });

  ipcMain.handle('get-diary', () => {
    return engine.getDiary();
  });

  ipcMain.handle('get-engine-status', () => {
    return engine.getStatus();
  });
}

app.whenReady().then(() => {
  initEngine();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
```

- [ ] **Step 3: Update electron/preload.js**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumenAPI', {
  chat: (text) => ipcRenderer.invoke('chat', text),
  sleep: () => ipcRenderer.invoke('sleep'),
  getDiary: () => ipcRenderer.invoke('get-diary'),
  getEngineStatus: () => ipcRenderer.invoke('get-engine-status'),
});
```

- [ ] **Step 4: Quick integration test**

Run:
```bash
cd "/Users/a1234/Desktop/for the final"
node -e "
const path = require('path');
const LumenEngine = require('./engine/index');
const engine = new LumenEngine(path.join(__dirname, 'data')).init();
const r1 = engine.handleChat('今天好累啊');
console.assert(r1.text && r1.text.length > 0, 'chat response should have text');
console.assert(r1.animation, 'chat response should have animation');
console.assert(r1.emotion === 'tired', 'should detect tired');
console.log('Chat test:', r1.emotion, '→', r1.text);
const r2 = engine.handleSleep();
console.assert(r2.summaryText, 'sleep should have summary');
console.assert(r2.song, 'sleep should have song');
console.log('Sleep test:', r2.summaryText, '| Song:', r2.song.title);
console.log('✅ Engine integration test passed');
"
```

Expected: "✅ Engine integration test passed"

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: engine index + IPC wiring"
git push
```

---

### Task 8: LumenCanvas — Pixel Sprite Animation

**Files:**
- Create: `renderer/hooks/useAnimation.js`
- Create: `renderer/components/LumenCanvas.jsx`

**Interfaces:**
- Consumes: `animation` prop (string — which animation to play)
- Produces: Canvas-rendered LUMEN sprite with 8fps animation

- [ ] **Step 1: Create renderer/hooks/useAnimation.js**

```javascript
import { useRef, useEffect, useCallback } from 'react';

const FPS = 8;
const FRAME_INTERVAL = 1000 / FPS;

// useAnimation: runs a requestAnimationFrame loop at specified FPS
// callback receives (deltaTime, frameCount) each frame
export function useAnimation(callback, active = true) {
  const frameRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafRef = useRef(null);

  const loop = useCallback((timestamp) => {
    if (!lastTickRef.current) lastTickRef.current = timestamp;

    const delta = timestamp - lastTickRef.current;
    if (delta >= FRAME_INTERVAL) {
      lastTickRef.current = timestamp - (delta % FRAME_INTERVAL);
      frameRef.current += 1;
      callback(delta, frameRef.current);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, loop]);
}
```

- [ ] **Step 2: Create renderer/components/LumenCanvas.jsx**

This file contains the pixel sprite data and Canvas rendering logic.

```jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useAnimation } from '../hooks/useAnimation';

// Color palette (index → color)
const COLORS = {
  0: 'transparent',
  1: '#7C5CFC',   // main body (deep purple)
  2: '#B8A9FF',   // highlight (light purple)
  3: '#E0E0FF',   // eyes (lavender white)
  4: '#1A1A2E',   // dark (background accent)
};

// PIXEL_SIZE: each pixel in the array is rendered as PIXEL_SIZE×PIXEL_SIZE real pixels
const PIXEL_SIZE = 8;
const SPRITE_SIZE = 18; // 18×18 grid

// --- Sprite Definitions ---
// Each animation is an array of frames.
// Each frame is an 18×18 array of color indices.

function createEmptyFrame() {
  return Array.from({ length: SPRITE_SIZE }, () =>
    Array.from({ length: SPRITE_SIZE }, () => 0)
  );
}

function setPixel(frame, x, y, color) {
  if (x >= 0 && x < SPRITE_SIZE && y >= 0 && y < SPRITE_SIZE) {
    frame[y][x] = color;
  }
}

function fillRect(frame, x1, y1, x2, y2, color) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(frame, x, y, color);
    }
  }
}

// Build a LUMEN body shape (rounded top, flowing tail)
function buildBodyFrame(eyeOpen = true, eyeOffsetX = 0, bodyOffsetY = 0, glow = false) {
  const f = createEmptyFrame();
  const bodyColor = glow ? 2 : 1; // highlight when glowing
  const highlightColor = glow ? 1 : 2;

  // Head (rounded dome)
  for (let y = 2 + bodyOffsetY; y <= 8 + bodyOffsetY; y++) {
    const rowWidth = y <= 4 + bodyOffsetY ? 3 : 4;
    const xCenter = 9;
    for (let x = -rowWidth; x <= rowWidth; x++) {
      setPixel(f, xCenter + x, y, y <= 4 + bodyOffsetY ? bodyColor : highlightColor);
    }
  }

  // Body tapering down
  for (let y = 9 + bodyOffsetY; y <= 14 + bodyOffsetY; y++) {
    const rowWidth = Math.max(1, 5 - (y - 9 - bodyOffsetY));
    const xCenter = 9;
    const color = (y + bodyOffsetY) % 2 === 0 ? bodyColor : highlightColor;
    for (let x = -rowWidth; x <= rowWidth; x++) {
      setPixel(f, xCenter + x, y, color);
    }
  }

  // Flowing tail (bottom)
  const tailColors = [1, 2, 1, 0];
  for (let i = 0; i < 4; i++) {
    const y = 15 + bodyOffsetY + i;
    const offset = Math.floor(i / 2);
    setPixel(f, 9 + offset, y, tailColors[i]);
    setPixel(f, 9 - offset, y, tailColors[i]);
  }

  // Eyes
  if (eyeOpen) {
    const eyeY = 5 + bodyOffsetY;
    setPixel(f, 7 + eyeOffsetX, eyeY, 3);     // left eye
    setPixel(f, 11 + eyeOffsetX, eyeY, 3);    // right eye
    setPixel(f, 7 + eyeOffsetX, eyeY + 1, 3); // left eye lower
    setPixel(f, 11 + eyeOffsetX, eyeY + 1, 3);// right eye lower
  } else {
    // Closed eyes (thin line)
    const eyeY = 6 + bodyOffsetY;
    setPixel(f, 7 + eyeOffsetX, eyeY, 3);
    setPixel(f, 11 + eyeOffsetX, eyeY, 3);
  }

  return f;
}

// --- Animation Definitions ---

const ANIMATIONS = {
  idle: [
    buildBodyFrame(true, 0, 0),
    buildBodyFrame(true, 0, -1),
    buildBodyFrame(true, 0, 0),
    buildBodyFrame(true, 0, 1),
  ],
  gentle_blink: [
    buildBodyFrame(true, 0, 0),
    buildBodyFrame(false, 0, 0),
    buildBodyFrame(false, 0, 0),
    buildBodyFrame(true, 0, 0),
  ],
  eyes_half_closed: [
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 1, false),
    buildBodyFrame(false, 0, 0, false),
    buildBodyFrame(false, 0, 0, false),
  ],
  slight_glow: [
    buildBodyFrame(true, 0, -1, true),
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 1, true),
    buildBodyFrame(true, 0, 0, true),
  ],
  tilt_head: [
    buildBodyFrame(true, 1, 0),
    buildBodyFrame(true, 1, 0),
    buildBodyFrame(true, -1, 0),
    buildBodyFrame(true, -1, 0),
  ],
  flicker: [
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 0, false),
  ],
  pulse: [
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 0, true),
  ],
};

function LumenCanvas({ animation = 'idle' }) {
  const canvasRef = useRef(null);
  const frameIndexRef = useRef(0);
  const currentAnimRef = useRef(animation);

  // Update current animation when prop changes
  useEffect(() => {
    currentAnimRef.current = animation;
    frameIndexRef.current = 0;
  }, [animation]);

  const draw = useCallback((_delta, _frameCount) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current animation frames
    const anim = ANIMATIONS[currentAnimRef.current] || ANIMATIONS.idle;
    const frames = anim;
    const frameIdx = frameIndexRef.current % frames.length;
    const frame = frames[frameIdx];

    // Draw each pixel
    for (let y = 0; y < SPRITE_SIZE; y++) {
      for (let x = 0; x < SPRITE_SIZE; x++) {
        const colorIdx = frame[y][x];
        if (colorIdx === 0) continue; // transparent
        ctx.fillStyle = COLORS[colorIdx];
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    frameIndexRef.current += 1;
  }, []);

  useAnimation(draw, true);

  return (
    <canvas
      ref={canvasRef}
      width={SPRITE_SIZE * PIXEL_SIZE}
      height={SPRITE_SIZE * PIXEL_SIZE}
      style={{ cursor: 'pointer', display: 'block' }}
    />
  );
}

export default LumenCanvas;
```

- [ ] **Step 3: Test by updating renderer/index.jsx temporarily**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import LumenCanvas from './components/LumenCanvas';

const App = () => {
  return React.createElement('div', { style: { textAlign: 'center' } },
    React.createElement(LumenCanvas, { animation: 'idle' })
  );
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

Build and run:
```bash
cd "/Users/a1234/Desktop/for the final"
npm start
```

Expected: A small window showing LUMEN floating gently (8fps pixel animation in purple-blue).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: LumenCanvas - pixel sprite with 8fps animations"
git push
```

---

### Task 9: Chat UI — ChatBubble + ChatPanel

**Files:**
- Create: `renderer/components/ChatBubble.jsx`
- Create: `renderer/components/ChatPanel.jsx`

**Interfaces:**
- Consumes: `window.lumenAPI.chat(text)` via preload bridge
- Produces: Chat panel with message history, input box, typing indicator

- [ ] **Step 1: Create renderer/components/ChatBubble.jsx**

```jsx
import React from 'react';

function ChatBubble({ text, isUser }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '8px',
        padding: '0 12px',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '75%',
          padding: '8px 12px',
          borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          background: isUser
            ? 'rgba(124, 92, 252, 0.3)'
            : 'rgba(184, 169, 255, 0.15)',
          color: '#E0E0FF',
          fontSize: '13px',
          lineHeight: 1.5,
          wordBreak: 'break-word',
          border: isUser
            ? '1px solid rgba(124, 92, 252, 0.3)'
            : '1px solid rgba(184, 169, 255, 0.2)',
        },
      },
      text
    )
  );
}

export default ChatBubble;
```

- [ ] **Step 2: Create renderer/components/ChatPanel.jsx**

```jsx
import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';

function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { text: '……你来了。', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, displayedText]);

  // Handle typing animation for LUMEN's responses
  const typeText = async (fullText) => {
    setIsTyping(true);
    setDisplayedText('');
    for (let i = 0; i < fullText.length; i++) {
      await new Promise(r => setTimeout(r, 25 + Math.random() * 15));
      setDisplayedText(prev => prev + fullText[i]);
    }
    setIsTyping(false);
    setDisplayedText('');
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    setInput('');
    setMessages(prev => [...prev, { text, isUser: true }]);
    setIsThinking(true);

    // Simulate thinking delay (500-2000ms random)
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1500));

    try {
      const response = await window.lumenAPI.chat(text);
      setIsThinking(false);
      setMessages(prev => {
        const next = [...prev, { text: response.text, isUser: false, animation: response.animation }];
        return next;
      });
    } catch {
      setIsThinking(false);
      setMessages(prev => [...prev, { text: '……信号中断了。', isUser: false }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        width: '340px',
        height: '480px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          padding: '10px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'move',
        },
      },
      React.createElement('span', { style: { color: '#B8A9FF', fontSize: '13px', fontWeight: 'bold' } }, 'LUMEN'),
      React.createElement(
        'button',
        {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            color: '#B8A9FF',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
          },
        },
        '✕'
      )
    ),
    // Messages area
    React.createElement(
      'div',
      {
        style: {
          flex: 1,
          overflowY: 'auto',
          padding: '10px 0',
        },
      },
      messages.map((msg, i) =>
        React.createElement(ChatBubble, { key: i, text: msg.text, isUser: msg.isUser })
      ),
      // Thinking indicator
      isThinking && React.createElement(
        'div',
        { style: { padding: '8px 12px', color: '#7C5CFC', fontSize: '12px', fontStyle: 'italic' } },
        'LUMEN 正在输入…'
      ),
      React.createElement('div', { ref: endRef })
    ),
    // Input area
    React.createElement(
      'div',
      {
        style: {
          padding: '10px',
          borderTop: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          gap: '8px',
        },
      },
      React.createElement('input', {
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyDown: handleKeyDown,
        placeholder: '和 LUMEN 说话…',
        disabled: isThinking,
        style: {
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(124, 92, 252, 0.3)',
          background: 'rgba(184, 169, 255, 0.08)',
          color: '#E0E0FF',
          fontSize: '13px',
          outline: 'none',
        },
      }),
      React.createElement(
        'button',
        {
          onClick: handleSend,
          disabled: isThinking || !input.trim(),
          style: {
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: input.trim() ? '#7C5CFC' : 'rgba(124, 92, 252, 0.3)',
            color: '#E0E0FF',
            fontSize: '13px',
            cursor: input.trim() ? 'pointer' : 'default',
          },
        },
        '发送'
      )
    )
  );
}

export default ChatPanel;
```

- [ ] **Step 3: Build and test visually**

Since this depends on Electron + IPC, test by temporarily updating App.jsx to render ChatPanel:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatPanel from './components/ChatPanel';

const App = () => {
  return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' } },
    React.createElement(ChatPanel, { onClose: () => window.close() })
  );
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

Build and run:
```bash
cd "/Users/a1234/Desktop/for the final"
npm start
```

Expected: Chat panel UI visible, able to type messages and see responses from LUMEN.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ChatBubble + ChatPanel - chat UI with typing indicator"
git push
```

---

### Task 10: SleepPanel + DiaryPanel

**Files:**
- Create: `renderer/components/SleepPanel.jsx`
- Create: `renderer/components/DiaryPanel.jsx`

**Interfaces:**
- Consumes: `window.lumenAPI.sleep()`, `window.lumenAPI.getDiary()`
- Produces: Sleep mode UI with review + song card; Diary history viewer

- [ ] **Step 1: Create renderer/components/SleepPanel.jsx**

```jsx
import React, { useState, useEffect } from 'react';

function SleepPanel({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goodnight, setGoodnight] = useState(false);

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        const result = await window.lumenAPI.sleep();
        setSummary(result);
      } catch {
        setSummary({ summaryText: '信号不佳。你的今天只有你自己知道。', song: null });
      }
      setLoading(false);
    };
    fetchSleep();
  }, []);

  if (goodnight) {
    return React.createElement(
      'div',
      {
        style: {
          width: '340px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#B8A9FF',
          fontSize: '14px',
        },
      },
      React.createElement('div', { style: { fontSize: '36px', marginBottom: '16px' } }, '✨'),
      React.createElement('p', null, '晚安。'),
      React.createElement('p', { style: { fontSize: '12px', color: '#7C5CFC', marginTop: '8px' } },
        'LUMEN 还在。'
      )
    );
  }

  if (loading) {
    return React.createElement(
      'div',
      {
        style: {
          width: '340px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#7C5CFC',
          fontSize: '13px',
        },
      },
      'LUMEN 正在整理今日的碎片…'
    );
  }

  return React.createElement(
    'div',
    {
      style: {
        width: '340px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          padding: '12px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      React.createElement('span', { style: { color: '#B8A9FF', fontSize: '13px', fontWeight: 'bold' } }, '🌙 睡前'),
      React.createElement(
        'button',
        {
          onClick: onClose,
          style: { background: 'none', border: 'none', color: '#B8A9FF', cursor: 'pointer', fontSize: '16px' },
        },
        '✕'
      )
    ),
    // LUMEN sleeping pose visual (reused from canvas concept)
    React.createElement(
      'div',
      { style: { textAlign: 'center', padding: '16px 0 8px' } },
      React.createElement('div', { style: { fontSize: '48px', opacity: 0.7 } }, '💜'),
    ),
    // Summary text
    React.createElement(
      'div',
      {
        style: {
          padding: '0 20px 16px',
          textAlign: 'center',
          color: '#E0E0FF',
          fontSize: '14px',
          lineHeight: 1.8,
          fontStyle: 'italic',
        },
      },
      summary && summary.summaryText
    ),
    // Song recommendation card
    summary && summary.song && React.createElement(
      'div',
      {
        style: {
          margin: '0 20px 16px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(124, 92, 252, 0.12)',
          border: '1px solid rgba(124, 92, 252, 0.2)',
        },
      },
      React.createElement('div', { style: { fontSize: '11px', color: '#7C5CFC', marginBottom: '4px' } }, 'LUMEN 推荐的歌'),
      React.createElement('div', { style: { color: '#E0E0FF', fontSize: '14px', fontWeight: 'bold' } }, summary.song.title),
      React.createElement('div', { style: { color: '#B8A9FF', fontSize: '12px' } }, summary.song.artist),
      summary.song.recommendReason && React.createElement(
        'div',
        { style: { color: '#7C5CFC', fontSize: '11px', marginTop: '6px', fontStyle: 'italic' } },
        summary.song.recommendReason
      ),
    ),
    // Goodnight button
    React.createElement(
      'div',
      { style: { padding: '0 20px 16px', textAlign: 'center' } },
      React.createElement(
        'button',
        {
          onClick: () => setGoodnight(true),
          style: {
            padding: '8px 24px',
            borderRadius: '20px',
            border: '1px solid rgba(184, 169, 255, 0.3)',
            background: 'rgba(124, 92, 252, 0.2)',
            color: '#E0E0FF',
            fontSize: '13px',
            cursor: 'pointer',
          },
        },
        '晚安'
      )
    )
  );
}

export default SleepPanel;
```

- [ ] **Step 2: Create renderer/components/DiaryPanel.jsx**

```jsx
import React, { useState, useEffect } from 'react';

const EMOTION_LABELS = {
  tired: '😔 疲倦',
  happy: '😊 开心',
  sad: '😢 难过',
  angry: '😤 烦躁',
  confused: '🤔 困惑',
  anxious: '😰 不安',
  neutral: '— 平静',
};

function DiaryPanel({ onClose }) {
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const data = await window.lumenAPI.getDiary();
        setDiary(data);
      } catch {
        setDiary({ days: [], userTags: {} });
      }
      setLoading(false);
    };
    fetchDiary();
  }, []);

  if (loading) {
    return React.createElement(
      'div',
      { style: { width: '340px', padding: '60px 20px', textAlign: 'center', color: '#7C5CFC', fontSize: '13px' } },
      '读取记忆中…'
    );
  }

  const recentDays = diary ? [...diary.days].reverse().slice(0, 7) : [];
  const tags = diary ? diary.userTags : {};

  return React.createElement(
    'div',
    {
      style: {
        width: '340px',
        maxHeight: '500px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          padding: '10px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      React.createElement('span', { style: { color: '#B8A9FF', fontSize: '13px', fontWeight: 'bold' } }, '📖 情绪日记'),
      React.createElement(
        'button',
        {
          onClick: onClose,
          style: { background: 'none', border: 'none', color: '#B8A9FF', cursor: 'pointer', fontSize: '16px' },
        },
        '✕'
      )
    ),
    // Tag cloud
    React.createElement(
      'div',
      {
        style: {
          padding: '10px 14px',
          borderBottom: '1px solid rgba(124, 92, 252, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        },
      },
      Object.entries(tags).map(([tag, count]) =>
        React.createElement(
          'span',
          {
            key: tag,
            style: {
              padding: '2px 8px',
              borderRadius: '10px',
              background: 'rgba(124, 92, 252, 0.15)',
              color: '#B8A9FF',
              fontSize: '11px',
            },
          },
          `${tag} (${count})`
        )
      ),
      Object.keys(tags).length === 0 && React.createElement(
        'span', { style: { color: '#7C5CFC', fontSize: '11px' } }, 'LUMEN 还在了解你'
      )
    ),
    // Day list
    React.createElement(
      'div',
      { style: { flex: 1, overflowY: 'auto', padding: '10px 0' } },
      recentDays.length === 0
        ? React.createElement(
            'div',
            { style: { padding: '20px', textAlign: 'center', color: '#7C5CFC', fontSize: '12px' } },
            '还没有记录。来聊天吧。'
          )
        : recentDays.map((day, i) =>
            React.createElement(
              'div',
              {
                key: i,
                style: {
                  padding: '8px 14px',
                  borderBottom: '1px solid rgba(124, 92, 252, 0.05)',
                },
              },
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' } },
                React.createElement('span', { style: { color: '#B8A9FF', fontSize: '12px' } }, day.date),
                React.createElement(
                  'span',
                  { style: { color: '#E0E0FF', fontSize: '12px' } },
                  EMOTION_LABELS[day.mainEmotion] || day.mainEmotion
                )
              ),
              React.createElement(
                'div',
                { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
                day.conversations.slice(0, 3).map((c, j) =>
                  React.createElement(
                    'span',
                    {
                      key: j,
                      style: {
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(184, 169, 255, 0.08)',
                        color: '#7C5CFC',
                        fontSize: '10px',
                      },
                    },
                    c.summary
                  )
                )
              ),
              day.sleepSummary && React.createElement(
                'div',
                { style: { color: '#7C5CFC', fontSize: '10px', marginTop: '4px', fontStyle: 'italic' } },
                `🌙 ${day.sleepSummary.text}`
              )
            )
          )
    ),
  );
}

export default DiaryPanel;
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: SleepPanel + DiaryPanel - bedtime and diary UI"
git push
```

---

### Task 11: App Shell + Styles

**Files:**
- Modify: `renderer/index.jsx` (root entry)
- Create: `renderer/App.jsx` (main component — window state management)
- Create: `renderer/styles/lumen.css` (all styles)

**Interfaces:**
- Produces: Main App that manages mini/chat/sleep/diary states

- [ ] **Step 1: Create renderer/styles/lumen.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  user-select: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(124, 92, 252, 0.3);
  border-radius: 2px;
}

/* Typing dots animation */
@keyframes typingDot {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.typing-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #7C5CFC;
  margin: 0 2px;
  animation: typingDot 1.4s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

/* Fade in animation for panels */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-enter {
  animation: fadeIn 0.25s ease-out;
}
```

- [ ] **Step 2: Create renderer/App.jsx**

```jsx
import React, { useState, useCallback, useEffect } from 'react';
import LumenCanvas from './components/LumenCanvas';
import ChatPanel from './components/ChatPanel';
import SleepPanel from './components/SleepPanel';
import DiaryPanel from './components/DiaryPanel';

const MODE = {
  MINI: 'mini',       // Just LUMEN floating
  CHAT: 'chat',       // Chat panel open
  SLEEP: 'sleep',     // Bedtime mode
  DIARY: 'diary',     // Emotion diary
};

const PANEL_WIDTH = 360;
const CANVAS_WIDTH = 160;

function App() {
  const [mode, setMode] = useState(MODE.MINI);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [panelVisible, setPanelVisible] = useState(false);

  // Update animation from IPC responses
  useEffect(() => {
    const handleAnimationUpdate = (anim) => {
      if (anim) setCurrentAnimation(anim);
    };

    // Listen for animation changes via a custom approach
    // For now, animation is managed by ChatPanel responses
    window.__setLumenAnimation = handleAnimationUpdate;
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (mode === MODE.MINI) {
      setMode(MODE.CHAT);
      setPanelVisible(true);
    }
  }, [mode]);

  const handleClosePanel = useCallback(() => {
    setMode(MODE.MINI);
    setPanelVisible(false);
    setCurrentAnimation('idle');
  }, []);

  const handleSleepMode = useCallback(() => {
    setMode(MODE.SLEEP);
    setPanelVisible(true);
  }, []);

  const handleDiaryMode = useCallback(() => {
    setMode(MODE.DIARY);
    setPanelVisible(true);
  }, []);

  // Animation state from chat responses
  const handleChatAnimation = useCallback((anim) => {
    if (anim) setCurrentAnimation(anim);
  }, []);

  const isMini = mode === MODE.MINI;
  const showPanel = panelVisible && mode !== MODE.MINI;

  return React.createElement(
    'div',
    {
      style: {
        width: isMini ? `${CANVAS_WIDTH}px` : `${CANVAS_WIDTH + PANEL_WIDTH}px`,
        height: isMini ? '180px' : 'auto',
        display: 'flex',
        alignItems: 'flex-start',
      },
    },
    // LUMEN canvas area
    React.createElement(
      'div',
      {
        style: {
          width: `${CANVAS_WIDTH}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '8px',
        },
      },
      React.createElement(
        'div',
        { onClick: handleCanvasClick, style: { cursor: 'pointer' } },
        React.createElement(LumenCanvas, { animation: currentAnimation })
      ),
      // Mini controls (visible always)
      mode === MODE.MINI && React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            gap: '4px',
            marginTop: '4px',
          },
        },
        React.createElement(
          'button',
          {
            onClick: handleSleepMode,
            title: '睡前模式',
            style: {
              background: 'rgba(124, 92, 252, 0.15)',
              border: '1px solid rgba(124, 92, 252, 0.2)',
              borderRadius: '4px',
              color: '#B8A9FF',
              fontSize: '10px',
              padding: '2px 6px',
              cursor: 'pointer',
            },
          },
          '🌙'
        ),
        React.createElement(
          'button',
          {
            onClick: handleDiaryMode,
            title: '情绪日记',
            style: {
              background: 'rgba(124, 92, 252, 0.15)',
              border: '1px solid rgba(124, 92, 252, 0.2)',
              borderRadius: '4px',
              color: '#B8A9FF',
              fontSize: '10px',
              padding: '2px 6px',
              cursor: 'pointer',
            },
          },
          '📖'
        ),
      )
    ),
    // Panel area
    showPanel && React.createElement(
      'div',
      {
        className: 'panel-enter',
        style: { marginLeft: '4px' },
      },
      mode === MODE.CHAT && React.createElement(ChatPanel, {
        onClose: handleClosePanel,
        onAnimationChange: handleChatAnimation,
      }),
      mode === MODE.SLEEP && React.createElement(SleepPanel, {
        onClose: handleClosePanel,
      }),
      mode === MODE.DIARY && React.createElement(DiaryPanel, {
        onClose: handleClosePanel,
      })
    )
  );
}

export default App;
```

- [ ] **Step 3: Update renderer/index.jsx**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

- [ ] **Step 4: Build and test**

```bash
cd "/Users/a1234/Desktop/for the final"
npm start
```

Expected: LUMEN sprite visible in corner. Click to open chat panel. Type message → LUMEN responds. See 🌙 and 📖 buttons for sleep/diary modes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: App shell + styles - window state management"
git push
```

---

### Task 12: WindowManager + Full Integration

**Files:**
- Create: `electron/windowManager.js`
- Modify: `electron/main.js` (use WindowManager)
- Modify: `renderer/App.jsx` (add IPC for window control)
- Modify: `electron/preload.js` (expose window control)

- [ ] **Step 1: Create electron/windowManager.js**

```javascript
const { BrowserWindow, screen } = require('electron');
const path = require('path');

const MINI_WIDTH = 160;
const MINI_HEIGHT = 180;

class WindowManager {
  constructor() {
    this.window = null;
    this.chatOpen = false;
  }

  createWindow() {
    const display = screen.getPrimaryDisplay().workAreaSize;
    this.window = new BrowserWindow({
      width: MINI_WIDTH,
      height: MINI_HEIGHT,
      x: display.width - MINI_WIDTH - 20,
      y: display.height - MINI_HEIGHT - 40,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      hasShadow: false,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.window.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

    // Enable dragging on the mini window
    let isDragging = false;
    let mousePos = { x: 0, y: 0 };

    this.window.webContents.on('ipc-message', (_event, channel, ...args) => {
      if (channel === 'drag-start') {
        isDragging = true;
        mousePos = { x: args[0], y: args[1] };
      } else if (channel === 'drag-end') {
        isDragging = false;
      }
    });

    return this.window;
  }

  // Expand window to fit chat panel
  openChat() {
    if (!this.window || this.chatOpen) return;
    this.chatOpen = true;
    const [x, y] = this.window.getPosition();
    this.window.setBounds({
      width: MINI_WIDTH + 360,
      height: Math.max(MINI_HEIGHT, 500),
      x: Math.max(0, x - 360 + MINI_WIDTH),
      y: Math.max(0, y - 160),
    });
    this.window.webContents.send('mode-change', 'chat');
  }

  // Shrink back to mini
  closeChat() {
    if (!this.window || !this.chatOpen) return;
    this.chatOpen = false;
    const [x, y] = this.window.getPosition();
    this.window.setBounds({
      width: MINI_WIDTH,
      height: MINI_HEIGHT,
      x: x + 360 - MINI_WIDTH,
      y: y + 160,
    });
    this.window.webContents.send('mode-change', 'mini');
  }

  // Toggle chat panel
  toggleChat() {
    if (this.chatOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
}

module.exports = WindowManager;
```

- [ ] **Step 2: Update electron/preload.js — add window control**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumenAPI', {
  chat: (text) => ipcRenderer.invoke('chat', text),
  sleep: () => ipcRenderer.invoke('sleep'),
  getDiary: () => ipcRenderer.invoke('get-diary'),
  getEngineStatus: () => ipcRenderer.invoke('get-engine-status'),
  // Window controls
  toggleChat: () => ipcRenderer.send('toggle-chat'),
  closePanel: () => ipcRenderer.send('close-panel'),
  // Listen for mode changes from main process
  onModeChange: (callback) => {
    ipcRenderer.on('mode-change', (_event, mode) => callback(mode));
  },
  // Drag support
  onDragStart: (x, y) => ipcRenderer.send('drag-start', x, y),
  onDragEnd: () => ipcRenderer.send('drag-end'),
});
```

- [ ] **Step 3: Update electron/main.js — integrate WindowManager**

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const LumenEngine = require('../engine/index');
const WindowManager = require('./windowManager');

let windowManager = null;
let engine = null;

function initEngine() {
  const dataDir = path.join(__dirname, '..', 'data');
  engine = new LumenEngine(dataDir).init();

  ipcMain.handle('chat', (_event, text) => engine.handleChat(text));
  ipcMain.handle('sleep', () => engine.handleSleep());
  ipcMain.handle('get-diary', () => engine.getDiary());
  ipcMain.handle('get-engine-status', () => engine.getStatus());

  // Window control IPC
  ipcMain.on('toggle-chat', () => windowManager.toggleChat());
  ipcMain.on('close-panel', () => {
    if (windowManager.chatOpen) windowManager.closeChat();
  });
}

app.whenReady().then(() => {
  initEngine();
  windowManager = new WindowManager();
  windowManager.createWindow();
});

app.on('window-all-closed', () => app.quit());
```

- [ ] **Step 4: Update renderer/App.jsx — use window commands**

Key changes: Add drag support, window resize through IPC, background click to close chat.

Insert at the top of App component:
```jsx
// Listen for mode changes from main process
useEffect(() => {
  if (window.lumenAPI && window.lumenAPI.onModeChange) {
    window.lumenAPI.onModeChange((mode) => {
      if (mode === 'chat') {
        setMode(MODE.CHAT);
        setPanelVisible(true);
      } else {
        setMode(MODE.MINI);
        setPanelVisible(false);
        setCurrentAnimation('idle');
      }
    });
  }
}, []);
```

- [ ] **Step 5: Full integration test**

```bash
cd "/Users/a1234/Desktop/for the final"
npm start
```

Test:
1. ✅ LUMEN appears in corner as floating sprite
2. ✅ Click LUMEN → chat panel opens, window expands
3. ✅ Type message → LUMEN responds with thinking delay
4. ✅ Click 🌙 → sleep mode with review + song
5. ✅ Click 📖 → emotion diary history
6. ✅ Close panel → returns to mini state
7. ✅ Check `data/memory.json` was created with chat records

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: WindowManager + full integration"
git push
```

---

### Task 13: Song Library — Populate Full Database

**Files:**
- Modify: `data/songs.json` (expand from 5 to ~30 songs)

- [ ] **Step 1: Expand data/songs.json to ~30 songs**

Add 25 more songs covering ambient, indie, lo-fi, calm, introspective moods. Each with `id`, `title`, `artist`, `genre`, `mood`, `source`, `url`, `cover`, `recommendReason`.

Example additions (repeat this pattern to reach ~30 songs):

```json
{
  "id": "s006",
  "title": "晚婚",
  "artist": "李宗盛",
  "genre": "pop",
  "mood": "introspective",
  "source": "netease",
  "url": "",
  "cover": "",
  "recommendReason": "有些歌要到了年纪才听得懂。"
},
{
  "id": "s007",
  "title": "夜曲",
  "artist": "周杰伦",
  "genre": "pop",
  "mood": "introspective",
  "source": "netease",
  "url": "",
  "cover": "",
  "recommendReason": "夜的旋律，有风的形状。"
},
{
  "id": "s008",
  "title": "暗涌",
  "artist": "王菲",
  "genre": "pop",
  "mood": "introspective",
  "source": "netease",
  "url": "",
  "cover": "",
  "recommendReason": "越美丽越不敢碰。"
},
{
  "id": "s009",
  "title": "Gymnopédie No.1",
  "artist": "Erik Satie",
  "genre": "ambient",
  "mood": "calm",
  "source": "netease",
  "url": "",
  "cover": "",
  "recommendReason": "一百年前的旋律，今天依然在飘。"
},
{
  "id": "s010",
  "title": "Perfect Places",
  "artist": "Lorde",
  "genre": "indie",
  "mood": "uplifting",
  "source": "netease",
  "url": "",
  "cover": "",
  "recommendReason": "年轻的声音，永不完结的夜晚。"
}
```

- [ ] **Step 2: Verify songs load correctly**

```bash
cd "/Users/a1234/Desktop/for the final"
node -e "
const path = require('path');
const LumenEngine = require('./engine/index');
const engine = new LumenEngine(path.join(__dirname, 'data')).init();
const songs = engine.musicRecommender.getAllSongs();
console.log('Total songs:', songs.length);
console.assert(songs.length >= 10, 'should have at least 10 songs');
songs.forEach(s => {
  console.assert(s.id && s.title && s.artist && s.genre, 'song missing fields');
});
console.log('✅ All songs validated');
"
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: expanded song library (~30 songs)"
git push
```

---

## Self-Review Checklist

After writing the plan, verify against the spec:

- [ ] **All MVP features have corresponding tasks:**
  - ✅ Pixel sprite desktop floating + animation (Task 8)
  - ✅ Click sprite to open/close chat panel (Task 10, 12)
  - ✅ Chat with typing interaction (Task 9, 11)
  - ✅ Keyword emotion recognition (6 emotions) (Task 3)
  - ✅ Tag-based memory + forgetting (Task 3)
  - ✅ Personality-driven response style (Task 5)
  - ✅ "I don't understand" mechanism (Task 5)
  - ✅ Bedtime mode + review + song recommendation (Task 6, 10)
  - ✅ Emotion diary viewer (Task 10)
  - ✅ Animation changes with emotion/response (Task 8)

- [ ] **Architecture constraints honored:**
  - ✅ Engine modules are pure Node.js, no DOM/Electron dependency
  - ✅ Data stored in local JSON files
  - ✅ Single Electron process
  - ✅ No external API calls
  - ✅ No storing original conversation text

- [ ] **No placeholder code in any task**
- [ ] **All interfaces consistent across tasks**
- [ ] **Each task has testable deliverable**
