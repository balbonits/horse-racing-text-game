/**
 * Unit Tests for RaceAnimation
 */

const RaceAnimation = require('../../src/systems/RaceAnimation');

describe('RaceAnimation', () => {
  let raceAnimation;
  let mockPlayerHorse;
  let mockRaceField;
  let mockRaceInfo;

  beforeEach(() => {
    mockPlayerHorse = {
      name: 'Test Horse',
      getCurrentStats: () => ({
        speed: 50,
        stamina: 60,
        power: 45
      })
    };

    mockRaceField = [
      {
        name: 'Rival Horse 1',
        stats: { speed: 45, stamina: 50, power: 40 },
        icon: '🐎'
      },
      {
        name: 'Rival Horse 2',
        stats: { speed: 55, stamina: 45, power: 50 },
        icon: '🏇'
      }
    ];

    mockRaceInfo = {
      name: 'Test Race',
      distance: 1600,
      surface: 'Dirt'
    };

    raceAnimation = new RaceAnimation(mockRaceField, mockPlayerHorse, mockRaceInfo);
  });

  describe('Initialization', () => {
    test('should initialize with correct properties', () => {
      expect(raceAnimation.raceField).toEqual(mockRaceField);
      expect(raceAnimation.playerHorse).toEqual(mockPlayerHorse);
      expect(raceAnimation.raceInfo).toEqual(mockRaceInfo);
      expect(raceAnimation.trackLength).toBe(50);
      expect(raceAnimation.duration).toBe(12000);
      expect(raceAnimation.participants).toEqual([]);
      expect(raceAnimation.isRunning).toBe(false);
    });

    test('should handle empty race field', () => {
      const emptyAnimation = new RaceAnimation([], mockPlayerHorse, mockRaceInfo);
      expect(emptyAnimation.raceField).toEqual([]);
      expect(emptyAnimation.playerHorse).toEqual(mockPlayerHorse);
    });
  });

  describe('Performance Calculation', () => {
    test('should calculate performance based on stats', () => {
      const stats = { speed: 50, stamina: 60, power: 45 };
      const performance = raceAnimation.calculatePerformance(stats);
      
      // Base calculation: (50 * 0.4) + (60 * 0.4) + (45 * 0.2) = 53
      // With random factor 0.85-1.15, should be between ~45 and ~61
      expect(performance).toBeGreaterThanOrEqual(40);
      expect(performance).toBeLessThanOrEqual(65);
    });

    test('should apply random variance to performance', () => {
      const stats = { speed: 50, stamina: 50, power: 50 };
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        results.push(raceAnimation.calculatePerformance(stats));
      }
      
      // Results should vary due to randomness
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('Participant Initialization', () => {
    test('should initialize participants correctly', () => {
      raceAnimation.initializeParticipants();
      
      expect(raceAnimation.participants).toHaveLength(3); // 1 player + 2 AI
      
      const playerParticipant = raceAnimation.participants.find(p => p.isPlayer);
      expect(playerParticipant).toBeDefined();
      expect(playerParticipant.name).toBe('Test Horse');
      expect(playerParticipant.icon).toBe('🟢');
      expect(playerParticipant.progress).toBe(0);
      expect(playerParticipant.performance).toBeGreaterThan(0);
      
      const aiParticipants = raceAnimation.participants.filter(p => !p.isPlayer);
      expect(aiParticipants).toHaveLength(2);
      
      aiParticipants.forEach(participant => {
        expect(participant.name).toMatch(/Rival Horse \d/);
        expect(participant.progress).toBe(0);
        expect(participant.performance).toBeGreaterThan(0);
        expect(['🐎', '🏇'].includes(participant.icon)).toBe(true);
      });
    });
  });

  describe('Race Progress', () => {
    beforeEach(() => {
      raceAnimation.initializeParticipants();
    });

    test('should update race progress correctly', () => {
      raceAnimation.updateRaceProgress(0.5); // 50% through race
      
      raceAnimation.participants.forEach(participant => {
        expect(participant.progress).toBeGreaterThan(0);
        expect(participant.progress).toBeLessThanOrEqual(1.0);
        expect(participant.position).toBeGreaterThanOrEqual(1);
        expect(participant.position).toBeLessThanOrEqual(3);
      });
    });

    test('should complete race at 100% progress', () => {
      raceAnimation.updateRaceProgress(1.0);
      
      raceAnimation.participants.forEach(participant => {
        expect(participant.progress).toBeLessThanOrEqual(1.0);
      });
    });

    test('should assign positions based on progress', () => {
      raceAnimation.updateRaceProgress(0.8);
      
      const positions = raceAnimation.participants.map(p => p.position);
      const sortedPositions = [...positions].sort();
      
      expect(sortedPositions).toEqual([1, 2, 3]);
      expect(new Set(positions).size).toBe(3); // All positions unique
    });
  });

  describe('Race Phases', () => {
    test('should identify race phases correctly', () => {
      expect(raceAnimation.getCurrentPhase(2)).toBe('Starting Gate 🚪');
      expect(raceAnimation.getCurrentPhase(6)).toBe('Early Pace 🏃');
      expect(raceAnimation.getCurrentPhase(9)).toBe('Middle Stretch 🔥');
      expect(raceAnimation.getCurrentPhase(11)).toBe('Final Sprint! 💨');
    });
  });

  describe('Final Results', () => {
    beforeEach(() => {
      raceAnimation.initializeParticipants();
      raceAnimation.updateRaceProgress(1.0);
    });

    test('should calculate final results correctly', () => {
      const results = raceAnimation.calculateFinalResults();
      
      expect(results).toHaveProperty('results');
      expect(results).toHaveProperty('raceType');
      expect(results).toHaveProperty('distance');
      expect(results).toHaveProperty('trackCondition');
      
      expect(results.results).toHaveLength(3);
      expect(results.raceType).toBe('Test Race');
      expect(results.distance).toBe(1600);
      expect(results.trackCondition).toBe('Dirt');
    });

    test('should generate realistic finish times', () => {
      const results = raceAnimation.calculateFinalResults();
      
      results.results.forEach((result, index) => {
        const time = parseFloat(result.time);
        expect(time).toBeGreaterThan(50); // Minimum realistic time
        expect(time).toBeLessThan(120);   // Maximum realistic time
        
        if (index > 0) {
          const prevTime = parseFloat(results.results[index - 1].time);
          expect(time).toBeGreaterThanOrEqual(prevTime); // Times should increase
        }
      });
    });

    test('should include player in results', () => {
      const results = raceAnimation.calculateFinalResults();
      
      const playerResult = results.results.find(r => r.participant.isPlayer);
      expect(playerResult).toBeDefined();
      expect(playerResult.participant.character.name).toBe('Test Horse');
      expect(parseFloat(playerResult.time)).toBeGreaterThan(0);
    });
  });

  describe('Race Execution', () => {
    test('should run race animation and return results', async () => {
      // Mock console.clear to avoid test output
      const originalClear = console.clear;
      console.clear = jest.fn();
      
      // Reduce duration for faster test
      raceAnimation.duration = 100;
      raceAnimation.frameRate = 50;
      
      const results = await raceAnimation.run();
      
      expect(results).toBeDefined();
      expect(results.results).toHaveLength(3);
      expect(raceAnimation.isRunning).toBe(false);
      expect(raceAnimation.updateInterval).toBeNull();
      
      // Restore console.clear
      console.clear = originalClear;
    }, 5000);

    test('should cleanup properly when stopped', () => {
      raceAnimation.isRunning = true;
      raceAnimation.updateInterval = setInterval(() => {}, 100);
      
      raceAnimation.cleanup();
      
      expect(raceAnimation.isRunning).toBe(false);
      expect(raceAnimation.updateInterval).toBeNull();
    });
  });
});