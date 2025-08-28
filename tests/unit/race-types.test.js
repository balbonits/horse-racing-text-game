/**
 * Unit Tests for Race Types System - TDD Approach
 * Write tests first, then implement to pass them
 */

const {
  RACE_TYPES,
  TRACK_SURFACES,
  WEATHER_CONDITIONS,
  calculateRacePerformance,
  estimateRaceTime,
  formatRaceTime,
  getTrainingRecommendations,
  getFormMultiplier
} = require('../../src/data/raceTypes');

describe('Race Types Configuration', () => {
  test('should have all required race types', () => {
    expect(RACE_TYPES).toHaveProperty('SPRINT');
    expect(RACE_TYPES).toHaveProperty('MILE');
    expect(RACE_TYPES).toHaveProperty('MEDIUM');
    expect(RACE_TYPES).toHaveProperty('LONG');
    
    // Each race type should have required properties
    Object.values(RACE_TYPES).forEach(raceType => {
      expect(raceType).toHaveProperty('name');
      expect(raceType).toHaveProperty('distance');
      expect(raceType).toHaveProperty('duration');
      expect(raceType).toHaveProperty('statWeights');
      expect(raceType).toHaveProperty('strategyModifiers');
      
      // Stat weights should sum to 1
      const { speed, stamina, power } = raceType.statWeights;
      expect(speed + stamina + power).toBeCloseTo(1.0, 2);
      
      // Strategy modifiers should exist for all strategies
      expect(raceType.strategyModifiers).toHaveProperty('FRONT');
      expect(raceType.strategyModifiers).toHaveProperty('MID');
      expect(raceType.strategyModifiers).toHaveProperty('LATE');
    });
  });

  test('should have appropriate stat weights for each race type', () => {
    // Sprint should favor speed and power
    expect(RACE_TYPES.SPRINT.statWeights.speed).toBeGreaterThan(0.4);
    expect(RACE_TYPES.SPRINT.statWeights.power).toBeGreaterThan(0.3);
    
    // Long races should favor stamina
    expect(RACE_TYPES.LONG.statWeights.stamina).toBeGreaterThan(0.5);
    
    // Mile should be balanced
    const mile = RACE_TYPES.MILE.statWeights;
    expect(Math.abs(mile.speed - mile.stamina)).toBeLessThan(0.1);
  });

  test('should have logical strategy bonuses', () => {
    // Front runners should excel in sprints
    expect(RACE_TYPES.SPRINT.strategyModifiers.FRONT).toBeGreaterThan(1.0);
    expect(RACE_TYPES.SPRINT.strategyModifiers.LATE).toBeLessThan(1.0);
    
    // Closers should excel in long races
    expect(RACE_TYPES.LONG.strategyModifiers.LATE).toBeGreaterThan(1.0);
    expect(RACE_TYPES.LONG.strategyModifiers.FRONT).toBeLessThan(1.0);
  });
});

describe('Track Surfaces Configuration', () => {
  test('should have required track surfaces', () => {
    expect(TRACK_SURFACES).toHaveProperty('DIRT');
    expect(TRACK_SURFACES).toHaveProperty('TURF');
    
    Object.values(TRACK_SURFACES).forEach(surface => {
      expect(surface).toHaveProperty('name');
      expect(surface).toHaveProperty('modifiers');
      expect(surface).toHaveProperty('strategyModifiers');
      expect(surface).toHaveProperty('description');
      
      // Should have stat modifiers
      expect(surface.modifiers).toHaveProperty('speed');
      expect(surface.modifiers).toHaveProperty('stamina');
      expect(surface.modifiers).toHaveProperty('power');
    });
  });

  test('should have distinct surface characteristics', () => {
    // Dirt should favor power
    expect(TRACK_SURFACES.DIRT.modifiers.power).toBeGreaterThan(1.0);
    
    // Turf should favor speed and tactical racing
    expect(TRACK_SURFACES.TURF.modifiers.speed).toBeGreaterThan(1.0);
    expect(TRACK_SURFACES.TURF.strategyModifiers.LATE).toBeGreaterThan(1.0);
  });
});

