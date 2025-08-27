const FrontRunner = require('./FrontRunner');
const Stalker = require('./Stalker');
const Closer = require('./Closer');

/**
 * Registry for all available racing styles in the game
 * 
 * Provides centralized access to racing style information, creation,
 * and management for the horse racing simulation.
 * 
 * @class RacingStyleRegistry
 */
class RacingStyleRegistry {
    constructor() {
        // Map of style names to their constructor classes
        this.styles = new Map();
        
        // Map of style instances for reuse (singleton pattern)
        this.instances = new Map();
        
        // Register all available racing styles
        this.registerStyle('Front Runner', FrontRunner);
        this.registerStyle('Stalker', Stalker);
        this.registerStyle('Closer', Closer);
        
        // Default style for backward compatibility
        this.defaultStyle = 'Stalker';
    }
    
    /**
     * Register a new racing style class
     * @param {string} name - The style name
     * @param {Class} styleClass - The style constructor class
     */
    registerStyle(name, styleClass) {
        this.styles.set(name, styleClass);
    }
    
    /**
     * Get a racing style instance by name (singleton)
     * @param {string} styleName - The name of the racing style
     * @returns {RacingStyle} The racing style instance
     */
    getStyle(styleName) {
        if (!styleName) {
            styleName = this.defaultStyle;
        }
        
        // Return cached instance if available
        if (this.instances.has(styleName)) {
            return this.instances.get(styleName);
        }
        
        // Create new instance if style exists
        const StyleClass = this.styles.get(styleName);
        if (!StyleClass) {
            console.warn(`Unknown racing style: ${styleName}, using default: ${this.defaultStyle}`);
            return this.getStyle(this.defaultStyle);
        }
        
        const styleInstance = new StyleClass();
        this.instances.set(styleName, styleInstance);
        return styleInstance;
    }
    
    /**
     * Get all available racing style names
     * @returns {Array<string>} Array of style names
     */
    getStyleNames() {
        return Array.from(this.styles.keys());
    }
    
    /**
     * Get display information for all racing styles
     * @returns {Array<Object>} Array of style display information
     */
    getAllStyleInfo() {
        return this.getStyleNames().map(styleName => {
            const style = this.getStyle(styleName);
            return style.getDisplayInfo();
        });
    }
    
    /**
     * Get style recommendations based on race conditions and horse attributes
     * @param {Object} raceConditions - Information about upcoming races
     * @param {Object} horseAttributes - Horse breed, specialization, and stats
     * @returns {Array<Object>} Array of styles with suitability scores
     */
    getStyleRecommendations(raceConditions = {}, horseAttributes = {}) {
        return this.getStyleNames().map(styleName => {
            const style = this.getStyle(styleName);
            const displayInfo = style.getDisplayInfo();
            
            // Calculate suitability score
            const suitabilityScore = this.calculateSuitability(style, raceConditions, horseAttributes);
            
            return {
                name: styleName,
                description: displayInfo.description,
                difficulty: displayInfo.difficulty || 'Medium',
                playstyle: displayInfo.playstyle || 'Balanced',
                strengths: displayInfo.strengths,
                suitabilityScore: suitabilityScore,
                recommendation: this.getSuitabilityText(suitabilityScore),
                idealConditions: displayInfo.idealConditions
            };
        });
    }
    
    /**
     * Calculate how suitable a racing style is for given conditions
     * @param {RacingStyle} style - The racing style instance
     * @param {Object} raceConditions - Race conditions
     * @param {Object} horseAttributes - Horse attributes
     * @returns {number} Suitability score (0.6 to 1.4)
     */
    calculateSuitability(style, raceConditions, horseAttributes) {
        let score = 1.0;
        
        // Pace suitability
        if (raceConditions.pace) {
            const paceEffectiveness = style.getPaceEffectiveness(raceConditions.pace);
            score *= paceEffectiveness;
        }
        
        // Specialization compatibility
        if (horseAttributes.specialization) {
            const synergy = style.getSpecializationSynergy(horseAttributes.specialization);
            score *= synergy;
        }
        
        // Distance suitability (basic heuristic)
        if (raceConditions.averageDistance) {
            if (style.name === 'Front Runner' && raceConditions.averageDistance <= 1400) {
                score *= 1.1;
            } else if (style.name === 'Closer' && raceConditions.averageDistance >= 1800) {
                score *= 1.1;
            } else if (style.name === 'Stalker') {
                score *= 1.05; // Stalkers are versatile
            }
        }
        
        // Field size consideration
        if (raceConditions.averageFieldSize) {
            const fieldSize = raceConditions.averageFieldSize;
            if (style.name === 'Closer' && fieldSize >= 10) {
                score *= 1.08; // Closers benefit from large fields
            } else if (style.name === 'Front Runner' && fieldSize <= 8) {
                score *= 1.05; // Front runners prefer smaller fields
            }
        }
        
        // Clamp score to reasonable range
        return Math.max(0.6, Math.min(1.4, score));
    }
    
