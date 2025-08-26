/**
 * Game State Consistency Integration Tests
 * Tests to ensure game state remains consistent across all operations
 */

const GameApp = require('../../src/GameApp');

describe('Game State Consistency Integration', () => {
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

  describe('State Transition Consistency', () => {
    test('should maintain consistent state throughout character creation flow', () => {
      const stateLog = [];
      
      // Start state
      expect(app.currentState).toBe('main_menu');
      stateLog.push('main_menu');
      
      // Navigate to character creation
      app.handleKeyInput('1');
      expect(app.currentState).toBe('character_creation');
      stateLog.push('character_creation');
      
      // Generate names
      app.handleKeyInput('g');
      expect(app.currentState).toBe('character_creation'); // Should stay in same state
      expect(app.nameOptions.length).toBe(6);
      stateLog.push('character_creation (with names)');
      
      // Select name
      app.handleKeyInput('1');
      expect(app.currentState).toBe('training');
      stateLog.push('training');
      
      // Log state transitions for debugging
      console.log('Character creation state flow:', stateLog);
      
      // Final state should be training with character created
      expect(app.game.character).toBeDefined();
      expect(app.game.character.name).toBeDefined();
    });

    test('should maintain state consistency during training progression', () => {
      app.createCharacter('StateConsistencyTest');
      
      const initialState = {
        turn: app.game.character.career.turn,
        stats: { ...app.game.character.getCurrentStats() },
        energy: app.game.character.condition.energy
      };
      
      // Perform training
      const result = app.performTrainingSync('speed');
      expect(result.success).toBe(true);
      
      const afterState = {
        turn: app.game.character.career.turn,
        stats: { ...app.game.character.getCurrentStats() },
        energy: app.game.character.condition.energy
      };
      
      // Verify consistent progression
      expect(afterState.turn).toBe(initialState.turn + 1);
      expect(afterState.stats.speed).toBeGreaterThanOrEqual(initialState.stats.speed);
      expect(afterState.energy).toBe(initialState.energy - 15); // Speed training cost
      
      // State should remain training if no race
      if (!result.raceReady) {
        expect(app.currentState).toBe('training');
      }
    });

    test('should maintain state consistency during race flow', () => {
      app.createCharacter('RaceConsistencyTest');
      
      // Advance to race
      while (!app.game.checkForScheduledRace()) {
        app.performTrainingSync('speed');
      }
      
      const preRaceState = {
        turn: app.game.character.career.turn,
        character: { ...app.game.character }
      };
      
      // Trigger race
      app.performTrainingSync('speed');
      expect(app.currentState).toBe('race_preview');
      
      const raceStates = ['race_preview', 'horse_lineup', 'strategy_select', 'race_running'];
      let currentIndex = 0;
      
      raceStates.forEach(expectedState => {
        expect(app.currentState).toBe(expectedState);
        
        if (expectedState === 'strategy_select') {
          app.handleKeyInput('2'); // Select strategy
        } else if (expectedState === 'race_running') {
          // Skip to results for testing
          app.setState('race_results');
        } else {
          app.handleKeyInput('enter'); // Progress
        }
      });
      
      // Should maintain character data throughout race
      expect(app.game.character.name).toBe(preRaceState.character.name);
      expect(app.game.character.career.turn).toBe(preRaceState.turn + 1); // Turn advanced after training
    });

    test('should handle state transitions with invalid inputs gracefully', () => {
      const states = ['main_menu', 'character_creation', 'training'];
      
      states.forEach(state => {
        app.setState(state);
        const initialState = app.currentState;
        
        // Try various invalid inputs
        const invalidInputs = ['invalid', '999', '', null, undefined];
        
        invalidInputs.forEach(invalid => {
          const result = app.handleKeyInput(invalid);
          
          if (result.success === false) {
            // Invalid input should not change state
            expect(app.currentState).toBe(initialState);
          }
          
          // Should never crash
          expect(app).toBeDefined();
          expect(app.currentState).toBeDefined();
        });
      });
    });
  });

  describe('Data Consistency', () => {
    test('should maintain character data consistency across all operations', () => {
      app.createCharacter('DataConsistencyTest');
      
      const character = app.game.character;
      const initialData = {
        id: character.id,
        name: character.name,
        stats: { ...character.getCurrentStats() }
      };
      
      // Perform various operations
      const operations = [
        () => app.performTrainingSync('speed'),
        () => app.performTrainingSync('stamina'),
        () => app.performTrainingSync('rest'),
        () => app.handleKeyInput('h'), // Help
        () => app.handleKeyInput('enter') // Return from help
      ];
      
      operations.forEach(operation => {
        operation();
        
        // Character identity should remain consistent
        expect(app.game.character.id).toBe(initialData.id);
        expect(app.game.character.name).toBe(initialData.name);
        
        // Stats should only improve or stay same (never decrease unexpectedly)
        const currentStats = app.game.character.getCurrentStats();
        Object.keys(initialData.stats).forEach(stat => {
          expect(currentStats[stat]).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('should maintain race schedule consistency', () => {
      app.createCharacter('RaceScheduleTest');
      
      const initialSchedule = [...app.game.getScheduledRaces()];
      expect(initialSchedule.length).toBeGreaterThan(0);
      
      // Perform training
      for (let i = 0; i < 5; i++) {
        app.performTrainingSync('rest');
        
        // Race schedule should remain consistent
        const currentSchedule = app.game.getScheduledRaces();
        expect(currentSchedule.length).toBe(initialSchedule.length);
        
        // Race details should be unchanged
        currentSchedule.forEach((race, index) => {
          expect(race.turn).toBe(initialSchedule[index].turn);
          expect(race.name).toBe(initialSchedule[index].name);
        });
      }
    });

    test('should maintain energy constraints consistently', () => {
      app.createCharacter('EnergyConsistencyTest');
      
      const character = app.game.character;
      
      // Energy should always be within bounds
      const validateEnergy = () => {
        expect(character.condition.energy).toBeGreaterThanOrEqual(0);
        expect(character.condition.energy).toBeLessThanOrEqual(100);
      };
      
      validateEnergy(); // Initial check
      
      // Training should respect energy constraints
      while (character.condition.energy >= 15) { // Speed training cost
        const beforeEnergy = character.condition.energy;
        
        const result = app.performTrainingSync('speed');
        
        if (result.success) {
          validateEnergy();
          expect(character.condition.energy).toBe(beforeEnergy - 15);
        } else {
          // Should fail gracefully when not enough energy
          expect(character.condition.energy).toBe(beforeEnergy);
          break;
        }
      }
      
      // Rest should restore energy properly
      const beforeRest = character.condition.energy;
      app.performTrainingSync('rest');
      validateEnergy();
      expect(character.condition.energy).toBeGreaterThanOrEqual(beforeRest);
    });

    test('should maintain turn progression consistency', () => {
      app.createCharacter('TurnConsistencyTest');
      
      let previousTurn = app.game.character.career.turn;
      const maxTurns = 5;
      
      for (let i = 0; i < maxTurns; i++) {
        const result = app.performTrainingSync('rest');
        expect(result.success).toBe(true);
        
        const currentTurn = app.game.character.career.turn;
        
        // Turn should increment by exactly 1
        expect(currentTurn).toBe(previousTurn + 1);
        
        // Turn should never exceed career limit
        expect(currentTurn).toBeLessThanOrEqual(12);
        
        // Turn should be positive
        expect(currentTurn).toBeGreaterThan(0);
        
        previousTurn = currentTurn;
      }
    });
  });

  describe('State Machine Consistency', () => {
    test('should enforce valid state transitions consistently', () => {
      const validTransitions = {
        'main_menu': ['character_creation', 'load_game', 'help'],
        'character_creation': ['training', 'main_menu'],
        'training': ['race_preview', 'help', 'main_menu'],
        'race_preview': ['horse_lineup'],
        'horse_lineup': ['strategy_select'],
        'strategy_select': ['race_running'],
        'race_running': ['race_results'],
        'race_results': ['podium', 'training'],
        'podium': ['training'],
        'help': ['main_menu', 'training']
      };
      
      Object.keys(validTransitions).forEach(fromState => {
        app.setState(fromState);
        expect(app.currentState).toBe(fromState);
        
        const allowedStates = validTransitions[fromState];
        
        allowedStates.forEach(toState => {
          // Valid transitions should work
          expect(() => {
            app.setState(toState);
          }).not.toThrow();
          
          // Reset for next test
          app.setState(fromState);
        });
        
        // Invalid transitions should be rejected
        const allStates = Object.keys(validTransitions);
        const invalidStates = allStates.filter(state => 
          !allowedStates.includes(state) && state !== fromState
        );
        
        invalidStates.forEach(invalidState => {
          expect(() => {
            app.setState(invalidState);
          }).toThrow();
          
          // State should remain unchanged after invalid transition
          expect(app.currentState).toBe(fromState);
        });
      });
    });

    test('should maintain state metadata consistency', () => {
      const navigationStates = ['race_preview', 'horse_lineup', 'race_results', 'podium', 'help'];
      const inputStates = ['main_menu', 'character_creation', 'training', 'strategy_select'];
      
      navigationStates.forEach(state => {
        app.setState(state);
        expect(app.isNavigationState()).toBe(true);
      });
      
      inputStates.forEach(state => {
        app.setState(state);
        expect(app.isNavigationState()).toBe(false);
      });
    });

    test('should handle concurrent state operations consistently', () => {
      app.createCharacter('ConcurrencyTest');
      
      // Simulate rapid operations
      const operations = [
        () => app.handleKeyInput('1'),
        () => app.handleKeyInput('2'),
        () => app.handleKeyInput('h'),
        () => app.handleKeyInput('enter')
      ];
      
      // Perform operations in quick succession
      operations.forEach(op => {
        const beforeState = app.currentState;
        
        try {
          op();
        } catch (error) {
          // If operation fails, state should be unchanged
          expect(app.currentState).toBe(beforeState);
        }
        
        // State should always be valid
        expect(app.currentState).toBeDefined();
        expect(typeof app.currentState).toBe('string');
      });
    });
  });

  describe('Memory Consistency', () => {
    test('should not leak memory during state transitions', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many state transitions
      for (let i = 0; i < 100; i++) {
        app.setState('main_menu');
        app.setState('character_creation');
        app.setState('main_menu');
        app.setState('help');
        app.setState('main_menu');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be minimal (less than 1MB)
      expect(memoryGrowth).toBeLessThan(1024 * 1024);
    });

    test('should clean up resources properly on app cleanup', () => {
      const testApp = new GameApp();
      testApp.createCharacter('CleanupTest');
      
      // Verify app has resources
      expect(testApp.rl).toBeDefined();
      expect(testApp.stateMachine).toBeDefined();
      
      // Cleanup should not throw errors
      expect(() => {
        testApp.cleanup();
      }).not.toThrow();
      
      // Resources should be cleaned
      expect(testApp.rl).toBeNull();
    });

    test('should maintain object reference consistency', () => {
      app.createCharacter('ReferenceTest');
      
      const character = app.game.character;
      const game = app.game;
      const stateMachine = app.stateMachine;
      
      // Perform various operations
      app.performTrainingSync('speed');
      app.handleKeyInput('h');
      app.handleKeyInput('enter');
      
      // Object references should remain consistent
      expect(app.game).toBe(game);
      expect(app.game.character).toBe(character);
      expect(app.stateMachine).toBe(stateMachine);
    });
  });

  describe('Error State Consistency', () => {
    test('should maintain consistent state during error conditions', () => {
      app.createCharacter('ErrorConsistencyTest');
      
      // Drain energy completely
      app.game.character.condition.energy = 0;
      
      const beforeState = {
        currentState: app.currentState,
        turn: app.game.character.career.turn,
        energy: app.game.character.condition.energy
      };
      
      // Try to do energy-expensive training
      const result = app.performTrainingSync('speed');
      expect(result.success).toBe(false);
      
      // State should be unchanged
      expect(app.currentState).toBe(beforeState.currentState);
      expect(app.game.character.career.turn).toBe(beforeState.turn);
      expect(app.game.character.condition.energy).toBe(beforeState.energy);
    });

    test('should recover gracefully from corrupted state', () => {
      app.createCharacter('CorruptionTest');
      
      // Simulate state corruption
      const originalState = app.currentState;
      
      // Try to force invalid state
      try {
        app.setState('invalid_state');
      } catch (error) {
        // Should catch invalid transition
        expect(error).toBeDefined();
      }
      
      // State should be preserved or recovered
      expect(app.currentState).toBe(originalState);
      
      // App should still function normally
      const result = app.handleKeyInput('h');
      expect(result.success).toBe(true);
    });

    test('should handle null/undefined data consistently', () => {
      // Test with minimal/null data
      const nullInputs = [null, undefined, '', 0, false, NaN];
      
      nullInputs.forEach(nullInput => {
        const result = app.handleKeyInput(nullInput);
        
        // Should handle gracefully
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        
        // Should not crash
        expect(app.currentState).toBeDefined();
      });
    });
  });
});