/**
 * Base class for racing styles in the Horse Racing Text Game
 * 
 * Defines how a horse approaches race tactics, energy management,
 * and positioning strategy throughout different phases of a race.
 * 
 * @class RacingStyle
 */
class RacingStyle {
    /**
     * Create a racing style
     * @param {string} name - The style name (e.g., "Front Runner")
     * @param {Object} config - Style configuration object
     * @param {Object} config.energyStrategy - Energy usage patterns {early: 0.4, middle: 0.3, late: 0.3}
     * @param {Object} config.positionPreference - Preferred race positions {early: 1-3, middle: 1-4, late: 1-2}
     * @param {Object} config.paceProfile - Effectiveness at different paces {fast: 1.1, moderate: 1.0, slow: 0.9}
     * @param {string} config.description - Style description for UI display
     * @param {Array<string>} config.strengths - List of style strengths
     * @param {Array<string>} config.compatibleSpecializations - Compatible racing specializations
     */
    constructor(name, config) {
        this.name = name;
        this.energyStrategy = config.energyStrategy || { early: 0.33, middle: 0.33, late: 0.34 };
        this.positionPreference = config.positionPreference || { early: [4, 6], middle: [3, 5], late: [1, 3] };
        this.paceProfile = config.paceProfile || { fast: 1.0, moderate: 1.0, slow: 1.0 };
        this.description = config.description || `A ${name} racing style`;
        this.strengths = config.strengths || [];
        this.compatibleSpecializations = config.compatibleSpecializations || ['Sprinter', 'Miler', 'Stayer'];
        
        // Validation
        this.validateConfig();
    }
    
    /**
     * Validate racing style configuration
     * @throws {Error} If configuration is invalid
     */
    validateConfig() {
        // Validate energy strategy sums to 1.0 (approximately)
        const totalEnergy = Object.values(this.energyStrategy).reduce((sum, energy) => sum + energy, 0);
        if (Math.abs(totalEnergy - 1.0) > 0.01) {
            throw new Error(`Energy strategy must sum to 1.0 for ${this.name}, got ${totalEnergy}`);
        }
        
        // Validate position preferences are arrays with 2 elements
        for (const [phase, positions] of Object.entries(this.positionPreference)) {
            if (!Array.isArray(positions) || positions.length !== 2) {
                throw new Error(`Position preference for ${phase} must be [min, max] array`);
            }
            if (positions[0] > positions[1]) {
                throw new Error(`Invalid position range for ${phase}: min must be <= max`);
            }
        }
        
        // Validate pace profile multipliers are positive
        for (const [pace, multiplier] of Object.entries(this.paceProfile)) {
            if (typeof multiplier !== 'number' || multiplier <= 0) {
                throw new Error(`Invalid pace profile multiplier for ${pace} in ${this.name}: ${multiplier}`);
            }
        }
    }
    
    /**
     * Calculate energy expenditure for a race phase
     * @param {string} phase - Race phase ('early', 'middle', 'late')
     * @param {number} totalEnergy - Total available energy for the race
     * @returns {number} Energy to expend in this phase
     */
    calculateEnergyExpenditure(phase, totalEnergy) {
        const phaseFraction = this.energyStrategy[phase] || 0.33;
        return Math.round(totalEnergy * phaseFraction);
    }
    
    /**
     * Get preferred position range for a race phase
     * @param {string} phase - Race phase ('early', 'middle', 'late')
     * @returns {Array<number>} [min, max] position range
     */
    getPreferredPosition(phase) {
        return [...this.positionPreference[phase]] || [4, 6];
    }
    
    /**
     * Calculate pace effectiveness multiplier
     * @param {string} paceType - The race pace ('fast', 'moderate', 'slow')
     * @returns {number} Effectiveness multiplier (0.8 to 1.2)
     */
    getPaceEffectiveness(paceType) {
        return this.paceProfile[paceType.toLowerCase()] || 1.0;
    }
    
    /**
     * Calculate positioning bonus based on current race position
     * @param {string} phase - Current race phase
     * @param {number} currentPosition - Current position in field
     * @param {number} fieldSize - Total number of horses in race
     * @returns {number} Positioning bonus multiplier
     */
    getPositioningBonus(phase, currentPosition, fieldSize) {
        const [minPreferred, maxPreferred] = this.getPreferredPosition(phase);
        
        // Perfect positioning bonus
        if (currentPosition >= minPreferred && currentPosition <= maxPreferred) {
            return 1.08;
        }
        
        // Calculate penalty based on distance from preferred position
        let distanceFromPreferred;
        if (currentPosition < minPreferred) {
            distanceFromPreferred = minPreferred - currentPosition;
        } else {
            distanceFromPreferred = currentPosition - maxPreferred;
        }
        
        // Small penalty for suboptimal positioning
        const penaltyFactor = Math.max(0.92, 1.0 - (distanceFromPreferred / fieldSize) * 0.2);
        return penaltyFactor;
    }
    
    /**
     * Get tactical recommendations for this racing style
     * @param {Object} raceInfo - Information about the race
     * @param {Object} horseStats - Current horse statistics
     * @returns {Object} Tactical recommendations
     */
    getTacticalRecommendations(raceInfo, horseStats) {
        const { distance, pace, fieldSize } = raceInfo;
        
        const recommendations = {
            style: this.name,
            earlyStrategy: this.getPhaseStrategy('early', raceInfo, horseStats),
            middleStrategy: this.getPhaseStrategy('middle', raceInfo, horseStats),
            lateStrategy: this.getPhaseStrategy('late', raceInfo, horseStats),
            paceAdvice: this.getPaceAdvice(pace),
            keyTactics: this.getKeyTactics(raceInfo, horseStats)
        };
        
        return recommendations;
    }
    
