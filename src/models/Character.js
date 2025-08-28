/**
 * Player Character Class
 * Extends the base Horse class with player-specific functionality
 */

const Horse = require('./Horse');

class Character extends Horse {
  constructor(name, options = {}) {
    // Handle null options gracefully
    options = options || {};
    
    // Handle stats object if provided (for compatibility with CharacterCreationEngine)
    if (options.stats && typeof options.stats === 'object') {
      options.speed = options.stats.speed;
      options.stamina = options.stats.stamina;
      options.power = options.stats.power;
    }
    
    // Call parent constructor
    super(name, options);
    
    // Override ID generation for player horses
    this.id = options.id || this.generatePlayerId();
    
    // Player-specific systems
    this.bond = options.bond || options.friendship || 0; // 0-100
    
    // Career tracking
    this.career = {
      turn: options.turn || 1,
      maxTurns: options.maxTurns || 24, // Updated to support longer careers with 3,4,5,8 pattern
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
    this.condition.energy = Math.round(Math.max(0, Math.min(100, value)));
  }

  get form() {
    return this.condition.form;
  }

  set form(value) {
    this.condition.form = value;
  }

  // Legacy getter for compatibility
  get mood() {
    return this.condition.form;
  }

  set mood(value) {
    this.condition.form = value;
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
   * Get bond bonus multiplier
   */
  getBondBonus() {
    if (this.bond >= 80) return 1.5;
    if (this.bond >= 60) return 1.2;
    if (this.bond >= 40) return 1.1;
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
    const formMultiplier = this.getFormMultiplier();
    const bondBonus = this.getBondBonus();
    
    // Calculate final gain
    const finalGain = Math.round(baseGain * growthMultiplier * formMultiplier * bondBonus);
    const randomVariance = Math.random() * 0.4 + 0.8; // ±20% variance
    const actualGain = Math.max(1, Math.round(finalGain * randomVariance));
    
    // Apply the gain (capped at 100)
    const oldValue = this.stats[statName];
    this.stats[statName] = Math.min(100, this.stats[statName] + actualGain);
    this.career.totalTraining++;
    
    return this.stats[statName] - oldValue; // Return actual gain
  }
  
  /**
   * Increase bond
   */
  increaseBond(amount) {
    this.bond = Math.min(100, this.bond + amount);
    return this.bond;
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
      bond: this.bond,
      career: { ...this.career },
      legacyBonuses: { ...this.legacyBonuses },
      canContinue: this.canContinue(),
      bondBonus: this.getBondBonus()
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
      bond: this.bond,
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
      form: data.condition.form || data.condition.mood, // Backward compatibility
      health: data.condition.health,
      speedGrowth: data.growthRates.speed,
      staminaGrowth: data.growthRates.stamina,
      powerGrowth: data.growthRates.power,
      strategy: data.strategy,
      created: data.created,
      bond: data.bond || data.friendship, // Backward compatibility
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
    if (this.bond < 0 || this.bond > 100) {
      errors.push('Invalid bond: must be 0-100');
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

  /**
   * Check if character can perform training (has enough energy)
   * Required by TrainingEngine module
   */
  canTrain(energyCost) {
    return this.condition.energy >= energyCost;
  }
}

module.exports = Character;