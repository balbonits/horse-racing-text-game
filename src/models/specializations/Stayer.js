const RacingSpecialization = require('./RacingSpecialization');

/**
 * Stayer specialization - The marathon endurance champion
 * 
 * Stayers excel in long-distance races where stamina and sustained
 * performance are paramount. They are masters of energy management
 * and excel at wearing down the competition over extended distances.
 * 
 * Characteristics:
 * - Optimal distances: 1800m+
 * - Primary focus: Stamina (50%), with Speed (30%) and Power (20%)
 * - Preferred styles: Mid-pack and closing tactics
 * - Superior energy efficiency and endurance
 * 
 * @class Stayer
 * @extends RacingSpecialization
 */
class Stayer extends RacingSpecialization {
    constructor() {
        const config = {
            optimalDistances: [1800, 2400],
            statWeighting: {
                stamina: 0.50,  // Dominant focus - endurance is key
                speed: 0.30,    // Still needed for competitive finish
                power: 0.20     // Least important but needed for positioning
            },
            trainingBonus: {
                stamina: 1.30,  // Exceptional stamina development
                speed: 0.95,    // Slightly reduced speed focus
                power: 0.90     // Reduced power development emphasis
            },
            description: "Long-distance endurance specialists who dominate races 1800m+. Master energy management and sustained performance to wear down opponents over extended distances.",
            strengths: [
                "Exceptional endurance and energy management",
                "Superior performance in marathon distances",
                "Devastating late-race acceleration when rivals tire",
                "Unmatched stamina development potential"
            ],
            preferredRacingStyles: ['MID', 'LATE'] // Favor tactical positioning and closing
        };
        
        super('Stayer', config);
    }
    
    /**
     * Get specialized training recommendations for Stayers
     * @param {Object} currentStats - Current horse stats
     * @param {number} careerTurn - Current turn in career
     * @returns {Array<string>} Training recommendations
     */
    getTrainingRecommendations(currentStats, careerTurn) {
        const baseRecommendations = super.getTrainingRecommendations(currentStats, careerTurn);
        const stayerRecommendations = [];
        
        // Early career (turns 1-8) - Endurance foundation
        if (careerTurn <= 8) {
            stayerRecommendations.push("Build massive stamina foundation - your ultimate weapon");
            stayerRecommendations.push("Don't neglect speed completely - you'll need finishing pace");
            
            if (currentStats.stamina < 45) {
                stayerRecommendations.push("Priority: Heavy stamina training for distance capability");
            }
            if (currentStats.speed < 30) {
                stayerRecommendations.push("Minimum speed needed - can't win without some pace");
            }
            if (currentStats.stamina < currentStats.speed + 10) {
                stayerRecommendations.push("Stamina should significantly exceed speed at this stage");
            }
        }
        
        // Mid career (turns 9-16) - Specialization mastery
        else if (careerTurn <= 16) {
            stayerRecommendations.push("Push stamina toward elite levels (80+)");
            stayerRecommendations.push("Balance with strategic speed development for race competitiveness");
            
            if (currentStats.stamina < 70) {
                stayerRecommendations.push("Continue stamina focus - aim for 75+ by championship races");
            }
            if (currentStats.speed < 50 && currentStats.stamina >= 65) {
                stayerRecommendations.push("Add speed training - you need finishing pace to utilize stamina");
            }
            if (currentStats.power < 40) {
                stayerRecommendations.push("Some power needed for tactical positioning in long races");
            }
        }
        
        // Late career (turns 17-24) - Marathon mastery
        else {
            stayerRecommendations.push("Perfect your stamina dominance (85+) for championship distances");
            stayerRecommendations.push("Fine-tune speed for devastating late-race kicks");
            
            if (currentStats.stamina >= 80) {
                if (currentStats.speed < 60) {
                    stayerRecommendations.push("Add speed training - your stamina is elite, now add finishing punch");
                } else {
                    stayerRecommendations.push("Perfect balance achieved - maintain peak form");
                }
            } else {
                stayerRecommendations.push("Push stamina to 80+ for championship distance dominance");
            }
            
            if (currentStats.stamina > currentStats.speed + 25) {
                stayerRecommendations.push("Consider balancing - extreme stamina needs some speed support");
            }
        }
        
        return [...baseRecommendations, ...stayerRecommendations];
    }
    
