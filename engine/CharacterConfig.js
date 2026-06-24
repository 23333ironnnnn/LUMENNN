const fs = require('fs');
const path = require('path');

class CharacterConfig {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.character = null;
  }

  load() {
    const filePath = path.join(this.dataDir, 'character.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    this.character = JSON.parse(raw);
    return this;
  }

  get() {
    if (!this.character) this.load();
    return this.character;
  }

  getPersonality() {
    return this.get().personality;
  }

  getBoundaries() {
    return this.get().boundaries;
  }

  getMusicPreference() {
    return this.get().music_preference;
  }

  getMemoryStyle() {
    return this.get().memory_style;
  }

  getCommunicationStyle() {
    return this.get().communication_style;
  }
}

module.exports = CharacterConfig;
