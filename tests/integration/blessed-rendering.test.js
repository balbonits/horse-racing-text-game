/**
 * Blessed Rendering Integration Tests
 * Tests actual blessed library integration and screen rendering
 */

const GameApp = require('../../src/GameApp');
const UI = require('../../src/systems/UI');
const blessed = require('blessed');

// Mock process stdout to capture terminal output
const mockStdout = {
  write: jest.fn(),
  columns: 80,
  rows: 24,
  isTTY: true
};

describe('Blessed Rendering Integration', () => {
  let originalStdout;
  
  beforeAll(() => {
    originalStdout = process.stdout;
  });
  
  beforeEach(() => {
    // Reset mocks
    mockStdout.write.mockClear();
    
    // Suppress console output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Screen Creation and Management', () => {
    test('should create blessed screen with correct options', () => {
      const screenSpy = jest.spyOn(blessed, 'screen');
      
      const ui = new UI();
      
      expect(screenSpy).toHaveBeenCalledWith(expect.objectContaining({
        smartCSR: true,
        autoPadding: true,
        mouse: true,
        keys: true
      }));
      
      ui.cleanup();
      screenSpy.mockRestore();
    });

    test('should handle screen cleanup properly', () => {
      const ui = new UI();
      const destroySpy = jest.spyOn(ui.screen, 'destroy').mockImplementation(() => {});
      
      ui.cleanup();
      
      expect(destroySpy).toHaveBeenCalled();
    });

    test('should detect screen capabilities correctly', () => {
      const ui = new UI();
      
      // Test screen detection logic
      const hasValidScreen = ui.screen && 
                            ui.screen.append && 
                            ui.screen.render && 
                            ui.screen.program && 
                            ui.screen.program.output;
      
      expect(hasValidScreen).toBe(true);
      
      ui.cleanup();
    });
  });

  describe('Component Rendering', () => {
    let ui;
    
    beforeEach(() => {
      ui = new UI();
    });
    
    afterEach(() => {
      ui.cleanup();
    });

    test('should render main box component', () => {
      const renderSpy = jest.spyOn(ui.screen, 'render');
      
      ui.showMainMenu(['Option 1', 'Option 2']);
      
      expect(renderSpy).toHaveBeenCalled();
      expect(ui.components.mainBox).toBeDefined();
    });

    test('should create textbox for character creation', () => {
      const textboxSpy = jest.spyOn(blessed, 'textbox');
      
      ui.showCharacterCreation(() => {});
      
      expect(textboxSpy).toHaveBeenCalled();
      
      textboxSpy.mockRestore();
    });

    test('should handle blessed component errors gracefully', () => {
      // Mock blessed.box to throw error
      const boxSpy = jest.spyOn(blessed, 'box').mockImplementation(() => {
        throw new Error('Blessed component error');
      });
      
      expect(() => {
        ui.showMainMenu(['Test']);
      }).not.toThrow();
      
      boxSpy.mockRestore();
    });
  });

  describe('Input Handling', () => {
    let ui;
    
    beforeEach(() => {
      ui = new UI();
    });
    
    afterEach(() => {
      ui.cleanup();
    });

    test('should register key handlers on screen', () => {
      const keySpy = jest.spyOn(ui.screen, 'key');
      
      const app = new GameApp();
      
      expect(keySpy).toHaveBeenCalled();
      
      app.cleanup();
    });

    test('should handle textbox submit events', (done) => {
      let submitHandler = null;
      
      // Mock textbox with event handling
      const mockTextbox = {
        focus: jest.fn(),
        on: jest.fn((event, handler) => {
          if (event === 'submit') {
            submitHandler = handler;
          }
        })
      };
      
      jest.spyOn(blessed, 'textbox').mockReturnValue(mockTextbox);
      
      ui.showCharacterCreation((name) => {
        expect(name).toBe('TestInput');
        done();
      });
      
      // Simulate submit event
      setTimeout(() => {
        if (submitHandler) {
          submitHandler('TestInput');
        }
      }, 10);
    });
  });

  describe('Terminal Compatibility', () => {
    test('should work with different terminal sizes', () => {
      const ui = new UI();
      
      // Simulate different screen sizes
      ui.screen.width = 120;
      ui.screen.height = 40;
      
      expect(() => {
        ui.showMainMenu(['Test Option']);
      }).not.toThrow();
      
      ui.cleanup();
    });

    test('should handle missing terminal capabilities', () => {
      // Mock a limited terminal
      const limitedScreen = {
        append: jest.fn(),
        render: jest.fn(),
        program: {
          output: null, // Missing output capability
          input: {},
          key: jest.fn(),
          on: jest.fn()
        },
        on: jest.fn(),
        key: jest.fn(),
        width: 80,
        height: 24
      };
      
      jest.spyOn(blessed, 'screen').mockReturnValue(limitedScreen);
      
      const ui = new UI();
      
      // Should fallback gracefully for character creation
      expect(() => {
        ui.showCharacterCreation(() => {});
      }).not.toThrow();
      
      ui.cleanup();
    });
  });

  describe('Real Terminal Integration', () => {
    test('should work with actual terminal if available', () => {
      // Only run if we have a real terminal
      if (!process.stdout.isTTY) {
        console.log('Skipping real terminal test - not in TTY environment');
        return;
      }
      
      const app = new GameApp();
      
      // Should create without errors
      expect(app.ui).toBeDefined();
      expect(app.ui.screen).toBeDefined();
      
      // Should be able to set states
      expect(() => {
        app.setState('main_menu');
        app.setState('character_creation');
      }).not.toThrow();
      
      app.cleanup();
    });

    test('should detect when running in test environment', () => {
      const ui = new UI();
      
      // In test environment, should handle gracefully
      expect(() => {
        ui.showCharacterCreation((name) => {
          // This should be called even in test environment
          expect(name).toBe('Test Horse');
        });
      }).not.toThrow();
      
      ui.cleanup();
    });
  });
});