/**
 * NPH (Non-Player Horse) Class
 * Extends the base Horse class with AI-specific functionality
 */

const Horse = require('./Horse');

class NPH extends Horse {
  constructor(name, options = {}) {
    // Call parent constructor
    super(name, options);
    
    // Override ID generation for NPH horses
    this.id = options.id || this.generateNPHId(options.index);
    
    // NPH-specific properties
    this.strategy = options.strategy || 'MID'; // Fixed strategy for entire career
    this.trainingPattern = options.trainingPattern || 'balanced'; // AI behavior pattern
    this.personality = options.personality || this.generateDefaultPersonality();
    
    // Progress tracking
    this.history = options.history || {}; // Turn-by-turn progression
    this.raceResults = options.raceResults || []; // Race performance history
    
    // AI characteristics
    this.preferredStat = this.determinePreferredStat();
    this.trainingPriorities = this.calculateTrainingPriorities();
  }
  
  /**
   * Generate NPH-specific ID
   */
  generateNPHId(index) {
    const idNum = typeof index === 'number' ? String(index + 1).padStart(3, '0') : Math.random().toString().substr(2, 3);
    return `nph_${idNum}`;
  }

  /**
   * Generate default personality if not provided
   */
  generateDefaultPersonality() {
    const traits = [
      'aggressive', 'patient', 'consistent', 'unpredictable',
      'clutch', 'steady', 'explosive', 'methodical'
    ];
    
    return {
      primary: traits[Math.floor(Math.random() * traits.length)],
      intensity: Math.floor(Math.random() * 10) + 1 // 1-10 scale
    };
  }

  /**
   * Determine preferred stat based on strategy and growth rates
   */
  determinePreferredStat() {
    const { speed, stamina, power } = this.growthRates;
    const rates = { speed, stamina, power };
    
    // Find stat with best growth rate
    const bestRate = Object.entries(rates).reduce((best, [stat, rate]) => {
      const rateValue = this.getGrowthMultiplier(rate);
      return rateValue > best.value ? { stat, value: rateValue } : best;
    }, { stat: 'speed', value: 0 });
    
    return bestRate.stat;
  }

  /**
   * Calculate training priorities based on strategy and growth
   */
  calculateTrainingPriorities() {
    const basePriorities = {
      'FRONT': { speed: 0.5, power: 0.3, stamina: 0.2 },
      'MID': { speed: 0.33, stamina: 0.34, power: 0.33 },
      'LATE': { stamina: 0.5, speed: 0.25, power: 0.25 }
    };
    
    return basePriorities[this.strategy] || basePriorities['MID'];
  }

  /**
   * Simulate training decision based on AI pattern
   */
  selectTraining(turn, racePreparation = null) {
    // Race preparation logic
    if (racePreparation) {
      const { raceType, turnsUntilRace } = racePreparation;
      
      if (turnsUntilRace <= 1) {
        // Final preparation - maintain energy
        return this.condition.energy < 70 ? 'rest' : this.preferredStat;
      }
      
      if (turnsUntilRace <= 2) {
        // Race-specific preparation
        switch (raceType) {
          case 'SPRINT':
            return this.strategy === 'FRONT' ? 'speed' : 'power';
          case 'LONG':
            return 'stamina';
          default:
            return this.preferredStat;
        }
      }
    }
    
    // Pattern-based training selection
    switch (this.trainingPattern) {
      case 'speed_focus':
        return Math.random() > 0.3 ? 'speed' : 'power';
      case 'stamina_focus':
        return Math.random() > 0.3 ? 'stamina' : (Math.random() > 0.5 ? 'rest' : 'stamina');
      case 'power_focus':
        return Math.random() > 0.3 ? 'power' : 'speed';
      case 'balanced':
        const options = ['speed', 'stamina', 'power'];
        return options[Math.floor(Math.random() * options.length)];
      case 'endurance_build':
        return Math.random() > 0.4 ? 'stamina' : 'rest';
      case 'late_surge':
        return turn < 8 ? 'stamina' : (Math.random() > 0.5 ? 'speed' : 'stamina');
      default:
        // Weighted random based on training priorities
        const rand = Math.random();
        const priorities = this.trainingPriorities;
        if (rand < priorities.speed) return 'speed';
        if (rand < priorities.speed + priorities.stamina) return 'stamina';
        return 'power';
    }
  }

