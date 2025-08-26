/**
 * Base Horse Class
 * Shared functionality between Player Horses and NPH horses
 */

class Horse {
  constructor(name, options = {}) {
    // Handle null options gracefully
    options = options || {};
    this.id = options.id || this.generateId();
    this.name = name;
    
    // Core stats (1-100 scale)
    this.stats = {
      speed: options.speed || 20,
      stamina: options.stamina || 20,
      power: options.power || 20
    };
    
    // Current condition
    this.condition = {
      energy: options.energy || 100,
      mood: options.mood || 'Normal', // Excellent, Great, Good, Normal, Tired, Bad
      health: options.health || 100
    };
    
    // Growth potential (affects training gains)
    this.growthRates = {
      speed: options.speedGrowth || 'B',   // S, A, B, C, D
      stamina: options.staminaGrowth || 'B',
      power: options.powerGrowth || 'B'
    };
    
    // Racing strategy (can be overridden)
    this.strategy = options.strategy || 'MID'; // FRONT, MID, LATE
    
    // Creation timestamp
    this.created = options.created || Date.now();
  }

  /**
   * Generate unique horse ID
   */
  generateId() {
    return 'horse_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get current stats (base stats + any modifiers)
   */
  getCurrentStats() {
    return {
      speed: this.stats.speed,
      stamina: this.stats.stamina,
      power: this.stats.power
    };
  }

  /**
   * Calculate total horse power (sum of all stats)
   */
  getTotalPower() {
    return this.stats.speed + this.stats.stamina + this.stats.power;
  }

  /**
   * Increase a stat with growth rate modifiers
   */
  increaseStat(stat, baseAmount) {
    if (!this.stats.hasOwnProperty(stat)) {
      throw new Error(`Invalid stat: ${stat}`);
    }

    // Apply growth rate multiplier
    const growthMultiplier = this.getGrowthMultiplier(this.growthRates[stat]);
    
    // Calculate actual gain with some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // ±20% variance
    const actualGain = Math.max(1, Math.round(baseAmount * growthMultiplier * randomFactor));
    
    // Apply the gain (capped at 100)
    const oldValue = this.stats[stat];
    this.stats[stat] = Math.min(100, this.stats[stat] + actualGain);
    
    return this.stats[stat] - oldValue; // Return actual gain
  }

  /**
   * Get growth rate multiplier
   */
  getGrowthMultiplier(grade) {
    const multipliers = {
      'S': 1.5,
      'A': 1.3,
      'B': 1.0,
      'C': 0.8,
      'D': 0.6
    };
    return multipliers[grade] || 1.0;
  }

  /**
   * Change energy level
   */
  changeEnergy(amount) {
    this.condition.energy = Math.max(0, Math.min(100, this.condition.energy + amount));
    
    // Update mood based on energy level
    this.updateMood();
    
    return this.condition.energy;
  }

  /**
   * Update mood based on condition
   */
  updateMood() {
    const energy = this.condition.energy;
    const health = this.condition.health;
    
    if (energy >= 90 && health >= 90) {
      this.condition.mood = Math.random() > 0.7 ? 'Excellent' : 'Great';
    } else if (energy >= 70 && health >= 70) {
      this.condition.mood = Math.random() > 0.5 ? 'Great' : 'Good';
    } else if (energy >= 50 && health >= 50) {
      this.condition.mood = 'Normal';
    } else if (energy >= 30 && health >= 30) {
      this.condition.mood = 'Tired';
    } else {
      this.condition.mood = 'Bad';
    }
  }

  /**
   * Get mood performance multiplier
   */
  getMoodMultiplier() {
    const moodMap = {
      'Excellent': 1.15,
      'Great': 1.10,
      'Good': 1.05,
      'Normal': 1.0,
      'Tired': 0.90,
      'Bad': 0.80
    };
    return moodMap[this.condition.mood] || 1.0;
  }

  /**
   * Get horse summary for display
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      stats: { ...this.stats },
      condition: { ...this.condition },
      strategy: this.strategy,
      totalPower: this.getTotalPower(),
      moodMultiplier: this.getMoodMultiplier()
    };
  }

  /**
   * Check if horse is in racing condition
   */
  canRace() {
    return this.condition.health > 20 && this.condition.energy > 10;
  }

  /**
   * Prepare horse for racing (sets optimal energy/mood)
   */
  prepareForRace() {
    // Horses get some energy boost before races
    this.changeEnergy(Math.random() * 10);
    
    // Update mood
    this.updateMood();
  }

  /**
   * Apply post-race effects
   */
  applyRaceEffects(position, fieldSize) {
    // Energy cost based on race effort
    const energyCost = 15 + Math.random() * 10;
    this.changeEnergy(-energyCost);
    
    // Slight health impact
    this.condition.health = Math.max(80, this.condition.health - 2);
    
    // Mood adjustment based on performance
    if (position <= fieldSize / 3) {
      // Good performance - mood boost
      if (Math.random() > 0.5) {
        const currentMoodIndex = ['Bad', 'Tired', 'Normal', 'Good', 'Great', 'Excellent'].indexOf(this.condition.mood);
        if (currentMoodIndex < 5) {
          this.condition.mood = ['Bad', 'Tired', 'Normal', 'Good', 'Great', 'Excellent'][currentMoodIndex + 1];
        }
      }
    }
  }

  /**
   * Serialize horse for save/load
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      stats: this.stats,
      condition: this.condition,
      growthRates: this.growthRates,
      strategy: this.strategy,
      created: this.created,
      // Subclasses should override and add their specific data
      type: this.constructor.name.toLowerCase()
    };
  }

  /**
   * Create horse from saved data
   */
  static fromJSON(data) {
    return new Horse(data.name, {
      id: data.id,
      speed: data.stats.speed,
      stamina: data.stats.stamina,
      power: data.stats.power,
      energy: data.condition.energy,
      mood: data.condition.mood,
      health: data.condition.health,
      speedGrowth: data.growthRates.speed,
      staminaGrowth: data.growthRates.stamina,
      powerGrowth: data.growthRates.power,
      strategy: data.strategy,
      created: data.created
    });
  }

  /**
   * Validate horse data integrity
   */
  validate() {
    const errors = [];
    
    // Check required fields
    if (!this.name || typeof this.name !== 'string') {
      errors.push('Invalid name');
    }
    
    // Check stats are in valid range
    ['speed', 'stamina', 'power'].forEach(stat => {
      if (this.stats[stat] < 1 || this.stats[stat] > 100) {
        errors.push(`Invalid ${stat}: must be 1-100`);
      }
    });
    
    // Check condition values
    if (this.condition.energy < 0 || this.condition.energy > 100) {
      errors.push('Invalid energy: must be 0-100');
    }
    
    if (this.condition.health < 0 || this.condition.health > 100) {
      errors.push('Invalid health: must be 0-100');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = Horse;