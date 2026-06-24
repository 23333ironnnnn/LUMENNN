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
  rememberUser(emotion, userInput, tags) {
    const forgetRate = this.characterConfig.getMemoryStyle().forget_rate || 0;
    if (Math.random() < forgetRate) return;

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
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save memory:', err.message);
    }
  }
}

module.exports = EmotionManager;
