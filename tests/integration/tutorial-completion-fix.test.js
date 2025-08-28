/**
 * Tutorial Completion Fix Tests
 * 
 * Tests to verify the tutorial can be completed without timeline errors.
 * The issue: TurnController tries to access null timeline after training.
 */

const GameApp = require('../../src/GameApp');

describe('Tutorial Completion Fix', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  let originalConsoleError;
  
  beforeEach(() => {
    // Mock console to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    console.error = (...args) => {
      consoleOutput.push('ERROR: ' + args.join(' '));
    };
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clean up
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Tutorial timeline null error fix', () => {
    test('should identify timeline null error in TurnController', () => {
      // Start tutorial training
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // Check current TurnController setup
      const turnController = gameApp.game.turnController;
      const character = gameApp.game.character;
      
      console.log('Tutorial setup check:');
      console.log('- TurnController exists:', !!turnController);
      console.log('- Character exists:', !!character);
      
      if (turnController) {
        console.log('- Timeline exists:', !!turnController.timeline);
        console.log('- TrainingEngine exists:', !!turnController.trainingEngine);
      }
      
      expect(turnController).toBeDefined();
      expect(character).toBeDefined();
      
      // The issue: timeline is null
      expect(turnController.timeline).toBeNull();
    });

    test('should reproduce timeline null error during training', () => {
      // Start tutorial training
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      // Clear output
      consoleOutput.length = 0;
      
      // Try speed training - this should cause timeline error
      let errorOccurred = false;
      
      try {
        gameApp.handleKeyInput('1'); // Speed training
      } catch (error) {
        errorOccurred = true;
        console.log('Caught error:', error.message);
        
        // This should be the timeline null error
        expect(error.message).toContain('getRaceForTurn');
      }
      
      // Check if error occurred
      const hasTimelineError = consoleOutput.some(line => 
        line.includes('getRaceForTurn') || 
        line.includes('null') ||
        line.includes('Cannot read properties')
      );
      
      if (hasTimelineError) {
        console.error('TIMELINE NULL ERROR REPRODUCED');
      }
      
      // Should reproduce the error for now
      expect(errorOccurred || hasTimelineError).toBe(true);
    });
  });

  describe('Tutorial training without timeline', () => {
    test('should verify tutorial training works without race checks', () => {
      // The fix should allow training without timeline race checks
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const character = gameApp.game.character;
      const initialStats = { ...character.stats };
      const initialEnergy = character.energy;
      const initialTurn = character.career.turn;
      
      console.log('Before training:', {
        stats: initialStats,
        energy: initialEnergy,
        turn: initialTurn
      });
      
      // Clear output
      consoleOutput.length = 0;
      
      // Training should work without timeline
      let trainingSuccessful = false;
      
      try {
        gameApp.handleKeyInput('1'); // Speed training
        trainingSuccessful = true;
      } catch (error) {
        console.error('Training failed:', error.message);
      }
      
      if (trainingSuccessful) {
        console.log('After training:', {
          stats: character.stats,
          energy: character.energy,
          turn: character.career.turn
        });
        
        // Verify training effects
        const statsChanged = character.stats.speed !== initialStats.speed;
        const energyChanged = character.energy !== initialEnergy;
        const turnAdvanced = character.career.turn !== initialTurn;
        
        console.log('Training effects:', { statsChanged, energyChanged, turnAdvanced });
        
        expect(statsChanged || energyChanged || turnAdvanced).toBe(true);
      }
      
      expect(trainingSuccessful).toBe(true);
    });

    test('should complete tutorial without race triggers', () => {
      // Tutorial should complete without timeline/race system
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const character = gameApp.game.character;
      let completionReached = false;
      
      // Do multiple training sessions to reach completion
      for (let i = 0; i < 5; i++) {
        try {
          // Alternate between speed and rest
          const input = i % 2 === 0 ? '1' : '4';
          gameApp.handleKeyInput(input);
          
          // Check if tutorial completed
          if (gameApp.currentState !== 'tutorial_training') {
            completionReached = true;
            break;
          }
        } catch (error) {
          console.error(`Training ${i + 1} failed:`, error.message);
          break;
        }
      }
      
      console.log('Tutorial completion status:', {
        currentState: gameApp.currentState,
        completionReached: completionReached,
        finalTurn: character.career.turn
      });
      
      // Tutorial should be able to complete
      expect(completionReached).toBe(true);
    });
  });

  describe('Mock timeline solution', () => {
    test('should verify mock timeline prevents errors', () => {
      // Test approach: create a mock timeline that returns no races
      const MockTimeline = {
        getRaceForTurn: () => null,
        getRaceDetails: () => null,
        getNextRaceInfo: () => null,
        getTotalRaces: () => 0,
        getRaceScheduleSummary: () => [],
        validateSchedule: () => ({ valid: true, issues: [] })
      };
      
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const turnController = gameApp.game.turnController;
      
      // Replace null timeline with mock
      turnController.timeline = MockTimeline;
      
      const character = gameApp.game.character;
      const initialStats = { ...character.stats };
      
      // Training should work with mock timeline
      let trainingSuccessful = false;
      
      try {
        gameApp.handleKeyInput('1'); // Speed training
        trainingSuccessful = true;
      } catch (error) {
        console.error('Training with mock timeline failed:', error.message);
      }
      
      if (trainingSuccessful) {
        const statsChanged = character.stats.speed !== initialStats.speed;
        console.log('Mock timeline training successful, stats changed:', statsChanged);
      }
      
      expect(trainingSuccessful).toBe(true);
    });
  });
});