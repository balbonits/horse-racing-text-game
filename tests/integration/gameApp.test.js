const GameApp = require('../../src/GameApp');
const { MockBlessedScreen } = require('../helpers/mockData');
const { testUtils, setupTest, teardownTest } = require('../helpers/testUtils');

describe('GameApp Integration', () => {
  let utils;
  let mockScreen;
  let gameApp;

  beforeEach(() => {
    utils = setupTest();
    mockScreen = MockBlessedScreen.createMockScreen();
    // GameApp doesn't exist yet - we'll create it
  });

  afterEach(() => {
    teardownTest();
    if (gameApp && gameApp.destroy) {
      gameApp.destroy();
    }
  });

  describe('Application Startup', () => {
    test('initializes with main menu state', () => {
      gameApp = new GameApp(mockScreen);
      
      expect(gameApp.currentState).toBe('main_menu');
      expect(gameApp.game).toBeDefined();
      expect(gameApp.ui).toBeDefined();
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('displays main menu options', () => {
      gameApp = new GameApp(mockScreen);
      
      const mainMenuOptions = gameApp.getMainMenuOptions();
      expect(mainMenuOptions).toContain('New Career');
      expect(mainMenuOptions).toContain('Load Game');
      expect(mainMenuOptions).toContain('Help');
      expect(mainMenuOptions).toContain('Quit');
    });
  });

  describe('Character Creation Flow', () => {
    test('transitions to character creation when New Career selected', () => {
      gameApp = new GameApp(mockScreen);
      
      gameApp.selectMainMenuOption('new_career');
      
      expect(gameApp.currentState).toBe('character_creation');
      expect(mockScreen.render).toHaveBeenCalled();
    });

    test('creates character and starts game when name submitted', () => {
      gameApp = new GameApp(mockScreen);
      gameApp.setState('character_creation');
      
      const result = gameApp.createCharacter('Test Horse');
      
      expect(result.success).toBe(true);
      expect(gameApp.currentState).toBe('training');
      expect(gameApp.game.character.name).toBe('Test Horse');
    });

    test('handles invalid character names gracefully', () => {
      gameApp = new GameApp(mockScreen);
      gameApp.setState('character_creation');
      
      const result = gameApp.createCharacter('');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('name');
      expect(gameApp.currentState).toBe('character_creation');
    });
  });

  describe('Training Interface', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
      gameApp.createCharacter('Test Horse');
    });

    test('displays training options based on character state', () => {
      const options = gameApp.getTrainingOptions();
      
      expect(options.speed).toBeDefined();
      expect(options.stamina).toBeDefined();
      expect(options.power).toBeDefined();
      expect(options.rest).toBeDefined();
      expect(options.social).toBeDefined();
    });

    test('performs training and updates character stats', () => {
      const initialStats = { ...gameApp.game.character.stats };
      
      const result = gameApp.performTraining('speed');
      
      expect(result.success).toBe(true);
      expect(gameApp.game.character.stats.speed).toBeGreaterThanOrEqual(initialStats.speed);
      expect(result.statGains).toBeDefined();
      expect(result.messages.length).toBeGreaterThan(0);
    });

    test('prevents training when insufficient energy', () => {
      // Drain energy
      gameApp.game.character.changeEnergy(-90);
      
      const result = gameApp.performTraining('speed');
      
      expect(result.success).toBe(false);
      expect(result.reason).toContain('energy');
    });

    test('updates UI after successful training', () => {
      const renderCallsBefore = mockScreen.render.mock.calls.length;
      
      gameApp.performTraining('speed');
      
      expect(mockScreen.render.mock.calls.length).toBeGreaterThan(renderCallsBefore);
    });
  });

  describe('Race System Integration', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
      gameApp.createCharacter('Test Horse');
      // Advance to a race turn
      gameApp.game.character.career.turn = 4;
    });

    test('detects when race is available', () => {
      const raceAvailable = gameApp.isRaceAvailable();
      expect(raceAvailable).toBe(true);
    });

    test('starts race and shows results', () => {
      const result = gameApp.startRace();
      
      expect(result.success).toBe(true);
      expect(result.raceResult).toBeDefined();
      expect(result.raceResult.playerResult).toBeDefined();
      expect(gameApp.currentState).toBe('race_results');
    });

    test('processes race effects on character', () => {
      const initialRacesRun = gameApp.game.character.career.racesRun;
      
      gameApp.startRace();
      
      expect(gameApp.game.character.career.racesRun).toBe(initialRacesRun + 1);
    });
  });

  describe('Save and Load System', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
      gameApp.createCharacter('Save Test Horse');
    });

    test('saves game state to file', async () => {
      const result = await gameApp.saveGame();
      
      expect(result.success).toBe(true);
      expect(result.saveFile).toBeDefined();
    });

    test('loads game state from file', async () => {
      // Save first
      const saveResult = await gameApp.saveGame();
      
      // Create new app and load
      const newGameApp = new GameApp(mockScreen);
      const loadResult = await newGameApp.loadGame(saveResult.saveFile);
      
      expect(loadResult.success).toBe(true);
      expect(newGameApp.game.character.name).toBe('Save Test Horse');
    });

    test('handles corrupted save files gracefully', async () => {
      const result = await gameApp.loadGame('nonexistent-file.json');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('load');
    });
  });

  describe('Game State Management', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
    });

    test('tracks game state transitions correctly', () => {
      expect(gameApp.currentState).toBe('main_menu');
      
      gameApp.setState('character_creation');
      expect(gameApp.currentState).toBe('character_creation');
      
      gameApp.createCharacter('Test Horse');
      expect(gameApp.currentState).toBe('training');
    });

    test('validates state transitions', () => {
      expect(() => {
        gameApp.setState('invalid_state');
      }).toThrow();
    });

    test('provides appropriate UI updates for each state', () => {
      const states = ['main_menu', 'character_creation', 'training', 'race_results'];
      
      gameApp.createCharacter('Test Horse'); // Setup for later states
      
      states.forEach(state => {
        gameApp.setState(state);
        expect(mockScreen.render).toHaveBeenCalled();
        mockScreen.render.mockClear();
      });
    });
  });

  describe('Keyboard Input Handling', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
      gameApp.createCharacter('Input Test Horse');
    });

    test('handles training selection keys (1-5)', () => {
      const initialStats = { ...gameApp.game.character.stats };
      
      gameApp.handleKeyInput('1'); // Speed training
      
      expect(gameApp.game.character.stats.speed).toBeGreaterThanOrEqual(initialStats.speed);
    });

    test('handles help key (h)', () => {
      gameApp.handleKeyInput('h');
      
      expect(gameApp.currentState).toBe('help');
    });

    test('handles save key (s)', () => {
      const saveGameSpy = utils.createSpy(gameApp, 'saveGame');
      
      gameApp.handleKeyInput('s');
      
      expect(saveGameSpy).toHaveBeenCalled();
    });

    test('handles quit key (q)', () => {
      const processExitSpy = utils.createStub(process, 'exit');
      
      gameApp.handleKeyInput('q');
      
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
    });

    test('handles game system errors gracefully', () => {
      // Force an error in the game system
      gameApp.game.performTraining = utils.createStub().throws(new Error('Training system error'));
      
      const result = gameApp.performTraining('speed');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
      expect(gameApp.currentState).toBe('main_menu'); // Should not crash
    });

    test('displays error messages to user', () => {
      gameApp.displayError('Test error message');
      
      expect(mockScreen.render).toHaveBeenCalled();
      // Should show error in UI somehow
    });

    test('recovers from UI render errors', () => {
      mockScreen.render.mockImplementation(() => {
        throw new Error('Render error');
      });
      
      expect(() => {
        gameApp.render();
      }).not.toThrow();
    });
  });

  describe('Career Completion', () => {
    beforeEach(() => {
      gameApp = new GameApp(mockScreen);
      gameApp.createCharacter('Career Test Horse');
      // Set to final turn
      gameApp.game.character.career.turn = 12;
    });

    test('detects career completion', () => {
      gameApp.performTraining('rest'); // Advance past final turn
      
      expect(gameApp.isCareerComplete()).toBe(true);
      expect(gameApp.currentState).toBe('career_complete');
    });

    test('generates career summary', () => {
      gameApp.performTraining('rest');
      const summary = gameApp.getCareerSummary();
      
      expect(summary.characterName).toBe('Career Test Horse');
      expect(summary.finalStats).toBeDefined();
      expect(summary.legacyBonuses).toBeDefined();
    });

    test('allows starting new career after completion', () => {
      gameApp.performTraining('rest'); // Complete career
      
      const result = gameApp.startNewCareer();
      
      expect(result.success).toBe(true);
      expect(gameApp.currentState).toBe('character_creation');
    });
  });
});