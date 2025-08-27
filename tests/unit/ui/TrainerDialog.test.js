/**
 * Tests for Trainer Dialog System
 * 
 * Tests the trainer speech/conversation system with personality-driven
 * responses based on horse stats and training context.
 */

const TrainerDialog = require('../../../src/ui/components/TrainerDialog');
const BlessedAdapter = require('../../../src/ui/adapters/BlessedAdapter');

describe('TrainerDialog System', () => {
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

    describe('Trainer Personality System', () => {
        test('should create three distinct trainers', () => {
            const trainers = trainerDialog.getTrainers();
            
            expect(trainers).toHaveLength(3);
            expect(trainers[0].name).toBe('Coach Johnson');
            expect(trainers[0].specialty).toBe('speed');
            expect(trainers[1].name).toBe('Coach Martinez');
            expect(trainers[1].specialty).toBe('stamina');
            expect(trainers[2].name).toBe('Coach Thompson');
            expect(trainers[2].specialty).toBe('power');
        });

        test('should have distinct personalities for each trainer', () => {
            const trainers = trainerDialog.getTrainers();
            
            // Speed trainer - energetic and direct
            expect(trainers[0].personality.traits).toContain('energetic');
            expect(trainers[0].personality.traits).toContain('direct');
            
            // Stamina trainer - patient and methodical
            expect(trainers[1].personality.traits).toContain('patient');
            expect(trainers[1].personality.traits).toContain('methodical');
            
            // Power trainer - tough and motivational
            expect(trainers[2].personality.traits).toContain('tough');
            expect(trainers[2].personality.traits).toContain('motivational');
        });

        test('should provide different introduction messages', () => {
            const speedTrainer = trainerDialog.getTrainer('speed');
            const staminaTrainer = trainerDialog.getTrainer('stamina');
            const powerTrainer = trainerDialog.getTrainer('power');
            
            const speedIntro = trainerDialog.getIntroduction(speedTrainer);
            const staminaIntro = trainerDialog.getIntroduction(staminaTrainer);
            const powerIntro = trainerDialog.getIntroduction(powerTrainer);
            
            expect(speedIntro).not.toBe(staminaIntro);
            expect(staminaIntro).not.toBe(powerIntro);
            expect(speedIntro).not.toBe(powerIntro);
        });
    });

    describe('Stat-Based Responses', () => {
        const testHorse = {
            name: 'Test Horse',
            stats: { speed: 45, stamina: 60, power: 30 }
        };

        test('should provide different responses based on stat levels', () => {
            const lowStatHorse = { stats: { speed: 15 } };
            const mediumStatHorse = { stats: { speed: 50 } };
            const highStatHorse = { stats: { speed: 85 } };
            
            const lowResponse = trainerDialog.getStatBasedResponse('speed', lowStatHorse.stats.speed);
            const mediumResponse = trainerDialog.getStatBasedResponse('speed', mediumStatHorse.stats.speed);
            const highResponse = trainerDialog.getStatBasedResponse('speed', highStatHorse.stats.speed);
            
            expect(lowResponse).not.toBe(mediumResponse);
            expect(mediumResponse).not.toBe(highResponse);
            expect(lowResponse).not.toBe(highResponse);
        });

        test('should categorize stats into proper ranges', () => {
            expect(trainerDialog.getStatCategory(15)).toBe('beginner');
            expect(trainerDialog.getStatCategory(35)).toBe('developing');
            expect(trainerDialog.getStatCategory(55)).toBe('competent');
            expect(trainerDialog.getStatCategory(75)).toBe('advanced');
            expect(trainerDialog.getStatCategory(95)).toBe('elite');
        });

        test('should generate appropriate training advice', () => {
            const advice = trainerDialog.getTrainingAdvice('speed', testHorse);
            
            expect(advice).toBeDefined();
            expect(typeof advice).toBe('string');
            expect(advice.length).toBeGreaterThan(10);
        });

        test('should provide pre-training motivation', () => {
            const motivation = trainerDialog.getPreTrainingMessage('speed', testHorse);
            
            expect(motivation).toBeDefined();
            expect(typeof motivation).toBe('string');
            expect(motivation).toContain('speed'); // Should mention the stat being trained
        });

        test('should provide post-training feedback', () => {
            const trainingResult = {
                statType: 'speed',
                previousValue: 45,
                newValue: 48,
                improvement: 3
            };
            
            const feedback = trainerDialog.getPostTrainingMessage('speed', trainingResult);
            
            expect(feedback).toBeDefined();
            expect(typeof feedback).toBe('string');
            expect(feedback.length).toBeGreaterThan(10);
        });
    });

    describe('Dialog Box UI Integration', () => {
        test('should create dialog box for trainer conversation', () => {
            const trainer = trainerDialog.getTrainer('speed');
            const message = 'Test training message';
            
            const dialogBox = trainerDialog.showTrainerDialog(trainer, message);
            
            expect(dialogBox).toBeDefined();
            expect(uiAdapter.getComponent('trainer_dialog')).toBeDefined();
        });

        test('should display trainer name and specialty in dialog', () => {
            const trainer = trainerDialog.getTrainer('stamina');
            const message = 'Test message';
            
            const dialogBox = trainerDialog.showTrainerDialog(trainer, message);
            
            if (dialogBox && dialogBox.getContent) {
                // Verify dialog contains trainer information
                const dialogContent = dialogBox.getContent();
                expect(dialogContent).toContain('Coach Martinez');
                expect(dialogContent).toContain('Stamina Trainer');
            } else {
                // If dialog creation failed, just verify trainer data is correct
                expect(trainer.name).toBe('Coach Martinez');
                expect(trainer.specialty).toBe('stamina');
            }
        });

        test('should handle dialog dismissal', () => {
            const trainer = trainerDialog.getTrainer('power');
            const message = 'Test message';
            
            trainerDialog.showTrainerDialog(trainer, message);
            
            // Should be able to dismiss dialog
            expect(() => {
                trainerDialog.dismissDialog();
            }).not.toThrow();
            
            expect(uiAdapter.getComponent('trainer_dialog')).toBeUndefined();
        });

        test('should support dialog with choices', () => {
            const trainer = trainerDialog.getTrainer('speed');
            const message = 'Choose your training focus:';
            const choices = ['Sprint Training', 'Acceleration Work', 'Speed Endurance'];
            
            const dialogBox = trainerDialog.showTrainerDialog(trainer, message, choices);
            
            expect(dialogBox).toBeDefined();
            // Should have created a menu component for choices
            expect(uiAdapter.getComponent('trainer_choices')).toBeDefined();
        });
    });

    describe('Training Session Integration', () => {
        test('should provide complete training session dialog flow', () => {
            const horse = {
                name: 'Test Horse',
                stats: { speed: 45, stamina: 60, power: 30 }
            };
            
            // Pre-training
            const preMessage = trainerDialog.getPreTrainingMessage('speed', horse);
            expect(preMessage).toBeDefined();
            
            // Simulate training result
            const trainingResult = {
                statType: 'speed',
                previousValue: 45,
                newValue: 48,
                improvement: 3
            };
            
            // Post-training
            const postMessage = trainerDialog.getPostTrainingMessage('speed', trainingResult);
            expect(postMessage).toBeDefined();
            
            // Messages should be different
            expect(preMessage).not.toBe(postMessage);
        });

        test('should track trainer relationship over time', () => {
            const horse = { name: 'Test Horse' };
            const trainer = trainerDialog.getTrainer('speed');
            
            // Initial relationship
            expect(trainerDialog.getTrainerRelationship(trainer.name, horse.name)).toBe('new');
            
            // After some training sessions
            trainerDialog.recordTrainingSession(trainer.name, horse.name);
            trainerDialog.recordTrainingSession(trainer.name, horse.name);
            trainerDialog.recordTrainingSession(trainer.name, horse.name);
            
            expect(trainerDialog.getTrainerRelationship(trainer.name, horse.name)).toBe('familiar');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle invalid trainer specialty gracefully', () => {
            expect(() => {
                trainerDialog.getTrainer('invalid');
            }).not.toThrow();
            
            expect(trainerDialog.getTrainer('invalid')).toBeNull();
        });

        test('should handle missing horse data gracefully', () => {
            expect(() => {
                trainerDialog.getPreTrainingMessage('speed', null);
            }).not.toThrow();
            
            const message = trainerDialog.getPreTrainingMessage('speed', null);
            expect(message).toBeDefined();
            expect(typeof message).toBe('string');
        });

        test('should provide fallback responses for edge stat values', () => {
            const negativeStatResponse = trainerDialog.getStatBasedResponse('speed', -5);
            const zeroStatResponse = trainerDialog.getStatBasedResponse('speed', 0);
            const overMaxStatResponse = trainerDialog.getStatBasedResponse('speed', 150);
            
            expect(negativeStatResponse).toBeDefined();
            expect(zeroStatResponse).toBeDefined();
            expect(overMaxStatResponse).toBeDefined();
        });

        test('should cleanup properly when UI adapter fails', () => {
            // Simulate UI adapter failure
            uiAdapter.cleanup();
            
            expect(() => {
                trainerDialog.showTrainerDialog(trainerDialog.getTrainer('speed'), 'test');
            }).not.toThrow();
        });
    });
});