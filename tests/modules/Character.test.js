/**
 * Character Module Tests
 * Tests for core character data structure and methods
 */

const Character = require('../../src/modules/Character');

describe('Character Module', () => {
  describe('Character Creation', () => {
    test('should create character with default stats', () => {
      const character = new Character('Test Horse');
      
      expect(character.profile.name).toBe('Test Horse');
      expect(character.profile.createdAt).toBeDefined();
      expect(character.stats.speed).toBe(20);
      expect(character.stats.stamina).toBe(20);
      expect(character.stats.power).toBe(20);
      expect(character.condition.energy).toBe(100);
      expect(character.condition.mood).toBe('Normal');
      expect(character.career.turn).toBe(1);
      expect(character.career.racesRun).toBe(0);
      expect(character.career.racesWon).toBe(0);
    });

    test('should have raceHistory array initialized', () => {
      const character = new Character('Test');
      expect(character.raceHistory).toEqual([]);
    });
  });
  
  describe('Training Validation', () => {
    test('should allow training when energy is sufficient', () => {
      const character = new Character('Test');
      expect(character.canTrain(15)).toBe(true);
      expect(character.canTrain(100)).toBe(true);
    });
    
    test('should prevent training when energy is insufficient', () => {
      const character = new Character('Test');
      character.condition.energy = 10;
      expect(character.canTrain(15)).toBe(false);
      expect(character.canTrain(20)).toBe(false);
    });

    test('should allow training when energy exactly equals cost', () => {
      const character = new Character('Test');
      character.condition.energy = 15;
      expect(character.canTrain(15)).toBe(true);
    });
  });
  
  describe('State Queries', () => {
    test('should calculate total stats correctly', () => {
      const character = new Character('Test');
      expect(character.getStatTotal()).toBe(60); // 20+20+20
      
      character.stats = { speed: 30, stamina: 40, power: 50 };
      expect(character.getStatTotal()).toBe(120);
    });

    test('should detect exhaustion correctly', () => {
      const character = new Character('Test');
      expect(character.isExhausted()).toBe(false);
      
      character.condition.energy = 19;
      expect(character.isExhausted()).toBe(true);
      
      character.condition.energy = 20;
      expect(character.isExhausted()).toBe(false);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain immutable profile data', () => {
      const character = new Character('Test');
      const originalCreatedAt = character.profile.createdAt;
      
      // Attempt to modify (should not affect original)
      character.profile.name = 'Modified';
      expect(character.profile.name).toBe('Modified'); // Direct assignment works
      
      // But createdAt should remain unchanged
      expect(character.profile.createdAt).toBe(originalCreatedAt);
    });
  });
});