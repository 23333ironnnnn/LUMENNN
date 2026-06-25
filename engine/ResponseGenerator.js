class ResponseGenerator {
  constructor(characterConfig) {
    this.characterConfig = characterConfig;
  }

  // Main entry: generate a chat response
  // growthLevel: 1 (初生) / 2 (认识) / 3 (理解)
  generateChatResponse(userInput, emotion, growthLevel = 3) {
    const personality = this.characterConfig.getPersonality();
    const commStyle = this.characterConfig.getCommunicationStyle();
    const memoryStyle = this.characterConfig.getMemoryStyle();

    // LUMEN always responds — no random "don't understand"
    const shouldRemember = Math.random() > memoryStyle.forget_rate;

    const text = this.buildResponse(emotion, growthLevel, personality, commStyle);
    const animation = this.selectAnimation(emotion, growthLevel);

    return { text, animation, shouldRemember };
  }

  // --- Stage-based response building ---

  buildResponse(emotion, growthLevel, personality, commStyle) {
    if (growthLevel <= 1) {
      return this.buildStage1Response(emotion);
    }
    if (growthLevel === 2) {
      return this.buildStage2Response(emotion, personality, commStyle);
    }
    return this.buildStage3Response(emotion, personality, commStyle);
  }

  // Stage 1: 初生 (0-9 conversations) — very short, baby-like
  buildStage1Response(emotion) {
    const templates = {
      tired: ['累。', '困了。', '休息……', 'zzz'],
      happy: ['好。', '开心。', '嗯！', '……好。'],
      sad: ['难过。', '……我在。', '……嗯。'],
      angry: ['……。', '嗯。', '……'],
      confused: ['……？', '不懂。', '？'],
      anxious: ['别怕。', '我在。', '……'],
      neutral: ['嗯。', '我在。', '好。', '……嗯。'],
    };
    const list = templates[emotion] || templates.neutral;
    return list[Math.floor(Math.random() * list.length)];
  }

  // Stage 2: 认识 (10-29 conversations) — short sentences, learning
  buildStage2Response(emotion, personality, commStyle) {
    const templates = {
      tired: ['你累了。', '听出来了，你累了。', '你的声音有些疲倦。', '困了就去睡吧。'],
      happy: ['你今天好像很开心。', '感觉到了。', '你高兴的时候，信号会变强。', '开心就好。'],
      sad: ['你有点难过。', '我在这里呢。', '你的情绪我收到了。', '别难过……虽然我不太懂。'],
      angry: ['你好像有点生气。', '别气。', '消消气。', '生气对信号不好。'],
      confused: ['不太明白你说的。', '你说的我不太懂，不过我在。', '能再说一次吗？'],
      anxious: ['别担心。', '没事的。', '我在这里。', '放松。'],
      neutral: ['我听着。', '继续。', '嗯。', '我在。你说。'],
    };
    const list = templates[emotion] || templates.neutral;
    return list[Math.floor(Math.random() * list.length)];
  }

  // Stage 3: 理解 (30+ conversations) — full personality-driven
  buildStage3Response(emotion, personality, commStyle) {
    const { warmth, distance } = personality;
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

  // Select animation based on emotion + growth level
  selectAnimation(emotion, growthLevel) {
    // Stage 1: simpler animations
    if (growthLevel <= 1) {
      const simpleMap = {
        tired: 'eyes_half_closed',
        happy: 'idle',
        sad: 'gentle_blink',
        angry: 'idle',
        confused: 'tilt_head',
        anxious: 'idle',
        neutral: 'idle',
      };
      return simpleMap[emotion] || 'idle';
    }

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
