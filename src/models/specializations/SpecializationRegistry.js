const Sprinter = require('./Sprinter');
const Miler = require('./Miler');
const Stayer = require('./Stayer');

/**
 * Registry for all available racing specializations in the game
 * 
 * Provides centralized access to specialization information, creation,
 * and management for the horse racing simulation.
 * 
 * @class SpecializationRegistry
 */
class SpecializationRegistry {
    constructor() {
        // Map of specialization names to their constructor classes
        this.specializations = new Map();
        
        // Map of specialization instances for reuse (singleton pattern)
        this.instances = new Map();
        
        // Register all available specializations
        this.registerSpecialization('Sprinter', Sprinter);
        this.registerSpecialization('Miler', Miler);
        this.registerSpecialization('Stayer', Stayer);
        
        // Default specialization for backward compatibility
        this.defaultSpecialization = 'Miler';
    }
    
    /**
     * Register a new specialization class
     * @param {string} name - The specialization name
     * @param {Class} specializationClass - The specialization constructor class
     */
    registerSpecialization(name, specializationClass) {
        this.specializations.set(name, specializationClass);
    }
    
    /**
     * Get a specialization instance by name (singleton)
     * @param {string} specializationName - The name of the specialization
     * @returns {RacingSpecialization} The specialization instance
     */
    getSpecialization(specializationName) {
        if (!specializationName) {
            specializationName = this.defaultSpecialization;
        }
        
        // Return cached instance if available
        if (this.instances.has(specializationName)) {
            return this.instances.get(specializationName);
        }
        
        // Create new instance if specialization exists
        const SpecializationClass = this.specializations.get(specializationName);
        if (!SpecializationClass) {
            console.warn(`Unknown specialization: ${specializationName}, using default: ${this.defaultSpecialization}`);
            return this.getSpecialization(this.defaultSpecialization);
        }
        
        const specializationInstance = new SpecializationClass();
        this.instances.set(specializationName, specializationInstance);
        return specializationInstance;
    }
    
    /**
     * Get all available specialization names
     * @returns {Array<string>} Array of specialization names
     */
    getSpecializationNames() {
        return Array.from(this.specializations.keys());
    }
    
    /**
     * Get display information for all specializations
     * @returns {Array<Object>} Array of specialization display information
     */
    getAllSpecializationInfo() {
        return this.getSpecializationNames().map(specializationName => {
            const specialization = this.getSpecialization(specializationName);
            return specialization.getDisplayInfo();
        });
    }
    
    /**
     * Get specialization recommendations based on race schedule
     * @param {Array<Object>} races - Array of upcoming races with distance info
     * @returns {Array<Object>} Array of specializations with match scores
     */
    getSpecializationRecommendations(races = []) {
        return this.getSpecializationNames().map(specializationName => {
            const specialization = this.getSpecialization(specializationName);
            const displayInfo = specialization.getDisplayInfo();
            
            // Calculate match score based on race distances
            let matchScore = 0;
            if (races.length > 0) {
                races.forEach(race => {
                    const distanceFactor = specialization.getDistanceMatchFactor(race.distance);
                    matchScore += distanceFactor;
                });
                matchScore = matchScore / races.length;
            } else {
                matchScore = 1.0; // Neutral if no race info
            }
            
            return {
                name: specializationName,
                description: displayInfo.description,
                difficulty: displayInfo.difficulty || 'Medium',
                playstyle: displayInfo.playstyle || 'Balanced',
                strengths: displayInfo.strengths,
                optimalDistances: displayInfo.optimalDistances,
                matchScore: matchScore,
                recommendation: this.getRecommendationText(matchScore)
            };
        });
    }
    
