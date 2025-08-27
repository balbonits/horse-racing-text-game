# UX Flow & Racing Mechanics Guide

## Complete Game Flow Overview

### 1. Application States & Transitions

The game uses 7 distinct states with clean transitions:

```
main_menu → character_creation → training → race_results → [career_complete OR training]
    ↑           ↓                    ↑         ↓               ↓
help ←─────── load_game              └─── (auto-cycles) ────────┘
```

#### State Details:

| State | Purpose | User Actions | Next State |
|-------|---------|--------------|------------|
| **main_menu** | Game start/hub | 1-4 keys, Q | character_creation, load_game, help |
| **character_creation** | Horse naming | Type name + Enter | training |
| **training** | Core gameplay | 1-5 training, S save, Q quit | race_results (auto on turns 4,8,12) |
| **race_results** | Race outcomes | Any key to continue | training or career_complete |
| **load_game** | Save selection | 1-N load slot, Q back | training |
| **help** | Instructions | Any key | training |
| **career_complete** | End summary | Enter for new career | character_creation |

---

## 2. Complete Racing Mechanics

### Race Schedule (Immutable)
- **Turn 4**: Debut Sprint (1200m) - Speed/Power focused
- **Turn 8**: Mile Challenge (1600m) - Balanced stats  
- **Turn 12**: Championship (2000m) - Stamina/Endurance focused

### Race Trigger System
```
Training Turn Complete → Check Race Schedule → Auto-Trigger Race → Show Results → Continue
```

**Key Points:**
- Races are **mandatory** and **automatic** on scheduled turns
- No user choice to skip or delay races
- Race performance directly reflects training decisions
- UI shows prominent warnings: "*** RACE HAPPENS AFTER THIS TRAINING! ***"

### Performance Calculation Algorithm

```javascript
// Step 1: Base Performance Calculation
base_performance = (speed × 0.4) + (stamina × 0.4) + (power × 0.2)

// Step 2: Apply Energy Factor  
energy_factor = current_energy / max_energy

// Step 3: Apply Distance Modifiers
if (race_distance === 1200) {  // Sprint
  distance_modifier = 1.0 + (speed_advantage * 0.15)
} else if (race_distance === 1600) {  // Mile
  distance_modifier = 1.0  // Balanced
} else if (race_distance === 2000) {  // Long
  distance_modifier = 1.0 + (stamina_advantage * 0.2)
}

// Step 4: Apply Randomness (±15%)
random_variance = random(0.85, 1.15)

// Step 5: Final Score
final_performance = base_performance × energy_factor × distance_modifier × random_variance
```

### Race Competition
- **Participants**: You + 7 AI horses (8 total)
- **AI Stats**: Randomized 30-70 range for realistic competition
- **Ranking**: 1st-8th place based on final_performance scores
- **Results**: Position, time, performance score, commentary

### Strategy Guide

| Race Type | Optimal Training | Why |
|-----------|------------------|-----|
| **Sprint (1200m)** | Speed 60+, Power 50+ | Quick acceleration and top speed crucial |
| **Mile (1600m)** | Balanced 40+ all stats | Requires well-rounded performance |
| **Championship (2000m)** | Stamina 60+, moderate others | Endurance is key for long distance |

---

## 3. Core User Journeys

### First-Time Player (Target: 5 minutes to "get it")

```
1. Launch Game → See main menu (familiar interface)
2. Press "1" → Character creation (simple name input)
3. Type horse name → Training screen appears (clear stats display)
4. Press "1" (Speed Training) → See immediate stat increase +visual feedback
5. Continue 2-3 training actions → Energy decreases visibly
6. Turn 4 approaches → See prominent "RACE AFTER TRAINING!" warning
7. Complete training → Auto-race triggers with clear transition
8. See race results → Understand position reflects training choices
```

**Success Criteria:**
- Player understands stat → training → performance connection within 3 minutes
- No confusion about what numbers mean or actions do
- Race results feel like natural consequence of training decisions

### Core Gameplay Loop (Target: 15-minute sessions)

```
Training Phase (12 turns):
  Turn 1-3: Build foundation stats
  Turn 4: RACE 1 (Debut Sprint) → Immediate feedback
  Turn 5-7: Adjust strategy based on race results  
  Turn 8: RACE 2 (Mile Challenge) → Mid-career assessment
  Turn 9-11: Final preparation for championship
  Turn 12: RACE 3 (Championship) → Career climax

Results & Legacy:
  Career grade calculation → Legacy bonuses → "One more run" appeal
```

