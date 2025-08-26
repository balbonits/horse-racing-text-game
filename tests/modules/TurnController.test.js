/**
 * TurnController Module Tests
 * Tests for turn progression and race triggering logic
 */

const TurnController = require('../../src/modules/TurnController');
const Character = require('../../src/modules/Character');
const Timeline = require('../../src/modules/Timeline');
const TrainingEngine = require('../../src/modules/TrainingEngine');

describe('TurnController Module', () => {
  let controller;
  let character;
  let timeline;
  let trainingEngine;
  
  beforeEach(() => {
    character = new Character('Test Horse');
    timeline = new Timeline();
    trainingEngine = new TrainingEngine();
    controller = new TurnController(character, timeline, trainingEngine);
  });
  
  describe('Turn Processing', () => {
    test('should advance turn after training', () => {
      const initialTurn = character.career.turn;
      
      const result = controller.processTurn('speed');
      
      expect(result.success).toBe(true);
      expect(character.career.turn).toBe(initialTurn + 1);
      expect(result.gains).toBeDefined();
    });
    
    test('should trigger race on scheduled turns', () => {
      // Set up character to be on turn 3 (race should trigger after training to turn 4)
      character.career.turn = 3;
      
      const result = controller.processTurn('speed');
      
      expect(result.raceTriggered).toBe(true);
      expect(result.race).toBe('Maiden Sprint');
      expect(character.career.turn).toBe(4);
    });
    
    test('should not trigger race on non-scheduled turns', () => {
      character.career.turn = 1;
      
      const result = controller.processTurn('speed');
      
      expect(result.raceTriggered).toBeFalsy();
      expect(result.race).toBeUndefined();
      expect(character.career.turn).toBe(2);
    });

    test('should trigger second race correctly', () => {
      character.career.turn = 6;
      
      const result = controller.processTurn('stamina');
      
      expect(result.raceTriggered).toBe(true);
      expect(result.race).toBe('Mile Championship');
      expect(character.career.turn).toBe(7);
    });

    test('should handle insufficient energy gracefully', () => {
      character.condition.energy = 5;
      
      expect(() => controller.processTurn('speed')).toThrow('Insufficient energy');
      
      // Turn should not advance if training fails
      expect(character.career.turn).toBe(1);
    });
  });
  
  describe('Complete Career Flow', () => {
    test('should trigger all 4 races at correct turns', () => {
      const racesTriggered = [];
      
      // Simulate complete career (12 turns) with energy management
      for (let expectedTurn = 1; expectedTurn <= 12; expectedTurn++) {
        expect(character.career.turn).toBe(expectedTurn);
        
        // Choose training based on energy level
        const trainingType = character.condition.energy < 20 ? 'rest' : 'speed';
        const result = controller.processTurn(trainingType);
        
        if (result.raceTriggered) {
          racesTriggered.push({
            turn: character.career.turn,
            race: result.race
          });
        }
      }
      
      expect(racesTriggered).toHaveLength(4);
      expect(racesTriggered).toEqual([
        { turn: 4, race: 'Maiden Sprint' },
        { turn: 7, race: 'Mile Championship' },
        { turn: 10, race: 'Dirt Stakes' },
        { turn: 12, race: 'Turf Cup Final' }
      ]);
    });

    test('should maintain character progression throughout career', () => {
      const initialStats = { ...character.stats };
      
      // Run several training sessions
      for (let i = 0; i < 6; i++) {
        controller.processTurn('speed');
      }
      
      // Stats should have improved
      expect(character.stats.speed).toBeGreaterThan(initialStats.speed);
      expect(character.career.turn).toBe(7);
    });
  });

  describe('Race Integration', () => {
    test('should provide race context information', () => {
      character.career.turn = 3;
      
      const result = controller.processTurn('speed');
      
      expect(result.raceTriggered).toBe(true);
      expect(result.message).toContain('Maiden Sprint');
      expect(result.raceContext).toBeDefined();
    });

    test('should handle race triggers on final turn', () => {
      character.career.turn = 11;
      
      const result = controller.processTurn('power');
      
      expect(result.raceTriggered).toBe(true);
      expect(result.race).toBe('Turf Cup Final');
      expect(character.career.turn).toBe(12);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid training types', () => {
      expect(() => {
        controller.processTurn('invalid_training');
      }).toThrow();
      
      // Turn should not advance on error
      expect(character.career.turn).toBe(1);
    });

    test('should handle boundary conditions', () => {
      // Test at career start
      character.career.turn = 1;
      const result = controller.processTurn('rest');
      expect(result.success).toBe(true);
      
      // Test at career end
      character.career.turn = 12;
      const finalResult = controller.processTurn('speed');
      expect(finalResult.success).toBe(true);
      expect(character.career.turn).toBe(13); // Beyond career
    });
  });

  describe('Training Result Structure', () => {
    test('should return complete result structure', () => {
      const result = controller.processTurn('speed');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('gains');
      expect(result).toHaveProperty('newTurn');
      expect(result).toHaveProperty('raceTriggered');
      
      expect(result.newTurn).toBe(character.career.turn);
    });
  });
});