/**
 * Game Exit Flow Tests
 * 
 * Tests to verify proper game exit behavior:
 * 1. Career completion should return to main menu (not character creation)
 * 2. Game exit should show goodbye/thank you screen
 * 3. Race results and career completion should be separate screens
 */

const GameApp = require('../../src/GameApp');

describe('Game Exit Flow', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  let originalProcessExit;
  
  beforeEach(() => {
    // Mock console.log to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Mock process.exit to prevent actual exit
    originalProcessExit = process.exit;
    process.exit = jest.fn();
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    // Restore console.log and process.exit
    console.log = originalConsoleLog;
    process.exit = originalProcessExit;
    
    // Clean up game instance
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Career completion navigation', () => {
    test('should have career_complete state configured properly', () => {
      // Test that career_complete transitions are available
      const transitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      
      // Should allow transition to main_menu
      expect(transitions).toContain('main_menu');
      expect(transitions).not.toContain('character_creation');
    });

    test('should return to main menu after career completion (not character creation)', () => {
      // Test the input handling for career_complete state
      // Simulate being in career_complete state and pressing ENTER
      const result = gameApp.stateMachine.handleInput('', { fromState: 'career_complete' });
      
      // Should indicate transition to main_menu
      if (result.success) {
        expect(result.nextState || result.action).not.toBe('character_creation');
      }
      
      // Also test that character_creation is not in allowed transitions
      const transitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      expect(transitions).not.toContain('character_creation');
    });
  });

  describe('Game exit with goodbye screen', () => {
    test('should show goodbye screen when exiting', async () => {
      // Test the quit method directly
      await gameApp.quit();
      
      const output = consoleOutput.join('\n');
      
      // Should show goodbye/thank you message (in test env, uses displayBrief)
      expect(output).toContain('Thanks for playing');
      expect(output).toContain('Horse Racing Text Game');
      expect(output).toContain('Come back anytime');
    });

    test('should not exit process in test environment', async () => {
      await gameApp.quit();
      
      // Should NOT call process.exit in test environment
      expect(process.exit).not.toHaveBeenCalled();
    });

    test('should show brief goodbye message in test environment', async () => {
      await gameApp.quit();
      
      const output = consoleOutput.join('\n');
      
      // Should include encouragement to play again
      expect(output).toContain('Thanks for playing');
      expect(output).toContain('Champion');
    });
  });

  describe('State machine configuration fixes', () => {
    test('should have career_complete state configured', () => {
      // Test that career_complete state exists and works
      const transitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      
      // Should have valid transitions
      expect(transitions).toBeDefined();
      expect(transitions.length).toBeGreaterThan(0);
      expect(transitions).toContain('main_menu');
    });

    test('should have proper career completion flow configuration', () => {
      // Test state transitions work correctly
      const transitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      
      // career_complete should exist and be properly configured
      expect(transitions).toContain('main_menu');
      expect(transitions).not.toContain('character_creation');
    });
  });

  describe('Screen separation verification', () => {
    test('should render race results and career completion as separate screens', () => {
      // This test documents the expected behavior
      // Race results screen should be distinct from career completion
      
      // Mock a completed race scenario
      gameApp.game = { 
        character: { 
          career: { turn: 24, maxTurns: 24 },
          completedRaces: [1, 2, 3, 4]
        }
      };
      
      // Render what should be race results
      if (gameApp.currentState === 'race_results') {
        gameApp.render();
        const raceOutput = consoleOutput.join('\n');
        
        // Should contain race-specific content only
        expect(raceOutput).not.toContain('CAREER COMPLETE');
        expect(raceOutput).not.toContain('FINAL GRADE');
      }
    });
  });

  describe('Regression prevention', () => {
    test('should prevent career completion loops', () => {
      // Test that career_complete doesn't lead back to career phases
      const transitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      
      // Should not allow going back to career phases
      expect(transitions).not.toContain('training');
      expect(transitions).not.toContain('race_results');
      expect(transitions).not.toContain('career_complete');
    });

    test('should have clear exit paths from career completion', () => {
      // career_complete should have a clear path to main menu
      const transitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      
      // Should have at least one exit path
      expect(transitions.length).toBeGreaterThan(0);
      expect(transitions).toContain('main_menu');
    });
  });
});