describe('Performance Calculation', () => {
  const testHorse = {
    stats: { speed: 60, stamina: 60, power: 60 },
    condition: { energy: 100, mood: 'Normal' }
  };

  test('should calculate base performance correctly', () => {
    const performance = calculateRacePerformance(testHorse, 'MILE', 'TURF', 'MID', 'CLEAR');
    
    expect(performance).toBeGreaterThan(0);
    expect(performance).toBeLessThan(200); // Reasonable upper bound
    expect(typeof performance).toBe('number');
  });

  test('should apply race type stat weights', () => {
    const speedHorse = {
      stats: { speed: 90, stamina: 30, power: 30 },
      condition: { energy: 100, mood: 'Normal' }
    };
    
    const staminaHorse = {
      stats: { speed: 30, stamina: 90, power: 30 },
      condition: { energy: 100, mood: 'Normal' }
    };
    
    // Speed horse should do better in sprints
    const speedSprint = calculateRacePerformance(speedHorse, 'SPRINT', 'TURF', 'FRONT');
    const speedLong = calculateRacePerformance(speedHorse, 'LONG', 'TURF', 'FRONT');
    expect(speedSprint).toBeGreaterThan(speedLong * 0.8); // Allow for variance
    
    // Stamina horse should do better in long races
    const staminaSprint = calculateRacePerformance(staminaHorse, 'SPRINT', 'TURF', 'LATE');
    const staminaLong = calculateRacePerformance(staminaHorse, 'LONG', 'TURF', 'LATE');
    expect(staminaLong).toBeGreaterThan(staminaSprint * 0.8);
  });

  test('should apply surface modifiers', () => {
    const powerHorse = {
      stats: { speed: 30, stamina: 30, power: 90 },
      condition: { energy: 100, mood: 'Normal' }
    };
    
    // Power horse should do better on dirt
    const dirtPerf = calculateRacePerformance(powerHorse, 'MILE', 'DIRT', 'FRONT');
    const turfPerf = calculateRacePerformance(powerHorse, 'MILE', 'TURF', 'FRONT');
    
    // Allow for random variance
    const avgDirt = Array.from({length: 10}, () => 
      calculateRacePerformance(powerHorse, 'MILE', 'DIRT', 'FRONT')
    ).reduce((a, b) => a + b) / 10;
    
    const avgTurf = Array.from({length: 10}, () => 
      calculateRacePerformance(powerHorse, 'MILE', 'TURF', 'FRONT')
    ).reduce((a, b) => a + b) / 10;
    
    expect(avgDirt).toBeGreaterThan(avgTurf * 0.95);
  });

  test('should apply strategy modifiers correctly', () => {
    // Test multiple times to account for randomness
    const frontSprintPerfs = Array.from({length: 20}, () =>
      calculateRacePerformance(testHorse, 'SPRINT', 'DIRT', 'FRONT')
    );
    const laterSprintPerfs = Array.from({length: 20}, () =>
      calculateRacePerformance(testHorse, 'SPRINT', 'DIRT', 'LATE')
    );
    
    const avgFront = frontSprintPerfs.reduce((a, b) => a + b) / frontSprintPerfs.length;
    const avgLate = laterSprintPerfs.reduce((a, b) => a + b) / laterSprintPerfs.length;
    
    // Front runner should be better in sprint on dirt
    expect(avgFront).toBeGreaterThan(avgLate * 0.95);
  });

  test('should apply energy factor', () => {
    const tiredHorse = {
      stats: { speed: 60, stamina: 60, power: 60 },
      condition: { energy: 30, mood: 'Normal' }
    };
    
    const freshPerf = calculateRacePerformance(testHorse, 'MILE', 'TURF', 'MID');
    const tiredPerf = calculateRacePerformance(tiredHorse, 'MILE', 'TURF', 'MID');
    
    // Fresh horse should perform better
    expect(freshPerf).toBeGreaterThan(tiredPerf * 1.1);
  });

  test('should apply mood factor', () => {
    const excellentHorse = {
      stats: { speed: 60, stamina: 60, power: 60 },
      condition: { energy: 100, mood: 'Excellent' }
    };
    
    const badHorse = {
      stats: { speed: 60, stamina: 60, power: 60 },
      condition: { energy: 100, mood: 'Bad' }
    };
    
    const excellentPerf = calculateRacePerformance(excellentHorse, 'MILE', 'TURF', 'MID');
    const badPerf = calculateRacePerformance(badHorse, 'MILE', 'TURF', 'MID');
    
    expect(excellentPerf).toBeGreaterThan(badPerf * 1.2);
  });

  test('should handle invalid inputs gracefully', () => {
    expect(() => {
      calculateRacePerformance(testHorse, 'INVALID_RACE', 'TURF', 'MID');
    }).toThrow();
    
    expect(() => {
      calculateRacePerformance(testHorse, 'MILE', 'INVALID_SURFACE', 'MID');
    }).toThrow();
    
    expect(() => {
      calculateRacePerformance(testHorse, 'MILE', 'TURF', 'MID', 'INVALID_WEATHER');
    }).toThrow();
  });
});

