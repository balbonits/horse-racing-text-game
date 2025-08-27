# Race Types and Track Surfaces

## Race Distance Categories

### Sprint (1200m)
- **Focus**: Explosive speed and power
- **Duration**: ~1:10-1:15
- **Key Stats**: Speed (50%) + Power (35%) + Stamina (15%)
- **Strategy Impact**: Front runners have major advantage
- **Career Timing**: Turn 4 (Debut race)

### Mile (1600m) 
- **Focus**: Balanced performance
- **Duration**: ~1:35-1:45
- **Key Stats**: Speed (35%) + Stamina (35%) + Power (30%)
- **Strategy Impact**: All strategies viable
- **Career Timing**: Turn 8 (Mid-career test)

### Medium (2000m)
- **Focus**: Endurance with finishing kick
- **Duration**: ~2:00-2:15
- **Key Stats**: Stamina (45%) + Power (30%) + Speed (25%)
- **Strategy Impact**: Closers and Stalkers favored
- **Career Timing**: Turn 12 (Championship)

### Long (2400m+)
- **Focus**: Pure stamina and tactical racing
- **Duration**: ~2:25-2:45
- **Key Stats**: Stamina (60%) + Power (25%) + Speed (15%)
- **Strategy Impact**: Closers dominate, Front runners struggle
- **Career Timing**: Special events only

## Track Surface Types

### Dirt
- **Characteristics**: Power-focused racing
- **Stat Modifiers**:
  - Power: +15% effectiveness
  - Speed: -5% effectiveness
  - Stamina: Normal
- **Strategy Effects**:
  - Front runners: +10% (power helps maintain lead)
  - Stalkers: Normal
  - Closers: -5% (harder to make up ground)
- **Weather Impact**: Rain makes surface slower, favors power even more

### Turf (Grass)
- **Characteristics**: Speed and finesse racing
- **Stat Modifiers**:
  - Speed: +10% effectiveness
  - Power: Normal
  - Stamina: +5% effectiveness
- **Strategy Effects**:
  - Front runners: Normal
  - Stalkers: +5% (easier to position)
  - Closers: +10% (smoother closing runs)
- **Weather Impact**: Rain softens ground, slightly favors stamina

## Race Configuration System

### Base Race Types
```javascript
const RACE_TYPES = {
  SPRINT: {
    name: 'Sprint',
    distance: 1200,
    duration: { min: 70, max: 75 }, // seconds
    statWeights: { speed: 0.50, stamina: 0.15, power: 0.35 },
    strategyModifiers: {
      FRONT: 1.15,  // 15% bonus
      MID: 1.0,     // neutral
      LATE: 0.90    // 10% penalty
    }
  },
  
  MILE: {
    name: 'Mile',
    distance: 1600,
    duration: { min: 95, max: 105 },
    statWeights: { speed: 0.35, stamina: 0.35, power: 0.30 },
    strategyModifiers: {
      FRONT: 1.05,   // slight bonus
      MID: 1.0,      // neutral
      LATE: 1.05     // slight bonus
    }
  },
  
  MEDIUM: {
    name: 'Medium',
    distance: 2000,
    duration: { min: 120, max: 135 },
    statWeights: { speed: 0.25, stamina: 0.45, power: 0.30 },
    strategyModifiers: {
      FRONT: 0.95,   // slight penalty
      MID: 1.05,     // slight bonus
      LATE: 1.10     // 10% bonus
    }
  },
  
  LONG: {
    name: 'Long Distance',
    distance: 2400,
    duration: { min: 145, max: 165 },
    statWeights: { speed: 0.15, stamina: 0.60, power: 0.25 },
    strategyModifiers: {
      FRONT: 0.85,   // major penalty
      MID: 1.0,      // neutral
      LATE: 1.20     // major bonus
    }
  }
};
```

### Track Surfaces
```javascript
const TRACK_SURFACES = {
  DIRT: {
    name: 'Dirt',
    modifiers: {
      speed: 0.95,    // -5%
      stamina: 1.0,   // neutral
      power: 1.15     // +15%
    },
    strategyModifiers: {
      FRONT: 1.10,    // +10%
      MID: 1.0,       // neutral
      LATE: 0.95      // -5%
    },
    description: 'Power and early speed favored'
  },
  
  TURF: {
    name: 'Turf',
    modifiers: {
      speed: 1.10,    // +10%
      stamina: 1.05,  // +5%
      power: 1.0      // neutral
    },
    strategyModifiers: {
      FRONT: 1.0,     // neutral
      MID: 1.05,      // +5%
      LATE: 1.10      // +10%
    },
    description: 'Speed and tactical racing favored'
  }
};
```

## Weather Conditions

### Clear/Good
- **Track Impact**: No modifiers
- **Racing**: Standard conditions

### Rain/Wet
- **Track Impact**: 
  - Dirt: Power +5% additional, Speed -5% additional
  - Turf: Stamina +10%, Speed -5%
- **Strategy Impact**: Front running becomes riskier

### Firm/Fast (Dry)
- **Track Impact**:
  - Speed +5% on all surfaces
  - Stamina -5% (faster pace)
- **Strategy Impact**: Front runners get additional bonus

## Career Race Schedule (Enhanced)