    /**
     * Get suitability text based on score
     * @param {number} score - The suitability score
     * @returns {string} Human-readable suitability text
     */
    getSuitabilityText(score) {
        if (score >= 1.2) {
            return "Excellent match for race conditions";
        } else if (score >= 1.1) {
            return "Very good match for most races";
        } else if (score >= 0.95) {
            return "Good all-around choice";
        } else if (score >= 0.85) {
            return "Adequate but some races may be challenging";
        } else {
            return "Difficult match - consider alternative styles";
        }
    }
    
    /**
     * Validate if a racing style name exists
     * @param {string} styleName - The style name to validate
     * @returns {boolean} True if the style exists
     */
    isValidStyle(styleName) {
        return this.styles.has(styleName);
    }
    
    /**
     * Get the default racing style name
     * @returns {string} The default style name
     */
    getDefaultStyle() {
        return this.defaultStyle;
    }
    
    /**
     * Get racing style comparison data for selection UI
     * @returns {Object} Comparison data for all racing styles
     */
    getStyleComparison() {
        const comparison = {
            styles: [],
            energyPatterns: {},
            positioningStyles: {},
            pacePreferences: {},
            difficultyLevels: {}
        };
        
        for (const styleName of this.getStyleNames()) {
            const style = this.getStyle(styleName);
            const displayInfo = style.getDisplayInfo();
            
            comparison.styles.push({
                name: styleName,
                description: displayInfo.description,
                difficulty: displayInfo.difficulty,
                strengths: displayInfo.strengths.slice(0, 2) // Top 2 strengths
            });
            
            // Energy patterns
            comparison.energyPatterns[styleName] = displayInfo.energyPattern;
            
            // Positioning styles
            comparison.positioningStyles[styleName] = displayInfo.positioningStyle;
            
            // Pace preferences
            const bestPace = Object.entries(style.paceProfile)
                .sort(([,a], [,b]) => b - a)[0][0];
            comparison.pacePreferences[styleName] = bestPace;
            
            // Difficulty grouping
            const difficulty = displayInfo.difficulty || 'Medium';
            if (!comparison.difficultyLevels[difficulty]) {
                comparison.difficultyLevels[difficulty] = [];
            }
            comparison.difficultyLevels[difficulty].push(styleName);
        }
        
        return comparison;
    }
    
    /**
     * Get recommended racing style based on preferences and horse attributes
     * @param {Object} preferences - Player preferences
     * @param {string} preferences.playstyle - 'aggressive' | 'tactical' | 'patient'
     * @param {string} preferences.difficulty - 'easy' | 'medium' | 'hard'
     * @param {Object} horseAttributes - Horse breed, specialization, stats
     * @returns {Object} Recommended racing style with reasoning
     */
    getRecommendedStyle(preferences = {}, horseAttributes = {}) {
        const { playstyle = 'tactical', difficulty = 'medium' } = preferences;
        
        // Playstyle-based recommendations
        if (playstyle === 'aggressive') {
            return {
                styleName: 'Front Runner',
                reasoning: 'Aggressive early positioning matches your preferred racing approach',
                style: this.getStyle('Front Runner')
            };
        }
        
        if (playstyle === 'patient') {
            return {
                styleName: 'Closer',
                reasoning: 'Patient energy conservation and late moves suit your tactical approach',
                style: this.getStyle('Closer')
            };
        }
        
        // Difficulty-based recommendations
        if (difficulty === 'easy') {
            return {
                styleName: 'Stalker',
                reasoning: 'Balanced tactical approach with good versatility for learning',
                style: this.getStyle('Stalker')
            };
        }
        
        // Specialization synergy recommendations
        if (horseAttributes.specialization) {
            if (horseAttributes.specialization === 'Sprinter') {
                return {
                    styleName: 'Front Runner',
                    reasoning: 'Front running tactics complement Sprinter specialization perfectly',
                    style: this.getStyle('Front Runner')
                };
            }
            
            if (horseAttributes.specialization === 'Stayer') {
                return {
                    styleName: 'Closer',
                    reasoning: 'Closing tactics leverage Stayer stamina for devastating late kicks',
                    style: this.getStyle('Closer')
                };
            }
        }
        
        // Breed synergy recommendations
        if (horseAttributes.breed) {
            if (horseAttributes.breed.name === 'Quarter Horse') {
                return {
                    styleName: 'Front Runner',
                    reasoning: 'Quarter Horse speed capabilities excel with front-running tactics',
                    style: this.getStyle('Front Runner')
                };
            }
            
            if (horseAttributes.breed.name === 'Arabian') {
                return {
                    styleName: 'Closer',
                    reasoning: 'Arabian endurance perfectly suits patient closing tactics',
                    style: this.getStyle('Closer')
                };
            }
        }
        
        // Default to balanced tactical approach
        return {
            styleName: 'Stalker',
            reasoning: 'Versatile tactical racing that adapts well to various race conditions',
            style: this.getStyle('Stalker')
        };
    }
    
