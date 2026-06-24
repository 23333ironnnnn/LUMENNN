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
    const { distance } = personality;
    const warmth = personality.warmth;
    const directness = personality.directness;
    const isPoetic = commStyle.poetic;

    const style = this.selectStyle(warmth, distance, isPoetic);
    return this.fillTemplate(style, emotion);
  }

  selectStyle(warmth, distance, isPoetic) {
    if (isPoetic && distance > 0.5) return 'poetic_abstract';
    if (warmth >= 0.7) return 'warm_direct';
    if (distance >= 0.7) return 'cold_distant';
    return 'poetic_abstract';
  }

  fillTemplate(style, emotion) {
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
