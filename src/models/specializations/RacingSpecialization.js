/**
 * Base class for horse racing specializations
 * 
 * Defines the structure and behavior for different racing specializations,
 * each optimized for specific distance ranges and race types.
 * 
 * @class RacingSpecialization
 */
class RacingSpecialization {
    /**
     * Create a racing specialization
     * @param {string} name - The specialization name (e.g., "Sprinter")
     * @param {Object} config - Specialization configuration object
     * @param {Array<number>} config.optimalDistances - Distance range [min, max] in meters
     * @param {Object} config.statWeighting - Performance weighting {speed: 0.5, stamina: 0.3, power: 0.2}
     * @param {Object} config.trainingBonus - Training effectiveness multipliers {speed: 1.2, stamina: 0.9}
     * @param {string} config.description - Specialization description for UI display
     * @param {Array<string>} config.strengths - List of specialization strengths
     * @param {Array<string>} config.preferredRacingStyles - Compatible racing styles
     */
    constructor(name, config) {
        this.name = name;
        this.optimalDistances = config.optimalDistances || [1000, 2400];
        this.statWeighting = config.statWeighting || { speed: 0.4, stamina: 0.4, power: 0.2 };
        this.trainingBonus = config.trainingBonus || { speed: 1.0, stamina: 1.0, power: 1.0 };
        this.description = config.description || `A ${name} specialization`;
        this.strengths = config.strengths || [];
        this.preferredRacingStyles = config.preferredRacingStyles || ['MID'];
        
        // Validation
        this.validateConfig();
    }
    
    /**
     * Validate specialization configuration
     * @throws {Error} If configuration is invalid
     */
    validateConfig() {
        // Validate optimal distances
        if (!Array.isArray(this.optimalDistances) || this.optimalDistances.length !== 2) {
            throw new Error(`Invalid optimal distances for ${this.name}: must be [min, max]`);
        }
        
        if (this.optimalDistances[0] >= this.optimalDistances[1]) {
            throw new Error(`Invalid distance range for ${this.name}: min must be less than max`);
        }
        
        // Validate stat weighting sums to 1.0 (approximately)
        const totalWeight = Object.values(this.statWeighting).reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(totalWeight - 1.0) > 0.01) {
            throw new Error(`Stat weighting must sum to 1.0 for ${this.name}, got ${totalWeight}`);
        }
        
