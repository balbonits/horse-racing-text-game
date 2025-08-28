/**
 * Input System Audit
 * 
 * Comprehensive audit of the input handling system to ensure
 * our character creation changes didn't break other input handling.
 */

const GameApp = require('../../src/GameApp');

describe('Input System Audit', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  
  beforeEach(() => {
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
    
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Character Creation Input Handling', () => {
    test('should handle typing horse names character by character', () => {
      gameApp.setState('character_creation');
      expect(gameApp.characterNameBuffer).toBe('');
      
      const horseName = 'Thunder';
      
      // Type each character
      for (let char of horseName) {
        const result = gameApp.handleKeyInput(char);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Character added to name');
      }
      
      expect(gameApp.characterNameBuffer).toBe('Thunder');
      
      // Press enter to create character
      const createResult = gameApp.handleKeyInput('\n');
      expect(createResult.success).toBe(true);
      expect(gameApp.currentState).toBe('training');
      expect(gameApp.game.character.name).toBe('thunder');
    });

    test('should handle backspace in character creation', () => {
      gameApp.setState('character_creation');
      
      // Type some characters
      gameApp.handleKeyInput('T');
      gameApp.handleKeyInput('e');
      gameApp.handleKeyInput('s');
      gameApp.handleKeyInput('t');
      expect(gameApp.characterNameBuffer).toBe('Test');
      
      // Backspace twice
      const backspaceResult1 = gameApp.handleKeyInput('backspace');
      expect(backspaceResult1.success).toBe(true);
      expect(gameApp.characterNameBuffer).toBe('Tes');
      
      const backspaceResult2 = gameApp.handleKeyInput('\b');
      expect(backspaceResult2.success).toBe(true);
      expect(gameApp.characterNameBuffer).toBe('Te');
    });

    test('should handle special character creation commands', () => {
      gameApp.setState('character_creation');
      
      // Test 'g' for generate names
      const generateResult = gameApp.handleKeyInput('g');
      expect(generateResult.success).toBe(true);
      expect(gameApp.nameOptions.length).toBeGreaterThan(0);
      
      // Test 'q' for quit
      gameApp.setState('character_creation');
      gameApp.characterNameBuffer = 'Some name';
      const quitResult = gameApp.handleKeyInput('q');
      expect(quitResult.success).toBe(true);
      expect(gameApp.currentState).toBe('main_menu');
      expect(gameApp.characterNameBuffer).toBe(''); // Should be cleared
    });

    test('should handle invalid characters in character creation', () => {
      gameApp.setState('character_creation');
      
      const invalidChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
      
      invalidChars.forEach(char => {
        const result = gameApp.handleKeyInput(char);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid input in character creation');
      });
      
      expect(gameApp.characterNameBuffer).toBe(''); // No invalid chars should be added
    });
  });

  describe('Training Input Handling', () => {
    test('should handle all training input types', () => {
      // Create character first
      gameApp.game.startNewGameSync('Input Test Horse');
      gameApp.setState('training');
      
      const trainingInputs = [
        { input: '1', expected: 'speed_training', description: 'Speed training' },
        { input: '2', expected: 'stamina_training', description: 'Stamina training' },
        { input: '3', expected: 'power_training', description: 'Power training' },
        { input: '4', expected: 'rest_training', description: 'Rest day' },
        { input: '5', expected: 'media_training', description: 'Media day' }
      ];
      
      trainingInputs.forEach(test => {
        gameApp.setState('training'); // Reset to training
        const result = gameApp.handleKeyInput(test.input);
        
        expect(result.success).toBe(true);
        expect(result.action).toBe(test.expected);
        console.log(`✅ ${test.description}: ${result.action}`);
      });
    });

    test('should handle training input with insufficient energy', () => {
      // Create character and drain energy
      gameApp.game.startNewGameSync('Low Energy Horse');
      const character = gameApp.game.character;
      
      // Set low energy
      if (character.condition) {
        character.condition.energy = 5;
      } else {
        character.energy = 5;
      }
      
      gameApp.setState('training');
      
      // Try speed training (costs 15 energy)
      const result = gameApp.handleKeyInput('1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('energy');
    });

    test('should handle invalid training inputs', () => {
      gameApp.game.startNewGameSync('Invalid Input Horse');
      gameApp.setState('training');
      
      const invalidInputs = ['0', '6', '7', '8', '9', 'a', 'b', 'x', 'invalid'];
      
      invalidInputs.forEach(input => {
        const result = gameApp.handleKeyInput(input);
        expect(result.success).toBe(false);
        console.log(`Input "${input}": ${result.error}`);
      });
    });
  });

  describe('Menu Input Handling', () => {
    test('should handle all main menu inputs', () => {
      gameApp.setState('main_menu');
      
      const menuInputs = [
        { input: '1', description: 'New Career' },
        { input: '2', description: 'Tutorial' },
        { input: '3', description: 'Load Game' },
        { input: '4', description: 'Help' },
        { input: 'q', description: 'Quit' }
      ];
      
      menuInputs.forEach(test => {
        gameApp.setState('main_menu'); // Reset to main menu
        const result = gameApp.handleKeyInput(test.input);
        
        expect(result.success).toBe(true);
        console.log(`✅ Main menu ${test.description}: Success`);
      });
    });

    test('should handle invalid main menu inputs', () => {
      gameApp.setState('main_menu');
      
      const invalidInputs = ['0', '5', '6', 'a', 'invalid', ''];
      
      invalidInputs.forEach(input => {
        gameApp.setState('main_menu'); // Reset
        const result = gameApp.handleKeyInput(input);
        expect(result.success).toBe(false);
        console.log(`Invalid menu input "${input}": ${result.error}`);
      });
    });
  });

  describe('Tutorial Input Handling', () => {
    test('should handle tutorial navigation inputs', () => {
      gameApp.setState('tutorial');
      
      // Start tutorial
      const startResult = gameApp.handleKeyInput('');
      expect(startResult.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // Try tutorial training inputs
      const tutorialInputs = ['1', '2', '3'];
      
      tutorialInputs.forEach((input, index) => {
        if (gameApp.currentState === 'tutorial_training') {
          const result = gameApp.handleKeyInput(input);
          expect(result.success).toBe(true);
          console.log(`Tutorial training ${index + 1}: Success`);
        }
      });
    });

    test('should handle tutorial quit functionality', () => {
      gameApp.setState('tutorial');
      
      const quitResult = gameApp.handleKeyInput('q');
      expect(quitResult.success).toBe(true);
      expect(gameApp.currentState).toBe('main_menu');
      
      console.log('✅ Tutorial quit functionality working');
    });
  });

  describe('State-Specific Input Validation', () => {
    test('should validate inputs are appropriate for each state', () => {
      const stateInputTests = [
        {
          state: 'main_menu',
          validInputs: ['1', '2', '3', '4', 'q'],
          invalidInputs: ['0', '5', 'a', 'enter']
        },
        {
          state: 'tutorial',
          validInputs: ['', 'q'],
          invalidInputs: ['1', '2', '3', 'a']
        }
      ];
      
      stateInputTests.forEach(stateTest => {
        console.log(`Testing state: ${stateTest.state}`);
        
        // Test valid inputs
        stateTest.validInputs.forEach(input => {
          gameApp.setState(stateTest.state);
          const result = gameApp.handleKeyInput(input);
          expect(result.success).toBe(true);
          console.log(`  Valid input "${input}": ✅`);
        });
        
        // Test invalid inputs
        stateTest.invalidInputs.forEach(input => {
          gameApp.setState(stateTest.state);
          const result = gameApp.handleKeyInput(input);
          expect(result.success).toBe(false);
          console.log(`  Invalid input "${input}": ❌ (${result.error})`);
        });
      });
    });
  });

  describe('Input Normalization', () => {
    test('should properly normalize different input formats', () => {
      // Test that various ways of representing the same input work
      const inputVariations = [
        { variations: ['1', ' 1 ', '1\n'], expected: 'speed_training', state: 'training' },
        { variations: ['q', 'Q', ' q ', 'q\n'], expected: 'quit', state: 'main_menu' }
      ];
      
      inputVariations.forEach(test => {
        if (test.state === 'training') {
          gameApp.game.startNewGameSync('Normalization Test Horse');
        }
        
        test.variations.forEach(variation => {
          gameApp.setState(test.state);
          const result = gameApp.handleKeyInput(variation);
          
          if (test.expected === 'quit') {
            expect(result.success).toBe(true);
            expect(result.action).toBe(test.expected);
          } else {
            expect(result.success).toBe(true);
            expect(result.action).toBe(test.expected);
          }
          
          console.log(`Input "${variation}" normalized to ${test.expected}: ✅`);
        });
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null and undefined inputs gracefully', () => {
      const edgeCaseInputs = [null, undefined, '', '   ', '\n', '\t'];
      
      edgeCaseInputs.forEach(input => {
        gameApp.setState('main_menu');
        
        let result;
        try {
          result = gameApp.handleKeyInput(input);
          expect(result).toBeDefined();
          console.log(`Edge case input ${JSON.stringify(input)}: Handled gracefully`);
        } catch (error) {
          console.log(`Edge case input ${JSON.stringify(input)}: Threw error - ${error.message}`);
          // Should not throw errors, should handle gracefully
          expect(true).toBe(false); // Force failure
        }
      });
    });

    test('should handle very long inputs', () => {
      gameApp.setState('character_creation');
      
      const veryLongInput = 'A'.repeat(1000);
      
      // Should handle long character name gracefully
      let result;
      try {
        result = gameApp.handleKeyInput(veryLongInput);
        expect(result.success).toBe(false); // Should reject very long names
        console.log('Very long input handled gracefully');
      } catch (error) {
        console.log(`Very long input caused error: ${error.message}`);
        throw error;
      }
    });
  });
});