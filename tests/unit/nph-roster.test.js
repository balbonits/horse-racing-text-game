/**
 * Tests for NPH (Non-Player Horse) Roster System
 */

const NPHRoster = require('../../src/models/NPHRoster');
const Character = require('../../src/models/Character');

describe('NPHRoster', () => {
  let playerHorse;
  let nphRoster;

  beforeEach(() => {
    playerHorse = new Character('Thunder Strike');
    nphRoster = new NPHRoster();
  });

  describe('Roster Generation', () => {
    test('should generate specified number of NPHs', () => {
      const nphs = nphRoster.generateRoster(playerHorse, 24);
      
      expect(nphs).toHaveLength(24);
      expect(nphRoster.nphs).toHaveLength(24);
    });

    test('should generate NPHs with unique IDs and names', () => {
      const nphs = nphRoster.generateRoster(playerHorse, 10);
      
      const ids = nphs.map(nph => nph.id);
      const names = nphs.map(nph => nph.name);
      
      expect(new Set(ids).size).toBe(10); // All unique IDs
      expect(new Set(names).size).toBe(10); // All unique names
    });

    test('should generate NPHs with valid stat distributions', () => {
      const nphs = nphRoster.generateRoster(playerHorse, 20);
      
      nphs.forEach(nph => {
        expect(nph.stats.speed).toBeGreaterThanOrEqual(15);
        expect(nph.stats.stamina).toBeGreaterThanOrEqual(15);
        expect(nph.stats.power).toBeGreaterThanOrEqual(15);
        
        expect(nph.stats.speed).toBeLessThanOrEqual(100);
        expect(nph.stats.stamina).toBeLessThanOrEqual(100);
        expect(nph.stats.power).toBeLessThanOrEqual(100);
      });
    });

    test('should assign running strategies to all NPHs', () => {
      const nphs = nphRoster.generateRoster(playerHorse, 15);
      const validStrategies = ['FRONT', 'MID', 'LATE'];
      
      nphs.forEach(nph => {
        expect(validStrategies).toContain(nph.strategy);
        expect(nph.trainingPattern).toBeTruthy();
      });
    });
  });

  describe('NPH Progression', () => {
    beforeEach(() => {
      nphRoster.generateRoster(playerHorse, 10);
    });

    test('should progress all NPHs when called', () => {
      const initialStats = nphRoster.nphs.map(nph => ({ ...nph.stats }));
      
      nphRoster.progressNPHs(2);
      
      // At least some NPHs should have improved stats
      let hasImprovement = false;
      nphRoster.nphs.forEach((nph, index) => {
        const initial = initialStats[index];
        const current = nph.stats;
        
        if (current.speed > initial.speed || 
            current.stamina > initial.stamina || 
            current.power > initial.power) {
          hasImprovement = true;
        }
      });
      
      expect(hasImprovement).toBe(true);
    });

    test('should store training history', () => {
      nphRoster.progressNPHs(3);
      
      nphRoster.nphs.forEach(nph => {
        expect(nph.history).toHaveProperty('turn3');
        expect(nph.history.turn3).toHaveProperty('stats');
        expect(nph.history.turn3).toHaveProperty('training');
        expect(nph.history.turn3).toHaveProperty('gain');
      });
    });

    test('should not exceed stat caps', () => {
      // Progress NPHs many times to test caps
      for (let turn = 1; turn <= 15; turn++) {
        nphRoster.progressNPHs(turn);
      }
      
      nphRoster.nphs.forEach(nph => {
        expect(nph.stats.speed).toBeLessThanOrEqual(100);
        expect(nph.stats.stamina).toBeLessThanOrEqual(100);
        expect(nph.stats.power).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Race Field Generation', () => {
    beforeEach(() => {
      nphRoster.generateRoster(playerHorse, 20);
    });

    test('should return requested field size', () => {
      const field = nphRoster.getRaceField(8);
      expect(field).toHaveLength(8);
    });

    test('should include variety of horse strengths', () => {
      const field = nphRoster.getRaceField(8);
      
      const powers = field.map(nph => 
        nphRoster.calculateHorsePower(nph)
      );
      
      const minPower = Math.min(...powers);
      const maxPower = Math.max(...powers);
      
      // Should have at least 10 point spread in power
      expect(maxPower - minPower).toBeGreaterThanOrEqual(10);
    });

    test('should not duplicate horses in field', () => {
      const field = nphRoster.getRaceField(8);
      const ids = field.map(nph => nph.id);
      
      expect(new Set(ids).size).toBe(8);
    });
  });

  describe('Training AI Logic', () => {
    beforeEach(() => {
      nphRoster.generateRoster(playerHorse, 5);
    });

    test('should select appropriate training before races', () => {
      // Turn 3 (before sprint race) should focus on speed/power
      const turn3Training = nphRoster.selectTraining('speed_focus', 'FRONT', 3, { speed: 30, stamina: 30, power: 30 });
      expect(['speed', 'power']).toContain(turn3Training);

      // Turn 7 (before mile race) should focus on stamina
      const turn7Training = nphRoster.selectTraining('balanced', 'MID', 7, { speed: 40, stamina: 40, power: 40 });
      expect(turn7Training).toBe('stamina');
    });

    test('should follow training patterns consistently', () => {
      const nph = nphRoster.nphs[0];
      const trainings = [];
      
      // Simulate several training sessions
      for (let turn = 1; turn <= 5; turn++) {
        const training = nphRoster.selectTraining(nph.trainingPattern, nph.strategy, turn, nph.stats);
        trainings.push(training);
      }
      
      expect(trainings).toHaveLength(5);
      trainings.forEach(training => {
        expect(['speed', 'stamina', 'power', 'rest']).toContain(training);
      });
    });
  });

  describe('Serialization', () => {
    test('should serialize and deserialize correctly', () => {
      nphRoster.generateRoster(playerHorse, 10);
      nphRoster.progressNPHs(2);
      
      const serialized = nphRoster.toJSON();
      const deserialized = NPHRoster.fromJSON(serialized);
      
      expect(deserialized.nphs).toHaveLength(10);
      expect(deserialized.careerId).toBe(nphRoster.careerId);
      expect(deserialized.playerHorseName).toBe(playerHorse.name);
      expect(deserialized.currentTurn).toBe(nphRoster.currentTurn);
    });

    test('should maintain history after deserialization', () => {
      nphRoster.generateRoster(playerHorse, 5);
      nphRoster.progressNPHs(3);
      
      const serialized = nphRoster.toJSON();
      const deserialized = NPHRoster.fromJSON(serialized);
      
      deserialized.nphs.forEach(nph => {
        expect(nph.history).toHaveProperty('turn3');
      });
    });
  });

  describe('Balance Testing', () => {
    test('should generate competitive but beatable NPHs', () => {
      const strongPlayer = new Character('Strong Horse', {
        speed: 60, stamina: 60, power: 60
      });
      
      const weakPlayer = new Character('Weak Horse', {
        speed: 30, stamina: 30, power: 30
      });
      
      const strongRoster = new NPHRoster();
      const weakRoster = new NPHRoster();
      
      strongRoster.generateRoster(strongPlayer, 20);
      weakRoster.generateRoster(weakPlayer, 20);
      
      // NPHs should scale with player strength
      const strongNPHPower = strongRoster.nphs.map(nph => 
        strongRoster.calculateHorsePower(nph)
      );
      const weakNPHPower = weakRoster.nphs.map(nph => 
        weakRoster.calculateHorsePower(nph)
      );
      
      const avgStrong = strongNPHPower.reduce((a, b) => a + b) / strongNPHPower.length;
      const avgWeak = weakNPHPower.reduce((a, b) => a + b) / weakNPHPower.length;
      
      expect(avgStrong).toBeGreaterThan(avgWeak);
    });
  });
});