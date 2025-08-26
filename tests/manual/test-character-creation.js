#!/usr/bin/env node

/**
 * Manual Character Creation Test
 * Simulates the exact user input flow to diagnose character creation issues
 */

const GameApp = require('./src/GameApp');

async function testCharacterCreation() {
  console.log('🔧 Manual Character Creation Test');
  console.log('==================================\n');

  // Create GameApp but don't start the blessed screen
  const app = new GameApp();
  app.currentState = 'main_menu';
  
  console.log('📍 Initial state:', app.currentState);
  console.log('🎮 Game object exists:', !!app.game);
  console.log('🖥️ UI object exists:', !!app.ui);
  console.log('📝 Character name buffer:', JSON.stringify(app.characterNameBuffer));
  
  // Step 1: Navigate to character creation
  console.log('\n🎯 Step 1: Navigate to character creation');
  const menuResult = app.handleMainMenuInput('1');
  console.log('🔍 Menu result:', JSON.stringify(menuResult));
  console.log('📍 New state:', app.currentState);
  
  if (app.currentState !== 'character_creation') {
    console.log('❌ Failed to navigate to character creation');
    return false;
  }
  
  // Step 2: Type character name letter by letter
  console.log('\n🎯 Step 2: Type character name');
  const testName = 'TestHorse';
  for (let i = 0; i < testName.length; i++) {
    const char = testName[i];
    console.log(`🔤 Typing "${char}"...`);
    const inputResult = app.handleCharacterCreationInput(char);
    console.log('🔍 Input result:', JSON.stringify(inputResult));
    console.log('📝 Current buffer:', JSON.stringify(app.characterNameBuffer || ''));
  }
  
  // Step 3: Submit character name
  console.log('\n🎯 Step 3: Submit character name');
  const submitResult = app.handleCharacterCreationInput('enter');
  console.log('🔍 Submit result:', JSON.stringify(submitResult));
  console.log('📍 State after submit:', app.currentState);
  console.log('🐎 Game character exists:', !!app.game?.character);
  
  if (app.game?.character) {
    console.log('🐎 Character details:');
    console.log('  Name:', app.game.character.name);
    console.log('  Stats:', app.game.character.getCurrentStats());
    console.log('  Energy:', app.game.character.condition?.energy);
    console.log('✅ Character creation successful!');
    return true;
  } else {
    console.log('❌ Character creation failed - no character object');
    console.log('🔍 Game state:', app.game ? 'Game exists' : 'No game');
    console.log('🔍 Full app.game object:', JSON.stringify(app.game, null, 2));
    return false;
  }
}

// Run the test
testCharacterCreation()
  .then(success => {
    console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test crashed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });