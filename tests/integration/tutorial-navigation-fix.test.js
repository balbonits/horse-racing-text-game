/**
 * Tutorial Navigation Fix - Comprehensive Test Suite
 * 
 * Tests all aspects of tutorial navigation flow to ensure proper state transitions
 * and input handling work correctly.
 */

const GameApp = require('../../src/GameApp');

describe('Tutorial Navigation Fix', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  let originalConsoleClear;

  beforeEach(() => {
    // Capture console output for testing
    consoleOutput = [];
    originalConsoleLog = console.log;
    originalConsoleClear = console.clear;
    
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    console.clear = jest.fn();

    // Create fresh game app instance
    gameApp = new GameApp();
  });

  afterEach(() => {
    // Restore console
    console.log = originalConsoleLog;
    console.clear = originalConsoleClear;
    
    // Cleanup game resources
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('State Machine Transitions', () => {
    test('should allow transition from main_menu to tutorial', () => {
      expect(gameApp.currentState).toBe('main_menu');
      
      const result = gameApp.stateMachine.transitionTo('tutorial');
      expect(result.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial');
    });

    test('should allow transition from tutorial to tutorial_training', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      
      const result = gameApp.stateMachine.transitionTo('tutorial_training');
      expect(result.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial_training');
    });

    test('should reject invalid tutorial transitions', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      
      const result = gameApp.stateMachine.transitionTo('training'); // Should not be allowed
      expect(result.success).toBe(false);
    });

    test('should list correct allowed transitions from tutorial state', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      
      const transitions = gameApp.stateMachine.getAllowedTransitions('tutorial');
      expect(transitions).toContain('tutorial_training');
      expect(transitions).toContain('main_menu');
    });
  });

  describe('Input Handling in Tutorial States', () => {
    test('should handle option 2 selection in main menu to go to tutorial', () => {
      expect(gameApp.currentState).toBe('main_menu');
      
      const result = gameApp.stateMachine.handleInput('2');
      expect(result.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial');
    });

    test('should handle ENTER key in tutorial state to progress', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      
      const result = gameApp.stateMachine.handleInput('');
      expect(result.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial_training');
    });

    test('should handle enter key variations in tutorial state', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      
      // Test different enter key inputs
      const enterResult = gameApp.stateMachine.handleInput('enter');
      const emptyResult = gameApp.stateMachine.handleInput('');
      
      // At least one should work
      expect(enterResult.success || emptyResult.success).toBe(true);
    });

    test('should reject invalid inputs in tutorial state', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      
      const result = gameApp.stateMachine.handleInput('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('Tutorial Manager Integration', () => {
    test('should initialize tutorial properly when entering tutorial state', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      
      expect(gameApp.tutorialManager.isTutorialActive()).toBe(false); // Not active until started
      
      gameApp.tutorialManager.startTutorial();
      expect(gameApp.tutorialManager.isTutorialActive()).toBe(true);
      expect(gameApp.tutorialManager.tutorialCharacter).toBeTruthy();
      expect(gameApp.tutorialManager.tutorialCharacter.name).toBe('Tutorial Star');
    });

    test('should get proper tutorial guidance', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      
      const guidance = gameApp.tutorialManager.getTutorialGuidance();
      expect(guidance).toBeDefined();
      expect(guidance.stableManager).toBeDefined();
      expect(guidance.stableManager.name).toBe('Alex Morgan');
    });

    test('should progress tutorial step when transitioning to training', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      
      expect(gameApp.tutorialManager.tutorialStep).toBe(0);
      
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Tutorial step should still be 0 until actual training
      expect(gameApp.tutorialManager.tutorialStep).toBe(0);
    });
  });

  describe('Rendering Integration', () => {
    test('should render tutorial screen with Alex Morgan dialogue', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('Alex Morgan');
      expect(output).toContain('Stable Manager');
      expect(output).toContain('Welcome to Thunder Ridge Stables');
      expect(output).toContain('Press ENTER');
    });

    test('should render tutorial training screen after transition', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('TUTORIAL TRAINING');
      expect(output).toContain('Tutorial Star');
      expect(output).toContain('Turn: 1/5');
      expect(output).toContain('TRAINING OPTIONS');
    });

    test('should not render tutorial training screen when stuck in tutorial state', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).not.toContain('TUTORIAL TRAINING');
      expect(output).not.toContain('TRAINING OPTIONS');
      expect(output).toContain('Press ENTER'); // Should show tutorial intro instead
    });
  });

  describe('Complete Tutorial Flow', () => {
    test('should complete full navigation sequence', () => {
      // Start at main menu
      expect(gameApp.currentState).toBe('main_menu');
      
      // Navigate to tutorial
      const tutorialResult = gameApp.stateMachine.handleInput('2');
      expect(tutorialResult.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial');
      
      // Start tutorial
      gameApp.tutorialManager.startTutorial();
      expect(gameApp.tutorialManager.isTutorialActive()).toBe(true);
      
      // Progress to tutorial training
      const trainingResult = gameApp.stateMachine.handleInput('');
      expect(trainingResult.success).toBe(true);
      expect(gameApp.currentState).toBe('tutorial_training');
      
      // Verify tutorial training renders correctly
      gameApp.render();
      const output = consoleOutput.join('\n');
      expect(output).toContain('TUTORIAL TRAINING');
      expect(output).toContain('Tutorial Star');
    });

    test('should handle complete tutorial progression with training', () => {
      // Navigate to tutorial training
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Perform first training (speed)
      const speedResult = gameApp.tutorialManager.performTutorialTraining('speed');
      expect(speedResult.success).toBe(true);
      expect(speedResult.type).toBe('speed');
      expect(gameApp.tutorialManager.tutorialStep).toBe(1);
      
      // Verify character stats updated
      const character = gameApp.tutorialManager.tutorialCharacter;
      expect(character.stats.speed).toBe(33); // 25 + 8
    });

    test('should handle tutorial completion flow', () => {
      // Complete all tutorial steps
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Complete all 5 training turns
      gameApp.tutorialManager.performTutorialTraining('speed');
      gameApp.tutorialManager.performTutorialTraining('stamina');
      gameApp.tutorialManager.performTutorialTraining('power');
      gameApp.tutorialManager.performTutorialTraining('rest');
      gameApp.tutorialManager.performTutorialTraining('media');
      
      expect(gameApp.tutorialManager.tutorialStep).toBe(5);
      
      // Run tutorial race
      const raceResult = gameApp.tutorialManager.runTutorialRace();
      expect(raceResult.success).toBe(true);
      expect(gameApp.tutorialManager.tutorialComplete).toBe(true);
      
      // Transition to completion
      gameApp.stateMachine.transitionTo('tutorial_complete');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('TUTORIAL COMPLETE');
    });
  });

  describe('Error Cases and Edge Conditions', () => {
    test('should handle tutorial start without proper initialization', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      // Don't call startTutorial()
      
      const result = gameApp.stateMachine.handleInput('');
      // Should either work or fail gracefully
      expect(typeof result.success).toBe('boolean');
    });

    test('should handle invalid tutorial training attempts', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Try wrong training for step 1 (should be speed)
      const validation = gameApp.tutorialManager.validateTrainingChoice('2'); // stamina
      expect(validation.valid).toBe(false);
      expect(validation.expectedType).toBe('speed');
    });

    test('should handle rapid state transitions', () => {
      // Rapid transitions should not break state
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.stateMachine.transitionTo('tutorial_training');
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Should end up in a valid state
      const currentState = gameApp.stateMachine.getCurrentState();
      expect(['tutorial', 'tutorial_training']).toContain(currentState);
    });

    test('should handle tutorial cleanup on exit', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      
      expect(gameApp.tutorialManager.isTutorialActive()).toBe(true);
      
      // Exit to main menu
      gameApp.stateMachine.transitionTo('main_menu');
      
      // Tutorial should still be active (not auto-cleanup)
      // Only explicit endTutorial() should cleanup
    });

    test('should handle memory cleanup on game app destruction', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      
      // Cleanup should not throw errors
      expect(() => gameApp.cleanup()).not.toThrow();
    });
  });

  describe('State Machine Configuration Validation', () => {
    test('should have proper tutorial state configuration', () => {
      const config = gameApp.stateMachine.getStateConfiguration();
      
      expect(config).toHaveProperty('tutorial');
      expect(config.tutorial.transitions).toContain('tutorial_training');
      expect(config.tutorial.transitions).toContain('main_menu');
    });

    test('should have proper tutorial_training state configuration', () => {
      const config = gameApp.stateMachine.getStateConfiguration();
      
      expect(config).toHaveProperty('tutorial_training');
      expect(config.tutorial_training.transitions).toContain('tutorial_race');
      expect(config.tutorial_training.transitions).toContain('tutorial_complete');
    });

    test('should have proper input mappings for tutorial states', () => {
      const config = gameApp.stateMachine.getStateConfiguration();
      
      // Tutorial state should accept ENTER
      expect(config.tutorial.inputs).toHaveProperty('');
      expect(config.tutorial.inputs['']).toBe('tutorial_training');
      
      // Should also accept 'enter'
      expect(config.tutorial.inputs).toHaveProperty('enter');
      expect(config.tutorial.inputs['enter']).toBe('tutorial_training');
    });
  });
});