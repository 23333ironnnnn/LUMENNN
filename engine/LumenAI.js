/**
 * LumenAI — 简化版 LLM 对话引擎
 * 使用 DeepSeek API
 * 集成成长系统和短期记忆
 */

const https = require('https');
const GrowthSystem = require('./GrowthSystem');
const MemoryManager = require('./MemoryManager');

const API_KEY = 'sk-251eed7bef524ee6bf79d776c86b9d84';
const API_HOST = 'api.deepseek.com';

class LumenAI {
  constructor() {
    this.apiKey = API_KEY;
    this.growthSystem = new GrowthSystem();
    this.memoryManager = new MemoryManager();
  }

  // 生成聊天回复
  async chat(userInput, emotion = 'neutral') {
    try {
      console.log('[LumenAI] 用户输入:', userInput);

      // 获取当前成长状态
      const growth = this.memoryManager.getGrowth();
      const currentStage = this.growthSystem.getCurrentStage(growth.totalConversations);

      // 检查是否需要升级
      if (this.growthSystem.canLevelUp(currentStage, growth.totalConversations)) {
        const levelUpResult = this.growthSystem.levelUp(currentStage);
        if (levelUpResult) {
          this.memoryManager.updateGrowth(levelUpResult.newStage, growth.level + 1);
          console.log('[LumenAI] 升级到:', levelUpResult.newStage);
        }
      }

      // 获取短期记忆
      const recentMemory = this.memoryManager.getRecentMemorySummary(3);

      // 获取原则
      const principles = this.memoryManager.getPrinciples();

      // 生成system prompt
      const systemPrompt = this.getSystemPrompt(currentStage, recentMemory, principles);

      // 调用API
      const response = await this.callAPI(systemPrompt, userInput, emotion);

      // 记录到短期记忆
      this.memoryManager.addShortTermMemory(userInput, response, emotion);

      // 增加对话次数
      this.memoryManager.incrementConversations();

      console.log('[LumenAI] API响应:', response);
      return response;
    } catch (error) {
      console.error('[LumenAI] 错误:', error.message);
      return this.getFallbackResponse();
    }
  }

  // 调用 DeepSeek API
  callAPI(systemPrompt, userMessage, emotion) {
    return new Promise((resolve, reject) => {
      const emotionHint = emotion !== 'neutral' ? `\n[用户情绪: ${emotion}]` : '';

      const requestBody = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage + emotionHint
          }
        ],
        temperature: 0.9,
        max_tokens: 50
      });

      const options = {
        hostname: API_HOST,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.choices && response.choices[0]) {
              resolve(response.choices[0].message.content.trim());
            } else {
              reject(new Error('Invalid API response'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }

  // 获取系统提示词（集成成长系统）
  getSystemPrompt(stage, recentMemory, principles) {
    // 获取阶段的基础prompt
    let basePrompt = this.growthSystem.getStagePrompt(stage);

    // 添加短期记忆上下文
    if (recentMemory) {
      basePrompt += `\n\n最近的对话记忆：\n${recentMemory}`;
    }

    // 添加原则和喜好
    if (principles.likes.length > 0) {
      basePrompt += `\n\n你喜欢: ${principles.likes.join('、')}`;
    }
    if (principles.dislikes.length > 0) {
      basePrompt += `\n\n你不喜欢: ${principles.dislikes.join('、')}`;
    }
    if (principles.boundaries.length > 0) {
      basePrompt += `\n\n你的原则: ${principles.boundaries.join('、')}`;
    }

    return basePrompt;
  }

  // 备用回复
  getFallbackResponse() {
    const responses = [
      '……信号有点弱。',
      '连接不太稳定……',
      '频率断了一下。',
      '……',
      '信号中断了。'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 获取当前成长状态（供UI使用）
  getGrowthStatus() {
    const growth = this.memoryManager.getGrowth();
    const currentStage = this.growthSystem.getCurrentStage(growth.totalConversations);
    const stageInfo = this.growthSystem.getStageInfo(currentStage);

    return {
      stage: currentStage,
      stageName: stageInfo.name,
      level: growth.level,
      totalConversations: growth.totalConversations,
      nextLevelAt: stageInfo.maxConversations + 1,
      progress: (growth.totalConversations - stageInfo.minConversations) /
                (stageInfo.maxConversations - stageInfo.minConversations)
    };
  }
}

module.exports = LumenAI;