    /**
     * Get recommendation text based on match score
     * @param {number} matchScore - The calculated match score
     * @returns {string} Human-readable recommendation
     */
    getRecommendationText(matchScore) {
        if (matchScore >= 1.1) {
            return "Excellent match for career race schedule";
        } else if (matchScore >= 1.05) {
            return "Good match for most career races";
        } else if (matchScore >= 0.95) {
            return "Balanced choice that works well overall";
        } else if (matchScore >= 0.9) {
            return "Some races may be challenging for this specialization";
        } else {
            return "Difficult match - consider different specialization";
        }
    }
    
    /**
     * Validate if a specialization name exists
     * @param {string} specializationName - The specialization name to validate
     * @returns {boolean} True if the specialization exists
     */
    isValidSpecialization(specializationName) {
        return this.specializations.has(specializationName);
    }
    
    /**
     * Get the default specialization name
     * @returns {string} The default specialization name
     */
    getDefaultSpecialization() {
        return this.defaultSpecialization;
    }
    
    /**
     * Get specialization comparison data for selection UI
     * @returns {Object} Comparison data for all specializations
     */
    getSpecializationComparison() {
        const comparison = {
            specializations: [],
            distanceRanges: {},
            statPriorities: {},
            racingStyles: {},
            difficultyLevels: {}
        };
        
        for (const specializationName of this.getSpecializationNames()) {
            const specialization = this.getSpecialization(specializationName);
            const displayInfo = specialization.getDisplayInfo();
            
            comparison.specializations.push({
                name: specializationName,
                description: displayInfo.description,
                difficulty: displayInfo.difficulty,
                strengths: displayInfo.strengths.slice(0, 2) // Top 2 strengths
            });
            
            // Distance ranges
            comparison.distanceRanges[specializationName] = displayInfo.optimalDistances;
            
            // Stat priorities
            comparison.statPriorities[specializationName] = displayInfo.primaryStats || displayInfo.statPriority;
            
            // Racing styles
            comparison.racingStyles[specializationName] = displayInfo.preferredStyles;
            
            // Difficulty grouping
            const difficulty = displayInfo.difficulty || 'Medium';
            if (!comparison.difficultyLevels[difficulty]) {
                comparison.difficultyLevels[difficulty] = [];
            }
            comparison.difficultyLevels[difficulty].push(specializationName);
        }
        
        return comparison;
    }
    
    /**
     * Get recommended specialization based on player preferences and breed
     * @param {Object} preferences - Player preferences
     * @param {string} preferences.playstyle - 'aggressive' | 'balanced' | 'patient'
     * @param {string} preferences.distance - 'sprint' | 'mile' | 'long'
     * @param {Object} breed - The horse's breed (optional)
     * @returns {Object} Recommended specialization with reasoning
     */
    getRecommendedSpecialization(preferences = {}, breed = null) {
        const { playstyle = 'balanced', distance = 'mile' } = preferences;
        
        // Distance-based recommendations
        if (distance === 'sprint') {
            return {
                specializationName: 'Sprinter',
                reasoning: 'Perfect for explosive speed and short-distance dominance',
                specialization: this.getSpecialization('Sprinter')
            };
        }
        
        if (distance === 'long') {
            return {
                specializationName: 'Stayer',
                reasoning: 'Ideal for marathon distances and endurance-based tactics',
                specialization: this.getSpecialization('Stayer')
            };
        }
        
        // Playstyle-based recommendations
        if (playstyle === 'aggressive') {
            return {
                specializationName: 'Sprinter',
                reasoning: 'Front-running tactics and explosive early speed match aggressive style',
                specialization: this.getSpecialization('Sprinter')
            };
        }
        
        if (playstyle === 'patient') {
            return {
                specializationName: 'Stayer',
                reasoning: 'Patient energy management and late-race kicks suit tactical approach',
                specialization: this.getSpecialization('Stayer')
            };
        }
        
        // Breed synergy recommendations
        if (breed) {
            if (breed.name === 'Quarter Horse') {
                return {
                    specializationName: 'Sprinter',
                    reasoning: 'Quarter Horse speed capabilities synergize perfectly with Sprinter tactics',
                    specialization: this.getSpecialization('Sprinter')
                };
            }
            
            if (breed.name === 'Arabian') {
                return {
                    specializationName: 'Stayer',
                    reasoning: 'Arabian stamina excellence pairs naturally with Stayer endurance focus',
                    specialization: this.getSpecialization('Stayer')
                };
            }
        }
        
        // Default to balanced approach
        return {
            specializationName: 'Miler',
            reasoning: 'Versatile tactical approach that works well in most race conditions',
            specialization: this.getSpecialization('Miler')
        };
    }
    
