/**
 * GameV1 - Main Game Class with v1.0 Integration
 * 
 * Integrates all v1.0 features into a cohesive game experience:
 * - Legal startup sequence with disclaimers
 * - Stable owner account system  
 * - Enhanced character creation with breeding
 * - Trainer system with personality-driven interactions
 * - Name generation for all game content
 * - Cross-platform UI using modular adapter system
 * - Enhanced save/load supporting all v1.0 data structures
 */

const StableOwner = require('./models/management/StableOwner');
const NameGenerator = require('./systems/generation/NameGenerator');
const TrainerDialog = require('./ui/components/TrainerDialog');
const CharacterCreationEngine = require('./engines/CharacterCreationEngine');
const StatGenerator = require('./models/generation/StatGenerator');
const BlessedAdapter = require('./ui/adapters/BlessedAdapter');
const StartupScreen = require('./ui/screens/StartupScreen');

// Import existing systems
const Horse = require('./models/Horse');
const Training = require('./models/Training');
const Race = require('./models/Race');
const NPHRoster = require('./models/NPHRoster');

class GameV1 {
    constructor(uiAdapter = null) {
        // Core systems
        this.uiAdapter = uiAdapter || new BlessedAdapter();
        this.nameGenerator = new NameGenerator();
        this.statGenerator = new StatGenerator();
        this.characterCreationEngine = new CharacterCreationEngine(this.nameGenerator, this.statGenerator);
        
        // Game state
        this.stableOwner = null;
        this.currentHorse = null;
        this.nphRoster = new NPHRoster();
        this.gameVersion = '1.0';
        
        // UI components
        this.trainerDialog = null;
        this.startupScreen = null;
        this.isInitialized = false;
        
        // Training and race systems
        this.training = new Training();
        this.raceHistory = [];
        this.currentTurn = 1;
    }

    // Game initialization with legal startup
    async initialize() {
        try {
            // Create startup screen for legal protection
            if (!this.startupScreen) {
                this.startupScreen = new StartupScreen();
            }

            // Show legal disclaimer sequence
            const legalResult = await this.showLegalStartup();
            if (!legalResult.success) {
                return { success: false, reason: 'Legal disclaimer not accepted' };
            }

            // Initialize UI adapter
            if (this.uiAdapter && typeof this.uiAdapter.createScreen === 'function' && !this.uiAdapter.isInitialized) {
                this.uiAdapter.createScreen();
            }

            // Initialize trainer dialog system
            this.trainerDialog = new TrainerDialog(this.uiAdapter);

            // Create or load stable owner
            if (!this.stableOwner) {
                await this.createStableOwner();
            }

            this.isInitialized = true;
            return { success: true };
        } catch (error) {
            console.error('Game initialization error:', error.message);
            return { success: false, reason: error.message };
        }
    }

    async showLegalStartup() {
        try {
            if (this.uiAdapter && this.uiAdapter.showLegalDisclaimer) {
                const result = await this.uiAdapter.showLegalDisclaimer();
                // Handle both success and accepted properties for compatibility
                return { 
                    success: result.success !== false && result.accepted !== false,
                    reason: result.reason || (result.accepted === false ? 'Legal disclaimer not accepted' : null)
                };
            } else if (this.startupScreen) {
                return await this.startupScreen.displayStartupSequence();
            } else {
                // Fallback for testing
                console.log('Legal disclaimer accepted for testing');
                return { success: true };
            }
        } catch (error) {
            console.error('Legal startup error:', error.message);
            return { success: false, reason: 'Legal startup failed' };
        }
    }

