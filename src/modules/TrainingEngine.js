/**
 * TrainingEngine Module
 * Training mechanics and stat calculations
 */

class TrainingEngine {
  constructor() {
    // Training type configurations
    this.trainingTypes = {
      'speed': {
        energyCost: 15,
        baseGain: 8,
        primaryStat: 'speed',
        moodImprovement: true
      },
      'stamina': {
        energyCost: 10,
        baseGain: 7,
        primaryStat: 'stamina',
        moodImprovement: true
      },
      'power': {
        energyCost: 15,
        baseGain: 8,
        primaryStat: 'power',
        moodImprovement: true
      },
      'rest': {
        energyCost: 0,
        energyGain: 30,
        primaryStat: null,
        moodImprovement: false
      },
      'social': {
        energyCost: 5,
        friendshipGain: 10,
        primaryStat: null,
        moodImprovement: true
      }
    };

    // Mood multipliers for training gains
    this.moodMultipliers = {
      'Excellent': 1.15,
      'Great': 1.10,
      'Good': 1.05,
      'Normal': 1.0,
      'Tired': 0.90,
      'Bad': 0.80
    };

    // Mood improvement chances after successful training
    this.moodImprovements = {
      'Normal': ['Good', 'Great'],
      'Good': ['Great', 'Excellent'],
      'Great': ['Excellent'],
      'Tired': ['Normal', 'Good'],
      'Bad': ['Normal', 'Good']
    };
  }

  /**
   * Calculate training gains without applying them
   * @param {Character} character - Character to calculate gains for
   * @param {string} trainingType - Type of training
   * @param {object} options - Optional parameters (e.g., deterministic for testing)
   * @returns {object} Calculated gains
   */
  calculateGains(character, trainingType, options = {}) {
    if (!this.trainingTypes[trainingType]) {
      throw new Error(`Invalid training type: ${trainingType}`);
    }

    const config = this.trainingTypes[trainingType];
    const gains = {
      speed: 0,
      stamina: 0,
      power: 0,
      energy: 0,
      friendship: 0,
      energyCost: config.energyCost
    };

    // Handle rest training
    if (trainingType === 'rest') {
      gains.energy = config.energyGain;
      return gains;
    }

    // Handle social training
    if (trainingType === 'social') {
      gains.friendship = config.friendshipGain;
      return gains;
    }

    // Handle stat training
    if (config.primaryStat) {
      const moodMultiplier = this.moodMultipliers[character.condition.mood] || 1.0;
      const baseGain = config.baseGain;
      
      // Apply mood multiplier first, then add randomness to ensure mood differences are preserved
      const moodAdjustedGain = baseGain * moodMultiplier;
      
      // Add some randomness (±1) but ensure mood effect is maintained
      // Skip randomness if deterministic option is set (for testing)
      const randomVariation = options.deterministic ? 0 : (Math.floor(Math.random() * 3) - 1); // -1 to +1
      
      const finalGain = Math.max(1, Math.round(moodAdjustedGain + randomVariation));
      gains[config.primaryStat] = finalGain;
    }

    return gains;
  }

  /**
   * Apply training to character
   * @param {Character} character - Character to train
   * @param {string} trainingType - Type of training
   * @returns {object} Applied gains
   */
  applyTraining(character, trainingType) {
    if (!this.trainingTypes[trainingType]) {
      throw new Error(`Invalid training type: ${trainingType}`);
    }

    const config = this.trainingTypes[trainingType];

    // Check energy requirements
    if (!character.canTrain(config.energyCost)) {
      throw new Error('Insufficient energy for training');
    }

    // Calculate gains
    const gains = this.calculateGains(character, trainingType);

    // Apply stat gains
    if (gains.speed > 0) {
      character.stats.speed = Math.min(100, character.stats.speed + gains.speed);
    }
    if (gains.stamina > 0) {
      character.stats.stamina = Math.min(100, character.stats.stamina + gains.stamina);
    }
    if (gains.power > 0) {
      character.stats.power = Math.min(100, character.stats.power + gains.power);
    }

    // Apply energy changes
    if (trainingType === 'rest') {
      character.condition.energy = Math.min(100, character.condition.energy + gains.energy);
    } else {
      character.condition.energy = Math.max(0, character.condition.energy - config.energyCost);
    }

    // Apply mood improvements for stat training
    if (config.moodImprovement && trainingType !== 'rest') {
      this.improveMood(character);
    }

    // Handle friendship gains (future enhancement)
    if (gains.friendship > 0) {
      // Friendship system could be implemented here
    }

    return gains;
  }

  /**
   * Improve character mood after successful training
   * @param {Character} character - Character to improve mood for
   */
  improveMood(character) {
    const currentMood = character.condition.mood;
    const possibleImprovements = this.moodImprovements[currentMood];
    
    if (possibleImprovements && Math.random() < 0.3) { // 30% chance to improve
      const improvement = possibleImprovements[Math.floor(Math.random() * possibleImprovements.length)];
      character.condition.mood = improvement;
    }
  }

  /**
   * Get training recommendations based on character state
   * @param {Character} character - Character to analyze
   * @returns {array} Array of training recommendations
   */
  getTrainingRecommendations(character) {
    const recommendations = [];

    // Energy-based recommendations
    if (character.condition.energy < 20) {
      recommendations.push('Rest recommended - energy is very low');
    } else if (character.condition.energy < 40) {
      recommendations.push('Consider rest - energy is getting low');
    }

    // Stat-based recommendations
    const stats = character.stats;
    const lowest = Math.min(stats.speed, stats.stamina, stats.power);
    
    if (stats.speed === lowest && stats.speed < 50) {
      recommendations.push('Speed training recommended - lowest stat');
    }
    if (stats.stamina === lowest && stats.stamina < 50) {
      recommendations.push('Stamina training recommended - lowest stat');
    }
    if (stats.power === lowest && stats.power < 50) {
      recommendations.push('Power training recommended - lowest stat');
    }

    // Mood-based recommendations
    if (character.condition.mood === 'Tired' || character.condition.mood === 'Bad') {
      recommendations.push('Social time recommended - mood needs improvement');
    }

    return recommendations;
  }

  /**
   * Validate training attempt
   * @param {Character} character - Character to validate
   * @param {string} trainingType - Type of training
   * @returns {object} Validation result
   */
  validateTraining(character, trainingType) {
    if (!this.trainingTypes[trainingType]) {
      return {
        valid: false,
        reason: `Unknown training type: ${trainingType}`
      };
    }

    const config = this.trainingTypes[trainingType];

    if (!character.canTrain(config.energyCost)) {
      return {
        valid: false,
        reason: `Insufficient energy. Required: ${config.energyCost}, Available: ${character.condition.energy}`
      };
    }

    return {
      valid: true
    };
  }

  /**
   * Get all available training types
   * @returns {array} Array of training type names
   */
  getAvailableTrainingTypes() {
    return Object.keys(this.trainingTypes);
  }

  /**
   * Get training type configuration
   * @param {string} trainingType - Training type to get config for
   * @returns {object} Training configuration
   */
  getTrainingConfig(trainingType) {
    return this.trainingTypes[trainingType] || null;
  }
}

module.exports = TrainingEngine;