/**
 * UI Snapshot Tests
 * 
 * These tests capture the UI output as snapshots for:
 * 1. Regression testing - ensure UI doesn't change unexpectedly
 * 2. Portfolio showcase - visual examples of the game interface
 * 3. Documentation - reference for UI layouts
 */

const GameApp = require('../../src/GameApp');
const { TestDataFactory } = require('../helpers/mockData');

// Mock screen that captures all console output
function createSnapshotScreen() {
  const output = [];
  
  return {
    output: output,
    log: jest.fn().mockImplementation((...args) => {
      output.push(args.join(' '));
    }),
    append: jest.fn(),
    render: jest.fn(),
    destroy: jest.fn(),
    key: jest.fn()
  };
}

describe('UI Snapshots for Portfolio Showcase', () => {
  let app;
  let mockScreen;

  beforeEach(() => {
    mockScreen = createSnapshotScreen();
    app = new GameApp(mockScreen);
    
    // Silence console output during testing
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Main Menu Snapshots', () => {
    test('should display main menu interface', () => {
      app.renderMainMenu();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('main-menu-interface');
    });
  });

  describe('Character Creation Snapshots', () => {
    test('should display character creation form', () => {
      app.renderCharacterCreation();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('character-creation-form');
    });
  });

  describe('Training Interface Snapshots', () => {
    test('should display training interface with new horse', () => {
      // Create a fresh character 
      app.createCharacter('Snapshot Horse');
      app.renderTraining();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('training-interface-new-horse');
    });

    test('should display training interface with developed horse', () => {
      // Create character with higher stats and bond
      const character = TestDataFactory.createTestCharacter('Elite Horse', {
        speed: 65,
        stamina: 70, 
        power: 60,
        bond: 85,
        energy: 75,
        form: 'Good Form',
        turn: 8,
        racesWon: 2,
        racesRun: 3,
        totalTraining: 15
      });
      
      app.game.character = character;
      app.renderTraining();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('training-interface-elite-horse');
    });

    test('should display training interface with energy warning', () => {
      const character = TestDataFactory.createTestCharacter('Tired Horse', {
        energy: 12, // Low energy to trigger warning
        form: 'Off Form'
      });
      
      app.game.character = character;
      app.setWarning('Not enough energy for Power Training! You need 15 energy but only have 12.', 'energy');
      app.renderTraining();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('training-interface-energy-warning');
    });

    test('should display different form states', () => {
      const forms = ['Peak Form', 'Good Form', 'Steady', 'Average', 'Off Form', 'Poor Form'];
      const snapshots = {};
      
      forms.forEach(form => {
        mockScreen.output.length = 0; // Clear previous output
        
        const character = TestDataFactory.createTestCharacter(`${form} Horse`, {
          form: form,
          energy: form === 'Peak Form' ? 95 : form === 'Poor Form' ? 20 : 60
        });
        
        app.game.character = character;
        app.renderTraining();
        
        snapshots[form] = mockScreen.output.join('\n');
      });
      
      expect(snapshots).toMatchSnapshot('training-interface-form-states');
    });
  });

  describe('Race System Snapshots', () => {
    test('should display race preview interface', () => {
      const character = TestDataFactory.createTestCharacter('Racing Horse', {
        speed: 50,
        stamina: 45,
        power: 48,
        turn: 4 // Race turn
      });
      
      app.game.character = character;
      
      // Mock upcoming race
      app.upcomingRace = {
        name: 'Maiden Stakes',
        distance: 1600,
        surface: 'DIRT',
        type: 'MILE',
        turn: 4,
        prize: 5000
      };
      
      app.renderRacePreview();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('race-preview-interface');
    });
  });

  describe('Career Completion Snapshots', () => {
    test('should display career completion with S grade', () => {
      const character = TestDataFactory.createTestCharacter('Champion Horse', {
        speed: 95,
        stamina: 90,
        power: 88,
        bond: 100,
        turn: 25, // Career ended
        racesWon: 4,
        racesRun: 4,
        totalTraining: 20
      });
      
      app.game.character = character;
      
      // Mock completion data
      const completionData = {
        stats: {
          speed: 95,
          stamina: 90, 
          power: 88,
          bond: 100,
          racesWon: 4,
          racesRun: 4,
          totalTraining: 20
        },
        grade: 'S',
        achievements: [
          '🏆 Perfect Record - Won every race',
          '👑 Champion - Win 3+ races in career', 
          '⭐ Elite Athlete - Reach 90+ in any stat',
          '❤️ Perfect Bond - Maximum bond',
          '🎯 Training Fanatic - Complete 20+ training sessions'
        ]
      };
      
      app.renderCareerComplete();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('career-completion-s-grade');
    });

    test('should display career completion with average performance', () => {
      const character = TestDataFactory.createTestCharacter('Average Horse', {
        speed: 55,
        stamina: 48,
        power: 52,
        bond: 45,
        turn: 25,
        racesWon: 1,
        racesRun: 4,
        totalTraining: 12
      });
      
      app.game.character = character;
      
      const completionData = {
        stats: {
          speed: 55,
          stamina: 48,
          power: 52, 
          bond: 45,
          racesWon: 1,
          racesRun: 4,
          totalTraining: 12
        },
        grade: 'C',
        achievements: []
      };
      
      app.renderCareerComplete();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('career-completion-average');
    });
  });

  describe('Progress Bar Variations', () => {
    test('should display different stat progress bar levels', () => {
      const statLevels = [0, 25, 50, 75, 90, 100];
      const snapshots = {};
      
      statLevels.forEach(level => {
        mockScreen.output.length = 0;
        
        const character = TestDataFactory.createTestCharacter(`${level}% Horse`, {
          speed: level,
          stamina: level,
          power: level,
          energy: level,
          bond: level
        });
        
        app.game.character = character;
        app.renderTraining();
        
        snapshots[`${level}%`] = mockScreen.output.join('\n');
      });
      
      expect(snapshots).toMatchSnapshot('progress-bar-variations');
    });
  });

  describe('Media Day vs Rest Day Comparison', () => {
    test('should show training options with media day highlighted', () => {
      const character = TestDataFactory.createTestCharacter('Demo Horse', {
        energy: 45,
        bond: 65,
        form: 'Steady'
      });
      
      app.game.character = character;
      app.renderTraining();
      
      const output = mockScreen.output.join('\n');
      expect(output).toMatchSnapshot('media-day-training-options');
    });
  });

  describe('Game Flow Progression', () => {
    test('should show complete turn progression', () => {
      const turns = [1, 2, 3, 4]; // Show progression to first race
      const snapshots = {};
      
      turns.forEach(turn => {
        mockScreen.output.length = 0;
        
        const character = TestDataFactory.createTestCharacter(`Turn ${turn} Horse`, {
          speed: 20 + (turn * 5),
          stamina: 20 + (turn * 4), 
          power: 20 + (turn * 6),
          energy: 85 - (turn * 10),
          bond: turn * 15,
          turn: turn,
          totalTraining: turn - 1
        });
        
        app.game.character = character;
        app.renderTraining();
        
        snapshots[`Turn ${turn}`] = mockScreen.output.join('\n');
      });
      
      expect(snapshots).toMatchSnapshot('turn-progression');
    });
  });
});