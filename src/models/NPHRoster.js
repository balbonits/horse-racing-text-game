/**
 * NPH (Non-Player Horse) Roster Management
 * Handles generation, progression, and persistence of rival horses
 */

class NPHRoster {
  constructor(careerId = null) {
    this.careerId = careerId || this.generateCareerId();
    this.nphs = [];
    this.playerHorseName = null;
    this.currentTurn = 1;
    this.raceHistory = [];
  }

  /**
   * Generate a new roster of NPH horses at career start
   */
  generateRoster(playerHorse, rosterSize = 24) {
    this.playerHorseName = playerHorse.name;
    this.nphs = [];

    // Calculate player strength as baseline
    const playerPower = this.calculateHorsePower(playerHorse);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`🏇 Generating ${rosterSize} rival horses for ${playerHorse.name}`);
    }

    for (let i = 0; i < rosterSize; i++) {
      const nph = this.generateNPH(i, playerPower);
      this.nphs.push(nph);
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ Generated roster with ${this.nphs.length} rival horses`);
    }
    return this.nphs;
  }

  /**
   * Generate a single NPH with balanced stats and personality
   */
  generateNPH(index, playerBaseline) {
    // Power distribution around player baseline
    const powerVariance = [-20, -15, -10, -5, 0, 0, 5, 10, 15, 20]; // Range of -20 to +20
    const powerModifier = powerVariance[index % powerVariance.length];
    const targetPower = Math.max(50, playerBaseline + powerModifier); // Minimum 50 power

    const stats = this.distributeStats(targetPower);
    const strategy = this.assignStrategy(stats);
    const trainingPattern = this.assignTrainingPattern(strategy);

    return {
      id: `nph_${String(index + 1).padStart(3, '0')}`,
      name: this.generateName(),
      stats: stats,
      strategy: strategy,           // Fixed for entire career
      trainingPattern: trainingPattern, // AI behavior pattern
      personality: this.generatePersonality(),
      history: {},                 // Turn-by-turn progression
      raceResults: [],            // Race performance history
      created: Date.now()
    };
  }

  /**
   * Distribute target power across three stats with variation
   */
  distributeStats(totalPower) {
    // Base distribution (roughly equal)
    const base = Math.floor(totalPower / 3);
    
    // Add variation (-5 to +10 from base)
    const speed = Math.max(15, base + this.randomRange(-5, 10));
    const stamina = Math.max(15, base + this.randomRange(-5, 10)); 
    const power = Math.max(15, base + this.randomRange(-5, 10));

    // Adjust to hit target power roughly
    const actualTotal = speed + stamina + power;
    const adjustment = Math.floor((totalPower - actualTotal) / 3);

    return {
      speed: Math.max(15, speed + adjustment),
      stamina: Math.max(15, stamina + adjustment),
      power: Math.max(15, power + adjustment)
    };
  }

  /**
   * Assign running strategy based on stat distribution
   */
  assignStrategy(stats) {
    const { speed, stamina, power } = stats;
    
    // Calculate tendencies
    const speedTendency = speed / (speed + stamina + power);
    const staminaTendency = stamina / (speed + stamina + power);
    const powerTendency = power / (speed + stamina + power);

    // Strategy preferences with some randomness
    if (speedTendency > 0.4 || powerTendency > 0.4) {
      return Math.random() > 0.3 ? 'FRONT' : 'MID'; // Speed/Power horses like front running
    } else if (staminaTendency > 0.4) {
      return Math.random() > 0.3 ? 'LATE' : 'MID';  // Stamina horses like closing
    } else {
      return 'MID'; // Balanced horses run in middle
    }
  }

  /**
   * Assign AI training pattern
   */
  assignTrainingPattern(strategy) {
    const patterns = {
      'FRONT': ['speed_focus', 'power_focus', 'balanced_aggressive'],
      'MID': ['balanced', 'adaptable', 'consistent'],
      'LATE': ['stamina_focus', 'endurance_build', 'late_surge']
    };

    const options = patterns[strategy];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate horse personality traits
   */
  generatePersonality() {
    const traits = [
      'aggressive', 'patient', 'consistent', 'unpredictable',
      'clutch', 'steady', 'explosive', 'methodical'
    ];
    
    return {
      primary: traits[Math.floor(Math.random() * traits.length)],
      intensity: this.randomRange(1, 10) // 1-10 scale
    };
  }

  /**
   * Simulate NPH training progression each turn
   */
  progressNPHs(currentTurn) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`🤖 Simulating NPH training for turn ${currentTurn}`);
    }
    
    this.currentTurn = currentTurn;
    
    this.nphs.forEach(nph => {
      const trainingResult = this.simulateNPHTraining(nph, currentTurn);
      
      // Store history
      nph.history[`turn${currentTurn}`] = {
        stats: { ...nph.stats },
        training: trainingResult.type,
        gain: trainingResult.gain,
        timestamp: Date.now()
      };

      if (process.env.NODE_ENV !== 'test') {
        console.log(`  ${nph.name}: ${trainingResult.type} (+${trainingResult.gain} ${trainingResult.stat})`);
      }
    });
  }

  /**
   * Simulate AI training decision and stat gain
   */
  simulateNPHTraining(nph, turn) {
    const pattern = nph.trainingPattern;
    const strategy = nph.strategy;
    const currentStats = nph.stats;
    
    // Determine training focus based on pattern and turn
    let trainingType = this.selectTraining(pattern, strategy, turn, currentStats);
    
    // Apply training result
    const result = this.applyTraining(nph, trainingType);
    
    return result;
  }

  /**
   * AI training selection logic
   */
  selectTraining(pattern, strategy, turn, stats) {
    // Race preparation logic
    if (turn === 3) { // Before first race (sprint)
      if (strategy === 'FRONT') return 'speed';
      if (strategy === 'LATE') return 'power';
      return 'speed'; // Default sprint prep
    }
    
    if (turn === 7) { // Before mile race
      return 'stamina'; // Everyone needs stamina for mile
    }
    
    if (turn === 11) { // Before championship
      if (strategy === 'LATE') return 'stamina';
      return 'stamina'; // Long race prep
    }

    // Pattern-based training
    switch (pattern) {
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
      default:
        return 'stamina'; // Safe default
    }
  }

  /**
   * Apply training and calculate stat gain
   */
  applyTraining(nph, trainingType) {
    const baseGains = {
      speed: { speed: 3, stamina: 1, power: 1 },
      stamina: { speed: 1, stamina: 3, power: 1 },
      power: { speed: 1, stamina: 1, power: 3 },
      rest: { speed: 0, stamina: 1, power: 0 } // Recovery training
    };

    const gains = baseGains[trainingType] || baseGains.stamina;
    
    // Add some variation (-1 to +2)
    const variation = this.randomRange(-1, 2);
    
    // Apply gains to NPH stats
    Object.keys(gains).forEach(stat => {
      if (gains[stat] > 0) {
        const actualGain = Math.max(1, gains[stat] + variation);
        nph.stats[stat] = Math.min(100, nph.stats[stat] + actualGain);
      }
    });

    // Return training result
    const primaryStat = Object.keys(gains).find(stat => gains[stat] === 3) || 'stamina';
    return {
      type: trainingType,
      stat: primaryStat,
      gain: gains[primaryStat] + variation
    };
  }

  /**
   * Get competitive field for a race
   */
  getRaceField(fieldSize = 7) {
    // Sort NPHs by current power level
    const sortedNPHs = [...this.nphs].sort((a, b) => {
      return this.calculateHorsePower(b) - this.calculateHorsePower(a);
    });

    // Select varied field (mix of strong and weak horses)
    const field = [];
    
    // Add 2-3 strong horses
    field.push(...sortedNPHs.slice(0, Math.min(3, sortedNPHs.length)));
    
    // Add random selection from remaining
    const remaining = sortedNPHs.slice(3);
    while (field.length < fieldSize && remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      field.push(remaining.splice(randomIndex, 1)[0]);
    }

    return field.slice(0, fieldSize);
  }

  /**
   * Record race results for NPHs
   */
  recordRaceResults(raceResults, raceInfo) {
    raceResults.forEach((result, index) => {
      if (result.type === 'nph') {
        const nph = this.nphs.find(n => n.id === result.horseId);
        if (nph) {
          nph.raceResults.push({
            turn: this.currentTurn,
            raceName: raceInfo.name,
            position: index + 1,
            time: result.time,
            performance: result.performance,
            strategy: result.strategy
          });
        }
      }
    });

    // Store race in roster history
    this.raceHistory.push({
      turn: this.currentTurn,
      race: raceInfo.name,
      results: raceResults,
      timestamp: Date.now()
    });
  }

  /**
   * Utility methods
   */
  calculateHorsePower(horse) {
    return horse.stats.speed + horse.stats.stamina + horse.stats.power;
  }

  randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateCareerId() {
    return `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateName() {
    const prefixes = [
      'Thunder', 'Lightning', 'Storm', 'Wind', 'Fire', 'Ice', 'Shadow', 'Light',
      'Golden', 'Silver', 'Crimson', 'Azure', 'Jade', 'Ruby', 'Diamond', 'Star',
      'Wild', 'Noble', 'Brave', 'Swift', 'Mighty', 'Royal', 'Dancing', 'Flying'
    ];
    
    const suffixes = [
      'Strike', 'Bolt', 'Dash', 'Arrow', 'Blade', 'Wing', 'Heart', 'Soul',
      'Runner', 'Racer', 'Champion', 'Legend', 'Spirit', 'Dream', 'Hope', 'Glory',
      'Knight', 'Prince', 'King', 'Queen', 'Star', 'Moon', 'Sun', 'Dawn'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix}`;
  }

  /**
   * Serialization for save/load
   */
  toJSON() {
    return {
      careerId: this.careerId,
      playerHorseName: this.playerHorseName,
      currentTurn: this.currentTurn,
      nphs: this.nphs,
      raceHistory: this.raceHistory,
      version: '1.0.0',
      timestamp: Date.now()
    };
  }

  static fromJSON(data) {
    const roster = new NPHRoster(data.careerId);
    roster.playerHorseName = data.playerHorseName;
    roster.currentTurn = data.currentTurn || 1;
    roster.nphs = data.nphs || [];
    roster.raceHistory = data.raceHistory || [];
    return roster;
  }
}

module.exports = NPHRoster;