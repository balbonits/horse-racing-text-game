# Race System V2 - Enhanced Flow & Mechanics Design

## Overview
Transform the current auto-race system into an interactive, strategic experience with pre-race decisions, visual racing, and meaningful rewards.

---

## 1. New Race Flow Architecture

### State Flow Diagram
```
training → race_preview → horse_lineup → strategy_select → race_running → race_results → podium → training
             ↓                ↓               ↓                 ↓              ↓          ↓
         [Enter key]    [View horses]   [1/2/3 keys]     [Animation]    [Continue]  [Rewards]
```

### New States to Add
| State | Purpose | User Actions | Duration |
|-------|---------|--------------|----------|
| **race_preview** | Show upcoming race info | Enter to continue | User-controlled |
| **horse_lineup** | Display all 8 competitors | 1-3 for strategy | User-controlled |
| **race_running** | Animated race progress | Watch only | 10-15 seconds |
| **podium** | Victory ceremony & rewards | Enter to continue | User-controlled |

---

## 2. Race Strategy Mechanics (Uma Musume Style)

### Running Styles
```javascript
const RunningStyles = {
  FRONT: {
    name: 'Front Runner',
    description: 'Take the lead early and hold it',
    phases: {
      early: 1.15,    // 15% speed boost
      middle: 0.95,   // 5% penalty (tired)
      final: 0.90     // 10% penalty (exhausted)
    },
    stamina_drain: 1.3,  // 30% more stamina usage
    best_for: 'High Speed, High Power horses'
  },
  
  MID: {
    name: 'Stalker', 
    description: 'Stay with the pack, surge late',
    phases: {
      early: 1.0,     // Normal speed
      middle: 1.0,    // Normal speed  
      final: 1.1      // 10% boost in final
    },
    stamina_drain: 1.0,  // Normal stamina usage
    best_for: 'Balanced stat horses'
  },
  
  LATE: {
    name: 'Closer',
    description: 'Conserve energy, explosive finish',
    phases: {
      early: 0.85,    // 15% slower (conserving)
      middle: 0.95,   // 5% slower (positioning)
      final: 1.25     // 25% boost (kick)
    },
    stamina_drain: 0.8,  // 20% less stamina usage
    best_for: 'High Stamina, High Power horses'
  }
};
```

### Strategy Impact Formula
```javascript
function calculatePhasePerformance(horse, strategy, phase, distance) {
  const baseSpeed = horse.stats.speed;
  const stamina = horse.stats.stamina;
  const power = horse.stats.power;
  
  // Base calculation varies by phase
  let phaseScore;
  switch(phase) {
    case 'early':  // 0-30% of race
      phaseScore = (speed * 0.5) + (power * 0.3) + (stamina * 0.2);
      break;
    case 'middle': // 30-70% of race
      phaseScore = (speed * 0.4) + (stamina * 0.4) + (power * 0.2);
      break;
    case 'final':  // 70-100% of race
      phaseScore = (power * 0.4) + (speed * 0.3) + (stamina * 0.3);
      break;
  }
  
  // Apply strategy modifier
  const strategyModifier = strategy.phases[phase];
  
  // Apply stamina factor (horses with low stamina suffer more)
  const staminaFactor = calculateStaminaFactor(stamina, strategy.stamina_drain, phase);
  
  return phaseScore * strategyModifier * staminaFactor;
}
```

---

## 3. NPC Horse Generation System

