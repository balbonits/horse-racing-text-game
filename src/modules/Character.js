/**
 * Character Module
 * Core character data structure and basic queries
 */

class Character {
  constructor(name, options = {}) {
    // Validate input
    if (!name || typeof name !== 'string') {
      throw new Error('Character name must be a non-empty string');
    }

    // Profile information
    this.profile = {
      name: name.trim(),
      createdAt: Date.now()
    };

    // Core stats - randomized if not provided in options
    if (options.stats) {
      // Use provided stats
      this.stats = {
        speed: options.stats.speed || 20,
        stamina: options.stats.stamina || 20, 
        power: options.stats.power || 20
      };
    } else {
      // Generate randomized starting stats (15-25 range for variety)
      this.stats = {
        speed: this._randomizeStat(20, 5),
        stamina: this._randomizeStat(20, 5), 
        power: this._randomizeStat(20, 5)
      };
    }

    // Current condition
    this.condition = {
      energy: 100,
      mood: 'Normal'
    };

    // Career progression
    this.career = {
      turn: 1,
      racesRun: 0,
      racesWon: 0
    };

    // Race history tracking
    this.raceHistory = [];
  }

  /**
   * Check if character has enough energy for training
   * @param {number} energyCost - Energy required for training
   * @returns {boolean} True if character can train
   */
  canTrain(energyCost) {
    if (typeof energyCost !== 'number' || energyCost < 0) {
      return false;
    }
    return this.condition.energy >= energyCost;
  }

  /**
   * Calculate total stat points
   * @returns {number} Sum of all stats
   */
  getStatTotal() {
    return this.stats.speed + this.stats.stamina + this.stats.power;
  }

  /**
   * Check if character is exhausted
   * @returns {boolean} True if energy is below 20
   */
  isExhausted() {
    return this.condition.energy < 20;
  }

  /**
   * Get character summary for display
   * @returns {object} Summary information
   */
  getSummary() {
    return {
      name: this.profile.name,
      turn: this.career.turn,
      totalStats: this.getStatTotal(),
      energy: this.condition.energy,
      mood: this.condition.mood,
      racesCompleted: this.career.racesRun,
      wins: this.career.racesWon
    };
  }

  /**
   * Clone character data (for testing/backup)
   * @returns {object} Deep copy of character data
   */
  toData() {
    return {
      profile: { ...this.profile },
      stats: { ...this.stats },
      condition: { ...this.condition },
      career: { ...this.career },
      raceHistory: [...this.raceHistory]
    };
  }

  /**
   * Helper method to randomize a stat around a base value
   * @param {number} base - Base stat value
   * @param {number} variance - Maximum variance (+/-)
   * @returns {number} Randomized stat value
   */
  _randomizeStat(base, variance) {
    const min = Math.max(1, base - variance);
    const max = base + variance;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Restore character from data (for save/load)
   * @param {object} data - Character data to restore
   */
  fromData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid character data');
    }

    this.profile = { ...data.profile };
    this.stats = { ...data.stats };
    this.condition = { ...data.condition };
    this.career = { ...data.career };
    this.raceHistory = [...(data.raceHistory || [])];
  }
}

module.exports = Character;