/**
 * Game Constants Collection
 * 
 * Centralized collection of all game constants, values, and configuration.
 * This makes balance adjustments easier and keeps all numeric values in one place.
 * 
 * Organization:
 * - stats: Stat ranges, limits, and calculations
 * - training: Training costs, gains, and efficiency
 * - racing: Race parameters and formulas
 * - career: Career progression and milestones
 * - energy: Energy system constants
 * - ui: UI-related constants and formatting
 */

const GameConstants = {
  // ==================== VERSION INFO ====================
  version: {
    current: '1.0.0',
    buildDate: '2025-08-28',
    codename: 'Thunderbolt',
    apiVersion: '1.0'
  },

  // ==================== STAT SYSTEM ====================
  stats: {
    // Stat ranges
    min: 1,
    max: 100,
    
    // Starting stat ranges for new characters
    starting: {
      min: 15,
      max: 30,
      total: 60  // Combined starting stats total
    },
    
    // Stat growth limits per training session
    trainingGains: {
      min: 1,
      max: 5,
      average: 3,
      excellent: 4,
      poor: 1
    },
    
    // Stat weights for different race types
    raceWeights: {
      SPRINT: { speed: 0.5, stamina: 0.2, power: 0.3 },
      MILE: { speed: 0.4, stamina: 0.4, power: 0.2 },
      MEDIUM: { speed: 0.3, stamina: 0.5, power: 0.2 },
      LONG: { speed: 0.3, stamina: 0.5, power: 0.2 }
    },
    
    // Performance calculation constants
    performance: {
      baseMultiplier: 1.0,
      randomVariance: 0.3,  // ±30% random factor
      minVariance: 0.85,    // Minimum 85% of calculated performance
      maxVariance: 1.15     // Maximum 115% of calculated performance
    }
  },

  // ==================== TRAINING SYSTEM ====================
  training: {
    // Energy costs for each training type
    energyCosts: {
      speed: 15,
      stamina: 10,
      power: 15,
      rest: 0,      // Rest doesn't cost energy
      media: 0      // Media doesn't cost energy
    },
    
    // Energy gains for recovery training
    energyGains: {
      rest: 30,
      media: 15
    },
    
    // Base training efficiency (before breed/form modifiers)
    baseEfficiency: {
      speed: 1.0,
      stamina: 1.0,
      power: 1.0,
      rest: 1.0,
      media: 1.0
    },
    
    // Form-based training multipliers
    formMultipliers: {
      excellent: 1.3,
      good: 1.15,
      normal: 1.0,
      poor: 0.8,
      terrible: 0.6
    },
    
    // Bond-based training multipliers
    bondMultipliers: {
      80: 1.3,  // 80%+ bond gives 30% bonus
      60: 1.2,  // 60%+ bond gives 20% bonus  
      40: 1.1,  // 40%+ bond gives 10% bonus
      20: 1.0,  // 20%+ bond gives no bonus
      0: 0.9    // <20% bond gives 10% penalty
    },
    
    // Training success thresholds
    successThresholds: {
      excellent: 90,  // 90+ energy = excellent results
      good: 70,       // 70+ energy = good results
      average: 50,    // 50+ energy = average results
      poor: 30,       // 30+ energy = poor results
      failed: 0       // <30 energy = failed training
    }
  },

  // ==================== ENERGY SYSTEM ====================
  energy: {
    // Energy limits
    min: 0,
    max: 100,
    starting: 100,
    
    // Energy thresholds for warnings
    thresholds: {
      critical: 10,   // Show critical warning
      low: 25,        // Show low energy warning
      moderate: 50,   // Show moderate warning
      good: 75        // No warning needed
    },
    
    // Energy display colors/indicators
    indicators: {
      excellent: '🟢',  // 75-100 energy
      good: '🟡',       // 50-74 energy
      low: '🟠',        // 25-49 energy
      critical: '🔴'    // 0-24 energy
    }
  },

  // ==================== RACING SYSTEM ====================
  racing: {
    // Race distances (in meters)
    distances: {
      SPRINT: { min: 1000, max: 1400, typical: 1200 },
      MILE: { min: 1400, max: 1800, typical: 1600 },
      MEDIUM: { min: 1800, max: 2200, typical: 2000 },
      LONG: { min: 2200, max: 3000, typical: 2400 }
    },
    
    // Prize money by placement
    prizeMoney: {
      1: 0.6,   // Winner gets 60% of total prize
      2: 0.25,  // Second gets 25%
      3: 0.15,  // Third gets 15%
      4: 0.0,   // 4th and below get nothing
      5: 0.0
    },
    
    // Race prize pools by type
    prizePools: {
      maiden: 5000,      // First race
      allowance: 10000,  // Mid-tier races
      stakes: 20000,     // High-level races
      grade1: 50000      // Top-tier races
    },
    
    // Field size ranges
    fieldSizes: {
      small: { min: 6, max: 8 },
      medium: { min: 9, max: 12 },
      large: { min: 13, max: 16 }
    },
    
    // Racing strategy energy usage
    strategyEnergyUsage: {
      FRONT: { early: 0.5, middle: 0.3, late: 0.2 },
      MID: { early: 0.3, middle: 0.4, late: 0.3 },
      LATE: { early: 0.2, middle: 0.3, late: 0.5 }
    },
    
    // Track surfaces
    surfaces: ['DIRT', 'TURF'],
    
    // Weather conditions (future feature)
    weatherConditions: ['CLEAR', 'CLOUDY', 'RAINY', 'WINDY']
  },

  // ==================== CAREER SYSTEM ====================
  career: {
    // Career progression
    maxTurns: 24,        // Total turns per career
    raceTurns: [4, 9, 15, 24],  // When races occur
    totalRaces: 4,       // Total races per career
    
    // Grading system
    gradeThresholds: {
      S: 95,   // S grade: 95-100 points
      A: 85,   // A grade: 85-94 points
      B: 75,   // B grade: 75-84 points
      C: 65,   // C grade: 65-74 points
      D: 50,   // D grade: 50-64 points
      F: 0     // F grade: 0-49 points
    },
    
    // Grade point calculations
    gradeWeights: {
      racePerformance: 0.4,   // 40% of grade from race results
      placements: 0.2,        // 20% from race placements
      statDevelopment: 0.3,   // 30% from stat growth
      bond: 0.1              // 10% from final bond level
    },
    
    // Achievement thresholds
    achievements: {
      perfectRecord: 4,      // Win all 4 races
      champion: 3,           // Win 3+ races
      eliteAthlete: 250,     // Total stats >= 250
      bestFriends: 90,       // Bond >= 90%
      trainingFanatic: 20    // 20+ training sessions
    }
  },

  // ==================== BOND SYSTEM ====================
  bond: {
    // Bond ranges
    min: 0,
    max: 100,
    starting: 0,
    
    // Bond gain rates
    trainingGains: {
      media: 5,      // Media day gives 5 bond
      regular: 1     // Regular training gives 1 bond
    },
    
    // Bond thresholds for benefits
    thresholds: {
      bestFriends: 80,   // Maximum training bonus
      good: 60,          // Good training bonus
      friendly: 40,      // Minor training bonus
      neutral: 20,       // No bonus/penalty
      poor: 0            // Training penalty
    }
  },

  // ==================== FORM SYSTEM ====================
  form: {
    // Form levels (in order from worst to best)
    levels: ['terrible', 'poor', 'normal', 'good', 'excellent'],
    
    // Form change probabilities after training
    changeRates: {
      excellent: { improve: 0.0, maintain: 0.7, decline: 0.3 },
      good: { improve: 0.2, maintain: 0.6, decline: 0.2 },
      normal: { improve: 0.3, maintain: 0.4, decline: 0.3 },
      poor: { improve: 0.4, maintain: 0.3, decline: 0.3 },
      terrible: { improve: 0.5, maintain: 0.5, decline: 0.0 }
    },
    
    // Starting form distribution
    startingFormProbability: {
      excellent: 0.1,
      good: 0.25,
      normal: 0.3,
      poor: 0.25,
      terrible: 0.1
    }
  },

  // ==================== UI CONSTANTS ====================
  ui: {
    // Progress bar settings
    progressBar: {
      length: 20,
      filledChar: '█',
      emptyChar: '░',
      brackets: ['[', ']']
    },
    
    // Display formatting
    statPadding: 8,        // Padding for stat names
    namePadding: 20,       // Padding for horse names
    
    // Screen dimensions (for terminal layout)
    screenWidth: 80,
    headerPadding: '='.repeat(47),
    
    // Color indicators
    rarityColors: {
      COMMON: '⚪',
      UNCOMMON: '🟢', 
      RARE: '🔵',
      LEGENDARY: '🟡'
    },
    
    // Status indicators
    statusIcons: {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳',
      saving: '💾'
    }
  },

  // ==================== SPECIALIZATION CONSTANTS ====================
  specialization: {
    // Breed rarity weights for random selection
    breedRarityWeights: {
      COMMON: 50,      // 50% chance
      UNCOMMON: 30,    // 30% chance
      RARE: 15,        // 15% chance
      LEGENDARY: 5     // 5% chance
    },
    
    // Maximum experience levels
    maxExperience: {
      surface: 10,     // Max surface experience
      distance: 10,    // Max distance experience
      overall: 20      // Max overall experience
    },
    
    // Experience gain rates
    experienceGains: {
      race: 1,         // 1 point per race
      win: 2,          // Bonus point for winning
      podium: 1        // Bonus point for top 3
    }
  },

  // ==================== GAME FLOW CONSTANTS ====================
  gameFlow: {
    // Timing constants (for animations/delays)
    delays: {
      splashScreen: 2000,    // 2 seconds
      raceAnimation: 100,    // 100ms per frame
      messageDisplay: 1500,  // 1.5 seconds
      autoProgress: 3000     // 3 seconds for auto-progression
    },
    
    // Input timeouts
    inputTimeout: {
      default: 30000,        // 30 seconds default timeout
      race: 60000,           // 60 seconds during races
      creation: 120000       // 2 minutes during character creation
    }
  },

  // ==================== SAVE SYSTEM CONSTANTS ====================
  saveSystem: {
    // File limits
    maxSaveFiles: 10,      // Maximum save files
    saveFileExtension: '.json',
    
    // Save data version for compatibility
    saveVersion: '1.0',
    
    // Auto-save settings
    autoSave: {
      enabled: true,
      interval: 300000,     // 5 minutes
      maxAutoSaves: 3       // Keep last 3 auto-saves
    }
  },

  // ==================== VALIDATION CONSTANTS ====================
  validation: {
    // Character name validation
    name: {
      minLength: 1,
      maxLength: 20,
      allowedChars: /^[a-zA-Z0-9\s'-]+$/,
      reservedNames: ['test', 'debug', 'admin', 'system']
    },
    
    // Input validation
    input: {
      maxLength: 100,       // Maximum input length
      timeout: 30000        // Input timeout in milliseconds
    }
  },

  // ==================== DEVELOPMENT CONSTANTS ====================
  development: {
    // Debug flags
    debug: {
      enabled: false,
      logLevel: 'info',      // 'debug', 'info', 'warn', 'error'
      showStats: false,      // Show detailed stats in UI
      skipAnimations: false  // Skip race animations
    },
    
    // Testing constants
    testing: {
      fastMode: false,       // Speed up game for testing
      unlockAll: false,      // Unlock all breeds/features
      maxStats: false        // Start with max stats
    }
  }
};

module.exports = GameConstants;