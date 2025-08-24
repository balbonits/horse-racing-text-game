/**
 * Core User Journey Tests
 * Tests the critical paths through the game
 */

const GameApp = require('../../src/GameApp');
const { testUtils } = require('../helpers/testUtils');

// Helper function to create mock screen
function createMockScreen() {
  return {
    key: jest.fn(),
    render: jest.fn(),
    destroy: jest.fn(),
    append: jest.fn(),
    remove: jest.fn(),
    setContent: jest.fn(),
    focus: jest.fn(),
    children: [],
    title: 'Test Screen',
    width: 80,
    height: 24,
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    program: {
      output: {
        write: jest.fn()
      },
      clear: jest.fn(),
      move: jest.fn()
    }
  };
}

describe('Core User Journeys', () => {
  let app;
  let screen;
  let originalConsoleError;
  let originalConsoleLog;

  beforeAll(() => {
    // Suppress console output during tests
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restore console
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    screen = createMockScreen();
    app = new GameApp(screen);
  });

  afterEach(() => {
    if (app && app.cleanup) {
      app.cleanup();
    }
  });

  describe('Journey 1: New Player First Experience', () => {
    test('should navigate from main menu to character creation', () => {
      // Initially at main menu
      expect(app.currentState).toBe('main_menu');
      
      // Press 1 for new career
      app.handleKeyInput('1');
      
      // Should transition to character creation
      expect(app.currentState).toBe('character_creation');
    });

    test('should create character and start training', () => {
      // Navigate to character creation
      app.handleKeyInput('1');
      expect(app.currentState).toBe('character_creation');
      
      // Create character with name
      const result = app.createCharacter('Thunder');
      expect(result.success).toBe(true);
      expect(app.game.character.name).toBe('Thunder');
      
      // Should transition to training
      expect(app.currentState).toBe('training');
    });

    test('should complete first training action', () => {
      // Setup: Create character
      app.handleKeyInput('1');
      app.createCharacter('Thunder');
      
      // Record initial stats
      const initialSpeed = app.game.character.stats.speed;
      const initialEnergy = app.game.character.energy;
      
      // Perform speed training (option 1)
      app.handleKeyInput('1');
      
      // Stats should change
      expect(app.game.character.stats.speed).toBeGreaterThan(initialSpeed);
      expect(app.game.character.energy).toBeLessThan(initialEnergy);
      expect(app.game.turnCount).toBe(2); // Turn 1 complete, now on turn 2
    });
  });

  describe('Journey 2: Complete Training Phase', () => {
    beforeEach(() => {
      // Quick setup to training phase
      app.handleKeyInput('1');
      app.createCharacter('Thunder');
    });

    test('should handle energy depletion and rest', () => {
      const startEnergy = app.game.character.energy;
      
      // Train until low energy
      while (app.game.character.energy > 20) {
        app.handleKeyInput('3'); // Power training
      }
      
      // Verify low energy
      expect(app.game.character.energy).toBeLessThanOrEqual(20);
      
      // Rest to recover
      const beforeRest = app.game.character.energy;
      app.handleKeyInput('4'); // Rest
      
      // Energy should increase
      expect(app.game.character.energy).toBeGreaterThan(beforeRest);
      expect(app.game.character.energy).toBeLessThanOrEqual(100);
    });

    test('should progress through multiple training turns', () => {
      // Train for several turns
      for (let i = 0; i < 5; i++) {
        const turnBefore = app.game.turnCount;
        
        // Alternate training types
        if (app.game.character.energy >= 15) {
          app.handleKeyInput(i % 2 === 0 ? '1' : '2'); // Speed or Stamina
        } else {
          app.handleKeyInput('4'); // Rest
        }
        
        // Turn should advance
        expect(app.game.turnCount).toBe(turnBefore + 1);
      }
      
      // Should still be in training phase
      expect(app.currentState).toBe('training');
      expect(app.game.turnCount).toBeLessThanOrEqual(12);
    });

    test('should transition to race after training phase', () => {
      // Complete all training turns
      while (app.game.turnCount <= 12 && app.currentState === 'training') {
        // Smart training based on energy
        if (app.game.character.energy >= 15) {
          app.handleKeyInput('1'); // Speed training
        } else {
          app.handleKeyInput('4'); // Rest
        }
      }
      
      // Should transition to race phase
      expect(app.currentState).toBe('race_results');
    });
  });

  describe('Journey 3: Race Execution', () => {
    beforeEach(() => {
      // Setup character with specific stats for testing
      app.handleKeyInput('1');
      app.createCharacter('Thunder');
      
      // Give character some training
      app.game.character.stats.speed = 50;
      app.game.character.stats.stamina = 50;
      app.game.character.stats.power = 50;
    });

    test('should run race and show results', () => {
      // Trigger race
      const raceData = {
        name: 'Test Derby',
        distance: 1600,
        surface: 'Turf'
      };
      
      const result = app.game.runRace(raceData);
      
      // Verify race result structure
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('performance');
      expect(result.position).toBeGreaterThanOrEqual(1);
      expect(result.position).toBeLessThanOrEqual(8);
    });

    test('should show different results based on stats', () => {
      // Test with low stats
      app.game.character.stats.speed = 20;
      app.game.character.stats.stamina = 20;
      app.game.character.stats.power = 20;
      
      const weakResult = app.game.runRace({ name: 'Test Race', distance: 1600 });
      
      // Test with high stats
      app.game.character.stats.speed = 80;
      app.game.character.stats.stamina = 80;
      app.game.character.stats.power = 80;
      
      const strongResult = app.game.runRace({ name: 'Test Race', distance: 1600 });
      
      // Strong character should perform better on average
      expect(strongResult.performance).toBeGreaterThan(weakResult.performance);
    });
  });

  describe('Journey 4: Save and Load', () => {
    test('should save game state during training', () => {
      // Setup game state
      app.handleKeyInput('1');
      app.createCharacter('Thunder');
      app.handleKeyInput('1'); // Do some training
      
      const stateBeforeSave = {
        name: app.game.character.name,
        stats: { ...app.game.character.stats },
        energy: app.game.character.energy,
        turnCount: app.game.turnCount
      };
      
      // Save game
      const saveResult = app.saveGame('test_save');
      expect(saveResult.success).toBe(true);
      
      // Create new app and load
      const newApp = new GameApp(createMockScreen());
      const loadResult = newApp.loadGame('test_save');
      
      expect(loadResult.success).toBe(true);
      expect(newApp.game.character.name).toBe(stateBeforeSave.name);
      expect(newApp.game.character.stats).toEqual(stateBeforeSave.stats);
      expect(newApp.game.character.energy).toBe(stateBeforeSave.energy);
      expect(newApp.game.turnCount).toBe(stateBeforeSave.turnCount);
    });
  });

  describe('Journey 5: Complete Career', () => {
    test('should complete full career from start to finish', () => {
      // Start new career
      app.handleKeyInput('1');
      app.createCharacter('Thunder');
      expect(app.currentState).toBe('training');
      
      // Complete training phase
      while (app.currentState === 'training') {
        if (app.game.character.energy >= 15) {
          // Vary training for balanced stats
          const choice = app.game.turnCount % 3;
          app.handleKeyInput(String(choice + 1));
        } else {
          app.handleKeyInput('4'); // Rest
        }
      }
      
      // Should transition to races
      expect(app.currentState).toBe('race_results');
      
      // Complete races
      while (app.game.currentRaceIndex < app.game.scheduledRaces.length) {
        app.handleKeyInput(' '); // Continue to next race
      }
      
      // Should reach career complete
      expect(app.currentState).toBe('career_complete');
      
      // Verify career results exist
      expect(app.game.careerResults).toBeDefined();
      expect(app.game.careerResults.totalRaces).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    test('should handle invalid inputs gracefully', () => {
      const initialState = app.currentState;
      
      // Try invalid inputs
      app.handleKeyInput('x');
      app.handleKeyInput('99');
      app.handleKeyInput('!@#');
      
      // Should remain in same state
      expect(app.currentState).toBe(initialState);
    });

    test('should prevent training without energy', () => {
      app.handleKeyInput('1');
      app.createCharacter('Thunder');
      
      // Deplete energy
      app.game.character.energy = 5;
      
      const statsBefore = { ...app.game.character.stats };
      
      // Try to train (requires 15 energy)
      app.handleKeyInput('1');
      
      // Stats shouldn't change
      expect(app.game.character.stats).toEqual(statsBefore);
      
      // Should show error or force rest
      expect(app.ui.lastMessage).toContain('energy');
    });
  });

  describe('Menu Navigation', () => {
    test('should navigate through all menu options', () => {
      // Main menu
      expect(app.currentState).toBe('main_menu');
      
      // Test help
      app.handleKeyInput('3');
      expect(app.currentState).toBe('help');
      
      // Return to main menu
      app.handleKeyInput('b');
      expect(app.currentState).toBe('main_menu');
      
      // Test load (should show message if no saves)
      app.handleKeyInput('2');
      if (!app.game.hasSaves()) {
        expect(app.ui.lastMessage).toContain('No saved games');
      }
    });

    test('should quit cleanly', () => {
      const quitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      app.handleKeyInput('4'); // Quit from main menu
      
      expect(quitSpy).toHaveBeenCalledWith(0);
      quitSpy.mockRestore();
    });
  });
});

describe('Performance Tests', () => {
  test('should handle rapid inputs without lag', () => {
    const screen = createMockScreen();
    const app = new GameApp(screen);
    
    app.handleKeyInput('1');
    app.createCharacter('Speed Test');
    
    const startTime = Date.now();
    
    // Spam inputs
    for (let i = 0; i < 100; i++) {
      app.handleKeyInput(String((i % 5) + 1));
    }
    
    const elapsed = Date.now() - startTime;
    
    // Should process 100 inputs in under 1 second
    expect(elapsed).toBeLessThan(1000);
  });

  test('should not leak memory during long session', () => {
    const screen = createMockScreen();
    const app = new GameApp(screen);
    
    app.handleKeyInput('1');
    app.createCharacter('Memory Test');
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate long play session
    for (let i = 0; i < 500; i++) {
      if (app.game.character.energy >= 15) {
        app.handleKeyInput('1');
      } else {
        app.handleKeyInput('4');
      }
    }
    
    global.gc && global.gc(); // Force garbage collection if available
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - initialMemory;
    
    // Memory growth should be reasonable (< 10MB)
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
  });
});