/**
 * NPH (Non-Player Horse) Roster Management
 * Handles generation, progression, and persistence of rival horses
 * Now uses the NPH class instead of plain objects
 */

const NPH = require('./NPH');
const NameGenerator = require('../utils/NameGenerator');

class NPHRoster {
  constructor(careerId = null) {
    this.careerId = careerId || this.generateCareerId();
    this.nphs = [];
    this.playerHorseName = null;
    this.currentTurn = 1;
    this.raceHistory = [];
    this.nameGenerator = new NameGenerator();
  }

  /**
   * Generate a new roster of NPH horses at career start
   */
  generateRoster(playerHorse, rosterSize = 24) {
    if (!playerHorse) {
      throw new Error('Player horse is null or undefined');
    }
    if (!playerHorse.name) {
      throw new Error(`Player horse exists but has no name. Horse: ${JSON.stringify(playerHorse)}`);
    }
    
    this.playerHorseName = playerHorse.name;
    this.nphs = [];

    // Calculate player strength as baseline
    const playerPower = this.calculateHorsePower(playerHorse);
    
    if (process.env.NODE_ENV !== 'test') {
      if (process.env.NODE_ENV === 'development' && process.env.DEBUG_NPH) {
        console.log(`🏇 Generating ${rosterSize} rival horses for ${playerHorse.name}`);
      }
    }

    for (let i = 0; i < rosterSize; i++) {
      const nph = this.generateNPH(i, playerPower);
      this.nphs.push(nph);
    }

    if (process.env.NODE_ENV !== 'test') {
      if (process.env.NODE_ENV === 'development' && process.env.DEBUG_NPH) {
        console.log(`✅ Generated roster with ${this.nphs.length} rival horses`);
      }
    }
    return this.nphs;
  }