    /**
     * Get race strategy specific to Stayer specialization
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations
     */
    getRaceStrategy(raceInfo) {
        const baseStrategy = super.getRaceStrategy(raceInfo);
        const { distance, surface, pace } = raceInfo;
        
        // Distance-specific strategy for Stayers
        if (distance <= 1400) {
            baseStrategy.strategy = "LATE - Survival and damage control";
            baseStrategy.tips = "Stay close enough to have a chance, hope for pace collapse";
            baseStrategy.confidence = "LOW - Distance strongly favors sprinters";
            baseStrategy.warning = "Sprint races are your greatest challenge - focus on not finishing last";
        } else if (distance <= 1600) {
            baseStrategy.strategy = "MID to LATE - Conservative approach";
            baseStrategy.tips = "Position mid-pack, prepare for sustained finish drive";
            baseStrategy.confidence = "MEDIUM-LOW - Mile races favor tactical speed";
        } else if (distance <= 2000) {
            baseStrategy.strategy = "MID - Perfect positioning for stamina advantage";
            baseStrategy.tips = "Sit behind leaders, use stamina to wear them down in final 600m";
            baseStrategy.confidence = "HIGH - Distance starts favoring endurance";
        } else {
            baseStrategy.strategy = "MID to FRONT - Dominate through endurance";
            baseStrategy.tips = "IDEAL DISTANCE! Use stamina to maintain relentless pace";
            baseStrategy.confidence = "VERY HIGH - Marathon distances play to your strengths";
            baseStrategy.advantage = "Long races strongly favor stayers - this is your domain";
        }
        
        // Pace-based tactical advice
        if (pace) {
            if (pace === 'fast') {
                baseStrategy.paceAdvice = "Perfect! Fast early pace will tire your rivals - position for strong finish";
            } else if (pace === 'slow') {
                baseStrategy.paceAdvice = "Slow pace reduces stamina advantage - consider more aggressive positioning";
            }
        }
        
        return baseStrategy;
    }
    
    /**
     * Calculate endurance performance bonus
     * @param {Object} raceContext - Current race situation
     * @returns {number} Endurance performance multiplier
     */
    getEnduranceBonus(raceContext) {
        const { phase, distance, energyRemaining, position } = raceContext;
        let bonus = 1.0;
        
        // Late race endurance dominance
        if (phase === 'finish' && distance >= 1800) {
            if (energyRemaining > 0.7) {
                bonus *= 1.25; // Massive bonus when others are tired
            } else if (energyRemaining > 0.5) {
                bonus *= 1.15;
            }
        }
        
        // Distance-based endurance bonus
        if (distance >= 2000) {
            bonus *= 1.18; // Significant bonus at marathon distances
        } else if (distance >= 1800) {
            bonus *= 1.10;
        }
        
        // Energy efficiency bonus (using stamina effectively)
        if (energyRemaining > 0.8 && phase !== 'start') {
            bonus *= 1.08;
        }
        
        // Late positioning bonus (stayers finish strong)
        if (phase === 'finish' && position >= 6) {
            bonus *= 1.12; // Closing kick bonus
        }
        
        return bonus;
    }
    
    /**
     * Calculate energy efficiency for marathon racing
     * @param {number} baseEnergy - Base energy cost
     * @param {string} context - Racing context
     * @returns {number} Modified energy cost
     */
    getEnergyEfficiency(baseEnergy, context) {
        switch (context) {
            case 'longRace':
                // Exceptional efficiency in races 1800m+
                return Math.round(baseEnergy * 0.75);
                
            case 'enduranceRacing':
                // Efficient when using stamina-focused tactics
                return Math.round(baseEnergy * 0.80);
                
            case 'lateRaceKick':
                // Energy savings from superior fitness in final stages
                return Math.round(baseEnergy * 0.85);
                
            case 'staminaTraining':
                // Very efficient at stamina-focused training
                return Math.round(baseEnergy * 0.70);
                
            case 'sprintRacing':
                // Less efficient when forced into sprint racing
                return Math.round(baseEnergy * 1.20);
                
            default:
                return baseEnergy;
        }
    }
    
