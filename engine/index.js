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
