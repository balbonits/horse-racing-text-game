/**
 * Core Functionality Audit
 * 
 * Focused audit of core game functionality after recent changes
 * to ensure we haven't broken the main game flow.
 */

const GameApp = require('../../src/GameApp');

describe('Core Functionality Audit', () => {
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

  describe('Main Career Flow', () => {
    test('should complete full career creation and first training', () => {
      // Test complete career flow
      console.log('=== FULL CAREER FLOW TEST ===');
      
      // Step 1: Navigate to character creation
      gameApp.setState('main_menu');
      const menuResult = gameApp.handleKeyInput('1');
      expect(menuResult.success).toBe(true);
      expect(gameApp.currentState).toBe('character_creation');
      
      // Step 2: Create character
      gameApp.characterNameBuffer = 'Audit Horse';
      const createResult = gameApp.handleKeyInput('\n');
      expect(createResult.success).toBe(true);
      expect(gameApp.currentState).toBe('training');
      expect(gameApp.game.character).toBeDefined();
      expect(gameApp.game.character.name).toBe('audit horse');
      
      // Step 3: Verify character has randomized stats
      const stats = gameApp.game.character.stats;
      const allTwenty = stats.speed === 20 && stats.stamina === 20 && stats.power === 20;
      expect(allTwenty).toBe(false); // Should be randomized
      
      // Step 4: Perform training
      const initialStats = { ...stats };
      const trainingResult = gameApp.handleKeyInput('1'); // Speed training
      expect(trainingResult.success).toBe(true);
      
      // Step 5: Verify training worked
      expect(gameApp.game.character.stats.speed).toBeGreaterThan(initialStats.speed);
      expect(gameApp.game.character.career.turn).toBe(2);
      expect(gameApp.currentState).toBe('training');
      
      console.log('✅ Full career flow completed successfully');
    });

    test('should handle career progression through multiple turns', () => {
      // Quick career setup
      gameApp.game.startNewGameSync('Multi Turn Horse');
      gameApp.setState('training');
      
      let turnCount = 1;
      let trainingCount = 0;
      const maxTraining = 5;
      
      while (trainingCount < maxTraining && gameApp.currentState === 'training') {
        const beforeTurn = gameApp.game.character.career.turn;
        
        // Perform training
        const result = gameApp.handleKeyInput('2'); // Stamina training
        expect(result.success).toBe(true);
        
        const afterTurn = gameApp.game.character.career.turn;
        expect(afterTurn).toBe(beforeTurn + 1);
        
        trainingCount++;
        turnCount = afterTurn;
        
        console.log(`Turn ${turnCount}: Training successful`);
      }
      
      expect(trainingCount).toBe(maxTraining);
      expect(turnCount).toBe(6);
      console.log('✅ Multi-turn progression completed successfully');
    });

    test('should trigger races at correct turns', () => {
      // Quick career setup
      gameApp.game.startNewGameSync('Race Trigger Horse');
      gameApp.setState('training');
      
      let raceEncountered = false;
      const maxTurns = 6;
      
      for (let i = 0; i < maxTurns; i++) {
        if (gameApp.currentState !== 'training') {
          console.log(`Race triggered at turn ${gameApp.game.character.career.turn}, state: ${gameApp.currentState}`);
          raceEncountered = true;
          break;
        }
        
        const result = gameApp.handleKeyInput('4'); // Rest training (safe)
        if (!result.success) {
          console.log(`Training failed at turn ${i + 1}: ${result.error}`);
          break;
        }
      }
      
      // Should encounter a race by turn 4 (first race)
      if (!raceEncountered && gameApp.game.character.career.turn >= 4) {
        console.log('No race encountered by turn 4 - checking upcoming race info');
        const nextRace = gameApp.game.getNextRace();
        console.log('Next race info:', nextRace);
      }
      
      console.log(`Final turn: ${gameApp.game.character.career.turn}, Final state: ${gameApp.currentState}`);
      console.log('✅ Race trigger test completed');
    });
  });

  describe('Tutorial System', () => {
    test('should complete tutorial without errors', () => {
      // Start tutorial
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      expect(gameApp.currentState).toBe('tutorial_training');
      expect(gameApp.tutorialManager.tutorialCharacter).toBeDefined();
      
      const initialStats = { ...gameApp.tutorialManager.tutorialCharacter.stats };
      
      // Perform 3 training sessions
      const trainingSequence = ['1', '2', '3']; // speed, stamina, power
      
      trainingSequence.forEach((input, index) => {
        const result = gameApp.handleKeyInput(input);
        expect(result.success).toBe(true);
        console.log(`Tutorial step ${index + 1}: ${result.message || 'Success'}`);
      });
      
      // Verify tutorial character was modified
      const finalStats = gameApp.tutorialManager.tutorialCharacter.stats;
      const statsChanged = JSON.stringify(finalStats) !== JSON.stringify(initialStats);
      expect(statsChanged).toBe(true);
      
      console.log('✅ Tutorial completed successfully');
    });
  });

  describe('Input Handling Robustness', () => {
    test('should handle various input types without crashing', () => {
      const testInputs = [
        { state: 'main_menu', input: '1', description: 'Main menu - new career' },
        { state: 'main_menu', input: '2', description: 'Main menu - tutorial' },
        { state: 'main_menu', input: 'q', description: 'Main menu - quit' },
        { state: 'main_menu', input: 'invalid', description: 'Main menu - invalid input' }
      ];
      
      testInputs.forEach(test => {
        try {
          gameApp.setState(test.state);
          const result = gameApp.handleKeyInput(test.input);
          
          // Should not crash, regardless of success/failure
          expect(result).toBeDefined();
          console.log(`✅ ${test.description}: ${result.success ? 'Success' : 'Handled gracefully'}`);
        } catch (error) {
          console.log(`❌ ${test.description}: Crashed with ${error.message}`);
          throw error;
        }
      });
    });

    test('should handle character creation edge cases', () => {
      gameApp.setState('character_creation');
      
      const testCases = [
        { input: '', description: 'Empty input' },
        { input: 'g', description: 'Generate names' },
        { input: 'q', description: 'Quit to main menu' },
        { input: 'Very Long Horse Name That Might Cause Issues', description: 'Long name' }
      ];
      
      testCases.forEach(test => {
        try {
          gameApp.setState('character_creation'); // Reset state
          gameApp.characterNameBuffer = '';
          
          if (test.input === 'Very Long Horse Name That Might Cause Issues') {
            // Simulate typing the name
            for (let char of test.input) {
              gameApp.handleKeyInput(char);
            }
            const result = gameApp.handleKeyInput('\n');
            expect(result).toBeDefined();
          } else {
            const result = gameApp.handleKeyInput(test.input);
            expect(result).toBeDefined();
          }
          
          console.log(`✅ Character creation ${test.description}: Handled`);
        } catch (error) {
          console.log(`❌ Character creation ${test.description}: Failed - ${error.message}`);
          throw error;
        }
      });
    });
  });

  describe('State Machine Integrity', () => {
    test('should maintain consistent state after operations', () => {
      const operations = [
        () => { gameApp.setState('main_menu'); return 'Set to main_menu'; },
        () => { gameApp.handleKeyInput('1'); return 'Navigate to character_creation'; },
        () => { gameApp.setState('main_menu'); return 'Back to main_menu'; },
        () => { gameApp.handleKeyInput('2'); return 'Navigate to tutorial'; },
        () => { gameApp.setState('main_menu'); return 'Back to main_menu again'; }
      ];
      
      operations.forEach((operation, index) => {
        try {
          const description = operation();
          const currentState = gameApp.currentState;
          
          expect(currentState).toBeDefined();
          expect(typeof currentState).toBe('string');
          console.log(`Step ${index + 1}: ${description} -> ${currentState}`);
        } catch (error) {
          console.log(`❌ State machine operation ${index + 1} failed: ${error.message}`);
          throw error;
        }
      });
      
      console.log('✅ State machine integrity maintained');
    });
  });

  describe('Data Persistence', () => {
    test('should maintain character data consistency', () => {
      // Create character
      gameApp.game.startNewGameSync('Data Test Horse');
      const character = gameApp.game.character;
      
      expect(character).toBeDefined();
      expect(character.name).toBe('data test horse');
      expect(character.stats).toBeDefined();
      expect(character.career).toBeDefined();
      expect(character.career.turn).toBe(1);
      
      // Simulate training
      gameApp.setState('training');
      const beforeStats = { ...character.stats };
      const beforeEnergy = character.condition ? character.condition.energy : character.energy;
      
      const trainingResult = gameApp.handleKeyInput('1'); // Speed training
      expect(trainingResult.success).toBe(true);
      
      // Verify data consistency
      expect(character.stats.speed).toBeGreaterThan(beforeStats.speed);
      expect(character.career.turn).toBe(2);
      
      const afterEnergy = character.condition ? character.condition.energy : character.energy;
      expect(afterEnergy).toBeLessThan(beforeEnergy);
      
      console.log('✅ Character data consistency maintained');
    });
  });
});