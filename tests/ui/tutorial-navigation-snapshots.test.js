/**
 * Tutorial Navigation UI Snapshots
 * 
 * Captures UI snapshots for tutorial navigation screens to ensure
 * visual consistency and detect regressions.
 */

const GameApp = require('../../src/GameApp');

describe('Tutorial Navigation UI Snapshots', () => {
  let gameApp;
  let consoleOutput;
  let originalConsoleLog;
  let originalConsoleClear;

  beforeEach(() => {
    // Capture console output for snapshots
    consoleOutput = [];
    originalConsoleLog = console.log;
    originalConsoleClear = console.clear;
    
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    console.clear = jest.fn();

    gameApp = new GameApp();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.clear = originalConsoleClear;
    
    if (gameApp) {
      gameApp.cleanup();
    }
  });

  describe('Tutorial State Snapshots', () => {
    test('should render tutorial introduction screen consistently', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-introduction-screen');
    });

    test('should render tutorial training screen consistently', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-training-initial-screen');
    });

    test('should render tutorial training after first action consistently', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Perform first training
      gameApp.tutorialManager.performTutorialTraining('speed');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-training-after-first-action');
    });

    test('should render tutorial ready for race consistently', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Complete all training
      gameApp.tutorialManager.performTutorialTraining('speed');
      gameApp.tutorialManager.performTutorialTraining('stamina');
      gameApp.tutorialManager.performTutorialTraining('power');
      gameApp.tutorialManager.performTutorialTraining('rest');
      gameApp.tutorialManager.performTutorialTraining('media');
      
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-ready-for-race');
    });

    test('should render tutorial completion screen consistently', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Complete all training and race
      gameApp.tutorialManager.performTutorialTraining('speed');
      gameApp.tutorialManager.performTutorialTraining('stamina');
      gameApp.tutorialManager.performTutorialTraining('power');
      gameApp.tutorialManager.performTutorialTraining('rest');
      gameApp.tutorialManager.performTutorialTraining('media');
      gameApp.tutorialManager.runTutorialRace();
      
      gameApp.stateMachine.transitionTo('tutorial_complete');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-completion-screen');
    });
  });

  describe('Navigation Flow Snapshots', () => {
    test('should capture complete tutorial navigation flow', () => {
      const flowSnapshots = [];
      
      // Main menu
      gameApp.render();
      flowSnapshots.push({
        state: 'main_menu',
        output: consoleOutput.join('\n')
      });
      consoleOutput = [];
      
      // Tutorial introduction
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.render();
      flowSnapshots.push({
        state: 'tutorial',
        output: consoleOutput.join('\n')
      });
      consoleOutput = [];
      
      // Tutorial training
      gameApp.stateMachine.transitionTo('tutorial_training');
      gameApp.render();
      flowSnapshots.push({
        state: 'tutorial_training',
        output: consoleOutput.join('\n')
      });
      
      expect(flowSnapshots).toMatchSnapshot('tutorial-navigation-flow');
    });

    test('should capture training progression snapshots', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      const progressionSnapshots = [];
      
      // Initial state
      gameApp.render();
      progressionSnapshots.push({
        step: 0,
        output: consoleOutput.join('\n')
      });
      consoleOutput = [];
      
      // After each training step
      const trainingTypes = ['speed', 'stamina', 'power', 'rest', 'media'];
      trainingTypes.forEach((type, index) => {
        gameApp.tutorialManager.performTutorialTraining(type);
        gameApp.render();
        progressionSnapshots.push({
          step: index + 1,
          training: type,
          output: consoleOutput.join('\n')
        });
        consoleOutput = [];
      });
      
      expect(progressionSnapshots).toMatchSnapshot('tutorial-training-progression');
    });
  });

  describe('Error State Snapshots', () => {
    test('should capture invalid input response in tutorial', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.render();
      
      // Try invalid input
      const result = gameApp.stateMachine.handleInput('invalid');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-invalid-input-response');
    });

    test('should capture wrong training choice response', () => {
      gameApp.stateMachine.transitionTo('tutorial');
      gameApp.tutorialManager.startTutorial();
      gameApp.stateMachine.transitionTo('tutorial_training');
      
      // Try wrong training for turn 1 (should be speed)
      const validation = gameApp.tutorialManager.validateTrainingChoice('2');
      gameApp.render();
      
      const output = consoleOutput.join('\n');
      expect(output).toMatchSnapshot('tutorial-wrong-training-choice');
    });
  });

  describe('Responsive Layout Snapshots', () => {
    test('should render consistently with different terminal widths', () => {
      const originalColumns = process.stdout.columns;
      const widths = [80, 120, 160];
      
      const responsiveSnapshots = [];
      
      widths.forEach(width => {
        process.stdout.columns = width;
        consoleOutput = [];
        
        gameApp.stateMachine.transitionTo('tutorial');
        gameApp.tutorialManager.startTutorial();
        gameApp.render();
        
        responsiveSnapshots.push({
          width: width,
          output: consoleOutput.join('\n')
        });
      });
      
      process.stdout.columns = originalColumns;
      expect(responsiveSnapshots).toMatchSnapshot('tutorial-responsive-layouts');
    });
  });

  describe('Color Theme Snapshots', () => {
    test('should render consistently with different color themes', () => {
      const themes = ['standard', 'monochrome', 'protanopia'];
      const themeSnapshots = [];
      
      themes.forEach(theme => {
        gameApp.colorManager.setTheme(theme);
        consoleOutput = [];
        
        gameApp.stateMachine.transitionTo('tutorial');
        gameApp.tutorialManager.startTutorial();
        gameApp.render();
        
        themeSnapshots.push({
          theme: theme,
          output: consoleOutput.join('\n')
        });
      });
      
      expect(themeSnapshots).toMatchSnapshot('tutorial-color-themes');
    });
  });
});