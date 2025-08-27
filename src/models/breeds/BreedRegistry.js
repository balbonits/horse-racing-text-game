const Thoroughbred = require('./Thoroughbred');
const Arabian = require('./Arabian');
const QuarterHorse = require('./QuarterHorse');

/**
 * Registry for all available horse breeds in the game
 * 
 * Provides centralized access to breed information, creation,
 * and management for the horse racing simulation.
 * 
 * @class BreedRegistry
 */
class BreedRegistry {
    constructor() {
        // Map of breed names to their constructor classes
        this.breeds = new Map();
        
        // Map of breed instances for reuse (singleton pattern)
        this.instances = new Map();
        
        // Register all available breeds
        this.registerBreed('Thoroughbred', Thoroughbred);
        this.registerBreed('Arabian', Arabian);
        this.registerBreed('Quarter Horse', QuarterHorse);
        
        // Default breed for backward compatibility
        this.defaultBreed = 'Thoroughbred';
    }
    
    /**
     * Register a new breed class
     * @param {string} name - The breed name
     * @param {Class} breedClass - The breed constructor class
     */
    registerBreed(name, breedClass) {
        this.breeds.set(name, breedClass);
    }
    
    /**
     * Get a breed instance by name (singleton)
     * @param {string} breedName - The name of the breed
     * @returns {Breed} The breed instance
     */
    getBreed(breedName) {
        if (!breedName) {
            breedName = this.defaultBreed;
        }
        
        // Return cached instance if available
        if (this.instances.has(breedName)) {
            return this.instances.get(breedName);
        }
        
        // Create new instance if breed exists
        const BreedClass = this.breeds.get(breedName);
        if (!BreedClass) {
            console.warn(`Unknown breed: ${breedName}, using default: ${this.defaultBreed}`);
            return this.getBreed(this.defaultBreed);
        }
        
        const breedInstance = new BreedClass();
        this.instances.set(breedName, breedInstance);
        return breedInstance;
    }
    
    /**
     * Get all available breed names
     * @returns {Array<string>} Array of breed names
     */
    getBreedNames() {
        return Array.from(this.breeds.keys());
    }
    
    /**
     * Get display information for all breeds
     * @returns {Array<Object>} Array of breed display information
     */
    getAllBreedInfo() {
        return this.getBreedNames().map(breedName => {
            const breed = this.getBreed(breedName);
            return breed.getDisplayInfo();
        });
    }
    
    /**
     * Get breed recommendations for new players
     * @returns {Array<Object>} Array of breeds with recommendations
     */
    getBreedRecommendations() {
        return this.getBreedNames().map(breedName => {
            const breed = this.getBreed(breedName);
            const displayInfo = breed.getDisplayInfo();
            return {
                name: breedName,
                recommendation: breed.getRecommendation(),
                difficulty: displayInfo.difficulty || 'Medium',
                playstyle: displayInfo.playstyle || 'Balanced',
                strengths: displayInfo.strengths
            };
        });
    }
    
    /**
     * Validate if a breed name exists
     * @param {string} breedName - The breed name to validate
     * @returns {boolean} True if the breed exists
     */
    isValidBreed(breedName) {
        return this.breeds.has(breedName);
    }
    
    /**
     * Get the default breed name
     * @returns {string} The default breed name
     */
    getDefaultBreed() {
        return this.defaultBreed;
    }
    
    /**
     * Set the default breed (for testing or configuration)
     * @param {string} breedName - The new default breed name
     */
    setDefaultBreed(breedName) {
        if (this.isValidBreed(breedName)) {
            this.defaultBreed = breedName;
        } else {
            throw new Error(`Cannot set invalid breed as default: ${breedName}`);
        }
    }
    
