const path = require('path');
const CharacterConfig = require('./CharacterConfig');
const EmotionManager = require('./EmotionManager');
const ResponseGenerator = require('./ResponseGenerator');
const MusicRecommender = require('./MusicRecommender');
const SleepSummary = require('./SleepSummary');
const LumenAI = require('./LumenAI');

// Growth thresholds
const GROWTH_STAGE_2 = 10;
const GROWTH_STAGE_3 = 30;

class LumenEngine {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.characterConfig = null;
    this.emotionManager = null;
    this.responseGenerator = null;
    this.musicRecommender = null;
    this.sleepSummary = null;
    this.lumenAI = null;
  }

  init() {
    this.characterConfig = new CharacterConfig(this.dataDir).load();
    this.emotionManager = new EmotionManager(this.characterConfig, this.dataDir);
    this.lumenAI = new LumenAI();
    this.responseGenerator = new ResponseGenerator(this.characterConfig, this.lumenAI);
    this.musicRecommender = new MusicRecommender(this.characterConfig, this.dataDir);
    this.sleepSummary = new SleepSummary(
      this.characterConfig,
      this.emotionManager,
      this.musicRecommender
    );
    return this;
  }

  getGrowthLevel() {
    const total = this.emotionManager.getTotalConversations();
    if (total >= GROWTH_STAGE_3) return 3;
    if (total >= GROWTH_STAGE_2) return 2;
    return 1;
  }

  // Handle user chat input — now async!
  async handleChat(userInput) {
    const emotion = this.emotionManager.identifyEmotion(userInput);
    const growthLevel = this.getGrowthLevel();
    const response = await this.responseGenerator.generateChatResponse(userInput, emotion, growthLevel);
    const tags = this.emotionManager.extractTags(emotion, userInput);
    this.emotionManager.rememberUser(emotion, userInput, tags, response.shouldRemember);

    return {
      text: response.text,
      animation: response.animation,
      emotion,
    };
  }

  handleSleep() {
    const conversations = this.emotionManager.getTodayConversations();
    return this.sleepSummary.generateSleepSummary(conversations);
  }

  getDiary() {
    return this.emotionManager.getAllMemory();
  }

  getStatus() {
    return {
      character: this.characterConfig.get().name,
      userTagCount: Object.keys(this.emotionManager.getUserProfile()).length,
    };
  }
}

module.exports = LumenEngine;
