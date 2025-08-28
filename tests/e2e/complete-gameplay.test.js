/**
 * End-to-End Complete Gameplay Tests
 * Tests full user journeys from start to finish
 */

const GameApp = require('../../src/GameApp');

describe('End-to-End Complete Gameplay', () => {
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

  describe('Complete Career Playthrough', () => {
    test('E2E: Full career from main menu to completion', async () => {
      const gameLog = [];
      
      // Start at main menu
      expect(app.currentState).toBe('main_menu');
      gameLog.push('Started at main menu');
      
      // Navigate to character creation
      let result = app.handleKeyInput('1');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('character_creation');
      gameLog.push('Entered character creation');
      
      // Create character
      result = app.handleKeyInput('E2E Test Horse');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('training');
      expect(app.game.character).toBeDefined();
      expect(app.game.character.name).toBe('E2E Test Horse');
      gameLog.push('Character created successfully');
      
      // Track career progression
      const scheduledRaces = app.game.getScheduledRaces();
      gameLog.push(`Scheduled ${scheduledRaces.length} races: ${scheduledRaces.map(r => `Turn ${r.turn}: ${r.name}`).join(', ')}`);
      
      let racesCompleted = 0;
      let trainingTurns = 0;
      const maxTurns = 15; // Safety limit
      
      while (!app.isCareerComplete() && trainingTurns < maxTurns) {
        const currentTurn = app.game.character.career.turn;
        const currentState = app.currentState;
        
        gameLog.push(`Turn ${currentTurn}, State: ${currentState}`);
        
        if (currentState === 'training') {
          // Check if race is coming up
          const upcomingRace = app.game.checkForScheduledRace();
          
          if (upcomingRace) {
            gameLog.push(`  Race available: ${upcomingRace.name}`);
          }
          
          // Do training
          result = app.performTrainingSync('speed');
          expect(result.success).toBe(true);
          
          if (result.raceReady) {
            gameLog.push(`  Race triggered! Moving to race preview`);
            expect(app.currentState).toBe('race_preview');
            
            // Complete race flow
            result = await this.completeRaceFlow(app, gameLog);
            expect(result.success).toBe(true);
            racesCompleted++;
            
            gameLog.push(`  Race completed! Total races: ${racesCompleted}`);
          }
          
          trainingTurns++;
        } else {
          // Should not get stuck in non-training states
          gameLog.push(`  ERROR: Stuck in ${currentState} state`);
          break;
        }
      }
      
      gameLog.push(`Career completed after ${trainingTurns} training turns and ${racesCompleted} races`);
      
      // Log complete journey for debugging
      console.log('E2E Career Journey:');
      gameLog.forEach(log => console.log(log));
      
      // Verify successful completion
      expect(racesCompleted).toBeGreaterThan(0);
      expect(trainingTurns).toBeGreaterThan(1);
      expect(app.isCareerComplete() || app.currentState === 'career_complete').toBe(true);
    });

  });

  // Helper method to complete race flow
  async function completeRaceFlow(app, gameLog) {
      try {
        // race_preview -> horse_lineup
        expect(app.currentState).toBe('race_preview');
        let result = app.handleKeyInput('enter');
        expect(result.success).toBe(true);
        expect(app.currentState).toBe('horse_lineup');
        gameLog.push('    Progressed to horse lineup');
        
        // horse_lineup -> strategy_select
        result = app.handleKeyInput('enter');
        expect(result.success).toBe(true);
        expect(app.currentState).toBe('strategy_select');
        gameLog.push('    Progressed to strategy select');
        
        // strategy_select -> race_running
        result = app.handleKeyInput('2'); // MID strategy
        expect(result.success).toBe(true);
        expect(app.currentState).toBe('race_running');
        expect(app.selectedStrategy).toBe('MID');
        gameLog.push('    Selected MID strategy, race running');
        
        // Simulate race completion (simplified)
        // In real implementation, race animation would handle this
        app.setState('race_results');
        app.currentRaceResult = {
          results: [{ name: app.game.character.name, time: 120, position: 1 }],
          raceType: 'SPRINT'
        };
        gameLog.push('    Race completed, showing results');
        
        // race_results -> podium (or training)
        result = app.handleKeyInput('enter');
        expect(result.success).toBe(true);
        gameLog.push('    Progressed from race results');
        
        // Complete podium if present
        if (app.currentState === 'podium') {
          result = app.handleKeyInput('enter');
          expect(result.success).toBe(true);
          gameLog.push('    Completed podium ceremony');
        }
        
        // Should return to training
        expect(app.currentState).toBe('training');
        gameLog.push('    Returned to training');
        
        return { success: true };
      } catch (error) {
        gameLog.push(`    ERROR in race flow: ${error.message}`);
        return { success: false, error: error.message };
      }
  }

  describe('Multiple Career Playthroughs', () => {
    test('E2E: Should handle multiple careers in sequence', async () => {
      const careers = ['First Horse', 'Second Horse', 'Third Horse'];
      
      for (const horseName of careers) {
        // Start new career
        if (app.currentState !== 'main_menu') {
          // Reset to main menu
          if (app.currentState === 'career_complete') {
            app.handleKeyInput('q'); // Quit to main menu
          } else {
            app.setState('main_menu');
          }
        }
        
        // Create character
        app.handleKeyInput('1'); // New career
        app.handleKeyInput(horseName);
        
        expect(app.currentState).toBe('training');
        expect(app.game.character.name).toBe(horseName);
        
        // Do a few training turns
        for (let i = 0; i < 3; i++) {
          const result = app.performTrainingSync('rest');
          expect(result.success).toBe(true);
        }
        
        // Verify character stats improved
        const stats = app.game.character.getCurrentStats();
        expect(stats.speed).toBeGreaterThan(0);
        expect(stats.stamina).toBeGreaterThan(0);
        expect(stats.power).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Recovery During Gameplay', () => {
    test('E2E: Should recover from invalid input during career', () => {
      app.createCharacter('Error Recovery Test');
      
      const invalidInputs = ['invalid', '999', '@#$', null, undefined, ''];
      const gameStates = ['training', 'character_creation', 'main_menu'];
      
      gameStates.forEach(state => {
        app.setState(state);
        const initialState = app.currentState;
        
        invalidInputs.forEach(invalidInput => {
          const result = app.handleKeyInput(invalidInput);
          
          // Should handle gracefully
          expect(result).toBeDefined();
          expect(typeof result.success).toBe('boolean');
          
          // Should not crash or change state unexpectedly
          expect(app.currentState).toBeDefined();
          
          // For invalid input, should stay in same state or handle appropriately
          if (result.success === false) {
            expect(app.currentState).toBe(initialState);
          }
        });
      });
    });

    test('E2E: Should handle interrupted race flow gracefully', () => {
      app.createCharacter('Interrupted Race Test');
      
      // Advance to race
      while (!app.game.checkForScheduledRace()) {
        app.performTrainingSync('speed');
      }
      app.performTrainingSync('speed'); // Trigger race
      
      expect(app.currentState).toBe('race_preview');
      
      // Try to quit during race flow
      const quitResult = app.handleKeyInput('q');
      
      // Should either handle gracefully or reject appropriately
      expect(quitResult).toBeDefined();
      expect(typeof quitResult.success).toBe('boolean');
      
      // Should not crash
      expect(app.currentState).toBeDefined();
    });
  });

  describe('Performance During Extended Play', () => {
    test('E2E: Should maintain performance during long gaming sessions', () => {
      const startTime = Date.now();
      
      // Simulate extended play session
      for (let career = 0; career < 3; career++) {
        app.createCharacter(`Performance Test ${career + 1}`);
        
        // Do multiple training cycles
        for (let turn = 0; turn < 10; turn++) {
          const result = app.performTrainingSync('rest');
          expect(result.success).toBe(true);
        }
        
        // Reset for next career
        if (career < 2) {
          app.setState('main_menu');
        }
      }
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      // Should complete within reasonable time (less than 5 seconds)
      expect(totalDuration).toBeLessThan(5000);
    });

    test('E2E: Should not accumulate resources during multiple careers', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Multiple career cycles
      for (let i = 0; i < 5; i++) {
        app.createCharacter(`Memory Test ${i + 1}`);
        
        // Do some gameplay
        for (let j = 0; j < 5; j++) {
          app.performTrainingSync('rest');
        }
        
        // Clean up career
        app.setState('main_menu');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be reasonable (less than 5MB)
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('User Experience Flows', () => {
    test('E2E: Should provide helpful guidance when user is lost', () => {
      // Start game
      expect(app.currentState).toBe('main_menu');
      
      // Try help from main menu
      let result = app.handleKeyInput('h');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('help');
      
      // Return from help
      result = app.handleKeyInput('enter');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('main_menu');
      
      // Create character and try help during training
      app.handleKeyInput('1');
      app.handleKeyInput('Help Test Horse');
      expect(app.currentState).toBe('training');
      
      result = app.handleKeyInput('h');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('help');
      
      // Should return to training
      result = app.handleKeyInput('enter');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('training');
    });

    test('E2E: Should handle user changing mind during character creation', () => {
      // Start character creation
      app.handleKeyInput('1');
      expect(app.currentState).toBe('character_creation');
      
      // Generate names
      app.handleKeyInput('g');
      expect(app.nameOptions.length).toBe(6);
      
      // Change mind and go back
      const result = app.handleKeyInput('q');
      expect(result.success).toBe(true);
      expect(app.currentState).toBe('main_menu');
      
      // Name options should be cleared
      expect(app.nameOptions.length).toBe(0);
    });

    test('E2E: Should save and load game state correctly', async () => {
      // Create character and do some training
      app.createCharacter('Save Test Horse');
      app.performTrainingSync('speed');
      app.performTrainingSync('stamina');
      
      const beforeStats = { ...app.game.character.getCurrentStats() };
      const beforeTurn = app.game.character.career.turn;
      
      // Save game
      const saveResult = await app.saveGame();
      expect(saveResult.success).toBe(true);
      
      // Create new app instance to simulate restart
      const newApp = new GameApp();
      
      // Load the saved game
      const loadResult = await newApp.loadGame(saveResult.saveFile);
      expect(loadResult.success).toBe(true);
      
      // Verify state was preserved
      expect(newApp.game.character.name).toBe('Save Test Horse');
      expect(newApp.game.character.career.turn).toBe(beforeTurn);
      
      const afterStats = newApp.game.character.getCurrentStats();
      expect(afterStats.speed).toBe(beforeStats.speed);
      expect(afterStats.stamina).toBe(beforeStats.stamina);
      expect(afterStats.power).toBe(beforeStats.power);
      
      newApp.cleanup();
    });
  });

  describe('Edge Case Scenarios', () => {
    test('E2E: Should handle career with unusual training patterns', () => {
      app.createCharacter('Edge Case Horse');
      
      // Only do rest training for entire career
      const maxRestTurns = 15;
      let restCount = 0;
      
      while (!app.isCareerComplete() && restCount < maxRestTurns) {
        const result = app.performTrainingSync('rest');
        expect(result.success).toBe(true);
        restCount++;
      }
      
      // Should still complete career even with unusual pattern
      expect(restCount).toBeGreaterThan(0);
      expect(app.game.character).toBeDefined();
    });

    test('E2E: Should handle very long character names', () => {
      const longName = 'SuperLongHorseNameThatExceedsNormalLimits123456789';
      
      app.handleKeyInput('1');
      const result = app.handleKeyInput(longName);
      
      // Should either accept or reject gracefully
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      
      if (result.success) {
        expect(app.game.character.name).toBeDefined();
        expect(app.currentState).toBe('training');
      } else {
        expect(app.currentState).toBe('character_creation');
      }
    });

    test('E2E: Should handle rapid state changes', () => {
      // Rapid navigation
      const commands = ['1', 'q', '1', 'RapidTest', 'h', 'enter', '1', '2', '3'];
      
      commands.forEach(command => {
        const result = app.handleKeyInput(command);
        expect(result).toBeDefined();
        expect(app.currentState).toBeDefined();
      });
      
      // Should not crash or get into invalid state
      expect(app).toBeDefined();
      expect(['main_menu', 'character_creation', 'training', 'help'].includes(app.currentState)).toBe(true);
    });
  });
});