    /**
     * Get achievements possible with Stayer specialization
     * @returns {Array<Object>} Possible achievements
     */
    getPossibleAchievements() {
        return [
            {
                name: "Marathon Master",
                description: "Win all races 1800m+ in a single career",
                difficulty: "Medium"
            },
            {
                name: "Stamina Supreme",
                description: "Achieve 90+ stamina as a Stayer",
                difficulty: "Hard"
            },
            {
                name: "Iron Horse",
                description: "Complete a race with 80%+ energy remaining",
                difficulty: "Medium"
            },
            {
                name: "Late Surge", 
                description: "Win a race after being 6th or worse at the 3/4 point",
                difficulty: "Medium"
            },
            {
                name: "Distance Destroyer",
                description: "Win the Turf Cup Final by 5+ lengths",
                difficulty: "Hard"
            },
            {
                name: "Endurance Legend",
                description: "Achieve 85+ stamina and win 3 races 2000m+",
                difficulty: "Expert"
            },
            {
                name: "Energy Miser",
                description: "Win 2 consecutive races with 70%+ energy remaining",
                difficulty: "Hard"
            }
        ];
    }
    
    /**
     * Get energy management strategies specific to Stayers
     * @returns {Object} Energy management guidance
     */
    getEnergyManagement() {
        return {
            earlyRace: "Conserve energy - let others set pace, track leaders loosely",
            midRace: "Begin gradual pressure - use superior stamina to maintain contact",
            lateRace: "Unleash endurance advantage - sustained drive while others tire",
            trainingStrategy: "Focus 60% stamina, 30% speed, 10% power for optimal balance",
            raceSelection: [
                "Target 1800m+ races where stamina dominates",
                "Avoid sprint races unless necessary for career progression", 
                "Look for fast early pace scenarios that tire speed horses"
            ],
            tactical: [
                "Position 4th-8th at halfway point to avoid early pace pressure",
                "Make sustained move at 3/4 point when rivals begin to tire",
                "Trust your stamina - you'll be strongest in final 400m"
            ]
        };
    }
    
    /**
     * Get weaknesses and mitigation strategies for Stayers
     * @returns {Object} Weakness analysis and countermeasures
     */
    getWeaknesses() {
        return {
            primaryWeakness: "Limited speed for sprint races and tactical acceleration",
            challengingDistances: "Races under 1600m favor speed-based specializations",
            strategicCounters: [
                "Fast finishing speed can neutralize stamina advantage",
                "Slow early pace reduces endurance differential",
                "Small fields limit ability to benefit from pace pressure"
            ],
            mitigation: [
                "Develop minimum 55+ speed for tactical competitiveness",
                "Use positioning to avoid being boxed in during sprint races",
                "Target races with large fields and aggressive early pace",
                "Build enough power for tactical moves when needed"
            ],
            raceManagement: [
                "In sprint races: Sit mid-pack, hope for pace collapse",
                "In mile races: Track leaders closely, use stamina for sustained finish",
                "In long races: Control the tempo and impose your stamina"
            ]
        };
    }
    
    /**
     * Get display information with Stayer-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Hard",
            playstyle: "Patient endurance racing with devastating late-race kicks",
            idealFor: "Strategic players who enjoy energy management and late-race tactics",
            notableFeature: "30% stamina training bonus and superior energy efficiency",
            bestRaces: "Dirt Stakes, Turf Cup Final, and marathon distances",
            racingPhilosophy: "Patience wins races - outlast the field through superior stamina",
            statPriority: "Stamina >> Speed > Power",
            tacticalStrength: "Late-race acceleration when rivals are exhausted"
        };
    }
}

module.exports = Stayer;