### Classic Career Path
```javascript
const CAREER_RACES = [
  {
    turn: 4,
    name: 'Maiden Sprint',
    type: 'SPRINT',
    surface: 'DIRT',
    description: 'Your debut race - a dirt sprint to test raw speed and power'
  },
  {
    turn: 8, 
    name: 'Turf Mile Classic',
    type: 'MILE',
    surface: 'TURF',
    description: 'Mid-career test on grass - requires balanced ability'
  },
  {
    turn: 12,
    name: 'Championship Stakes',
    type: 'MEDIUM',
    surface: 'TURF',
    description: 'The ultimate test - a medium distance championship'
  }
];
```

### Optional Advanced Career
```javascript
const ADVANCED_CAREER = [
  { turn: 2, name: 'Baby Sprint', type: 'SPRINT', surface: 'TURF' },
  { turn: 4, name: 'Dirt Dash', type: 'SPRINT', surface: 'DIRT' },
  { turn: 6, name: 'Turf Trial', type: 'MILE', surface: 'TURF' },
  { turn: 8, name: 'Mile Championship', type: 'MILE', surface: 'DIRT' },
  { turn: 10, name: 'Distance Test', type: 'MEDIUM', surface: 'TURF' },
  { turn: 12, name: 'Grand Final', type: 'LONG', surface: 'TURF' }
];
```

## Performance Calculation (Updated)

### Enhanced Formula
```javascript
function calculateRacePerformance(horse, raceType, surface, strategy, weather = 'CLEAR') {
  const raceConfig = RACE_TYPES[raceType];
  const surfaceConfig = TRACK_SURFACES[surface];
  
  // 1. Base performance from stats
  const basePerf = 
    (horse.stats.speed * raceConfig.statWeights.speed) +
    (horse.stats.stamina * raceConfig.statWeights.stamina) +
    (horse.stats.power * raceConfig.statWeights.power);
  
  // 2. Apply surface modifiers to stats
  const surfaceModifiedStats = {
    speed: horse.stats.speed * surfaceConfig.modifiers.speed,
    stamina: horse.stats.stamina * surfaceConfig.modifiers.stamina,
    power: horse.stats.power * surfaceConfig.modifiers.power
  };
  
  const surfacePerf = 
    (surfaceModifiedStats.speed * raceConfig.statWeights.speed) +
    (surfaceModifiedStats.stamina * raceConfig.statWeights.stamina) +
    (surfaceModifiedStats.power * raceConfig.statWeights.power);
  
  // 3. Apply strategy modifiers
  const strategyBonus = 
    (raceConfig.strategyModifiers[strategy] || 1.0) *
    (surfaceConfig.strategyModifiers[strategy] || 1.0);
  
  // 4. Apply energy factor
  const energyFactor = horse.condition.energy / 100;
  
  // 5. Random variance (±10%)
  const variance = 0.9 + (Math.random() * 0.2);
  
  // 6. Final calculation
  return surfacePerf * strategyBonus * energyFactor * variance;
}
```

## Training Recommendations by Upcoming Race

### Pre-Sprint Training (Turns 1-3)
- **Primary**: Speed training (40% of sessions)
- **Secondary**: Power training (35% of sessions)  
- **Maintenance**: Stamina training (25% of sessions)
- **Surface Prep**: If Dirt → focus more on Power, If Turf → focus more on Speed

### Pre-Mile Training (Turns 5-7)
- **Balanced approach**: Speed (30%), Stamina (40%), Power (30%)
- **Strategy consideration**: Front runners need more stamina for mile
- **Surface Prep**: Turf miles favor speed, Dirt miles favor power

### Pre-Distance Training (Turns 9-11)
- **Primary**: Stamina training (50% of sessions)
- **Secondary**: Power for finishing kick (30% of sessions)
- **Maintenance**: Speed to stay competitive (20% of sessions)

## UI Display Format

### Race Preview Screen
```
🏁 UPCOMING RACE 🏁
═══════════════════

📋 Race: Turf Mile Classic  
🏃 Distance: 1600m (~1:40)
🌱 Surface: Turf (Speed +10%, Closers favored)
🌤️ Weather: Clear
💰 Prize: $5,000

🎯 RACE CHARACTERISTICS:
• Balanced speed and stamina required
• Turf surface favors tactical racing  
• All strategies competitive
• Perfect for well-rounded horses

🏇 FIELD SIZE: 8 horses
📊 YOUR ODDS: Based on current stats

Press ENTER to view field and select strategy...
```

### Strategy Selection Screen
```
🎮 SELECT RACING STRATEGY 🎮
════════════════════════════

Race: Turf Mile Classic (1600m)
Your Horse: Thunder Strike

[1] 🏃 FRONT RUNNER
    Lead from the start
    Turf Bonus: Normal | Mile Bonus: +5%
    Best for: High Speed + Power horses
    
[2] 🎯 STALKER  
    Stay with leaders, surge late
    Turf Bonus: +5% | Mile Bonus: Normal  
    Best for: Balanced stat horses
    
[3] 🚀 CLOSER
    Conserve energy, explosive finish
    Turf Bonus: +10% | Mile Bonus: +5%
    Best for: High Stamina + Power horses

💡 RECOMMENDATION: Based on your stats, CLOSER is optimal

Press 1-3 to select strategy...
```

This system provides deep strategic choices while maintaining the simple core gameplay loop!