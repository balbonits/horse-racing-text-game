/**
 * Tutorial System - Interactive Learning Experience
 * 
 * Provides a guided 5-turn, 1-race tutorial that mirrors actual gameplay
 * but with static values for predictable, educational experience.
 * 
 * Tutorial Flow:
 * - Turn 1: Speed Training (introduction to stats)
 * - Turn 2: Stamina Training (energy management)
 * - Turn 3: Power Training (stat variety)
 * - Turn 4: Rest Day (energy recovery)
 * - Turn 5: Media Day (social interactions)
 * - Race: Sprint race with scripted close victory
 */

const Character = require('../models/Character');

class TutorialManager {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.tutorialStep = 0;
        this.tutorialCharacter = null;
        this.tutorialComplete = false;
        
        // Static tutorial data for predictable experience
        this.tutorialData = {
            characterName: 'Tutorial Star',
            initialStats: { speed: 25, stamina: 25, power: 25 },
            
            // Scripted training results for each turn
            trainingResults: [
                { turn: 1, type: 'speed', gain: 8, newValue: 33, energyCost: 15, message: 'Great speed work! Your horse is getting faster.' },
                { turn: 2, type: 'stamina', gain: 6, newValue: 31, energyCost: 10, message: 'Excellent endurance training! Stamina improved significantly.' },
                { turn: 3, type: 'power', gain: 7, newValue: 32, energyCost: 15, message: 'Powerful training session! Your horse\'s strength is showing.' },
                { turn: 4, type: 'rest', gain: 0, newValue: 0, energyGain: 30, message: 'Good rest! Your horse feels refreshed and ready.' },
                { turn: 5, type: 'media', gain: 0, newValue: 0, energyGain: 15, message: 'Nice media session! Your horse enjoys the attention.' }
            ],
            
            // Final race setup
            raceData: {
                name: 'Tutorial Sprint Cup',
                distance: '1000m',
                surface: 'TURF',
                type: 'SPRINT',
                
                // Scripted race results for close victory
                results: [
                    { position: 1, name: 'Tutorial Star', time: '58.42', margin: 'Won by a neck' },
                    { position: 2, name: 'Training Rival', time: '58.48', margin: '6 lengths ahead of 3rd' },
                    { position: 3, name: 'Sprint Master', time: '59.12', margin: '2 lengths ahead of 4th' }
                ]
            }
        };
        
        // Stable Manager guide character - your right-hand person who oversees operations
        this.stableManager = {
            name: 'Alex Morgan',
            title: 'Stable Manager',
            emoji: '👥',
            personality: {
                traits: ['experienced', 'organized', 'supportive', 'knowledgeable'],
                style: 'professional-friendly',
                description: 'Your trusted stable manager who oversees daily operations and guides you through the business of horse racing'
            },
            introduction: {
                greeting: "Welcome to Thunder Ridge Stables! I'm Alex Morgan, your Stable Manager.",
                role: "Think of me as your operations manager - I'll handle the day-to-day details so you can focus on training and racing decisions.",
                promise: "I'll be here to explain everything, guide you through your first career, and make sure you understand how this business works.",
                excitement: "Ready to build a championship stable together? Let's start with the basics!"
            },
            explanations: {
                stats: {
                    overview: "Every horse has three core stats that determine their racing performance:\n• Speed - Sprint ability and acceleration\n• Stamina - Endurance for longer races\n• Power - Strength for tactical positioning\n\nThese stats range from 1-100, and higher is always better!",
                    speed: "Speed is your horse's explosive sprint ability. High speed horses excel in:\n• Quick acceleration from the gate\n• Final sprint finishes\n• Short distance races (1200m-1400m)\n\nSpeed training costs 15 energy but gives excellent gains for sprinters.",
                    stamina: "Stamina is your horse's endurance - their fuel tank for longer races. High stamina horses:\n• Maintain pace in longer races\n• Don't fade in the final stretch\n• Excel at distances over 1800m\n\nStamina training costs only 10 energy and builds gradually.",
                    power: "Power is your horse's strength and tactical ability. High power horses can:\n• Fight through traffic in crowded races\n• Accelerate when positioning matters\n• Handle any racing surface\n\nPower training costs 15 energy and helps in all race types."
                },
                energy: "Energy is crucial - it's like your horse's daily motivation. You start with 100 energy each day:\n• Training costs 10-15 energy per session\n• Low energy = poor training gains\n• Rest days restore 30 energy\n• Media days give 15 energy plus relationship benefits\n\nManage energy wisely - tired horses don't improve much!",
                training: {
                    overview: "You have 5 training options each turn. Choose based on:\n• Your horse's current stats\n• Upcoming race requirements\n• Current energy levels\n• Long-term career goals",
                    rest: "Rest days are not lazy days! They're strategic:\n• Restore 30 energy (crucial for continued training)\n• Use when energy is below 40\n• Essential for maintaining training quality\n• Smart trainers rest before big training sessions",
                    media: "Media days build relationships and moderate energy:\n• +15 energy (good for maintenance)\n• Improves trainer relationships\n• Builds public profile\n• Great for light recovery between intense sessions"
                },
                racing: "Races are where all your training pays off! Each race has:\n• Distance - affects which stats matter most\n• Surface - Dirt or Turf, both have their specialists\n• Competition - other horses with their own strengths\n• Prize money - reward for good performance\n\nRace strategy matters, but we'll cover that when you're ready!"
            }
        };

