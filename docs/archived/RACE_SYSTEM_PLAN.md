# Race System Implementation Plan
## TDD-First Approach for Race Execution

Following TDD methodology: Plan → Test → Implement → Refactor

---

## Current Failing Tests Analysis

From P0 critical path, these race tests are failing:

1. **"Training complete, WHEN: Race phase starts, THEN: Auto-runs first race"**
2. **"Race completed, WHEN: Results display, THEN: Shows position and performance"** 
3. **"After race, WHEN: User continues, THEN: Runs next race or completes career"**

## Required Behavior Specification

### Test 1: Auto-Run First Race
**GIVEN:** Training phase complete (turn > 12)  
**WHEN:** State transitions to 'race_results'  
**THEN:**
- `app.game.getScheduledRaces()` returns array of 3 races
- `app.game.getRaceResults()` returns array with 1 result
- First race auto-executes on state transition

### Test 2: Race Results Display  
**GIVEN:** A race has completed  
**WHEN:** Results are displayed  
**THEN:**
- Result has `position` property (1-8)
- Result has `time` property 
- Result has `performance` property
- Result has `commentary` property
- Commentary matches position (1st="Amazing victory!", etc.)

### Test 3: Race Progression
**GIVEN:** Race result displayed  
**WHEN:** User presses Enter  
**THEN:**
- IF more races exist: Run next race, update `currentRaceIndex`
- IF all races complete: Transition to 'career_complete' state

---

## Required Methods to Implement

### Game Class Methods
```javascript
// Already exist but need to work properly:
- getScheduledRaces() // ✅ Implemented
- getRaceResults() // ✅ Implemented  
- currentRaceIndex // ✅ Added property

// Need to implement:
- runRace(raceData) // Execute single race
- autoRunFirstRace() // Trigger on phase transition
```

### GameApp Class Methods
```javascript
// Need to implement:
- No new methods required, just proper state handling
```

---

## Race Execution Algorithm

### Input Data
```javascript
raceData = {
  name: "Race Name",
  distance: 1600, // meters
  surface: "Turf" // Dirt/Turf
}

character = {
  stats: { speed: 50, stamina: 50, power: 50 },
  energy: 100,
  mood: "Normal"
}
```

### Algorithm Steps
1. **Generate AI Competitors** (7 horses with random stats 40-80)
2. **Calculate Performance Scores**:
   - Base = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
   - Distance modifiers: Sprint(speed+), Mile(balanced), Long(stamina+)
   - Random variance: ±15%
3. **Sort by Performance** (highest = 1st place)
4. **Generate Race Time** based on distance and performance
5. **Create Commentary** based on finishing position
6. **Return Race Result Object**

### Expected Result Format
```javascript
{
  position: 3, // 1-8
  time: "1:34.56",
  performance: 156.7,
  commentary: "Great performance!",
  raceData: { name: "Derby", distance: 1600 },
  participants: [...] // All 8 finishers
}
```

---

## Implementation Strategy

### Phase 1: Race Execution Core
1. **Write test for `runRace()` method**
2. **Implement minimal `runRace()` to pass test**
3. **Write test for auto-run behavior**
4. **Implement state transition triggering**

### Phase 2: Race Results
1. **Write test for result format validation**
2. **Implement performance calculation**
3. **Write test for commentary generation**
4. **Implement UI result display**

### Phase 3: Race Progression
1. **Write test for race sequence**
2. **Implement currentRaceIndex tracking**
3. **Write test for career completion trigger**
4. **Implement transition logic**

---

## Test Cases to Write

### Unit Tests (Race Logic)
```javascript
describe('Race.runRace()', () => {
  test('should return valid result format', () => {
    // Test result structure
  });
  
  test('should place character between 1-8', () => {
    // Test position bounds
  });
  
  test('should reflect stat differences in performance', () => {
    // High stats = better average position
  });
});
```

### Integration Tests (Game Flow)
```javascript
describe('Race Phase Transition', () => {
  test('should auto-run first race on phase entry', () => {
    // Test automatic race execution
  });
  
  test('should progress through all 3 races', () => {
    // Test sequence completion
  });
});
```

---

## Acceptance Criteria

### Must Pass
- [ ] Race auto-runs when training complete
- [ ] Result format matches test expectations
- [ ] Position is realistic (1-8, based on stats)
- [ ] Commentary matches position
- [ ] Can progress through all 3 races
- [ ] Career completes after race 3

### Should Pass  
- [ ] Better stats = better average results
- [ ] Race time reflects distance
- [ ] AI competitors seem realistic
- [ ] Performance variance feels natural

### Nice to Have
- [ ] Race animations/descriptions
- [ ] Detailed competitor information
- [ ] Race history tracking
- [ ] Performance trends

---

## Next Steps

1. **Analyze current failing test** to understand exact expectations
2. **Write focused unit tests** for race execution
3. **Implement minimal race logic** to pass tests
4. **Iterate until all race tests pass**
5. **Move to career completion system**

**REMEMBER: No implementation code until tests are written!**