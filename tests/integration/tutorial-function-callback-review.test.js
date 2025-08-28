/**
 * Tutorial Function Callback Review Test
 * 
 * Comprehensive review of function calls and callbacks in tutorial flow
 * to ensure all connections are correct and functioning properly.
 */

const GameApp = require('../../src/GameApp');

describe('Tutorial Function Callback Review', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  
  beforeEach(() => {
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
    
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Input handling chain verification', () => {
    test('should trace complete input handling from GameApp to TurnController', () => {
      // Start tutorial
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      expect(gameApp.currentState).toBe('tutorial_training');
      
      const character = gameApp.game.character;
      const turnController = gameApp.game.turnController;
      const tutorialManager = gameApp.tutorialManager;
      
      // Verify the chain is properly connected
      console.log('🔗 Function Call Chain Verification:');
      console.log('1. GameApp.handleKeyInput exists:', typeof gameApp.handleKeyInput === 'function');
      console.log('2. StateMachine.processGameInput exists:', typeof gameApp.stateMachine.processGameInput === 'function');
      console.log('3. GameStateMachine.handleCustomAction exists:', typeof gameApp.stateMachine.handleCustomAction === 'function');
      console.log('4. GameApp.performTrainingSync exists:', typeof gameApp.performTrainingSync === 'function');
      console.log('5. TurnController exists:', !!turnController);
      console.log('6. TurnController.processTurn exists:', turnController ? typeof turnController.processTurn === 'function' : 'N/A');
      console.log('7. TutorialManager exists:', !!tutorialManager);
      console.log('8. Character exists:', !!character);
      
      expect(typeof gameApp.handleKeyInput).toBe('function');
      expect(typeof gameApp.stateMachine.processGameInput).toBe('function');
      expect(turnController).toBeDefined();
      expect(typeof turnController.processTurn).toBe('function');
      expect(character).toBeDefined();
    });

    test('should verify state machine input routing for tutorial training', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const currentState = gameApp.currentState;
      const allowedTransitions = gameApp.stateMachine.getAllowedTransitions(currentState);
      const inputMappings = gameApp.stateMachine.getInputMappings(currentState);
      
      console.log('📍 State Machine Routing:');
      console.log('Current state:', currentState);
      console.log('Allowed transitions:', allowedTransitions);
      console.log('Input mappings:', inputMappings);
      
      // Verify key mappings are correct
      expect(inputMappings['1']).toBe('speed_training');
      expect(inputMappings['2']).toBe('stamina_training');
      expect(inputMappings['3']).toBe('power_training');
      expect(inputMappings['4']).toBe('rest_training');
      expect(inputMappings['5']).toBe('media_training');
    });

    test('should verify performTrainingSync callback chain', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const character = gameApp.game.character;
      const initialStats = { ...character.stats };
      
      // Clear output to focus on training
      consoleOutput.length = 0;
      
      // Test the training callback chain
      const result = gameApp.performTrainingSync('speed');
      
      console.log('🏋️ Training Callback Chain:');
      console.log('performTrainingSync result:', result);
      console.log('Character stats changed:', JSON.stringify(character.stats) !== JSON.stringify(initialStats));
      console.log('Initial stats:', initialStats);
      console.log('Final stats:', character.stats);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      
      // Stats should have changed
      const statsChanged = JSON.stringify(character.stats) !== JSON.stringify(initialStats);
      expect(statsChanged).toBe(true);
    });
  });

  describe('TurnController integration verification', () => {
    test('should verify TurnController.processTurn is called correctly', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const turnController = gameApp.game.turnController;
      const character = gameApp.game.character;
      
      // Mock processTurn to verify it's called
      let processTurnCalled = false;
      let processTurnArgs = null;
      const originalProcessTurn = turnController.processTurn;
      
      turnController.processTurn = function(trainingType) {
        processTurnCalled = true;
        processTurnArgs = trainingType;
        return originalProcessTurn.call(this, trainingType);
      };
      
      // Perform training
      gameApp.handleKeyInput('1'); // Speed training
      
      console.log('🎯 TurnController Integration:');
      console.log('processTurn called:', processTurnCalled);
      console.log('processTurn args:', processTurnArgs);
      
      expect(processTurnCalled).toBe(true);
      expect(processTurnArgs).toBe('speed');
      
      // Restore original method
      turnController.processTurn = originalProcessTurn;
    });

    test('should verify timeline mock prevents null errors', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const turnController = gameApp.game.turnController;
      const timeline = turnController.timeline;
      
      console.log('📅 Timeline Mock Verification:');
      console.log('Timeline exists:', !!timeline);
      console.log('Timeline methods:');
      console.log('- getRaceForTurn:', typeof timeline.getRaceForTurn);
      console.log('- getRaceDetails:', typeof timeline.getRaceDetails);
      console.log('- getNextRaceInfo:', typeof timeline.getNextRaceInfo);
      console.log('- getTotalRaces:', typeof timeline.getTotalRaces);
      
      // Test timeline methods return expected values
      expect(timeline.getRaceForTurn(1)).toBeNull();
      expect(timeline.getRaceDetails(1)).toBeNull();
      expect(timeline.getNextRaceInfo(1)).toBeNull();
      expect(timeline.getTotalRaces()).toBe(0);
      expect(timeline.getRaceScheduleSummary()).toEqual([]);
      expect(timeline.validateSchedule().valid).toBe(true);
    });
  });

  describe('Tutorial completion flow', () => {
    test('should verify tutorial can progress through multiple training sessions', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      const character = gameApp.game.character;
      const tutorialManager = gameApp.tutorialManager;
      
      console.log('🎓 Tutorial Completion Flow:');
      console.log('Initial tutorial step:', tutorialManager.tutorialStep);
      console.log('Initial turn:', character.career.turn);
      
      let completionReached = false;
      let sessionCount = 0;
      
      // Perform training sessions until completion or max attempts
      while (sessionCount < 10 && !completionReached) {
        try {
          // Alternate training types
          const trainingChoice = (sessionCount % 4) + 1;
          console.log(`Session ${sessionCount + 1}: Input "${trainingChoice}"`);
          
          gameApp.handleKeyInput(trainingChoice.toString());
          sessionCount++;
          
          // Check if tutorial completed
          if (gameApp.currentState !== 'tutorial_training') {
            completionReached = true;
            console.log(`Tutorial completed at session ${sessionCount}`);
            console.log('Final state:', gameApp.currentState);
          } else {
            console.log(`After session ${sessionCount}:`);
            console.log('- Tutorial step:', tutorialManager.tutorialStep);
            console.log('- Character turn:', character.career.turn);
            console.log('- Character stats:', character.stats);
          }
        } catch (error) {
          console.error(`Session ${sessionCount + 1} failed:`, error.message);
          break;
        }
      }
      
      console.log('Final status:');
      console.log('- Sessions completed:', sessionCount);
      console.log('- Completion reached:', completionReached);
      console.log('- Final state:', gameApp.currentState);
      
      // Tutorial should complete successfully
      expect(completionReached).toBe(true);
      expect(sessionCount).toBeGreaterThan(0);
    });

    test('should verify all function calls complete without errors', () => {
      gameApp.setState('tutorial');
      gameApp.handleKeyInput(''); // Start tutorial training
      
      let errorCount = 0;
      let successCount = 0;
      const testInputs = ['1', '2', '3', '4', '5'];
      
      testInputs.forEach((input, index) => {
        try {
          console.log(`🧪 Testing input "${input}"...`);
          const result = gameApp.handleKeyInput(input);
          
          if (result && result.success !== false) {
            successCount++;
            console.log(`✅ Input "${input}" succeeded`);
          } else {
            errorCount++;
            console.log(`❌ Input "${input}" failed:`, result);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Input "${input}" threw error:`, error.message);
        }
      });
      
      console.log('📊 Function Call Summary:');
      console.log('Successful calls:', successCount);
      console.log('Failed calls:', errorCount);
      console.log('Total calls:', testInputs.length);
      
      // All function calls should complete without throwing errors
      expect(errorCount).toBe(0);
      expect(successCount).toBeGreaterThan(0);
    });
  });
});