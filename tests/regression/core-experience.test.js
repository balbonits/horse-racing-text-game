/**
 * Core Experience Regression Tests
 * Tests for previously reported bugs and core gameplay issues
 * These tests should NEVER fail once fixed
 */

const GameApp = require('../../src/GameApp');

describe('Core Experience Regression Tests', () => {
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

  describe('Previously Fixed Navigation Bugs', () => {
    test('REGRESSION: Should not get stuck on race preview screen when pressing ENTER', () => {
      // This was a critical bug where users got stuck on race preview
      app.createCharacter('NavigationTest');
      
      // Advance to race
      while (!app.game.checkForScheduledRace()) {
        app.performTrainingSync('speed');
      }
      app.performTrainingSync('speed'); // Trigger race
      
      expect(app.currentState).toBe('race_preview');
      
      // ENTER should progress, not get stuck
      const result = app.handleKeyInput('enter');
      expect(result.success).toBe(true);
      expect(app.currentState).not.toBe('race_preview'); // Should have progressed
      expect(app.currentState).toBe('horse_lineup');
    });

    test('REGRESSION: Should not reject empty input on navigation states', () => {
      // Empty input (ENTER key) was being filtered out
      app.createCharacter('EmptyInputTest');
      
      // Get to race preview
      while (!app.game.checkForScheduledRace()) {
        app.performTrainingSync('speed');
      }
      app.performTrainingSync('speed');
      
      expect(app.currentState).toBe('race_preview');
      expect(app.isNavigationState()).toBe(true);
      
      // Empty input should be accepted on navigation states
      const result = app.handleKeyInput('');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('horse_lineup');
    });

    test('REGRESSION: Character creation should accept G for name generation', () => {
      // G input was being rejected in character creation
      app.setState('character_creation');
      
      const result = app.handleKeyInput('g');
      expect(result.success).toBe(true);
      expect(app.nameOptions.length).toBe(6);
    });

    test('REGRESSION: Character creation should accept numeric selections (1-6)', () => {
      // Numeric selections for names were being rejected
      app.setState('character_creation');
      app.handleKeyInput('g'); // Generate names
      
      for (let i = 1; i <= 6; i++) {
        app.handleKeyInput('g'); // Re-generate for each test
        const result = app.handleKeyInput(i.toString());
        expect(result.success).toBe(true);
      }
    });

    test('REGRESSION: Should not advance turns prematurely before scheduled race', () => {
      // Races were triggering too early in the career
      app.createCharacter('TurnTimingTest');
      
      const initialTurn = app.game.character.career.turn;
      expect(initialTurn).toBe(1);
      
      const firstRace = app.game.getScheduledRaces()[0];
      expect(firstRace.turn).toBeGreaterThan(1); // Should not be on turn 1
      
      // Train without triggering races
      for (let turn = initialTurn; turn < firstRace.turn; turn++) {
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        expect(trainingResult.raceReady).toBeFalsy();
        expect(app.currentState).toBe('training');
      }
    });

    test('REGRESSION: Should not skip training turns when advancing to race', () => {
      // Game was jumping from turn 1 directly to race phase
      app.createCharacter('TurnSkippingTest');
      
      let turnCount = 0;
      const maxTurns = 12;
      
      while (turnCount < maxTurns && !app.isCareerComplete()) {
        const currentTurn = app.game.character.career.turn;
        
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        
        if (trainingResult.raceReady) {
          // Race triggered, but we should have progressed through proper turns
          expect(currentTurn).toBeGreaterThan(turnCount);
          // Complete race flow simplified
          app.setState('training');
        }
        
        turnCount++;
      }
      
      // Should have gone through multiple training turns, not jumped straight to races
      expect(turnCount).toBeGreaterThan(1);
    });
  });

  describe('Input Error Regression Tests', () => {
    test('REGRESSION: Should not show "Cannot read properties of undefined" errors', () => {
      // There were errors about validateStateInput being undefined
      const states = ['main_menu', 'character_creation', 'training', 'help'];
      
      states.forEach(state => {
        app.setState(state);
        
        // These should not throw errors
        expect(() => {
          app.handleKeyInput('1');
        }).not.toThrow();
        
        expect(() => {
          app.handleKeyInput('invalid');
        }).not.toThrow();
        
        expect(() => {
          app.handleKeyInput('');
        }).not.toThrow();
      });
    });

    test('REGRESSION: Should handle all advertised inputs without "Invalid input" errors', () => {
      // Users were seeing invalid input errors for displayed options
      
      // Main menu advertises 1,2,3,4
      app.setState('main_menu');
      ['1', '2', '3', '4'].forEach(input => {
        const result = app.handleKeyInput(input);
        expect(result.success).toBe(true);
        app.setState('main_menu');
      });
      
      // Training advertises 1,2,3,4,5,s,h,q
      app.createCharacter('AdvertisedInputTest');
      ['1', '2', '3', '4', '5', 's', 'h', 'q'].forEach(input => {
        if (input === 'h') {
          app.setState('training');
          const result = app.handleKeyInput(input);
          expect(result.success).toBe(true);
        } else if (input === 'q') {
          app.setState('training');
          const result = app.handleKeyInput(input);
          expect(result.success).toBe(true);
        } else {
          app.setState('training');
          // Reset energy for training
          app.game.character.condition.energy = 100;
          const result = app.handleKeyInput(input);
          expect(result.success).toBe(true);
        }
      });
    });

    test('REGRESSION: Should not have memory leaks with event listeners', () => {
      // Tests were showing MaxListenersExceededWarning
      const initialListenerCount = process.listenerCount('uncaughtException');
      
      // Create and cleanup multiple app instances
      for (let i = 0; i < 5; i++) {
        const tempApp = new GameApp();
        tempApp.cleanup();
      }
      
      const finalListenerCount = process.listenerCount('uncaughtException');
      
      // Should not accumulate listeners
      expect(finalListenerCount - initialListenerCount).toBeLessThanOrEqual(1);
    });
  });

  describe('State Machine Regression Tests', () => {
    test('REGRESSION: Should not allow invalid state transitions', () => {
      // State machine should prevent invalid transitions
      expect(app.currentState).toBe('main_menu');
      
      // Should not be able to go directly to race states from main menu
      expect(() => {
        app.setState('race_preview');
      }).toThrow();
      
      expect(() => {
        app.setState('race_running');
      }).toThrow();
      
      expect(app.currentState).toBe('main_menu'); // Should remain unchanged
    });

    test('REGRESSION: Should maintain state consistency during errors', () => {
      const initialState = app.currentState;
      
      // Invalid input should not change state
      const result = app.handleKeyInput('invalid_input');
      expect(result.success).toBe(false);
      expect(app.currentState).toBe(initialState);
    });

    test('REGRESSION: Should handle back navigation correctly', () => {
      // Go to character creation
      app.handleKeyInput('1');
      expect(app.currentState).toBe('character_creation');
      
      // Back to main menu
      app.handleKeyInput('q');
      expect(app.currentState).toBe('main_menu');
      
      // Go to help
      app.handleKeyInput('h');
      expect(app.currentState).toBe('help');
      
      // Back should work
      app.handleKeyInput('enter');
      expect(app.currentState).toBe('main_menu');
    });
  });

  describe('Game Flow Regression Tests', () => {
    test('REGRESSION: Should complete full career without getting stuck', () => {
      // End-to-end test to ensure no soft locks
      app.createCharacter('FullCareerRegression');
      
      let safetyCounter = 0;
      const maxIterations = 50; // Prevent infinite loops
      
      while (!app.isCareerComplete() && safetyCounter < maxIterations) {
        const currentState = app.currentState;
        
        switch (currentState) {
          case 'training':
            app.handleKeyInput('4'); // Rest (safe option)
            break;
          case 'race_preview':
            app.handleKeyInput('enter');
            break;
          case 'horse_lineup':
            app.handleKeyInput('enter');
            break;
          case 'strategy_select':
            app.handleKeyInput('2'); // MID strategy
            break;
          case 'race_running':
            // Wait for auto-transition
            app.setState('race_results');
            break;
          case 'race_results':
            app.handleKeyInput('enter');
            break;
          case 'podium':
            app.handleKeyInput('enter');
            break;
          default:
            // Should not get stuck in unknown states
            expect(currentState).toMatch(/main_menu|character_creation|training|help|career_complete/);
        }
        
        safetyCounter++;
      }
      
      // Should complete without infinite loops
      expect(safetyCounter).toBeLessThan(maxIterations);
      expect(app.isCareerComplete() || app.currentState === 'career_complete').toBe(true);
    });

    test('REGRESSION: Should not lose game progress during state transitions', () => {
      app.createCharacter('ProgressTest');
      
      const initialStats = { ...app.game.character.stats };
      const initialTurn = app.game.character.career.turn;
      
      // Do some training
      app.handleKeyInput('1'); // Speed training
      
      const afterTrainingStats = { ...app.game.character.stats };
      const afterTrainingTurn = app.game.character.career.turn;
      
      // Stats should have improved
      expect(afterTrainingStats.speed).toBeGreaterThan(initialStats.speed);
      expect(afterTrainingTurn).toBeGreaterThan(initialTurn);
      
      // Go to help and back
      app.handleKeyInput('h');
      app.handleKeyInput('enter');
      
      // Progress should be maintained
      expect(app.game.character.stats.speed).toBe(afterTrainingStats.speed);
      expect(app.game.character.career.turn).toBe(afterTrainingTurn);
    });
  });

  describe('UI Display Regression Tests', () => {
    test('REGRESSION: Should show correct turn numbers in UI', () => {
      app.createCharacter('TurnDisplayTest');
      
      const status = app.game.getGameStatus();
      expect(status.turn).toBe(1);
      expect(status.maxTurns).toBe(12);
      
      // After training
      app.performTrainingSync('speed');
      
      const afterStatus = app.game.getGameStatus();
      expect(afterStatus.turn).toBe(2);
    });

    test('REGRESSION: Should display upcoming races correctly', () => {
      app.createCharacter('RaceDisplayTest');
      
      const scheduledRaces = app.game.getScheduledRaces();
      expect(scheduledRaces.length).toBeGreaterThan(0);
      
      const firstRace = scheduledRaces[0];
      expect(firstRace.turn).toBeDefined();
      expect(firstRace.name).toBeDefined();
      expect(firstRace.turn).toBeGreaterThan(1);
    });

    test('REGRESSION: Should not show "undefined" in game displays', () => {
      app.createCharacter('UndefinedTest');
      
      const status = app.game.getGameStatus();
      
      // Check for undefined values
      expect(status.character).toBeDefined();
      expect(status.character.name).toBeDefined();
      expect(status.turn).toBeDefined();
      expect(status.maxTurns).toBeDefined();
      expect(status.stats).toBeDefined();
    });
  });

  describe('Performance Regression Tests', () => {
    test('REGRESSION: Should handle rapid input without performance degradation', () => {
      app.createCharacter('PerformanceTest');
      
      const startTime = Date.now();
      
      // Rapid training cycles
      for (let i = 0; i < 10; i++) {
        app.handleKeyInput('4'); // Rest
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    test('REGRESSION: Should not accumulate memory during gameplay', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate extended gameplay
      app.createCharacter('MemoryTest');
      
      for (let i = 0; i < 20; i++) {
        app.handleKeyInput('4'); // Rest
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not have excessive memory growth (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});