  /**
   * Generate a single NPH using the NPH class
   */
  generateNPH(index, playerBaseline) {
    // Power distribution around player baseline
    const powerVariance = [-20, -15, -10, -5, 0, 0, 5, 10, 15, 20]; // Range of -20 to +20
    const powerModifier = powerVariance[index % powerVariance.length];
    const targetPower = Math.max(50, playerBaseline + powerModifier); // Minimum 50 power

    const stats = this.distributeStats(targetPower);
    const strategy = this.assignStrategy(stats);
    const trainingPattern = this.assignTrainingPattern(strategy);
    const growthRates = this.assignGrowthRates();

    // Create NPH instance with all the data
    const nph = new NPH(this.nameGenerator.generateName(), {
      index: index,
      speed: stats.speed,
      stamina: stats.stamina,
      power: stats.power,
      strategy: strategy,
      trainingPattern: trainingPattern,
      speedGrowth: growthRates.speed,
      staminaGrowth: growthRates.stamina,
      powerGrowth: growthRates.power,
      personality: this.generatePersonality()
    });

    return nph;
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

    const options = patterns[strategy] || patterns['MID'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Assign growth rates for NPH
   */
  assignGrowthRates() {
    const grades = ['S', 'A', 'B', 'B', 'C', 'C', 'D']; // Weighted toward average
    
    return {
      speed: grades[Math.floor(Math.random() * grades.length)],
      stamina: grades[Math.floor(Math.random() * grades.length)],
      power: grades[Math.floor(Math.random() * grades.length)]
    };
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
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_NPH) {
      console.log(`🤖 Simulating NPH training for turn ${currentTurn}`);
    }
    
    this.currentTurn = currentTurn;
    
    this.nphs.forEach(nph => {
      // Let the NPH decide its training
      const trainingType = nph.selectTraining(currentTurn, this.getUpcomingRace(currentTurn));
      
      // Apply the training
      const trainingResult = nph.applyTraining(trainingType);
      
      // Record the training in NPH history
      nph.recordTraining(currentTurn, trainingResult);

      if (process.env.NODE_ENV === 'development' && process.env.DEBUG_NPH) {
        console.log(`  ${nph.name}: ${trainingResult.type} (+${trainingResult.gain} ${trainingResult.stat})`);
      }
    });
  }

  /**
   * Get upcoming race information for training decisions
   */
  getUpcomingRace(currentTurn) {
    // This would ideally come from the game's race schedule
    // For now, use default race schedule knowledge
    const raceSchedule = [
      { turn: 4, type: 'SPRINT' },
      { turn: 8, type: 'MILE' },
      { turn: 12, type: 'MEDIUM' }
    ];
    
    const nextRace = raceSchedule.find(race => race.turn > currentTurn);
    if (nextRace) {
      return {
        raceType: nextRace.type,
        turnsUntilRace: nextRace.turn - currentTurn
      };
    }
    
    return null;
  }

  /**
   * Get competitive field for a race
   */
  getRaceField(fieldSize = 7) {
    // Sort NPHs by current power level and racing readiness
    const sortedNPHs = [...this.nphs].sort((a, b) => {
      const aPower = a.getTotalPower() * a.getRacingReadiness();
      const bPower = b.getTotalPower() * b.getRacingReadiness();
      return bPower - aPower;
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
      if (result.type === 'nph' && result.horseId) {
        const nph = this.nphs.find(n => n.id === result.horseId);
        if (nph) {
          nph.recordRaceResult(raceInfo, index + 1, result.time, result.performance);
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
   * Get roster statistics
   */
  getRosterStats() {
    if (this.nphs.length === 0) return null;
    
    const stats = this.nphs.reduce((acc, nph) => {
      const summary = nph.getSummary();
      acc.totalPower += summary.totalPower;
      acc.totalRaces += summary.raceCount;
      acc.strategies[summary.strategy] = (acc.strategies[summary.strategy] || 0) + 1;
      acc.patterns[summary.trainingPattern] = (acc.patterns[summary.trainingPattern] || 0) + 1;
      
      if (summary.averagePosition) {
        acc.totalPositions += summary.averagePosition;
        acc.horsesWithRaces++;
      }
      
      return acc;
    }, {
      totalPower: 0,
      totalRaces: 0,
      totalPositions: 0,
      horsesWithRaces: 0,
      strategies: {},
      patterns: {}
    });
    
    return {
      count: this.nphs.length,
      averagePower: Math.round(stats.totalPower / this.nphs.length),
      totalRaces: stats.totalRaces,
      averagePosition: stats.horsesWithRaces > 0 ? 
        Math.round((stats.totalPositions / stats.horsesWithRaces) * 10) / 10 : null,
      strategyDistribution: stats.strategies,
      patternDistribution: stats.patterns
    };
  }

  /**
   * Utility methods
   */
  calculateHorsePower(horse) {
    const stats = horse.getCurrentStats ? horse.getCurrentStats() : horse.stats;
    return stats.speed + stats.stamina + stats.power;
  }

  randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateCareerId() {
    return `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }


  /**
   * Serialization for save/load
   */
  toJSON() {
    return {
      careerId: this.careerId,
      playerHorseName: this.playerHorseName,
      currentTurn: this.currentTurn,
      nphs: this.nphs.map(nph => nph.toJSON()), // Use NPH's toJSON method
      raceHistory: this.raceHistory,
      version: '2.0.0',
      timestamp: Date.now()
    };
  }

  /**
   * Deserialize from save data
   */
  static fromJSON(data) {
    const roster = new NPHRoster(data.careerId);
    roster.playerHorseName = data.playerHorseName;
    roster.currentTurn = data.currentTurn || 1;
    roster.raceHistory = data.raceHistory || [];
    
    // Convert saved NPH data back to NPH instances
    roster.nphs = (data.nphs || []).map(nphData => {
      if (nphData.type === 'nph') {
        // New format with NPH class
        return NPH.fromJSON(nphData);
      } else {
        // Legacy format - convert plain object to NPH
        return new NPH(nphData.name, {
          id: nphData.id,
          speed: nphData.stats.speed,
          stamina: nphData.stats.stamina,
          power: nphData.stats.power,
          strategy: nphData.strategy,
          trainingPattern: nphData.trainingPattern,
          personality: nphData.personality,
          history: nphData.history || {},
          raceResults: nphData.raceResults || []
        });
      }
    });
    
    return roster;
  }
}

module.exports = NPHRoster;