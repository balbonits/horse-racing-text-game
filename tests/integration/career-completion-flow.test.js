/**
 * Career Completion Flow Tests
 * 
 * Tests to verify proper career completion flow:
 * 1. Race results and career completion should be separate screens
 * 2. Career completion should return to main menu (not character creation)
 */

const GameApp = require('../../src/GameApp');

describe('Career Completion Flow', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  
  beforeEach(() => {
    // Mock console.log to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Mock timers for controlled testing
    jest.useFakeTimers();
    
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    
    // Clean up game instance
    if (gameApp) {
      gameApp.cleanup();
    }
    
    jest.useRealTimers();
  });

  describe('Screen separation', () => {
    test('should identify race results screen vs career completion screen', () => {
      // This test documents the current problematic behavior
      gameApp.setState('race_results');
      gameApp.render();
      
      const raceResultsOutput = consoleOutput.join('\n');
      
      // Clear output for career completion
      consoleOutput.length = 0;
      gameApp.setState('career_complete');
      gameApp.render();
      
      const careerCompleteOutput = consoleOutput.join('\n');
      
      // Race results should NOT contain career completion content
      expect(raceResultsOutput).not.toContain('CAREER COMPLETE');
      expect(raceResultsOutput).not.toContain('FINAL GRADE');
      expect(raceResultsOutput).not.toContain('Thank you for playing');
      
      // Career completion should NOT contain race-specific content
      expect(careerCompleteOutput).not.toContain('RACE RESULTS');
      expect(careerCompleteOutput).not.toContain('Position');
      expect(careerCompleteOutput).not.toContain('Time');
    });

    test('should show race results screen first, then career completion', () => {
      // Simulate end of career flow
      gameApp.setState('race_results');
      gameApp.render();
      
      const raceOutput = consoleOutput.join('\n');
      expect(raceOutput).toContain('RACE RESULTS');
      
      // After viewing race results, should go to career completion
      consoleOutput.length = 0;
      gameApp.handleKeyInput(''); // ENTER to continue
      
      expect(gameApp.currentState).toBe('career_complete');
    });
  });

  describe('Navigation flow', () => {
    test('should return to main menu after career completion', () => {
      // Start in career completion state
      gameApp.setState('career_complete');
      expect(gameApp.currentState).toBe('career_complete');
      
      // Press ENTER to continue
      gameApp.handleKeyInput('');
      
      // Should return to main menu, NOT character creation
      expect(gameApp.currentState).toBe('main_menu');
      expect(gameApp.currentState).not.toBe('character_creation');
    });

    test('should display main menu options after career completion', () => {
      gameApp.setState('career_complete');
      gameApp.handleKeyInput(''); // ENTER to continue
      
      gameApp.render();
      const output = consoleOutput.join('\n');
      
      // Should show main menu options
      expect(output).toContain('1. New Career');
      expect(output).toContain('2. Tutorial');
      expect(output).toContain('3. Load Game');
      expect(output).toContain('4. Help');
    });
  });

  describe('Career completion screen content', () => {
    test('should show proper career completion elements', () => {
      gameApp.setState('career_complete');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      
      // Should contain career completion specific content
      expect(output).toContain('CAREER COMPLETE');
      expect(output).toContain('FINAL GRADE');
      expect(output).toContain('CAREER STATISTICS');
      expect(output).toContain('FINAL STATS');
      expect(output).toContain('ACHIEVEMENTS EARNED');
      expect(output).toContain('Thank you for playing');
      expect(output).toContain('Press ENTER to return to main menu');
    });

    test('should NOT contain race-specific information', () => {
      gameApp.setState('career_complete');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      
      // Should NOT contain race results content
      expect(output).not.toContain('RACE RESULTS');
      expect(output).not.toContain('Position:');
      expect(output).not.toContain('Time:');
      expect(output).not.toContain('Prize Money:');
    });
  });

  describe('State machine validation', () => {
    test('should have proper state transitions configured', () => {
      // race_results should transition to career_complete
      const raceResultsTransitions = gameApp.stateMachine.getAllowedTransitions('race_results');
      expect(raceResultsTransitions).toContain('career_complete');
      
      // career_complete should transition to main_menu  
      const careerCompleteTransitions = gameApp.stateMachine.getAllowedTransitions('career_complete');
      expect(careerCompleteTransitions).toContain('main_menu');
      expect(careerCompleteTransitions).not.toContain('character_creation');
    });

    test('should prevent invalid transitions', () => {
      gameApp.setState('career_complete');
      
      // Should not be able to go directly to character_creation
      const result = gameApp.stateMachine.handleInput('new_career');
      expect(result.success).toBe(false);
      expect(gameApp.currentState).toBe('career_complete');
    });
  });

  describe('User experience flow', () => {
    test('should provide clear progression through end-of-career', () => {
      // Simulate complete end-of-career flow
      gameApp.setState('race_results');
      gameApp.render();
      
      let output = consoleOutput.join('\n');
      expect(output).toContain('Press ENTER to continue');
      
      // Continue to career completion
      consoleOutput.length = 0;
      gameApp.handleKeyInput('');
      gameApp.render();
      
      output = consoleOutput.join('\n');
      expect(output).toContain('CAREER COMPLETE');
      expect(output).toContain('Press ENTER to return to main menu');
      
      // Return to main menu
      consoleOutput.length = 0;
      gameApp.handleKeyInput('');
      gameApp.render();
      
      output = consoleOutput.join('\n');
      expect(output).toContain('MAIN MENU');
    });
  });

  describe('Regression prevention', () => {
    test('should not mix race and career content on same screen', () => {
      // Test that we don't accidentally merge screens again
      gameApp.setState('race_results');
      gameApp.render();
      
      const raceOutput = consoleOutput.join('\n');
      
      // Should not have both types of content mixed
      const hasRaceContent = raceOutput.includes('RACE RESULTS');
      const hasCareerContent = raceOutput.includes('CAREER COMPLETE');
      
      expect(hasRaceContent && hasCareerContent).toBe(false);
    });

    test('should maintain proper navigation hierarchy', () => {
      // Ensure career completion always leads back to main menu
      gameApp.setState('career_complete');
      gameApp.handleKeyInput('');
      
      expect(gameApp.currentState).toBe('main_menu');
      
      // Should be able to start new career from main menu
      gameApp.handleKeyInput('1');
      expect(gameApp.currentState).toBe('character_creation');
    });
  });
});