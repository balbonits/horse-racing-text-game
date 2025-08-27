/**
 * Base class for horse breeds in the Horse Racing Text Game
 * 
 * Defines the structure and behavior for different horse breeds,
 * each with unique stat caps, growth rates, and surface preferences.
 * 
 * @class Breed
 */
class Breed {
    /**
     * Create a horse breed
     * @param {string} name - The breed name (e.g., "Thoroughbred")
     * @param {Object} config - Breed configuration object
     * @param {Object} config.statCaps - Maximum stat limits {speed: 100, stamina: 100, power: 100}
     * @param {Object} config.growthRates - Training effectiveness multipliers {speed: 1.0, stamina: 1.0, power: 1.0}
     * @param {Object} config.surfacePreferences - Performance on different surfaces {turf: 1.0, dirt: 1.0}
     * @param {string} config.description - Breed description for UI display
     * @param {Array<string>} config.strengths - List of breed strengths for display
     */
    constructor(name, config) {
        this.name = name;
        this.statCaps = config.statCaps || { speed: 100, stamina: 100, power: 100 };
        this.growthRates = config.growthRates || { speed: 1.0, stamina: 1.0, power: 1.0 };
        this.surfacePreferences = config.surfacePreferences || { turf: 1.0, dirt: 1.0 };
        this.description = config.description || `A ${name} horse`;
        this.strengths = config.strengths || [];
        
        // Validation
        this.validateConfig();
    }
    
    /**
     * Validate breed configuration
     * @throws {Error} If configuration is invalid
     */
    validateConfig() {
        const requiredStats = ['speed', 'stamina', 'power'];
        const requiredSurfaces = ['turf', 'dirt'];
        
        // Validate stat caps
        for (const stat of requiredStats) {
            if (typeof this.statCaps[stat] !== 'number' || this.statCaps[stat] <= 0) {
                throw new Error(`Invalid stat cap for ${stat} in breed ${this.name}`);
            }
        }
        
        // Validate growth rates
        for (const stat of requiredStats) {
            if (typeof this.growthRates[stat] !== 'number' || this.growthRates[stat] <= 0) {
                throw new Error(`Invalid growth rate for ${stat} in breed ${this.name}`);
            }
        }
        
        // Validate surface preferences  
        for (const surface of requiredSurfaces) {
            if (typeof this.surfacePreferences[surface] !== 'number' || this.surfacePreferences[surface] <= 0) {
                throw new Error(`Invalid surface preference for ${surface} in breed ${this.name}`);
            }
        }
    }
    
    /**
     * Get the stat cap for a specific stat
     * @param {string} statName - The stat name ('speed', 'stamina', 'power')
     * @returns {number} The maximum value for this stat
     */
    getStatCap(statName) {
        return this.statCaps[statName] || 100;
    }
    
    /**
     * Get the growth rate multiplier for training
     * @param {string} statName - The stat name ('speed', 'stamina', 'power')
     * @returns {number} The growth rate multiplier (1.0 = normal, >1.0 = enhanced)
     */
    getGrowthRate(statName) {
        return this.growthRates[statName] || 1.0;
    }
    
    /**
     * Get surface preference multiplier for race performance
     * @param {string} surface - The race surface ('turf' or 'dirt')  
     * @returns {number} Performance multiplier (1.0 = neutral, >1.0 = advantage)
     */
    getSurfacePreference(surface) {
        return this.surfacePreferences[surface.toLowerCase()] || 1.0;
    }
    
    /**
     * Calculate training effectiveness for this breed
     * @param {string} statName - The stat being trained
     * @param {number} baseGain - The base training gain before breed modifier
     * @returns {number} The modified training gain
     */
    applyGrowthRate(statName, baseGain) {
        const growthRate = this.getGrowthRate(statName);
        return Math.round(baseGain * growthRate);
    }
    
    /**
     * Check if a stat value exceeds the breed's cap
     * @param {string} statName - The stat name
     * @param {number} currentValue - The current stat value
     * @returns {boolean} True if the stat is at or above the cap
     */
    isStatAtCap(statName, currentValue) {
        return currentValue >= this.getStatCap(statName);
    }
    
    /**
     * Enforce stat caps on a character's stats
     * @param {Object} stats - The character's current stats {speed, stamina, power}
     * @returns {Object} The stats object with caps enforced
     */
    enforceStatCaps(stats) {
        const cappedStats = { ...stats };
        
        for (const [statName, value] of Object.entries(cappedStats)) {
            if (this.statCaps[statName]) {
                cappedStats[statName] = Math.min(value, this.getStatCap(statName));
            }
        }
        
        return cappedStats;
    }
    
    /**
     * Get breed information for UI display
     * @returns {Object} Display information about the breed
     */
    getDisplayInfo() {
        return {
            name: this.name,
            description: this.description,
            strengths: [...this.strengths],
            statCaps: { ...this.statCaps },
            surfacePreferences: { ...this.surfacePreferences }
        };
    }
    
    /**
     * Get breed recommendations for new players
     * @returns {string} Recommendation text for this breed
     */
    getRecommendation() {
        const primaryStrength = this.strengths[0];
        const bestSurface = this.surfacePreferences.turf > this.surfacePreferences.dirt ? 'turf' : 'dirt';
        
        return `Best for: ${primaryStrength}. Excels on ${bestSurface} tracks.`;
    }
    
    /**
     * Create a breed from JSON data (for save/load)
     * @param {Object} data - Serialized breed data
     * @returns {Breed} A new breed instance
     */
    static fromJSON(data) {
        return new Breed(data.name, {
            statCaps: data.statCaps,
            growthRates: data.growthRates,
            surfacePreferences: data.surfacePreferences,
            description: data.description,
            strengths: data.strengths
        });
    }
    
    /**
     * Serialize breed to JSON (for save/load)
     * @returns {Object} Serializable breed data
     */
    toJSON() {
        return {
            name: this.name,
            statCaps: this.statCaps,
            growthRates: this.growthRates,
            surfacePreferences: this.surfacePreferences,
            description: this.description,
            strengths: this.strengths
        };
    }
}

module.exports = Breed;