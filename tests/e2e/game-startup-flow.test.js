/**
 * Game Startup Flow E2E Tests
 * 
 * End-to-end tests to verify the complete game startup sequence
 * works without exiting prematurely after the splash screen.
 */

const GameApp = require('../../src/GameApp');

describe('Game Startup Flow E2E', () => {
  let originalConsoleLog;
  let consoleOutput;
  let gameApp;
  
  beforeEach(() => {
    // Mock console.log to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Mock timers for controlled testing
    jest.useFakeTimers();
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

  describe('Complete startup sequence', () => {
    test('should complete full startup without exiting', async () => {
      gameApp = new GameApp();
      
      // Start the game (this includes splash screen)
      const startPromise = gameApp.start();
      
      // Fast forward through splash screen timing
      jest.advanceTimersByTime(2000);
      
      // Should complete startup successfully
      await expect(startPromise).resolves.toBeUndefined();
      
      // Should be in main menu state
      expect(gameApp.currentState).toBe('main_menu');
    });

    test('should show splash screen then main menu', async () => {
      gameApp = new GameApp();
      
      const startPromise = gameApp.start();
      jest.advanceTimersByTime(2000);
      await startPromise;
      
      const output = consoleOutput.join('\n');
      
      // Should show splash screen content
      expect(output).toContain('🏇 HORSE RACING TEXT GAME');
      expect(output).toContain('WELCOME TO THE STABLES');
      
      // Should show main menu content
      expect(output).toContain('MAIN MENU');
      expect(output).toContain('1. New Career');
      expect(output).toContain('2. Tutorial');
    });

    test('should have functional readline interface after splash', async () => {
      gameApp = new GameApp();
      
      const startPromise = gameApp.start();
      jest.advanceTimersByTime(2000);
      await startPromise;
      
      // Readline interface should be functional
      expect(gameApp.rl).toBeDefined();
      expect(gameApp.rl.input).toBe(process.stdin);
      expect(gameApp.rl.output).toBe(process.stdout);
      
      // Should be able to handle input
      expect(() => {
        gameApp.handleKeyInput('1');
      }).not.toThrow();
    });
  });

  describe('Input handling verification', () => {
    test('should handle main menu input without crashing', async () => {
      gameApp = new GameApp();
      
      const startPromise = gameApp.start();
      jest.advanceTimersByTime(2000);
      await startPromise;
      
      // Should be able to handle various inputs without throwing
      expect(() => {
        gameApp.handleKeyInput('1');  // New Career
        gameApp.handleKeyInput('2');  // Tutorial  
        gameApp.handleKeyInput('3');  // Load Game
        gameApp.handleKeyInput('4');  // Help
      }).not.toThrow();
    });

    test('should transition states properly', async () => {
      gameApp = new GameApp();
      
      const startPromise = gameApp.start();
      jest.advanceTimersByTime(2000);
      await startPromise;
      
      // Should start in main_menu
      expect(gameApp.currentState).toBe('main_menu');
      
      // Should be able to transition to tutorial
      gameApp.handleKeyInput('2');
      expect(gameApp.currentState).toBe('tutorial');
    });
  });

  describe('Regression prevention', () => {
    test('should not exit process during startup', async () => {
      // Mock process.exit to detect if it's called
      const originalExit = process.exit;
      const exitSpy = jest.fn();
      process.exit = exitSpy;
      
      try {
        gameApp = new GameApp();
        
        const startPromise = gameApp.start();
        jest.advanceTimersByTime(2000);
        await startPromise;
        
        // Process should not have exited
        expect(exitSpy).not.toHaveBeenCalled();
        
      } finally {
        // Restore process.exit
        process.exit = originalExit;
      }
    });

    test('should not hang waiting for input', async () => {
      gameApp = new GameApp();
      
      // This should complete in reasonable time (not hang)
      const startPromise = gameApp.start();
      
      // Should not hang - resolves after timer advancement
      jest.advanceTimersByTime(2000);
      
      // Should resolve quickly without external input
      await expect(Promise.race([
        startPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Startup hung')), 100)
        )
      ])).resolves.toBeUndefined();
    });
  });

  describe('Error handling', () => {
    test('should handle splash screen errors gracefully', async () => {
      gameApp = new GameApp();
      
      // Mock splash screen to throw error
      const originalShowSplashScreen = gameApp.showSplashScreen;
      gameApp.showSplashScreen = jest.fn().mockRejectedValue(new Error('Splash error'));
      
      // Should still complete startup
      const startPromise = gameApp.start();
      await expect(startPromise).resolves.toBeUndefined();
      
      // Should still reach main menu
      expect(gameApp.currentState).toBe('main_menu');
      
      // Restore method
      gameApp.showSplashScreen = originalShowSplashScreen;
    });
  });
});