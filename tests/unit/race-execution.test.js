/**
 * Race Execution Unit Tests - TDD First
 * Write tests BEFORE implementing race logic
 */

const Game = require('../../src/systems/Game');
const Character = require('../../src/models/Character');

describe('Race Execution System - Unit Tests', () => {
  let game;
  
  beforeEach(() => {
    // Suppress console output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    game = new Game();
    // Create test character with known stats
    game.character = new Character('TestHorse');
    game.character.stats = { speed: 50, stamina: 50, power: 50 };
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('runRace() method', () => {
    test('should exist and be callable', () => {
      expect(typeof game.runRace).toBe('function');
    });

    test('should return valid race result format', () => {
      const raceData = { name: 'Test Race', distance: 1600, surface: 'Turf' };
      
      const result = game.runRace(raceData);
      
      // Expected result structure
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('commentary');
      
      // Position should be valid
      expect(result.position).toBeGreaterThanOrEqual(1);
      expect(result.position).toBeLessThanOrEqual(8);
      expect(typeof result.position).toBe('number');
      
      // Performance should be numeric
      expect(typeof result.performance).toBe('number');
      expect(result.performance).toBeGreaterThan(0);
      
      // Time should be a string
      expect(typeof result.time).toBe('string');
      
      // Commentary should match position
      expect(typeof result.commentary).toBe('string');
      expect(result.commentary.length).toBeGreaterThan(0);
    });

    test('should place character realistically based on stats', () => {
      const raceData = { name: 'Test Race', distance: 1600 };
      
      // Test with very low stats - should tend toward worse positions
      game.character.stats = { speed: 10, stamina: 10, power: 10 };
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(game.runRace(raceData).position);
      }
      const avgLowStats = results.reduce((a, b) => a + b) / results.length;
      
      // Test with very high stats - should tend toward better positions  
      game.character.stats = { speed: 90, stamina: 90, power: 90 };
      const highResults = [];
      for (let i = 0; i < 20; i++) {
        highResults.push(game.runRace(raceData).position);
      }
      const avgHighStats = highResults.reduce((a, b) => a + b) / highResults.length;
      
      // High stats should average better (lower position numbers)
      expect(avgHighStats).toBeLessThan(avgLowStats);
    });

    test('should generate appropriate commentary for position', () => {
      const raceData = { name: 'Test Race', distance: 1600 };
      
      // Mock specific positions for testing
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // High performance
      const winResult = game.runRace(raceData);
      
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // Low performance  
      const loseResult = game.runRace(raceData);
      
      // Winners should get better commentary
      if (winResult.position === 1) {
        expect(winResult.commentary).toContain('Amazing victory');
      }
      if (winResult.position <= 3) {
        expect(winResult.commentary).toContain('Great performance');
      }
      
      // Losers should get appropriate commentary
      if (loseResult.position >= 6) {
        expect(loseResult.commentary).toContain('Need more training');
      }
      
      Math.random.mockRestore();
    });
  });

  describe('Race Results Storage', () => {
    test('should store race results in raceResults array', () => {
      const raceData = { name: 'Test Race', distance: 1600 };
      
      expect(game.raceResults).toHaveLength(0);
      
      const result = game.runRace(raceData);
      
      expect(game.raceResults).toHaveLength(1);
      expect(game.raceResults[0]).toEqual(result);
    });

    test('should accumulate multiple race results', () => {
      const race1 = { name: 'Race 1', distance: 1200 };
      const race2 = { name: 'Race 2', distance: 1600 };
      
      game.runRace(race1);
      game.runRace(race2);
      
      expect(game.raceResults).toHaveLength(2);
      expect(game.raceResults[0].raceData.name).toBe('Race 1');
      expect(game.raceResults[1].raceData.name).toBe('Race 2');
    });
  });

  describe('Auto-Run Integration', () => {
    test('should auto-run first race when entering race phase', () => {
      // Setup: character with completed training
      game.turnCount = 13; // Past training phase
      
      // Ensure scheduled races exist
      expect(game.getScheduledRaces()).toHaveLength(3);
      
      // Mock the state transition that should trigger auto-run
      game.enterRacePhase();
      
      // Should have run first race automatically
      expect(game.raceResults).toHaveLength(1);
      expect(game.currentRaceIndex).toBe(1);
    });

    test('should use first scheduled race data for auto-run', () => {
      const mockRaces = [
        { name: 'First Race', distance: 1400 },
        { name: 'Second Race', distance: 1600 },
        { name: 'Final Race', distance: 2000 }
      ];
      game.raceSchedule = mockRaces;
      
      game.enterRacePhase();
      
      const result = game.raceResults[0];
      expect(result.raceData.name).toBe('First Race');
      expect(result.raceData.distance).toBe(1400);
    });
  });

  describe('Performance Calculation', () => {
    test('should weight stats correctly for different distances', () => {
      // Sprint race should favor speed
      game.character.stats = { speed: 80, stamina: 20, power: 40 };
      const sprintRace = { distance: 1200 };
      
      // Long race should favor stamina  
      const longRace = { distance: 2000 };
      
      // Run multiple times to get average performance
      const sprintPerfs = [];
      const longPerfs = [];
      
      for (let i = 0; i < 10; i++) {
        sprintPerfs.push(game.runRace(sprintRace).performance);
        longPerfs.push(game.runRace(longRace).performance);
      }
      
      const avgSprint = sprintPerfs.reduce((a, b) => a + b) / sprintPerfs.length;
      const avgLong = longPerfs.reduce((a, b) => a + b) / longPerfs.length;
      
      // High speed should perform better in sprints
      expect(avgSprint).toBeGreaterThan(avgLong);
    });
  });
});