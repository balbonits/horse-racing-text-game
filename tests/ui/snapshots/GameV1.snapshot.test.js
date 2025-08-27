/**
 * Snapshot Tests for GameV1 Integration UI Flows
 * 
 * Tests the complete game UI flows and interactions to ensure
 * consistent user experience across the v1.0 integration.
 */

const GameV1 = require('../../../src/GameV1');

// Mock blessed to prevent actual terminal output
jest.mock('blessed', () => ({
    screen: jest.fn(() => ({
        key: jest.fn(),
        append: jest.fn(),
        render: jest.fn(),
        destroy: jest.fn(),
        width: 80,
        height: 24
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
    }))
}));

describe('GameV1 Integration UI Snapshots', () => {
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
            createScreen: jest.fn(),
            cleanup: jest.fn(),
            isInitialized: false,
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

    describe('Game Status Snapshots', () => {
        test('should capture initial game status before initialization', () => {
            const status = game.getGameStatus();
            
            expect({
                gameStatus: status,
                isReady: game.isReady(),
                version: game.getVersion()
            }).toMatchSnapshot('initial-game-status');
        });

        test('should capture game status after initialization', async () => {
            await game.initialize();
            const status = game.getGameStatus();
            
            expect({
                gameStatus: status,
                isReady: game.isReady(),
                version: game.getVersion(),
                stableOwnerPresent: !!game.stableOwner,
                trainerDialogPresent: !!game.trainerDialog
            }).toMatchSnapshot('initialized-game-status');
        });

        test('should capture game status with current horse', async () => {
            await game.initialize();
            game.currentHorse = game.createRandomHorse();
            
            const status = game.getGameStatus();
            
            expect({
                gameStatus: status,
                currentHorse: {
                    name: game.currentHorse.name,
                    breed: game.currentHorse.breed,
                    stats: game.currentHorse.stats,
                    specialization: game.currentHorse.specialization
                }
            }).toMatchSnapshot('game-status-with-horse');
        });
    });

    describe('Horse Creation Snapshots', () => {
        beforeEach(async () => {
            await game.initialize();
        });

        test('should capture random horse creation results', () => {
            // Create multiple horses to show variation
            const horses = [];
            for (let i = 0; i < 5; i++) {
                horses.push(game.createRandomHorse());
            }
            
            const horseSnapshots = horses.map(horse => ({
                name: horse.name,
                breed: horse.breed,
                specialization: horse.specialization,
                racingStyle: horse.racingStyle,
                gender: horse.gender,
                stats: horse.stats
            }));
            
            expect(horseSnapshots).toMatchSnapshot('random-horse-creation-batch');
        });

        test('should capture horse serialization format', () => {
            const horse = game.createRandomHorse();
            const serialized = game.serializeHorse(horse);
            
            expect({
                originalHorse: {
                    name: horse.name,
                    stats: horse.stats,
                    breed: horse.breed,
                    specialization: horse.specialization,
                    racingStyle: horse.racingStyle,
                    gender: horse.gender
                },
                serializedFormat: serialized
            }).toMatchSnapshot('horse-serialization-format');
        });
    });

    describe('Trainer Integration Snapshots', () => {
        beforeEach(async () => {
            await game.initialize();
            game.currentHorse = game.createRandomHorse();
        });

        test('should capture complete trainer interaction flow', () => {
            const horse = game.currentHorse;
            const trainers = ['speed', 'stamina', 'power'];
            
            const trainerInteractions = trainers.map(specialty => {
                const trainer = game.getTrainer(specialty);
                const preMessage = game.getPreTrainingDialog(specialty, horse);
                
                // Simulate training
                const initialStat = horse.stats[specialty];
                const trainingResult = game.simulateTraining(horse, specialty);
                const postMessage = game.getPostTrainingDialog(specialty, trainingResult);
                
                return {
                    specialty,
                    trainer: trainer ? {
                        name: trainer.name,
                        specialty: trainer.specialty,
                        personality: trainer.personality.traits
                    } : null,
                    horse: {
                        name: horse.name,
                        initialStat: initialStat,
                        currentStat: horse.stats[specialty]
                    },
                    preMessage,
                    trainingResult,
                    postMessage
                };
            });
            
            expect(trainerInteractions).toMatchSnapshot('complete-trainer-interaction-flow');
        });

        test('should capture trainer relationship tracking', () => {
            const horse = game.currentHorse;
            const trainer = game.getTrainer('speed');
            
            const relationshipProgression = [];
            
            // Initial relationship
            relationshipProgression.push({
                sessions: 0,
                relationship: game.getTrainerRelationship(trainer.name, horse.name)
            });
            
            // Record several sessions
            for (let i = 1; i <= 5; i++) {
                game.recordTrainerSession(trainer.name, horse.name);
                relationshipProgression.push({
                    sessions: i,
                    relationship: game.getTrainerRelationship(trainer.name, horse.name)
                });
            }
            
            expect({
                trainer: trainer.name,
                horse: horse.name,
                progression: relationshipProgression
            }).toMatchSnapshot('trainer-relationship-tracking');
        });
    });

    describe('Name Generation Integration Snapshots', () => {
        beforeEach(async () => {
            await game.initialize();
        });

        test('should capture race generation with names', () => {
            const races = [
                game.generateRace('1200m', 'dirt'),
                game.generateRace('1600m', 'turf'),
                game.generateRace('2000m', 'dirt'),
                game.generateRace('2400m', 'turf')
            ];
            
            const raceSnapshots = races.map(race => ({
                name: race.name,
                trackName: race.trackName,
                distance: race.distance,
                surface: race.surface
            }));
            
            expect(raceSnapshots).toMatchSnapshot('generated-race-names');
        });

        test('should capture name uniqueness across session', () => {
            const horses = [];
            const races = [];
            
            for (let i = 0; i < 10; i++) {
                horses.push(game.createRandomHorse());
                races.push(game.generateRace('1600m', 'dirt'));
            }
            
            const horseNames = horses.map(h => h.name);
            const raceNames = races.map(r => r.name);
            const trackNames = races.map(r => r.trackName);
            
            expect({
                horseNames: {
                    names: horseNames,
                    uniqueCount: new Set(horseNames).size,
                    totalCount: horseNames.length
                },
                raceNames: {
                    names: raceNames,
                    uniqueCount: new Set(raceNames).size,
                    totalCount: raceNames.length
                },
                trackNames: {
                    names: trackNames,
                    uniqueCount: new Set(trackNames).size,
                    totalCount: trackNames.length
                }
            }).toMatchSnapshot('name-generation-uniqueness');
        });
    });

    describe('Save/Load Integration Snapshots', () => {
        beforeEach(async () => {
            await game.initialize();
            game.currentHorse = game.createRandomHorse();
        });

        test('should capture save data structure', () => {
            // Set up some game state
            game.currentTurn = 5;
            game.raceHistory = [
                { name: 'Test Race 1', result: 'won' },
                { name: 'Test Race 2', result: 'placed' }
            ];
            
            // Build trainer relationships
            const trainer = game.getTrainer('speed');
            for (let i = 0; i < 3; i++) {
                game.recordTrainerSession(trainer.name, game.currentHorse.name);
            }
            
            const saveData = game.save();
            
            expect({
                saveStructure: {
                    version: saveData.version,
                    timestamp: saveData.timestamp ? 'present' : 'missing',
                    stableOwner: saveData.stableOwner ? 'present' : 'missing',
                    currentHorse: saveData.currentHorse ? 'present' : 'missing',
                    nameGenerator: saveData.nameGenerator ? 'present' : 'missing',
                    trainerRelationships: saveData.trainerRelationships ? 'present' : 'missing',
                    gameState: saveData.gameState
                },
                stableOwnerData: saveData.stableOwner ? {
                    profile: saveData.stableOwner.profile,
                    financial: saveData.stableOwner.financial
                } : null,
                currentHorseData: saveData.currentHorse,
                trainerRelationshipsData: saveData.trainerRelationships
            }).toMatchSnapshot('save-data-structure');
        });

        test('should capture load restoration accuracy', () => {
            // Save original state
            const originalState = {
                stableOwnerName: game.stableOwner.profile.name,
                stableOwnerCash: game.stableOwner.financial.cash,
                horseName: game.currentHorse.name,
                horseStats: game.currentHorse.stats
            };
            
            const saveData = game.save();
            
            // Create new game and load
            const newGame = new GameV1(mockUI);
            const loadResult = newGame.load(saveData);
            
            const restoredState = {
                loadSuccessful: loadResult,
                stableOwnerName: newGame.stableOwner?.profile.name,
                stableOwnerCash: newGame.stableOwner?.financial.cash,
                horseName: newGame.currentHorse?.name,
                horseStats: newGame.currentHorse?.stats
            };
            
            expect({
                originalState,
                restoredState,
                dataMatches: {
                    stableOwnerName: originalState.stableOwnerName === restoredState.stableOwnerName,
                    stableOwnerCash: originalState.stableOwnerCash === restoredState.stableOwnerCash,
                    horseName: originalState.horseName === restoredState.horseName,
                    horseStatsMatch: JSON.stringify(originalState.horseStats) === JSON.stringify(restoredState.horseStats)
                }
            }).toMatchSnapshot('save-load-restoration-accuracy');
        });
    });

    describe('Error Handling Snapshots', () => {
        test('should capture initialization failure states', async () => {
            // Test with failing legal disclaimer
            mockUI.showLegalDisclaimer.mockResolvedValue({ accepted: false });
            
            const failedGame = new GameV1(mockUI);
            const result = await failedGame.initialize();
            
            expect({
                initializationResult: result,
                gameReady: failedGame.isReady(),
                stableOwnerPresent: !!failedGame.stableOwner
            }).toMatchSnapshot('initialization-failure-state');
        });

        test('should capture fallback behaviors', async () => {
            await game.initialize();
            
            const fallbackBehaviors = {
                invalidTraining: (() => {
                    try {
                        return game.simulateTraining(null, 'speed');
                    } catch (error) {
                        return { error: error.message };
                    }
                })(),
                invalidStatType: (() => {
                    try {
                        const horse = game.createRandomHorse();
                        return game.simulateTraining(horse, 'invalid');
                    } catch (error) {
                        return { error: error.message };
                    }
                })(),
                missingTrainer: game.getTrainer('invalid'),
                missingHorseDialog: game.getPreTrainingDialog('speed', null)
            };
            
            expect(fallbackBehaviors).toMatchSnapshot('error-fallback-behaviors');
        });
    });
});