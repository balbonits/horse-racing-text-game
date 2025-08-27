const Breed = require('./Breed');

/**
 * Thoroughbred horse breed - The balanced, versatile champion
 * 
 * Thoroughbreds are the most common racing breed, known for their
 * versatility and consistent performance across all distances and surfaces.
 * They represent the balanced approach with no major weaknesses.
 * 
 * Characteristics:
 * - Balanced stat caps (100 across all stats)
 * - Standard growth rates (1.0 multiplier)
 * - Equal surface preferences
 * - Excellent all-around choice for beginners
 * 
 * @class Thoroughbred
 * @extends Breed
 */
class Thoroughbred extends Breed {
    constructor() {
        const config = {
            statCaps: {
                speed: 100,
                stamina: 100, 
                power: 100
            },
            growthRates: {
                speed: 1.0,
                stamina: 1.0,
                power: 1.0
            },
            surfacePreferences: {
                turf: 1.0,
                dirt: 1.0
            },
            description: "The classic racing breed. Versatile and balanced with no major weaknesses, perfect for any racing strategy.",
            strengths: [
                "Balanced development",
                "Versatile racing ability", 
                "Consistent performance",
                "Beginner-friendly"
            ]
        };
        
        super('Thoroughbred', config);
    }
    
    /**
     * Get specific recommendations for Thoroughbred training
     * @returns {Object} Training recommendations
     */
    getTrainingRecommendations() {
        return {
            earlyCareer: [
                "Focus on building a solid foundation across all stats",
                "Media Day to build bond while discovering strengths", 
                "Balance training based on upcoming race distances"
            ],
            midCareer: [
                "Specialize based on preferred race types", 
                "Maintain balanced development to stay competitive",
                "Adapt strategy based on rival horses' specializations"
            ],
            lateCareer: [
                "Fine-tune stats for championship races",
                "Focus on your horse's discovered strengths",
                "Use versatility to counter specialized rivals"
            ]
        };
    }
    
    /**
     * Get race strategy recommendations for Thoroughbreds
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations
     */
    getRaceStrategy(raceInfo) {
        const { distance, surface } = raceInfo;
        
        // Thoroughbreds can adapt to any strategy
        const baseStrategy = {
            primary: "Adaptable to any style",
            reasoning: "Use your balanced stats to counter opponents' weaknesses"
        };
        
        // Distance-based recommendations
        if (distance <= 1400) {
            baseStrategy.recommended = "FRONT or MID";
            baseStrategy.tips = "Use balanced stats for consistent early pace";
        } else if (distance <= 1800) {
            baseStrategy.recommended = "MID";  
            baseStrategy.tips = "Perfect distance for balanced approach";
        } else {
            baseStrategy.recommended = "MID or LATE";
            baseStrategy.tips = "Maintain energy for strong finish";
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
                name: "Jack of All Trades",
                description: "Win races on both turf and dirt surfaces",
                difficulty: "Medium"
            },
            {
                name: "Consistent Champion", 
                description: "Finish in top 3 in every race of a career",
                difficulty: "Hard"
            },
            {
                name: "Balanced Excellence",
                description: "Achieve 85+ in all three stats",
                difficulty: "Medium"
            },
            {
                name: "Versatile Victor",
                description: "Win races at sprint, mile, and long distances",
                difficulty: "Hard"  
            }
        ];
    }
    
    /**
     * Calculate breed bonus for specific situations
     * @param {string} situation - The situation type
     * @param {Object} context - Additional context data
     * @returns {number} Bonus multiplier
     */
    getBonusMultiplier(situation, context = {}) {
        switch (situation) {
            case 'adaptability':
                // Small bonus when facing diverse competition
                return 1.02;
                
            case 'consistency':
                // Slight bonus to reduce performance variance
                return 1.01;
                
            case 'learning':
                // Bonus when training different stats in sequence
                if (context.varietyBonus) {
                    return 1.03;
                }
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    /**
     * Get display information with breed-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Beginner",
            playstyle: "Versatile and balanced",
            idealFor: "New players learning the game mechanics",
            notableFeature: "No weaknesses, consistent across all race types"
        };
    }
}

module.exports = Thoroughbred;