    async createStableOwner() {
        try {
            let ownerData;
            
            if (this.uiAdapter && this.uiAdapter.showOwnerCreation) {
                ownerData = await this.uiAdapter.showOwnerCreation();
            } else {
                // Default stable owner for testing
                ownerData = {
                    ownerName: this.nameGenerator.generateOwnerName(),
                    stableName: this.nameGenerator.generateStableName(),
                    philosophy: 'balanced'
                };
            }

            this.stableOwner = new StableOwner(
                ownerData.ownerName,
                ownerData.stableName,
                ownerData.philosophy
            );

            return this.stableOwner;
        } catch (error) {
            console.error('Stable owner creation error:', error.message);
            // Create default owner on error  
            const defaultOwnerName = this.nameGenerator?.generateOwnerName() || 'Default Owner';
            const defaultStableName = this.nameGenerator?.generateStableName() || 'Default Stables';
            
            this.stableOwner = new StableOwner(
                defaultOwnerName,
                defaultStableName,
                'balanced'
            );
            return this.stableOwner;
        }
    }

    // Enhanced horse creation using v1.0 systems
    createRandomHorse() {
        try {
            if (this.characterCreationEngine && this.characterCreationEngine.createRandomHorse) {
                const creationResult = this.characterCreationEngine.createRandomHorse();
                if (creationResult && creationResult.character) {
                    // CharacterCreationEngine returns a Character object, but we need a Horse
                    // Extract the data and create a proper Horse object
                    const character = creationResult.character;
                    const horse = new Horse(character.name, {
                        speed: character.stats.speed,
                        stamina: character.stats.stamina,
                        power: character.stats.power,
                        energy: character.condition?.energy || 100,
                        form: character.condition?.form || 'Average'
                    });
                    
                    // Add v1.0 properties if available
                    horse.breed = character.breed || 'thoroughbred';
                    horse.specialization = character.specialization || 'miler';
                    horse.racingStyle = character.racingStyle || 'stalker';
                    horse.gender = character.gender || 'colt';
                    horse.pedigree = character.pedigree || null;
                    horse.bond = character.bond || 0;
                    
                    return horse;
                }
            }
            // Fall through to basic horse creation
            const basicHorse = this.createBasicHorse();
            return basicHorse;
        } catch (error) {
            console.error('Random horse creation error:', error.message);
            // Fallback to basic horse creation
            const fallbackHorse = this.createBasicHorse();
            return fallbackHorse;
        }
    }

    createBreedingHorse(sireId, damId) {
        try {
            const sire = this.getStableHorse(sireId);
            const dam = this.getStableHorse(damId);
            
            if (!sire || !dam) {
                throw new Error('Invalid breeding pair');
            }

            return this.characterCreationEngine.createFromBreeding(sire, dam);
        } catch (error) {
            console.error('Breeding horse creation error:', error.message);
            return null;
        }
    }

    createCustomHorse(preferences) {
        try {
            return this.characterCreationEngine.createCustomHorse(preferences);
        } catch (error) {
            console.error('Custom horse creation error:', error.message);
            return this.createRandomHorse(); // Fallback
        }
    }

    createBasicHorse() {
        try {
            // Fallback horse creation for error cases
            const name = this.nameGenerator?.generateHorseName() || 'Test Horse';
            const stats = this.statGenerator?.generateBaseStats() || { speed: 50, stamina: 50, power: 50 };
            
            const horse = new Horse(name, {
                speed: stats.speed,
                stamina: stats.stamina,
                power: stats.power
            });
            
            // Add v1.0 properties for horses
            horse.breed = 'thoroughbred';
            horse.specialization = 'miler';
            horse.racingStyle = 'stalker';
            horse.gender = 'colt';
            horse.pedigree = null;
            
            return horse;
        } catch (error) {
            console.error('Basic horse creation error:', error.message);
            // Return a minimal horse if everything fails
            const minimalHorse = new Horse('Fallback Horse', {
                speed: 50,
                stamina: 50,
                power: 50
            });
            minimalHorse.breed = 'thoroughbred';
            minimalHorse.gender = 'colt';
            return minimalHorse;
        }
    }

