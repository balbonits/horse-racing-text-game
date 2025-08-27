const RacingSpecialization = require('./RacingSpecialization');

/**
 * Miler specialization - The balanced tactical racer
 * 
 * Milers excel in middle-distance races requiring a balance of speed,
 * stamina, and tactical awareness. They are versatile tacticians who
 * can adapt their racing style based on pace and competition.
 * 
 * Characteristics:
 * - Optimal distances: 1400-1800m
 * - Balanced stat focus: Speed (40%), Stamina (35%), Power (25%)
 * - High tactical flexibility and racing IQ
 * - Can use any racing style effectively
 * 
 * @class Miler
 * @extends RacingSpecialization
 */
class Miler extends RacingSpecialization {
    constructor() {
        const config = {
            optimalDistances: [1400, 1800],
            statWeighting: {
                speed: 0.40,    // Important but not dominant
                stamina: 0.35,  // Critical for mile+ distances
                power: 0.25     // Needed for tactical positioning and kicks
            },
            trainingBonus: {
                speed: 1.10,    // Moderate speed development
                stamina: 1.15,  // Enhanced stamina development
                power: 1.12     // Good power development
            },
            description: "Middle-distance tacticians who excel in the classic mile+ races. Perfect balance of speed and stamina with superior tactical flexibility for 1400-1800m distances.",
            strengths: [
                "Tactical flexibility and racing adaptability",
                "Balanced stat development across all areas", 
                "Superior performance in classic mile races",
                "Excellent energy management and race pacing"
            ],
            preferredRacingStyles: ['FRONT', 'MID', 'LATE'] // Can use any style effectively
        };
        
        super('Miler', config);
    }
    
    /**
     * Get specialized training recommendations for Milers
     * @param {Object} currentStats - Current horse stats
     * @param {number} careerTurn - Current turn in career
     * @returns {Array<string>} Training recommendations
     */
    getTrainingRecommendations(currentStats, careerTurn) {
        const baseRecommendations = super.getTrainingRecommendations(currentStats, careerTurn);
        const milerRecommendations = [];
        
        // Early career (turns 1-8) - Balanced foundation
        if (careerTurn <= 8) {
            milerRecommendations.push("Build balanced foundation - no stat should lag significantly");
            milerRecommendations.push("Focus on stamina and speed equally for mile preparation");
            
            const avgStat = (currentStats.speed + currentStats.stamina + currentStats.power) / 3;
            const statGaps = [];
            
            if (currentStats.speed < avgStat * 0.9) statGaps.push('speed');
            if (currentStats.stamina < avgStat * 0.9) statGaps.push('stamina'); 
            if (currentStats.power < avgStat * 0.9) statGaps.push('power');
            
            if (statGaps.length > 0) {
                milerRecommendations.push(`Address stat imbalances in: ${statGaps.join(', ')}`);
            } else {
                milerRecommendations.push("Excellent balance - continue developing all stats evenly");
            }
        }
        
        // Mid career (turns 9-16) - Tactical refinement  
        else if (careerTurn <= 16) {
            milerRecommendations.push("Refine balance for championship mile races");
            milerRecommendations.push("Build tactical advantage through well-rounded development");
            
            if (currentStats.stamina < 60) {
                milerRecommendations.push("Priority: Stamina to 60+ for mile+ distance capability");
            }
            if (currentStats.speed < 55) {
                milerRecommendations.push("Speed development needed for competitive positioning");
            }
            if (currentStats.power < 50) {
                milerRecommendations.push("Power training for tactical acceleration and kicks");
            }
            
            // Advanced tactical recommendations
            if (Math.min(currentStats.speed, currentStats.stamina, currentStats.power) >= 50) {
                milerRecommendations.push("Strong foundation - focus on specialized tactics training");
            }
        }
        
        // Late career (turns 17-24) - Championship preparation
        else {
            milerRecommendations.push("Perfect balance for championship performances");
            milerRecommendations.push("Fine-tune weakest stat while maintaining advantages");
            
            const statRanking = [
                { name: 'speed', value: currentStats.speed },
                { name: 'stamina', value: currentStats.stamina },
                { name: 'power', value: currentStats.power }
            ].sort((a, b) => a.value - b.value);
            
            const weakest = statRanking[0];
            const strongest = statRanking[2];
            
            if (strongest.value - weakest.value > 15) {
                milerRecommendations.push(`Address ${weakest.name} gap - currently ${weakest.value} vs ${strongest.value} ${strongest.name}`);
            } else {
                milerRecommendations.push("Excellent balance achieved - focus on peak performance");
            }
        }
        
        return [...baseRecommendations, ...milerRecommendations];
    }
    