    /**
     * Get strategy for a specific race phase
     * @param {string} phase - Race phase
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Phase-specific strategy
     */
    getPhaseStrategy(phase, raceInfo, horseStats) {
        const [minPos, maxPos] = this.getPreferredPosition(phase);
        const energyPct = Math.round(this.energyStrategy[phase] * 100);
        
        return `Target position ${minPos}-${maxPos}, use ${energyPct}% of energy reserves`;
    }
    
    /**
     * Get pace-specific advice
     * @param {string} pace - Race pace type
     * @returns {string} Pace advice
     */
    getPaceAdvice(pace) {
        const effectiveness = this.getPaceEffectiveness(pace);
        
        if (effectiveness > 1.05) {
            return `${pace} pace favors your racing style - excellent conditions`;
        } else if (effectiveness < 0.95) {
            return `${pace} pace challenges your style - adapt tactics accordingly`;
        } else {
            return `${pace} pace is neutral for your racing style`;
        }
    }
    
    /**
     * Get key tactical points for this style
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {Array<string>} Key tactical points
     */
    getKeyTactics(raceInfo, horseStats) {
        // Override in specific style implementations
        return [
            "Follow your preferred positioning throughout the race",
            "Manage energy according to your style's strategy",
            "Adapt to pace conditions while maintaining style advantages"
        ];
    }
    
    /**
     * Check compatibility with a racing specialization
     * @param {string} specializationName - Name of racing specialization
     * @returns {boolean} True if compatible
     */
    isCompatibleWithSpecialization(specializationName) {
        return this.compatibleSpecializations.includes(specializationName);
    }
    
    /**
     * Get synergy bonus when combined with compatible specialization
     * @param {string} specializationName - Name of racing specialization
     * @returns {number} Synergy bonus multiplier
     */
    getSpecializationSynergy(specializationName) {
        if (!this.isCompatibleWithSpecialization(specializationName)) {
            return 0.95; // Small penalty for incompatible combo
        }
        
        // Different styles have different synergy levels with specializations
        return this.calculateSynergyBonus(specializationName);
    }
    
    /**
     * Calculate synergy bonus (override in specific implementations)
     * @param {string} specializationName - Specialization name
     * @returns {number} Synergy multiplier
     */
    calculateSynergyBonus(specializationName) {
        // Base implementation - small bonus for any compatible combo
        return 1.02;
    }
    
    /**
     * Get energy efficiency modifier for this racing style
     * @param {string} context - Energy usage context
     * @param {Object} raceConditions - Current race conditions
     * @returns {number} Energy efficiency multiplier
     */
    getEnergyEfficiency(context, raceConditions = {}) {
        // Override in specific style implementations
        return 1.0;
    }
    
    /**
     * Get display information for UI
     * @returns {Object} Display information about the racing style
     */
    getDisplayInfo() {
        return {
            name: this.name,
            description: this.description,
            strengths: [...this.strengths],
            energyPattern: this.getEnergyPatternDescription(),
            positioningStyle: this.getPositioningDescription(),
            compatibleSpecializations: [...this.compatibleSpecializations],
            idealConditions: this.getIdealConditions()
        };
    }
    
    /**
     * Get human-readable energy pattern description
     * @returns {string} Energy pattern description
     */
    getEnergyPatternDescription() {
        const phases = ['early', 'middle', 'late'];
        const maxPhase = phases.reduce((max, phase) => 
            this.energyStrategy[phase] > this.energyStrategy[max] ? phase : max
        );
        
        return `${maxPhase}-race energy focus`;
    }
    
    /**
     * Get positioning style description
     * @returns {string} Positioning description
     */
    getPositioningDescription() {
        const earlyPos = this.positionPreference.early;
        const avgEarly = (earlyPos[0] + earlyPos[1]) / 2;
        
        if (avgEarly <= 3) return 'Aggressive early positioning';
        if (avgEarly <= 5) return 'Mid-pack tactical positioning';
        return 'Conservative early positioning';
    }
    
    /**
     * Get ideal race conditions for this style
     * @returns {Array<string>} Ideal conditions
     */
    getIdealConditions() {
        const idealPaces = Object.entries(this.paceProfile)
            .filter(([pace, multiplier]) => multiplier > 1.05)
            .map(([pace]) => pace);
        
        return idealPaces.length > 0 ? [`${idealPaces.join(' or ')} pace races`] : ['Adaptable to most race conditions'];
    }
    
    /**
     * Create racing style from JSON data (for save/load)
     * @param {Object} data - Serialized style data
     * @returns {RacingStyle} A new racing style instance
     */
    static fromJSON(data) {
        return new RacingStyle(data.name, {
            energyStrategy: data.energyStrategy,
            positionPreference: data.positionPreference,
            paceProfile: data.paceProfile,
            description: data.description,
            strengths: data.strengths,
            compatibleSpecializations: data.compatibleSpecializations
        });
    }
    
    /**
     * Serialize racing style to JSON (for save/load)
     * @returns {Object} Serializable style data
     */
    toJSON() {
        return {
            name: this.name,
            energyStrategy: this.energyStrategy,
            positionPreference: this.positionPreference,
            paceProfile: this.paceProfile,
            description: this.description,
            strengths: this.strengths,
            compatibleSpecializations: this.compatibleSpecializations
        };
    }
}

module.exports = RacingStyle;