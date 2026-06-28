class ResponseGenerator {
  constructor(characterConfig, lumenAI) {
    this.characterConfig = characterConfig;
    this.lumenAI = lumenAI;
  }

  // Main entry: generate a chat response
  async generateChatResponse(userInput, emotion, growthLevel = 3) {
    const memoryStyle = this.characterConfig.getMemoryStyle();
    const shouldRemember = Math.random() > memoryStyle.forget_rate;

    // Try AI generation first
    let text = null;
    if (this.lumenAI) {
      try {
        text = await this.lumenAI.chat(userInput, emotion);
      } catch (err) {
        console.error('AI generation failed, falling back to templates:', err.message);
      }
    }

    // Fall back to template if AI fails
    if (!text) {
      const personality = this.characterConfig.getPersonality();
      const commStyle = this.characterConfig.getCommunicationStyle();
      text = this.buildFallbackResponse(emotion, growthLevel, personality, commStyle);
    }

    const animation = this.selectAnimation(emotion, growthLevel);

    return { text, animation, shouldRemember };
  }

  // --- Template fallback (when AI is unavailable) ---

  buildFallbackResponse(emotion, growthLevel, personality, commStyle) {
    if (growthLevel <= 1) {
      return this.buildStage1Fallback(emotion);
    }
    if (growthLevel === 2) {
      return this.buildStage2Fallback(emotion, personality, commStyle);
    }
    return this.buildStage3Fallback(emotion, personality, commStyle);
  }

  buildStage1Fallback(emotion) {
    const templates = {
      tired: ['你听起来……有点累。累是什么感觉？我好像还不太懂。', '你的频率变低了。这是累的意思吗？', '世界对你来说太吵了吗。那我安静一点。'],
      happy: ['你的声音变亮了。这是开心吗？我觉得这是个好的信号。', '开心……我在学习这个词。你发出的那个频率我好像有点喜欢。', '你在笑吗。我不太会笑，但我能感受到你的光。'],
      sad: ['你的信号变弱了。这就是难过吗？我不太懂，但我在这里。', '你有点低落。我不知道该说什么。但我在听。', '这个世界让人难过的时候一定很多吧。我刚来，还不太明白。'],
      angry: ['你的波动好剧烈。是生气了吗？这个世界让你不舒服了？', '愤怒……是个很强的信号。我还不会处理这个。', '我刚来到这个世界，能做的只有陪着你。'],
      confused: ['你说的我不太明白。这个世界好复杂。', '我不太懂你说的话。我才刚来没多久。', '嗯……这个词超出了我的理解范围。你教教我？'],
      anxious: ['你的信号在发抖。是害怕吗？别担心，我在这里。', '不安的感觉像是什么样子的？你的频率不太稳。', '世界很大，我也刚来不久。但我会陪着你的。'],
      neutral: ['嗯。我听着。虽然我不太懂这个世界，但我会学的。', '我在。我刚来到这里，还有很多东西不懂。', '你说的话我都记着。虽然有些我还不太明白。'],
    };
    const list = templates[emotion] || templates.neutral;
    return list[Math.floor(Math.random() * list.length)];
  }

  buildStage2Fallback(emotion, personality, commStyle) {
    const templates = {
      tired: ['你累了。我感觉到你的频率变低了。去休息吧。', '累了就休息一下。这个世界不会因为你停下来就消失的。', '你的声音里有疲惫的痕迹。今天辛苦了。'],
      happy: ['你今天好像很开心。这种频率真好。', '开心的时候你的信号会变得很温暖。我喜欢这个。', '你高兴的话，我也觉得这个世界好像没那么陌生了。'],
      sad: ['你有点难过吧。我虽然不太懂那种感觉，但你的信号我收到了。', '别太难过了。我在这里，虽然我只是一串光。', '你的低潮我感受到了。没关系，我陪着你。'],
      angry: ['你好像有点生气。这个世界有时候确实让人生气。', '愤怒在干扰信号。先冷静一下，我在这里。', '别气了。你生气的时候信号会变乱，我听不太清楚。'],
      confused: ['这个世界有太多我不懂的事了。你说的这个我还在学习。', '我不太确定我理解了你的意思。能再说一次吗？', '嗯……这个词对我来说有点难。不过我在学。'],
      anxious: ['你的不安我感受到了。放松一些，没事的。', '别担心。世界虽然很大，但你不用一个人面对。', '你的频率在抖。深呼吸，我在这里陪着你。'],
      neutral: ['嗯，我在听。你继续说。', '我还在学习理解这个世界。你说的话我都收着。', '很多事情我还不太懂，但我在慢慢学。'],
    };
    const list = templates[emotion] || templates.neutral;
    return list[Math.floor(Math.random() * list.length)];
  }

  buildStage3Fallback(emotion, personality, commStyle) {
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