        // Tutorial step explanations
        this.stepExplanations = {
            0: {
                title: '🏁 Welcome to Thunder Ridge Stables!',
                text: `${this.stableManager.introduction.greeting}\n\n${this.stableManager.introduction.role}\n\n${this.stableManager.introduction.promise}\n\n${this.stableManager.introduction.excitement}`,
                speaker: 'stableManager'
            },
            1: {
                title: '💨 Speed Training - Turn 1',
                text: `Now let's start with Speed training!\n\n${this.stableManager.explanations.stats.speed}\n\nThis is your first training session - choose option 1 for Speed Training!`,
                speaker: 'stableManager',
                trainerAdvice: 'speed'
            },
            2: {
                title: '🏃 Stamina Training - Turn 2', 
                text: `Time to build some endurance!\n\n${this.stableManager.explanations.stats.stamina}\n\nSelect option 2 for Stamina Training to continue the lesson.`,
                speaker: 'stableManager',
                trainerAdvice: 'stamina'
            },
            3: {
                title: '💪 Power Training - Turn 3',
                text: `Let's develop some strength!\n\n${this.stableManager.explanations.stats.power}\n\nChoose option 3 for Power Training to round out your stats.`,
                speaker: 'stableManager',
                trainerAdvice: 'power'
            },
            4: {
                title: '😴 Rest Day - Turn 4',
                text: `Smart training includes recovery!\n\n${this.stableManager.explanations.training.rest}\n\nSelect option 4 for Rest Day - watch your energy restore!`,
                speaker: 'stableManager'
            },
            5: {
                title: '📸 Media Day - Turn 5',
                text: `Building relationships is important too!\n\n${this.stableManager.explanations.training.media}\n\nChoose option 5 for Media Day to complete your training!`,
                speaker: 'stableManager'
            },
            6: {
                title: '🏆 Race Day!',
                text: `Excellent work on the training! Now for the exciting part!\n\n${this.stableManager.explanations.racing}\n\nYour first race is the Tutorial Sprint Cup - press ENTER when ready!`,
                speaker: 'stableManager'
            }
        };
    }

    /**
     * Get stable manager dialogue for current step
     */
    getStableManagerDialogue(stepNumber = null) {
        const step = stepNumber !== null ? stepNumber : this.tutorialStep;
        const explanation = this.stepExplanations[step];
        
        if (!explanation || explanation.speaker !== 'stableManager') {
            return null;
        }

        return {
            name: this.stableManager.name,
            title: this.stableManager.title,
            emoji: this.stableManager.emoji,
            message: explanation.text,
            title_text: explanation.title
        };
    }

    /**
     * Get trainer advice for current step
     */
    getTrainerAdviceForStep(stepNumber = null) {
        const step = stepNumber !== null ? stepNumber : this.tutorialStep;
        const explanation = this.stepExplanations[step];
        
        if (!explanation || !explanation.trainerAdvice) {
            return null;
        }

        return {
            specialty: explanation.trainerAdvice,
            step: step
        };
    }

    /**
     * Get combined tutorial guidance (stable manager + trainer)
     */
    getTutorialGuidance() {
        const managerDialogue = this.getStableManagerDialogue();
        const trainerAdvice = this.getTrainerAdviceForStep();
        
        return {
            stableManager: managerDialogue,
            trainer: trainerAdvice,
            step: this.tutorialStep,
            totalSteps: 6
        };
    }

    /**
     * Start the tutorial
     */
    startTutorial() {
        console.log('🎓 Starting Tutorial: Learn to Play Horse Racing!');
        
        // Create tutorial character with static stats
        this.tutorialCharacter = new Character(this.tutorialData.characterName, {
            speed: this.tutorialData.initialStats.speed,
            stamina: this.tutorialData.initialStats.stamina,
            power: this.tutorialData.initialStats.power,
            energy: 100,
            turn: 1,
            maxTurns: 5
        });
        
        this.tutorialStep = 0;
        this.tutorialComplete = false;
        
        // Set up tutorial in game
        this.gameApp.game.character = this.tutorialCharacter;
        this.gameApp.game.gameState = 'training'; // Set gameState to allow training
        
        // Initialize turn controller for tutorial training
        if (!this.gameApp.game.turnController) {
            const TurnController = require('../modules/TurnController');
            const TrainingEngine = require('../modules/TrainingEngine');
            
            // Create training engine for tutorial
            const trainingEngine = new TrainingEngine();
            
            // Create turn controller with required dependencies
            this.gameApp.game.turnController = new TurnController(
                this.tutorialCharacter, 
                null, // timeline not needed for tutorial
                trainingEngine
            );
        }
        
        this.gameApp.tutorialMode = true;
        
        return {
            success: true,
            character: this.tutorialCharacter,
            message: 'Tutorial started! Follow the guided training.'
        };
    }

    /**
     * Get current tutorial step explanation
     */
    getCurrentStepExplanation() {
        return this.stepExplanations[this.tutorialStep] || {
            title: '🎓 Tutorial',
            text: 'Follow the instructions to learn the game.'
        };
    }

    /**
     * Perform tutorial training with scripted results
     */
    performTutorialTraining(expectedType) {
        if (this.tutorialStep >= 5) {
            return {
                success: false,
                message: 'Tutorial training complete! Time for the race.'
            };
        }

        const stepData = this.tutorialData.trainingResults[this.tutorialStep];
        
        // Verify player is following tutorial
        if (stepData.type !== expectedType) {
            return {
                success: false,
                message: `Tutorial Step ${this.tutorialStep + 1}: Please select ${stepData.type} training as instructed.`,
                expectedTraining: stepData.type
            };
        }

        // Apply scripted training results
        if (stepData.energyCost) {
            this.tutorialCharacter.energy = Math.max(0, this.tutorialCharacter.energy - stepData.energyCost);
        }
        
        if (stepData.energyGain) {
            this.tutorialCharacter.energy = Math.min(100, this.tutorialCharacter.energy + stepData.energyGain);
        }

        // Apply stat gains
        if (stepData.type === 'speed' && stepData.gain > 0) {
            this.tutorialCharacter.stats.speed = stepData.newValue;
        } else if (stepData.type === 'stamina' && stepData.gain > 0) {
            this.tutorialCharacter.stats.stamina = stepData.newValue;
        } else if (stepData.type === 'power' && stepData.gain > 0) {
            this.tutorialCharacter.stats.power = stepData.newValue;
        }

        // Advance tutorial
        this.tutorialStep++;
        this.tutorialCharacter.career.turn++;

        return {
            success: true,
            type: stepData.type,
            gain: stepData.gain || 0,
            energyChange: stepData.energyCost ? -stepData.energyCost : stepData.energyGain,
            message: stepData.message,
            tutorialStep: this.tutorialStep,
            nextStep: this.stepExplanations[this.tutorialStep]
        };
    }

    /**
     * Run tutorial race with scripted results
     */
    runTutorialRace() {
        if (this.tutorialStep < 5) {
            return {
                success: false,
                message: 'Complete all 5 training turns first!'
            };
        }

        const raceData = this.tutorialData.raceData;
        
        // Simulate race with scripted victory
        const raceResult = {
            success: true,
            raceInfo: {
                name: raceData.name,
                distance: raceData.distance,
                surface: raceData.surface,
                type: raceData.type,
                turn: 6
            },
            results: raceData.results,
            playerResult: {
                position: 1,
                time: raceData.results[0].time,
                performance: {
                    performance: 85, // Good performance score
                    speed: this.tutorialCharacter.stats.speed,
                    stamina: this.tutorialCharacter.stats.stamina,
                    power: this.tutorialCharacter.stats.power
                },
                margin: raceData.results[0].margin,
                prize: 1500
            },
            message: '🏆 Congratulations! You won your first race by a neck!'
        };

        this.tutorialComplete = true;
        
        return raceResult;
    }

    /**
     * Get tutorial completion summary
     */
    getTutorialSummary() {
        return {
            completed: this.tutorialComplete,
            character: {
                name: this.tutorialCharacter?.name,
                finalStats: this.tutorialCharacter?.stats,
                energy: this.tutorialCharacter?.energy
            },
            achievements: [
                '✅ Completed 5 training turns',
                '✅ Learned all training types',
                '✅ Won your first race',
                '✅ Ready for career mode!'
            ],
            message: 'Tutorial complete! You\'re ready to start your racing career.'
        };
    }

    /**
     * Get next tutorial instruction
     */
    getNextInstruction() {
        if (this.tutorialStep >= 5) {
            return {
                action: 'race',
                message: 'Training complete! Time for your first race. Press ENTER to race!'
            };
        }

        const stepData = this.tutorialData.trainingResults[this.tutorialStep];
        const trainingNames = {
            speed: 'Speed Training (Option 1)',
            stamina: 'Stamina Training (Option 2)', 
            power: 'Power Training (Option 3)',
            rest: 'Rest Day (Option 4)',
            media: 'Media Day (Option 5)'
        };

        return {
            action: 'training',
            expectedTraining: stepData.type,
            message: `Tutorial Step ${this.tutorialStep + 1}: Select ${trainingNames[stepData.type]}`,
            explanation: this.stepExplanations[this.tutorialStep + 1]
        };
    }

    /**
     * Check if tutorial mode is active
     */
    isTutorialActive() {
        return this.gameApp.tutorialMode === true && !this.tutorialComplete;
    }

    /**
     * End tutorial and return to main menu
     */
    endTutorial() {
        this.gameApp.tutorialMode = false;
        this.gameApp.game.character = null;
        this.tutorialStep = 0;
        this.tutorialComplete = false;
        this.tutorialCharacter = null;

        return {
            success: true,
            message: 'Tutorial ended. Ready to start your career!'
        };
    }

    /**
     * Get tutorial progress
     */
    getTutorialProgress() {
        return {
            step: this.tutorialStep,
            totalSteps: 6, // 5 training + 1 race
            completed: this.tutorialComplete,
            nextAction: this.getNextInstruction()
        };
    }

    /**
     * Validate tutorial training choice
     */
    validateTrainingChoice(choice) {
        if (this.tutorialStep >= 5) {
            return {
                valid: false,
                message: 'Training complete! Press ENTER to race.'
            };
        }

        const expected = this.tutorialData.trainingResults[this.tutorialStep].type;
        const choiceMap = {
            '1': 'speed',
            '2': 'stamina',
            '3': 'power',
            '4': 'rest',
            '5': 'media'
        };

        const selectedType = choiceMap[choice];
        
        if (selectedType === expected) {
            return {
                valid: true,
                type: selectedType,
                message: 'Correct choice! Processing training...'
            };
        } else {
            const typeNames = {
                speed: 'Speed Training (1)',
                stamina: 'Stamina Training (2)',
                power: 'Power Training (3)',
                rest: 'Rest Day (4)',
                media: 'Media Day (5)'
            };

            return {
                valid: false,
                expectedType: expected,
                message: `Tutorial Step ${this.tutorialStep + 1}: Please select ${typeNames[expected]} to continue the lesson.`
            };
        }
    }

    /**
     * Show tutorial help
     */
    showTutorialHelp() {
        return {
            title: '🎓 Tutorial Help',
            content: `
Tutorial Overview:
- 5 Training Turns: Learn each training type
- 1 Race: Experience your first competition
- Guided Experience: Follow the specific instructions

Training Types You'll Learn:
1. Speed Training - Improves sprint ability (15 energy)
2. Stamina Training - Improves endurance (10 energy) 
3. Power Training - Improves strength (15 energy)
4. Rest Day - Restores energy (+30)
5. Media Day - Moderate energy gain (+15)

Tips:
- Follow the tutorial instructions exactly
- Read the explanations to understand each training type
- Energy management is key to successful training
- The race at the end will test everything you learned!

Current Progress: Step ${this.tutorialStep + 1} of 6
            `,
            nextStep: this.getNextInstruction()
        };
    }
}

module.exports = TutorialManager;