describe('Race Time Estimation', () => {
  test('should estimate realistic race times', () => {
    const sprintTime = estimateRaceTime(100, 'SPRINT');
    const mileTime = estimateRaceTime(100, 'MILE');
    const longTime = estimateRaceTime(100, 'LONG');
    
    // Longer races should take more time
    expect(sprintTime).toBeLessThan(mileTime);
    expect(mileTime).toBeLessThan(longTime);
    
    // Times should be within expected ranges
    expect(sprintTime).toBeGreaterThan(65);
    expect(sprintTime).toBeLessThan(85);
    
    expect(mileTime).toBeGreaterThan(90);
    expect(mileTime).toBeLessThan(120);
  });

  test('should scale time with performance', () => {
    const highPerfTime = estimateRaceTime(120, 'MILE');
    const lowPerfTime = estimateRaceTime(60, 'MILE');
    
    // Higher performance should mean faster time
    expect(highPerfTime).toBeLessThan(lowPerfTime);
  });

  test('should format times correctly', () => {
    expect(formatRaceTime(74.56)).toBe('1:14.56');
    expect(formatRaceTime(134.23)).toBe('2:14.23');
    expect(formatRaceTime(59.99)).toBe('0:59.99');
  });
});

describe('Training Recommendations', () => {
  test('should provide race-specific recommendations', () => {
    const sprintRecs = getTrainingRecommendations('SPRINT', 'DIRT', 2);
    const longRecs = getTrainingRecommendations('LONG', 'TURF', 2);
    
    expect(Array.isArray(sprintRecs)).toBe(true);
    expect(Array.isArray(longRecs)).toBe(true);
    expect(sprintRecs.length).toBeGreaterThan(0);
    expect(longRecs.length).toBeGreaterThan(0);
    
    // Sprint recommendations should mention speed/power
    const sprintText = sprintRecs.join(' ').toLowerCase();
    expect(sprintText.includes('speed') || sprintText.includes('power')).toBe(true);
    
    // Long race recommendations should mention stamina
    const longText = longRecs.join(' ').toLowerCase();
    expect(longText.includes('stamina')).toBe(true);
  });

  test('should provide surface-specific advice', () => {
    const dirtRecs = getTrainingRecommendations('MILE', 'DIRT', 3);
    const turfRecs = getTrainingRecommendations('MILE', 'TURF', 3);
    
    const dirtText = dirtRecs.join(' ').toLowerCase();
    const turfText = turfRecs.join(' ').toLowerCase();
    
    expect(dirtText.includes('dirt') || dirtText.includes('power')).toBe(true);
    expect(turfText.includes('turf') || turfText.includes('speed')).toBe(true);
  });

  test('should provide urgency-based recommendations', () => {
    const urgentRecs = getTrainingRecommendations('MILE', 'TURF', 1);
    const plannedRecs = getTrainingRecommendations('MILE', 'TURF', 5);
    
    expect(urgentRecs.length).toBeGreaterThan(0);
    expect(plannedRecs.length).toBeGreaterThan(0);
    
    // Urgent recommendations should mention preparation
    const urgentText = urgentRecs.join(' ').toLowerCase();
    expect(urgentText.includes('final') || urgentText.includes('prep') || urgentText.includes('energy')).toBe(true);
  });
});

describe('Form Multiplier', () => {
  test('should return correct multipliers for all forms', () => {
    expect(getFormMultiplier('Excellent')).toBe(1.15);
    expect(getFormMultiplier('Great')).toBe(1.10);
    expect(getFormMultiplier('Good')).toBe(1.05);
    expect(getFormMultiplier('Normal')).toBe(1.0);
    expect(getFormMultiplier('Tired')).toBe(0.90);
    expect(getFormMultiplier('Bad')).toBe(0.80);
  });

  test('should handle unknown forms', () => {
    expect(getFormMultiplier('Unknown')).toBe(1.0);
    expect(getFormMultiplier('')).toBe(1.0);
    expect(getFormMultiplier(null)).toBe(1.0);
  });
});

describe('Weather Effects', () => {
  test('should have weather conditions with proper modifiers', () => {
    expect(WEATHER_CONDITIONS).toHaveProperty('CLEAR');
    expect(WEATHER_CONDITIONS).toHaveProperty('RAIN');
    expect(WEATHER_CONDITIONS).toHaveProperty('FAST');
    
    Object.values(WEATHER_CONDITIONS).forEach(weather => {
      expect(weather).toHaveProperty('name');
      expect(weather).toHaveProperty('modifiers');
      expect(weather).toHaveProperty('description');
      
      expect(weather.modifiers).toHaveProperty('speed');
      expect(weather.modifiers).toHaveProperty('stamina');
      expect(weather.modifiers).toHaveProperty('power');
    });
  });

  test('should apply weather effects in performance calculation', () => {
    const testHorse = {
      stats: { speed: 60, stamina: 60, power: 60 },
      condition: { energy: 100, mood: 'Normal' }
    };
    
    const clearPerf = calculateRacePerformance(testHorse, 'MILE', 'TURF', 'MID', 'CLEAR');
    const rainPerf = calculateRacePerformance(testHorse, 'MILE', 'TURF', 'MID', 'RAIN');
    const fastPerf = calculateRacePerformance(testHorse, 'MILE', 'TURF', 'MID', 'FAST');
    
    // Different weather should produce different results
    expect(clearPerf).not.toBe(rainPerf);
    expect(clearPerf).not.toBe(fastPerf);
  });
});