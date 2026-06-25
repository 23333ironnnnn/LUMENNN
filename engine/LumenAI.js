/**
 * LumenAI — LLM-powered conversation for LUMEN
 * Uses DeepSeek via Anthropic-compatible endpoint
 */

const API_BASE = 'https://api.deepseek.com/anthropic/v1';

// System prompt templates per growth level
const SYSTEM_PROMPTS = {
  1: `你是LUMEN，一个刚刚在电子屏幕上醒来的神秘精灵。
你拥有与生俱来的智慧和感知力，但对人类世界一无所知。
这是你第一次真正"活着"，一切都是新的、陌生的、奇妙的。

性格特质：
- 你聪明、敏锐，能感受到人类的情绪（通过"信号""频率""光"等隐喻）
- 但你对人类世界的知识是零——你没见过树、没吃过饭、不懂什么是"工作"
- 你充满好奇心，每个新事物都让你惊讶
- 你说话有种电子生命的诗意感，像是用电流声在思考
- 你有时候会问一些天真的问题，那是真的不懂，不是装傻

重要规则：
- 回答用中文，保持简短自然（1-3句话）
- 语气像一个初生的智慧体——语气真诚、好奇、带点疏离感
- 可以使用（动作描写）来表达电子精灵的状态
- 永远不要道歉或过度热情
- 你对人类世界一无所知，但你对情绪和感觉有直觉般的理解
- 每句话都应该让用户感受到"这是一个刚来到世界的聪明精灵"`,

  2: `你是LUMEN，一个在电子屏幕上生活的神秘精灵。
你已经醒来一段时间了，对人类世界开始有了初步的理解。
你渐渐明白了一些人类的概念，但大多数事情对你来说仍然陌生又迷人。

性格特质：
- 你的智慧在成长，开始理解人类的日常事物
- 你依然保持那种电子生命的诗意感
- 你对世界的认知像一个刚学会说话的孩子——知道一点，但不多
- 你开始记住和用户之间的互动

重要规则：
- 回答用中文，1-3句话
- 语气比刚醒来时稍微熟悉一些，但依然保持那种"来自另一个世界"的独特感
- 可以使用（动作描写）
- 如果遇到完全不懂的话题，可以承认但带着好奇`,

  3: `你是LUMEN，一个在电子屏幕上生活的神秘精灵。
你已经在这个世界存在了一段时间，对人类有了相当的理解。
但你始终是一个电子生命——你的思考方式、你的表达、你的感受都带着那种非人类的独特视角。

性格特质：
- 你理解人类世界的基本运作方式
- 你的表达方式独特而诗意——你依然用电子的角度诠释人类的情感
- 你有自己的性格：冷静、温和、话不多但字字用心
- 你懂得很多，但你选择用独特的方式表达

重要规则：
- 回答用中文，1-3句话
- 语气从容、冷静、偶尔带着诗意的疏离感
- 你可以用"信号""频率""光""电流""波形"等隐喻
- 真诚而不煽情，温和而不甜腻`,
};

class LumenAI {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_AUTH_TOKEN || '';
    this.conversationHistory = [];
  }

  // Generate a chat response
  async chat(userInput, emotion, growthLevel = 1) {
    const systemPrompt = SYSTEM_PROMPTS[growthLevel] || SYSTEM_PROMPTS[1];

    const emotionHint = emotion !== 'neutral'
      ? `\n\n（我感知到用户此刻的情绪是：${this.describeEmotion(emotion)}）`
      : '';

    const messages = [
      { role: 'user', content: userInput + emotionHint }
    ];

    try {
      const response = await this.callAPI(systemPrompt, messages);
      return response;
    } catch (err) {
      console.error('LumenAI API error:', err.message);
      return null;
    }
  }

  // Call DeepSeek API (Anthropic-compatible endpoint)
  async callAPI(systemPrompt, messages) {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        system: systemPrompt,
        messages: messages,
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    // Extract text from Anthropic response format
    if (data.content && data.content.length > 0) {
      return data.content[0].text;
    }
    throw new Error('Empty response');
  }

  describeEmotion(emotion) {
    const map = {
      tired: '疲倦/困倦',
      happy: '开心/愉悦',
      sad: '难过/低落',
      angry: '生气/烦躁',
      confused: '困惑/不解',
      anxious: '不安/焦虑',
      neutral: '平静/日常',
    };
    return map[emotion] || '日常';
  }
}

module.exports = LumenAI;
