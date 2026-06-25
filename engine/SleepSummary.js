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
