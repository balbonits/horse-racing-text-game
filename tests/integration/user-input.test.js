/**
 * User Input Integration Tests
 * Tests that simulate actual user keyboard and mouse interactions
 */

const GameApp = require('../../src/GameApp');
const InputSimulator = require('../utils/input-simulator');

describe('User Input Integration Tests', () => {
  let app, simulator;
  
  beforeEach(() => {
    app = new GameApp();
    simulator = new InputSimulator(app);
    
    // Suppress console output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    if (app && app.cleanup) {
      app.cleanup();
    }
    jest.restoreAllMocks();
  });

  describe('Keyboard Input Simulation', () => {
    test('should handle single key presses', async () => {
      // Test menu navigation
      const result = await simulator.simulateKeyPress('1');
      
      expect(result).toBeDefined();
      expect(app.currentState).toBe('character_creation');
    });

    test('should handle typing character names', async () => {
      // Navigate to character creation first
      await simulator.simulateKeyPress('1');
      
      // Type character name
      await simulator.typeText('MyHorse');
      
      // The character should be created (through the UI callback system)
      // Note: This tests the integration between typing and character creation
      expect(app.currentState).toBe('character_creation');
    });

    test('should handle special keys', async () => {
      // Test escape key
      await simulator.simulateKeyPress('escape');
      
      // Test enter key  
      await simulator.simulateKeyPress('enter');
      
      // Test arrow keys
      await simulator.simulateKeyPress('up');
      await simulator.simulateKeyPress('down');
      
      // Should not crash
      expect(app).toBeDefined();
    });
  });

  describe('Menu Navigation', () => {
    test('should navigate main menu with number keys', async () => {
      // Start at main menu
      expect(app.currentState).toBe('main_menu');
      
      // Navigate to character creation
      await simulator.selectMenuOption(1);
      expect(app.currentState).toBe('character_creation');
      
      // Navigate back with Q
      await simulator.simulateKeyPress('q');
      expect(app.currentState).toBe('main_menu');
    });

    test('should handle invalid menu selections gracefully', async () => {
      // Try invalid menu options
      await simulator.simulateKeyPress('9');
      await simulator.simulateKeyPress('a');
      await simulator.simulateKeyPress('#');
      
      // Should stay at main menu
      expect(app.currentState).toBe('main_menu');
    });
  });

  describe('Character Creation Flow', () => {
    test('should complete character creation with simulated input', async () => {
      const characterName = 'InputTestHorse';
      
      const result = await simulator.createCharacterFlow(characterName);
      
      expect(result.success).toBe(true);
      expect(result.characterName).toBe(characterName);
      
      // Character should be created
      expect(app.game.character).toBeDefined();
      expect(app.game.character.name).toBe(characterName);
    });

    test('should handle empty character names', async () => {
      // Navigate to character creation
      await simulator.simulateKeyPress('1');
      
      // Try empty name
      await simulator.fillTextbox('   ', true);
      
      // Should not create character
      expect(app.game.character).toBeNull();
    });

    test('should handle special characters in names', async () => {
      const testNames = [
        'Horse123',
        'My-Horse',
        'Horse_Name',
        'HorseWithNumbers2024'
      ];
      
      for (const name of testNames) {
        // Reset for each test
        app.game.character = null;
        await simulator.simulateKeyPress('1');
        
        const result = await simulator.createCharacterFlow(name);
        
        if (name.match(/^[a-zA-Z0-9_-]+$/)) {
          expect(result.success).toBe(true);
        }
      }
    });
  });

  describe('Training Input Flow', () => {
    beforeEach(async () => {
      // Create character first
      await simulator.createCharacterFlow('TrainingTestHorse');
    });

    test('should handle training selections', async () => {
      const trainingSequence = ['speed', 'stamina', 'power', 'rest'];
      
      const results = await simulator.trainingFlow(trainingSequence);
      
      expect(results).toHaveLength(4);
      expect(results.every(r => r.success)).toBe(true);
      
      // Stats should have changed
      const character = app.game.character;
      expect(character.stats.speed).toBeGreaterThan(20);
      expect(character.stats.stamina).toBeGreaterThan(20);
      expect(character.stats.power).toBeGreaterThan(20);
    });

    test('should handle rapid key presses during training', async () => {
      const initialSpeed = app.game.character.stats.speed;
      
      // Rapid speed training
      for (let i = 0; i < 5; i++) {
        await simulator.simulateKeyPress('1'); // Speed training
        await simulator.wait(10); // Very short delay
      }
      
      // Should handle rapid input gracefully
      expect(app.game.character.stats.speed).toBeGreaterThan(initialSpeed);
    });

    test('should complete full training to race transition', async () => {
      // Complete 12 training turns
      const fullTraining = Array(12).fill('rest');
      await simulator.trainingFlow(fullTraining);
      
      // Should transition to race phase
      expect(app.currentState).toBe('race_results');
      expect(app.game.getRaceResults()).toHaveLength(1);
    });
  });

  describe('Race Progression Flow', () => {
    beforeEach(async () => {
      // Set up character and complete training
      await simulator.createCharacterFlow('RaceTestHorse');
      const fullTraining = Array(12).fill('rest');
      await simulator.trainingFlow(fullTraining);
    });

    test('should progress through all races', async () => {
      expect(app.currentState).toBe('race_results');
      
      const raceResults = await simulator.completeRacesFlow();
      
      // Should complete all races
      expect(app.currentState).toBe('career_complete');
      expect(app.game.getRaceResults()).toHaveLength(3);
    });

    test('should handle race result input timing', async () => {
      // Test various timing patterns
      await simulator.simulateKeyPress('enter');
      await simulator.wait(50);
      
      await simulator.simulateKeyPress('enter');
      await simulator.wait(200);
      
      await simulator.simulateKeyPress('enter');
      
      // Should complete successfully regardless of timing
      expect(app.currentState).toBe('career_complete');
    });
  });

  describe('Full Game Playthrough', () => {
    test('should complete entire game with simulated user input', async () => {
      const characterName = 'FullGameTest';
      const trainingSequence = [
        'speed', 'speed', 'stamina', 'stamina', 
        'power', 'power', 'rest', 'rest',
        'speed', 'stamina', 'power', 'rest'
      ];
      
      const playthrough = await simulator.fullGamePlaythrough(characterName, trainingSequence);
      
      expect(playthrough.success).toBe(true);
      expect(playthrough.finalState).toBe('career_complete');
      expect(playthrough.character).toBeDefined();
      expect(playthrough.character.name).toBe(characterName);
      
      // Should have all steps
      expect(playthrough.steps).toHaveLength(3);
      expect(playthrough.steps[0].step).toBe('character_creation');
      expect(playthrough.steps[1].step).toBe('training');
      expect(playthrough.steps[2].step).toBe('racing');
    });

    test('should handle interrupted gameplay', async () => {
      // Start character creation
      await simulator.simulateKeyPress('1');
      
      // Quit mid-process
      await simulator.simulateKeyPress('q');
      
      expect(app.currentState).toBe('main_menu');
      expect(app.game.character).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle simultaneous key presses', async () => {
      // Simulate multiple keys pressed at once
      const promises = [
        simulator.simulateKeyPress('1'),
        simulator.simulateKeyPress('2'),
        simulator.simulateKeyPress('3')
      ];
      
      await Promise.all(promises);
      
      // Should not crash
      expect(app).toBeDefined();
    });

    test('should handle very long text input', async () => {
      await simulator.simulateKeyPress('1');
      
      const longName = 'A'.repeat(100);
      await simulator.fillTextbox(longName, true);
      
      // Should handle gracefully (either accept or reject based on validation)
      expect(app.currentState).toBe('character_creation');
    });

    test('should handle system interruptions', async () => {
      await simulator.createCharacterFlow('TestHorse');
      
      // Simulate app being interrupted
      app.ui = null; // Simulate UI failure
      
      await simulator.simulateKeyPress('1');
      
      // Should not crash
      expect(app).toBeDefined();
    });
  });

  describe('Accessibility and Alternative Input', () => {
    test('should work with alternative key mappings', async () => {
      // Test space bar as alternate enter
      await simulator.simulateKeyPress('1');
      await simulator.typeText('SpaceTestHorse');
      await simulator.simulateKeyPress('space');
      
      // Should work the same as enter
      expect(app.game.character?.name).toBe('SpaceTestHorse');
    });

    test('should handle keyboard shortcuts', async () => {
      // Test 'h' for help
      await simulator.simulateKeyPress('h');
      expect(app.currentState).toBe('help');
      
      // Test 'q' for quit
      await simulator.simulateKeyPress('q');
      // Should go back to previous state or main menu
    });
  });
});