    // Trainer system integration
    getTrainer(specialty) {
        if (!this.trainerDialog) {
            console.error('Trainer dialog system not initialized');
            return null;
        }
        return this.trainerDialog.getTrainer(specialty);
    }

    getPreTrainingDialog(specialty, horse) {
        if (!this.trainerDialog) {
            return `Let's work on ${specialty} training!`;
        }
        return this.trainerDialog.getPreTrainingMessage(specialty, horse);
    }

    getPostTrainingDialog(specialty, trainingResult) {
        if (!this.trainerDialog) {
            return 'Good training session!';
        }
        return this.trainerDialog.getPostTrainingMessage(specialty, trainingResult);
    }

    showTrainerDialog(specialty, message, choices = null) {
        if (!this.trainerDialog) {
            console.log(message);
            return null;
        }

        const trainer = this.getTrainer(specialty);
        return this.trainerDialog.showTrainerDialog(trainer, message, choices);
    }

    getTrainerRelationship(trainerName, horseName) {
        if (!this.trainerDialog) {
            return 'new';
        }
        return this.trainerDialog.getTrainerRelationship(trainerName, horseName);
    }

    recordTrainerSession(trainerName, horseName) {
        if (this.trainerDialog) {
            this.trainerDialog.recordTrainingSession(trainerName, horseName);
        }
    }

    // Training system with trainer integration
    simulateTraining(horse, statType) {
        if (!horse || !statType) {
            throw new Error('Invalid training parameters');
        }

        if (!horse.stats || typeof horse.stats[statType] !== 'number') {
            throw new Error('Invalid horse stats');
        }

        const trainer = this.getTrainer(statType);
        const previousValue = horse.stats[statType];
        
        // Simple training simulation if Training class not available
        let trainingResult;
        if (this.training && this.training.trainStat) {
            trainingResult = this.training.trainStat(horse, statType);
        } else {
            // Fallback training simulation
            const improvement = Math.floor(Math.random() * 5) + 1;
            horse.stats[statType] = Math.min(100, horse.stats[statType] + improvement);
            trainingResult = {
                success: true,
                improvement: improvement
            };
        }
        
        // Record trainer session
        if (trainer && horse.name) {
            this.recordTrainerSession(trainer.name, horse.name);
        }

        // Return enhanced result with trainer context
        return {
            ...trainingResult,
            trainer: trainer?.name,
            previousValue: previousValue,
            newValue: horse.stats[statType],
            improvement: horse.stats[statType] - previousValue
        };
    }

    // Race system with name generation
    generateRace(distance, surface) {
        try {
            const raceName = this.nameGenerator.generateRaceName(distance, surface);
            const trackName = this.nameGenerator.generateTrackName();
            
            // Use existing race system with generated names
            const race = new Race();
            race.name = raceName;
            race.trackName = trackName;
            race.distance = distance;
            race.surface = surface;
            
            return race;
        } catch (error) {
            console.error('Race generation error:', error.message);
            return new Race(); // Fallback with default names
        }
    }

    // Stable management
    getStableHorses() {
        if (!this.stableOwner || !this.stableOwner.stable) {
            return [];
        }
        return this.stableOwner.stable.getAllHorses();
    }

    getStableHorse(horseId) {
        const horses = this.getStableHorses();
        return horses.find(horse => horse.id === horseId);
    }

    retireHorse(horse) {
        if (!this.stableOwner || !horse) {
            return false;
        }

        try {
            // Add to stable for breeding (if old enough)
            if (this.stableOwner.stable) {
                this.stableOwner.stable.addHorse(horse);
            }

            // Update stable owner statistics
            this.stableOwner.statistics.horsesOwned++;
            
            return true;
        } catch (error) {
            console.error('Horse retirement error:', error.message);
            return false;
        }
    }

