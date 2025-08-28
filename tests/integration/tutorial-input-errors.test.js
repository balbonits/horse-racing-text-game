/**
 * Tutorial Input Error Tests
 * 
 * Tests to identify and verify fixes for tutorial input handling issues.
 * Captures error messages that flash quickly during tutorial interaction.
 */

const GameApp = require('../../src/GameApp');

describe('Tutorial Input Error Investigation', () => {
  let gameApp;
  let consoleOutput;
  let consoleErrors;
  let originalConsoleLog;
  let originalConsoleError;
  
  beforeEach(() => {
    // Mock console.log and console.error to capture all output
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
    
    // Clean up game instance
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Tutorial state transitions', () => {
    test('should identify tutorial training state input errors', () => {
      // Navigate to tutorial training state
      gameApp.setState('tutorial');
      expect(gameApp.currentState).toBe('tutorial');
      
      // Transition to tutorial training
      gameApp.handleKeyInput(''); // ENTER to start tutorial
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // Clear previous output to focus on training input errors
      consoleOutput.length = 0;
      consoleErrors.length = 0;
      
      // Try typical training inputs that might cause errors
      const testInputs = ['1', '2', '3', '4', '5', 's', 'q', '', 'invalid'];
      
      testInputs.forEach(input => {
        try {
          gameApp.handleKeyInput(input);
        } catch (error) {
          consoleErrors.push(`Input "${input}" caused error: ${error.message}`);
        }
      });
      
      // Check for any error messages
      const allErrors = consoleErrors.join('\n');
      if (allErrors.length > 0) {
        console.error('TUTORIAL INPUT ERRORS FOUND:', allErrors);
      }
      
      // This test captures errors for investigation
      expect(consoleErrors.length).toBe(0, `Tutorial input errors detected: ${allErrors}`);
    });

    test('should identify tutorial character initialization errors', () => {
      // Check if tutorial character is properly initialized
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Clear output to focus on character-related errors
      consoleErrors.length = 0;
      
      // Check tutorial character state
      const tutorialCharacter = gameApp.tutorialManager.tutorialCharacter;
      
      if (!tutorialCharacter) {
        consoleErrors.push('Tutorial character not initialized');
      } else {
        // Check character properties
        if (!tutorialCharacter.name) {
          consoleErrors.push('Tutorial character missing name');
        }
        if (!tutorialCharacter.stats) {
          consoleErrors.push('Tutorial character missing stats');
        }
        if (tutorialCharacter.energy === undefined) {
          consoleErrors.push('Tutorial character missing energy');
        }
      }
      
      const allErrors = consoleErrors.join('\n');
      expect(consoleErrors.length).toBe(0, `Tutorial character errors: ${allErrors}`);
    });
  });

  describe('Tutorial training input validation', () => {
    test('should capture specific training command errors', () => {
      // Set up tutorial training state
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // Clear output to isolate training errors
      consoleOutput.length = 0;
      consoleErrors.length = 0;
      
      // Test each training option individually
      const trainingInputs = [
        { input: '1', expected: 'Speed Training' },
        { input: '2', expected: 'Stamina Training' },
        { input: '3', expected: 'Power Training' },
        { input: '4', expected: 'Rest Day' },
        { input: '5', expected: 'Media Day' }
      ];
      
      trainingInputs.forEach(({ input, expected }) => {
        console.log(`\n=== Testing input: "${input}" (${expected}) ===`);
        
        try {
          const result = gameApp.handleKeyInput(input);
          console.log(`Result:`, result);
        } catch (error) {
          consoleErrors.push(`Training input "${input}" (${expected}) failed: ${error.message}`);
          console.error(`ERROR with ${input}:`, error);
        }
        
        // Capture any console output
        const recentOutput = consoleOutput.slice(-10).join('\n');
        const recentErrors = consoleErrors.slice(-5).join('\n');
        
        if (recentErrors) {
          console.log(`Errors after ${input}:`, recentErrors);
        }
      });
      
      // Report all captured errors
      const allErrors = consoleErrors.join('\n');
      if (allErrors) {
        console.error('TRAINING INPUT ERRORS FOUND:', allErrors);
      }
      
      expect(consoleErrors.length).toBe(0, `Training input errors: ${allErrors}`);
    });

    test('should identify state machine transition errors in tutorial', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      consoleErrors.length = 0;
      
      // Check current state and available transitions
      const currentState = gameApp.currentState;
      const allowedTransitions = gameApp.stateMachine.getAllowedTransitions(currentState);
      
      console.log(`Current state: ${currentState}`);
      console.log(`Allowed transitions: ${allowedTransitions.join(', ')}`);
      
      // Test state machine directly
      try {
        const result = gameApp.stateMachine.handleInput('1');
        console.log('StateMachine result for "1":', result);
        
        if (!result.success) {
          consoleErrors.push(`StateMachine rejected input "1": ${result.error}`);
        }
      } catch (error) {
        consoleErrors.push(`StateMachine threw error for "1": ${error.message}`);
      }
      
      const allErrors = consoleErrors.join('\n');
      expect(consoleErrors.length).toBe(0, `State machine errors: ${allErrors}`);
    });
  });

  describe('Tutorial rendering errors', () => {
    test('should capture tutorial training render errors', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      consoleErrors.length = 0;
      
      // Test rendering tutorial training screen
      try {
        gameApp.render();
      } catch (error) {
        consoleErrors.push(`Tutorial render error: ${error.message}`);
      }
      
      // Check if tutorial manager is in valid state
      const tutorialManager = gameApp.tutorialManager;
      if (!tutorialManager.isTutorialActive()) {
        consoleErrors.push('Tutorial manager reports tutorial not active');
      }
      
      const allErrors = consoleErrors.join('\n');
      expect(consoleErrors.length).toBe(0, `Tutorial render errors: ${allErrors}`);
    });

    test('should identify missing tutorial data errors', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      consoleErrors.length = 0;
      
      // Check tutorial data integrity
      const tutorialManager = gameApp.tutorialManager;
      const character = tutorialManager.tutorialCharacter;
      
      if (!character) {
        consoleErrors.push('Tutorial character is null');
      } else {
        // Check required properties
        const requiredProps = ['name', 'stats', 'energy', 'career'];
        requiredProps.forEach(prop => {
          if (!character[prop]) {
            consoleErrors.push(`Tutorial character missing ${prop}`);
          }
        });
        
        // Check stats structure
        if (character.stats) {
          const requiredStats = ['speed', 'stamina', 'power'];
          requiredStats.forEach(stat => {
            if (character.stats[stat] === undefined) {
              consoleErrors.push(`Tutorial character missing stat: ${stat}`);
            }
          });
        }
      }
      
      const allErrors = consoleErrors.join('\n');
      expect(consoleErrors.length).toBe(0, `Tutorial data errors: ${allErrors}`);
    });
  });

  describe('Flash error pattern detection', () => {
    test('should detect rapid error-success patterns', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Monitor output patterns for flash errors
      const outputBefore = consoleOutput.length;
      const errorsBefore = consoleErrors.length;
      
      // Send a training command that might cause flash error
      gameApp.handleKeyInput('1');
      
      const outputAfter = consoleOutput.length;
      const errorsAfter = consoleErrors.length;
      
      // Check for suspicious patterns
      const newOutput = consoleOutput.slice(outputBefore);
      const newErrors = consoleErrors.slice(errorsBefore);
      
      console.log('New output after input "1":', newOutput);
      console.log('New errors after input "1":', newErrors);
      
      // Look for error patterns that might flash
      const suspiciousPatterns = [
        'Invalid',
        'Error',
        'Failed',
        'undefined',
        'null',
        'not found',
        'cannot read'
      ];
      
      const flashErrors = [];
      newOutput.concat(newErrors).forEach((line, index) => {
        suspiciousPatterns.forEach(pattern => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            flashErrors.push(`Line ${index}: ${line}`);
          }
        });
      });
      
      if (flashErrors.length > 0) {
        console.error('POTENTIAL FLASH ERRORS DETECTED:', flashErrors);
      }
      
      expect(flashErrors.length).toBe(0, `Flash error patterns detected: ${flashErrors.join('; ')}`);
    });
  });
});