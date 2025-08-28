/**
 * Splash Screen Input Handling Fix Tests
 * 
 * Tests to verify the critical fix for game exiting after splash screen.
 * This addresses the input handling conflict between SplashScreen and GameApp.
 */

const SplashScreen = require('../../src/ui/screens/SplashScreen');
const GameApp = require('../../src/GameApp');

describe('Splash Screen Input Handling Fix', () => {
  let originalConsoleLog;
  let originalStdoutWrite;
  let originalSetTimeout;
  let consoleOutput;
  
  beforeEach(() => {
    // Mock console.log to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Mock process.stdout.write to capture cursor movements
    originalStdoutWrite = process.stdout.write;
    process.stdout.write = jest.fn((data) => {
      consoleOutput.push(`STDOUT: ${data}`);
      return true;
    });
    
    // Mock setTimeout to control timing
    originalSetTimeout = global.setTimeout;
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore original functions
    console.log = originalConsoleLog;
    process.stdout.write = originalStdoutWrite;
    global.setTimeout = originalSetTimeout;
    jest.useRealTimers();
  });

  describe('SplashScreen displayAnimated', () => {
    test('should display splash immediately without waiting for input', async () => {
      const splashScreen = new SplashScreen();
      
      // Start the display animation
      const displayPromise = splashScreen.displayAnimated();
      
      // Should show splash content immediately
      expect(consoleOutput.join('\n')).toContain('🏇 HORSE RACING TEXT GAME');
      expect(consoleOutput.join('\n')).toContain('🐎 Preparing the track...');
      
      // Fast forward through the 2 second delay
      jest.advanceTimersByTime(2000);
      
      // Should resolve without waiting for input
      await expect(displayPromise).resolves.toBeUndefined();
    });

    test('should show loading message then replace with continue prompt', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Should show loading message initially
      expect(consoleOutput.some(line => line.includes('🐎 Preparing the track...'))).toBe(true);
      
      // Fast forward through the delay
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should have cursor movement and continue prompt
      expect(consoleOutput.some(line => line.includes('STDOUT: \u001b[1A\u001b[2K'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('Press any key to continue'))).toBe(true);
    });

    test('should not set up any input listeners', async () => {
      const splashScreen = new SplashScreen();
      
      // Mock process.stdin to track listener setup
      const stdinOnSpy = jest.spyOn(process.stdin, 'on').mockImplementation();
      const stdinRemoveListenerSpy = jest.spyOn(process.stdin, 'removeListener').mockImplementation();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should NOT set up any stdin listeners
      expect(stdinOnSpy).not.toHaveBeenCalledWith('data', expect.any(Function));
      expect(stdinRemoveListenerSpy).not.toHaveBeenCalled();
      
      stdinOnSpy.mockRestore();
      stdinRemoveListenerSpy.mockRestore();
    });

    test('should not call setRawMode or stdin.pause', async () => {
      const splashScreen = new SplashScreen();
      
      // Mock stdin methods only if they exist
      const setRawModeSpy = process.stdin.setRawMode ? 
        jest.spyOn(process.stdin, 'setRawMode').mockImplementation() : null;
      const pauseSpy = process.stdin.pause ? 
        jest.spyOn(process.stdin, 'pause').mockImplementation() : null;
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // These methods should NOT be called (they caused the input conflict)
      if (setRawModeSpy) {
        expect(setRawModeSpy).not.toHaveBeenCalled();
        setRawModeSpy.mockRestore();
      }
      if (pauseSpy) {
        expect(pauseSpy).not.toHaveBeenCalled();
        pauseSpy.mockRestore();
      }
    });
  });

  describe('GameApp integration', () => {
    test('should not have input handling conflicts', () => {
      // Create GameApp instance (which sets up readline)
      const gameApp = new GameApp();
      
      // Should have readline interface set up
      expect(gameApp.rl).toBeDefined();
      expect(gameApp.rl.input).toBe(process.stdin);
      expect(gameApp.rl.output).toBe(process.stdout);
      
      // Cleanup
      gameApp.cleanup();
    });

    test('should handle splash screen without conflicts', async () => {
      const gameApp = new GameApp();
      const splashScreen = new SplashScreen();
      
      // Mock readline to prevent actual input handling during test
      if (gameApp.rl && gameApp.rl.close) {
        gameApp.rl.close();
      }
      gameApp.rl = {
        on: jest.fn(),
        close: jest.fn(),
        removeAllListeners: jest.fn()
      };
      
      // Should be able to display splash without breaking GameApp
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await expect(displayPromise).resolves.toBeUndefined();
      
      // GameApp should still be functional
      expect(gameApp.currentState).toBe('main_menu');
      
      // Cleanup
      gameApp.cleanup();
    });
  });

  describe('Regression prevention', () => {
    test('should not use Promise with input handling', async () => {
      const splashScreen = new SplashScreen();
      
      // Get the source code to verify no input Promise patterns
      const fs = require('fs');
      const path = require('path');
      const splashScreenCode = fs.readFileSync(
        path.join(__dirname, '../../src/ui/screens/SplashScreen.js'), 
        'utf8'
      );
      
      // Should not contain the problematic patterns that caused conflicts
      expect(splashScreenCode).not.toContain('process.stdin.on(\'data\'');
      expect(splashScreenCode).not.toContain('process.stdin.removeListener');
      expect(splashScreenCode).not.toContain('process.stdin.pause()');
      expect(splashScreenCode).not.toContain('setRawMode(true)');
      expect(splashScreenCode).not.toContain('setRawMode(false)');
    });

    test('should resolve immediately without waiting', () => {
      const splashScreen = new SplashScreen();
      
      // Start display
      const displayPromise = splashScreen.displayAnimated();
      
      // Should not be waiting for external input
      // (the old version would hang here waiting for keypress)
      jest.advanceTimersByTime(2000);
      
      // Should resolve quickly
      return expect(displayPromise).resolves.toBeUndefined();
    });
  });

  describe('UX improvements verification', () => {
    test('should show splash screen first (not loading screen)', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Splash content should appear immediately (first thing)
      const firstOutputLines = consoleOutput.slice(0, 5);
      expect(firstOutputLines.some(line => 
        line.includes('🏇 HORSE RACING TEXT GAME') || 
        line.includes('WELCOME TO THE STABLES')
      )).toBe(true);
      
      jest.advanceTimersByTime(2000);
      await displayPromise;
    });

    test('should use ANSI escape sequences for cursor control', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should use cursor up (1A) and clear line (2K) ANSI sequences
      expect(process.stdout.write).toHaveBeenCalledWith('\u001b[1A\u001b[2K');
    });

    test('should show proper message progression', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Should show loading first
      expect(consoleOutput.some(line => line.includes('🐎 Preparing the track...'))).toBe(true);
      
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Then should show continue prompt
      expect(consoleOutput.some(line => line.includes('Press any key to continue'))).toBe(true);
    });
  });
});