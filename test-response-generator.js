const CharacterConfig = require('./engine/CharacterConfig');
const ResponseGenerator = require('./engine/ResponseGenerator');
const LumenAI = require('./engine/LumenAI');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const ai = new LumenAI();
const rg = new ResponseGenerator(config, ai);

(async () => {
  // Test Stage 1 AI responses
  const r1 = await rg.generateChatResponse('你好', 'neutral', 1);
  console.assert(r1.text && r1.text.length > 0, 'stage 1 should respond');
  console.assert(r1.animation, 'stage 1 should have animation');
  console.assert(typeof r1.shouldRemember === 'boolean', 'shouldRemember boolean');
  console.log('Stage 1:', r1.text.slice(0, 60) + '…', `[${r1.animation}]`);

  // Test Stage 2
  const r2 = await rg.generateChatResponse('今天好累', 'tired', 2);
  console.assert(r2.text, 'stage 2 should respond');
  console.log('Stage 2:', r2.text.slice(0, 60) + '…');

  // Test Stage 3
  const r3 = await rg.generateChatResponse('好开心', 'happy', 3);
  console.assert(r3.text, 'stage 3 should respond');
  console.log('Stage 3:', r3.text.slice(0, 60) + '…');

  // Test all emotions
  const emotions = ['tired', 'happy', 'sad', 'angry', 'confused', 'anxious', 'neutral'];
  for (const em of emotions) {
    const r = await rg.generateChatResponse('test', em, 1);
    console.assert(r.text && r.text.length > 0, `${em} should respond`);
  }

  // Test animation selection
  console.assert(rg.selectAnimation('happy', 1) === 'idle', 'stage 1 happy -> idle');
  console.assert(rg.selectAnimation('happy', 3) === 'slight_glow', 'stage 3 happy -> glow');

  console.log('✅ ResponseGenerator AI tests passed');
})().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
