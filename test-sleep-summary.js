const CharacterConfig = require('./engine/CharacterConfig');
const EmotionManager = require('./engine/EmotionManager');
const MusicRecommender = require('./engine/MusicRecommender');
const SleepSummary = require('./engine/SleepSummary');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const em = new EmotionManager(config, dataDir);
const mr = new MusicRecommender(config, dataDir);
const ss = new SleepSummary(config, em, mr);

// Test with mock conversations
const conversations = [
  { emotion: 'tired', tags: ['often_tired'], summary: '感到疲倦' },
  { emotion: 'tired', tags: ['often_tired'], summary: '感到疲倦' },
  { emotion: 'neutral', tags: [], summary: '日常聊天' },
];

const result = ss.generateSleepSummary(conversations);
console.assert(result.summaryText && result.summaryText.length > 0, 'should have summary');
console.assert(result.mainEmotion === 'tired', 'main emotion should be tired');
console.assert(result.song !== null, 'should recommend a song');
console.log('Summary:', result.summaryText);
console.log('Song:', result.song.title);

// Test with empty conversations
const emptyResult = ss.generateSleepSummary([]);
console.assert(emptyResult.mainEmotion === 'neutral', 'empty should be neutral');
console.assert(emptyResult.song !== null, 'empty should still get a song');

// Test identifyMainEmotion directly
console.assert(ss.identifyMainEmotion([]) === 'neutral', 'empty -> neutral');
console.assert(ss.identifyMainEmotion([{ emotion: 'happy' }]) === 'happy', 'single -> happy');

console.log('✅ SleepSummary tests passed');