### Balanced Competition Algorithm
```javascript
class NPCHorseGenerator {
  /**
   * Generate competitive NPCs based on player horse strength
   * Ensures fair but challenging races
   */
  generateField(playerHorse, raceType, fieldSize = 7) {
    const playerPower = this.calculateHorsePower(playerHorse);
    const horses = [];
    
    // Distribution of competitor strength
    const distribution = [
      { percent: 0.15, range: [0.7, 0.85] },  // 1 weak horse
      { percent: 0.30, range: [0.85, 0.95] }, // 2 below average  
      { percent: 0.30, range: [0.95, 1.05] }, // 2 average (near player)
      { percent: 0.20, range: [1.05, 1.15] }, // 1-2 strong
      { percent: 0.05, range: [1.15, 1.25] }  // Rare champion
    ];
    
    for (let i = 0; i < fieldSize; i++) {
      const tier = this.selectTier(distribution);
      const powerMultiplier = this.randomInRange(tier.range[0], tier.range[1]);
      const targetPower = playerPower * powerMultiplier;
      
      horses.push(this.generateHorse(targetPower, raceType));
    }
    
    return horses;
  }
  
  generateHorse(targetPower, raceType) {
    // Create stats that sum to targetPower with variation
    const stats = this.distributeStats(targetPower, raceType);
    
    // Add personality and running style
    const style = this.selectRunningStyle(stats);
    
    return {
      name: this.generateName(),
      stats: stats,
      runningStyle: style,
      lane: null, // Assigned later
      jockeyColors: this.generateColors()
    };
  }
  
  distributeStats(totalPower, raceType) {
    // Bias distribution based on race type
    const templates = {
      sprint: { speed: 0.45, stamina: 0.25, power: 0.30 },
      mile:   { speed: 0.35, stamina: 0.35, power: 0.30 },
      long:   { speed: 0.25, stamina: 0.45, power: 0.30 }
    };
    
    const template = templates[raceType] || templates.mile;
    
    // Add ±10% variation to each stat
    return {
      speed: Math.round(totalPower * template.speed * this.randomInRange(0.9, 1.1)),
      stamina: Math.round(totalPower * template.stamina * this.randomInRange(0.9, 1.1)),
      power: Math.round(totalPower * template.power * this.randomInRange(0.9, 1.1))
    };
  }
}
```

### Player Advantage System
```javascript
const PLAYER_ADVANTAGES = {
  // Subtle bonuses to ensure player can win with good strategy
  motivation_bonus: 1.05,      // 5% performance boost (hometown crowd)
  strategy_effectiveness: 1.1,  // Player strategy 10% more effective
  comeback_potential: 1.15,     // Better recovery from poor position
  clutch_factor: 1.1            // Bonus in close finishes
};
```

---

## 4. Race Visualization System

### Terminal-Based Race Animation
```javascript
class RaceVisualizer {
  constructor() {
    this.trackLength = 40; // Terminal characters
    this.updateInterval = 500; // ms between frames
  }
  
  renderFrame(positions, elapsed, totalTime) {
    console.clear();
    console.log('🏁 RACE IN PROGRESS 🏁');
    console.log('═'.repeat(this.trackLength + 10));
    
    // Sort horses by position for display
    const sorted = positions.sort((a, b) => b.progress - a.progress);
    
    sorted.forEach((horse, idx) => {
      const pos = Math.floor(horse.progress * this.trackLength);
      const lane = '░'.repeat(pos) + horse.icon + '░'.repeat(this.trackLength - pos);
      const label = `${idx + 1}. ${horse.name.padEnd(15)}`;
      
      console.log(`${label} |${lane}| ${horse.position}m`);
    });
    
    console.log('═'.repeat(this.trackLength + 10));
    console.log(`Time: ${elapsed.toFixed(1)}s / Phase: ${this.getCurrentPhase(elapsed, totalTime)}`);
  }
  
  getCurrentPhase(elapsed, total) {
    const percent = elapsed / total;
    if (percent < 0.3) return 'Starting Phase';
    if (percent < 0.7) return 'Middle Phase';
    return 'Final Sprint!';
  }
}
```

### Horse Icons & Colors
```javascript
const HORSE_ICONS = ['🐎', '🏇', '🐴'];
const JOCKEY_COLORS = [
  { icon: '🔴', name: 'Red' },
  { icon: '🔵', name: 'Blue' },
  { icon: '🟢', name: 'Green' },
  { icon: '🟡', name: 'Yellow' },
  { icon: '🟣', name: 'Purple' },
  { icon: '🟠', name: 'Orange' },
  { icon: '⚪', name: 'White' },
  { icon: '⚫', name: 'Black' }
];
```

---

## 5. Rewards & Progression System

