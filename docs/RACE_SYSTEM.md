# Race System Documentation - Single Source of Truth

## Overview
This document consolidates all race system documentation into one comprehensive reference. This represents the ACTUAL implemented system for the MVP.

**v1.0 Update**: Enhanced with realistic distance categories based on IRL horse racing standards.

---

## 1. Race Schedule

### Static 4-Race Career
Each career includes exactly 4 races at fixed turns:

| Turn | Race Name | Type | Surface | Distance | Focus |
|------|-----------|------|---------|----------|-------|
| 4 | Maiden Sprint | Sprint | Dirt | 1200m | Speed/Power |
| 9 | Mile Championship | Mile | Dirt | 1600m | Balanced |
| 15 | Dirt Stakes | Medium | Dirt | 2000m | Endurance |
| 24 | Turf Cup Final | Long | Turf | 2400m | Stamina |

### Race Triggering
- Races trigger **automatically** after training on scheduled turns
- Player sees warning: "*** RACE HAPPENS AFTER THIS TRAINING! ***"
- No option to skip or delay races - they are mandatory

---

## 2. Race Flow

### State Transitions
```
Training (Turn 3→4/4→5/5→6/8→9) → Auto-Trigger → Race Animation → Race Results → Back to Training
                              ↓                ↓               ↓
                         [Automatic]    [ENTER to skip]   [ENTER to continue]
```

### User Experience Flow
1. **Pre-Race Warning** - Shows on training screen when race is next
2. **Race Animation** - 12-second animated race (can skip with ENTER)
3. **Race Results** - Shows standings with times and ceremony
4. **Return to Training** - Continues career progression

---

## 3. Race Performance Calculation

### Core Formula (from Race.js)
```javascript
// Base performance using weighted stats
weightedStats = (speed * weights.speed) + (stamina * weights.stamina) + (power * weights.power)

// Apply modifiers
performance = weightedStats * staminaFactor * moodMultiplier * randomFactor

// Stamina factor: current energy affects performance
staminaFactor = Math.max(0.3, energy / 100)

// Mood multiplier
moodMultiplier = {
  'Excellent': 1.15,
  'Great': 1.10,
  'Good': 1.05,
  'Normal': 1.0,
  'Tired': 0.90,
  'Bad': 0.80
}

// Random variance for excitement
randomFactor = 0.85 + (Math.random() * 0.3) // 0.85 to 1.15
```

### Stat Weights by Race Type
| Race Type | Speed | Stamina | Power |
|-----------|-------|---------|-------|
| Sprint | 50% | 15% | 35% |
| Mile | 35% | 35% | 30% |
| Medium | 25% | 45% | 30% |
| Long | 15% | 60% | 25% |

---

## 4. Race Results

### Data Structure
Each completed race stores:
```javascript
{
  completed: true,
  results: [...allParticipants],
  playerResult: { position, time, performance },
  completedAt: "ISO timestamp"
}
```

### Character Updates After Race
1. **Career Stats**:
   - `racesRun++` - Increment races completed
   - `racesWon++` - Increment if position == 1

2. **Mood/Energy Effects**:
   - 1st place: Mood → 'Great', Energy -0, Friendship +5
   - 2nd-3rd: Mood → 'Good', Energy -0, Friendship +3
   - 4th-6th: No mood change, Energy -0, Friendship +1
   - 7th-8th: Energy -5, No friendship gain

---

## 5. NPH (Non-Player Horse) Competition

### Race Field Generation
- Player horse + 7 NPH competitors
- NPH horses selected from roster of 24
- Performance calculated using same formula as player
- Each NPH has unique stats and racing strategy

### NPH Strategies
- **FRONT**: Early speed, wire-to-wire attempts
- **MID**: Stalker position, balanced pace
- **LATE**: Closer style, strong finish

---

## 6. Race Display

### Race Results Screen Shows:
1. **Race Info**: Name, distance, surface
2. **Final Standings**: All 8 positions with times
   - Format: "🏆 1st Horse Name - 72.35s"
3. **Ceremony Section**: Player placement celebration
4. **Performance Feedback**: Based on position

### Professional Placings
- 1st: 🏆 with "WINNER!" message
- 2nd: 🥈 with encouragement
- 3rd: 🥉 with "podium finish"
- 4th+: Numeric placing with advice

---

## 7. Implementation Details

### Key Files
- `src/models/Race.js` - Core race simulator (`simulateRace`, `processRaceResults`)
- `src/models/RaceGenerator.js` - Creates 4-race schedule
- `src/systems/RaceAnimation.js` - Animated race display
- `src/systems/Game.js` - Race orchestration and state management

### Critical Methods
1. **`simulateRace(participants, raceType)`** - Runs race simulation
2. **`processRaceResults(character, raceResult)`** - Updates character stats
3. **`checkForScheduledRace()`** - Determines if race should trigger
4. **`completedRaces[]`** - Tracks which races have been run

---

## 8. Known Issues & Solutions

### Current Bug: Stats Not Persisting After Races
**Problem**: The `runEnhancedRace` method doesn't call `processRaceResults`
**Solution**: Use only the original `simulateRace` + `processRaceResults` combo

### Implementation Note
There should be ONE race system, not two. The "enhanced" version is unnecessary duplication that breaks character updates.

---

## 9. Future Enhancements (Post-MVP)

- Dynamic race generation based on player progress
- Weather conditions affecting performance
- G1/G2/G3 race tiers
- Specialization system (Sprint/Mile/Long specialists)
- Seasonal campaigns and story arcs
- Rival system with recurring NPH competitors

---

*Last Updated: August 26, 2025*
*Status: MVP Implementation - 4 Static Races*