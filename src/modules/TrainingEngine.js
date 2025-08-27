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
      'media': {
        energyCost: 0,
        energyGain: 15,  // Half of rest day recovery
        publicityGain: 10,  // Build public relations/fan support
        primaryStat: null,
        conditionImprovement: true
      }
    };

    // Form multipliers for training gains (horse racing terminology)
    this.formMultipliers = {
      'Peak Form': 1.15,      // Horse is in peak condition
      'Good Form': 1.10,      // Horse is performing well
      'Steady': 1.05,         // Horse is consistent
      'Average': 1.0,         // Baseline performance  
      'Off Form': 0.90,       // Horse is struggling
      'Poor Form': 0.80       // Horse needs recovery
    };

    // Form improvement chances after successful training  
    this.formImprovements = {
      'Average': ['Steady', 'Good Form'],
      'Steady': ['Good Form', 'Peak Form'], 
      'Good Form': ['Peak Form'],
      'Off Form': ['Average', 'Steady'],
      'Poor Form': ['Average', 'Steady']
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
      bond: 0,
      energyCost: config.energyCost
    };

    // Handle rest training
    if (trainingType === 'rest') {
      gains.energy = config.energyGain;
      return gains;
    }

    // Handle media training
    if (trainingType === 'media') {
      gains.publicity = config.publicityGain;
      gains.energy = config.energyGain;
      return gains;
    }

    // Handle stat training
    if (config.primaryStat) {
      const formMultiplier = this.formMultipliers[character.condition.form] || 1.0;
      const baseGain = config.baseGain;
      
      // Apply form multiplier first, then add randomness to ensure form differences are preserved
      const formAdjustedGain = baseGain * formMultiplier;
      
      // Add some randomness (±1) but ensure form effect is maintained
      // Skip randomness if deterministic option is set (for testing)
      const randomVariation = options.deterministic ? 0 : (Math.floor(Math.random() * 3) - 1); // -1 to +1
      
      const finalGain = Math.max(1, Math.round(formAdjustedGain + randomVariation));
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

    // Apply energy changes (always round to integers)
    if (trainingType === 'rest' || trainingType === 'media') {
      character.condition.energy = Math.round(Math.min(100, character.condition.energy + gains.energy));
    } else {
      character.condition.energy = Math.round(Math.max(0, character.condition.energy - config.energyCost));
    }

    // Apply form improvements for stat training
    if (config.moodImprovement && trainingType !== 'rest') {
      this.improveForm(character);
    }
    
    // Apply form improvements for media training  
    if (config.conditionImprovement && trainingType === 'media') {
      this.improveForm(character);
    }

    // Handle bond gains (future enhancement)
    if (gains.bond > 0) {
      // Friendship system could be implemented here
    }

    return gains;
  }

  /**
   * Improve character form after successful training
   * @param {Character} character - Character to improve form for
   */
  improveForm(character) {
    const currentForm = character.condition.form;
    const possibleImprovements = this.formImprovements[currentForm];
    
    if (possibleImprovements && Math.random() < 0.3) { // 30% chance to improve
      const improvement = possibleImprovements[Math.floor(Math.random() * possibleImprovements.length)];
      character.condition.form = improvement;
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