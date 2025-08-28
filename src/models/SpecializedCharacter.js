/**
 * Specialized Character Class - v1 Enhancement
 * 
 * Extends the base Character class with breed specialization, racing styles,
 * and surface preferences. This creates strategic depth and replayability
 * through different build paths and optimization strategies.
 */

const Character = require('./Character');
const HorseBreed = require('./specializations/HorseBreed');
const RacingStyle = require('./specializations/RacingStyle');

class SpecializedCharacter extends Character {
  constructor(name, options = {}) {
    super(name, options);
    
    // Initialize specialization systems
    this.breedSystem = new HorseBreed();
    this.styleSystem = new RacingStyle();
    
    // Breed and style selection
    this.breed = options.breed || this.selectRandomBreed();
    this.racingStyle = options.racingStyle || this.determineOptimalStyle();
    
    // Apply breed modifiers to base stats
    this.applyBreedModifiers();
    
    // Specialization tracking
    this.specialization = {
      breedBonus: 0,          // Accumulated breed-specific bonuses
      styleEfficiency: 1.0,   // Racing style efficiency rating
      surfaceExperience: {    // Experience on different surfaces
        DIRT: 0,
        TURF: 0
      },
      distanceExperience: {   // Experience at different distances
        SPRINT: 0,
        MILE: 0,
        MEDIUM: 0,
        LONG: 0
      },
      preferredConditions: this.calculatePreferredConditions(),
      adaptabilityRating: this.calculateAdaptabilityRating()
    };
    
    // Training focus based on breed recommendations
    this.trainingRecommendations = this.breedSystem.getTrainingRecommendations(this.breed);
  }

  /**
   * Select random breed based on rarity weights
   * @returns {string} Breed ID
   */
  selectRandomBreed() {
    const selectedBreed = this.breedSystem.getRandomBreed();
    return selectedBreed.id;
  }

  /**
   * Determine optimal racing style based on current stats
   * @returns {string} Racing style ID
   */
  determineOptimalStyle() {
    const stats = this.getCurrentStats();
    const recommendation = this.styleSystem.getOptimalStyle(stats);
    return recommendation.style.id;
  }

  /**
   * Apply breed modifiers to starting stats
   */
  applyBreedModifiers() {
    const originalStats = { ...this.stats };
    const modifiedStats = this.breedSystem.applyStatModifiers(originalStats, this.breed);
    
    this.stats = {
      speed: Math.min(100, Math.max(1, modifiedStats.speed)),
      stamina: Math.min(100, Math.max(1, modifiedStats.stamina)),
      power: Math.min(100, Math.max(1, modifiedStats.power))
    };
  }

  /**
   * Get training efficiency based on breed bonuses
   * @param {string} trainingType - Type of training
   * @returns {number} Training efficiency multiplier
   */
  getTrainingEfficiency(trainingType) {
    const breedEfficiency = this.breedSystem.getTrainingEfficiency(this.breed, trainingType);
    const baseEfficiency = super.getTrainingEfficiency ? super.getTrainingEfficiency(trainingType) : 1.0;
    
    // Combine breed bonus with base efficiency
    return baseEfficiency * breedEfficiency;
  }

  /**
   * Calculate race performance with breed and style modifiers
   * @param {Object} raceInfo - Race information (surface, distance, etc.)
   * @param {string} strategy - Racing strategy chosen by player
   * @returns {number} Performance score
   */
  calculateRacePerformance(raceInfo, strategy = 'MID') {
    // Base performance calculation
    const basePerformance = this.calculateBaseRacePerformance(raceInfo);
    
    // Apply breed modifiers
    const breedModifier = this.breedSystem.getRacePerformanceModifier(this.breed, raceInfo);
    
    // Apply racing style modifiers for different segments
    // For now, use 'middle' segment as representative
    const styleModifier = this.styleSystem.getSegmentPerformance(this.racingStyle, raceInfo, 'middle');
    
    // Apply experience bonuses
    const experienceModifier = this.getExperienceModifier(raceInfo);
    
    // Strategy compatibility bonus
    const strategyModifier = this.getStrategyCompatibility(strategy, raceInfo);
    
    return basePerformance * breedModifier * styleModifier * experienceModifier * strategyModifier;
  }

