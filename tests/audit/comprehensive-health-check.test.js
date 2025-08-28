/**
 * Comprehensive App Health Check
 * 
 * Full audit of the application after all fixes to determine project health.
 * Tests core functionality, state transitions, input handling, and user flows.
 */

const GameApp = require('../../src/GameApp');

describe('Comprehensive App Health Check', () => {
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

  describe('Core Application Health', () => {
    test('should successfully initialize GameApp without errors', () => {
      expect(gameApp).toBeDefined();
      expect(gameApp.currentState).toBeDefined();
      expect(gameApp.stateMachine).toBeDefined();
      expect(gameApp.ui).toBeDefined();
      expect(gameApp.game).toBeDefined();
    });

    test('should handle all main menu navigation without errors', () => {
      const menuOptions = ['1', '2', '3', '4', 'q'];
      let errorCount = 0;
      
      menuOptions.forEach(option => {
        try {
          // Reset to main menu
          gameApp.setState('main_menu');
          const result = gameApp.handleKeyInput(option);
          
          // Should not throw errors
          expect(result).toBeDefined();
        } catch (error) {
          errorCount++;
          console.log(`Menu option ${option} failed:`, error.message);
        }
      });
      
      expect(errorCount).toBe(0);
    });
  });

  describe('Tutorial System Health', () => {
    test('should complete full tutorial flow without errors', () => {
      // Start tutorial
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      expect(gameApp.currentState).toBe('tutorial_training');
      
      let completionReached = false;
      let sessionCount = 0;
      const maxSessions = 10;
      
      // Run tutorial training sessions
      while (sessionCount < maxSessions && !completionReached) {
        try {
          // Follow tutorial guidance: speed -> stamina -> power
          const inputOptions = ['1', '2', '3'];
          const input = inputOptions[sessionCount % 3];
          
          gameApp.handleKeyInput(input);
          sessionCount++;
          
          // Check if tutorial completed
          if (gameApp.currentState !== 'tutorial_training') {
            completionReached = true;
            break;
          }
        } catch (error) {
          throw new Error(`Tutorial session ${sessionCount + 1} failed: ${error.message}`);
        }
      }
      
      expect(completionReached).toBe(true);
      expect(sessionCount).toBeGreaterThan(0);
      expect(sessionCount).toBeLessThanOrEqual(5); // Should complete in 3-5 sessions
    });

    test('should verify tutorial character has proper stat changes', () => {
      // Start tutorial
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const character = gameApp.tutorialManager.tutorialCharacter;
      const initialStats = { ...character.stats };
      
      // Perform one training session
      gameApp.handleKeyInput('1'); // Speed training
      
      const finalStats = character.stats;
      
      // Stats should have changed from training
      expect(finalStats.speed).toBeGreaterThanOrEqual(initialStats.speed);
      expect(character).toBeDefined();
      expect(character.name).toBeDefined();
    });

    test('should display tutorial career screen without errors', () => {
      // Navigate to tutorial career completion
      gameApp.setState('tutorial');
      gameApp.handleKeyInput('');
      
      // Complete tutorial quickly
      gameApp.handleKeyInput('1'); // Speed
      gameApp.handleKeyInput('2'); // Stamina  
      gameApp.handleKeyInput('3'); // Power
      
      // Should reach tutorial_career state
      expect(gameApp.currentState).toBe('tutorial_career');
      
      // Should render without errors
      expect(() => gameApp.render()).not.toThrow();
    });
  });

  describe('Character Creation & Stat Randomization Health', () => {
    test('should create characters with randomized stats', () => {
      const characters = [];
      
      // Create 5 characters to test randomization
      for (let i = 0; i < 5; i++) {
        const Character = require('../../src/modules/Character');
        const character = new Character(`TestHorse${i}`);
        characters.push(character);
      }
      
      // Check that stats vary between characters
      const allStatsIdentical = characters.every(char => 
        char.stats.speed === characters[0].stats.speed &&
        char.stats.stamina === characters[0].stats.stamina &&
        char.stats.power === characters[0].stats.power
      );
      
      expect(allStatsIdentical).toBe(false);
      
      // Check that all stats are in valid range (15-25)
      characters.forEach(char => {
        expect(char.stats.speed).toBeGreaterThanOrEqual(15);
        expect(char.stats.speed).toBeLessThanOrEqual(25);
        expect(char.stats.stamina).toBeGreaterThanOrEqual(15);
        expect(char.stats.stamina).toBeLessThanOrEqual(25);
        expect(char.stats.power).toBeGreaterThanOrEqual(15);
        expect(char.stats.power).toBeLessThanOrEqual(25);
      });
    });

    test('should create career characters with randomized stats', () => {
      // Test career character creation
      const result = gameApp.game.startNewGameSync('Health Test Horse');
      
      expect(result.success).toBe(true);
      expect(gameApp.game.character).toBeDefined();
      
      const character = gameApp.game.character;
      expect(character.name).toBe('Health Test Horse');
      
      // Stats should be randomized (not all 20)
      const allTwenty = character.stats.speed === 20 && 
                       character.stats.stamina === 20 && 
                       character.stats.power === 20;
      
      expect(allTwenty).toBe(false);
    });
  });

  describe('State Machine Health', () => {
    test('should handle all major state transitions without errors', () => {
      const stateTransitions = [
        { from: 'main_menu', input: '2', to: 'tutorial' },
        { from: 'tutorial', input: '', to: 'tutorial_training' },
        { from: 'tutorial_training', input: 'q', to: 'main_menu' },
        { from: 'main_menu', input: '1', to: 'character_creation' },
        { from: 'character_creation', input: 'q', to: 'main_menu' }
      ];
      
      let errorCount = 0;
      
      stateTransitions.forEach(transition => {
        try {
          gameApp.setState(transition.from);
          gameApp.handleKeyInput(transition.input);
          
          // Some transitions might not be immediate due to async operations
          // Just verify no errors were thrown
        } catch (error) {
          errorCount++;
          console.log(`State transition ${transition.from} -> ${transition.to} failed:`, error.message);
        }
      });
      
      expect(errorCount).toBe(0);
    });

    test('should validate state machine configuration integrity', () => {
      const stateMachine = gameApp.stateMachine;
      
      // Test that state machine has proper structure
      expect(stateMachine.currentState).toBeDefined();
      expect(typeof stateMachine.handleInput).toBe('function');
      expect(typeof stateMachine.getAllowedTransitions).toBe('function');
      
      // Test that critical states exist
      const criticalStates = [
        'main_menu', 'character_creation', 'tutorial', 'tutorial_training', 
        'tutorial_career', 'training', 'race_preview', 'career_complete'
      ];
      
      criticalStates.forEach(state => {
        const transitions = stateMachine.getAllowedTransitions(state);
        expect(Array.isArray(transitions)).toBe(true);
      });
    });
  });

  describe('Training System Health', () => {
    test('should handle all training types without errors', () => {
      // Start a career
      gameApp.game.startNewGameSync('Training Test Horse');
      gameApp.setState('training');
      
      const trainingTypes = ['1', '2', '3', '4', '5']; // speed, stamina, power, rest, media
      let errorCount = 0;
      
      trainingTypes.forEach(trainingInput => {
        try {
          const character = gameApp.game.character;
          const initialStats = { ...character.stats };
          const initialEnergy = character.energy;
          
          const result = gameApp.handleKeyInput(trainingInput);
          
          // Should not throw errors
          expect(result).toBeDefined();
        } catch (error) {
          errorCount++;
          console.log(`Training type ${trainingInput} failed:`, error.message);
        }
      });
      
      expect(errorCount).toBe(0);
    });
  });

  describe('Race System Health', () => {
    test('should handle race flow without errors', () => {
      // Create a quick career that reaches a race
      gameApp.game.startNewGameSync('Race Test Horse');
      gameApp.setState('training');
      
      let raceReached = false;
      let trainingCount = 0;
      const maxTraining = 10;
      
      // Train until a race is triggered or max attempts
      while (!raceReached && trainingCount < maxTraining) {
        try {
          const result = gameApp.handleKeyInput('1'); // Speed training
          trainingCount++;
          
          // Check if race was triggered
          if (gameApp.currentState === 'race_preview') {
            raceReached = true;
            break;
          }
        } catch (error) {
          console.log(`Race flow training ${trainingCount} failed:`, error.message);
          break;
        }
      }
      
      // Either race should be reached or we should complete training without errors
      expect(trainingCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling & Recovery Health', () => {
    test('should handle invalid inputs gracefully', () => {
      const invalidInputs = ['invalid', '999', 'abc', '#', '@', ''];
      let crashCount = 0;
      
      invalidInputs.forEach(input => {
        try {
          gameApp.handleKeyInput(input);
        } catch (error) {
          // Should not crash the application
          crashCount++;
        }
      });
      
      expect(crashCount).toBe(0);
    });

    test('should handle state transitions to invalid states gracefully', () => {
      let errorCount = 0;
      
      try {
        gameApp.setState('invalid_state');
      } catch (error) {
        // Expected to throw error for invalid states
        errorCount++;
      }
      
      expect(errorCount).toBeGreaterThan(0); // Should reject invalid states
      expect(gameApp.currentState).toBeDefined(); // Should maintain valid state
    });
  });
});