    /**
     * Get race strategy specific to Miler specialization
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations
     */
    getRaceStrategy(raceInfo) {
        const baseStrategy = super.getRaceStrategy(raceInfo);
        const { distance, surface, rivals } = raceInfo;
        
        // Distance-specific strategy for Milers
        if (distance <= 1200) {
            baseStrategy.strategy = "MID to LATE - Use tactical advantage";
            baseStrategy.tips = "Let sprinters burn out early, finish with sustained kick";
            baseStrategy.confidence = "MEDIUM - Outside optimal range but tactics can overcome";
        } else if (distance <= 1600) {
            baseStrategy.strategy = "ANY STYLE - Perfect tactical flexibility";
            baseStrategy.tips = "Adapt to race pace - FRONT if slow pace, LATE if fast pace";
            baseStrategy.confidence = "VERY HIGH - Ideal distance for miler tactics";
        } else if (distance <= 1800) {
            baseStrategy.strategy = "MID to FRONT - Control the pace";
            baseStrategy.tips = "Use balanced stats to maintain strong position throughout";
            baseStrategy.confidence = "HIGH - Still within comfort zone";
        } else {
            baseStrategy.strategy = "MID - Tactical positioning crucial";
            baseStrategy.tips = "Stay with leaders, use speed advantage over pure stayers";
            baseStrategy.confidence = "MEDIUM - Stayers have natural advantage at this distance";
        }
        
        // Tactical advice based on competition
        if (rivals) {
            const sprinters = rivals.filter(r => r.specialization === 'Sprinter').length;
            const stayers = rivals.filter(r => r.specialization === 'Stayer').length;
            
            if (sprinters > stayers) {
                baseStrategy.tacticalAdvice = "Multiple sprinters - let them duel early, finish strong";
            } else if (stayers > sprinters) {
                baseStrategy.tacticalAdvice = "Stayer-heavy field - use speed advantage early";
            } else {
                baseStrategy.tacticalAdvice = "Balanced field - use tactical flexibility advantage";
            }
        }
        
        return baseStrategy;
    }
    
    /**
     * Calculate tactical bonus based on race situation
     * @param {Object} raceContext - Current race situation
     * @returns {number} Tactical performance multiplier
     */
    getTacticalBonus(raceContext) {
        const { phase, position, pace, fieldSize } = raceContext;
        let bonus = 1.0;
        
        // Tactical positioning bonus (avoiding trouble)
        if (position >= 3 && position <= 6 && fieldSize >= 8) {
            bonus *= 1.05; // Good tactical position
        }
        
        // Pace adaptation bonus
        if (phase === 'middle') {
            if (pace === 'slow' && position <= 4) {
                bonus *= 1.08; // Taking advantage of slow pace
            } else if (pace === 'fast' && position >= 5) {
                bonus *= 1.06; // Positioned for fast pace finish
            }
        }
        
        // Final quarter tactical bonus
        if (phase === 'finish') {
            bonus *= 1.12; // Milers excel in tactical finishes
        }
        
        // Balanced stats utilization bonus
        bonus *= 1.03; // Small but consistent tactical advantage
        
        return bonus;
    }
    
    /**
     * Get energy efficiency based on tactical racing
     * @param {number} baseEnergy - Base energy cost
     * @param {string} context - Racing context
     * @returns {number} Modified energy cost
     */
    getEnergyEfficiency(baseEnergy, context) {
        switch (context) {
            case 'mileRace':
                // Optimal efficiency in mile+ races
                return Math.round(baseEnergy * 0.88);
                
            case 'tacticalRacing':
                // Efficient when using tactical positioning
                return Math.round(baseEnergy * 0.92);
                
            case 'paceAdaptation':
                // Energy savings from reading pace correctly
                return Math.round(baseEnergy * 0.90);
                
            case 'balancedApproach':
                // Efficiency from not over-specializing
                return Math.round(baseEnergy * 0.95);
                
            default:
                return baseEnergy;
        }
    }
    
    /**
     * Get achievements possible with Miler specialization
     * @returns {Array<Object>} Possible achievements
     */
    getPossibleAchievements() {
        return [
            {
                name: "Mile Master",
                description: "Win the Mile Championship and any other 1400-1800m race",
                difficulty: "Medium"
            },
            {
                name: "Tactical Genius", 
                description: "Win races using all three racing styles (FRONT, MID, LATE)",
                difficulty: "Hard"
            },
            {
                name: "Balanced Excellence",
                description: "Achieve 75+ in all three stats as a Miler",
                difficulty: "Medium"
            },
            {
                name: "Versatile Champion",
                description: "Win races at sprint, mile, and long distances in same career",
                difficulty: "Hard"
            },
            {
                name: "Pace Setter",
                description: "Win 3 races by controlling the pace from the front",
                difficulty: "Medium"
            },
            {
                name: "Come From Behind",
                description: "Win 2 races from 6th place or worse at the halfway point",
                difficulty: "Hard"
            }
        ];
    }
    
    /**
     * Get tactical insights for different race scenarios
     * @returns {Object} Tactical guidance for various situations
     */
    getTacticalInsights() {
        return {
            fastPace: "Position behind leaders, prepare for late kick when sprinters tire",
            slowPace: "Consider taking the initiative - milers can control slow pace effectively",
            balancedPace: "Perfect for tactical flexibility - adapt to late race developments",
            smallField: "Use speed advantage - less traffic allows for tactical movement",
            largeField: "Stay out of trouble early, use balanced stats to navigate through field",
            experienced: "Trust your tactical instincts and balanced preparation",
            advice: [
                "Watch early pace - fast favors your closing kick, slow favors early positioning",
                "Position 3rd-6th at halfway point for maximum tactical flexibility",
                "Use power for tactical acceleration, not just final sprint",
                "Balanced stats allow adaptation to any race scenario"
            ]
        };
    }
    
    /**
     * Get display information with Miler-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Medium-Hard",
            playstyle: "Tactical and adaptable with balanced approach",
            idealFor: "Strategic players who enjoy reading race dynamics",
            notableFeature: "15% stamina bonus, 12% power bonus, tactical flexibility",
            bestRaces: "Mile Championship and middle-distance classics",
            racingPhilosophy: "Adapt and overcome - use balance to exploit others' weaknesses",
            statPriority: "Speed ≈ Stamina > Power (balanced development)",
            tacticalAdvantage: "Can effectively use any racing style based on race conditions"
        };
    }
}

module.exports = Miler;