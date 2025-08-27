/**
 * Snapshot Tests for Trainer Dialog UI Components
 * 
 * Tests the visual rendering of trainer dialog boxes, menus, and UI flows
 * to ensure consistent UI behavior across changes.
 */

const TrainerDialog = require('../../../src/ui/components/TrainerDialog');
const BlessedAdapter = require('../../../src/ui/adapters/BlessedAdapter');

// Mock blessed screen to prevent actual terminal output during tests
jest.mock('blessed', () => ({
    screen: jest.fn(() => ({
        key: jest.fn(),
        append: jest.fn(),
        render: jest.fn(),
        destroy: jest.fn()
    })),
    box: jest.fn((config) => ({
        ...config,
        setContent: jest.fn(),
        destroy: jest.fn(),
        getContent: jest.fn(() => config.content || ''),
        focus: jest.fn()
    })),
    list: jest.fn((config) => ({
        ...config,
        on: jest.fn(),
        focus: jest.fn(),
        destroy: jest.fn()
    })),
    textbox: jest.fn((config) => ({
        ...config,
        focus: jest.fn(),
        destroy: jest.fn()
    })),
    progressbar: jest.fn((config) => ({
        ...config,
        setProgress: jest.fn(),
        destroy: jest.fn()
    }))
}));

describe('TrainerDialog UI Snapshots', () => {
    let uiAdapter;
    let trainerDialog;

    beforeEach(() => {
        uiAdapter = new BlessedAdapter();
        uiAdapter.createScreen();
        trainerDialog = new TrainerDialog(uiAdapter);
    });

    afterEach(() => {
        if (uiAdapter) {
            uiAdapter.cleanup();
        }
    });

    describe('Trainer Introduction Dialogs', () => {
        test('should render Coach Johnson speed trainer introduction', () => {
            const speedTrainer = trainerDialog.getTrainer('speed');
            const introduction = trainerDialog.getIntroduction(speedTrainer);
            
            expect({
                trainerName: speedTrainer.name,
                specialty: speedTrainer.specialty,
                personality: speedTrainer.personality,
                introduction: introduction
            }).toMatchSnapshot('speed-trainer-introduction');
        });

        test('should render Coach Martinez stamina trainer introduction', () => {
            const staminaTrainer = trainerDialog.getTrainer('stamina');
            const introduction = trainerDialog.getIntroduction(staminaTrainer);
            
            expect({
                trainerName: staminaTrainer.name,
                specialty: staminaTrainer.specialty,
                personality: staminaTrainer.personality,
                introduction: introduction
            }).toMatchSnapshot('stamina-trainer-introduction');
        });

        test('should render Coach Thompson power trainer introduction', () => {
            const powerTrainer = trainerDialog.getTrainer('power');
            const introduction = trainerDialog.getIntroduction(powerTrainer);
            
            expect({
                trainerName: powerTrainer.name,
                specialty: powerTrainer.specialty,
                personality: powerTrainer.personality,
                introduction: introduction
            }).toMatchSnapshot('power-trainer-introduction');
        });
    });

    describe('Stat-Based Response Snapshots', () => {
        test('should render consistent responses for beginner level stats', () => {
            const responses = {
                speed: trainerDialog.getStatBasedResponse('speed', 15),
                stamina: trainerDialog.getStatBasedResponse('stamina', 20),
                power: trainerDialog.getStatBasedResponse('power', 18)
            };
            
            expect(responses).toMatchSnapshot('beginner-stat-responses');
        });

        test('should render consistent responses for developing level stats', () => {
            const responses = {
                speed: trainerDialog.getStatBasedResponse('speed', 35),
                stamina: trainerDialog.getStatBasedResponse('stamina', 38),
                power: trainerDialog.getStatBasedResponse('power', 32)
            };
            
            expect(responses).toMatchSnapshot('developing-stat-responses');
        });

        test('should render consistent responses for competent level stats', () => {
            const responses = {
                speed: trainerDialog.getStatBasedResponse('speed', 55),
                stamina: trainerDialog.getStatBasedResponse('stamina', 58),
                power: trainerDialog.getStatBasedResponse('power', 52)
            };
            
            expect(responses).toMatchSnapshot('competent-stat-responses');
        });

        test('should render consistent responses for advanced level stats', () => {
            const responses = {
                speed: trainerDialog.getStatBasedResponse('speed', 75),
                stamina: trainerDialog.getStatBasedResponse('stamina', 78),
                power: trainerDialog.getStatBasedResponse('power', 72)
            };
            
            expect(responses).toMatchSnapshot('advanced-stat-responses');
        });

        test('should render consistent responses for elite level stats', () => {
            const responses = {
                speed: trainerDialog.getStatBasedResponse('speed', 95),
                stamina: trainerDialog.getStatBasedResponse('stamina', 92),
                power: trainerDialog.getStatBasedResponse('power', 98)
            };
            
            expect(responses).toMatchSnapshot('elite-stat-responses');
        });
    });

    describe('Training Dialog Flow Snapshots', () => {
        const testHorse = {
            name: 'Thunder Runner',
            stats: { speed: 45, stamina: 55, power: 38 }
        };

        test('should render complete speed training dialog flow', () => {
            const trainer = trainerDialog.getTrainer('speed');
            const preMessage = trainerDialog.getPreTrainingMessage('speed', testHorse);
            
            const trainingResult = {
                statType: 'speed',
                previousValue: 45,
                newValue: 48,
                improvement: 3,
                success: true
            };
            
            const postMessage = trainerDialog.getPostTrainingMessage('speed', trainingResult);
            
            expect({
                trainer: {
                    name: trainer.name,
                    specialty: trainer.specialty
                },
                horse: testHorse,
                preTrainingMessage: preMessage,
                trainingResult: trainingResult,
                postTrainingMessage: postMessage
            }).toMatchSnapshot('speed-training-dialog-flow');
        });

        test('should render complete stamina training dialog flow', () => {
            const trainer = trainerDialog.getTrainer('stamina');
            const preMessage = trainerDialog.getPreTrainingMessage('stamina', testHorse);
            
            const trainingResult = {
                statType: 'stamina',
                previousValue: 55,
                newValue: 58,
                improvement: 3,
                success: true
            };
            
            const postMessage = trainerDialog.getPostTrainingMessage('stamina', trainingResult);
            
            expect({
                trainer: {
                    name: trainer.name,
                    specialty: trainer.specialty
                },
                horse: testHorse,
                preTrainingMessage: preMessage,
                trainingResult: trainingResult,
                postTrainingMessage: postMessage
            }).toMatchSnapshot('stamina-training-dialog-flow');
        });

        test('should render complete power training dialog flow', () => {
            const trainer = trainerDialog.getTrainer('power');
            const preMessage = trainerDialog.getPreTrainingMessage('power', testHorse);
            
            const trainingResult = {
                statType: 'power',
                previousValue: 38,
                newValue: 42,
                improvement: 4,
                success: true
            };
            
            const postMessage = trainerDialog.getPostTrainingMessage('power', trainingResult);
            
            expect({
                trainer: {
                    name: trainer.name,
                    specialty: trainer.specialty
                },
                horse: testHorse,
                preTrainingMessage: preMessage,
                trainingResult: trainingResult,
                postTrainingMessage: postMessage
            }).toMatchSnapshot('power-training-dialog-flow');
        });
    });

    describe('Trainer Relationship Progression Snapshots', () => {
        const testHorse = { name: 'Lightning Bolt' };

        test('should render relationship progression stages', () => {
            const trainer = trainerDialog.getTrainer('speed');
            
            // Initial relationship
            const initialRelationship = trainerDialog.getTrainerRelationship(trainer.name, testHorse.name);
            
            // After 1 session
            trainerDialog.recordTrainingSession(trainer.name, testHorse.name);
            const oneSessionRelationship = trainerDialog.getTrainerRelationship(trainer.name, testHorse.name);
            
            // After 3 sessions
            trainerDialog.recordTrainingSession(trainer.name, testHorse.name);
            trainerDialog.recordTrainingSession(trainer.name, testHorse.name);
            const threeSessionRelationship = trainerDialog.getTrainerRelationship(trainer.name, testHorse.name);
            
            // After 6 sessions
            trainerDialog.recordTrainingSession(trainer.name, testHorse.name);
            trainerDialog.recordTrainingSession(trainer.name, testHorse.name);
            trainerDialog.recordTrainingSession(trainer.name, testHorse.name);
            const sixSessionRelationship = trainerDialog.getTrainerRelationship(trainer.name, testHorse.name);
            
            expect({
                trainer: trainer.name,
                horse: testHorse.name,
                relationships: {
                    initial: initialRelationship,
                    oneSession: oneSessionRelationship,
                    threeSessions: threeSessionRelationship,
                    sixSessions: sixSessionRelationship
                }
            }).toMatchSnapshot('trainer-relationship-progression');
        });
    });

    describe('Dialog Configuration Snapshots', () => {
        test('should render trainer dialog box configuration', () => {
            const trainer = trainerDialog.getTrainer('speed');
            const message = 'Time for some speed work! Let\'s push those limits today.';
            
            // Create dialog box and capture its configuration
            const dialogBox = trainerDialog.showTrainerDialog(trainer, message);
            
            expect({
                trainerName: trainer.name,
                specialty: trainer.specialty,
                message: message,
                dialogConfig: dialogBox ? {
                    content: dialogBox.content,
                    title: dialogBox.title,
                    width: dialogBox.width,
                    height: dialogBox.height,
                    border: dialogBox.border,
                    style: dialogBox.style
                } : null
            }).toMatchSnapshot('trainer-dialog-box-config');
        });

        test('should render trainer choice menu configuration', () => {
            const trainer = trainerDialog.getTrainer('stamina');
            const message = 'What type of endurance training would you like?';
            const choices = ['Long Distance Run', 'Hill Training', 'Interval Work'];
            
            const dialogBox = trainerDialog.showTrainerDialog(trainer, message, choices);
            
            expect({
                trainerName: trainer.name,
                message: message,
                choices: choices,
                menuConfig: dialogBox ? {
                    items: choices,
                    width: dialogBox.width,
                    height: dialogBox.height,
                    style: dialogBox.style
                } : null
            }).toMatchSnapshot('trainer-choice-menu-config');
        });
    });

    describe('Error State Snapshots', () => {
        test('should render graceful fallback for missing trainer', () => {
            const response = trainerDialog.getTrainer('invalid');
            const fallbackMessage = trainerDialog.getPreTrainingMessage('invalid', null);
            
            expect({
                trainer: response,
                fallbackMessage: fallbackMessage
            }).toMatchSnapshot('missing-trainer-fallback');
        });

        test('should render fallback responses for edge cases', () => {
            const responses = {
                negativeStatResponse: trainerDialog.getStatBasedResponse('speed', -5),
                zeroStatResponse: trainerDialog.getStatBasedResponse('stamina', 0),
                overMaxStatResponse: trainerDialog.getStatBasedResponse('power', 150),
                nullHorseResponse: trainerDialog.getPreTrainingMessage('speed', null)
            };
            
            expect(responses).toMatchSnapshot('edge-case-fallback-responses');
        });
    });
});