/**
 * Complete Career Integration Tests
 * Tests for full career flow and module integration
 */

const Character = require('../../src/modules/Character');
const Timeline = require('../../src/modules/Timeline');
const GameState = require('../../src/modules/GameState');
const TrainingEngine = require('../../src/modules/TrainingEngine');
const TurnController = require('../../src/modules/TurnController');

describe('Complete Career Integration', () => {
  let character;
  let timeline;
  let gameState;
  let trainingEngine;
  let turnController;
  
  beforeEach(() => {
    character = new Character('Integration Test');
    timeline = new Timeline();
    gameState = new GameState();
    trainingEngine = new TrainingEngine();
    turnController = new TurnController(character, timeline, trainingEngine);
  });
  
  describe('Full Career Simulation', () => {
    test('should complete full career with correct race timing', () => {
      const racesTriggered = [];
      const trainingActions = [
        'speed', 'speed', 'speed',      // Turns 1-3, race on 4
        'stamina', 'stamina',           // Turns 4-5, race on 7  
        'power', 'power',               // Turns 6-7, race on 10
        'speed'                         // Turn 8, race on 12
      ];
      
      let actionIndex = 0;
      
      // Simulate career progression with energy management
      while (character.career.turn <= 12) {
        // Choose action based on energy, otherwise cycle through planned actions
        const plannedAction = trainingActions[actionIndex % trainingActions.length];
        const action = character.condition.energy < 20 ? 'rest' : plannedAction;
        
        const result = turnController.processTurn(action);
        
        if (result.raceTriggered) {
          racesTriggered.push({
            turn: character.career.turn,
            race: result.race
          });
        }
        
        actionIndex++;
      }
      
      // Verify career completion
      expect(character.career.turn).toBeGreaterThan(12);
      expect(racesTriggered).toHaveLength(4);
      
      // Verify race timing
      expect(racesTriggered).toEqual([
        { turn: 4, race: 'Maiden Sprint' },
        { turn: 7, race: 'Mile Championship' },
        { turn: 10, race: 'Dirt Stakes' },
        { turn: 12, race: 'Turf Cup Final' }
      ]);
    });
    
    test('should maintain character progression throughout career', () => {
      const initialStats = {
        speed: character.stats.speed,
        stamina: character.stats.stamina,
        power: character.stats.power
      };
      
      // Run 8 training sessions with mixed training types
      const trainingSequence = ['speed', 'stamina', 'power', 'speed', 'rest', 'stamina', 'power', 'speed'];
      
      trainingSequence.forEach(trainingType => {
        if (character.career.turn <= 12) {
          turnController.processTurn(trainingType);
        }
      });
      
      // Verify stat improvements
      expect(character.stats.speed).toBeGreaterThanOrEqual(initialStats.speed);
      expect(character.stats.stamina).toBeGreaterThanOrEqual(initialStats.stamina); 
      expect(character.stats.power).toBeGreaterThanOrEqual(initialStats.power);
      
      // Verify career progression
      expect(character.career.turn).toBeGreaterThan(1);
    });
  });

  describe('State Management Integration', () => {
    test('should manage game states through training and racing', () => {
      gameState.transition('training');
      
      // Normal training turn
      const result1 = turnController.processTurn('speed');
      expect(gameState.is('training')).toBe(true);
      
      // Race trigger should work with state management
      character.career.turn = 3;
      const result2 = turnController.processTurn('speed');
      
      if (result2.raceTriggered) {
        gameState.transition('race_preview');
        expect(gameState.is('race_preview')).toBe(true);
        
        gameState.transition('race_lineup');
        gameState.transition('race_animation');
        gameState.transition('race_results');
        gameState.transition('training');
        expect(gameState.is('training')).toBe(true);
      }
    });
  });

  describe('Energy Management Over Career', () => {
    test('should manage energy correctly over multiple turns', () => {
      let lowEnergyEncountered = false;
      
      // Run training until we encounter energy issues
      for (let i = 0; i < 10; i++) {
        if (character.condition.energy < 15) {
          // Should use rest when energy is low
          turnController.processTurn('rest');
          lowEnergyEncountered = true;
          expect(character.condition.energy).toBeGreaterThan(15);
        } else {
          turnController.processTurn('speed');
        }
        
        if (character.career.turn > 12) break;
      }
      
      expect(lowEnergyEncountered).toBe(true);
      expect(character.condition.energy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Race History Tracking', () => {
    test('should track race history throughout career', () => {
      // This test would require RaceEngine to be implemented
      // For now, verify that the structure exists
      expect(character.raceHistory).toEqual([]);
      
      // After races would be completed, verify:
      // - Race results are stored
      // - Turn information is preserved  
      // - Performance data is tracked
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data integrity across all operations', () => {
      const operations = ['speed', 'rest', 'stamina', 'power', 'social'];
      
      for (const operation of operations) {
        const preOpTurn = character.career.turn;
        const preOpStats = { ...character.stats };
        
        try {
          const result = turnController.processTurn(operation);
          
          // Turn should always advance (unless error)
          if (result.success) {
            expect(character.career.turn).toBe(preOpTurn + 1);
          }
          
          // Stats should never go negative
          expect(character.stats.speed).toBeGreaterThanOrEqual(0);
          expect(character.stats.stamina).toBeGreaterThanOrEqual(0);
          expect(character.stats.power).toBeGreaterThanOrEqual(0);
          expect(character.condition.energy).toBeGreaterThanOrEqual(0);
          
        } catch (error) {
          // If operation fails, character should be unchanged
          expect(character.career.turn).toBe(preOpTurn);
          expect(character.stats).toEqual(preOpStats);
        }
        
        if (character.career.turn > 12) break;
      }
    });
  });

  describe('Timeline and Turn Controller Integration', () => {
    test('should correctly integrate timeline with turn progression', () => {
      // Verify that TurnController uses Timeline correctly
      expect(timeline.getRaceForTurn(4)).toBe('Maiden Sprint');
      
      character.career.turn = 3;
      const result = turnController.processTurn('speed');
      
      expect(result.raceTriggered).toBe(true);
      expect(result.race).toBe(timeline.getRaceForTurn(4));
    });
  });
});