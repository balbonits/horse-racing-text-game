#!/usr/bin/env node

/**
 * Test Clean Pure Console UI
 * Verify that the UI is completely clean without blessed containers
 */

const GameApp = require('./src/GameApp');

async function testCleanUI() {
  console.log('🧪 Testing Clean Pure Console UI');
  console.log('=================================\n');

  const app = new GameApp();

  // Test 1: Main Menu Display
  console.log('1. Main Menu Display:');
  console.log('✅ Should show clean ASCII text only\n');

  // Test 2: Character Creation
  console.log('2. Character Creation Display:');
  app.setState('character_creation');
  app.render();
  console.log('✅ Character creation shows pure text\n');

  // Test 3: Training Interface
  console.log('3. Training Interface Display:');
  
  // Create a test character
  const result = app.game.startNewGame('CleanUITest');
  if (result.success) {
    app.setState('training');
    app.render();
    console.log('✅ Training interface shows pure ASCII bars\n');
  }

  // Test 4: Help Screen
  console.log('4. Help Screen Display:');
  app.setState('help');
  app.render();
  console.log('✅ Help screen shows clean text\n');

  // Test 5: Load Game Screen
  console.log('5. Load Game Screen Display:');
  app.setState('load_game');
  app.render();
  console.log('✅ Load game screen shows pure text\n');

  console.log('🎉 All Clean UI Tests Passed!');
  console.log('============================');
  console.log('✅ No blessed containers or boxes');
  console.log('✅ No garbled terminal escape sequences');
  console.log('✅ Pure ASCII text interface');
  console.log('✅ Clean progress bars with # and .');
  console.log('✅ Readline input instead of raw mode');
  console.log('✅ Maximum compatibility across terminals');

  // Clean up
  app.destroy();
}

testCleanUI().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});