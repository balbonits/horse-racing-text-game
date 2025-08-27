/**
 * Race Types and Track Surface Configurations
 * Horse racing mechanics and race type configurations
 */

const RACE_TYPES = {
  SPRINT: {
    name: 'Sprint',
    distance: 1200,
    duration: { min: 70, max: 75 }, // seconds
    statWeights: { speed: 0.50, stamina: 0.15, power: 0.35 },
    strategyModifiers: {
      FRONT: 1.15,  // 15% bonus - front runners excel in sprints
      MID: 1.0,     // neutral
      LATE: 0.90    // 10% penalty - not enough time to close
    },
    description: 'Short explosive race favoring speed and power'
  },
  
  MILE: {
    name: 'Mile',
    distance: 1600,
    duration: { min: 95, max: 105 },
    statWeights: { speed: 0.35, stamina: 0.35, power: 0.30 },
    strategyModifiers: {
      FRONT: 1.05,   // slight bonus
      MID: 1.0,      // neutral - most balanced race type
      LATE: 1.05     // slight bonus
    },
    description: 'Classic balanced race requiring all-around ability'
  },
  
  MEDIUM: {
    name: 'Medium',
    distance: 2000,
    duration: { min: 120, max: 135 },
    statWeights: { speed: 0.25, stamina: 0.45, power: 0.30 },
    strategyModifiers: {
      FRONT: 0.95,   // slight penalty - harder to wire-to-wire
      MID: 1.05,     // slight bonus - tactical positioning
      LATE: 1.10     // 10% bonus - stamina pays off
    },
    description: 'Endurance test with tactical positioning important'
  },
  
  LONG: {
    name: 'Long Distance',
    distance: 2400,
    duration: { min: 145, max: 165 },
    statWeights: { speed: 0.15, stamina: 0.60, power: 0.25 },
    strategyModifiers: {
      FRONT: 0.85,   // major penalty - very hard to lead entire way
      MID: 1.0,      // neutral
      LATE: 1.20     // major bonus - patience rewarded
    },
    description: 'Ultimate stamina test favoring patient tactics'
  }
};

const TRACK_SURFACES = {
  DIRT: {
    name: 'Dirt',
    modifiers: {
      speed: 0.95,    // -5% - less pure speed
      stamina: 1.0,   // neutral
      power: 1.15     // +15% - raw power more important
    },
    strategyModifiers: {
      FRONT: 1.10,    // +10% - early speed advantage
      MID: 1.0,       // neutral
      LATE: 0.95      // -5% - harder to make up ground
    },
    description: 'Power-focused surface favoring early speed',
    characteristics: ['Raw power important', 'Early speed advantage', 'Harder to close ground']
  },
  
  TURF: {
    name: 'Turf',
    modifiers: {
      speed: 1.10,    // +10% - allows for more pure speed
      stamina: 1.05,  // +5% - easier on horses
      power: 1.0      // neutral
    },
    strategyModifiers: {
      FRONT: 1.0,     // neutral
      MID: 1.05,      // +5% - better for tactical racing
      LATE: 1.10      // +10% - smoother for closing runs
    },
    description: 'Finesse surface favoring speed and tactics',
    characteristics: ['Pure speed rewarded', 'Tactical racing', 'Smoother for closers']
  }
};

const WEATHER_CONDITIONS = {
  CLEAR: {
    name: 'Clear',
    modifiers: {
      speed: 1.0,
      stamina: 1.0,
      power: 1.0
    },
    description: 'Perfect racing conditions'
  },
  
  RAIN: {
    name: 'Rain',
    modifiers: {
      speed: 0.95,    // -5% - slower track
      stamina: 1.05,  // +5% - longer race effect
      power: 1.10     // +10% - need more power on wet track
    },
    description: 'Wet conditions favor power over pure speed'
  },
  
  FAST: {
    name: 'Fast Track',
    modifiers: {
      speed: 1.10,    // +10% - very fast surface
      stamina: 0.95,  // -5% - higher pace drains stamina
      power: 1.0      // neutral
    },
    description: 'Lightning fast conditions favor speed'
  }
};

// Career race schedules
const CLASSIC_CAREER_RACES = [
  {
    turn: 4,
    name: 'Maiden Sprint',
    type: 'SPRINT',
    surface: 'DIRT',
    weather: 'CLEAR',
    description: 'Your debut race - a dirt sprint testing raw speed and power'
  },
  {
    turn: 7,
    name: 'Mile Championship',
    type: 'MILE',
    surface: 'DIRT',
    weather: 'CLEAR',
    description: 'Mid-career balanced test on dirt requiring all-around ability'
  },
  {
    turn: 10,
    name: 'Dirt Stakes',
    type: 'MEDIUM',
    surface: 'DIRT',
    weather: 'CLEAR',
    description: 'Endurance test on dirt - stamina and tactical racing'
  },
  {
    turn: 12,
    name: 'Turf Cup Final',
    type: 'LONG',
    surface: 'TURF',
    weather: 'CLEAR',
    description: 'The ultimate test - long distance championship on turf'
  }
];

