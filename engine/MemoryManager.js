/**
 * MemoryManager - LUMEN记忆管理系统
 * 管理长期记忆、短期记忆、用户标签、成长数据
 */

const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '..', 'data', 'memory.json');

class MemoryManager {
  constructor() {
    this.memory = this.loadMemory();
  }

  // 加载记忆文件
  loadMemory() {
    try {
      if (fs.existsSync(MEMORY_FILE)) {
        const data = fs.readFileSync(MEMORY_FILE, 'utf-8');
        const memory = JSON.parse(data);

        // 确保所有必需字段存在（向后兼容）
        if (!memory.growth) {
          memory.growth = {
            level: 1,
            stage: 'newborn',
            totalConversations: 0,
            lastLevelUpDate: new Date().toISOString().split('T')[0]
          };
        }
        if (!memory.shortTermMemory) {
          memory.shortTermMemory = [];
        }
        if (!memory.principles) {
          memory.principles = {
            likes: [],
            dislikes: [],
            boundaries: []
          };
        }
        if (!memory.userTags) {
          memory.userTags = {};
        }
        if (!memory.days) {
          memory.days = [];
        }
        if (!memory.currentDate) {
          memory.currentDate = new Date().toISOString().split('T')[0];
        }

        // 保存修复后的记忆
        this.memory = memory;
        this.saveMemory();
        return memory;
      }
    } catch (error) {
      console.error('[MemoryManager] 加载记忆失败:', error);
    }

    // 默认记忆结构
    return {
      growth: {
        level: 1,
        stage: 'newborn',
        totalConversations: 0,
        lastLevelUpDate: new Date().toISOString().split('T')[0]
      },
      shortTermMemory: [],
      principles: {
        likes: [],
        dislikes: [],
        boundaries: []
      },
      userTags: {},
      days: [],
      currentDate: new Date().toISOString().split('T')[0]
    };
  }

  // 保存记忆
  saveMemory() {
    try {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error('[MemoryManager] 保存记忆失败:', error);
    }
  }

  // === 成长系统 ===

  // 获取成长数据
  getGrowth() {
    return this.memory.growth;
  }

  // 更新成长阶段
  updateGrowth(stage, level) {
    this.memory.growth.stage = stage;
    this.memory.growth.level = level;
    this.memory.growth.lastLevelUpDate = new Date().toISOString().split('T')[0];
    this.saveMemory();
  }

  // 增加对话次数
  incrementConversations() {
    this.memory.growth.totalConversations++;
    this.saveMemory();
    return this.memory.growth.totalConversations;
  }

  // === 短期记忆（最近10条对话）===

  // 添加短期记忆
  addShortTermMemory(userInput, lumenResponse, emotion) {
    const memory = {
      timestamp: Date.now(),
      user: userInput,
      lumen: lumenResponse,
      emotion: emotion,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    this.memory.shortTermMemory.push(memory);

    // 只保留最近10条
    if (this.memory.shortTermMemory.length > 10) {
      this.memory.shortTermMemory.shift();
    }

    this.saveMemory();
  }

  // 获取短期记忆
  getShortTermMemory() {
    return this.memory.shortTermMemory;
  }

  // 获取最近N条记忆的摘要（用于AI上下文）
  getRecentMemorySummary(count = 5) {
    const recent = this.memory.shortTermMemory.slice(-count);
    if (recent.length === 0) return '';

    return recent.map(m => `用户: ${m.user}\nLUMEN: ${m.lumen}`).join('\n');
  }

  // 清空短期记忆
  clearShortTermMemory() {
    this.memory.shortTermMemory = [];
    this.saveMemory();
  }

  // === 个性和原则 ===

  // 添加喜好
  addLike(thing) {
    if (!this.memory.principles.likes.includes(thing)) {
      this.memory.principles.likes.push(thing);
      this.saveMemory();
    }
  }

  // 添加厌恶
  addDislike(thing) {
    if (!this.memory.principles.dislikes.includes(thing)) {
      this.memory.principles.dislikes.push(thing);
      this.saveMemory();
    }
  }

  // 添加边界/原则
  addBoundary(boundary) {
    if (!this.memory.principles.boundaries.includes(boundary)) {
      this.memory.principles.boundaries.push(boundary);
      this.saveMemory();
    }
  }

  // 获取原则
  getPrinciples() {
    return this.memory.principles;
  }

  // === 用户标签 ===

  // 添加或更新标签
  addTag(tag) {
    if (!this.memory.userTags[tag]) {
      this.memory.userTags[tag] = 1;
    } else {
      this.memory.userTags[tag]++;
    }
    this.saveMemory();
  }

  // 获取所有标签
  getTags() {
    return this.memory.userTags;
  }

  // === 长期记忆（日记）===

  // 记录对话到今天的日记
  recordConversation(emotion, tags = [], summary = '日常聊天') {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    // 找到或创建今天的记录
    let dayRecord = this.memory.days.find(d => d.date === today);
    if (!dayRecord) {
      dayRecord = {
        date: today,
        mainEmotion: emotion,
        conversations: []
      };
      this.memory.days.push(dayRecord);
    }

    // 添加对话记录
    dayRecord.conversations.push({
      time,
      emotion,
      tags,
      summary
    });

    // 更新主情绪（最常见的情绪）
    const emotions = dayRecord.conversations.map(c => c.emotion);
    const emotionCounts = {};
    emotions.forEach(e => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
    dayRecord.mainEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    this.memory.currentDate = today;
    this.saveMemory();
  }

  // 获取日记
  getDiary() {
    return {
      days: this.memory.days,
      userTags: this.memory.userTags
    };
  }

  // === 调试 ===

  // 重置所有记忆（慎用）
  resetAll() {
    this.memory = {
      growth: {
        level: 1,
        stage: 'newborn',
        totalConversations: 0,
        lastLevelUpDate: new Date().toISOString().split('T')[0]
      },
      shortTermMemory: [],
      principles: {
        likes: [],
        dislikes: [],
        boundaries: []
      },
      userTags: {},
      days: [],
      currentDate: new Date().toISOString().split('T')[0]
    };
    this.saveMemory();
  }
}

module.exports = MemoryManager;
