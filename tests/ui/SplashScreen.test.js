/**
 * Splash Screen System Tests
 * 
 * Tests the ASCII art splash screen functionality, animations,
 * and integration with the ColorThemeManager.
 */

const SplashScreen = require('../../src/ui/screens/SplashScreen');
const ColorThemeManager = require('../../src/ui/ColorThemeManager');

describe('Splash Screen System', () => {
  let splashScreen;
  let colorManager;
  let consoleOutput;
  let originalConsoleLog;
  let originalConsoleClear;
  let mockProcess;

  beforeEach(() => {
    // Setup color manager
    colorManager = new ColorThemeManager();
    splashScreen = new SplashScreen(colorManager);

    // Mock console output for testing
    consoleOutput = [];
    originalConsoleLog = console.log;
    originalConsoleClear = console.clear;

    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    console.clear = jest.fn();

    // Mock process.stdin for input testing
    mockProcess = {
      stdin: {
        setRawMode: jest.fn(),
        resume: jest.fn(),
        pause: jest.fn(),
        setEncoding: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn()
      }
    };
    
    // Replace process.stdin for tests
    global.process = { ...process, stdin: mockProcess.stdin };
  });

  afterEach(() => {
    // Restore console and process
    console.log = originalConsoleLog;
    console.clear = originalConsoleClear;
    global.process = process;
  });

  describe('Basic Display Functionality', () => {
    test('should display splash screen with ASCII art', () => {
      splashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('HORSE RACING TEXT GAME');
      expect(output).toContain('THUNDER RUNNER v1.0');
      expect(output).toContain('WELCOME TO THE STABLES');
      expect(output).toContain('Train Champions');
      expect(output).toContain('Press any key to continue');
      expect(console.clear).toHaveBeenCalled();
    });

    test('should work without color manager', () => {
      const plainSplashScreen = new SplashScreen(null);
      plainSplashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('HORSE RACING TEXT GAME');
      expect(output).toContain('WELCOME TO THE STABLES');
    });

    test('should work with color manager', () => {
      const coloredSplashScreen = new SplashScreen(colorManager);
      coloredSplashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toContain('HORSE RACING TEXT GAME');
      expect(output).toContain('WELCOME TO THE STABLES');
    });
  });

  describe('Animated Display', () => {
    test('should handle displayAnimated with input simulation', async () => {
      // Mock the input handling to resolve immediately
      mockProcess.stdin.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          setTimeout(() => callback('test'), 10); // Simulate key press after 10ms
        }
      });

      const promise = splashScreen.displayAnimated();
      await promise;

      expect(mockProcess.stdin.setRawMode).toHaveBeenCalledWith(true);
      expect(mockProcess.stdin.resume).toHaveBeenCalled();
      expect(mockProcess.stdin.setEncoding).toHaveBeenCalledWith('utf8');
      expect(mockProcess.stdin.on).toHaveBeenCalledWith('data', expect.any(Function));
    });

    test('should cleanup input listeners properly', async () => {
      mockProcess.stdin.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          setTimeout(() => callback('test'), 10);
        }
      });

      await splashScreen.displayAnimated();

      expect(mockProcess.stdin.removeListener).toHaveBeenCalled();
      expect(mockProcess.stdin.setRawMode).toHaveBeenCalledWith(false);
      expect(mockProcess.stdin.pause).toHaveBeenCalled();
    });
  });

  describe('Loading Animation', () => {
    test('should display loading animation with message', async () => {
      const promise = splashScreen.displayLoadingAnimation('Test Loading...', 100);
      await promise;

      const output = consoleOutput.join('\n');
      expect(output).toContain('Test Loading...');
      expect(output).toContain('🐎');
      expect(console.clear).toHaveBeenCalled();
    });

    test('should use default loading message', async () => {
      const promise = splashScreen.displayLoadingAnimation(undefined, 100);
      await promise;

      const output = consoleOutput.join('\n');
      expect(output).toContain('Loading...');
    });
  });

  describe('Startup Sequence', () => {
    test('should run complete startup sequence', async () => {
      // Mock displayAnimated to resolve quickly
      jest.spyOn(splashScreen, 'displayAnimated').mockResolvedValue();
      jest.spyOn(splashScreen, 'displayLoadingAnimation').mockResolvedValue();

      const result = await splashScreen.displayStartupSequence();

      expect(result.success).toBe(true);
      expect(splashScreen.displayLoadingAnimation).toHaveBeenCalledWith('Preparing the track...');
      expect(splashScreen.displayAnimated).toHaveBeenCalled();
    });

    test('should handle errors in startup sequence gracefully', async () => {
      jest.spyOn(splashScreen, 'displayLoadingAnimation').mockRejectedValue(new Error('Test error'));

      // Should not throw, but handle gracefully
      await expect(splashScreen.displayStartupSequence()).resolves.toBeDefined();
    });
  });

  describe('ASCII Art Integration', () => {
    test('should use ASCIIArt module for content', () => {
      const ASCIIArt = require('../../src/ui/graphics/ASCIIArt');
      
      // Mock ASCIIArt to verify it's called
      jest.spyOn(ASCIIArt, 'getColoredSplash').mockReturnValue('MOCKED COLORED SPLASH');
      jest.spyOn(ASCIIArt, 'getMainSplash').mockReturnValue('MOCKED MAIN SPLASH');

      const coloredSplashScreen = new SplashScreen(colorManager);
      coloredSplashScreen.display();

      expect(ASCIIArt.getColoredSplash).toHaveBeenCalledWith(colorManager);
      
      const plainSplashScreen = new SplashScreen(null);
      plainSplashScreen.display();

      expect(ASCIIArt.getMainSplash).toHaveBeenCalled();
    });
  });

  describe('Splash Screen Snapshots', () => {
    test('should render splash screen consistently', () => {
      splashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('splash-screen-display');
    });

    test('should render colored splash screen consistently', () => {
      const coloredSplashScreen = new SplashScreen(colorManager);
      coloredSplashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('colored-splash-screen-display');
    });

    test('should render plain splash screen consistently', () => {
      const plainSplashScreen = new SplashScreen(null);
      plainSplashScreen.display();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('plain-splash-screen-display');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing ASCIIArt gracefully', () => {
      // Mock ASCIIArt to throw error
      jest.doMock('../../src/ui/graphics/ASCIIArt', () => {
        throw new Error('ASCIIArt not found');
      });

      // Should not crash the app
      expect(() => splashScreen.display()).not.toThrow();
    });

    test('should handle console errors gracefully', () => {
      console.log.mockImplementation(() => {
        throw new Error('Console error');
      });

      // Should not crash
      expect(() => splashScreen.display()).not.toThrow();
    });
  });

  describe('Integration with GameApp', () => {
    test('should integrate properly with GameApp start sequence', async () => {
      const GameApp = require('../../src/GameApp');
      const gameApp = new GameApp();

      // Mock the splashScreen methods
      jest.spyOn(gameApp.splashScreen, 'displayStartupSequence').mockResolvedValue({ success: true });

      // Test that start() calls the splash screen
      await gameApp.start();

      expect(gameApp.splashScreen.displayStartupSequence).toHaveBeenCalled();
    });
  });
});