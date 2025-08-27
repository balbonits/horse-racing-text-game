const Breed = require('./Breed');

/**
 * Arabian horse breed - The endurance specialist
 * 
 * Arabian horses are renowned for their exceptional stamina and endurance.
 * They excel in longer races and have a natural preference for turf surfaces.
 * Their superior cardiovascular system allows for sustained performance.
 * 
 * Characteristics:
 * - Enhanced stamina cap (110 vs 100)
 * - Superior stamina growth rate (1.25x)
 * - Turf surface preference (1.08x performance)
 * - Excellent for stayer specialization and long-distance racing
 * 
 * @class Arabian
 * @extends Breed
 */
class Arabian extends Breed {
    constructor() {
        const config = {
            statCaps: {
                speed: 95,     // Slightly lower speed ceiling
                stamina: 110,  // Superior stamina potential
                power: 95      // Slightly lower power ceiling
            },
            growthRates: {
                speed: 0.95,   // Slower speed development
                stamina: 1.25, // Superior stamina development  
                power: 0.95    // Slower power development
            },
            surfacePreferences: {
                turf: 1.08,    // Natural turf preference
                dirt: 0.96     // Slight dirt disadvantage
            },
            description: "Desert-bred endurance specialists. Exceptional stamina and turf performance make them perfect for long-distance racing.",
            strengths: [
                "Exceptional stamina development",
                "Superior endurance in long races",
                "Natural turf track advantage",
                "Efficient energy management"
            ]
        };
        
        super('Arabian', config);
    }
    
    /**
     * Get specific training recommendations for Arabian horses
     * @returns {Object} Training recommendations  
     */
    getTrainingRecommendations() {
        return {
            earlyCareer: [
                "Focus heavily on stamina training - your natural advantage",
                "Build bond through Media Day for training multipliers",
                "Don't neglect speed/power entirely - you'll need balanced stats"
            ],
            midCareer: [
                "Maximize stamina to the 110 cap as priority",
                "Supplement with power training for acceleration", 
                "Prepare specifically for long-distance championship races"
            ],
            lateCareer: [
                "Fine-tune speed to complement your stamina dominance",
                "Focus energy management for sustained performance",
                "Target turf races where you have surface advantage"
            ]
        };
    }
    
    /**
     * Get race strategy recommendations for Arabian horses
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations
     */
    getRaceStrategy(raceInfo) {
        const { distance, surface } = raceInfo;
        
        const baseStrategy = {
            primary: "Endurance-based racing",
            reasoning: "Use superior stamina for sustained high performance"
        };
        
        // Distance-based strategy (Arabians prefer longer races)
        if (distance <= 1400) {
            baseStrategy.recommended = "MID to LATE";
            baseStrategy.tips = "Conserve energy early, use stamina advantage in final stretch";
            baseStrategy.warning = "Sprint races don't favor your stamina specialization";
        } else if (distance <= 1800) {
            baseStrategy.recommended = "MID";
            baseStrategy.tips = "Good distance for your abilities - maintain steady pace";  
        } else {
            baseStrategy.recommended = "FRONT to MID";
            baseStrategy.tips = "IDEAL DISTANCE! Use stamina to maintain high pace throughout";
            baseStrategy.advantage = "Long races play to your breed strengths";
        }
        
        // Surface preference
        if (surface.toLowerCase() === 'turf') {
            baseStrategy.surfaceBonus = "8% performance bonus on turf tracks";
        } else {
            baseStrategy.surfaceNote = "4% performance penalty on dirt tracks";
        }
        
        return baseStrategy;
    }
    
    /**
     * Get breed-specific achievement possibilities  
     * @returns {Array<Object>} Possible achievements for this breed
     */
    getPossibleAchievements() {
        return [
            {
                name: "Marathon Master",
                description: "Win all races 1800m+ in a single career",
                difficulty: "Hard"
            },
            {
                name: "Stamina Supreme",
                description: "Reach the 110 stamina cap",
                difficulty: "Medium"
            },
            {
                name: "Turf Specialist", 
                description: "Win 3 consecutive races on turf surfaces",
                difficulty: "Medium"
            },
            {
                name: "Endurance Legend",
                description: "Complete a career with 100+ average stamina across all races",
                difficulty: "Expert"
            },
            {
                name: "Desert Wind",
                description: "Win a championship race with 15+ stamina advantage over rivals",
                difficulty: "Hard"
            }
        ];
    }
    
    /**
     * Calculate breed-specific bonus multipliers
     * @param {string} situation - The situation type
     * @param {Object} context - Additional context data
     * @returns {number} Bonus multiplier
     */
    getBonusMultiplier(situation, context = {}) {
        switch (situation) {
            case 'longDistance':
                // Significant bonus for races 1800m+
                if (context.distance >= 1800) {
                    return 1.12;
                }
                return 1.0;
                
            case 'endurance':
                // Bonus when energy levels are maintained well
                if (context.energyPercent > 0.8) {
                    return 1.05;
                }
                return 1.0;
                
            case 'turfRacing':
                // Natural turf advantage already in surfacePreferences
                return this.getSurfacePreference('turf');
                
            case 'staminaTraining':
                // Extra bonus when training stamina
                return 1.15;
                
            case 'lateralMovement':
                // Small penalty when forced into sprint strategies
                if (context.racingStyle === 'FRONT' && context.distance < 1400) {
                    return 0.95;
                }
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    /**
     * Special method for Arabian-specific energy management
     * @param {number} baseEnergy - Base energy consumption
     * @param {string} activity - The activity consuming energy  
     * @returns {number} Modified energy consumption
     */
    getEnergyEfficiency(baseEnergy, activity) {
        switch (activity) {
            case 'staminaTraining':
                // Arabians are more efficient at stamina training
                return Math.round(baseEnergy * 0.9);
                
            case 'longRace':
                // Better energy conservation in long races
                return Math.round(baseEnergy * 0.93);
                
            case 'turfRacing':
                // More efficient on preferred surface
                return Math.round(baseEnergy * 0.96);
                
            default:
                return baseEnergy;
        }
    }
    
    /**
     * Get display information with Arabian-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Medium",
            playstyle: "Endurance and long-distance specialist", 
            idealFor: "Players who prefer strategic, sustained racing",
            notableFeature: "110 stamina cap and 25% faster stamina development",
            bestRaces: "Mile Championship, Dirt Stakes, Turf Cup Final",
            surfacePreference: "Turf (+8% performance)"
        };
    }
}

module.exports = Arabian;