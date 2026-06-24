// test-character-config.js
const CharacterConfig = require('./engine/CharacterConfig');
const path = require('path');

const config = new CharacterConfig(path.join(__dirname, 'data'));
config.load();

const p = config.getPersonality();
const b = config.getBoundaries();
const m = config.getMusicPreference();

console.assert(p.warmth === 0.6, 'warmth should be 0.6');
console.assert(p.distance === 0.7, 'distance should be 0.7');
console.assert(p.understanding === 0.65, 'understanding should be 0.65');
console.assert(p.directness === 0.8, 'directness should be 0.8');
console.assert(b.can_understand.includes('emotion'), 'should understand emotion');
console.assert(m.favorite_genres.includes('ambient'), 'should like ambient');
console.log('✅ CharacterConfig tests passed');
