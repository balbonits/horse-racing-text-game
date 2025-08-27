const Breed = require('./Breed');

/**
 * Quarter Horse breed - The sprint specialist
 * 
 * Quarter Horses are built for explosive speed and power over short distances.
 * They dominate sprint races and have a natural affinity for dirt tracks.
 * Their muscular build provides exceptional acceleration and burst speed.
 * 
 * Characteristics:
 * - Enhanced speed cap (110 vs 100)
 * - Superior speed and power growth rates (1.25x speed, 1.15x power)
 * - Dirt surface preference (1.08x performance)
 * - Excellent for sprinter specialization and front-running strategies
 * 
 * @class QuarterHorse  
 * @extends Breed
 */
class QuarterHorse extends Breed {
    constructor() {
        const config = {
            statCaps: {
                speed: 110,    // Superior speed potential
                stamina: 90,   // Lower stamina ceiling
                power: 105     // Enhanced power potential
            },
            growthRates: {
                speed: 1.25,   // Superior speed development
                stamina: 0.85, // Slower stamina development
                power: 1.15    // Enhanced power development
            },
            surfacePreferences: {
                turf: 0.95,    // Slight turf disadvantage
                dirt: 1.08     // Natural dirt preference
            },
            description: "American-bred sprint champions. Exceptional speed and power make them dominant in short races and dirt track competitions.",
            strengths: [
                "Explosive sprint speed",
                "Superior acceleration power",
                "Natural dirt track advantage", 
                "Dominant front-running ability"
            ]
        };
        
        super('Quarter Horse', config);
    }
    
    /**
     * Get specific training recommendations for Quarter Horses
     * @returns {Object} Training recommendations
     */
    getTrainingRecommendations() {
        return {
            earlyCareer: [
                "Prioritize speed training - your greatest natural gift",
                "Supplement with power training for acceleration",
                "Don't ignore stamina completely - you'll need endurance for longer races"
            ],
            midCareer: [
                "Push speed to the 110 cap as early as possible",
                "Build power to 105 cap for maximum acceleration",
                "Balance with strategic stamina training for race completion"
            ],
            lateCareer: [
                "Fine-tune stamina to handle championship distances",
                "Maximize power for explosive finishes",
                "Focus on dirt races where you have natural advantage"
            ]
        };
    }
    
    /**
     * Get race strategy recommendations for Quarter Horses
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations  
     */
    getRaceStrategy(raceInfo) {
        const { distance, surface } = raceInfo;
        
        const baseStrategy = {
            primary: "Front-running sprint tactics",
            reasoning: "Use explosive speed to take early lead and maintain it"
        };
        
        // Distance-based strategy (Quarter Horses prefer shorter races)
        if (distance <= 1400) {
            baseStrategy.recommended = "FRONT";
            baseStrategy.tips = "PERFECT DISTANCE! Use speed dominance from gate to wire";
            baseStrategy.advantage = "Sprint races play to your breed strengths";
        } else if (distance <= 1800) {
            baseStrategy.recommended = "FRONT to MID";
            baseStrategy.tips = "Use early speed but conserve some energy for finish";
            baseStrategy.caution = "Manage stamina carefully at this distance";
        } else {
            baseStrategy.recommended = "MID to LATE";
            baseStrategy.tips = "CHALLENGING DISTANCE - conserve early, rely on finishing kick";
            baseStrategy.warning = "Long races don't favor your sprint specialization";
        }
        
        // Surface preference
        if (surface.toLowerCase() === 'dirt') {
            baseStrategy.surfaceBonus = "8% performance bonus on dirt tracks";
        } else {
            baseStrategy.surfaceNote = "5% performance penalty on turf tracks";
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
                name: "Sprint King",
                description: "Win all races 1400m or shorter in a single career", 
                difficulty: "Medium"
            },
            {
                name: "Speed Demon",
                description: "Reach the 110 speed cap",
                difficulty: "Medium"
            },
            {
                name: "Dirt Track Dominator",
                description: "Win 3 consecutive races on dirt surfaces",
                difficulty: "Medium"
            },
            {
                name: "Gate to Wire",
                description: "Win a race leading from start to finish",
                difficulty: "Easy"
            },
            {
                name: "Lightning Strike",
                description: "Win a championship race with 15+ speed advantage over rivals",
                difficulty: "Hard"
            },
            {
                name: "Power Play",
                description: "Achieve 105+ power and win via front-running strategy", 
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
            case 'sprintDistance':
                // Significant bonus for races 1400m and under
                if (context.distance <= 1400) {
                    return 1.15;
                }
                return 1.0;
                
            case 'earlyPace':
                // Bonus when using front-running strategy
                if (context.racingStyle === 'FRONT') {
                    return 1.08;
                }
                return 1.0;
                
            case 'dirtRacing':
                // Natural dirt advantage already in surfacePreferences
                return this.getSurfacePreference('dirt');
                
            case 'speedTraining':
                // Extra bonus when training speed
                return 1.20;
                
            case 'powerTraining':
                // Bonus when training power 
                return 1.10;
                
            case 'acceleration':
                // Bonus for quick starts and position changes
                return 1.12;
                
            case 'enduranceRacing':
                // Penalty for very long races
                if (context.distance > 2000) {
                    return 0.92;
                }
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    /**
     * Special method for Quarter Horse-specific power calculations
     * @param {Object} raceContext - Context about the current race
     * @returns {number} Power bonus multiplier  
     */
    getPowerBonus(raceContext) {
        const { position, phase, distance } = raceContext;
        
        let bonus = 1.0;
        
        // Early race power bonus (first 25% of race)
        if (phase === 'early' && distance <= 1600) {
            bonus *= 1.15;
        }
        
        // Front position bonus
        if (position <= 2) {
            bonus *= 1.08;
        }
        
        // Final stretch power for sprints
        if (phase === 'finish' && distance <= 1400) {
            bonus *= 1.20;
        }
        
        return bonus;
    }
    
    /**
     * Calculate energy efficiency for Quarter Horse activities
     * @param {number} baseEnergy - Base energy consumption
     * @param {string} activity - The activity consuming energy
     * @returns {number} Modified energy consumption  
     */
    getEnergyEfficiency(baseEnergy, activity) {
        switch (activity) {
            case 'speedTraining':
                // Quarter Horses are more efficient at speed training
                return Math.round(baseEnergy * 0.85);
                
            case 'powerTraining':
                // Also efficient at power training
                return Math.round(baseEnergy * 0.9);
                
            case 'sprintRace':
                // More efficient in short races
                return Math.round(baseEnergy * 0.9);
                
            case 'dirtRacing':
                // Better energy management on preferred surface
                return Math.round(baseEnergy * 0.95);
                
            case 'frontRunning':
                // Efficient when using natural front-running style
                return Math.round(baseEnergy * 0.93);
                
            default:
                return baseEnergy;
        }
    }
    
    /**
     * Get display information with Quarter Horse-specific details  
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Medium",
            playstyle: "Aggressive front-running and sprint specialist",
            idealFor: "Players who prefer fast-paced, high-speed racing",
            notableFeature: "110 speed cap and 25% faster speed development", 
            bestRaces: "Maiden Sprint, early championship races",
            surfacePreference: "Dirt (+8% performance)",
            racingStyle: "Front-runner with explosive early pace"
        };
    }
}

module.exports = QuarterHorse;