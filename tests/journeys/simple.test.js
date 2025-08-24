/**
 * Simple Journey Test - Verify basic functionality
 */

const GameApp = require('../../src/GameApp');
const Game = require('../../src/systems/Game');

// Simple mock screen that doesn't trigger blessed
function createSimpleMockScreen() {
  return {
    key: jest.fn(),
    render: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn()
  };
}

describe('Simple Core Mechanics', () => {
  let originalConsole;
  
  beforeAll(() => {
    // Suppress console output
    originalConsole = {
      log: console.log,
      error: console.error
    };
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  });

  describe('Game Logic (No UI)', () => {
    test('should create and train character', () => {
      const game = new Game();
      
      // Create character
      const result = game.createCharacter('Thunder');
      expect(result.success).toBe(true);
      expect(game.character.name).toBe('Thunder');
      
      // Initial stats
      expect(game.character.stats.speed).toBeGreaterThan(0);
      expect(game.character.stats.stamina).toBeGreaterThan(0);
      expect(game.character.stats.power).toBeGreaterThan(0);
      
      // Training should work
      const initialSpeed = game.character.stats.speed;
      const trainResult = game.executeTraining('speed');
      
      if (trainResult.success) {
        expect(game.character.stats.speed).toBeGreaterThan(initialSpeed);
      } else {
        // Not enough energy
        expect(trainResult.reason).toContain('energy');
      }
    });
    
    test('should handle energy system', () => {
      const game = new Game();
      game.createCharacter('Thunder');
      
      const initialEnergy = game.character.energy;
      
      // Training costs energy
      if (game.character.energy >= 15) {
        game.executeTraining('speed');
        expect(game.character.energy).toBeLessThan(initialEnergy);
      }
      
      // Rest recovers energy
      const beforeRest = game.character.energy;
      game.executeTraining('rest');
      expect(game.character.energy).toBeGreaterThan(beforeRest);
    });
    
    test('should run races', () => {
      const game = new Game();
      game.createCharacter('Thunder');
      
      // Set reasonable stats
      game.character.stats.speed = 50;
      game.character.stats.stamina = 50;
      game.character.stats.power = 50;
      
      const raceData = {
        name: 'Test Race',
        distance: 1600,
        surface: 'Turf'
      };
      
      const result = game.runRace(raceData);
      
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('performance');
      expect(result.position).toBeGreaterThanOrEqual(1);
      expect(result.position).toBeLessThanOrEqual(8);
    });
    
    test('should track turn progression', () => {
      const game = new Game();
      game.createCharacter('Thunder');
      
      const initialTurn = game.turnCount;
      
      // Execute training advances turn
      game.executeTraining('speed');
      expect(game.turnCount).toBe(initialTurn + 1);
      
      // Rest also advances turn
      game.executeTraining('rest');
      expect(game.turnCount).toBe(initialTurn + 2);
    });
  });

  describe('GameApp State Management', () => {
    test('should initialize with correct state', () => {
      const screen = createSimpleMockScreen();
      const app = new GameApp(screen);
      
      expect(app.currentState).toBe('main_menu');
      expect(app.game).toBeDefined();
      expect(app.ui).toBeDefined();
      
      // Cleanup
      app.cleanup();
    });
    
    test('should handle state transitions', () => {
      const screen = createSimpleMockScreen();
      const app = new GameApp(screen);
      
      // Start at main menu
      expect(app.currentState).toBe('main_menu');
      
      // Transition to character creation
      app.setState('character_creation');
      expect(app.currentState).toBe('character_creation');
      
      // Create character and go to training
      app.createCharacter('Thunder');
      expect(app.currentState).toBe('training');
      
      // Cleanup
      app.cleanup();
    });
    
    test('should handle input correctly', () => {
      const screen = createSimpleMockScreen();
      const app = new GameApp(screen);
      
      // Navigate to character creation
      app.handleKeyInput('1');
      expect(app.currentState).toBe('character_creation');
      
      // Create character
      app.createCharacter('Thunder');
      expect(app.currentState).toBe('training');
      
      // Perform training
      const initialSpeed = app.game.character.stats.speed;
      app.handleKeyInput('1'); // Speed training
      
      // Either trained or showed error
      expect(app.game.turnCount).toBeGreaterThan(1);
      
      // Cleanup
      app.cleanup();
    });
  });

  describe('Save/Load System', () => {
    test('should save and load game state', () => {
      const screen = createSimpleMockScreen();
      const app = new GameApp(screen);
      
      // Create a game state
      app.handleKeyInput('1');
      app.createCharacter('SaveTest');
      app.handleKeyInput('1'); // Do some training
      
      const beforeSave = {
        name: app.game.character.name,
        turn: app.game.turnCount,
        stats: { ...app.game.character.stats }
      };
      
      // Save
      const saveResult = app.saveGame('test_save');
      expect(saveResult.success).toBe(true);
      
      // Create new app and load
      const newApp = new GameApp(createSimpleMockScreen());
      const loadResult = newApp.loadGame('test_save');
      
      if (loadResult.success) {
        expect(newApp.game.character.name).toBe(beforeSave.name);
        expect(newApp.game.turnCount).toBe(beforeSave.turn);
      }
      
      // Cleanup
      app.cleanup();
      newApp.cleanup();
    });
  });

  describe('Performance', () => {
    test('should handle multiple training actions quickly', () => {
      const game = new Game();
      game.createCharacter('Performance');
      
      const startTime = Date.now();
      
      // Run 100 training actions
      for (let i = 0; i < 100; i++) {
        if (game.character.energy >= 15) {
          game.executeTraining('speed');
        } else {
          game.executeTraining('rest');
        }
      }
      
      const elapsed = Date.now() - startTime;
      
      // Should complete in under 500ms
      expect(elapsed).toBeLessThan(500);
    });
    
    test('should not leak memory', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy multiple game instances
      for (let i = 0; i < 10; i++) {
        const screen = createSimpleMockScreen();
        const app = new GameApp(screen);
        app.handleKeyInput('1');
        app.createCharacter(`Test${i}`);
        
        // Do some actions
        for (let j = 0; j < 10; j++) {
          app.handleKeyInput('1');
        }
        
        app.cleanup();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be reasonable (< 50MB)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });
  });
});