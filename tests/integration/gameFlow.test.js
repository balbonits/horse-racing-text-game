const Game = require('../../src/systems/Game');
const { TestDataFactory, TestScenarios } = require('../helpers/mockData');
const { testUtils, setupTest, teardownTest } = require('../helpers/testUtils');

describe('Game Flow Integration', () => {
  let utils;
  let game;

  beforeEach(() => {
    utils = setupTest();
    game = new Game();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Complete Career Flow', () => {
    test('runs full career from start to finish', async () => {
      // Start new game
      const startResult = game.startNewGame('Integration Test Horse');
      expect(startResult.success).toBe(true);
      expect(game.character).toBeDefined();
      
      // Track progress
      const progressTracker = {
        initialStats: { ...game.character.stats },
        trainingResults: [],
        raceResults: []
      };

      // Training phase - simulate 12 turns
      for (let turn = 1; turn <= 12; turn++) {
        const gameStatus = game.getGameStatus();
        expect(gameStatus.state).toBe('training');
        expect(gameStatus.turn).toBe(turn);
        
        // Choose training based on current needs
        let trainingType = 'speed';
        if (game.character.condition.energy < 30) {
          trainingType = 'rest';
        } else if (game.character.friendship < 60) {
          trainingType = 'social';
        }
        
        const trainingResult = game.performTraining(trainingType);
        expect(trainingResult.success).toBe(true);
        progressTracker.trainingResults.push(trainingResult);
        
        // Check for races at scheduled turns
        if (trainingResult.raceReady) {
          const raceResult = game.runRace();
          expect(raceResult.success).toBe(true);
          progressTracker.raceResults.push(raceResult);
          
          // Continue to next turn after race
          if (game.character.canContinue()) {
            game.nextTurn();
          }
        } else {
          // Advance turn if no race
          game.nextTurn();
        }
      }

      // Verify career completion
      const finalStatus = game.getGameStatus();
      expect(finalStatus.state).toBe('career_complete');
      expect(progressTracker.raceResults.length).toBe(3); // Should have 3 races
      
      // Verify stat progression
      const finalStats = game.character.getCurrentStats();
      expect(finalStats.speed).toBeGreaterThan(progressTracker.initialStats.speed);
      expect(finalStats.stamina).toBeGreaterThan(progressTracker.initialStats.stamina);
      expect(finalStats.power).toBeGreaterThan(progressTracker.initialStats.power);
      
      // Complete career and get summary
      const careerSummary = game.completeCareer();
      expect(careerSummary).toBeDefined();
      expect(careerSummary.legacyBonuses).toBeDefined();
    });

    test('handles energy management throughout career', () => {
      game.startNewGame('Energy Test Horse');
      
      const energyHistory = [];
      
      // Simulate intensive training without rest
      for (let i = 0; i < 6; i++) {
        const initialEnergy = game.character.condition.energy;
        energyHistory.push(initialEnergy);
        
        const result = game.performTraining('speed');
        
        if (!result.success && result.reason === 'Not enough energy') {
          // Should recommend rest
          const recommendations = game.getTrainingRecommendations();
          expect(recommendations.some(r => r.type === 'rest')).toBe(true);
          
          // Take rest
          const restResult = game.performTraining('rest');
          expect(restResult.success).toBe(true);
          expect(game.character.condition.energy).toBeGreaterThan(initialEnergy);
        }
      }
      
      // Energy should have varied throughout the session
      expect(new Set(energyHistory).size).toBeGreaterThan(1);
    });
  });

  describe('Race Progression', () => {
    test('races get progressively challenging', () => {
      game.startNewGame('Race Progression Horse');
      
      const raceResults = [];
      
      // Simulate career with focus on getting to races
      for (let turn = 1; turn <= 12; turn++) {
        game.character.career.turn = turn;
        
        const scheduledRace = game.checkForScheduledRace();
        if (scheduledRace) {
          const raceResult = game.runRace();
          raceResults.push({
            turn: turn,
            raceType: scheduledRace.raceType,
            position: raceResult.raceResult.playerResult.position,
            performance: raceResult.raceResult.playerResult.performance.performance
          });
        }
        
        // Do some training between races
        if (game.character.condition.energy > 30) {
          game.performTraining('speed');
        } else {
          game.performTraining('rest');
        }
        
        game.nextTurn();
      }
      
      expect(raceResults.length).toBe(3);
      
      // Verify race types progress from sprint to long distance
      expect(raceResults[0].raceType).toBe('sprint');
      expect(raceResults[1].raceType).toBe('mile');
      expect(raceResults[2].raceType).toBe('long');
    });

    test('training directly affects race performance', () => {
      utils.stubMathRandom(0.5); // Control randomness
      
      // Test with untrained horse
      const untrainedHorse = game.startNewGame('Untrained Horse');
      const untrainedRace = game.runRace('sprint');
      const untrainedPerformance = untrainedRace.raceResult.playerResult.performance.performance;
      
      // Test with trained horse
      game.startNewGame('Trained Horse');
      
      // Train extensively
      for (let i = 0; i < 8; i++) {
        if (game.character.condition.energy > 15) {
          game.performTraining('speed');
        } else {
          game.performTraining('rest');
        }
      }
      
      const trainedRace = game.runRace('sprint');
      const trainedPerformance = trainedRace.raceResult.playerResult.performance.performance;
      
      expect(trainedPerformance).toBeGreaterThan(untrainedPerformance);
    });
  });

  describe('Save/Load System Integration', () => {
    test('saves and loads game state correctly', () => {
      // Start and progress game
      game.startNewGame('Save Test Horse');
      game.performTraining('speed');
      game.performTraining('stamina');
      game.character.career.turn = 5;
      
      const originalStats = { ...game.character.stats };
      const originalTurn = game.character.career.turn;
      
      // Save game
      const saveResult = game.saveGame();
      expect(saveResult.success).toBe(true);
      
      // Create new game instance and load
      const newGame = new Game();
      const loadResult = newGame.loadGame(saveResult.saveData);
      expect(loadResult.success).toBe(true);
      
      // Verify state was restored correctly
      expect(newGame.character.name).toBe('Save Test Horse');
      expect(newGame.character.stats).toEqual(originalStats);
      expect(newGame.character.career.turn).toBe(originalTurn);
    });

    test('handles save/load errors gracefully', () => {
      game.startNewGame('Error Test Horse');
      
      // Test loading corrupted data
      const corruptedData = {
        character: { name: 'Test', stats: null }, // Invalid structure
        gameState: 'invalid_state'
      };
      
      const loadResult = game.loadGame(corruptedData);
      expect(loadResult.success).toBe(false);
      expect(loadResult.message).toContain('Failed to load');
    });
  });

  describe('Game Balance Integration', () => {
    test('different training strategies produce different outcomes', async () => {
      const strategies = [
        { name: 'Speed Focus', pattern: ['speed', 'speed', 'social', 'rest'] },
        { name: 'Balanced', pattern: ['speed', 'stamina', 'power', 'rest'] },
        { name: 'Endurance', pattern: ['stamina', 'stamina', 'power', 'rest'] }
      ];
      
      const results = [];
      
      for (const strategy of strategies) {
        game = new Game();
        game.startNewGame(`${strategy.name} Horse`);
        
        // Execute training strategy
        for (let turn = 1; turn <= 12; turn++) {
          const trainingType = strategy.pattern[(turn - 1) % strategy.pattern.length];
          
          if (game.character.condition.energy < 10) {
            game.performTraining('rest');
          } else {
            game.performTraining(trainingType);
          }
          
          game.nextTurn();
        }
        
        // Test in different race types
        const sprintResult = game.runRace('sprint');
        const mileResult = game.runRace('mile');  
        const longResult = game.runRace('long');
        
        results.push({
          strategy: strategy.name,
          finalStats: game.character.getCurrentStats(),
          racePerformances: {
            sprint: sprintResult.raceResult.playerResult.performance.performance,
            mile: mileResult.raceResult.playerResult.performance.performance,
            long: longResult.raceResult.playerResult.performance.performance
          }
        });
      }
      
      // Verify strategies produce meaningfully different results
      const speedFocus = results.find(r => r.strategy === 'Speed Focus');
      const endurance = results.find(r => r.strategy === 'Endurance');
      
      expect(speedFocus.finalStats.speed).toBeGreaterThan(endurance.finalStats.speed);
      expect(endurance.finalStats.stamina).toBeGreaterThan(speedFocus.finalStats.stamina);
      expect(speedFocus.racePerformances.sprint).toBeGreaterThan(endurance.racePerformances.sprint);
    });

    test('friendship system provides meaningful bonuses', () => {
      utils.stubMathRandom(0.8); // Consistent results
      
      // Test low friendship training
      game.startNewGame('Low Friendship Horse');
      game.character.friendship = 20;
      
      const lowFriendshipGain = game.performTraining('speed');
      const lowGain = lowFriendshipGain.statGains.speed || 0;
      
      // Test high friendship training
      game.character.friendship = 90;
      const highFriendshipGain = game.performTraining('speed');
      const highGain = highFriendshipGain.statGains.speed || 0;
      
      expect(highGain).toBeGreaterThan(lowGain * 1.3); // Should be significantly better
    });
  });

  describe('Error Recovery Integration', () => {
    test('recovers from invalid game states', () => {
      game.startNewGame('Recovery Test');
      
      // Force invalid state
      game.gameState = 'invalid_state';
      game.character.condition.energy = -50; // Invalid energy
      
      // System should handle gracefully
      const status = game.getGameStatus();
      expect(status).toBeDefined();
      
      // Fix energy
      game.character.changeEnergy(100);
      expect(game.character.condition.energy).toBe(50); // Clamped to valid range
    });

    test('handles race simulation failures', () => {
      game.startNewGame('Simulation Test');
      
      // Inject error into race simulation
      const originalSimulate = game.raceSimulator.simulateRace;
      game.raceSimulator.simulateRace = utils.createStub().throws(new Error('Simulation failed'));
      
      const raceResult = game.runRace();
      expect(raceResult.success).toBe(false);
      
      // Restore and verify recovery
      game.raceSimulator.simulateRace = originalSimulate;
      const recoveredRace = game.runRace();
      expect(recoveredRace.success).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    test('full career completion performs efficiently', async () => {
      const { PerformanceTestUtils } = require('../helpers/mockData');
      
      const perfResults = PerformanceTestUtils.measureExecutionTime(() => {
        game.startNewGame('Performance Test');
        
        // Quick career simulation
        for (let turn = 1; turn <= 12; turn++) {
          game.performTraining(turn % 2 === 0 ? 'speed' : 'rest');
          
          if (game.checkForScheduledRace()) {
            game.runRace();
          }
          
          game.nextTurn();
        }
        
        game.completeCareer();
      }, 10);
      
      // Should complete career in reasonable time
      expect(perfResults.averageTime).toBeLessThan(100); // Less than 100ms per career
    });

    test('memory usage remains stable during gameplay', () => {
      const { PerformanceTestUtils } = require('../helpers/mockData');
      
      const memoryResults = PerformanceTestUtils.measureMemoryUsage(() => {
        for (let career = 0; career < 5; career++) {
          game = new Game();
          game.startNewGame(`Career ${career}`);
          
          for (let turn = 1; turn <= 12; turn++) {
            game.performTraining('speed');
            game.nextTurn();
          }
          
          game.completeCareer();
        }
      });
      
      // Should not accumulate excessive memory
      expect(memoryResults.heapUsedDiff).toBeLessThan(20 * 1024 * 1024); // Less than 20MB
    });
  });

  describe('User Experience Flow', () => {
    test('provides consistent feedback throughout gameplay', () => {
      game.startNewGame('UX Test Horse');
      
      const feedbackLog = [];
      
      // Track all user-facing messages
      for (let turn = 1; turn <= 6; turn++) {
        const trainingResult = game.performTraining('speed');
        feedbackLog.push(...trainingResult.messages);
        
        const status = game.getGameStatus();
        if (status.nextRace) {
          feedbackLog.push(`Next race: ${status.nextRace.name}`);
        }
      }
      
      // Should provide meaningful feedback
      expect(feedbackLog.length).toBeGreaterThan(3);
      expect(feedbackLog.every(msg => typeof msg === 'string')).toBe(true);
      expect(feedbackLog.some(msg => msg.includes('increased'))).toBe(true);
    });

    test('maintains game progression pacing', () => {
      game.startNewGame('Pacing Test Horse');
      
      const progressionMarkers = [];
      
      for (let turn = 1; turn <= 12; turn++) {
        const initialStats = game.character.stats.speed + game.character.stats.stamina + game.character.stats.power;
        
        game.performTraining('speed');
        
        const finalStats = game.character.stats.speed + game.character.stats.stamina + game.character.stats.power;
        const progress = finalStats - initialStats;
        
        progressionMarkers.push(progress);
        
        if (game.character.condition.energy < 20) {
          game.performTraining('rest');
        }
        
        game.nextTurn();
      }
      
      // Progress should be consistently positive
      expect(progressionMarkers.every(p => p >= 0)).toBe(true);
      const totalProgress = progressionMarkers.reduce((sum, p) => sum + p, 0);
      expect(totalProgress).toBeGreaterThan(50); // Meaningful progression
    });
  });
});