### Placement Rewards
```javascript
const RACE_REWARDS = {
  1: { 
    money: 1000, 
    exp: 100, 
    bonus_stat: 3, 
    title: '🏆 Champion!'
  },
  2: { 
    money: 500, 
    exp: 70, 
    bonus_stat: 2, 
    title: '🥈 Runner-up'
  },
  3: { 
    money: 250, 
    exp: 50, 
    bonus_stat: 1, 
    title: '🥉 Third Place'
  },
  4: { money: 100, exp: 30, bonus_stat: 0 },
  5: { money: 50, exp: 20, bonus_stat: 0 },
  6: { money: 25, exp: 15, bonus_stat: 0 },
  7: { money: 10, exp: 10, bonus_stat: 0 },
  8: { money: 5, exp: 5, bonus_stat: 0 }
};
```

### Podium Ceremony Screen
```
🏆 RACE RESULTS - Debut Sprint 🏆
═════════════════════════════════

        🥇 1st Place 🥇
       [Your Horse Name]
         Time: 1:12.34
        Prize: $1000
        +3 Bonus Stats!

🥈 2nd: Thunder Strike - 1:12.89
🥉 3rd: Wind Dancer - 1:13.01

Your Strategy: Front Runner
Performance Rating: A

Press ENTER to continue...
```

---

## 6. Implementation Plan

### Phase 1: Core Structure (Tests First)
```javascript
// Test: Race preview state
describe('RacePreview', () => {
  test('displays race information', () => {});
  test('shows competitor count', () => {});
  test('enter key advances to lineup', () => {});
});

// Test: Strategy selection
describe('StrategySelection', () => {
  test('displays three strategy options', () => {});
  test('keys 1-3 select strategy', () => {});
  test('selected strategy affects race calculation', () => {});
});
```

### Phase 2: NPC Generation
```javascript
// Test: Balanced competition
describe('NPCGeneration', () => {
  test('generates horses near player power level', () => {});
  test('applies race-type appropriate stats', () => {});
  test('ensures variety in running styles', () => {});
  test('player wins 40-60% with optimal strategy', () => {});
});
```

### Phase 3: Race Execution
```javascript
// Test: Race mechanics
describe('RaceExecution', () => {
  test('strategy affects phase performance', () => {});
  test('stamina drain varies by strategy', () => {});
  test('position changes during race', () => {});
  test('final order matches performance', () => {});
});
```

### Phase 4: Visualization
```javascript
// Test: Animation system
describe('RaceVisualization', () => {
  test('renders track correctly', () => {});
  test('updates positions smoothly', () => {});
  test('shows phase transitions', () => {});
  test('completes in reasonable time', () => {});
});
```

---

## 7. DRY Implementation Approach

### Shared Components
```javascript
// Reusable race utilities
class RaceUtils {
  static calculatePower(stats) { /* shared */ }
  static generateName() { /* shared */ }
  static applyStrategyModifier() { /* shared */ }
}

// Modular state handlers
class RaceStateManager {
  static preview() { /* modular */ }
  static lineup() { /* modular */ }
  static running() { /* modular */ }
  static results() { /* modular */ }
}

// Configuration-driven displays
class RaceUI {
  static renderScreen(config) { /* template-based */ }
  static showTransition(from, to) { /* reusable */ }
}
```

---

## 8. Balance Testing Metrics

### Success Criteria
- Player win rate: 40-60% with good strategy
- Player win rate: 20-40% with poor strategy  
- Race feels competitive but fair
- Strategy choice matters (15-25% impact)
- No dominant strategy (rock-paper-scissors balance)
- Progression feels earned not given

### Automated Balance Tests
```bash
# Run 1000 races to check win rates
npm run test:balance -- --races=1000

# Test strategy effectiveness
npm run test:strategy -- --iterations=500

# Validate NPC generation fairness
npm run test:npc-balance
```

---

## Next Steps
1. Review and approve design
2. Write comprehensive tests for each component
3. Implement in phases with TDD approach
4. Validate balance through automated testing
5. Polish with animations and visual feedback

*This design ensures a competitive, strategic, and engaging race experience while maintaining code modularity and testability.*