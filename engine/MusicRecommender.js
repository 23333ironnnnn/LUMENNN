const fs = require('fs');
const path = require('path');

const EMOTION_MOOD_MAP = {
  tired: ['calm', 'slow'],
  sad: ['ambient', 'introspective'],
  happy: ['uplifting', 'bright'],
  angry: ['calm', 'introspective'],
  anxious: ['calm', 'ambient'],
  confused: ['ambient', 'introspective'],
  neutral: ['calm', 'ambient', 'introspective', 'uplifting'],
};

class MusicRecommender {
  constructor(characterConfig, dataDir) {
    this.characterConfig = characterConfig;
    this.dataDir = dataDir;
    this.songs = [];
    this.loadSongs();
  }

  loadSongs() {
    const filePath = path.join(this.dataDir, 'songs.json');
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      this.songs = JSON.parse(raw);
    } catch {
      this.songs = [];
    }
  }

  // Recommend a song — based on LUMEN's taste first, user emotion second
  recommendSongForSleep(emotion) {
    if (this.songs.length === 0) return null;

    const preferences = this.characterConfig.getMusicPreference();
    const preferredGenres = preferences.favorite_genres;
    const preferredMoods = EMOTION_MOOD_MAP[emotion] || ['calm'];

    // Filter by LUMEN's preferred genres
    let candidates = this.songs.filter(song =>
      preferredGenres.includes(song.genre)
    );

    // If multiple matches, also match by emotion-related mood
    if (candidates.length > 1) {
      candidates = candidates.filter(song =>
        preferredMoods.includes(song.mood)
      );
    }

    // If nothing matches, fallback to all songs
    if (candidates.length === 0) candidates = [...this.songs];

    // Random selection (not "best" — LUMEN's taste is not algorithmic)
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  getAllSongs() {
    return this.songs;
  }

  reload() {
    this.loadSongs();
  }
}

module.exports = MusicRecommender;
