# Modular Career System Architecture

## Overview
This document outlines the new modular architecture for the career mode system, designed to address all issues encountered with race timing, state management, and data persistence.

## Design Philosophy
- **Single Responsibility**: Each module has one clear purpose
- **Test-First Development**: All modules are defined by their tests first
- **Clear Interfaces**: Modules communicate through well-defined APIs
- **No Side Effects**: Pure functions where possible, clear mutation points
- **Comprehensive Testing**: Unit tests for modules, integration tests for flow

## Module Structure

### Core Data Modules

#### Character Module (`src/modules/Character.js`)
**Responsibility**: Character state and basic queries
```javascript
class Character {
  constructor(name)
  canTrain(energyCost) -> boolean
  getStatTotal() -> number
  isExhausted() -> boolean
}
```
**Tests**: `tests/modules/Character.test.js`

#### Timeline Module (`src/modules/Timeline.js`)  
**Responsibility**: Race scheduling and timing logic
```javascript
class Timeline {
  getRaceForTurn(turn) -> string|null
  getNextRaceInfo(currentTurn) -> object|null
  isRaceTurn(turn) -> boolean
  getTotalRaces() -> number
}
```
**Tests**: `tests/modules/Timeline.test.js`

#### GameState Module (`src/modules/GameState.js`)
**Responsibility**: Game state transitions and validation  
```javascript
class GameState {
  transition(newState) -> result
  is(state) -> boolean
  getValidNextStates() -> array
  getHistory() -> array
  goBack() -> result
}
```
**Tests**: `tests/modules/GameState.test.js`

### Business Logic Modules

#### TrainingEngine Module (`src/modules/TrainingEngine.js`)
**Responsibility**: Training mechanics and calculations
```javascript
class TrainingEngine {
  calculateGains(character, trainingType) -> gains
  applyTraining(character, trainingType) -> gains
}
```
**Tests**: `tests/modules/TrainingEngine.test.js`

#### TurnController Module (`src/modules/TurnController.js`)
**Responsibility**: Turn progression and race triggering
```javascript
class TurnController {
  constructor(character, timeline, trainingEngine)
  processTurn(action) -> result
}
```  
**Tests**: `tests/modules/TurnController.test.js`

### Integration Tests

#### Complete Career Flow (`tests/integration/CompleteCareer.test.js`)
**Responsibility**: End-to-end career simulation testing
- Full 12-turn career progression
- All 4 races trigger correctly (turns 4, 7, 10, 12)
- Character stats persist throughout
- State management integration
- Energy management over time
- Data consistency validation

## Development Phases

### Phase 1: Test Creation ✅ COMPLETED
- [x] Write all module tests first
- [x] Define expected interfaces through tests
- [x] Create integration test scenarios
- [x] Update documentation

### Phase 2: Core Data Module Implementation
- [ ] Implement Character module to pass tests
- [ ] Implement Timeline module to pass tests  
- [ ] Implement GameState module to pass tests
- [ ] Commit after each module passes tests

### Phase 3: Business Logic Module Implementation
- [ ] Implement TrainingEngine module to pass tests
- [ ] Implement TurnController module to pass tests
- [ ] Commit after modules pass tests

### Phase 4: Integration Testing
- [ ] Run complete career integration tests
- [ ] Fix any integration issues
- [ ] Verify all race timing works correctly
- [ ] Final commit

## Race Schedule Fixed
Based on user feedback, races now properly spaced:
- **Turn 4**: Maiden Sprint (after 3 training turns)
- **Turn 7**: Mile Championship (after 3 more training turns)  
- **Turn 10**: Dirt Stakes (after 3 more training turns)
- **Turn 12**: Turf Cup Final (after 2 more training turns)

## Key Benefits

### Eliminates Previous Issues
1. **Race Timing Bugs**: Timeline module provides single source of truth
2. **State Transition Errors**: GameState module prevents duplicate transitions
3. **Data Persistence**: Clear separation of concerns ensures stats always persist
4. **Testing Gaps**: Comprehensive test coverage at unit and integration levels

### Enables Future Development
- Easy to add new training types (extend TrainingEngine)
- Easy to add new race types (extend Timeline)
- Easy to add new UI screens (consume existing modules)
- Easy to add save/load (modules have clear data structures)

## Dependencies
```
TurnController
├── Character (data)
├── Timeline (data)  
└── TrainingEngine (logic)

GameState (independent)
```

## Testing Strategy
- **Unit Tests**: Each module tested in isolation with mocks
- **Integration Tests**: Modules tested together for complete flows
- **TDD Process**: Tests written first, implementation follows
- **Commit Between Phases**: Ensures working state at each step

This architecture addresses all issues raised and provides a solid foundation for the complete career mode system.