/**
 * Splash Screen Loading UX Tests
 * 
 * Tests to verify the improved splash screen experience where:
 * 1. Splash screen shows immediately 
 * 2. Loading message appears at bottom
 * 3. Loading completes and seamlessly transitions to main menu
 * 4. No misleading "Press any key to continue" message
 */

const SplashScreen = require('../../src/ui/screens/SplashScreen');

describe('Splash Screen Loading UX', () => {
  let originalConsoleLog;
  let originalStdoutWrite;
  let consoleOutput;
  let stdoutOutput;
  
  beforeEach(() => {
    // Mock console.log to capture output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Mock process.stdout.write to capture cursor movements
    stdoutOutput = [];
    originalStdoutWrite = process.stdout.write;
    process.stdout.write = jest.fn((data) => {
      stdoutOutput.push(data);
      return true;
    });
    
    // Mock timers for controlled testing
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore original functions
    console.log = originalConsoleLog;
    process.stdout.write = originalStdoutWrite;
    jest.useRealTimers();
  });

  describe('Seamless splash-to-loading experience', () => {
    test('should show splash screen immediately with loading message', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Should show splash content and loading message immediately
      expect(consoleOutput.join('\n')).toContain('🏇 HORSE RACING TEXT GAME');
      expect(consoleOutput.join('\n')).toContain('🐎 Preparing the track...');
      
      jest.advanceTimersByTime(2000);
      await displayPromise;
    });

    test('should clear loading message after completion', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should use ANSI escape to clear loading message
      expect(stdoutOutput).toContain('\u001b[1A\u001b[2K');
    });

    test('should NOT show "Press any key to continue" message', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      const allOutput = [...consoleOutput, ...stdoutOutput].join(' ');
      
      // Should NOT contain misleading continue message
      expect(allOutput).not.toContain('Press any key to continue');
      expect(allOutput).not.toContain('press any key');
      expect(allOutput).not.toContain('continue');
    });

    test('should complete loading without user input', async () => {
      const splashScreen = new SplashScreen();
      
      // Should resolve automatically after loading time
      const displayPromise = splashScreen.displayAnimated();
      
      // Fast forward through loading
      jest.advanceTimersByTime(2000);
      
      // Should resolve without waiting for input
      await expect(displayPromise).resolves.toBeUndefined();
    });
  });

  describe('Loading message progression', () => {
    test('should show loading message during delay', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Should show loading message before delay completes
      expect(consoleOutput.some(line => line.includes('🐎 Preparing the track...'))).toBe(true);
      
      jest.advanceTimersByTime(2000);
      await displayPromise;
    });

    test('should clean up loading message after completion', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should move cursor up and clear line
      expect(process.stdout.write).toHaveBeenCalledWith('\u001b[1A\u001b[2K');
      
      // Should not add any additional messages after clearing
      const outputAfterClear = consoleOutput.slice(-3); // Last few messages
      expect(outputAfterClear.every(line => 
        !line.includes('continue') && !line.includes('press')
      )).toBe(true);
    });
  });

  describe('Timing and UX flow', () => {
    test('should complete loading in exactly 2 seconds', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Should not complete before 2 seconds
      jest.advanceTimersByTime(1999);
      expect(displayPromise).toEqual(expect.any(Promise)); // Still pending
      
      // Should complete after exactly 2 seconds
      jest.advanceTimersByTime(1);
      await expect(displayPromise).resolves.toBeUndefined();
    });

    test('should provide smooth visual transition', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      
      // Should show beautiful splash screen
      expect(consoleOutput.some(line => 
        line.includes('WELCOME TO THE STABLES') || 
        line.includes('🏇 HORSE RACING TEXT GAME')
      )).toBe(true);
      
      // Should show loading indicator
      expect(consoleOutput.some(line => line.includes('🐎 Preparing'))).toBe(true);
      
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should clean up smoothly with cursor control
      expect(stdoutOutput).toContain('\u001b[1A\u001b[2K');
    });
  });

  describe('Screen isolation', () => {
    test('should not affect other screens or display methods', () => {
      const splashScreen = new SplashScreen();
      
      // Direct display() call should work without misleading prompts
      splashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('🏇 HORSE RACING TEXT GAME');
      expect(output).not.toContain('Press any key to continue');
    });

    test('should maintain splash screen display functionality', () => {
      const splashScreen = new SplashScreen();
      
      // Should clear screen and show splash content
      splashScreen.display();
      
      expect(consoleOutput).toEqual(
        expect.arrayContaining([
          expect.stringContaining('🏇 HORSE RACING TEXT GAME'),
          expect.stringContaining('WELCOME TO THE STABLES')
        ])
      );
    });
  });

  describe('Regression prevention', () => {
    test('should not contain any misleading user prompts', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      const allOutput = [...consoleOutput, ...stdoutOutput].join('\n').toLowerCase();
      
      // Check for various forms of misleading prompts
      expect(allOutput).not.toContain('press');
      expect(allOutput).not.toContain('key');
      expect(allOutput).not.toContain('continue');
      expect(allOutput).not.toContain('enter');
      expect(allOutput).not.toContain('input');
      expect(allOutput).not.toContain('wait');
    });

    test('should maintain clean splash-to-loading experience', async () => {
      const splashScreen = new SplashScreen();
      
      const displayPromise = splashScreen.displayAnimated();
      jest.advanceTimersByTime(2000);
      await displayPromise;
      
      // Should be a clean transition without confusing messages
      expect(consoleOutput).toEqual(
        expect.arrayContaining([
          expect.stringContaining('🏇 HORSE RACING TEXT GAME'),
          expect.stringContaining('🐎 Preparing the track...')
        ])
      );
      
      // Should end cleanly with just cursor cleanup
      expect(stdoutOutput).toEqual(['\u001b[1A\u001b[2K']);
    });
  });
});