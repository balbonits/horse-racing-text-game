const Character = require('../../src/models/Character');
const { TestDataFactory, MockBlessedScreen } = require('../helpers/mockData');
const { testUtils, setupTest, teardownTest } = require('../helpers/testUtils');

describe('Character Model', () => {
  let utils;

  beforeEach(() => {
    utils = setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Character Creation', () => {
    test('creates character with default stats', () => {
      const character = new Character('Test Horse', { speed: 20, stamina: 20, power: 20 });
      
      expect(character.name).toBe('Test Horse');
      expect(character.stats.speed).toBe(20);
      expect(character.stats.stamina).toBe(20);
      expect(character.stats.power).toBe(20);
      expect(character.condition.energy).toBe(100);
      expect(character.condition.form).toBe('Normal');
      
      utils.validateCharacterStats(character);
    });

    test('creates character with custom options', () => {
      const options = {
        speed: 50,
        stamina: 60,
        power: 40,
        energy: 80,
        form: 'great'
      };

      const character = new Character('Custom Horse', options);
      
      expect(character.stats.speed).toBe(50);
      expect(character.stats.stamina).toBe(60);
      expect(character.stats.power).toBe(40);
      expect(character.condition.energy).toBe(80);
      expect(character.condition.form).toBe('great');
    });

    test('generates unique IDs for characters', () => {
      const horse1 = new Character('Horse 1');
      const horse2 = new Character('Horse 2');
      
      expect(horse1.id).not.toBe(horse2.id);
      expect(horse1.id).toMatch(/player_[a-z0-9]{9}/);
    });
  });

  describe('Stat Management', () => {
    test('increases stats with proper modifiers', () => {
      // Mock random for predictable results
      utils.stubMathRandom(0.9); // High random value
      
      const character = TestDataFactory.createHighFriendshipCharacter();
      const initialSpeed = character.stats.speed;
      
      const gain = character.increaseStat('speed', 10);
      
      expect(character.stats.speed).toBeGreaterThan(initialSpeed);
      expect(gain).toBeGreaterThan(10); // Should be boosted by friendship
      utils.validateCharacterStats(character);
    });

    test('caps stats at 100', () => {
      const character = TestDataFactory.createTestCharacter({ speed: 98 });
      
      character.increaseStat('speed', 10);
      
      expect(character.stats.speed).toBe(100);
    });

    test('applies growth rate modifiers correctly', () => {
      utils.stubMathRandom(1.0); // Eliminate variance
      
      const fastGrowth = TestDataFactory.createTestCharacter({ speedGrowth: 'S' });
      const slowGrowth = TestDataFactory.createTestCharacter({ speedGrowth: 'D' });
      
      const fastGain = fastGrowth.increaseStat('speed', 10);
      const slowGain = slowGrowth.increaseStat('speed', 10);
      
      expect(fastGain).toBeGreaterThan(slowGain);
    });

    test('friendship bonus affects stat gains', () => {
      utils.stubMathRandom(1.0);
      
      const lowBond = TestDataFactory.createTestCharacter({ bond: 20 });
      const highBond = TestDataFactory.createTestCharacter({ bond: 85 });
      
      const lowGain = lowBond.increaseStat('speed', 10);
      const highGain = highBond.increaseStat('speed', 10);
      
      expect(highGain).toBeGreaterThan(lowGain);
    });
  });

  describe('Energy System', () => {
    test('energy changes affect form', () => {
      const character = TestDataFactory.createTestCharacter();
      
      character.changeEnergy(-60); // Reduce to 40
      expect(['Off Form', 'Poor Form']).toContain(character.condition.form);
      
      character.changeEnergy(-20); // Reduce to 20  
      expect(['Off Form', 'Poor Form']).toContain(character.condition.form);
      
      character.changeEnergy(70); // Increase to 90
      expect(['Peak Form', 'Good Form', 'Steady']).toContain(character.condition.form);
    });

    test('energy caps at 0 and 100', () => {
      const character = TestDataFactory.createTestCharacter();
      
      character.changeEnergy(-150);
      expect(character.condition.energy).toBe(0);
      
      character.changeEnergy(200);
      expect(character.condition.energy).toBe(100);
    });

    test('form multipliers work correctly', () => {
      const goodForm = TestDataFactory.createTestCharacter({ form: 'Peak Form' });
      const badForm = TestDataFactory.createTestCharacter({ form: 'Poor Form' });
      
      expect(goodForm.getFormMultiplier()).toBeGreaterThan(1.0);
      expect(badForm.getFormMultiplier()).toBeLessThan(1.0);
    });
  });

  describe('Career Progression', () => {
    test('tracks career turns correctly', () => {
      const character = TestDataFactory.createTestCharacter();
      
      expect(character.career.turn).toBe(1);
      expect(character.canContinue()).toBe(true);
      
      const advanced = character.nextTurn();
      expect(advanced).toBe(true);
      expect(character.career.turn).toBe(2);
    });

    test('ends career after max turns', () => {
      const character = TestDataFactory.createCharacterAtTurn(24);
      
      expect(character.canContinue()).toBe(true);
      
      const advanced = character.nextTurn();
      expect(advanced).toBe(true); // Successfully advanced from 24 to 25
      expect(character.canContinue()).toBe(false); // But now can't continue (at turn 25 > maxTurns 24)
    });

    test('tracks training and race statistics', () => {
      const character = TestDataFactory.createTestCharacter();
      
      character.increaseStat('speed', 10);
      character.career.racesRun = 2;
      character.career.racesWon = 1;
      
      const summary = character.getSummary();
      expect(summary.career.totalTraining).toBe(1);
      expect(summary.career.racesRun).toBe(2);
      expect(summary.career.racesWon).toBe(1);
    });
  });

  describe('Serialization', () => {
    test('serializes to JSON correctly', () => {
      const character = TestDataFactory.createTestCharacter();
      const json = character.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('stats');
      expect(json).toHaveProperty('condition');
      expect(json).toHaveProperty('career');
      expect(json.name).toBe(character.name);
    });

    test('deserializes from JSON correctly', () => {
      const original = TestDataFactory.createTestCharacter({ speed: 75 });
      const json = original.toJSON();
      const restored = Character.fromJSON(json);
      
      expect(restored.name).toBe(original.name);
      expect(restored.stats.speed).toBe(original.stats.speed);
      expect(restored.condition.energy).toBe(original.condition.energy);
    });

    test('preserves all properties through serialization cycle', () => {
      const original = TestDataFactory.createHighFriendshipCharacter();
      original.career.turn = 5;
      original.career.racesWon = 2;
      
      const json = original.toJSON();
      const restored = Character.fromJSON(json);
      
      utils.expectObjectsToBeEquivalent(
        restored.toJSON(), 
        original.toJSON()
      );
    });
  });

  describe('Performance Tests', () => {
    test('stat increases perform within acceptable time', async () => {
      const character = TestDataFactory.createTestCharacter();
      
      const perfResults = await utils.runStressTest(() => {
        character.increaseStat('speed', 5);
      }, 1000);
      
      expect(perfResults.passed).toBeGreaterThan(900);
      expect(perfResults.failed).toBeLessThan(100);
    });

    test('character creation is memory efficient', () => {
      const { PerformanceTestUtils } = require('../helpers/mockData');
      
      const memoryUsage = PerformanceTestUtils.measureMemoryUsage(() => {
        for (let i = 0; i < 100; i++) {
          TestDataFactory.createTestCharacter();
        }
      });
      
      // Should not use excessive memory (less than 10MB)
      expect(memoryUsage.heapUsedDiff).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Error Handling', () => {
    test('handles invalid stat names gracefully', () => {
      const character = TestDataFactory.createTestCharacter();
      
      expect(() => {
        character.increaseStat('invalid_stat', 10);
      }).not.toThrow();
      
      // Character state should remain valid
      utils.validateCharacterStats(character);
    });

    test('handles extreme energy changes', () => {
      const character = TestDataFactory.createTestCharacter();
      
      character.changeEnergy(-10000);
      expect(character.condition.energy).toBe(0);
      
      character.changeEnergy(10000);
      expect(character.condition.energy).toBe(100);
      
      utils.validateCharacterStats(character);
    });

    test('handles corrupted save data', () => {
      const corruptedData = {
        name: 'Test',
        stats: { speed: 'invalid' }, // Invalid stat value
        condition: null // Missing condition
      };
      
      expect(() => {
        Character.fromJSON(corruptedData);
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty character name', () => {
      const character = new Character('');
      expect(character.name).toBe('');
      expect(character.id).toBeDefined();
    });

    test('handles null/undefined options', () => {
      expect(() => {
        new Character('Test', null);
      }).not.toThrow();
      
      expect(() => {
        new Character('Test', undefined);
      }).not.toThrow();
    });

    test('maintains consistency with extreme stat values', () => {
      const character = TestDataFactory.createTestCharacter({ 
        speed: 1, 
        stamina: 100, 
        power: 50 
      });
      
      // Should handle imbalanced stats gracefully
      utils.validateCharacterStats(character);
      expect(character.getSummary()).toBeDefined();
    });
  });
});