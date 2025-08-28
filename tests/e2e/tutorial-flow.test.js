/**
 * End-to-End Test for Tutorial System
 * 
 * Tests the complete tutorial flow from main menu navigation
 * through 5 training turns and final race completion.
 */

const GameApp = require('../../src/GameApp');
const TutorialManager = require('../../src/systems/TutorialManager');

describe('Tutorial System E2E Tests', () => {
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

        // Create game app instance
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

    describe('Tutorial Navigation', () => {
        test('should navigate to tutorial from main menu', () => {
            // Start at main menu
            expect(gameApp.currentState).toBe('main_menu');
            
            // Render main menu
            gameApp.render();
            
            // Check that tutorial option is displayed
            const menuOutput = consoleOutput.join('\n');
            expect(menuOutput).toContain('2. Tutorial - Learn how to play');
            expect(menuOutput).toContain('(Recommended for new players)');
            
            // Navigate to tutorial (option 2)
            const result = gameApp.stateMachine.handleInput('2');
            expect(result.success).toBe(true);
            
            // Should transition to tutorial state
            expect(gameApp.stateMachine.getCurrentState()).toBe('tutorial');
        });

        test('should display tutorial introduction with stable manager', () => {
            // Navigate to tutorial
            gameApp.stateMachine.transitionTo('tutorial');
            
            // Start tutorial
            const tutorialResult = gameApp.tutorialManager.startTutorial();
            expect(tutorialResult.success).toBe(true);
            expect(tutorialResult.character).toBeDefined();
            expect(tutorialResult.character.name).toBe('Tutorial Star');
            
            // Check stable manager dialogue
            const guidance = gameApp.tutorialManager.getTutorialGuidance();
            expect(guidance.stableManager).toBeDefined();
            expect(guidance.stableManager.name).toBe('Alex Morgan');
            expect(guidance.stableManager.title).toBe('Stable Manager');
        });

        test('should transition from tutorial to tutorial_training', () => {
            // Start in tutorial state
            gameApp.stateMachine.transitionTo('tutorial');
            gameApp.tutorialManager.startTutorial();
            
            // Press enter to continue to training
            const result = gameApp.stateMachine.handleInput('');
            expect(result.success).toBe(true);
            
            // Should be in tutorial_training state
            expect(gameApp.stateMachine.getCurrentState()).toBe('tutorial_training');
        });
    });

    describe('Tutorial Training Progression', () => {
        beforeEach(() => {
            // Setup tutorial and navigate to training
            gameApp.stateMachine.transitionTo('tutorial');
            gameApp.tutorialManager.startTutorial();
            gameApp.stateMachine.transitionTo('tutorial_training');
        });

        test('should complete Turn 1 - Speed Training', () => {
            expect(gameApp.tutorialManager.tutorialStep).toBe(0);
            
            // Validate expected training type
            const validation = gameApp.tutorialManager.validateTrainingChoice('1');
            expect(validation.valid).toBe(true);
            expect(validation.type).toBe('speed');
            
            // Perform speed training
            const result = gameApp.tutorialManager.performTutorialTraining('speed');
            expect(result.success).toBe(true);
            expect(result.type).toBe('speed');
            expect(result.gain).toBe(8);
            expect(result.tutorialStep).toBe(1);
            
            // Check character stats updated
            const character = gameApp.tutorialManager.tutorialCharacter;
            expect(character.stats.speed).toBe(33); // 25 + 8
            expect(character.energy).toBe(85); // 100 - 15
        });

        test('should complete Turn 2 - Stamina Training', () => {
            // Complete turn 1 first
            gameApp.tutorialManager.performTutorialTraining('speed');
            
            expect(gameApp.tutorialManager.tutorialStep).toBe(1);
            
            // Validate stamina training
            const validation = gameApp.tutorialManager.validateTrainingChoice('2');
            expect(validation.valid).toBe(true);
            expect(validation.type).toBe('stamina');
            
            // Perform stamina training
            const result = gameApp.tutorialManager.performTutorialTraining('stamina');
            expect(result.success).toBe(true);
            expect(result.type).toBe('stamina');
            expect(result.gain).toBe(6);
            
            // Check stats
            const character = gameApp.tutorialManager.tutorialCharacter;
            expect(character.stats.stamina).toBe(31); // 25 + 6
            expect(character.energy).toBe(75); // 85 - 10
        });

        test('should complete Turn 3 - Power Training', () => {
            // Complete turns 1-2
            gameApp.tutorialManager.performTutorialTraining('speed');
            gameApp.tutorialManager.performTutorialTraining('stamina');
            
            // Perform power training
            const result = gameApp.tutorialManager.performTutorialTraining('power');
            expect(result.success).toBe(true);
            expect(result.type).toBe('power');
            expect(result.gain).toBe(7);
            
            const character = gameApp.tutorialManager.tutorialCharacter;
            expect(character.stats.power).toBe(32); // 25 + 7
        });

        test('should complete Turn 4 - Rest Day', () => {
            // Complete turns 1-3
            gameApp.tutorialManager.performTutorialTraining('speed');
            gameApp.tutorialManager.performTutorialTraining('stamina');
            gameApp.tutorialManager.performTutorialTraining('power');
            
            const energyBefore = gameApp.tutorialManager.tutorialCharacter.energy;
            
            // Perform rest day
            const result = gameApp.tutorialManager.performTutorialTraining('rest');
            expect(result.success).toBe(true);
            expect(result.type).toBe('rest');
            expect(result.energyChange).toBe(30);
            
            const character = gameApp.tutorialManager.tutorialCharacter;
            expect(character.energy).toBe(Math.min(100, energyBefore + 30));
        });

        test('should complete Turn 5 - Media Day', () => {
            // Complete turns 1-4
            gameApp.tutorialManager.performTutorialTraining('speed');
            gameApp.tutorialManager.performTutorialTraining('stamina');
            gameApp.tutorialManager.performTutorialTraining('power');
            gameApp.tutorialManager.performTutorialTraining('rest');
            
            // Perform media day
            const result = gameApp.tutorialManager.performTutorialTraining('media');
            expect(result.success).toBe(true);
            expect(result.type).toBe('media');
            expect(result.energyChange).toBe(15);
            
            // Should be ready for race
            expect(gameApp.tutorialManager.tutorialStep).toBe(5);
        });

        test('should reject incorrect training choices', () => {
            // Try to select wrong training for turn 1 (should be speed)
            const validation = gameApp.tutorialManager.validateTrainingChoice('2'); // stamina
            expect(validation.valid).toBe(false);
            expect(validation.expectedType).toBe('speed');
            expect(validation.message).toContain('Please select Speed Training (1)');
        });
    });

    describe('Tutorial Race', () => {
        beforeEach(() => {
            // Complete all 5 training turns
            gameApp.stateMachine.transitionTo('tutorial');
            gameApp.tutorialManager.startTutorial();
            gameApp.stateMachine.transitionTo('tutorial_training');
            
            gameApp.tutorialManager.performTutorialTraining('speed');
            gameApp.tutorialManager.performTutorialTraining('stamina');
            gameApp.tutorialManager.performTutorialTraining('power');
            gameApp.tutorialManager.performTutorialTraining('rest');
            gameApp.tutorialManager.performTutorialTraining('media');
        });

        test('should transition to tutorial_race after 5 turns', () => {
            expect(gameApp.tutorialManager.tutorialStep).toBe(5);
            
            // Get next instruction
            const instruction = gameApp.tutorialManager.getNextInstruction();
            expect(instruction.action).toBe('race');
            expect(instruction.message).toContain('Time for your first race');
            
            // Transition to race
            gameApp.stateMachine.transitionTo('tutorial_race');
            expect(gameApp.stateMachine.getCurrentState()).toBe('tutorial_race');
        });

        test('should run tutorial race with scripted victory', () => {
            const raceResult = gameApp.tutorialManager.runTutorialRace();
            
            expect(raceResult.success).toBe(true);
            expect(raceResult.raceInfo.name).toBe('Tutorial Sprint Cup');
            expect(raceResult.raceInfo.distance).toBe('1000m');
            expect(raceResult.raceInfo.type).toBe('SPRINT');
            
            // Check player won
            expect(raceResult.playerResult.position).toBe(1);
            expect(raceResult.playerResult.margin).toBe('Won by a neck');
            expect(raceResult.playerResult.prize).toBe(1500);
            
            // Check race results
            expect(raceResult.results).toHaveLength(3);
            expect(raceResult.results[0].name).toBe('Tutorial Star');
            expect(raceResult.results[0].position).toBe(1);
        });

        test('should mark tutorial as complete after race', () => {
            gameApp.tutorialManager.runTutorialRace();
            
            expect(gameApp.tutorialManager.tutorialComplete).toBe(true);
            
            // Get completion summary
            const summary = gameApp.tutorialManager.getTutorialSummary();
            expect(summary.completed).toBe(true);
            expect(summary.character.name).toBe('Tutorial Star');
            expect(summary.achievements).toContain('✅ Won your first race');
        });
    });

    describe('Tutorial Completion', () => {
        beforeEach(() => {
            // Complete entire tutorial
            gameApp.stateMachine.transitionTo('tutorial');
            gameApp.tutorialManager.startTutorial();
            gameApp.stateMachine.transitionTo('tutorial_training');
            
            // Complete all training
            gameApp.tutorialManager.performTutorialTraining('speed');
            gameApp.tutorialManager.performTutorialTraining('stamina');
            gameApp.tutorialManager.performTutorialTraining('power');
            gameApp.tutorialManager.performTutorialTraining('rest');
            gameApp.tutorialManager.performTutorialTraining('media');
            
            // Run race
            gameApp.tutorialManager.runTutorialRace();
        });

        test('should display completion screen', () => {
            gameApp.stateMachine.transitionTo('tutorial_complete');
            gameApp.render();
            
            const output = consoleOutput.join('\n');
            expect(output).toContain('TUTORIAL COMPLETE');
            expect(output).toContain('Congratulations');
            expect(output).toContain('Speed: 33');
            expect(output).toContain('Stamina: 31');
            expect(output).toContain('Power: 32');
        });

        test('should offer career or menu options', () => {
            gameApp.stateMachine.transitionTo('tutorial_complete');
            gameApp.render();
            
            const output = consoleOutput.join('\n');
            expect(output).toContain('1. Start New Career');
            expect(output).toContain('2. Return to Main Menu');
        });

        test('should transition to career after tutorial', () => {
            gameApp.stateMachine.transitionTo('tutorial_complete');
            
            // Choose option 1 (start career)
            const result = gameApp.stateMachine.handleInput('1');
            expect(result.success).toBe(true);
            
            expect(gameApp.stateMachine.getCurrentState()).toBe('character_creation');
        });

        test('should return to main menu if chosen', () => {
            gameApp.stateMachine.transitionTo('tutorial_complete');
            
            // Choose option 2 (main menu)
            const result = gameApp.stateMachine.handleInput('2');
            expect(result.success).toBe(true);
            
            expect(gameApp.stateMachine.getCurrentState()).toBe('main_menu');
        });
    });

    describe('Tutorial Manager Integration', () => {
        test('should check if tutorial is active', () => {
            expect(gameApp.tutorialManager.isTutorialActive()).toBe(false);
            
            gameApp.tutorialMode = true;
            gameApp.tutorialManager.startTutorial();
            expect(gameApp.tutorialManager.isTutorialActive()).toBe(true);
            
            gameApp.tutorialManager.tutorialComplete = true;
            expect(gameApp.tutorialManager.isTutorialActive()).toBe(false);
        });

        test('should properly end tutorial and clean up', () => {
            gameApp.tutorialManager.startTutorial();
            gameApp.tutorialMode = true;
            
            const result = gameApp.tutorialManager.endTutorial();
            expect(result.success).toBe(true);
            
            expect(gameApp.tutorialMode).toBe(false);
            expect(gameApp.tutorialManager.tutorialStep).toBe(0);
            expect(gameApp.tutorialManager.tutorialComplete).toBe(false);
            expect(gameApp.tutorialManager.tutorialCharacter).toBeNull();
        });

        test('should get tutorial progress', () => {
            gameApp.tutorialManager.startTutorial();
            
            const progress = gameApp.tutorialManager.getTutorialProgress();
            expect(progress.step).toBe(0);
            expect(progress.totalSteps).toBe(6);
            expect(progress.completed).toBe(false);
            
            // Complete some training
            gameApp.tutorialManager.performTutorialTraining('speed');
            gameApp.tutorialManager.performTutorialTraining('stamina');
            
            const newProgress = gameApp.tutorialManager.getTutorialProgress();
            expect(newProgress.step).toBe(2);
        });

        test('should provide tutorial help', () => {
            const help = gameApp.tutorialManager.showTutorialHelp();
            
            expect(help.title).toBe('🎓 Tutorial Help');
            expect(help.content).toContain('5 Training Turns');
            expect(help.content).toContain('Speed Training');
            expect(help.content).toContain('Energy management');
        });
    });

    describe('Trainer Dialogue Integration', () => {
        test('should get trainer advice for tutorial steps', () => {
            gameApp.tutorialManager.startTutorial();
            
            // Turn 1 should have speed trainer advice
            const advice1 = gameApp.tutorialManager.getTrainerAdviceForStep(1);
            expect(advice1).toBeDefined();
            expect(advice1.specialty).toBe('speed');
            
            // Turn 2 should have stamina trainer advice
            const advice2 = gameApp.tutorialManager.getTrainerAdviceForStep(2);
            expect(advice2.specialty).toBe('stamina');
            
            // Turn 3 should have power trainer advice
            const advice3 = gameApp.tutorialManager.getTrainerAdviceForStep(3);
            expect(advice3.specialty).toBe('power');
            
            // Turn 4 (rest) should have no trainer advice
            const advice4 = gameApp.tutorialManager.getTrainerAdviceForStep(4);
            expect(advice4).toBeNull();
        });

        test('should get stable manager dialogue', () => {
            gameApp.tutorialManager.startTutorial();
            
            for (let i = 0; i <= 6; i++) {
                const dialogue = gameApp.tutorialManager.getStableManagerDialogue(i);
                
                if (dialogue) {
                    expect(dialogue.name).toBe('Alex Morgan');
                    expect(dialogue.title).toBe('Stable Manager');
                    expect(dialogue.emoji).toBe('👥');
                    expect(dialogue.message).toBeTruthy();
                }
            }
        });
    });
});