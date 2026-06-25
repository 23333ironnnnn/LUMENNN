const CharacterConfig = require('./engine/CharacterConfig');
const ResponseGenerator = require('./engine/ResponseGenerator');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const rg = new ResponseGenerator(config);

// Test Stage 1 (初生): newborn spirit, curious and strange but conversational
for (let i = 0; i < 20; i++) {
  const r = rg.generateChatResponse('今天好累啊', 'tired', 1);
  console.assert(r.text && r.text.length > 0, 'stage 1 should have text');
  console.assert(r.text.length > 8, `stage 1 should be sentences now, got "${r.text}"`);
  console.assert(r.animation, 'stage 1 should have animation');
  console.assert(typeof r.shouldRemember === 'boolean', 'shouldRemember should be boolean');
}
console.log('Stage 1 (初生) responses: sentences with curiosity, not baby babble');

// Test Stage 2 (认识): understanding more
for (let i = 0; i < 20; i++) {
  const r = rg.generateChatResponse('今天好累啊', 'tired', 2);
  console.assert(r.text && r.text.length > 0, 'stage 2 should have text');
}
console.log('Stage 2 (认识) responses: gentle, understanding more');

// Test Stage 3 (理解): full personality-driven
const r3 = rg.generateChatResponse('今天好累啊', 'tired', 3);
console.assert(r3.text && r3.text.length > 0, 'stage 3 should have text');
console.assert(r3.animation, 'stage 3 should have animation');
console.log('Stage 3 response:', r3.text, `[${r3.animation}]`);

// Test all emotions for stage 3
const emotions = ['tired', 'happy', 'sad', 'angry', 'confused', 'anxious', 'neutral'];
emotions.forEach(em => {
  const r = rg.generateChatResponse('test', em, 3);
  console.assert(r.text && r.text.length > 0, `stage 3 ${em} should respond`);
  console.assert(r.animation, `stage 3 ${em} should have animation`);
});

// Test animation selection
console.assert(typeof rg.selectAnimation('happy', 1) === 'string', 'stage 1 animation should be string');
console.assert(rg.selectAnimation('happy', 3) === 'slight_glow', 'happy stage 3 -> glow');
console.assert(rg.selectAnimation('neutral', 3) === 'idle', 'neutral stage 3 -> idle');

console.log('✅ ResponseGenerator growth tests passed');