    // Save/Load system with v1.0 support
    save() {
        try {
            return {
                version: this.gameVersion,
                timestamp: new Date().toISOString(),
                stableOwner: this.stableOwner ? this.stableOwner.serialize() : null,
                currentHorse: this.currentHorse ? this.serializeHorse(this.currentHorse) : null,
                nameGenerator: this.nameGenerator.getUsedNames(),
                trainerRelationships: this.trainerDialog ? this.trainerDialog.serialize() : {},
                gameState: {
                    currentTurn: this.currentTurn,
                    raceHistory: this.raceHistory,
                    isInitialized: this.isInitialized
                }
            };
        } catch (error) {
            console.error('Save error:', error.message);
            throw new Error('Failed to save game');
        }
    }

    load(saveData) {
        try {
            if (!saveData || saveData.version !== this.gameVersion) {
                throw new Error('Invalid or incompatible save data');
            }

            // Restore stable owner
            if (saveData.stableOwner) {
                this.stableOwner = StableOwner.deserialize(saveData.stableOwner);
            }

            // Restore current horse
            if (saveData.currentHorse) {
                this.currentHorse = this.deserializeHorse(saveData.currentHorse);
            }

            // Restore name generator state
            if (saveData.nameGenerator) {
                this.nameGenerator.setUsedNames(saveData.nameGenerator);
            }

            // Restore trainer relationships - ensure trainerDialog exists first
            if (saveData.trainerRelationships) {
                if (!this.trainerDialog) {
                    this.trainerDialog = new TrainerDialog(this.uiAdapter);
                }
                this.trainerDialog.deserialize(saveData.trainerRelationships);
            }

            // Restore game state
            if (saveData.gameState) {
                this.currentTurn = saveData.gameState.currentTurn || 1;
                this.raceHistory = saveData.gameState.raceHistory || [];
                this.isInitialized = saveData.gameState.isInitialized || false;
            }

            return true;
        } catch (error) {
            console.error('Load error:', error.message);
            return false;
        }
    }

    // Horse serialization helpers
    serializeHorse(horse) {
        return {
            name: horse.name,
            stats: horse.stats,
            breed: horse.breed,
            specialization: horse.specialization,
            racingStyle: horse.racingStyle,
            gender: horse.gender,
            pedigree: horse.pedigree,
            // Add any other v1.0 specific properties
            energy: horse.energy,
            bond: horse.bond,
            form: horse.form
        };
    }

    deserializeHorse(data) {
        // Create horse with enhanced v1.0 features
        const horse = new Horse(data.name, {
            speed: data.stats.speed,
            stamina: data.stats.stamina,
            power: data.stats.power,
            energy: data.energy,
            form: data.form
        });
        
        // Restore v1.0 properties
        horse.breed = data.breed;
        horse.specialization = data.specialization;
        horse.racingStyle = data.racingStyle;
        horse.gender = data.gender;
        horse.pedigree = data.pedigree;
        horse.bond = data.bond;
        
        return horse;
    }

    // Cleanup and resource management
    cleanup() {
        try {
            if (this.trainerDialog) {
                this.trainerDialog.dismissDialog();
            }
            
            if (this.uiAdapter) {
                this.uiAdapter.cleanup();
            }
            
            this.isInitialized = false;
        } catch (error) {
            console.error('Cleanup error:', error.message);
        }
    }

    // Game state queries
    getGameStatus() {
        return {
            initialized: this.isInitialized,
            version: this.gameVersion,
            stableOwner: this.stableOwner ? {
                name: this.stableOwner.profile.name,
                stableName: this.stableOwner.profile.stableName,
                reputation: this.stableOwner.profile.reputation,
                cash: this.stableOwner.financial.cash
            } : null,
            currentHorse: this.currentHorse ? {
                name: this.currentHorse.name,
                breed: this.currentHorse.breed,
                stats: this.currentHorse.stats
            } : null,
            currentTurn: this.currentTurn
        };
    }

    // Utility methods
    isReady() {
        return this.isInitialized && this.stableOwner !== null;
    }

    getVersion() {
        return this.gameVersion;
    }
}

module.exports = GameV1;