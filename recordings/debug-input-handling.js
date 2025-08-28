#!/usr/bin/env node

/**
 * Debug input handling to see exactly what keys are processed
 */

const GameApp = require('../src/GameApp');

function debugInputHandling() {
  console.log('=== INPUT HANDLING DEBUG ===\n');
  
  const gameApp = new GameApp();
  
  // Navigate to tutorial state
  console.log('1. Starting at state:', gameApp.stateMachine.getCurrentState());
  
  // Simulate main menu input "2" to go to tutorial
  console.log('2. Sending "2" for tutorial...');
  let result = gameApp.stateMachine.processGameInput('2');
  console.log('   Result:', result);
  console.log('   New state:', gameApp.stateMachine.getCurrentState());
  console.log('');
  
  // Now we should be in tutorial state, try ENTER to go to tutorial_training
  console.log('3. Current state should be tutorial:', gameApp.stateMachine.getCurrentState());
  console.log('4. Tutorial character exists:', !!gameApp.tutorialManager.tutorialCharacter);
  console.log('');
  
  // Try different representations of ENTER
  const enterVariants = ['', '\n', 'enter', '\r', '\r\n'];
  
  for (const variant of enterVariants) {
    console.log(`5. Trying input "${variant}" (length: ${variant.length})`);
    const result = gameApp.stateMachine.processGameInput(variant);
    console.log(`   Result: success=${result.success}, newState=${gameApp.stateMachine.getCurrentState()}`);
    
    if (result.success && gameApp.stateMachine.getCurrentState() === 'tutorial_training') {
      console.log('   ✅ SUCCESS! Found working input variant');
      break;
    } else if (result.success) {
      console.log(`   ⚠️ State changed but not to tutorial_training: ${gameApp.stateMachine.getCurrentState()}`);
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
    }
    console.log('');
  }
}

debugInputHandling();