**Engagement Factors:**
1. **Immediate Feedback**: Every training choice shows instant stat changes
2. **Strategic Depth**: Race schedule creates planning opportunities
3. **Risk/Reward**: Energy management adds tactical decisions
4. **Progression**: Each race validates/challenges strategy
5. **Replayability**: Legacy system + random variance encourage multiple runs

### Power User Journey (Target: Multiple sessions)

```
Session 1: Learn mechanics, complete first career
Session 2: Apply lessons, optimize strategy  
Session 3: Save/load, experiment with different builds
Session 4+: Legacy bonus stacking, perfect run attempts
```

---

## 4. UX Principles & Design Decisions

### Clarity & Feedback
- **Every action has immediate visual feedback** (stat changes, energy bars)
- **Clear state transitions** with headers and visual separators
- **Prominent warnings** for important events (races, energy depletion)
- **Consistent language** across all UI elements

### Simplicity & Focus  
- **Minimal input complexity** (single key presses, simple text input)
- **Clean information hierarchy** (most important info at top)
- **No overwhelming choices** (max 5 options at any time)
- **Progressive disclosure** (advanced features emerge naturally)

### Engagement & Flow
- **Rapid feedback loops** (training → stats → race → results)
- **Clear goal progression** (turn counter, race schedule)
- **Natural stopping points** (after races, career completion)
- **"One more run" hooks** (legacy bonuses, strategy refinement)

---

## 5. Technical Implementation Notes

### State Management
- Single `currentState` variable drives all UI rendering
- State transitions are atomic and always render new screen
- No complex state hierarchies or nested modes

### Input Handling
- Readline-based for maximum terminal compatibility  
- Single-character commands for speed (1-5, Q, S, etc.)
- Text input only for character names
- All inputs immediately processed and acknowledged

### Performance Characteristics
- Race calculations complete in <100ms
- State transitions render in <50ms  
- No memory leaks in training/race loops
- Clean screen clearing prevents terminal artifacts

---

## 6. Success Metrics & Validation

### Must Work (Game Breaking Issues)
- [ ] Complete career without crashes
- [ ] Race results reflect training decisions
- [ ] Save/load preserves exact game state
- [ ] All input commands function correctly

### Should Work (Core Experience)
- [ ] Training choices feel meaningful
- [ ] Energy management creates strategic decisions
- [ ] Race warnings are clear and prominent
- [ ] Career progression feels satisfying

### Nice to Have (Polish & Engagement)
- [ ] Smooth visual transitions
- [ ] Engaging race commentary
- [ ] Multiple playthroughs feel fresh
- [ ] Legacy system encourages replay

---

## 7. Testing Strategy

### Manual Testing Checklist
```
□ New Career Flow
  □ Main menu → character creation → training
  □ All training options work (1-5)
  □ Energy management functions
  □ Race warnings appear correctly
  □ Auto-races trigger on turns 4,8,12
  □ Results reflect stat differences

□ Save/Load Flow  
  □ Save at any training turn
  □ Load preserves exact state
  □ Multiple save slots work
  □ Handle corrupted saves gracefully

□ Edge Cases
  □ Empty character name
  □ No energy for training
  □ Rapid key presses
  □ Terminal resize
```

### Automated Journey Tests
```bash
# Run complete career simulation
npm run test:journeys -- --testNamePattern="complete career"

# Validate racing mechanics
npm run test:balance -- --testNamePattern="race performance" 

# Check save/load integrity
npm run test:integration -- --testNamePattern="save load"
```

---

## 8. Current Implementation Status

### ✅ Fully Working
- State management and transitions
- Character creation with proper input handling
- Training system with stat progression
- Race scheduling and auto-trigger
- Race performance calculations
- Results display and progression

### 🔄 Needs Polish  
- Race commentary variety
- Legacy bonus system refinement
- Visual feedback enhancements
- Help system completion

### 📋 Future Enhancements
- Advanced statistics tracking
- Multiple horse breeds/types
- Achievement system
- Online leaderboards

---

*Last Updated: 2024 - Reflects current V1.0 implementation*
*For technical implementation details, see: `CLAUDE.md` and `docs/API_ARCHITECTURE.md`*