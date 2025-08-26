/**
 * Game Utility Functions - DRY principle implementation
 * Common functions used across multiple game systems
 */

// Validation utilities
const validation = {
  /**
   * Validates character name according to game rules
   * @param {string} name - Name to validate
   * @returns {Object} - {valid: boolean, message: string}
   */
  validateCharacterName(name) {
    if (!name || name.trim().length === 0) {
      return {
        valid: false,
        message: 'Name must be 1-20 characters'
      };
    }

    if (name.length > 20) {
      return {
        valid: false,
        message: 'Name must be 1-20 characters'
      };
    }

    if (!/^[a-zA-Z0-9\s'-]+$/.test(name)) {
      return {
        valid: false,
        message: 'Name must be 1-20 characters (letters, numbers, spaces, apostrophes, hyphens)'
      };
    }

    return { valid: true };
  },

  /**
   * Validates stat values are within game bounds
   * @param {number} value - Stat value
   * @param {number} min - Minimum allowed (default 1)
   * @param {number} max - Maximum allowed (default 100)
   * @returns {boolean}
   */
  isValidStatValue(value, min = 1, max = 100) {
    return typeof value === 'number' && value >= min && value <= max;
  }
};

// Stat calculation utilities
const stats = {
  /**
   * Calculates training gain with modifiers
   * @param {number} baseGain - Base stat increase
   * @param {string} mood - Character mood ('Great', 'Good', 'Normal', 'Bad')
   * @param {number} friendship - Friendship level (0-100)
   * @returns {number} - Final stat gain
   */
  calculateTrainingGain(baseGain, mood = 'Normal', friendship = 0) {
    let gain = baseGain;
    
    // Mood modifier
    const moodModifiers = {
      'Great': 1.2,
      'Good': 1.1,
      'Normal': 1.0,
      'Bad': 0.8
    };
    gain *= (moodModifiers[mood] || 1.0);
    
    // Friendship bonus (at 80+ friendship, 1.5x gain)
    if (friendship >= 80) {
      gain *= 1.5;
    }
    
    return Math.round(gain);
  },

  /**
   * Clamps stat value within bounds
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum (default 1)
   * @param {number} max - Maximum (default 100)
   * @returns {number}
   */
  clampStat(value, min = 1, max = 100) {
    return Math.max(min, Math.min(max, value));
  }
};

// Race calculation utilities
const race = {
  /**
   * Calculates race performance based on stats
   * @param {Object} stats - {speed, stamina, power}
   * @param {string} distance - 'sprint', 'mile', 'long'
   * @param {number} currentStamina - Current stamina percentage (0-1)
   * @returns {number} - Performance score
   */
  calculatePerformance(stats, distance = 'mile', currentStamina = 1) {
    let weights = { speed: 0.4, stamina: 0.4, power: 0.2 };
    
    // Adjust weights based on distance
    switch (distance) {
      case 'sprint':
        weights = { speed: 0.6, stamina: 0.2, power: 0.2 };
        break;
      case 'long':
        weights = { speed: 0.2, stamina: 0.6, power: 0.2 };
        break;
    }
    
    const basePerformance = 
      (stats.speed * weights.speed) + 
      (stats.stamina * weights.stamina) + 
      (stats.power * weights.power);
    
    // Apply stamina factor
    const staminaFactor = Math.max(0.5, currentStamina);
    
    // Add random variance (±15%)
    const variance = 0.85 + (Math.random() * 0.3);
    
    return basePerformance * staminaFactor * variance;
  },

  /**
   * Determines race distance type from meters
   * @param {number} distance - Distance in meters
   * @returns {string} - 'sprint', 'mile', or 'long'
   */
  getDistanceType(distance) {
    if (distance <= 1200) return 'sprint';
    if (distance <= 1800) return 'mile';
    return 'long';
  }
};

// UI utilities
const ui = {
  /**
   * Formats stat value with progress bar
   * @param {number} value - Current value
   * @param {number} max - Maximum value (default 100)
   * @param {number} width - Bar width (default 10)
   * @returns {string} - ASCII progress bar
   */
  formatProgressBar(value, max = 100, width = 10) {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  },

  /**
   * Formats training result message
   * @param {string} trainingType - Type of training
   * @param {number} gain - Stat gain amount
   * @param {number} currentValue - New stat value
   * @returns {string} - Formatted message
   */
  formatTrainingResult(trainingType, gain, currentValue) {
    const statName = trainingType.charAt(0).toUpperCase() + trainingType.slice(1);
    return `${statName} increased by ${gain}! (Current: ${currentValue})`;
  },

  /**
   * Formats race commentary based on position
   * @param {number} position - Race finishing position (1-8)
   * @returns {string} - Commentary message
   */
  formatRaceCommentary(position) {
    if (position === 1) return 'Amazing victory!';
    if (position <= 3) return 'Great performance!';
    if (position <= 5) return 'Solid effort';
    return 'Need more training';
  }
};

// Result object utilities
const result = {
  /**
   * Creates standardized success result
   * @param {string} message - Success message
   * @param {Object} data - Additional data
   * @returns {Object}
   */
  success(message, data = {}) {
    return {
      success: true,
      message,
      ...data
    };
  },

  /**
   * Creates standardized failure result
   * @param {string} message - Error message
   * @param {Object} data - Additional data
   * @returns {Object}
   */
  failure(message, data = {}) {
    return {
      success: false,
      message,
      ...data
    };
  }
};

// Energy system utilities
const energy = {
  /**
   * Training energy costs
   */
  COSTS: {
    speed: 15,
    stamina: 10,
    power: 15,
    rest: 0,
    social: 5
  },

  /**
   * Checks if character has enough energy for training
   * @param {number} currentEnergy - Current energy
   * @param {string} trainingType - Type of training
   * @returns {boolean}
   */
  hasEnoughEnergy(currentEnergy, trainingType) {
    const cost = this.COSTS[trainingType] || 0;
    return currentEnergy >= cost;
  },

  /**
   * Calculates energy after rest
   * @param {number} currentEnergy - Current energy
   * @param {number} restAmount - Amount to restore (default 30)
   * @param {number} maxEnergy - Maximum energy (default 100)
   * @returns {number}
   */
  calculateRestEnergy(currentEnergy, restAmount = 30, maxEnergy = 100) {
    return Math.min(maxEnergy, currentEnergy + restAmount);
  }
};

module.exports = {
  validation,
  stats,
  race,
  ui,
  result,
  energy
};