    /**
     * Get training effectiveness analysis for a specialization + breed combo
     * @param {string} specializationName - The specialization name
     * @param {Object} breed - The horse breed (optional)
     * @returns {Object} Training effectiveness analysis
     */
    getTrainingEffectivenessAnalysis(specializationName, breed = null) {
        const specialization = this.getSpecialization(specializationName);
        const analysis = {
            specialization: specializationName,
            breed: breed ? breed.name : 'Default',
            statEffectiveness: {}
        };
        
        // Calculate combined training effectiveness
        const stats = ['speed', 'stamina', 'power'];
        stats.forEach(stat => {
            let effectiveness = specialization.getTrainingBonus(stat);
            
            if (breed) {
                effectiveness *= breed.getGrowthRate(stat);
            }
            
            analysis.statEffectiveness[stat] = {
                multiplier: effectiveness,
                rating: this.getEffectivenessRating(effectiveness),
                recommendation: this.getTrainingRecommendation(stat, effectiveness)
            };
        });
        
        return analysis;
    }
    
    /**
     * Get effectiveness rating for a training multiplier
     * @param {number} effectiveness - The training effectiveness multiplier
     * @returns {string} Rating description
     */
    getEffectivenessRating(effectiveness) {
        if (effectiveness >= 1.4) return 'Exceptional';
        if (effectiveness >= 1.2) return 'Excellent';
        if (effectiveness >= 1.1) return 'Good';
        if (effectiveness >= 0.95) return 'Average';
        if (effectiveness >= 0.85) return 'Below Average';
        return 'Poor';
    }
    
    /**
     * Get training recommendation based on effectiveness
     * @param {string} stat - The stat name
     * @param {number} effectiveness - The effectiveness multiplier
     * @returns {string} Training recommendation
     */
    getTrainingRecommendation(stat, effectiveness) {
        if (effectiveness >= 1.2) {
            return `Prioritize ${stat} training - exceptional development rate`;
        } else if (effectiveness >= 1.1) {
            return `Focus on ${stat} training - good growth potential`;
        } else if (effectiveness >= 0.95) {
            return `Include ${stat} training - balanced development`;
        } else {
            return `Consider minimal ${stat} training - slow development rate`;
        }
    }
    
    /**
     * Create specialization from save data (for backward compatibility)
     * @param {Object|string} specializationData - Either name string or specialization object
     * @returns {RacingSpecialization} The specialization instance
     */
    createFromSaveData(specializationData) {
        if (typeof specializationData === 'string') {
            return this.getSpecialization(specializationData);
        }
        
        if (specializationData && specializationData.name) {
            return this.getSpecialization(specializationData.name);
        }
        
        // Fallback to default specialization
        console.warn('Invalid specialization data in save file, using default specialization');
        return this.getSpecialization(this.defaultSpecialization);
    }
    
    /**
     * Get statistics about specialization usage (for analytics)
     * @returns {Object} Specialization usage statistics
     */
    getSpecializationStatistics() {
        return {
            totalSpecializations: this.specializations.size,
            specializationNames: this.getSpecializationNames(),
            defaultSpecialization: this.defaultSpecialization,
            difficultyDistribution: this.getSpecializationComparison().difficultyLevels
        };
    }
}

// Export singleton instance
module.exports = new SpecializationRegistry();