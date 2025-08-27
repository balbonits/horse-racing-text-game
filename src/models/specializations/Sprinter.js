const RacingSpecialization = require('./RacingSpecialization');

/**
 * Sprinter specialization - Built for speed and explosive power
 * 
 * Sprinters excel in short-distance races where speed and acceleration
 * are the primary factors. They prefer front-running tactics and
 * perform best in races 1400m and shorter.
 * 
 * Characteristics:
 * - Optimal distances: 1000-1400m
 * - Primary stats: Speed (50%) and Power (35%)
 * - Secondary stat: Stamina (15%)
 * - Preferred styles: Front runner, some stalking
 * 
 * @class Sprinter
 * @extends RacingSpecialization
 */
class Sprinter extends RacingSpecialization {
    constructor() {
        const config = {
            optimalDistances: [1000, 1400],
            statWeighting: {
                speed: 0.50,    // Primary focus - raw speed
                power: 0.35,    // Critical for acceleration
                stamina: 0.15   // Minimal requirement for short races
            },
            trainingBonus: {
                speed: 1.25,    // Enhanced speed development
                power: 1.20,    // Enhanced power development  
                stamina: 0.90   // Reduced stamina development focus
            },
            description: "Short-distance specialists built for explosive speed and quick acceleration. Dominate sprint races through superior gate speed and sustained pace over 1000-1400m distances.",
            strengths: [
                "Explosive gate speed and early positioning",
                "Superior acceleration in final stretches",
                "Dominant performance in sprint distances",
                "Energy-efficient racing over short distances"
            ],
            preferredRacingStyles: ['FRONT', 'MID'] // Favor aggressive early positioning
        };
        
        super('Sprinter', config);
    }
    
    /**
     * Get specialized training recommendations for Sprinters
     * @param {Object} currentStats - Current horse stats
     * @param {number} careerTurn - Current turn in career
     * @returns {Array<string>} Training recommendations
     */
    getTrainingRecommendations(currentStats, careerTurn) {
        const baseRecommendations = super.getTrainingRecommendations(currentStats, careerTurn);
        const sprinterRecommendations = [];
        
        // Early career (turns 1-8) - Foundation building
        if (careerTurn <= 8) {
            sprinterRecommendations.push("Prioritize speed training to establish gate speed advantage");
            sprinterRecommendations.push("Build power for explosive acceleration out of the gate");
            
            if (currentStats.speed < 40) {
                sprinterRecommendations.push("Focus heavily on speed - your greatest weapon");
            }
            if (currentStats.power < 35) {
                sprinterRecommendations.push("Don't neglect power training for race positioning");
            }
        }
        
        // Mid career (turns 9-16) - Specialization refinement
        else if (careerTurn <= 16) {
            sprinterRecommendations.push("Maximize speed and power for championship sprint races");
            sprinterRecommendations.push("Maintain minimum stamina for race completion");
            
            if (currentStats.speed < 70) {
                sprinterRecommendations.push("Speed is still your priority - push toward 80+");
            }
            if (currentStats.power < 60) {
                sprinterRecommendations.push("Power training for final sprint acceleration");
            }
            if (currentStats.stamina < 40) {
                sprinterRecommendations.push("Add some stamina training to avoid late-race fade");
            }
        }
        
        // Late career (turns 17-24) - Peak performance
        else {
            sprinterRecommendations.push("Fine-tune speed to 85+ for maximum sprint performance");
            sprinterRecommendations.push("Balance power and stamina for championship races");
            
            if (currentStats.speed >= 80 && currentStats.power >= 70) {
                sprinterRecommendations.push("Consider stamina training to maintain energy in final races");
            }
        }
        
        return [...baseRecommendations, ...sprinterRecommendations];
    }
    
    /**
     * Get race strategy specific to Sprinter specialization
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations
     */
    getRaceStrategy(raceInfo) {
        const baseStrategy = super.getRaceStrategy(raceInfo);
        const { distance, surface } = raceInfo;
        
        // Distance-specific strategy for Sprinters
        if (distance <= 1200) {
            baseStrategy.strategy = "FRONT - Wire to wire dominance";
            baseStrategy.tips = "Use explosive speed to lead from gate to finish";
            baseStrategy.confidence = "VERY HIGH - Perfect distance for sprinters";
        } else if (distance <= 1400) {
            baseStrategy.strategy = "FRONT or MID - Early positioning crucial";
            baseStrategy.tips = "Get good position early, save energy for final 200m kick";
            baseStrategy.confidence = "HIGH - Still within optimal range";
        } else if (distance <= 1600) {
            baseStrategy.strategy = "MID - Conservative approach needed";
            baseStrategy.tips = "Stay close to leaders, rely on superior speed in stretch";
            baseStrategy.confidence = "MEDIUM - Outside comfort zone";
        } else {
            baseStrategy.strategy = "MID to LATE - Survival mode";
            baseStrategy.tips = "Conserve energy early, hope for closing kick";
            baseStrategy.confidence = "LOW - Distance strongly favors stayers";
            baseStrategy.warning = "Long races significantly disadvantage sprinters";
        }
        
        // Surface considerations
        if (surface.toLowerCase() === 'dirt') {
            baseStrategy.surfaceNote = "Dirt tracks can favor speed - use aggressive tactics";
        } else {
            baseStrategy.surfaceNote = "Turf may require more tactical approach";
        }
        
        return baseStrategy;
    }
    
