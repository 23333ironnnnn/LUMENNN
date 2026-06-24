// test-character-config.js
const assert = require('assert');
const CharacterConfig = require('./engine/CharacterConfig');
const path = require('path');

const config = new CharacterConfig(path.join(__dirname, 'data'));
config.load();

const p = config.getPersonality();
const b = config.getBoundaries();
const m = config.getMusicPreference();

assert.strictEqual(p.warmth, 0.6, 'warmth should be 0.6');
assert.strictEqual(p.distance, 0.7, 'distance should be 0.7');
assert.strictEqual(p.understanding, 0.65, 'understanding should be 0.65');
assert.strictEqual(p.directness, 0.8, 'directness should be 0.8');
assert.ok(b.can_understand.includes('emotion'), 'should understand emotion');
assert.ok(m.favorite_genres.includes('ambient'), 'should like ambient');
console.log('✅ CharacterConfig tests passed');
