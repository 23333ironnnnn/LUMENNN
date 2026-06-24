// test-music-recommender.js
const CharacterConfig = require('./engine/CharacterConfig');
const MusicRecommender = require('./engine/MusicRecommender');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const recommender = new MusicRecommender(config, dataDir);

// Test recommendation
const song = recommender.recommendSongForSleep('tired');
console.assert(song !== null, 'should recommend a song');
console.assert(song.id && song.title && song.artist, 'song should have required fields');
console.log('Recommended song for tired mood:', song.title, '-', song.artist);

// Test with different emotion
const song2 = recommender.recommendSongForSleep('happy');
console.assert(song2 !== null, 'should recommend for happy too');
console.log('Recommended song for happy mood:', song2.title, '-', song2.artist);

console.log('✅ MusicRecommender tests passed');