  /**
   * Calculate base race performance (same as original logic)
   * @param {Object} raceInfo - Race information
   * @returns {number} Base performance score
   */
  calculateBaseRacePerformance(raceInfo) {
    const stats = this.getCurrentStats();
    const energyFactor = this.condition.energy / 100;
    const formFactor = this.getFormMultiplier();
    
    // Distance-based stat weights
    let speedWeight = 0.4;
    let staminaWeight = 0.4;
    let powerWeight = 0.2;
    
    if (raceInfo.type === 'SPRINT') {
      speedWeight = 0.5;
      powerWeight = 0.3;
      staminaWeight = 0.2;
    } else if (raceInfo.type === 'LONG') {
      staminaWeight = 0.5;
      speedWeight = 0.3;
      powerWeight = 0.2;
    }
    
    const weightedStats = (
      stats.speed * speedWeight +
      stats.stamina * staminaWeight +
      stats.power * powerWeight
    );
    
    return weightedStats * energyFactor * formFactor;
  }

  /**
   * Get experience modifier based on surface and distance
   * @param {Object} raceInfo - Race information
   * @returns {number} Experience modifier
   */
  getExperienceModifier(raceInfo) {
    let modifier = 1.0;
    
    // Surface experience bonus (up to +10%)
    const surfaceExp = this.specialization.surfaceExperience[raceInfo.surface] || 0;
    modifier += Math.min(0.1, surfaceExp * 0.02);
    
    // Distance experience bonus (up to +8%)
    const distanceExp = this.specialization.distanceExperience[raceInfo.type] || 0;
    modifier += Math.min(0.08, distanceExp * 0.015);
    
    return modifier;
  }

  /**
   * Get strategy compatibility modifier
   * @param {string} strategy - Chosen strategy
   * @param {Object} raceInfo - Race information
   * @returns {number} Strategy modifier
   */
  getStrategyCompatibility(strategy, raceInfo) {
    const breed = this.breedSystem.getBreed(this.breed);
    const style = this.styleSystem.getStyle(this.racingStyle);
    
    if (!breed || !style) return 1.0;
    
    let modifier = 1.0;
    
    // Check if strategy matches breed preferences
    if (breed.preferredStrategies && breed.preferredStrategies.includes(strategy)) {
      modifier += 0.05; // +5% for matching breed preference
    }
    
    // Check racing style compatibility
    const styleMapping = {
      'FRONT': 'FRONT_RUNNER',
      'MID': 'STALKER',
      'LATE': 'CLOSER'
    };
    
    if (styleMapping[strategy] === this.racingStyle) {
      modifier += 0.1; // +10% for matching racing style
    }
    
    return modifier;
  }

  /**
   * Update experience after a race
   * @param {Object} raceInfo - Race information
   * @param {Object} raceResult - Race result
   */
  updateRaceExperience(raceInfo, raceResult) {
    // Increase surface experience
    if (raceInfo.surface) {
      this.specialization.surfaceExperience[raceInfo.surface] = 
        Math.min(10, (this.specialization.surfaceExperience[raceInfo.surface] || 0) + 1);
    }
    
    // Increase distance experience
    if (raceInfo.type) {
      this.specialization.distanceExperience[raceInfo.type] = 
        Math.min(10, (this.specialization.distanceExperience[raceInfo.type] || 0) + 1);
    }
    
    // Update style efficiency based on performance
    if (raceResult.placement <= 3) {
      this.specialization.styleEfficiency = Math.min(1.2, this.specialization.styleEfficiency + 0.02);
    }
    
    // Recalculate adaptability
    this.specialization.adaptabilityRating = this.calculateAdaptabilityRating();
  }

  /**
   * Calculate preferred racing conditions
   * @returns {Object} Preferred conditions
   */
  calculatePreferredConditions() {
    const breed = this.breedSystem.getBreed(this.breed);
    const style = this.styleSystem.getStyle(this.racingStyle);
    
    if (!breed || !style) return {};
    
    // Find best surface
    let bestSurface = 'DIRT';
    let bestSurfaceBonus = breed.surfacePreferences.DIRT || 1.0;
    
    Object.entries(breed.surfacePreferences).forEach(([surface, bonus]) => {
      if (bonus > bestSurfaceBonus) {
        bestSurface = surface;
        bestSurfaceBonus = bonus;
      }
    });
    
    // Find best distance
    let bestDistance = 'MILE';
    let bestDistanceBonus = breed.distancePreferences.MILE || 1.0;
    
    Object.entries(breed.distancePreferences).forEach(([distance, bonus]) => {
      if (bonus > bestDistanceBonus) {
        bestDistance = distance;
        bestDistanceBonus = bonus;
      }
    });
    
    return {
      surface: bestSurface,
      distance: bestDistance,
      strategy: breed.preferredStrategies[0] || 'MID',
      optimalConditions: style.optimalConditions
    };
  }