    /**
     * Calculate energy usage efficiency for sprint racing
     * @param {number} baseEnergy - Base energy cost
     * @param {string} context - Racing context
     * @returns {number} Modified energy cost
     */
    getEnergyEfficiency(baseEnergy, context) {
        switch (context) {
            case 'shortRace':
                // More efficient in races ≤1400m
                return Math.round(baseEnergy * 0.85);
                
            case 'frontRunning':
                // Efficient when using preferred front-running style
                return Math.round(baseEnergy * 0.90);
                
            case 'finalSprint':
                // Efficient in final sprint phases
                return Math.round(baseEnergy * 0.88);
                
            case 'longRace':
                // Less efficient in long races
                return Math.round(baseEnergy * 1.15);
                
            default:
                return baseEnergy;
        }
    }
    
    /**
     * Get performance bonuses specific to sprinter racing
     * @param {Object} raceContext - Context about the race situation
     * @returns {number} Performance multiplier
     */
    getPerformanceBonus(raceContext) {
        const { phase, position, distance, pace } = raceContext;
        let bonus = 1.0;
        
        // Early race positioning bonus (first 25% of race)
        if (phase === 'early' && position <= 3) {
            bonus *= 1.12;
        }
        
        // Final sprint bonus for short races
        if (phase === 'finish' && distance <= 1400) {
            bonus *= 1.20;
        }
        
        // Fast pace bonus (sprinters handle pace better)
        if (pace === 'fast' && distance <= 1400) {
            bonus *= 1.08;
        }
        
        // Gate speed bonus (first 200m)
        if (phase === 'start') {
            bonus *= 1.15;
        }
        
        return bonus;
    }
    
    /**
     * Get achievements possible with Sprinter specialization
     * @returns {Array<Object>} Possible achievements
     */
    getPossibleAchievements() {
        return [
            {
                name: "Lightning Bolt",
                description: "Win all sprint races (≤1400m) in a single career",
                difficulty: "Hard"
            },
            {
                name: "Gate Master",
                description: "Take the lead in the first 200m of 5 consecutive races",
                difficulty: "Medium"
            },
            {
                name: "Speed Demon",
                description: "Achieve 90+ speed as a Sprinter",
                difficulty: "Medium"
            },
            {
                name: "Wire to Wire",
                description: "Win a race while leading from start to finish",
                difficulty: "Easy"
            },
            {
                name: "Sprint King",
                description: "Win the Maiden Sprint with a 10+ point speed advantage",
                difficulty: "Hard"
            },
            {
                name: "Power Sprinter",
                description: "Achieve 85+ speed and 75+ power in same career",
                difficulty: "Hard"
            }
        ];
    }
    
    /**
     * Get weaknesses and challenges for Sprinter horses
     * @returns {Object} Weakness information for strategic play
     */
    getWeaknesses() {
        return {
            primaryWeakness: "Stamina limitations in longer races",
            challengingDistances: "1800m+ races significantly favor other specializations",
            strategicCounters: [
                "Early pace pressure can drain energy reserves",
                "Slow early pace negates speed advantage",
                "Strong closers can out-kick tired sprinters"
            ],
            mitigation: [
                "Build minimum 50+ stamina for race completion",
                "Use tactical positioning in longer races",
                "Focus energy management over aggressive early pace"
            ]
        };
    }
    
    /**
     * Get display information with Sprinter-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Medium",
            playstyle: "Aggressive front-running with explosive early speed",
            idealFor: "Players who enjoy fast-paced, high-speed racing tactics",
            notableFeature: "25% speed training bonus and 20% power training bonus",
            bestRaces: "Maiden Sprint and short championship races",
            racingPhilosophy: "Speed kills - get to the front and stay there",
            statPriority: "Speed > Power > Stamina"
        };
    }
}

module.exports = Sprinter;