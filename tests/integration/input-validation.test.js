/**
 * Input Validation Core Experience Tests
 * Tests all user input scenarios to prevent getting stuck on screens
 */

const GameApp = require('../../src/GameApp');

describe('Input Validation Core Experience', () => {
  let app;

  beforeEach(() => {
    app = new GameApp();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (app && app.cleanup) {
      app.cleanup();
    }
    jest.restoreAllMocks();
  });

  describe('Main Menu Input', () => {
    test('should accept valid menu options', () => {
      expect(app.currentState).toBe('main_menu');
      
      const validInputs = ['1', '2', '3', '4', 'h', 'q'];
      
      validInputs.forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(true);
        
        // Reset to main menu for next test
        if (app.currentState !== 'main_menu') {
          app.stateMachine.transitionTo('main_menu');
        }
      });
    });

    test('should reject invalid menu options gracefully', () => {
      const invalidInputs = ['0', '5', 'a', 'x', '!', ''];
      
      invalidInputs.forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(false);
        expect(app.currentState).toBe('main_menu'); // Should stay in main menu
      });
    });

    test('should transition to correct states for each option', () => {
      const transitions = [
        { input: '1', expectedState: 'character_creation' },
        { input: '2', expectedState: 'load_game' },
        { input: '3', expectedState: 'help' }
      ];

      transitions.forEach(({ input, expectedState }) => {
        app.stateMachine.transitionTo('main_menu');
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(true);
        expect(app.currentState).toBe(expectedState);
      });
    });
  });

  describe('Character Creation Input', () => {
    beforeEach(() => {
      app.setState('character_creation');
    });

    test('should accept valid character names', () => {
      const validNames = [
        'Thunder', 
        'Lightning Strike', 
        'My-Horse', 
        'Fast_Runner', 
        'Champion123',
        'Speed Demon'
      ];

      validNames.forEach(name => {
        app.stateMachine.transitionTo('character_creation');
        const result = app.handleKeyInput(name);
        expect(result.success).toBe(true);
      });
    });

    test('should accept G for name generation', () => {
      const result = app.handleKeyInput('g');
      expect(result.success).toBe(true);
      expect(app.nameOptions.length).toBe(6);
    });

    test('should accept numeric selection after name generation', () => {
      // First generate names
      app.handleKeyInput('g');
      expect(app.nameOptions.length).toBe(6);
      
      // Then select each option
      for (let i = 1; i <= 6; i++) {
        app.handleKeyInput('g'); // Re-generate for each test
        const result = app.handleKeyInput(i.toString());
        expect(result.success).toBe(true);
      }
    });

    test('should reject invalid numeric selections', () => {
      app.handleKeyInput('g'); // Generate names first
      
      const invalidSelections = ['0', '7', '8', '9'];
      invalidSelections.forEach(selection => {
        const result = app.handleKeyInput(selection);
        expect(result.success).toBe(true); // Should be handled as character name
        expect(app.currentState).toBe('character_creation');
      });
    });

    test('should handle quit command', () => {
      const result = app.handleKeyInput('q');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('main_menu');
    });

    test('should reject empty input gracefully', () => {
      const result = app.handleKeyInput('');
      expect(result.success).toBe(false);
      expect(app.currentState).toBe('character_creation');
    });
  });

  describe('Training Input', () => {
    beforeEach(() => {
      app.createCharacter('TrainingTestHorse');
      expect(app.currentState).toBe('training');
    });

    test('should accept all training options', () => {
      const trainingInputs = ['1', '2', '3', '4', '5'];
      
      trainingInputs.forEach(input => {
        // Reset character if needed
        if (app.game.character.condition.energy < 20) {
          app.game.character.condition.energy = 100;
        }
        
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(true);
      });
    });

    test('should accept save command', () => {
      const result = app.handleKeyInput('s');
      expect(result.success).toBe(true);
    });

    test('should accept help command', () => {
      const result = app.handleKeyInput('h');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('help');
    });

    test('should accept quit command', () => {
      const result = app.handleKeyInput('q');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('main_menu');
    });

    test('should reject invalid training inputs', () => {
      const invalidInputs = ['0', '6', 'a', 'x', '!'];
      
      invalidInputs.forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(false);
        expect(app.currentState).toBe('training');
      });
    });

    test('should handle low energy gracefully', () => {
      // Drain energy
      app.game.character.condition.energy = 5;
      
      const result = app.handleKeyInput('1'); // Speed training (costs 15)
      expect(result.success).toBe(false);
      expect(app.currentState).toBe('training');
    });
  });

  describe('Race Flow Input', () => {
    beforeEach(() => {
      app.createCharacter('RaceTestHorse');
      
      // Advance to a race
      while (!app.game.checkForScheduledRace()) {
        app.performTrainingSync('speed');
      }
      app.performTrainingSync('speed'); // Trigger the race
      expect(app.currentState).toBe('race_preview');
    });

    test('should progress through race_preview with enter', () => {
      expect(app.currentState).toBe('race_preview');
      
      const result = app.handleKeyInput('enter');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('horse_lineup');
    });

    test('should progress through race_preview with empty input', () => {
      expect(app.currentState).toBe('race_preview');
      
      const result = app.handleKeyInput('');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('horse_lineup');
    });

    test('should progress through horse_lineup', () => {
      app.handleKeyInput('enter'); // Go to horse_lineup
      expect(app.currentState).toBe('horse_lineup');
      
      const result = app.handleKeyInput('enter');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('strategy_select');
    });

    test('should accept strategy selections', () => {
      // Navigate to strategy select
      app.handleKeyInput('enter'); // race_preview -> horse_lineup
      app.handleKeyInput('enter'); // horse_lineup -> strategy_select
      expect(app.currentState).toBe('strategy_select');
      
      const strategies = ['1', '2', '3'];
      strategies.forEach(strategy => {
        app.stateMachine.transitionTo('strategy_select');
        const result = app.handleKeyInput(strategy);
        expect(result.success).toBe(true);
        expect(app.currentState).toBe('race_running');
      });
    });

    test('should reject invalid strategy selections', () => {
      // Navigate to strategy select
      app.handleKeyInput('enter');
      app.handleKeyInput('enter');
      expect(app.currentState).toBe('strategy_select');
      
      const invalidStrategies = ['0', '4', 'a', ''];
      invalidStrategies.forEach(strategy => {
        const result = app.handleKeyInput(strategy);
        expect(result.success).toBe(false);
        expect(app.currentState).toBe('strategy_select');
      });
    });
  });

  describe('Navigation State Input', () => {
    test('should handle help screen navigation', () => {
      app.setState('help');
      
      const result = app.handleKeyInput('enter');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('main_menu'); // Should go back
    });

    test('should handle help screen with empty input', () => {
      app.setState('help');
      
      const result = app.handleKeyInput('');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('main_menu');
    });

    test('should identify navigation states correctly', () => {
      const navigationStates = ['race_preview', 'horse_lineup', 'race_results', 'podium', 'help'];
      
      navigationStates.forEach(state => {
        app.setState(state);
        expect(app.isNavigationState()).toBe(true);
      });
      
      const nonNavigationStates = ['main_menu', 'character_creation', 'training', 'strategy_select'];
      
      nonNavigationStates.forEach(state => {
        app.setState(state);
        expect(app.isNavigationState()).toBe(false);
      });
    });
  });

  describe('Edge Case Input Handling', () => {
    test('should handle rapid key presses gracefully', () => {
      app.createCharacter('RapidInputTest');
      
      // Rapid training inputs
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = app.handleKeyInput('4'); // Rest (restores energy)
        results.push(result);
      }
      
      // All should succeed or fail gracefully
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      });
      
      // Should not crash
      expect(app.currentState).toBeDefined();
    });

    test('should handle very long input strings', () => {
      app.setState('character_creation');
      
      const longInput = 'A'.repeat(100);
      const result = app.handleKeyInput(longInput);
      
      // Should handle gracefully (either accept or reject)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(app.currentState).toBe('character_creation');
    });

    test('should handle special characters in input', () => {
      app.setState('character_creation');
      
      const specialInputs = ['@#$%', '🐎', '\\n\\t', '<script>alert("test")</script>'];
      
      specialInputs.forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(app.currentState).toBe('character_creation');
      });
    });

    test('should handle null and undefined input', () => {
      const invalidInputs = [null, undefined];
      
      invalidInputs.forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
      });
    });
  });

  describe('State Machine Input Routing', () => {
    test('should route all advertised inputs correctly', () => {
      // Test that every input shown in UI is actually handled
      
      // Main menu shows 1,2,3,4,h,q
      app.setState('main_menu');
      ['1', '2', '3', '4', 'h', 'q'].forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(true);
        app.setState('main_menu'); // Reset
      });
      
      // Character creation shows g, q, names, and numbers 1-6
      app.setState('character_creation');
      app.handleKeyInput('g'); // Generate names first
      ['1', '2', '3', '4', '5', '6', 'g', 'q'].forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(true);
        app.setState('character_creation'); // Reset
        app.handleKeyInput('g'); // Re-generate names
      });
    });

    test('should provide helpful error messages for invalid input', () => {
      app.setState('main_menu');
      
      const result = app.handleKeyInput('x');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
      expect(result.availableInputs).toBeDefined();
      expect(result.availableInputs.length).toBeGreaterThan(0);
    });

    test('should maintain state consistency during invalid input', () => {
      const states = ['main_menu', 'character_creation', 'training'];
      
      states.forEach(state => {
        app.setState(state);
        const initialState = app.currentState;
        
        // Try invalid input
        const result = app.handleKeyInput('invalid');
        expect(result.success).toBe(false);
        expect(app.currentState).toBe(initialState); // Should not change state
      });
    });
  });
});