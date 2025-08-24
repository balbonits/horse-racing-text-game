/**
 * P0 Critical Path Tests - Most Essential User Journey
 * Following TDD_PLAN.md specifications
 * 
 * CRITICAL PATH: New game → Create character → Train → Race → Complete
 * These tests MUST pass for the application to be functional
 */

describe('P0 Critical Path: Complete Game Journey', () => {
  // Suppress console output during tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('1. Application Launch', () => {
    test('GIVEN: User starts application, WHEN: Game launches, THEN: Main menu displays', () => {
      // This test defines what should happen when game starts
      const GameApp = require('../../src/GameApp');
      
      const mockScreen = {
        key: jest.fn(),
        render: jest.fn(),
        destroy: jest.fn(),
        on: jest.fn()
      };
      
      const app = new GameApp(mockScreen);
      
      // THEN: Should be at main menu
      expect(app.currentState).toBe('main_menu');
      
      // THEN: Should have game instance
      expect(app.game).toBeDefined();
      
      // THEN: Should have UI system
      expect(app.ui).toBeDefined();
      
      // Cleanup
      app.cleanup();
    });

    test('GIVEN: At main menu, WHEN: Display shows, THEN: All required options visible', () => {
      // This test will drive the implementation of menu display
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      // THEN: Main menu should show 4 options
      expect(app.getMenuOptions()).toEqual([
        { key: '1', text: 'New Career' },
        { key: '2', text: 'Load Game' },
        { key: '3', text: 'Help' },
        { key: '4', text: 'Quit' }
      ]);
      
      // THEN: Status should show instruction
      expect(app.getStatusMessage()).toContain('Select an option (1-4)');
      
      app.cleanup();
    });
  });

  describe('2. New Career Selection', () => {
    test('GIVEN: At main menu, WHEN: User presses 1, THEN: Navigate to character creation', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      // WHEN: User presses '1'
      app.handleKeyInput('1');
      
      // THEN: Should transition to character creation
      expect(app.currentState).toBe('character_creation');
      
      app.cleanup();
    });

    test('GIVEN: Invalid input, WHEN: User presses invalid key, THEN: Stay at main menu', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      const initialState = app.currentState;
      
      // WHEN: User presses invalid keys
      app.handleKeyInput('x');
      app.handleKeyInput('9');
      app.handleKeyInput('!');
      
      // THEN: Should remain at main menu
      expect(app.currentState).toBe(initialState);
      
      app.cleanup();
    });
  });

  describe('3. Character Creation', () => {
    test('GIVEN: At character creation, WHEN: Screen displays, THEN: Shows name prompt and stats preview', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      app.setState('character_creation');
      
      // THEN: Should show character creation info
      const creationData = app.getCharacterCreationData();
      expect(creationData).toEqual({
        prompt: 'Enter horse name and press Enter...',
        previewStats: {
          speed: 20,
          stamina: 20,
          power: 20,
          energy: 100
        }
      });
      
      app.cleanup();
    });

    test('GIVEN: Valid name entered, WHEN: User creates character, THEN: Character created with correct stats', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      // WHEN: Create character with valid name
      const result = app.createCharacter('Thunder');
      
      // THEN: Should succeed
      expect(result.success).toBe(true);
      
      // THEN: Character should have correct initial state
      expect(app.game.character.name).toBe('Thunder');
      expect(app.game.character.stats.speed).toBe(20);
      expect(app.game.character.stats.stamina).toBe(20);
      expect(app.game.character.stats.power).toBe(20);
      expect(app.game.character.energy).toBe(100);
      expect(app.game.character.mood).toBe('Normal');
      expect(app.game.character.friendship).toBe(0);
      
      // THEN: Should transition to training
      expect(app.currentState).toBe('training');
      
      app.cleanup();
    });

    test('GIVEN: Invalid name entered, WHEN: User creates character, THEN: Show error and stay on screen', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      // Set up: Go to character creation first
      app.setState('character_creation');
      
      // WHEN: Try invalid names
      const emptyResult = app.createCharacter('');
      const longResult = app.createCharacter('ThisNameIsTooLongForTheGame');
      const specialResult = app.createCharacter('Test@123');
      
      // THEN: All should fail
      expect(emptyResult.success).toBe(false);
      expect(longResult.success).toBe(false);
      expect(specialResult.success).toBe(false);
      
      // THEN: Should show appropriate error messages
      expect(emptyResult.message).toContain('Name must be');
      expect(longResult.message).toContain('Name must be');
      expect(specialResult.message).toContain('alphanumeric');
      
      // THEN: Should stay on character creation
      expect(app.currentState).toBe('character_creation');
      
      app.cleanup();
    });
  });

  describe('4. Training Phase - Core Mechanics', () => {
    let app;
    
    beforeEach(() => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      app = new GameApp(mockScreen);
      app.createCharacter('TestHorse');
    });
    
    afterEach(() => {
      app.cleanup();
    });

    test('GIVEN: Training phase starts, WHEN: Display shows, THEN: Shows turn counter and training options', () => {
      // THEN: Should be at turn 1
      expect(app.game.turnCount).toBe(1);
      
      // THEN: Should show training options
      const trainingOptions = app.getTrainingOptions();
      expect(trainingOptions).toEqual([
        { key: '1', name: 'Speed Training', energyCost: 15 },
        { key: '2', name: 'Stamina Training', energyCost: 10 },
        { key: '3', name: 'Power Training', energyCost: 15 },
        { key: '4', name: 'Rest', energyCost: 0 },
        { key: '5', name: 'Social Time', energyCost: 5 }
      ]);
      
      // THEN: Should show current stats
      const displayStats = app.getCurrentDisplayStats();
      expect(displayStats).toEqual({
        speed: 20,
        stamina: 20,
        power: 20,
        energy: 100,
        mood: 'Normal',
        turn: 1,
        maxTurns: 12
      });
    });

    test('GIVEN: Sufficient energy, WHEN: User selects speed training, THEN: Stats increase and energy decreases', () => {
      const initialSpeed = app.game.character.stats.speed;
      const initialEnergy = app.game.character.energy;
      const initialTurn = app.game.turnCount;
      
      // WHEN: Select speed training
      const result = app.handleKeyInput('1');
      
      // THEN: Should succeed
      expect(result.success).toBe(true);
      
      // THEN: Speed should increase
      expect(app.game.character.stats.speed).toBeGreaterThan(initialSpeed);
      
      // THEN: Energy should decrease by 15
      expect(app.game.character.energy).toBe(initialEnergy - 15);
      
      // THEN: Turn should advance
      expect(app.game.turnCount).toBe(initialTurn + 1);
      
      // THEN: Should show result message
      expect(app.getLastMessage()).toMatch(/Speed increased by \d+/);
    });

    test('GIVEN: Insufficient energy, WHEN: User tries expensive training, THEN: Show error and stay on turn', () => {
      // Set up low energy
      app.game.character.energy = 10;
      const initialStats = { ...app.game.character.stats };
      const initialTurn = app.game.turnCount;
      
      // WHEN: Try speed training (costs 15)
      const result = app.handleKeyInput('1');
      
      // THEN: Should fail
      expect(result.success).toBe(false);
      
      // THEN: Stats shouldn't change
      expect(app.game.character.stats).toEqual(initialStats);
      
      // THEN: Turn shouldn't advance
      expect(app.game.turnCount).toBe(initialTurn);
      
      // THEN: Should show error message
      expect(app.getLastMessage()).toContain('Not enough energy');
    });

    test('GIVEN: Any turn, WHEN: User selects rest, THEN: Energy increases and turn advances', () => {
      // Set up moderate energy
      app.game.character.energy = 50;
      const initialEnergy = app.game.character.energy;
      const initialTurn = app.game.turnCount;
      
      // WHEN: Select rest
      const result = app.handleKeyInput('4');
      
      // THEN: Should succeed
      expect(result.success).toBe(true);
      
      // THEN: Energy should increase (but not exceed 100)
      expect(app.game.character.energy).toBeGreaterThan(initialEnergy);
      expect(app.game.character.energy).toBeLessThanOrEqual(100);
      
      // THEN: Turn should advance
      expect(app.game.turnCount).toBe(initialTurn + 1);
      
      // THEN: Should show rest message
      expect(app.getLastMessage()).toContain('Rested well');
    });

    test('GIVEN: Training continues, WHEN: Turn 12 completes, THEN: Transition to race phase', () => {
      // Fast-forward to turn 12
      app.game.turnCount = 12;
      
      // WHEN: Complete turn 12 with any action
      app.handleKeyInput('4'); // Rest
      
      // THEN: Should transition to race phase
      expect(app.currentState).toBe('race_results');
      
      // THEN: Should show race message
      expect(app.getLastMessage()).toContain('Race Day');
    });
  });

  describe('5. Race Execution', () => {
    let app;
    
    beforeEach(() => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      app = new GameApp(mockScreen);
      app.createCharacter('RaceHorse');
      
      // Set up trained character
      app.game.character.stats.speed = 50;
      app.game.character.stats.stamina = 50;
      app.game.character.stats.power = 50;
      app.game.turnCount = 13; // Past training
    });
    
    afterEach(() => {
      app.cleanup();
    });

    test('GIVEN: Training complete, WHEN: Race phase starts, THEN: Auto-runs first race', () => {
      // WHEN: Enter race phase
      app.setState('race_results');
      
      // THEN: Should have scheduled races
      const races = app.game.getScheduledRaces();
      expect(races).toHaveLength(3);
      
      // THEN: Should have run first race
      const raceResults = app.game.getRaceResults();
      expect(raceResults).toHaveLength(1);
      
      // THEN: Should show race result
      const lastResult = raceResults[0];
      expect(lastResult).toHaveProperty('position');
      expect(lastResult.position).toBeGreaterThanOrEqual(1);
      expect(lastResult.position).toBeLessThanOrEqual(8);
    });

    test('GIVEN: Race completed, WHEN: Results display, THEN: Shows position and performance', () => {
      app.setState('race_results');
      
      const result = app.game.getRaceResults()[0];
      
      // THEN: Should have all required result data
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('commentary');
      
      // THEN: Commentary should match position
      if (result.position === 1) {
        expect(result.commentary).toContain('Amazing victory');
      } else if (result.position <= 3) {
        expect(result.commentary).toContain('Great performance');
      } else if (result.position <= 5) {
        expect(result.commentary).toContain('Solid effort');
      } else {
        expect(result.commentary).toContain('Need more training');
      }
    });

    test('GIVEN: After race, WHEN: User continues, THEN: Runs next race or completes career', () => {
      app.setState('race_results');
      
      // Complete first race already done in setup
      expect(app.game.currentRaceIndex).toBe(1);
      
      // WHEN: Continue to next race
      app.handleKeyInput('enter');
      
      if (app.game.currentRaceIndex < 3) {
        // THEN: Should run next race
        expect(app.game.getRaceResults()).toHaveLength(2);
      } else {
        // THEN: Should complete career
        expect(app.currentState).toBe('career_complete');
      }
    });
  });

  describe('6. Career Completion', () => {
    let app;
    
    beforeEach(() => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      app = new GameApp(mockScreen);
      app.createCharacter('CareerHorse');
      
      // Simulate completed career
      app.game.character.stats = { speed: 60, stamina: 55, power: 50 };
      app.game.careerResults = {
        totalRaces: 3,
        racesWon: 2,
        finalStats: { speed: 60, stamina: 55, power: 50 },
        performance: {
          racesWon: 2,
          racesRun: 3,
          winRate: 67,
          totalStats: 165,
          progressPercent: 55
        }
      };
      app.setState('career_complete');
    });
    
    afterEach(() => {
      app.cleanup();
    });

    test('GIVEN: Career complete, WHEN: Summary displays, THEN: Shows final stats and performance', () => {
      const summary = app.game.getCareerSummary();
      
      // THEN: Should have complete summary
      expect(summary).toHaveProperty('finalStats');
      expect(summary).toHaveProperty('performance');
      expect(summary).toHaveProperty('grade');
      expect(summary).toHaveProperty('legacyBonuses');
      
      // THEN: Grade should match performance
      expect(['S', 'A', 'B', 'C', 'D']).toContain(summary.grade);
      
      // THEN: Legacy bonuses should be calculated
      expect(summary.legacyBonuses).toBeDefined();
    });

    test('GIVEN: Career summary shown, WHEN: User starts new career, THEN: Apply legacy bonuses', () => {
      const summary = app.game.getCareerSummary();
      
      // WHEN: Start new career with legacy
      app.handleKeyInput('enter');
      app.createCharacter('LegacyHorse');
      
      // THEN: Should apply legacy bonuses
      const newStats = app.game.character.stats;
      const baseStat = 20;
      
      // Check if any stat is higher than base (legacy bonus applied)
      const hasLegacyBonus = newStats.speed > baseStat || 
                            newStats.stamina > baseStat || 
                            newStats.power > baseStat;
      
      if (summary.legacyBonuses.speed > 0 || summary.legacyBonuses.stamina > 0 || summary.legacyBonuses.power > 0) {
        expect(hasLegacyBonus).toBe(true);
      }
    });
  });

  describe('7. Complete Critical Path Integration', () => {
    test('GIVEN: New player, WHEN: Completes full journey, THEN: All systems work together', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      const app = new GameApp(mockScreen);
      
      // Journey Step 1: Start game
      expect(app.currentState).toBe('main_menu');
      
      // Journey Step 2: Start new career
      app.handleKeyInput('1');
      expect(app.currentState).toBe('character_creation');
      
      // Journey Step 3: Create character
      const createResult = app.createCharacter('JourneyHorse');
      expect(createResult.success).toBe(true);
      expect(app.currentState).toBe('training');
      
      // Journey Step 4: Do some training
      let trainingActions = 0;
      while (app.game.turnCount <= 12 && trainingActions < 20) {
        if (app.game.character.energy >= 15) {
          app.handleKeyInput('1'); // Speed training
        } else {
          app.handleKeyInput('4'); // Rest
        }
        trainingActions++;
      }
      
      // Should have progressed to races
      expect(app.currentState).toBe('race_results');
      
      // Journey Step 5: Complete races
      while (app.game.currentRaceIndex < 3 && app.currentState === 'race_results') {
        app.handleKeyInput('enter');
      }
      
      // Journey Step 6: Career should be complete
      expect(app.currentState).toBe('career_complete');
      
      // Journey Step 7: Should have career results
      const summary = app.game.getCareerSummary();
      expect(summary).toBeDefined();
      expect(summary.performance.racesRun).toBe(3);
      
      app.cleanup();
    });

    test('GIVEN: Performance requirements, WHEN: Game runs, THEN: Meets response time targets', () => {
      const GameApp = require('../../src/GameApp');
      const mockScreen = { key: jest.fn(), render: jest.fn(), destroy: jest.fn(), on: jest.fn() };
      
      const startTime = Date.now();
      
      // Test input response time
      const app = new GameApp(mockScreen);
      const inputTime = Date.now();
      
      app.handleKeyInput('1');
      app.createCharacter('SpeedTest');
      
      // Do rapid training actions
      for (let i = 0; i < 50; i++) {
        app.handleKeyInput('4'); // Rest (always works)
      }
      
      const totalTime = Date.now() - startTime;
      const avgInputTime = totalTime / 52; // 52 total actions
      
      // THEN: Each action should respond in < 100ms
      expect(avgInputTime).toBeLessThan(100);
      
      app.cleanup();
    });
  });
});