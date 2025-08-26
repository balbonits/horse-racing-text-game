#!/usr/bin/env node

/**
 * Test Input Simulator Issues
 * Replicate the exact flow that's failing in integration tests
 */

const InputSimulator = require('./tests/utils/input-simulator');
const GameApp = require('./src/GameApp');

async function testInputSimulator() {
  console.log('🔧 Input Simulator Test');
  console.log('=======================\n');

  // Create GameApp and InputSimulator
  const app = new GameApp();
  const simulator = new InputSimulator(app);
  
  console.log('📍 Initial state:', app.currentState);
  console.log('🎮 Game character exists (initial):', !!app.game?.character);
  
  // Test the exact flow used in fullGamePlaythrough
  console.log('\n🎯 Step 1: Create character using simulator');
  
  const characterName = 'SimTestHorse';
  const creationResult = await simulator.createCharacterFlow(characterName);
  
  console.log('🔍 Creation result:', JSON.stringify(creationResult));
  console.log('📍 State after creation:', app.currentState);
  console.log('🎮 Game character exists (after creation):', !!app.game?.character);
  
  if (app.game?.character) {
    console.log('🐎 Character details:');
    console.log('  Name:', app.game.character.name);
    console.log('  Stats:', app.game.character.getCurrentStats());
    console.log('  Energy:', app.game.character.condition?.energy);
  } else {
    console.log('❌ No character found in app.game');
    console.log('🔍 app.game object:', JSON.stringify(app.game, null, 2));
  }
  
  // Test full playthrough method
  console.log('\n🎯 Step 2: Test full playthrough method');
  
  const app2 = new GameApp();
  const simulator2 = new InputSimulator(app2);
  
  const trainingSequence = ['speed', 'stamina', 'power', 'rest'];
  const playthrough = await simulator2.fullGamePlaythrough('FullTestHorse', trainingSequence);
  
  console.log('🔍 Playthrough result:');
  console.log('  Success:', playthrough.success);
  console.log('  Final state:', playthrough.finalState);
  console.log('  Character exists:', !!playthrough.character);
  console.log('  Steps:', playthrough.steps.length);
  
  if (playthrough.character) {
    console.log('  Character name:', playthrough.character.name);
    console.log('✅ Full playthrough successful!');
    return true;
  } else {
    console.log('❌ Full playthrough failed - no character');
    console.log('🔍 Error:', playthrough.error);
    console.log('🔍 Steps details:', JSON.stringify(playthrough.steps, null, 2));
    return false;
  }
}

// Run the test
testInputSimulator()
  .then(success => {
    console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test crashed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });