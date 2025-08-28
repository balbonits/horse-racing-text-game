/**
 * Stat Randomizer Issue Tests
 * 
 * Tests to identify why stat randomizer isn't working when starting a new career.
 * Should show randomized stats but seems to be using default values instead.
 */

const GameApp = require('../../src/GameApp');
const Character = require('../../src/modules/Character');

describe('Stat Randomizer Investigation', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  let originalRandom;
  
  beforeEach(() => {
    // Mock console.log to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Mock Math.random to verify it's being called
    originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    // Restore mocks
    console.log = originalConsoleLog;
    Math.random = originalRandom;
    
    // Clean up
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('New career stat generation', () => {
    test('should identify if stat randomizer is called during character creation', () => {
      // Navigate to character creation
      gameApp.setState('character_creation');
      
      // Clear Math.random calls
      Math.random.mockClear();
      
      // Enter a character name
      gameApp.characterNameBuffer = 'Test Horse';
      gameApp.handleKeyInput('\n'); // Submit name
      
      // Check if Math.random was called for stat generation
      const randomCallCount = Math.random.mock.calls.length;
      
      console.log('Math.random called:', randomCallCount, 'times');
      console.log('Character created:', !!gameApp.game.character);
      
      if (gameApp.game.character) {
        console.log('Character stats:', gameApp.game.character.stats);
      }
      
      // Should have called Math.random for stat randomization
      expect(randomCallCount).toBeGreaterThan(0);
    });

    test('should check if stats are actually randomized', () => {
      // Create multiple characters and check if stats vary
      const characters = [];
      
      for (let i = 0; i < 3; i++) {
        // Reset Math.random with different values
        Math.random = jest.fn(() => 0.2 + (i * 0.3));
        
        const character = new Character(`Horse${i}`, {
          speed: 20,
          stamina: 20,
          power: 20
        });
        
        characters.push(character);
        
        console.log(`Character ${i} stats:`, character.stats);
      }
      
      // Check if stats are different
      const allSame = characters.every(char => 
        char.stats.speed === characters[0].stats.speed &&
        char.stats.stamina === characters[0].stats.stamina &&
        char.stats.power === characters[0].stats.power
      );
      
      console.log('All characters have same stats:', allSame);
      
      // Stats should vary between characters
      expect(allSame).toBe(false);
    });
  });

  describe('Character creation flow', () => {
    test('should trace character creation process', () => {
      gameApp.setState('character_creation');
      
      // Check initial state
      console.log('Initial character:', gameApp.game.character);
      
      // Enter name
      gameApp.characterNameBuffer = 'Test Horse';
      
      // Clear output to focus on creation
      consoleOutput.length = 0;
      
      // Submit name
      gameApp.handleKeyInput('\n');
      
      // Check what happened
      const output = consoleOutput.join('\n');
      console.log('Output after name submission:', output);
      
      // Check if character was created
      const character = gameApp.game.character;
      if (character) {
        console.log('Character created successfully');
        console.log('Name:', character.name);
        console.log('Stats:', character.stats);
        console.log('Speed:', character.stats.speed);
        console.log('Stamina:', character.stats.stamina);
        console.log('Power:', character.stats.power);
        
        // Check if stats are default or randomized
        const hasDefaultStats = 
          character.stats.speed === 20 &&
          character.stats.stamina === 20 &&
          character.stats.power === 20;
        
        console.log('Has default stats (20/20/20):', hasDefaultStats);
        
        // Stats should NOT all be default
        expect(hasDefaultStats).toBe(false);
      } else {
        console.log('No character created');
      }
      
      expect(character).toBeDefined();
    });

    test('should check startNewGame method for stat randomization', () => {
      // Test the direct method that starts a new game
      Math.random.mockClear();
      
      const result = gameApp.game.startNewGame('Direct Test Horse');
      
      console.log('startNewGame result:', result);
      console.log('Math.random called:', Math.random.mock.calls.length, 'times');
      
      if (gameApp.game.character) {
        const stats = gameApp.game.character.stats;
        console.log('Character stats after startNewGame:', stats);
        
        // Check if stats are randomized (not all 20)
        const allTwenty = stats.speed === 20 && stats.stamina === 20 && stats.power === 20;
        console.log('All stats are 20:', allTwenty);
        
        expect(allTwenty).toBe(false);
      }
      
      expect(Math.random.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Stat randomizer function', () => {
    test('should locate and test stat randomization logic', () => {
      // Look for where stats should be randomized
      const Character = require('../../src/modules/Character');
      
      // Create a character with explicit stats
      const charWithStats = new Character('Test', {
        speed: 25,
        stamina: 30,
        power: 35
      });
      
      console.log('Character with explicit stats:', charWithStats.stats);
      
      // Create a character without explicit stats (should randomize)
      const charDefault = new Character('Test2');
      
      console.log('Character with default/random stats:', charDefault.stats);
      
      // Check if they're different
      const areDifferent = 
        charWithStats.stats.speed !== charDefault.stats.speed ||
        charWithStats.stats.stamina !== charDefault.stats.stamina ||
        charWithStats.stats.power !== charDefault.stats.power;
      
      console.log('Stats are different:', areDifferent);
    });

    test('should verify stat randomization range', () => {
      // Test multiple times to check randomization range
      Math.random = originalRandom; // Use real random for this test
      
      const stats = [];
      for (let i = 0; i < 10; i++) {
        const character = new Character(`Horse${i}`);
        stats.push(character.stats);
      }
      
      // Calculate min/max for each stat
      const speedValues = stats.map(s => s.speed);
      const staminaValues = stats.map(s => s.stamina);
      const powerValues = stats.map(s => s.power);
      
      console.log('Speed range:', Math.min(...speedValues), '-', Math.max(...speedValues));
      console.log('Stamina range:', Math.min(...staminaValues), '-', Math.max(...staminaValues));
      console.log('Power range:', Math.min(...powerValues), '-', Math.max(...powerValues));
      
      // Should have some variation
      const speedVariation = Math.max(...speedValues) - Math.min(...speedValues);
      const staminaVariation = Math.max(...staminaValues) - Math.min(...staminaValues);
      const powerVariation = Math.max(...powerValues) - Math.min(...powerValues);
      
      console.log('Variations:', { speedVariation, staminaVariation, powerVariation });
      
      // At least one stat should have variation
      expect(speedVariation + staminaVariation + powerVariation).toBeGreaterThan(0);
    });
  });

  describe('UI display of randomized stats', () => {
    test('should check if randomized stats are displayed', () => {
      // Start new game
      gameApp.game.startNewGame('UI Test Horse');
      
      // Navigate to training screen
      gameApp.setState('training');
      
      // Clear output
      consoleOutput.length = 0;
      
      // Render the training screen
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      
      // Check if stats are displayed
      const speedMatch = output.match(/Speed:\s+(\d+)/);
      const staminaMatch = output.match(/Stamina:\s+(\d+)/);
      const powerMatch = output.match(/Power:\s+(\d+)/);
      
      if (speedMatch) {
        console.log('Displayed Speed:', speedMatch[1]);
      }
      if (staminaMatch) {
        console.log('Displayed Stamina:', staminaMatch[1]);
      }
      if (powerMatch) {
        console.log('Displayed Power:', powerMatch[1]);
      }
      
      // Should display stats
      expect(speedMatch).toBeTruthy();
      expect(staminaMatch).toBeTruthy();
      expect(powerMatch).toBeTruthy();
    });
  });
});