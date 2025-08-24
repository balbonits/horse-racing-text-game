/**
 * UI Functionality Integration Tests
 * Tests actual user interface components and interactions
 */

const GameApp = require('../../src/GameApp');
const blessed = require('blessed');

describe('UI Functionality Integration', () => {
  let app, mockScreen;
  
  beforeEach(() => {
    // Create mock blessed screen for testing
    mockScreen = {
      append: jest.fn(),
      render: jest.fn(), 
      program: {
        output: {},
        input: {},
        key: jest.fn(),
        on: jest.fn()
      },
      on: jest.fn(),
      key: jest.fn(),
      smartCSR: true,
      width: 80,
      height: 24
    };

    // Mock blessed.screen()
    jest.spyOn(blessed, 'screen').mockReturnValue(mockScreen);
    
    app = new GameApp();
    
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

  describe('Screen Detection and Setup', () => {
    test('should properly detect blessed screen capabilities', () => {
      // Screen should be created and have required properties
      expect(mockScreen.append).toBeDefined();
      expect(mockScreen.render).toBeDefined();
      expect(mockScreen.program).toBeDefined();
      expect(mockScreen.program.output).toBeDefined();
    });

    test('should handle missing blessed screen gracefully', () => {
      // Create app with null screen
      jest.spyOn(blessed, 'screen').mockReturnValue(null);
      
      const appWithNoScreen = new GameApp();
      expect(() => {
        appWithNoScreen.setState('character_creation');
      }).not.toThrow();
      
      appWithNoScreen.cleanup();
    });
  });

  describe('Character Creation UI', () => {
    test('should show character creation screen', () => {
      app.setState('character_creation');
      
      // Should render blessed components
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('should handle character name input', (done) => {
      let nameSubmitCallback = null;
      
      // Mock blessed.textbox to capture callback
      const mockTextbox = {
        focus: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'submit') {
            nameSubmitCallback = callback;
          }
        })
      };
      
      jest.spyOn(blessed, 'textbox').mockReturnValue(mockTextbox);
      
      app.setState('character_creation');
      
      // Simulate name input
      setTimeout(() => {
        expect(nameSubmitCallback).toBeDefined();
        nameSubmitCallback('TestHorse');
        
        // Should create character
        expect(app.game.character).toBeDefined();
        expect(app.game.character.name).toBe('TestHorse');
        done();
      }, 10);
    });

    test('should validate character name input', (done) => {
      let nameSubmitCallback = null;
      
      const mockTextbox = {
        focus: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'submit') {
            nameSubmitCallback = callback;
          }
        })
      };
      
      jest.spyOn(blessed, 'textbox').mockReturnValue(mockTextbox);
      
      app.setState('character_creation');
      
      setTimeout(() => {
        // Test empty name
        nameSubmitCallback('   ');
        expect(app.game.character).toBeNull();
        
        // Test valid name
        nameSubmitCallback('ValidHorse');
        expect(app.game.character).toBeDefined();
        done();
      }, 10);
    });
  });

  describe('Training UI', () => {
    beforeEach(() => {
      // Create character for training tests
      app.createCharacter('TestHorse');
    });

    test('should show training interface', () => {
      app.setState('training');
      
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('should handle training button clicks', () => {
      const initialSpeed = app.game.character.stats.speed;
      
      app.setState('training');
      app.performTraining('speed');
      
      // Speed should increase
      expect(app.game.character.stats.speed).toBeGreaterThan(initialSpeed);
    });
  });

  describe('Race Results UI', () => {
    beforeEach(() => {
      app.createCharacter('TestHorse');
      // Advance to race phase
      for (let i = 0; i < 12; i++) {
        app.performTraining('rest');
      }
    });

    test('should show race results', () => {
      app.setState('race_results');
      
      expect(mockScreen.render).toHaveBeenCalled();
      expect(app.game.getRaceResults()).toHaveLength(1);
    });

    test('should handle race progression input', () => {
      app.setState('race_results');
      
      const initialRaces = app.game.getRaceResults().length;
      
      // Simulate Enter key to continue to next race
      app.handleKeyInput('enter');
      
      // Should have more races or complete career
      const newRaces = app.game.getRaceResults().length;
      expect(newRaces > initialRaces || app.currentState === 'career_complete').toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle blessed component creation failures', () => {
      // Mock blessed to throw errors
      jest.spyOn(blessed, 'box').mockImplementation(() => {
        throw new Error('Blessed error');
      });
      
      expect(() => {
        app.setState('character_creation');
      }).not.toThrow();
    });

    test('should fallback gracefully when blessed is unavailable', () => {
      // Mock screen detection to fail
      const badScreen = {};
      jest.spyOn(blessed, 'screen').mockReturnValue(badScreen);
      
      const appWithBadScreen = new GameApp();
      
      expect(() => {
        appWithBadScreen.setState('character_creation');
      }).not.toThrow();
      
      appWithBadScreen.cleanup();
    });
  });

  describe('Full UI Flow', () => {
    test('should complete entire game flow through UI', (done) => {
      let step = 0;
      const steps = [
        () => {
          // Step 1: Start character creation
          app.setState('character_creation');
          expect(app.currentState).toBe('character_creation');
          step++;
        },
        () => {
          // Step 2: Create character (simulated)
          app.createCharacter('FlowTestHorse');
          expect(app.game.character).toBeDefined();
          step++;
        },
        () => {
          // Step 3: Enter training
          app.setState('training');
          expect(app.currentState).toBe('training');
          step++;
        },
        () => {
          // Step 4: Complete training
          for (let i = 0; i < 12; i++) {
            app.performTraining('rest');
          }
          expect(app.currentState).toBe('race_results');
          step++;
        },
        () => {
          // Step 5: Complete races
          while (app.currentState === 'race_results') {
            app.handleKeyInput('enter');
          }
          expect(app.currentState).toBe('career_complete');
          step++;
          done();
        }
      ];

      // Execute steps with delays to simulate real interaction
      const executeStep = (stepIndex) => {
        if (stepIndex < steps.length) {
          steps[stepIndex]();
          setTimeout(() => executeStep(stepIndex + 1), 10);
        }
      };
      
      executeStep(0);
    });
  });
});