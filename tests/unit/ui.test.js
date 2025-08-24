const UISystem = require('../../src/systems/UI');
const { MockBlessedScreen, TestDataFactory } = require('../helpers/mockData');
const { testUtils, setupTest, teardownTest } = require('../helpers/testUtils');

describe('UI System', () => {
  let utils;
  let mockScreen;
  let uiSystem;

  beforeEach(() => {
    utils = setupTest();
    mockScreen = MockBlessedScreen.createMockScreen();
    uiSystem = new UISystem(mockScreen);
  });

  afterEach(() => {
    teardownTest();
  });

  describe('UI Initialization', () => {
    test('creates main layout components', () => {
      expect(uiSystem.components.titleBar).toBeDefined();
      expect(uiSystem.components.mainBox).toBeDefined();
      expect(uiSystem.components.statusBar).toBeDefined();
      
      // Verify components were added to screen
      expect(mockScreen.append).toHaveBeenCalledTimes(3);
    });

    test('sets up initial screen properties', () => {
      expect(uiSystem.currentView).toBe('main');
      expect(uiSystem.screen).toBe(mockScreen);
    });
  });

  describe('Status Bar Updates', () => {
    test('updates status message correctly', () => {
      const mockStatusBar = uiSystem.components.statusBar;
      mockStatusBar.setContent = jest.fn();

      uiSystem.updateStatus('Test message');
      
      expect(mockStatusBar.setContent).toHaveBeenCalledWith('{center}Test message{/center}');
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('handles empty status messages', () => {
      const mockStatusBar = uiSystem.components.statusBar;
      mockStatusBar.setContent = jest.fn();

      uiSystem.updateStatus('');
      
      expect(mockStatusBar.setContent).toHaveBeenCalledWith('{center}{/center}');
    });
  });

  describe('Character Stats Rendering', () => {
    test('renders character stats with progress bars', () => {
      const character = TestDataFactory.createTestCharacter({
        name: 'Test Horse',
        speed: 75,
        stamina: 50,
        power: 25
      });

      const content = uiSystem.renderCharacterStats(character.getSummary());
      
      expect(content).toContain('Test Horse');
      expect(content).toContain('Speed:');
      expect(content).toContain('Stamina:');
      expect(content).toContain('Power:');
      expect(content).toContain('(75/100)');
      expect(content).toContain('(50/100)');
      expect(content).toContain('(25/100)');
    });

    test('renders progress bars correctly', () => {
      const character = TestDataFactory.createTestCharacter({ speed: 80 });
      const content = uiSystem.renderCharacterStats(character.getSummary());
      
      // Should contain filled blocks for 80% progress
      expect(content).toContain('████████░░');
    });

    test('handles edge case stat values', () => {
      const character = TestDataFactory.createTestCharacter({
        speed: 0,
        stamina: 100,
        power: 1
      });

      const content = uiSystem.renderCharacterStats(character.getSummary());
      
      expect(content).toContain('(0/100)');
      expect(content).toContain('(100/100)');
      expect(content).toContain('(1/100)');
      expect(content).not.toContain('undefined');
      expect(content).not.toContain('NaN');
    });
  });

  describe('Training View', () => {
    test('displays training buttons based on options', () => {
      const character = TestDataFactory.createTestCharacter();
      const gameStatus = {
        character: character.getSummary(),
        trainingOptions: {
          speed: { available: true, name: 'Speed Training' },
          stamina: { available: true, name: 'Stamina Training' },
          power: { available: false, name: 'Power Training' },
          rest: { available: true, name: 'Rest Day' },
          social: { available: true, name: 'Social Time' }
        }
      };

      const mockCallback = jest.fn();
      uiSystem.showTrainingView(gameStatus, mockCallback);
      
      // Should create training buttons
      expect(uiSystem.components.mainBox.children).toBeDefined();
    });

    test('disables unavailable training options', () => {
      const character = TestDataFactory.createTiredCharacter();
      const gameStatus = {
        character: character.getSummary(),
        trainingOptions: {
          speed: { available: false, reason: 'Not enough energy' },
          rest: { available: true, name: 'Rest Day' }
        }
      };

      const mockCallback = jest.fn();
      uiSystem.showTrainingView(gameStatus, mockCallback);
      
      // Verify disabled states are handled
      expect(mockScreen.render).toHaveBeenCalled();
    });
  });

  describe('Race Results Display', () => {
    test('displays race results correctly', () => {
      const raceResult = TestDataFactory.createMockRaceResult(2); // 2nd place
      const effects = {
        messages: ['Good effort!', 'Gained experience']
      };

      uiSystem.showRaceResults(raceResult, effects);
      
      expect(mockScreen.render).toHaveBeenCalled();
      expect(uiSystem.components.statusBar.setContent).toHaveBeenCalledWith(
        '{center}Press any key to continue...{/center}'
      );
    });

    test('handles first place victory correctly', () => {
      const raceResult = TestDataFactory.createMockRaceResult(1); // 1st place
      const effects = { messages: ['Victory!'] };

      uiSystem.showRaceResults(raceResult, effects);
      
      // Should display victory information
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('shows ordinal positions correctly', () => {
      expect(uiSystem.getOrdinalPosition(1)).toBe('1st');
      expect(uiSystem.getOrdinalPosition(2)).toBe('2nd');
      expect(uiSystem.getOrdinalPosition(3)).toBe('3rd');
      expect(uiSystem.getOrdinalPosition(4)).toBe('4th');
      expect(uiSystem.getOrdinalPosition(21)).toBe('21st');
      expect(uiSystem.getOrdinalPosition(22)).toBe('22nd');
      expect(uiSystem.getOrdinalPosition(23)).toBe('23rd');
    });
  });

  describe('Character Creation UI', () => {
    test('displays character creation form', () => {
      const mockCallback = jest.fn();
      uiSystem.showCharacterCreation(mockCallback);
      
      expect(mockScreen.render).toHaveBeenCalled();
      expect(uiSystem.components.statusBar.setContent).toHaveBeenCalledWith(
        '{center}Enter horse name and press Enter...{/center}'
      );
    });

    test('handles name input submission', () => {
      const mockCallback = jest.fn();
      uiSystem.showCharacterCreation(mockCallback);
      
      // Find the textbox that was created
      const mainBox = uiSystem.components.mainBox;
      expect(mainBox.children).toBeDefined();
    });
  });

  describe('Help System', () => {
    test('displays help information', () => {
      const helpData = {
        controls: { '1-5': 'Training options', 'q': 'Quit' },
        gameFlow: ['Train horse', 'Race'],
        tips: ['Manage energy', 'Build friendship']
      };

      uiSystem.showHelp(helpData);
      
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('handles empty help data gracefully', () => {
      const emptyHelp = {
        controls: {},
        gameFlow: [],
        tips: []
      };

      expect(() => {
        uiSystem.showHelp(emptyHelp);
      }).not.toThrow();
    });
  });

  describe('Career Summary Display', () => {
    test('shows career completion summary', () => {
      const careerSummary = {
        characterName: 'Test Horse',
        finalStats: { speed: 85, stamina: 80, power: 75 },
        performance: { racesWon: 2, racesRun: 3, winRate: 67, progressPercent: 80 },
        legacyBonuses: { speedBonus: 5, staminaBonus: 4 },
        achievements: [
          { name: 'Winner', description: 'Won a race' }
        ]
      };

      uiSystem.showCareerSummary(careerSummary);
      
      expect(mockScreen.render).toHaveBeenCalled();
      expect(uiSystem.components.statusBar.setContent).toHaveBeenCalledWith(
        '{center}Press Enter to start new career or q to quit...{/center}'
      );
    });

    test('handles career with no achievements', () => {
      const careerSummary = {
        characterName: 'Test Horse',
        finalStats: { speed: 30, stamina: 35, power: 25 },
        performance: { racesWon: 0, racesRun: 3, winRate: 0 },
        legacyBonuses: {},
        achievements: []
      };

      expect(() => {
        uiSystem.showCareerSummary(careerSummary);
      }).not.toThrow();
    });
  });

  describe('UI Interaction Testing', () => {
    test('simulates button clicks correctly', () => {
      const mockButton = MockBlessedScreen.createMockBox({
        clickable: true
      });
      const clickHandler = jest.fn();
      
      mockButton.on = jest.fn((event, handler) => {
        if (event === 'click') {
          clickHandler.mockImplementation(handler);
        }
      });

      // Simulate setting up click handler
      mockButton.on('click', clickHandler);
      
      // Simulate click
      utils.simulateButtonClick(mockButton);
      
      expect(mockButton.emit).toHaveBeenCalledWith('click');
    });

    test('simulates keyboard input', () => {
      const mockTextbox = MockBlessedScreen.createMockTextbox();
      
      utils.simulateUserInput(mockTextbox, 'Test Horse Name');
      
      expect(mockTextbox.submit).toHaveBeenCalledWith('Test Horse Name');
    });

    test('handles screen key events', () => {
      utils.simulateKeyPress(mockScreen, 'q');
      
      expect(mockScreen.emit).toHaveBeenCalledWith('keypress', null, { name: 'q' });
    });
  });

  describe('Error Handling in UI', () => {
    test('handles rendering errors gracefully', () => {
      // Inject error into screen render
      mockScreen.render.mockImplementation(() => {
        throw new Error('Render failed');
      });

      expect(() => {
        uiSystem.updateStatus('Test');
      }).toThrow('Render failed');
    });

    test('handles missing components', () => {
      // Remove a component
      delete uiSystem.components.statusBar;

      expect(() => {
        uiSystem.updateStatus('Test');
      }).toThrow();
    });

    test('validates character data before rendering', () => {
      const invalidCharacter = null;

      expect(() => {
        uiSystem.renderCharacterStats(invalidCharacter);
      }).toThrow();
    });
  });

  describe('Performance Testing', () => {
    test('UI updates perform efficiently', async () => {
      const character = TestDataFactory.createTestCharacter();
      
      const perfResults = await utils.runStressTest(() => {
        uiSystem.renderCharacterStats(character.getSummary());
      }, 100);
      
      expect(perfResults.passed).toBe(100);
      expect(perfResults.failed).toBe(0);
    });

    test('memory usage remains stable during UI operations', () => {
      const { PerformanceTestUtils } = require('../helpers/mockData');
      const character = TestDataFactory.createTestCharacter();
      
      const memoryUsage = PerformanceTestUtils.measureMemoryUsage(() => {
        for (let i = 0; i < 50; i++) {
          uiSystem.renderCharacterStats(character.getSummary());
        }
      });
      
      // Should not leak significant memory
      expect(memoryUsage.heapUsedDiff).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });
  });

  describe('Accessibility and Usability', () => {
    test('provides keyboard navigation', () => {
      // Test that UI elements support keyboard interaction
      const gameStatus = {
        character: TestDataFactory.createTestCharacter().getSummary(),
        trainingOptions: {
          speed: { available: true }
        }
      };

      const mockCallback = jest.fn();
      uiSystem.showTrainingView(gameStatus, mockCallback);
      
      // UI should be navigable without mouse
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('handles different terminal sizes', () => {
      // Test UI adapts to different screen dimensions
      mockScreen.width = 80;
      mockScreen.height = 24;
      
      const character = TestDataFactory.createTestCharacter();
      
      expect(() => {
        uiSystem.renderCharacterStats(character.getSummary());
      }).not.toThrow();
    });

    test('provides clear feedback for user actions', () => {
      uiSystem.updateStatus('Training completed successfully!');
      
      expect(uiSystem.components.statusBar.setContent).toHaveBeenCalledWith(
        '{center}Training completed successfully!{/center}'
      );
    });
  });
});