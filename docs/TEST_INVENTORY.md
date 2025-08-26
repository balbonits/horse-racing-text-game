# Test Inventory

## Overview
Complete inventory of all test files in the project, organized by category and purpose.

---

## Unit Tests (`tests/unit/`)

### Character & Horse Systems
- **character.test.js** - Character class, stats, progression, mood system
- **nph-roster.test.js** - NPH (Non-Player Horse) roster generation and management

### Race Systems
- **race-execution.test.js** - Core race execution logic
- **race-types.test.js** - Race type configurations and calculations
- **race-animation.test.js** - Race animation display and timing
- **turn-progression-basic.test.js** - Basic turn advancement mechanics

### UI Systems
- **ui.test.js** - UI component rendering and updates

---

## Integration Tests (`tests/integration/`)

### Core Game Flow
- **gameFlow.test.js** - Overall game state transitions
- **gameApp.test.js** - GameApp class integration
- **complete-career-flow.test.js** - Full 12-turn career progression
- **turn-progression.test.js** - Turn advancement with races
- **game-state-consistency.test.js** - State persistence and consistency

### Race Integration
- **race-flow.test.js** - Race triggering and completion flow
- **enhanced-race-system.test.js** - Enhanced race mechanics (NOTE: Should be removed/consolidated)
- **race-preview-bug.test.js** - Specific bug reproduction for race preview

### UI Integration
- **blessed-rendering.test.js** - Blessed terminal UI rendering
- **ui-functionality.test.js** - UI interaction and updates
- **user-input.test.js** - Keyboard input handling
- **input-validation.test.js** - Input validation and error handling

---

## Journey Tests (`tests/journeys/`)

### User Journeys
- **simple.test.js** - Simple happy path through game
- **core.test.js** - Core gameplay experience

---

## Critical Path Tests (`tests/critical-path/`)

### P0 Priority
- **p0-core-journey.test.js** - Critical user path that must work

---

## E2E Tests (`tests/e2e/`)

### Complete Experience
- **complete-gameplay.test.js** - Full end-to-end gameplay scenarios

---

## Regression Tests (`tests/regression/`)

### Bug Prevention
- **core-experience.test.js** - Previously fixed bugs to prevent regression

---

## Test Coverage Summary

### Areas Well Covered ✅
- Character stats and progression
- NPH roster generation
- Basic race calculations
- UI rendering
- Input handling
- State transitions

### Areas Needing More Tests ⚠️
- Race result persistence
- Character updates after races
- Save/Load with race data
- Career completion flow
- Memory/performance under long sessions

### Known Failing Tests 🔴
- Tests expecting "enhanced" race system behavior
- Tests for race stats persistence (the bug we're fixing)
- Some integration tests due to state machine changes

---

## Test Execution Commands

```bash
# Run all tests
npm test

# Run specific category
npm test tests/unit
npm test tests/integration
npm test tests/journeys

# Run specific file
npm test tests/unit/race-execution.test.js

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

---

## Test Maintenance Notes

### Tests to Update/Remove
1. **enhanced-race-system.test.js** - Remove after consolidating to single race system
2. **race-preview-bug.test.js** - Can be removed once bug is fixed
3. Tests expecting two race systems need updating

### Tests to Add
1. Race completion updates character stats correctly
2. Race results persist across state transitions
3. Complete 4-race career progression (turns 3, 4, 5, 8)
4. Race schedule generation and tracking
5. Long distance race mechanics (LONG type races)
6. All 4 race types: SPRINT, MILE, MEDIUM, LONG

---

*Last Updated: August 26, 2025*
*Total Test Files: 24*