        // Validate training bonuses are positive
        for (const [stat, bonus] of Object.entries(this.trainingBonus)) {
            if (typeof bonus !== 'number' || bonus <= 0) {
                throw new Error(`Invalid training bonus for ${stat} in ${this.name}: ${bonus}`);
            }
        }
    }
    
    /**
     * Calculate distance match factor for race performance
     * @param {number} raceDistance - The race distance in meters
     * @returns {number} Distance match multiplier (0.8 to 1.2)
     */
    getDistanceMatchFactor(raceDistance) {
        const [minOptimal, maxOptimal] = this.optimalDistances;
        
        // Perfect match - within optimal range
        if (raceDistance >= minOptimal && raceDistance <= maxOptimal) {
            return 1.15; // 15% bonus for optimal distance
        }
        
        // Calculate penalty based on distance from optimal range
        let distanceFromOptimal;
        if (raceDistance < minOptimal) {
            distanceFromOptimal = minOptimal - raceDistance;
        } else {
            distanceFromOptimal = raceDistance - maxOptimal;
        }
        
        // Penalty factor: 2% per 100m outside optimal range, min 0.8x
        const penaltyFactor = Math.max(0.8, 1.0 - (distanceFromOptimal / 100) * 0.02);
        return penaltyFactor;
    }
    
    /**
     * Get training effectiveness multiplier for a specific stat
     * @param {string} statName - The stat being trained
     * @returns {number} Training effectiveness multiplier
     */
    getTrainingBonus(statName) {
        return this.trainingBonus[statName] || 1.0;
    }
    
    /**
     * Calculate race performance using specialization stat weighting
     * @param {Object} stats - Horse stats {speed, stamina, power}
     * @param {number} raceDistance - Race distance in meters
     * @returns {number} Weighted performance score
     */
    calculatePerformance(stats, raceDistance) {
        // Calculate base performance using specialization weighting
        const basePerformance = 
            (stats.speed * this.statWeighting.speed) +
            (stats.stamina * this.statWeighting.stamina) +
            (stats.power * this.statWeighting.power);
        
        // Apply distance match factor
        const distanceFactor = this.getDistanceMatchFactor(raceDistance);
        
        return basePerformance * distanceFactor;
    }
    
    /**
     * Get recommended racing styles for this specialization
     * @returns {Array<string>} Array of recommended racing style names
     */
    getRecommendedRacingStyles() {
        return [...this.preferredRacingStyles];
    }
    
    /**
     * Check if a racing style is compatible with this specialization
     * @param {string} racingStyle - The racing style name
     * @returns {boolean} True if compatible
     */
    isCompatibleWithRacingStyle(racingStyle) {
        return this.preferredRacingStyles.includes(racingStyle);
    }
    
    /**
     * Get training recommendations specific to this specialization
     * @param {Object} currentStats - Current horse stats
     * @param {number} careerTurn - Current turn in career (1-24)
     * @returns {Array<string>} Array of training recommendations
     */
    getTrainingRecommendations(currentStats, careerTurn) {
        const recommendations = [];
        
        // Early career recommendations (turns 1-8)
        if (careerTurn <= 8) {
            recommendations.push(`Focus on ${this.getPrimaryStats().join(' and ')} training`);
            recommendations.push("Build foundation stats for specialization");
        }
        
        // Mid career recommendations (turns 9-16)
        else if (careerTurn <= 16) {
            const weakStats = this.getWeakStats(currentStats);
            if (weakStats.length > 0) {
                recommendations.push(`Address weak ${weakStats.join(' and ')} stats`);
            }
            recommendations.push("Optimize for upcoming championship races");
        }
        
        // Late career recommendations (turns 17-24)
        else {
            recommendations.push("Fine-tune stats for final races");
            recommendations.push("Focus on energy management and peak form");
        }
        
        return recommendations;
    }
    
    /**
     * Get the primary stats for this specialization (highest weighted)
     * @returns {Array<string>} Array of primary stat names
     */
    getPrimaryStats() {
        const sortedStats = Object.entries(this.statWeighting)
            .sort(([,a], [,b]) => b - a)
            .map(([stat]) => stat);
        
        // Return top 2 stats
        return sortedStats.slice(0, 2);
    }
    
    /**
     * Identify weak stats that need attention
     * @param {Object} stats - Current horse stats
     * @returns {Array<string>} Array of stat names that are below specialization expectations
     */
    getWeakStats(stats) {
        const weakStats = [];
        const avgStat = (stats.speed + stats.stamina + stats.power) / 3;
        
        for (const [statName, weight] of Object.entries(this.statWeighting)) {
            const expectedLevel = avgStat * (weight / 0.33); // 0.33 is balanced weight
            if (stats[statName] < expectedLevel * 0.9) { // 10% tolerance
                weakStats.push(statName);
            }
        }
        
        return weakStats;
    }
    
    /**
     * Get race strategy recommendations for this specialization
     * @param {Object} raceInfo - Information about the upcoming race
     * @returns {Object} Strategy recommendations
     */
    getRaceStrategy(raceInfo) {
        const { distance } = raceInfo;
        const distanceFactor = this.getDistanceMatchFactor(distance);
        
        const baseStrategy = {
            specialization: this.name,
            distanceMatch: distanceFactor > 1.0 ? 'Excellent' : distanceFactor > 0.95 ? 'Good' : 'Poor',
            recommendedStyles: this.getRecommendedRacingStyles()
        };
        
        if (distanceFactor > 1.0) {
            baseStrategy.advantage = "This distance plays to your specialization strengths";
        } else if (distanceFactor < 0.9) {
            baseStrategy.challenge = "This distance is outside your specialization comfort zone";
        }
        
        return baseStrategy;
    }
    
    /**
     * Get display information for UI
     * @returns {Object} Display information about the specialization
     */
    getDisplayInfo() {
        return {
            name: this.name,
            description: this.description,
            strengths: [...this.strengths],
            optimalDistances: [...this.optimalDistances],
            primaryStats: this.getPrimaryStats(),
            preferredStyles: [...this.preferredRacingStyles]
        };
    }
    
    /**
     * Create specialization from JSON data (for save/load)
     * @param {Object} data - Serialized specialization data
     * @returns {RacingSpecialization} A new specialization instance
     */
    static fromJSON(data) {
        return new RacingSpecialization(data.name, {
            optimalDistances: data.optimalDistances,
            statWeighting: data.statWeighting,
            trainingBonus: data.trainingBonus,
            description: data.description,
            strengths: data.strengths,
            preferredRacingStyles: data.preferredRacingStyles
        });
    }
    
    /**
     * Serialize specialization to JSON (for save/load)
     * @returns {Object} Serializable specialization data
     */
    toJSON() {
        return {
            name: this.name,
            optimalDistances: this.optimalDistances,
            statWeighting: this.statWeighting,
            trainingBonus: this.trainingBonus,
            description: this.description,
            strengths: this.strengths,
            preferredRacingStyles: this.preferredRacingStyles
        };
    }
}

module.exports = RacingSpecialization;