  /**
   * Calculate adaptability rating (how well horse performs outside optimal conditions)
   * @returns {number} Adaptability rating (0-100)
   */
  calculateAdaptabilityRating() {
    const breed = this.breedSystem.getBreed(this.breed);
    if (!breed) return 50;
    
    // Calculate variance in breed bonuses - lower variance = more adaptable
    const surfaceBonuses = Object.values(breed.surfacePreferences);
    const distanceBonuses = Object.values(breed.distancePreferences);
    
    const surfaceVariance = this.calculateVariance(surfaceBonuses);
    const distanceVariance = this.calculateVariance(distanceBonuses);
    
    // Lower variance means more adaptable
    const adaptability = Math.max(0, Math.min(100, 
      100 - (surfaceVariance * 200 + distanceVariance * 150)
    ));
    
    return Math.round(adaptability);
  }

  /**
   * Calculate statistical variance
   * @param {Array} values - Array of numbers
   * @returns {number} Variance
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Get comprehensive specialization info for UI
   * @returns {Object} Specialization information
   */
  getSpecializationInfo() {
    const breed = this.breedSystem.getBreed(this.breed);
    const style = this.styleSystem.getStyle(this.racingStyle);
    const recommendations = this.trainingRecommendations;
    
    return {
      breed: breed ? {
        name: breed.name,
        description: breed.description,
        rarity: breed.rarity,
        characteristics: breed.characteristics
      } : null,
      
      racingStyle: style ? {
        name: style.name,
        description: style.description,
        advantages: style.advantages,
        risks: style.risks
      } : null,
      
      trainingRecommendations: {
        focus: recommendations.focus || [],
        avoid: recommendations.avoid || [],
        strategies: recommendations.strategies || []
      },
      
      preferredConditions: this.specialization.preferredConditions,
      adaptabilityRating: this.specialization.adaptabilityRating,
      
      experience: {
        surface: this.specialization.surfaceExperience,
        distance: this.specialization.distanceExperience
      }
    };
  }

  /**
   * Get training advice based on specialization
   * @returns {string} Training advice
   */
  getTrainingAdvice() {
    const recommendations = this.trainingRecommendations;
    let advice = '';
    
    if (recommendations.focus && recommendations.focus.length > 0) {
      advice += `Focus on ${recommendations.focus.join(' and ')} training for your ${this.breedSystem.getBreed(this.breed)?.name || 'breed'}. `;
    }
    
    if (recommendations.avoid && recommendations.avoid.length > 0) {
      advice += `Minimize ${recommendations.avoid.join(' and ')} training as it's less effective. `;
    }
    
    if (recommendations.strategies && recommendations.strategies.length > 0) {
      advice += `Preferred racing strategies: ${recommendations.strategies.join(', ')}.`;
    }
    
    return advice.trim() || 'Continue balanced training to develop your horse\'s potential.';
  }

  /**
   * Serialize specialized character for save system
   * @returns {Object} Serialized data
   */
  serialize() {
    const baseData = super.serialize();
    
    return {
      ...baseData,
      breed: this.breed,
      racingStyle: this.racingStyle,
      specialization: this.specialization,
      trainingRecommendations: this.trainingRecommendations
    };
  }

  /**
   * Deserialize specialized character from save data
   * @param {Object} data - Save data
   * @returns {SpecializedCharacter} Restored character
   */
  static deserialize(data) {
    const character = new SpecializedCharacter(data.name, {
      ...data,
      breed: data.breed,
      racingStyle: data.racingStyle
    });
    
    if (data.specialization) {
      character.specialization = data.specialization;
    }
    
    if (data.trainingRecommendations) {
      character.trainingRecommendations = data.trainingRecommendations;
    }
    
    return character;
  }
}

module.exports = SpecializedCharacter;