const ADVANCED_CAREER_RACES = [
  {
    turn: 2,
    name: 'Baby Sprint',
    type: 'SPRINT',
    surface: 'TURF',
    weather: 'CLEAR',
    prize: 500,
    description: 'Early debut sprint on turf'
  },
  {
    turn: 4,
    name: 'Dirt Dash Derby',
    type: 'SPRINT', 
    surface: 'DIRT',
    weather: 'CLEAR',
    prize: 1500,
    description: 'Power-focused dirt sprint'
  },
  {
    turn: 6,
    name: 'Turf Trial',
    type: 'MILE',
    surface: 'TURF',
    weather: 'CLEAR', 
    prize: 2000,
    description: 'Preparation mile on grass'
  },
  {
    turn: 8,
    name: 'Mile Championship',
    type: 'MILE',
    surface: 'DIRT',
    weather: 'RAIN',
    prize: 4000,
    description: 'Challenging mile in wet conditions'
  },
  {
    turn: 10,
    name: 'Distance Test',
    type: 'MEDIUM',
    surface: 'TURF',
    weather: 'CLEAR',
    prize: 6000,
    description: 'Stamina test over medium distance'
  },
  {
    turn: 12,
    name: 'Grand Final',
    type: 'LONG',
    surface: 'TURF',
    weather: 'FAST',
    prize: 15000,
    description: 'Ultimate challenge - long distance in fast conditions'
  }
];

/**
 * Calculate race performance with new system
 */
function calculateRacePerformance(horse, raceType, surface, strategy, weather = 'CLEAR') {
  const raceConfig = RACE_TYPES[raceType];
  const surfaceConfig = TRACK_SURFACES[surface];
  const weatherConfig = WEATHER_CONDITIONS[weather];
  
  if (!raceConfig || !surfaceConfig || !weatherConfig) {
    throw new Error('Invalid race configuration');
  }
  
  // 1. Apply surface modifiers to base stats
  const modifiedStats = {
    speed: horse.stats.speed * surfaceConfig.modifiers.speed * weatherConfig.modifiers.speed,
    stamina: horse.stats.stamina * surfaceConfig.modifiers.stamina * weatherConfig.modifiers.stamina,
    power: horse.stats.power * surfaceConfig.modifiers.power * weatherConfig.modifiers.power
  };
  
  // 2. Calculate base performance using race type stat weights
  const basePerformance = 
    (modifiedStats.speed * raceConfig.statWeights.speed) +
    (modifiedStats.stamina * raceConfig.statWeights.stamina) +
    (modifiedStats.power * raceConfig.statWeights.power);
  
  // 3. Apply strategy modifiers (race type + surface)
  const strategyMultiplier = 
    (raceConfig.strategyModifiers[strategy] || 1.0) *
    (surfaceConfig.strategyModifiers[strategy] || 1.0);
  
  // 4. Apply energy/condition factors
  const energyFactor = Math.max(0.3, horse.condition.energy / 100);
  const formFactor = getFormMultiplier(horse.condition.form || horse.condition.mood);
  
  // 5. Random variance (±12%)
  const variance = 0.88 + (Math.random() * 0.24);
  
  // 6. Final performance calculation
  return basePerformance * strategyMultiplier * energyFactor * formFactor * variance;
}

/**
 * Get form performance multiplier
 */
function getFormMultiplier(form) {
  // Support both old mood and new form systems for backward compatibility
  const formMap = {
    // New form system
    'Peak Form': 1.15,
    'Good Form': 1.10,
    'Steady': 1.05,
    'Average': 1.0,
    'Off Form': 0.90,
    'Poor Form': 0.80,
    // Legacy mood system support
    'Excellent': 1.15,
    'Great': 1.10, 
    'Good': 1.05,
    'Normal': 1.0,
    'Tired': 0.90,
    'Bad': 0.80
  };
  return formMap[form] || 1.0;
}

/**
 * Get race time estimation
 */
function estimateRaceTime(performance, raceType) {
  const raceConfig = RACE_TYPES[raceType];
  const { min, max } = raceConfig.duration;
  
  // Higher performance = faster time (closer to minimum)
  const performanceRatio = Math.max(0.5, Math.min(1.5, performance / 100));
  const timeRange = max - min;
  const timeOffset = timeRange * (1.5 - performanceRatio); // Inverse relationship
  
  const finalTime = min + timeOffset + (Math.random() * 2 - 1); // ±1 second variance
  
  return Math.max(min * 0.9, finalTime); // Never go too fast
}

/**
 * Format race time for display
 */
function formatRaceTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins}:${secs.padStart(5, '0')}`;
}

/**
 * Get training recommendations for upcoming race
 */
function getTrainingRecommendations(raceType, surface, turnsRemaining) {
  const raceConfig = RACE_TYPES[raceType];
  const surfaceConfig = TRACK_SURFACES[surface];
  
  const recommendations = [];
  
  // Base recommendations from race type
  const weights = raceConfig.statWeights;
  if (weights.speed >= 0.4) {
    recommendations.push('Focus on Speed training - this race heavily favors speed');
  }
  if (weights.stamina >= 0.4) {
    recommendations.push('Prioritize Stamina training - endurance is key');
  }
  if (weights.power >= 0.3) {
    recommendations.push('Include Power training - acceleration matters');
  }
  
  // Surface-specific advice
  if (surface === 'DIRT') {
    recommendations.push('Dirt surface: Emphasize Power training for better grip and drive');
  } else if (surface === 'TURF') {
    recommendations.push('Turf surface: Balance Speed and Stamina for tactical racing');
  }
  
  // Urgency based on turns remaining
  if (turnsRemaining <= 1) {
    recommendations.push('⚠️ FINAL PREPARATION: Consider Rest Day to ensure peak energy');
  } else if (turnsRemaining <= 2) {
    recommendations.push('🎯 RACE PREP: Focus on your horse\'s strongest stats now');
  }
  
  return recommendations;
}

module.exports = {
  RACE_TYPES,
  TRACK_SURFACES,
  WEATHER_CONDITIONS,
  CLASSIC_CAREER_RACES,
  ADVANCED_CAREER_RACES,
  calculateRacePerformance,
  estimateRaceTime,
  formatRaceTime,
  getTrainingRecommendations,
  getFormMultiplier
};