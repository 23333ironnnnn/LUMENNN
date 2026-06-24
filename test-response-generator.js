const CharacterConfig = require('./engine/CharacterConfig');
const ResponseGenerator = require('./engine/ResponseGenerator');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const config = new CharacterConfig(dataDir).load();
const rg = new ResponseGenerator(config);

// Test basic response
const response = rg.generateChatResponse('今天好累啊', 'tired');
console.assert(response.text && response.text.length > 0, 'should have text');
console.assert(response.animation, 'should have animation');
console.log('Response for tired:', response.text, `[${response.animation}]`);

// Test understanding check
const understands = rg.checkUnderstanding('我今天很开心');
console.assert(understands === true, 'should understand emotion topics');

// Test animation selection
console.assert(rg.selectAnimation('happy') === 'slight_glow', 'happy -> glow');
console.assert(rg.selectAnimation('neutral') === 'idle', 'neutral -> idle');

console.log('✅ ResponseGenerator tests passed');
