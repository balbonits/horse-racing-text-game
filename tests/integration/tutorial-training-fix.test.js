/**
 * Tutorial Training Fix Tests
 * 
 * Tests to verify the fix for the "Cannot train at this time" flash error
 * in tutorial training mode.
 */

const GameApp = require('../../src/GameApp');

describe('Tutorial Training Fix', () => {
  let gameApp;
  let consoleOutput;
  let consoleErrors;
  let originalConsoleLog;
  let originalConsoleError;
  
  beforeEach(() => {
    // Mock console methods to capture flash errors
    consoleOutput = [];
    consoleErrors = [];
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    console.error = (...args) => {
      consoleErrors.push(args.join(' '));
    };
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clean up
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Tutorial training state validation', () => {
    test('should identify gameState mismatch in tutorial', () => {
      // Navigate to tutorial training
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // Check the game state vs state machine state
      console.log('StateMachine state:', gameApp.currentState);
      console.log('Game.gameState:', gameApp.game.gameState);
      console.log('Tutorial character:', !!gameApp.tutorialManager.tutorialCharacter);
      
      // The issue: game.gameState is not 'training' but state machine is in 'tutorial_training'
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // This is likely the problem - gameState should be 'training' for training to work
      if (gameApp.game.gameState !== 'training') {
        console.error(`ISSUE IDENTIFIED: game.gameState is "${gameApp.game.gameState}", should be "training"`);
      }
    });

    test('should reproduce the "Cannot train at this time" error', () => {
      // Set up tutorial training
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Clear previous output
      consoleOutput.length = 0;
      consoleErrors.length = 0;
      
      // Try speed training (input "1")
      gameApp.handleKeyInput('1');
      
      // Check if we get the flash error
      const allOutput = consoleOutput.join('\n');
      const allErrors = consoleErrors.join('\n');
      
      console.log('Output after training input:', allOutput);
      console.log('Errors after training input:', allErrors);
      
      // This should capture the flash error
      const hasFlashError = allOutput.includes('Cannot train at this time') || 
                           allErrors.includes('Cannot train at this time');
      
      if (hasFlashError) {
        console.error('FLASH ERROR REPRODUCED: "Cannot train at this time" found in output');
      }
      
      // For now, document the issue
      expect(hasFlashError).toBe(false);
    });
  });

  describe('Training validation in tutorial context', () => {
    test('should check tutorial training prerequisites', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Check what's needed for training to work
      const game = gameApp.game;
      const character = game.character;
      const gameState = game.gameState;
      
      console.log('Training prerequisites check:');
      console.log('- Character exists:', !!character);
      console.log('- Game state:', gameState);
      console.log('- Expected state for training:', 'training');
      console.log('- States match:', gameState === 'training');
      
      // The training validation expects gameState === 'training'
      if (gameState !== 'training') {
        console.error(`PROBLEM: gameState is "${gameState}", performTrainingSync expects "training"`);
      }
      
      expect(character).toBeDefined();
      // This assertion will likely fail and show us the problem
      expect(gameState).toBe('training');
    });

    test('should verify tutorial character is available for training', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Check tutorial-specific setup
      const tutorialCharacter = gameApp.tutorialManager.tutorialCharacter;
      const gameCharacter = gameApp.game.character;
      
      console.log('Character setup check:');
      console.log('- Tutorial character exists:', !!tutorialCharacter);
      console.log('- Game character exists:', !!gameCharacter);
      console.log('- Characters are same:', tutorialCharacter === gameCharacter);
      
      expect(tutorialCharacter).toBeDefined();
      expect(gameCharacter).toBeDefined();
      // They should be the same character
      expect(tutorialCharacter).toBe(gameCharacter);
    });
  });

  describe('State machine action handling', () => {
    test('should trace tutorial training input flow', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Clear output to focus on the specific input handling
      consoleOutput.length = 0;
      consoleErrors.length = 0;
      
      // Test the state machine input handling directly
      const stateMachineResult = gameApp.stateMachine.handleInput('1');
      
      console.log('StateMachine result for "1":', stateMachineResult);
      
      if (!stateMachineResult.success) {
        console.error('StateMachine rejected input "1":', stateMachineResult.error);
      } else {
        console.log('StateMachine accepted "1", action:', stateMachineResult.action);
      }
      
      // Check if the action leads to training
      const allOutput = consoleOutput.join('\n');
      console.log('Output after StateMachine handling:', allOutput);
      
      expect(stateMachineResult.success).toBe(true);
    });
  });
});