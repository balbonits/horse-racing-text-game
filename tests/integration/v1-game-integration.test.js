/**
 * Integration Tests for v1.0 Game Features
 * 
 * Tests the complete integration of all v1.0 systems into the main game loop:
 * - Legal startup sequence
 * - Stable owner account system  
 * - Enhanced character creation with breeding
 * - Trainer system integration
 * - Name generation throughout
 * - Save/load with v1.0 data structures
 */

const GameV1 = require('../../src/GameV1');
const StableOwner = require('../../src/models/management/StableOwner');
const NameGenerator = require('../../src/systems/generation/NameGenerator');
const TrainerDialog = require('../../src/ui/components/TrainerDialog');
const BlessedAdapter = require('../../src/ui/adapters/BlessedAdapter');

describe('v1.0 Game Integration Tests', () => {
    let game;
    let mockUI;

    beforeEach(() => {
        mockUI = {
            showLegalDisclaimer: jest.fn().mockResolvedValue({ accepted: true }),
            showOwnerCreation: jest.fn().mockResolvedValue({
                ownerName: 'Test Owner',
                stableName: 'Test Stables',
                philosophy: 'balanced'
            }),
            showTrainerDialog: jest.fn(),
            createScreen: jest.fn(),
            render: jest.fn(),
            cleanup: jest.fn(),
            isInitialized: false,
            // Add component management methods for trainer dialog
            registerComponent: jest.fn(),
            getComponent: jest.fn(),
            destroyComponent: jest.fn()
        };
        
        game = new GameV1(mockUI);
    });

    afterEach(() => {
        if (game) {
            game.cleanup();
        }
    });

    describe('Legal Startup Sequence', () => {
        test('should require legal disclaimer acceptance to proceed', async () => {
            mockUI.showLegalDisclaimer.mockResolvedValue({ accepted: false });
            
            const result = await game.initialize();
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Legal disclaimer not accepted');
            expect(mockUI.showLegalDisclaimer).toHaveBeenCalled();
        });

        test('should proceed with game initialization after legal acceptance', async () => {
            const result = await game.initialize();
            
            expect(result.success).toBe(true);
            expect(mockUI.showLegalDisclaimer).toHaveBeenCalled();
            expect(mockUI.showOwnerCreation).toHaveBeenCalled();
        });

        test('should create stable owner account after legal acceptance', async () => {
            await game.initialize();
            
            expect(game.stableOwner).toBeDefined();
            expect(game.stableOwner.profile.name).toBe('Test Owner');
            expect(game.stableOwner.profile.stableName).toBe('Test Stables');
        });
    });

    describe('Stable Owner Integration', () => {
        beforeEach(async () => {
            await game.initialize();
        });

        test('should create stable owner with default starting resources', () => {
            const owner = game.stableOwner;
            
            expect(owner.financial.cash).toBe(50000);
            expect(owner.facilities.stalls).toBe(10);
            expect(owner.staff.trainers).toBe(1);
            expect(owner.profile.reputation).toBe(0);
        });

        test('should track stable owner reputation from race results', () => {
            const initialReputation = game.stableOwner.profile.reputation;
            
            // Simulate race win
            game.stableOwner.recordRaceWin({
                name: 'Test Stakes',
                grade: 1,
                purse: 10000
            }, {
                name: 'Test Horse'
            });
            
            expect(game.stableOwner.profile.reputation).toBeGreaterThan(initialReputation);
        });

        test('should manage stable finances through race earnings', () => {
            const initialCash = game.stableOwner.financial.cash;
            
            game.stableOwner.addEarnings(5000, 'prize_money');
            
            expect(game.stableOwner.financial.cash).toBe(initialCash + 5000);
            expect(game.stableOwner.financial.prizeMoneyEarned).toBe(5000);
        });
    });

    describe('Enhanced Character Creation Integration', () => {
        beforeEach(async () => {
            await game.initialize();
        });

        test('should support random horse generation with v1.0 features', () => {
            const horse = game.createRandomHorse();
            
            expect(horse.breed).toBeDefined();
            expect(horse.specialization).toBeDefined();
            expect(horse.racingStyle).toBeDefined();
            expect(horse.gender).toBeDefined();
            expect(horse.pedigree).toBeDefined();
        });

        test('should generate horses with realistic stat variations', () => {
            const horses = [];
            for (let i = 0; i < 10; i++) {
                horses.push(game.createRandomHorse());
            }
            
            // Verify stat variation exists
            const speedStats = horses.map(h => h.stats.speed);
            const uniqueSpeeds = new Set(speedStats).size;
            expect(uniqueSpeeds).toBeGreaterThan(5); // Should have variety
            
            // All stats should be in valid range
            horses.forEach(horse => {
                expect(horse.stats.speed).toBeGreaterThanOrEqual(1);
                expect(horse.stats.speed).toBeLessThanOrEqual(100);
                expect(horse.stats.stamina).toBeGreaterThanOrEqual(1);
                expect(horse.stats.stamina).toBeLessThanOrEqual(100);
                expect(horse.stats.power).toBeGreaterThanOrEqual(1);
                expect(horse.stats.power).toBeLessThanOrEqual(100);
            });
        });

        test('should use name generation for all created horses', () => {
            const horse = game.createRandomHorse();
            
            expect(horse.name).toBeDefined();
            expect(typeof horse.name).toBe('string');
            expect(horse.name.length).toBeGreaterThan(3);
            
            // Should not contain copyrighted names
            const copyrightedNames = ['Secretariat', 'Man o\' War', 'Seabiscuit'];
            copyrightedNames.forEach(name => {
                expect(horse.name.toLowerCase()).not.toBe(name.toLowerCase());
            });
        });
    });

    describe('Trainer System Integration', () => {
        beforeEach(async () => {
            await game.initialize();
            game.currentHorse = game.createRandomHorse();
        });

        test('should provide trainer interactions during training', () => {
            const trainer = game.getTrainer('speed');
            
            expect(trainer).toBeDefined();
            expect(trainer.name).toBe('Coach Johnson');
            expect(trainer.specialty).toBe('speed');
        });

        test('should show pre-training dialog from appropriate trainer', () => {
            const horse = game.currentHorse;
            const preTrainingMessage = game.getPreTrainingDialog('speed', horse);
            
            expect(preTrainingMessage).toBeDefined();
            expect(typeof preTrainingMessage).toBe('string');
            expect(preTrainingMessage.toLowerCase()).toContain('speed');
        });

        test('should provide post-training feedback based on results', () => {
            const horse = game.currentHorse;
            const trainingResult = {
                statType: 'speed',
                previousValue: 45,
                newValue: 48,
                improvement: 3
            };
            
            const feedback = game.getPostTrainingDialog('speed', trainingResult);
            
            expect(feedback).toBeDefined();
            expect(typeof feedback).toBe('string');
            expect(feedback.length).toBeGreaterThan(20);
        });

        test('should track trainer-horse relationships over time', () => {
            const horse = game.currentHorse;
            const trainer = game.getTrainer('stamina');
            
            // Initial relationship
            expect(game.getTrainerRelationship(trainer.name, horse.name)).toBe('new');
            
            // After training sessions
            for (let i = 0; i < 3; i++) {
                game.recordTrainerSession(trainer.name, horse.name);
            }
            
            expect(game.getTrainerRelationship(trainer.name, horse.name)).toBe('familiar');
        });
    });

    describe('Name Generation Integration', () => {
        beforeEach(async () => {
            await game.initialize();
        });

        test('should use name generation for races', () => {
            const race = game.generateRace('1600m', 'dirt');
            
            expect(race.name).toBeDefined();
            expect(typeof race.name).toBe('string');
            expect(race.trackName).toBeDefined();
            
            // Should not use copyrighted race names
            const copyrightedRaces = ['Kentucky Derby', 'Preakness Stakes', 'Belmont Stakes'];
            copyrightedRaces.forEach(name => {
                expect(race.name.toLowerCase()).not.toBe(name.toLowerCase());
            });
        });

        test('should generate unique names across game session', () => {
            const horses = [];
            const races = [];
            
            for (let i = 0; i < 5; i++) {
                horses.push(game.createRandomHorse());
                races.push(game.generateRace('1600m', 'dirt'));
            }
            
            // Horse names should be unique
            const horseNames = horses.map(h => h.name);
            expect(new Set(horseNames).size).toBe(horseNames.length);
            
            // Race names should be unique  
            const raceNames = races.map(r => r.name);
            expect(new Set(raceNames).size).toBe(raceNames.length);
        });

        test('should maintain name generation state across save/load', () => {
            const horse1 = game.createRandomHorse();
            const saveData = game.save();
            
            // Create new game instance and load
            const newGame = new GameV1(mockUI);
            newGame.load(saveData);
            
            const horse2 = newGame.createRandomHorse();
            
            // Names should be different (uniqueness preserved)
            expect(horse1.name).not.toBe(horse2.name);
        });
    });

    describe('Save/Load v1.0 Integration', () => {
        beforeEach(async () => {
            await game.initialize();
            game.currentHorse = game.createRandomHorse();
        });

        test('should save all v1.0 data structures', () => {
            const saveData = game.save();
            
            expect(saveData.version).toBe('1.0');
            expect(saveData.stableOwner).toBeDefined();
            expect(saveData.currentHorse).toBeDefined();
            expect(saveData.nameGenerator).toBeDefined();
            expect(saveData.trainerRelationships).toBeDefined();
        });

        test('should restore stable owner data correctly', () => {
            // Modify stable owner state
            game.stableOwner.addEarnings(10000, 'prize_money');
            game.stableOwner.addReputation(50, 'race_win');
            
            const originalCash = game.stableOwner.financial.cash;
            const originalReputation = game.stableOwner.profile.reputation;
            
            // Save and load
            const saveData = game.save();
            const newGame = new GameV1(mockUI);
            newGame.load(saveData);
            
            expect(newGame.stableOwner.financial.cash).toBe(originalCash);
            expect(newGame.stableOwner.profile.reputation).toBe(originalReputation);
        });

        test('should preserve horse breeding data across save/load', () => {
            const originalHorse = game.currentHorse;
            
            // Save and load
            const saveData = game.save();
            const newGame = new GameV1(mockUI);
            newGame.load(saveData);
            
            expect(newGame.currentHorse.breed).toBe(originalHorse.breed);
            expect(newGame.currentHorse.gender).toBe(originalHorse.gender);
            expect(newGame.currentHorse.specialization).toBe(originalHorse.specialization);
            expect(newGame.currentHorse.pedigree).toEqual(originalHorse.pedigree);
        });

        test('should maintain trainer relationships across save/load', () => {
            const trainer = game.getTrainer('power');
            const horse = game.currentHorse;
            
            // Build relationship
            for (let i = 0; i < 5; i++) {
                game.recordTrainerSession(trainer.name, horse.name);
            }
            
            const originalRelationship = game.getTrainerRelationship(trainer.name, horse.name);
            
            // Save and load
            const saveData = game.save();
            const newGame = new GameV1(mockUI);
            newGame.load(saveData);
            
            const restoredRelationship = newGame.getTrainerRelationship(trainer.name, horse.name);
            expect(restoredRelationship).toBe(originalRelationship);
        });
    });

    describe('Complete Game Flow Integration', () => {
        test('should support complete career flow with v1.0 features', async () => {
            await game.initialize();
            
            // Should be able to create horse
            const horse = game.createRandomHorse();
            expect(horse).toBeDefined();
            
            // Should be able to interact with trainers
            const trainer = game.getTrainer('speed');
            const preMessage = game.getPreTrainingDialog('speed', horse);
            expect(preMessage).toBeDefined();
            
            // Should be able to run training with trainer feedback
            const trainingResult = game.simulateTraining(horse, 'speed');
            const postMessage = game.getPostTrainingDialog('speed', trainingResult);
            expect(postMessage).toBeDefined();
            
            // Should be able to generate races with legal names
            const race = game.generateRace('1600m', 'dirt');
            expect(race.name).toBeDefined();
            
            // Should be able to save complete game state
            const saveData = game.save();
            expect(saveData.version).toBe('1.0');
        });
    });
});