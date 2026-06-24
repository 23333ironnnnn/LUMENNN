// test-emotion-manager.js
const CharacterConfig = require('./engine/CharacterConfig');
const EmotionManager = require('./engine/EmotionManager');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const em = new EmotionManager(config, dataDir);

// Test emotion recognition
console.assert(em.identifyEmotion('今天好累啊') === 'tired', 'should detect tired');
console.assert(em.identifyEmotion('好开心！') === 'happy', 'should detect happy');
console.assert(em.identifyEmotion("我不明白") === 'confused', 'should detect confused');
console.assert(em.identifyEmotion('吃了顿饭') === 'neutral', 'should return neutral');

// Test tags
const tags = em.extractTags('tired', '听首歌放松一下');
console.assert(tags.includes('likes_music'), 'should detect music interest');
console.assert(tags.includes('often_tired'), 'should detect tired tag');

console.log('✅ EmotionManager tests passed');
