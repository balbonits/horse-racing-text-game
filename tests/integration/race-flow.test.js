/**
 * Integration Tests for New Race Flow
 * Tests the complete race progression: preview → lineup → strategy → animation → results → podium
 */

const GameApp = require('../../src/GameApp');

describe('Race Flow Integration', () => {
  let app;

  beforeEach(() => {
    app = new GameApp();
  });

  afterEach(() => {
    if (app) {
      app.cleanup();
    }
  });

  describe('Race State Transitions', () => {
    test('should transition from training to race_preview when race is ready', () => {
      // Create character and advance to turn 4
      const createResult = app.createCharacter('Test Horse');
      expect(createResult.success).toBe(true);
      
      // Simulate training to turn 4
      while (app.game.character.career.turn < 4) {
        app.performTrainingSync('speed');
      }
      
      // Training on turn 4 should trigger race preview
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.raceReady).toBe(true);
      expect(app.currentState).toBe('race_preview');
      expect(app.upcomingRace).toBeDefined();
    });

    test('should progress through all race states', () => {
      // Setup race preview state
      app.createCharacter('Test Horse');
      app.upcomingRace = { name: 'Test Race', distance: '1600m' };
      app.setState('race_preview');
      
      // race_preview → horse_lineup
      const previewResult = app.handleKeyInput('enter');
      expect(previewResult.success).toBe(true);
      expect(app.currentState).toBe('horse_lineup');
      
      // horse_lineup → strategy_select
      const lineupResult = app.handleKeyInput('enter');
      expect(lineupResult.success).toBe(true);
      expect(app.currentState).toBe('strategy_select');
      
      // strategy_select → race_running
      const strategyResult = app.handleKeyInput('2'); // MID strategy
      expect(strategyResult.success).toBe(true);
      expect(app.currentState).toBe('race_running');
      expect(app.selectedStrategy).toBe('MID');
    });

    test('should handle strategy selection correctly', () => {
      app.createCharacter('Test Horse');
      app.setState('strategy_select');
      
      // Test FRONT strategy
      const frontResult = app.handleKeyInput('1');
      expect(frontResult.success).toBe(true);
      expect(app.selectedStrategy).toBe('FRONT');
      
      // Reset and test LATE strategy
      app.setState('strategy_select');
      const lateResult = app.handleKeyInput('3');
      expect(lateResult.success).toBe(true);
      expect(app.selectedStrategy).toBe('LATE');
      
      // Test default strategy on invalid input
      app.setState('strategy_select');
      const defaultResult = app.handleKeyInput('invalid');
      expect(defaultResult.success).toBe(true);
      expect(app.selectedStrategy).toBe('MID');
    });
  });

  describe('Race Field Generation', () => {
    test('should generate realistic competition field', () => {
      app.createCharacter('Test Horse');
      const field = app.generateRaceField();
      
      expect(field).toHaveLength(7); // 7 AI competitors
      
      field.forEach(horse => {
        expect(horse).toHaveProperty('name');
        expect(horse).toHaveProperty('stats');
        expect(horse.stats).toHaveProperty('speed');
        expect(horse.stats).toHaveProperty('stamina');
        expect(horse.stats).toHaveProperty('power');
        
        // Stats should be in reasonable range
        expect(horse.stats.speed).toBeGreaterThanOrEqual(10);
        expect(horse.stats.speed).toBeLessThanOrEqual(80);
      });
    });

    test('should use NPH roster when available', () => {
      app.createCharacter('Test Horse');
      
      // Should have NPH roster from character creation
      expect(app.game.nphRoster).toBeDefined();
      
      const field = app.generateRaceField();
      expect(field).toHaveLength(7);
      
      // Field should contain realistic horses with names and stats
      field.forEach(horse => {
        expect(typeof horse.name).toBe('string');
        expect(horse.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Race Animation', () => {
    test('should create RaceAnimation with correct parameters', () => {
      app.createCharacter('Test Horse');
      app.raceField = app.generateRaceField();
      app.upcomingRace = { name: 'Test Race', distance: 1600 };
      
      expect(() => {
        app.startRaceAnimation();
      }).not.toThrow();
      
      expect(app.raceAnimation).toBeDefined();
    });
  });

  describe('UI Rendering', () => {
    test('should render race preview screen', () => {
      const character = { 
        name: 'Test Horse',
        getCurrentStats: () => ({ speed: 50, stamina: 45, power: 40 }),
        condition: { energy: 80 }
      };
      const raceInfo = { name: 'Debut Sprint', distance: '1200m' };
      
      expect(() => {
        app.ui.showRacePreview(raceInfo, character);
      }).not.toThrow();
    });

    test('should render horse lineup screen', () => {
      const character = { 
        name: 'Test Horse',
        getCurrentStats: () => ({ speed: 50, stamina: 45, power: 40 })
      };
      const raceField = [
        { name: 'Rival Horse 1', stats: { speed: 45, stamina: 50, power: 40 }, icon: '🐎' }
      ];
      
      expect(() => {
        app.ui.showHorseLineup(raceField, character);
      }).not.toThrow();
    });

    test('should render strategy selection screen', () => {
      expect(() => {
        app.ui.showStrategySelect();
      }).not.toThrow();
    });

    test('should render podium ceremony', () => {
      const raceResult = {
        results: [
          {
            participant: { isPlayer: true, character: { name: 'Test Horse' } },
            time: 65.23
          },
          {
            participant: { isPlayer: false, character: { name: 'Rival Horse' } },
            time: 66.45
          }
        ]
      };
      
      expect(() => {
        app.ui.showPodium(raceResult);
      }).not.toThrow();
    });
  });

  describe('Complete Race Flow', () => {
    test('should complete full race progression without errors', async () => {
      // This test simulates the complete race flow
      app.createCharacter('Test Horse');
      
      // Advance to race trigger
      while (app.game.character.career.turn < 4) {
        app.performTrainingSync('speed');
      }
      
      // Trigger race
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.raceReady).toBe(true);
      expect(app.currentState).toBe('race_preview');
      
      // Progress through race states
      app.handleKeyInput('enter'); // preview → lineup
      expect(app.currentState).toBe('horse_lineup');
      
      app.handleKeyInput('enter'); // lineup → strategy
      expect(app.currentState).toBe('strategy_select');
      
      app.handleKeyInput('2'); // strategy → race_running
      expect(app.currentState).toBe('race_running');
      expect(app.selectedStrategy).toBe('MID');
      
      // Verify race field is generated
      expect(app.raceField).toBeDefined();
      expect(app.raceField.length).toBe(7);
      
      // Animation should be initialized
      expect(app.raceAnimation).toBeDefined();
    }, 10000); // Allow extra time for race animation
  });
});