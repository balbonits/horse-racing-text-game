/**
 * Player Character Class
 * Extends the base Horse class with player-specific functionality
 */

const Horse = require('./Horse');

class Character extends Horse {
  constructor(name, options = {}) {
    // Handle null options gracefully
    options = options || {};
    
    // Call parent constructor
    super(name, options);
    
    // Override ID generation for player horses
    this.id = options.id || this.generatePlayerId();
    
    // Player-specific systems
    this.friendship = options.friendship || 0; // 0-100
    
    // Career tracking
    this.career = {
      turn: options.turn || 1,
      maxTurns: options.maxTurns || 12,
      racesWon: options.racesWon || 0,
      racesRun: options.racesRun || 0,
      totalTraining: options.totalTraining || 0
    };
    
    // Legacy bonuses from previous runs
    this.legacyBonuses = options.legacyBonuses || {
      speedBonus: 0,
      staminaBonus: 0, 
      powerBonus: 0,
      energyBonus: 0
    };
    
    // Set initial career state if provided
    if (options.career) {
      this.career = { ...this.career, ...options.career };
    }
  }
  
  /**
   * Generate player-specific ID
   */
  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  // Getters for backward compatibility 
  get energy() {
    return this.condition.energy;
  }

  set energy(value) {
    this.condition.energy = Math.max(0, Math.min(100, value));
  }

  get mood() {
    return this.condition.mood;
  }

  set mood(value) {
    this.condition.mood = value;
  }
  
  /**
   * Get current stat values including legacy bonuses
   * Overrides base Horse method to include legacy bonuses
   */
  getCurrentStats() {
    return {
      speed: Math.min(100, this.stats.speed + this.legacyBonuses.speedBonus),
      stamina: Math.min(100, this.stats.stamina + this.legacyBonuses.staminaBonus),
      power: Math.min(100, this.stats.power + this.legacyBonuses.powerBonus)
    };
  }
  
  /**
   * Get friendship bonus multiplier
   */
  getFriendshipBonus() {
    if (this.friendship >= 80) return 1.5;
    if (this.friendship >= 60) return 1.2;
    if (this.friendship >= 40) return 1.1;
    return 1.0;
  }
  
  /**
   * Increase a stat with all modifiers applied
   * Enhanced version with friendship bonus for player horses
   */
  increaseStat(statName, baseGain) {
    if (!this.stats.hasOwnProperty(statName)) {
      console.warn(`Warning: Invalid stat "${statName}" - skipping stat increase`);
      return 0;
    }

    // Get all multipliers
    const growthMultiplier = this.getGrowthMultiplier(this.growthRates[statName]);
    const moodMultiplier = this.getMoodMultiplier();
    const friendshipBonus = this.getFriendshipBonus();
    
    // Calculate final gain
    const finalGain = Math.round(baseGain * growthMultiplier * moodMultiplier * friendshipBonus);
    const randomVariance = Math.random() * 0.4 + 0.8; // ±20% variance
    const actualGain = Math.max(1, Math.round(finalGain * randomVariance));
    
    // Apply the gain (capped at 100)
    const oldValue = this.stats[statName];
    this.stats[statName] = Math.min(100, this.stats[statName] + actualGain);
    this.career.totalTraining++;
    
    return this.stats[statName] - oldValue; // Return actual gain
  }
  
  /**
   * Increase friendship
   */
  increaseFriendship(amount) {
    this.friendship = Math.min(100, this.friendship + amount);
    return this.friendship;
  }
  
  /**
   * Check if character can continue career
   */
  canContinue() {
    return this.career.turn <= this.career.maxTurns && this.condition.health > 0;
  }
  
  /**
   * Advance to next turn
   */
  nextTurn() {
    if (this.canContinue()) {
      this.career.turn++;
      return true;
    }
    return false;
  }

  /**
   * Record race completion
   */
  completeRace(position, fieldSize) {
    this.career.racesRun++;
    if (position === 1) {
      this.career.racesWon++;
    }
    
    // Apply race effects from parent class
    this.applyRaceEffects(position, fieldSize);
  }
  
  /**
   * Get character summary for display
   * Enhanced version with player-specific data
   */
  getSummary() {
    const baseSummary = super.getSummary();
    return {
      ...baseSummary,
      friendship: this.friendship,
      career: { ...this.career },
      legacyBonuses: { ...this.legacyBonuses },
      canContinue: this.canContinue(),
      friendshipBonus: this.getFriendshipBonus()
    };
  }
  
  /**
   * Serialize for save system
   * Enhanced version with player-specific data
   */
  toJSON() {
    const baseData = super.toJSON();
    return {
      ...baseData,
      type: 'character', // Override to specify this is a player character
      friendship: this.friendship,
      career: { ...this.career },
      legacyBonuses: { ...this.legacyBonuses }
    };
  }
  
  /**
   * Deserialize from save data
   */
  static fromJSON(data) {
    return new Character(data.name, {
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
      created: data.created,
      friendship: data.friendship,
      career: data.career,
      legacyBonuses: data.legacyBonuses
    });
  }

  /**
   * Validate character data
   * Enhanced version with player-specific validation
   */
  validate() {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];
    
    // Player-specific validation
    if (this.friendship < 0 || this.friendship > 100) {
      errors.push('Invalid friendship: must be 0-100');
    }
    
    if (this.career.turn < 1 || this.career.turn > this.career.maxTurns) {
      errors.push('Invalid career turn');
    }
    
    if (this.career.racesWon > this.career.racesRun) {
      errors.push('Cannot have more races won than races run');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = Character;