    /**
     * Get breed comparison data for selection UI
     * @returns {Object} Comparison data for all breeds
     */
    getBreedComparison() {
        const comparison = {
            breeds: [],
            statComparison: {},
            surfaceComparison: {},
            difficultyLevels: {}
        };
        
        for (const breedName of this.getBreedNames()) {
            const breed = this.getBreed(breedName);
            const displayInfo = breed.getDisplayInfo();
            
            comparison.breeds.push({
                name: breedName,
                description: displayInfo.description,
                difficulty: displayInfo.difficulty,
                strengths: displayInfo.strengths.slice(0, 2) // Top 2 strengths
            });
            
            // Stat caps comparison
            comparison.statComparison[breedName] = displayInfo.statCaps;
            
            // Surface preferences  
            comparison.surfaceComparison[breedName] = displayInfo.surfacePreferences;
            
            // Difficulty grouping
            const difficulty = displayInfo.difficulty || 'Medium';
            if (!comparison.difficultyLevels[difficulty]) {
                comparison.difficultyLevels[difficulty] = [];
            }
            comparison.difficultyLevels[difficulty].push(breedName);
        }
        
        return comparison;
    }
    
    /**
     * Get recommended breed based on player preferences
     * @param {Object} preferences - Player preferences
     * @param {string} preferences.experience - 'beginner' | 'intermediate' | 'expert'  
     * @param {string} preferences.playstyle - 'balanced' | 'speed' | 'endurance'
     * @param {string} preferences.surface - 'turf' | 'dirt' | 'both'
     * @returns {Object} Recommended breed with reasoning
     */
    getRecommendedBreed(preferences = {}) {
        const { experience = 'beginner', playstyle = 'balanced', surface = 'both' } = preferences;
        
        // Beginner recommendations
        if (experience === 'beginner') {
            return {
                breedName: 'Thoroughbred',
                reasoning: 'Perfect for learning - balanced stats with no major weaknesses',
                breed: this.getBreed('Thoroughbred')
            };
        }
        
        // Advanced recommendations based on playstyle
        if (playstyle === 'speed') {
            return {
                breedName: 'Quarter Horse',
                reasoning: 'Explosive speed and power for aggressive front-running tactics',
                breed: this.getBreed('Quarter Horse')
            };
        }
        
        if (playstyle === 'endurance') {
            return {
                breedName: 'Arabian', 
                reasoning: 'Superior stamina for long-distance racing and strategic gameplay',
                breed: this.getBreed('Arabian')
            };
        }
        
        // Surface-based recommendations
        if (surface === 'turf') {
            return {
                breedName: 'Arabian',
                reasoning: 'Natural turf advantage and endurance for grass track racing',
                breed: this.getBreed('Arabian')
            };
        }
        
        if (surface === 'dirt') {
            return {
                breedName: 'Quarter Horse',
                reasoning: 'Dirt track specialists with explosive acceleration',
                breed: this.getBreed('Quarter Horse')
            };
        }
        
        // Default to balanced approach
        return {
            breedName: 'Thoroughbred',
            reasoning: 'Versatile choice that works well in all situations',
            breed: this.getBreed('Thoroughbred')
        };
    }
    
    /**
     * Create breed from save data (for backward compatibility)
     * @param {Object|string} breedData - Either breed name string or breed object
     * @returns {Breed} The breed instance
     */
    createFromSaveData(breedData) {
        if (typeof breedData === 'string') {
            // Legacy save files just have breed name
            return this.getBreed(breedData);
        }
        
        if (breedData && breedData.name) {
            // Modern save files have breed object
            return this.getBreed(breedData.name);
        }
        
        // Fallback to default breed
        console.warn('Invalid breed data in save file, using default breed');
        return this.getBreed(this.defaultBreed);
    }
    
    /**
     * Get statistics about breed usage (for analytics)
     * @returns {Object} Breed usage statistics
     */
    getBreedStatistics() {
        return {
            totalBreeds: this.breeds.size,
            breedNames: this.getBreedNames(),
            defaultBreed: this.defaultBreed,
            difficultyDistribution: this.getBreedComparison().difficultyLevels
        };
    }
}

// Export singleton instance
module.exports = new BreedRegistry();