    /**
     * Get comprehensive style analysis for a horse
     * @param {Object} horseAttributes - Complete horse information
     * @param {Array<Object>} upcomingRaces - Array of upcoming race information
     * @returns {Object} Detailed style analysis and recommendations
     */
    getStyleAnalysis(horseAttributes, upcomingRaces = []) {
        const analysis = {
            horse: horseAttributes,
            styleRankings: [],
            raceByRaceRecommendations: []
        };
        
        // Overall style rankings
        analysis.styleRankings = this.getStyleNames().map(styleName => {
            const style = this.getStyle(styleName);
            
            // Calculate average suitability across all races
            let avgSuitability = 1.0;
            if (upcomingRaces.length > 0) {
                const suitabilities = upcomingRaces.map(race => 
                    this.calculateSuitability(style, race, horseAttributes)
                );
                avgSuitability = suitabilities.reduce((sum, s) => sum + s, 0) / suitabilities.length;
            }
            
            // Get specialization synergy
            const synergy = horseAttributes.specialization ? 
                style.getSpecializationSynergy(horseAttributes.specialization) : 1.0;
            
            const overallScore = avgSuitability * synergy;
            
            return {
                styleName,
                overallScore,
                avgSuitability,
                synergy,
                style: style.getDisplayInfo()
            };
        }).sort((a, b) => b.overallScore - a.overallScore);
        
        // Race-by-race recommendations
        analysis.raceByRaceRecommendations = upcomingRaces.map((race, index) => {
            const raceRecommendations = this.getStyleNames().map(styleName => {
                const style = this.getStyle(styleName);
                const suitability = this.calculateSuitability(style, race, horseAttributes);
                
                return {
                    styleName,
                    suitability,
                    tacticalAdvice: style.getTacticalRecommendations(race, horseAttributes.stats || {})
                };
            }).sort((a, b) => b.suitability - a.suitability);
            
            return {
                raceNumber: index + 1,
                raceInfo: race,
                recommendations: raceRecommendations
            };
        });
        
        return analysis;
    }
    
    /**
     * Create racing style from save data (for backward compatibility)
     * @param {Object|string} styleData - Either style name string or style object
     * @returns {RacingStyle} The racing style instance
     */
    createFromSaveData(styleData) {
        if (typeof styleData === 'string') {
            return this.getStyle(styleData);
        }
        
        if (styleData && styleData.name) {
            return this.getStyle(styleData.name);
        }
        
        // Fallback to default style
        console.warn('Invalid racing style data in save file, using default style');
        return this.getStyle(this.defaultStyle);
    }
    
    /**
     * Get statistics about racing style usage (for analytics)
     * @returns {Object} Racing style usage statistics
     */
    getStyleStatistics() {
        return {
            totalStyles: this.styles.size,
            styleNames: this.getStyleNames(),
            defaultStyle: this.defaultStyle,
            difficultyDistribution: this.getStyleComparison().difficultyLevels
        };
    }
}

// Export singleton instance
module.exports = new RacingStyleRegistry();