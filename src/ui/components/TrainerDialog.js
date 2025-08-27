/**
 * TrainerDialog - Trainer Speech/Conversation System
 * 
 * Manages trainer personalities, stat-based responses, and dialog UI
 * for the three specialized trainers (Speed, Stamina, Power).
 */

class TrainerDialog {
    constructor(uiAdapter) {
        this.uiAdapter = uiAdapter;
        this.trainerRelationships = new Map(); // Track trainer-horse relationships
        this.currentDialog = null;
        this.initializeTrainers();
    }

    initializeTrainers() {
        this.trainers = [
            {
                name: 'Coach Johnson',
                specialty: 'speed',
                emoji: '🏃',
                personality: {
                    traits: ['energetic', 'direct', 'results-focused'],
                    style: 'motivational',
                    catchphrase: 'Speed wins races!'
                },
                responses: {
                    introduction: "I'm Coach Johnson, and I live for pure speed! We're going to unlock your horse's explosive acceleration and make them a sprinting machine. Are you ready to feel the rush?",
                    philosophy: "Speed isn't just about running fast - it's about explosive power at the crucial moment. Every stride counts when you're fighting for the wire!"
                }
            },
            {
                name: 'Coach Martinez',
                specialty: 'stamina',
                emoji: '⛰️',
                personality: {
                    traits: ['patient', 'methodical', 'endurance-focused'],
                    style: 'encouraging',
                    catchphrase: 'Steady wins the day!'
                },
                responses: {
                    introduction: "Welcome, I'm Coach Martinez. True champions are built through patience and persistence. Together, we'll develop the kind of stamina that wins the biggest races when others are fading.",
                    philosophy: "Stamina is the foundation of greatness. When the field is gasping for air in the final furlong, our horses will be just getting started!"
                }
            },
            {
                name: 'Coach Thompson',
                specialty: 'power',
                emoji: '💪',
                personality: {
                    traits: ['tough', 'motivational', 'fundamentals-focused'],
                    style: 'demanding',
                    catchphrase: 'Power through!'
                },
                responses: {
                    introduction: "Coach Thompson here. Power is what separates the champions from the also-rans. We're going to build the explosive strength that launches your horse past the competition when it matters most.",
                    philosophy: "Raw power is the foundation - it's what gives you that devastating kick when you need to surge past rivals. No shortcuts, just results!"
                }
            }
        ];
    }

    // Trainer access methods
    getTrainers() {
        return this.trainers;
    }

    getTrainer(specialty) {
        const trainer = this.trainers.find(t => t.specialty === specialty);
        return trainer || null;
    }

    getIntroduction(trainer) {
        return trainer ? trainer.responses.introduction : 'Hello there!';
    }

    // Stat categorization and responses
    getStatCategory(statValue) {
        if (statValue < 0) return 'beginner'; // Handle negative values
        if (statValue <= 20) return 'beginner';
        if (statValue <= 40) return 'developing';
        if (statValue <= 60) return 'competent';
        if (statValue <= 80) return 'advanced';
        return 'elite';
    }

    getStatBasedResponse(specialty, statValue) {
        const category = this.getStatCategory(statValue);
        const trainer = this.getTrainer(specialty);
        
        if (!trainer) {
            return "Let's work on improving your horse's abilities!";
        }

        const responses = {
            speed: {
                beginner: "We have a lot of ground to cover, but everyone starts somewhere! Let's build that basic speed foundation first.",
                developing: "I can see some improvement in those early strides! Keep pushing through the fundamentals.",
                competent: "Good progress! Your horse is starting to show real speed potential in those sprints.",
                advanced: "Excellent work! Those times are getting seriously competitive - we're building a real speedster here!",
                elite: "Outstanding! This is championship-level acceleration - your horse has the speed to compete with the very best!"
            },
            stamina: {
                beginner: "Rome wasn't built in a day, and neither is true endurance. Let's take this step by step and build that foundation.",
                developing: "I'm seeing better recovery between workouts! Your horse is starting to build that cardiovascular base.",
                competent: "Nice progress! Those longer distances aren't looking as daunting anymore, are they?",
                advanced: "Impressive stamina development! Your horse can go the distance when others are hitting the wall.",
                elite: "Remarkable endurance! This horse could run all day - true staying power that wins the biggest races!"
            },
            power: {
                beginner: "We're starting from the ground up, but that's okay! Solid fundamentals create explosive power later.",
                developing: "I can feel that strength building! Those muscles are starting to respond to the hard work.",
                competent: "Good power development! I can see that extra thrust when your horse needs to accelerate.",
                advanced: "Excellent strength! That explosive power is becoming a real weapon in tight finishes.",
                elite: "Phenomenal power! This horse hits like a freight train when they make their move - absolutely devastating!"
            }
        };

        return responses[specialty]?.[category] || "Keep up the great work!";
    }

