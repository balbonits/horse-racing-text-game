#!/usr/bin/env node

/**
 * Debug script to check tutorial character initialization
 */

const GameApp = require('../src/GameApp');

async function debugTutorialCharacter() {
  console.log('=== TUTORIAL CHARACTER DEBUG ===\n');
  
  try {
    const gameApp = new GameApp();
    
    console.log('1. Initial state:', gameApp.stateMachine.getCurrentState());
    console.log('2. Tutorial character before start:', gameApp.tutorialManager.tutorialCharacter);
    console.log('3. Tutorial active before start:', gameApp.tutorialManager.isTutorialActive());
    console.log('');
    
    // Transition to tutorial state
    console.log('Transitioning to tutorial state...');
    gameApp.stateMachine.transitionTo('tutorial');
    gameApp.tutorialManager.startTutorial();
    
    console.log('4. State after tutorial start:', gameApp.stateMachine.getCurrentState());
    console.log('5. Tutorial character after start:', gameApp.tutorialManager.tutorialCharacter?.name);
    console.log('6. Tutorial active after start:', gameApp.tutorialManager.isTutorialActive());
    console.log('');
    
    // Transition to tutorial_training
    console.log('Transitioning to tutorial_training...');
    gameApp.stateMachine.transitionTo('tutorial_training');
    
    console.log('7. State after tutorial_training:', gameApp.stateMachine.getCurrentState());
    console.log('8. Tutorial character in training:', gameApp.tutorialManager.tutorialCharacter?.name);
    console.log('9. Character stats:', gameApp.tutorialManager.tutorialCharacter?.stats);
    console.log('10. Character energy:', gameApp.tutorialManager.tutorialCharacter?.energy);
    
    console.log('\n=== ATTEMPTING RENDER ===');
    gameApp.render();
    
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  }
}

debugTutorialCharacter();