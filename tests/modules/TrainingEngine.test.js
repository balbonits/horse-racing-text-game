/**
 * TrainingEngine Module Tests
 * Tests for training mechanics and stat calculations
 */

const TrainingEngine = require('../../src/modules/TrainingEngine');
const Character = require('../../src/modules/Character');

describe('TrainingEngine Module', () => {
  let engine;
  let character;
  
  beforeEach(() => {
    engine = new TrainingEngine();
    character = new Character('Test Horse');
  });
  
  describe('Gain Calculations', () => {
    test('should calculate speed training gains', () => {
      const gains = engine.calculateGains(character, 'speed');
      
      expect(gains.speed).toBeGreaterThan(0);
      expect(gains.stamina).toBe(0);
      expect(gains.power).toBe(0);
      expect(gains.energyCost).toBe(15);
      expect(typeof gains.speed).toBe('number');
    });

    test('should calculate stamina training gains', () => {
      const gains = engine.calculateGains(character, 'stamina');
      
      expect(gains.stamina).toBeGreaterThan(0);
      expect(gains.speed).toBe(0);
      expect(gains.power).toBe(0);
      expect(gains.energyCost).toBe(10);
    });

    test('should calculate power training gains', () => {
      const gains = engine.calculateGains(character, 'power');
      
      expect(gains.power).toBeGreaterThan(0);
      expect(gains.speed).toBe(0);
      expect(gains.stamina).toBe(0);
      expect(gains.energyCost).toBe(15);
    });

    test('should calculate rest gains', () => {
      const gains = engine.calculateGains(character, 'rest');
      
      expect(gains.energy).toBe(30);
      expect(gains.speed).toBe(0);
      expect(gains.stamina).toBe(0);
      expect(gains.power).toBe(0);
      expect(gains.energyCost).toBe(0);
    });
    
    test('should apply mood multipliers correctly', () => {
      character.condition.mood = 'Excellent';
      const excellentGains = engine.calculateGains(character, 'speed', { deterministic: true });
      
      character.condition.mood = 'Normal';
      const normalGains = engine.calculateGains(character, 'speed', { deterministic: true });
      
      expect(excellentGains.speed).toBeGreaterThan(normalGains.speed);
    });

    test('should handle different mood states', () => {
      const moods = ['Excellent', 'Great', 'Good', 'Normal', 'Tired', 'Bad'];
      const gains = [];
      
      moods.forEach(mood => {
        character.condition.mood = mood;
        gains.push(engine.calculateGains(character, 'speed'));
      });
      
      // Excellent should give highest gains, Bad should give lowest
      expect(gains[0].speed).toBeGreaterThan(gains[gains.length - 1].speed);
    });
  });
  
  describe('Training Application', () => {
    test('should apply training and modify character stats', () => {
      const initialSpeed = character.stats.speed;
      const initialEnergy = character.condition.energy;
      
      const gains = engine.applyTraining(character, 'speed');
      
      expect(character.stats.speed).toBeGreaterThan(initialSpeed);
      expect(character.condition.energy).toBeLessThan(initialEnergy);
      expect(gains.speed).toBeGreaterThan(0);
      expect(typeof gains).toBe('object');
    });
    
    test('should not allow training without sufficient energy', () => {
      character.condition.energy = 5;
      
      expect(() => {
        engine.applyTraining(character, 'speed');
      }).toThrow('Insufficient energy');
      
      // Character should be unchanged after failed training
      expect(character.stats.speed).toBe(20);
      expect(character.condition.energy).toBe(5);
    });

    test('should allow training when energy exactly equals cost', () => {
      character.condition.energy = 15;
      
      const gains = engine.applyTraining(character, 'speed');
      expect(gains.speed).toBeGreaterThan(0);
      expect(character.condition.energy).toBe(0);
    });

    test('should update mood after successful training', () => {
      character.condition.mood = 'Normal';
      
      engine.applyTraining(character, 'speed');
      
      // Mood should either stay the same or improve (random 30% chance)
      expect(['Normal', 'Good', 'Great']).toContain(character.condition.mood);
    });
  });

  describe('Energy Management', () => {
    test('should restore energy with rest training', () => {
      character.condition.energy = 50;
      
      const gains = engine.applyTraining(character, 'rest');
      
      expect(character.condition.energy).toBe(80); // 50 + 30
      expect(gains.energy).toBe(30);
    });

    test('should not exceed maximum energy', () => {
      character.condition.energy = 90;
      
      engine.applyTraining(character, 'rest');
      
      expect(character.condition.energy).toBe(100); // Capped at 100
    });
  });

  describe('Social Training', () => {
    test('should handle social training', () => {
      const gains = engine.calculateGains(character, 'social');
      
      expect(gains.energyCost).toBe(5);
      expect(gains.friendship).toBeGreaterThan(0);
    });
  });

  describe('Training Validation', () => {
    test('should validate training type', () => {
      expect(() => {
        engine.calculateGains(character, 'invalid_type');
      }).toThrow('Invalid training type');
    });

    test('should handle edge cases', () => {
      // Character with 0 energy
      character.condition.energy = 0;
      expect(() => engine.applyTraining(character, 'speed')).toThrow();
      
      // Character with max stats should still be trainable
      character.stats.speed = 100;
      character.condition.energy = 100;
      
      const gains = engine.applyTraining(character, 'speed');
      expect(gains).toBeDefined();
    });
  });
});