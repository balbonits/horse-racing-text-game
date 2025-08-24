class Character {
  constructor(name, options = {}) {
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
      mood: options.mood || 'Normal', // Great, Good, Normal, Bad
      health: options.health || 100
    };
    
    // Growth potential (affects training gains)
    this.growthRates = {
      speed: options.speedGrowth || 'B',   // S, A, B, C, D
      stamina: options.staminaGrowth || 'B',
      power: options.powerGrowth || 'B'
    };
    
    // Friendship system
    this.friendship = options.friendship || 0; // 0-100
    
    // Career tracking
    this.career = {
      turn: 1,
      maxTurns: 12,
      racesWon: 0,
      racesRun: 0,
      totalTraining: 0
    };
    
    // Legacy bonuses from previous runs
    this.legacyBonuses = options.legacyBonuses || {
      speedBonus: 0,
      staminaBonus: 0, 
      powerBonus: 0,
      energyBonus: 0
    };
  }
  
  generateId() {
    return 'horse_' + Math.random().toString(36).substr(2, 9);
  }

  // Getters for test compatibility 
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
  
  // Get current stat values including bonuses
  getCurrentStats() {
    return {
      speed: Math.min(100, this.stats.speed + this.legacyBonuses.speedBonus),
      stamina: Math.min(100, this.stats.stamina + this.legacyBonuses.staminaBonus),
      power: Math.min(100, this.stats.power + this.legacyBonuses.powerBonus)
    };
  }
  
  // Get growth rate multiplier
  getGrowthMultiplier(stat) {
    const growthMap = {
      'S': 1.5,
      'A': 1.2,
      'B': 1.0,
      'C': 0.8,
      'D': 0.6
    };
    return growthMap[this.growthRates[stat]] || 1.0;
  }
  
  // Get mood multiplier for training
  getMoodMultiplier() {
    const moodMap = {
      'great': 1.2,
      'good': 1.0,
      'normal': 0.9,
      'bad': 0.7
    };
    return moodMap[this.condition.mood] || 1.0;
  }
  
  // Get friendship bonus multiplier
  getFriendshipBonus() {
    if (this.friendship >= 80) return 1.5;
    if (this.friendship >= 60) return 1.2;
    if (this.friendship >= 40) return 1.1;
    return 1.0;
  }
  
  // Increase a stat with all modifiers applied
  increaseStat(statName, baseGain) {
    const growthMultiplier = this.getGrowthMultiplier(statName);
    const moodMultiplier = this.getMoodMultiplier();
    const friendshipBonus = this.getFriendshipBonus();
    
    const finalGain = Math.round(baseGain * growthMultiplier * moodMultiplier * friendshipBonus);
    const randomVariance = Math.random() * 0.4 + 0.8; // ±20% variance
    const actualGain = Math.round(finalGain * randomVariance);
    
    this.stats[statName] = Math.min(100, this.stats[statName] + actualGain);
    this.career.totalTraining++;
    
    return actualGain;
  }
  
  // Modify energy
  changeEnergy(amount) {
    this.condition.energy = Math.max(0, Math.min(100, this.condition.energy + amount));
    
    // Update mood based on energy level
    if (this.condition.energy >= 80) {
      this.condition.mood = 'great';
    } else if (this.condition.energy >= 60) {
      this.condition.mood = 'good';  
    } else if (this.condition.energy >= 30) {
      this.condition.mood = 'normal';
    } else {
      this.condition.mood = 'bad';
    }
  }
  
  // Increase friendship
  increaseFriendship(amount) {
    this.friendship = Math.min(100, this.friendship + amount);
  }
  
  // Check if character can continue career
  canContinue() {
    return this.career.turn <= this.career.maxTurns && this.condition.health > 0;
  }
  
  // Advance to next turn
  nextTurn() {
    if (this.canContinue()) {
      this.career.turn++;
      return true;
    }
    return false;
  }
  
  // Get character summary for display
  getSummary() {
    const currentStats = this.getCurrentStats();
    return {
      name: this.name,
      stats: currentStats,
      condition: { ...this.condition },
      career: { ...this.career },
      friendship: this.friendship,
      canContinue: this.canContinue()
    };
  }
  
  // Serialize for save system
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      stats: { ...this.stats },
      condition: { ...this.condition },
      growthRates: { ...this.growthRates },
      friendship: this.friendship,
      career: { ...this.career },
      legacyBonuses: { ...this.legacyBonuses }
    };
  }
  
  // Deserialize from save data
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
      friendship: data.friendship,
      legacyBonuses: data.legacyBonuses
    });
  }
}

module.exports = Character;