    // Training session messages
    getPreTrainingMessage(specialty, horse) {
        const trainer = this.getTrainer(specialty);
        if (!trainer || !horse) {
            return "Let's get to work!";
        }

        const statValue = horse.stats?.[specialty] || 50;
        const relationship = this.getTrainerRelationship(trainer.name, horse.name);
        
        const messages = {
            speed: {
                new: `Alright ${horse.name}, time to see what you've got! We're going to work on your speed today - explosive starts and sustained acceleration!`,
                familiar: `Good to see you back, ${horse.name}! Ready to push those speed limits even further? Let's make those legs fly!`,
                experienced: `${horse.name}, my friend! Another speed session - I can see you're getting hungry for those fast times. Let's unleash that speed!`
            },
            stamina: {
                new: `Welcome ${horse.name}. Today we build endurance - the kind that wins races when others are finished. Steady and strong!`,
                familiar: `${horse.name}, ready for another stamina builder? I can see you're getting stronger each session. Let's keep building!`,
                experienced: `${horse.name}! Your endurance is really developing beautifully. Today we take it up another notch - you can handle it!`
            },
            power: {
                new: `${horse.name}, time to build some real strength! Power training is tough, but that's what separates champions from the pack!`,
                familiar: `Back for more, ${horse.name}? Good! I can see those muscles developing. Today we push that power even harder!`,
                experienced: `${horse.name}! Look at that strength development - impressive! Ready to unleash even more explosive power today?`
            }
        };

        return messages[specialty]?.[relationship] || `Let's work on that ${specialty}, ${horse.name}!`;
    }

    getPostTrainingMessage(specialty, trainingResult) {
        const trainer = this.getTrainer(specialty);
        if (!trainer || !trainingResult) {
            return "Good job out there!";
        }

        const improvement = trainingResult.improvement || 0;
        const newValue = trainingResult.newValue || 0;
        const category = this.getStatCategory(newValue);

        let improvementLevel;
        if (improvement >= 5) improvementLevel = 'excellent';
        else if (improvement >= 3) improvementLevel = 'good';
        else if (improvement >= 1) improvementLevel = 'modest';
        else improvementLevel = 'minimal';

        const messages = {
            speed: {
                excellent: `Fantastic! That was explosive work - ${improvement} points of speed improvement! ${trainer.responses.philosophy}`,
                good: `Solid session! +${improvement} speed - I can see those fast-twitch muscles responding. Keep this up!`,
                modest: `Steady progress! Every point of speed counts, and +${improvement} is real improvement. Speed builds over time!`,
                minimal: `Sometimes the gains are subtle, but they're still there. The foundation is building - trust the process!`
            },
            stamina: {
                excellent: `Outstanding endurance work! +${improvement} stamina - that's championship-level improvement right there!`,
                good: `Beautiful stamina building! +${improvement} points - I can see you pushing through those fatigue barriers!`,
                modest: `Good steady progress! +${improvement} stamina - endurance is built one session at a time, just like this!`,
                minimal: `Patience pays off in stamina training. Small consistent gains lead to race-winning endurance!`
            },
            power: {
                excellent: `Incredible power session! +${improvement} points - that explosive strength is really developing!`,
                good: `Strong work! +${improvement} power - I can feel that extra thrust building in those muscles!`,
                modest: `Solid strength gains! +${improvement} power - real explosive ability is being forged here!`,
                minimal: `Power builds deep in the muscles. Every session counts, even when the gains seem small!`
            }
        };

        const response = messages[specialty]?.[improvementLevel] || 'Good work!';
        const encouragement = this.getStatBasedResponse(specialty, newValue);
        
        return `${response}\n\n${encouragement}`;
    }

