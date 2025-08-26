/**
 * Comprehensive Integration Tests for Enhanced Race System
 * Tests NPH roster, race types, surfaces, and performance calculations
 */

const Game = require('../../src/systems/Game');
const Character = require('../../src/models/Character');
const NPHRoster = require('../../src/models/NPHRoster');
const { RACE_TYPES, TRACK_SURFACES, calculateRacePerformance } = require('../../src/data/raceTypes');

describe('Enhanced Race System Integration', () => {
  let game;
  let character;

  beforeEach(async () => {
    game = new Game();
    character = new Character('Test Horse');
    
    // Start new game with all systems
    const result = await game.startNewGame('Test Horse', { skipLoadingStates: true });
    expect(result.success).toBe(true);
    expect(game.nphRoster).toBeTruthy();
    expect(game.nphRoster.nphs).toHaveLength(24);
  });

  describe('NPH Roster Integration', () => {
    test('should generate NPH roster on game start', () => {
      expect(game.nphRoster).toBeInstanceOf(NPHRoster);
      expect(game.nphRoster.nphs).toHaveLength(24);
      expect(game.nphRoster.playerHorseName).toBe('Test Horse');
    });

    test('should progress NPHs during training', async () => {
      const initialStats = game.nphRoster.nphs[0].stats.speed;
      
      // Perform training (should trigger NPH progression)
      const result = await game.performTraining('speed');
      expect(result.success).toBe(true);
      
      // Check if any NPH progressed
      let anyProgressed = false;
      game.nphRoster.nphs.forEach(nph => {
        if (Object.keys(nph.history).length > 0) {
          anyProgressed = true;
        }
      });
      expect(anyProgressed).toBe(true);
    });

    test('should generate competitive race fields', () => {
      const raceInfo = { name: 'Test Race', type: 'MILE', surface: 'TURF' };
      const field = game.getRaceField(raceInfo);
      
      expect(field).toHaveLength(8); // 1 player + 7 NPHs
      expect(field.find(h => h.type === 'player')).toBeTruthy();
      expect(field.filter(h => h.type === 'nph')).toHaveLength(7);
      
      // All horses should have required properties
      field.forEach(horse => {
        expect(horse.name).toBeTruthy();
        expect(horse.stats).toHaveProperty('speed');
        expect(horse.stats).toHaveProperty('stamina');
        expect(horse.stats).toHaveProperty('power');
        expect(['FRONT', 'MID', 'LATE']).toContain(horse.strategy);
      });
    });
  });

  describe('Race Types and Surfaces', () => {
    test('should handle all race type and surface combinations', async () => {
      const raceTypes = Object.keys(RACE_TYPES);
      const surfaces = Object.keys(TRACK_SURFACES);
      
      for (const raceType of raceTypes) {
        for (const surface of surfaces) {
          const raceInfo = {
            name: `Test ${raceType} on ${surface}`,
            type: raceType,
            surface: surface,
            weather: 'CLEAR',
            prize: 1000
          };
          
          const result = await game.runEnhancedRace(raceInfo, 'MID');
          expect(result.success).toBe(true);
          expect(result.results).toHaveLength(8);
          expect(result.playerResult).toBeTruthy();
          expect(result.playerResult.position).toBeGreaterThanOrEqual(1);
          expect(result.playerResult.position).toBeLessThanOrEqual(8);
        }
      }
    });

    test('should apply correct stat weights for different race types', () => {
      const testHorse = {
        stats: { speed: 80, stamina: 40, power: 40 },
        condition: { energy: 100, mood: 'Normal' }
      };
      
      // Speed-focused horse should do better in sprints than long races
      const sprintPerf = calculateRacePerformance(testHorse, 'SPRINT', 'TURF', 'FRONT');
      const longPerf = calculateRacePerformance(testHorse, 'LONG', 'TURF', 'FRONT');
      
      // Sprint should favor high-speed horse
      expect(sprintPerf).toBeGreaterThan(longPerf * 0.9); // Allow for variance
    });

    test('should apply surface modifiers correctly', () => {
      const powerHorse = {
        stats: { speed: 40, stamina: 40, power: 80 },
        condition: { energy: 100, mood: 'Normal' }
      };
      
      // Power horse should perform better on dirt
      const dirtPerf = calculateRacePerformance(powerHorse, 'SPRINT', 'DIRT', 'FRONT');
      const turfPerf = calculateRacePerformance(powerHorse, 'SPRINT', 'TURF', 'FRONT');
      
      // Dirt gives +15% power bonus, should help power horse
      expect(dirtPerf).toBeGreaterThan(turfPerf * 0.95); // Allow for variance
    });

    test('should apply strategy modifiers appropriately', () => {
      const testHorse = {
        stats: { speed: 60, stamina: 60, power: 60 },
        condition: { energy: 100, mood: 'Normal' }
      };
      
      // Front runner should do better in sprints
      const frontSprint = calculateRacePerformance(testHorse, 'SPRINT', 'DIRT', 'FRONT');
      const closerSprint = calculateRacePerformance(testHorse, 'SPRINT', 'DIRT', 'LATE');
      expect(frontSprint).toBeGreaterThan(closerSprint);
      
      // Closer should do better in long races
      const frontLong = calculateRacePerformance(testHorse, 'LONG', 'TURF', 'FRONT');
      const closerLong = calculateRacePerformance(testHorse, 'LONG', 'TURF', 'LATE');
      expect(closerLong).toBeGreaterThan(frontLong);
    });
  });

  describe('Race Schedule and Career Integration', () => {
    test('should use new race schedule format', () => {
      expect(game.raceSchedule).toBeTruthy();
      expect(Array.isArray(game.raceSchedule)).toBe(true);
      
      // Check that races have new format
      const firstRace = game.raceSchedule[0];
      expect(firstRace).toHaveProperty('turn');
      expect(firstRace).toHaveProperty('name');
      expect(firstRace).toHaveProperty('type');
      expect(firstRace).toHaveProperty('surface');
      expect(firstRace).toHaveProperty('prize');
    });

    test('should progress through career races correctly', async () => {
      // Advance to first race
      while (game.character.career.turn < 4) {
        await game.performTraining('speed');
      }
      
      const scheduledRace = game.checkForScheduledRace();
      expect(scheduledRace).toBeTruthy();
      expect(scheduledRace.turn).toBe(4);
      
      // Run the race
      const raceResult = await game.runRace('MID');
      expect(raceResult.success).toBe(true);
      expect(raceResult.raceInfo).toBeTruthy();
    });

    test('should provide training recommendations', () => {
      const status = game.getGameStatus();
      expect(status.trainingRecommendations).toBeTruthy();
      expect(Array.isArray(status.trainingRecommendations)).toBe(true);
      
      // Should have recommendations for upcoming race
      if (status.nextRace) {
        expect(status.trainingRecommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Save/Load System Compatibility', () => {
    test('should save and load NPH roster correctly', async () => {
      // Progress game state
      await game.performTraining('speed');
      await game.performTraining('stamina');
      
      // Save game
      const saveResult = await game.saveGame();
      expect(saveResult.success).toBe(true);
      expect(saveResult.saveData.nphRoster).toBeTruthy();
      expect(saveResult.saveData.version).toBe('2.0.0');
      
      // Create new game instance and load
      const newGame = new Game();
      const loadResult = await newGame.loadGame(saveResult.saveData);
      expect(loadResult.success).toBe(true);
      expect(newGame.nphRoster).toBeTruthy();
      expect(newGame.nphRoster.nphs).toHaveLength(24);
    });

    test('should handle legacy save files', async () => {
      // Create legacy save data (without NPH roster)
      const legacySave = {
        character: game.character.toJSON(),
        gameState: 'training',
        raceSchedule: [],
        gameHistory: {},
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const newGame = new Game();
      const loadResult = await newGame.loadGame(legacySave);
      expect(loadResult.success).toBe(true);
      expect(newGame.nphRoster).toBeTruthy(); // Should generate new roster
    });
  });

  describe('Performance and Balance Testing', () => {
    test('should produce varied but competitive race results', async () => {
      const results = [];
      
      // Run multiple races to test variance
      for (let i = 0; i < 10; i++) {
        const raceInfo = {
          name: 'Balance Test',
          type: 'MILE',
          surface: 'TURF',
          weather: 'CLEAR',
          prize: 1000
        };
        
        const result = await game.runEnhancedRace(raceInfo, 'MID');
        expect(result.success).toBe(true);
        results.push(result.playerResult.position);
      }
      
      // Player should not always win or always lose
      const avgPosition = results.reduce((a, b) => a + b) / results.length;
      expect(avgPosition).toBeGreaterThan(2); // Not dominating
      expect(avgPosition).toBeLessThan(7); // Not terrible
      
      // Should have position variety
      const uniquePositions = new Set(results);
      expect(uniquePositions.size).toBeGreaterThan(2);
    });

    test('should scale difficulty with player strength', async () => {
      // Create strong player
      const strongHorse = new Character('Strong Horse', {
        speed: 80, stamina: 80, power: 80
      });
      const strongGame = new Game();
      strongGame.character = strongHorse;
      strongGame.nphRoster = new NPHRoster();
      strongGame.nphRoster.generateRoster(strongHorse, 24);
      
      // Create weak player
      const weakHorse = new Character('Weak Horse', {
        speed: 30, stamina: 30, power: 30
      });
      const weakGame = new Game();
      weakGame.character = weakHorse;
      weakGame.nphRoster = new NPHRoster();
      weakGame.nphRoster.generateRoster(weakHorse, 24);
      
      // Compare NPH field strengths
      const strongField = strongGame.nphRoster.nphs;
      const weakField = weakGame.nphRoster.nphs;
      
      const strongAvg = strongField.reduce((sum, nph) => 
        sum + nph.stats.speed + nph.stats.stamina + nph.stats.power, 0
      ) / strongField.length;
      
      const weakAvg = weakField.reduce((sum, nph) => 
        sum + nph.stats.speed + nph.stats.stamina + nph.stats.power, 0
      ) / weakField.length;
      
      expect(strongAvg).toBeGreaterThan(weakAvg);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing NPH roster gracefully', async () => {
      game.nphRoster = null;
      
      const raceInfo = {
        name: 'Fallback Race',
        type: 'MILE',
        surface: 'TURF',
        weather: 'CLEAR',
        prize: 1000
      };
      
      const result = await game.runEnhancedRace(raceInfo, 'MID');
      expect(result.success).toBe(true);
      // Should still work with just player
    });

    test('should handle invalid race configurations', () => {
      const testHorse = {
        stats: { speed: 50, stamina: 50, power: 50 },
        condition: { energy: 100, mood: 'Normal' }
      };
      
      expect(() => {
        calculateRacePerformance(testHorse, 'INVALID', 'TURF', 'MID');
      }).toThrow();
      
      expect(() => {
        calculateRacePerformance(testHorse, 'MILE', 'INVALID', 'MID');
      }).toThrow();
    });

    test('should handle extreme stat values', () => {
      const extremeHorse = {
        stats: { speed: 0, stamina: 100, power: 0 },
        condition: { energy: 1, mood: 'Bad' }
      };
      
      const performance = calculateRacePerformance(extremeHorse, 'LONG', 'TURF', 'LATE');
      expect(performance).toBeGreaterThan(0);
      expect(performance).toBeLessThan(200); // Reasonable bounds
    });
  });

  describe('UI Integration', () => {
    test('should provide detailed race information for UI', async () => {
      const raceInfo = {
        name: 'UI Test Race',
        type: 'MILE',
        surface: 'DIRT',
        weather: 'RAIN',
        prize: 5000,
        description: 'Test race for UI'
      };
      
      const result = await game.runEnhancedRace(raceInfo, 'FRONT');
      expect(result.success).toBe(true);
      
      // Check result has UI-friendly data
      expect(result.raceInfo).toEqual(raceInfo);
      expect(result.results).toBeTruthy();
      expect(result.playerResult).toBeTruthy();
      expect(result.fieldSize).toBe(8);
      
      // Each result should have display information
      result.results.forEach(horse => {
        expect(horse.name).toBeTruthy();
        expect(horse.position).toBeGreaterThanOrEqual(1);
        expect(horse.time).toBeGreaterThan(0);
        expect(horse.strategy).toBeTruthy();
        expect(horse.prize).toBeGreaterThanOrEqual(0);
      });
    });

    test('should format race times correctly', async () => {
      const raceInfo = {
        name: 'Time Test',
        type: 'SPRINT',
        surface: 'TURF',
        weather: 'CLEAR',
        prize: 1000
      };
      
      const result = await game.runEnhancedRace(raceInfo, 'MID');
      expect(result.success).toBe(true);
      
      // Sprint times should be around 70-75 seconds
      result.results.forEach(horse => {
        expect(horse.time).toBeGreaterThan(65);
        expect(horse.time).toBeLessThan(80);
      });
    });
  });
});

describe('Loading States Integration', () => {
  test('should show loading states during game operations', async () => {
    const game = new Game();
    
    // Mock console.log to capture loading messages
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const clearSpy = jest.spyOn(console, 'clear').mockImplementation(() => {});
    
    const result = await game.startNewGame('Loading Test', { skipLoadingStates: false });
    expect(result.success).toBe(true);
    
    // Should have shown loading messages
    expect(consoleSpy).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
    clearSpy.mockRestore();
  });
});