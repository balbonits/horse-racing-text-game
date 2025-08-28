/**
 * Terminal Compatibility Tests
 * 
 * Tests for handling different terminal environments where stdin may not support
 * setRawMode() or other advanced terminal features.
 */

const SplashScreen = require('../../src/ui/screens/SplashScreen');
const StartupScreen = require('../../src/ui/screens/StartupScreen');

describe('Terminal Compatibility', () => {
  let originalStdin;
  let originalSetRawMode;
  
  beforeEach(() => {
    // Store original stdin methods
    originalStdin = process.stdin;
    originalSetRawMode = process.stdin.setRawMode;
  });
  
  afterEach(() => {
    // Restore original stdin methods
    if (originalSetRawMode) {
      process.stdin.setRawMode = originalSetRawMode;
    }
    
    // Clean up any listeners if removeAllListeners exists
    if (process.stdin.removeAllListeners) {
      process.stdin.removeAllListeners('data');
    }
    
    // Reset stdin state safely
    try {
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
      if (process.stdin.pause) {
        process.stdin.pause();
      }
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('SplashScreen setRawMode compatibility', () => {
    test('should handle missing setRawMode gracefully', async () => {
      // Mock stdin without setRawMode support
      process.stdin.setRawMode = undefined;
      
      const splashScreen = new SplashScreen();
      
      // Start the display - should not throw
      const displayPromise = splashScreen.displayAnimated();
      
      // Wait a bit then simulate input
      setTimeout(() => {
        process.stdin.emit('data', '\n');
      }, 100);
      
      // Should resolve without errors
      await expect(displayPromise).resolves.toBeUndefined();
    });

    test('should handle setRawMode throwing error', async () => {
      // Mock stdin.setRawMode to throw error
      process.stdin.setRawMode = jest.fn(() => {
        throw new Error('setRawMode is not a function');
      });
      
      const splashScreen = new SplashScreen();
      
      // Start the display - should not throw
      const displayPromise = splashScreen.displayAnimated();
      
      // Wait a bit then simulate input
      setTimeout(() => {
        process.stdin.emit('data', '\n');
      }, 100);
      
      // Should resolve without errors despite setRawMode failure
      await expect(displayPromise).resolves.toBeUndefined();
    });

    test('should work normally when setRawMode is available', async () => {
      // Mock stdin.setRawMode normally
      process.stdin.setRawMode = jest.fn();
      
      const splashScreen = new SplashScreen();
      
      // Start the display
      const displayPromise = splashScreen.displayAnimated();
      
      // Wait a bit then simulate input
      setTimeout(() => {
        process.stdin.emit('data', '\n');
      }, 100);
      
      // Should resolve normally
      await expect(displayPromise).resolves.toBeUndefined();
      
      // setRawMode should have been called
      expect(process.stdin.setRawMode).toHaveBeenCalledWith(true);
      expect(process.stdin.setRawMode).toHaveBeenCalledWith(false);
    });
  });

  describe('StartupScreen setRawMode compatibility', () => {
    test('should not crash when setRawMode is unavailable', () => {
      // Mock stdin without setRawMode support
      process.stdin.setRawMode = undefined;
      
      // Creating StartupScreen should not throw
      expect(() => {
        const startupScreen = new StartupScreen();
        expect(startupScreen).toBeDefined();
      }).not.toThrow();
    });

    test('should handle setRawMode function checks gracefully', () => {
      // Mock stdin.setRawMode to throw error when called
      process.stdin.setRawMode = jest.fn(() => {
        throw new Error('setRawMode is not a function');
      });
      
      const startupScreen = new StartupScreen();
      
      // Should be able to create and work with StartupScreen
      expect(startupScreen).toBeDefined();
      expect(typeof startupScreen.displayWelcomeScreen).toBe('function');
    });
  });

  describe('Game launch compatibility', () => {
    test('should handle terminal environment with limited stdin features', () => {
      // Mock a limited stdin environment (like some CI systems)
      const mockStdin = {
        ...process.stdin,
        setRawMode: undefined,
        isTTY: false
      };
      
      // Override process.stdin temporarily
      Object.defineProperty(process, 'stdin', {
        value: mockStdin,
        writable: true,
        configurable: true
      });
      
      // Should not throw when checking stdin features
      expect(() => {
        const canUseRawMode = process.stdin.setRawMode && process.stdin.isTTY;
        expect(canUseRawMode).toBe(false);
      }).not.toThrow();
    });
  });

  describe('Error message consistency', () => {
    test('should show consistent error messages for setRawMode failures', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock stdin.setRawMode to throw error
      process.stdin.setRawMode = jest.fn(() => {
        throw new Error('setRawMode is not a function');
      });
      
      const splashScreen = new SplashScreen();
      
      // This should log the error message we saw in recordings
      return splashScreen.displayAnimated().then(() => {
        // Simulate input to trigger cleanup
        process.stdin.emit('data', '\n');
        
        // Should have logged the expected error message
        expect(consoleSpy).toHaveBeenCalledWith(
          'Splash screen error (continuing anyway):',
          'setRawMode is not a function'
        );
        
        consoleSpy.mockRestore();
      });
    });
  });
});