    getTrainingAdvice(specialty, horse) {
        const trainer = this.getTrainer(specialty);
        if (!trainer || !horse) {
            return "Focus on consistent training and gradual improvement.";
        }

        const statValue = horse.stats?.[specialty] || 50;
        const category = this.getStatCategory(statValue);

        const advice = {
            speed: {
                beginner: "Start with short bursts and focus on form. Speed comes from efficiency, not just effort!",
                developing: "Time to add some intensity! Mix sprint intervals with recovery periods.",
                competent: "Work on race-specific speeds. Practice that final kick for when it really counts!",
                advanced: "Fine-tune that explosive acceleration. Small refinements make big differences at this level.",
                elite: "Maintain that incredible speed while adding tactical awareness. You've got the tools - now master the art!"
            },
            stamina: {
                beginner: "Build the aerobic base first. Long, steady work will create the foundation for everything else.",
                developing: "Add some tempo work. Push the comfort zone but stay in control.",
                competent: "Time for threshold training! Teach your horse to maintain speed when it gets tough.",
                advanced: "Practice race-pace endurance. Simulate the demands of championship racing.",
                elite: "Master the art of energy distribution. You can go the distance - now optimize how you do it!"
            },
            power: {
                beginner: "Focus on fundamental strength. Build from the ground up with consistent work.",
                developing: "Add explosive elements. Short, powerful bursts will develop that quick power.",
                competent: "Work on sustained power. Maintain that strength throughout the race distance.",
                advanced: "Develop tactical power. Learn when to unleash that strength for maximum impact.",
                elite: "Perfect your power application. You have incredible strength - now make it devastatingly effective!"
            }
        };

        return advice[specialty]?.[category] || "Keep training consistently and stay focused on your goals!";
    }

    // Dialog UI methods
    showTrainerDialog(trainer, message, choices = null) {
        try {
            if (!this.uiAdapter || !trainer) {
                console.log(`${trainer?.emoji || '🏃'} ${trainer?.name || 'Coach'}: ${message}`);
                return null;
            }

            // Dismiss any existing dialog
            this.dismissDialog();

            const dialogConfig = {
                id: 'trainer_dialog',
                title: `${trainer.emoji} ${trainer.name} (${trainer.specialty.charAt(0).toUpperCase() + trainer.specialty.slice(1)} Trainer)`,
                content: message,
                width: '70%',
                height: choices ? '50%' : '40%',
                style: {
                    border: { fg: 'yellow' },
                    fg: 'white',
                    bg: 'black'
                }
            };

            const dialog = this.uiAdapter.createDialog(dialogConfig);
            
            if (choices && choices.length > 0) {
                // Create menu for choices
                const menuConfig = {
                    id: 'trainer_choices',
                    parent: dialog,
                    top: '60%',
                    left: 2,
                    right: 2,
                    height: choices.length + 2,
                    items: choices,
                    style: {
                        selected: { fg: 'black', bg: 'yellow' }
                    },
                    onSelect: (choice, index) => {
                        this.handleTrainerChoice(trainer, choice, index);
                    }
                };

                this.uiAdapter.createMenu(choices, menuConfig);
            }

            this.currentDialog = dialog;
            this.uiAdapter.render();
            
            return dialog;
        } catch (error) {
            console.error('Error showing trainer dialog:', error.message);
            // Fallback to console output
            console.log(`${trainer.emoji} ${trainer.name}: ${message}`);
            return null;
        }
    }

    dismissDialog() {
        try {
            if (this.uiAdapter) {
                this.uiAdapter.destroyComponent('trainer_dialog');
                this.uiAdapter.destroyComponent('trainer_choices');
                this.uiAdapter.render();
            }
            this.currentDialog = null;
        } catch (error) {
            console.error('Error dismissing trainer dialog:', error.message);
        }
    }

    handleTrainerChoice(trainer, choice, index) {
        // Handle trainer dialog choices - can be extended for specific interactions
        console.log(`Selected: ${choice} from ${trainer.name}`);
        this.dismissDialog();
    }

    // Relationship tracking
    getTrainerRelationship(trainerName, horseName) {
        const key = `${trainerName}-${horseName}`;
        const sessions = this.trainerRelationships.get(key) || 0;
        
        if (sessions === 0) return 'new';
        if (sessions < 5) return 'familiar';
        return 'experienced';
    }

    recordTrainingSession(trainerName, horseName) {
        const key = `${trainerName}-${horseName}`;
        const currentSessions = this.trainerRelationships.get(key) || 0;
        this.trainerRelationships.set(key, currentSessions + 1);
    }

    // Utility methods
    getRandomResponse(responses) {
        if (!responses || !Array.isArray(responses) || responses.length === 0) {
            return "Let's keep working hard!";
        }
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Save/Load trainer relationship data
    serialize() {
        return {
            trainerRelationships: Object.fromEntries(this.trainerRelationships)
        };
    }

    deserialize(data) {
        if (data && data.trainerRelationships) {
            this.trainerRelationships = new Map(Object.entries(data.trainerRelationships));
        }
    }
}

module.exports = TrainerDialog;