  /**
   * Apply training with NPH-specific logic
   */
  applyTraining(trainingType, baseGain = 3) {
    const trainingTypes = {
      speed: { speed: baseGain, stamina: 1, power: 1 },
      stamina: { speed: 1, stamina: baseGain, power: 1 },
      power: { speed: 1, stamina: 1, power: baseGain },
      rest: { speed: 0, stamina: 1, power: 0 } // Recovery training
    };

    const gains = trainingTypes[trainingType] || trainingTypes.stamina;
    const results = { type: trainingType, gains: {} };
    
    // Add some variation (-1 to +2)
    const variation = Math.floor(Math.random() * 4) - 1;
    
    // Apply gains to NPH stats
    Object.keys(gains).forEach(stat => {
      if (gains[stat] > 0) {
        const actualGain = Math.max(1, gains[stat] + variation);
        const statGain = this.increaseStat(stat, actualGain);
        results.gains[stat] = statGain;
      }
    });

    // Apply energy cost/gain
    if (trainingType === 'rest') {
      this.changeEnergy(30);
      results.energyChange = 30;
    } else {
      const energyCost = trainingType === 'stamina' ? 10 : 15;
      this.changeEnergy(-energyCost);
      results.energyChange = -energyCost;
    }

    // Return training result
    const primaryStat = Object.keys(gains).find(stat => gains[stat] === baseGain) || 'stamina';
    return {
      type: trainingType,
      stat: primaryStat,
      gain: results.gains[primaryStat] || 0,
      allGains: results.gains,
      energyChange: results.energyChange
    };
  }

  /**
   * Record training in history
   */
  recordTraining(turn, trainingResult) {
    this.history[`turn${turn}`] = {
      stats: { ...this.stats },
      condition: { ...this.condition },
      training: trainingResult.type,
      gain: trainingResult.gain || 0,  // Single primary gain for test compatibility
      gains: trainingResult.allGains || {},
      energyChange: trainingResult.energyChange || 0,
      timestamp: Date.now()
    };
  }

  /**
   * Record race result
   */
  recordRaceResult(raceInfo, position, time, performance) {
    this.raceResults.push({
      turn: raceInfo.turn || 0,
      raceName: raceInfo.name,
      raceType: raceInfo.type,
      surface: raceInfo.surface,
      position: position,
      time: time,
      performance: performance,
      strategy: this.strategy,
      timestamp: Date.now()
    });
    
    // Apply race effects
    this.applyRaceEffects(position, 8); // Assuming 8-horse fields
  }

  /**
   * Get NPH racing readiness
   */
  getRacingReadiness() {
    const energy = this.condition.energy;
    const health = this.condition.health;
    const totalPower = this.getTotalPower();
    
    let readiness = 0.5; // Base 50%
    
    // Energy factor (0-30% bonus/penalty)
    readiness += (energy - 50) / 100 * 0.3;
    
    // Health factor (0-20% bonus/penalty)
    readiness += (health - 50) / 100 * 0.2;
    
    // Personality factor
    if (this.personality.primary === 'clutch') {
      readiness += 0.1; // Clutch horses perform better under pressure
    }
    
    return Math.max(0.2, Math.min(1.0, readiness));
  }

  /**
   * Get performance prediction for race type
   */
  predictPerformance(raceType, surface) {
    const readiness = this.getRacingReadiness();
    const basePower = this.getTotalPower();
    
    // Strategy matching bonus
    let strategyBonus = 1.0;
    if (raceType === 'SPRINT' && this.strategy === 'FRONT') strategyBonus = 1.1;
    if (raceType === 'LONG' && this.strategy === 'LATE') strategyBonus = 1.1;
    
    // Surface preference (based on stats)
    let surfaceBonus = 1.0;
    if (surface === 'DIRT' && this.stats.power > this.stats.speed) surfaceBonus = 1.05;
    if (surface === 'TURF' && this.stats.speed > this.stats.power) surfaceBonus = 1.05;
    
    return basePower * readiness * strategyBonus * surfaceBonus;
  }

  /**
   * Enhanced getSummary with NPH-specific data
   */
  getSummary() {
    const baseSummary = super.getSummary();
    return {
      ...baseSummary,
      type: 'nph',
      trainingPattern: this.trainingPattern,
      personality: { ...this.personality },
      preferredStat: this.preferredStat,
      trainingPriorities: { ...this.trainingPriorities },
      raceCount: this.raceResults.length,
      averagePosition: this.getAveragePosition(),
      racingReadiness: this.getRacingReadiness()
    };
  }

  /**
   * Calculate average race position
   */
  getAveragePosition() {
    if (this.raceResults.length === 0) return null;
    const totalPositions = this.raceResults.reduce((sum, race) => sum + race.position, 0);
    return Math.round((totalPositions / this.raceResults.length) * 10) / 10;
  }

  /**
   * Enhanced toJSON with NPH-specific data
   */
  toJSON() {
    const baseData = super.toJSON();
    return {
      ...baseData,
      type: 'nph',
      trainingPattern: this.trainingPattern,
      personality: { ...this.personality },
      history: { ...this.history },
      raceResults: [...this.raceResults],
      preferredStat: this.preferredStat,
      trainingPriorities: { ...this.trainingPriorities }
    };
  }

  /**
   * Create NPH from saved data
   */
  static fromJSON(data) {
    return new NPH(data.name, {
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
      trainingPattern: data.trainingPattern,
      personality: data.personality,
      history: data.history,
      raceResults: data.raceResults
    });
  }
}

module.exports = NPH;