# Testing Guide

Comprehensive testing framework for Uma Musume Text-Based Clone with automated unit tests, integration tests, performance validation, and UI testing.

## 🧪 Test Categories

### Unit Tests (`tests/unit/`)
Test individual components in isolation.

```bash
# Run all unit tests
npm test tests/unit

# Specific component tests
npm test character.test.js
npm test training.test.js
npm test race.test.js
npm test ui.test.js
```

**Coverage Goals**:
- Character Model: 95%+
- Training System: 90%+  
- Race Simulation: 90%+
- Game Logic: 85%+
- UI Components: 70%+

### Integration Tests (`tests/integration/`)
Test complete game flows and system interactions.

**New Test Framework** (August 2025):
- `user-input.test.js` - Physical input simulation with keyboard/mouse events
- `ui-functionality.test.js` - Comprehensive UI component testing
- `blessed-rendering.test.js` - Terminal rendering and compatibility
- `gameApp.test.js` - Full application integration testing

```bash
# Run integration tests
npm test tests/integration

# Physical input simulation
npm test tests/integration/user-input.test.js

# UI rendering tests  
npm test tests/integration/blessed-rendering.test.js

# Full career simulation
npm test gameFlow.test.js
```

**Test Scenarios**:
- Complete career progression (12 turns + 3 races)
- Physical user input simulation (keyboard/mouse events)
- Character creation with letter-by-letter typing
- Fallback input handling for terminal compatibility
- Save/load functionality
- Cross-system data flow
- Error recovery and state management
- UI component rendering and interaction

### Balance Tests (`tests/balance/`)
Validate game mechanics and progression curves.

```bash
# Run balance validation
npm run test:balance

# Specific balance aspects
npm test statProgression.test.js
npm test raceOutcomes.test.js
```

**Validation Areas**:
- Training progression curves
- Race performance correlation
- Resource management balance
- Difficulty scaling

### Performance Tests
Ensure game runs efficiently across different scenarios.

```bash
# Performance benchmarks
npm test --testNamePattern="Performance"

# Memory usage validation
npm test --testNamePattern="memory"
```

## 🛠️ Testing Utilities

### Mock Data Factory
Comprehensive test data generation:

```javascript
const { TestDataFactory } = require('./helpers/mockData');

// Create test characters with specific attributes
const speedHorse = TestDataFactory.createTestCharacter({ speed: 90 });
const tiredHorse = TestDataFactory.createTiredCharacter();
const friendlyHorse = TestDataFactory.createHighFriendshipCharacter();

// Generate race scenarios
const raceField = TestDataFactory.createTestRaceField(8, 0); // 8 horses, player at index 0
const mockResult = TestDataFactory.createMockRaceResult(2); // 2nd place finish
```

### Input Simulation Framework
**NEW**: Physical user input testing system (`tests/utils/input-simulator.js`):

```javascript
const InputSimulator = require('../utils/input-simulator');

describe('User Input Tests', () => {
  let app, simulator;
  
  beforeEach(() => {
    app = new GameApp();
    simulator = new InputSimulator(app);
  });

  test('character creation flow', async () => {
    // Navigate to character creation
    await simulator.selectMenuOption(1);
    
    // Type character name letter by letter
    await simulator.typeText('MyHorse');
    
    // Submit with Enter
    await simulator.simulateKeyPress('enter');
    
    expect(app.game.character.name).toBe('MyHorse');
  });

  test('complete game playthrough', async () => {
    const result = await simulator.fullGamePlaythrough(
      'TestHorse', 
      ['speed', 'stamina', 'power', 'rest']
    );
    
    expect(result.success).toBe(true);
    expect(result.finalState).toBe('career_complete');
  });
});
```

**Features**:
- **Physical Input Simulation**: Mimics actual keyboard and mouse events
- **Letter-by-letter Typing**: Tests character input as users experience it
- **Complete Journey Testing**: Full game playthroughs with real input
- **Error Scenario Testing**: Invalid inputs and edge cases
- **Performance Timing**: Realistic delays between inputs

### Testing Utilities
Advanced testing tools with spies, stubs, and mocks:

```javascript
const { testUtils } = require('./helpers/testUtils');

describe('My Test', () => {
  beforeEach(() => {
    utils = testUtils;
  });

  afterEach(() => {
    testUtils.cleanup(); // Clean up all spies/stubs
  });

  test('controlled randomness', () => {
    testUtils.stubMathRandom(0.8); // Predictable results
    // Run tests with controlled randomness
  });

  test('performance measurement', async () => {
    const perfResults = await testUtils.runStressTest(() => {
      // Function to test
    }, 1000);
    
    expect(perfResults.passed).toBeGreaterThan(950);
  });
});
```

### UI Testing
Terminal interface testing with mock blessed components:

```javascript
const { MockBlessedScreen } = require('./helpers/mockData');

test('UI interactions', () => {
  const mockScreen = MockBlessedScreen.createMockScreen();
  const ui = new UISystem(mockScreen);
  
  // Test button clicks
  const mockButton = MockBlessedScreen.createMockBox();
  testUtils.simulateButtonClick(mockButton);
  
  // Test keyboard input
  testUtils.simulateKeyPress(mockScreen, 'q');
  
  expect(mockScreen.render).toHaveBeenCalled();
});
```

## 📊 Test Scenarios

### Character Progression Tests
```javascript
test('balanced training progression', () => {
  const character = TestDataFactory.createTestCharacter();
  const trainingPlan = ['speed', 'stamina', 'power', 'rest'].repeat(3);
  
  trainingPlan.forEach(type => {
    trainingSystem.performTraining(character, type);
  });
  
  const stats = character.getCurrentStats();
  expect(stats.speed).toBeInRange(45, 75);
  expect(stats.stamina).toBeInRange(45, 75);
  expect(stats.power).toBeInRange(45, 75);
});
```

### Race Simulation Tests
```javascript
test('stat correlation with race performance', () => {
  const fastHorse = TestDataFactory.createCharacterWithStats({
    speed: 90, stamina: 90, power: 90
  });
  const slowHorse = TestDataFactory.createCharacterWithStats({
    speed: 30, stamina: 30, power: 30
  });
  
  const participants = [
    { character: fastHorse, isPlayer: true },
    { character: slowHorse, isPlayer: false }
  ];
  
  const raceResult = raceSimulator.simulateRace(participants, 'sprint');
  expect(raceResult.results[0].participant.character).toBe(fastHorse);
});
```

### Error Handling Tests
```javascript
test('handles corrupted save data', () => {
  const corruptedSave = {
    character: { stats: null },
    gameState: undefined
  };
  
  const loadResult = game.loadGame(corruptedSave);
  expect(loadResult.success).toBe(false);
  expect(loadResult.message).toContain('Failed to load');
});

test('recovers from race simulation errors', () => {
  const errorSpy = testUtils.createStub(raceSimulator, 'simulateRace')
    .throws(new Error('Simulation failed'));
  
  const result = game.runRace();
  expect(result.success).toBe(false);
  
  errorSpy.restore();
  const recoveryResult = game.runRace();
  expect(recoveryResult.success).toBe(true);
});
```

## ⚡ Performance Testing

### Load Testing
```javascript
test('handles multiple concurrent operations', async () => {
  const operations = Array(100).fill().map(() => () => {
    const game = new Game();
    game.startNewGame('Load Test');
    return game.performTraining('speed');
  });
  
  const results = await Promise.all(operations.map(op => op()));
  expect(results.every(r => r.success)).toBe(true);
});
```

### Memory Usage Tests
```javascript
test('memory usage remains stable', () => {
  const { PerformanceTestUtils } = require('./helpers/mockData');
  
  const memoryResults = PerformanceTestUtils.measureMemoryUsage(() => {
    for (let i = 0; i < 50; i++) {
      const game = new Game();
      game.startNewGame('Memory Test');
      // Simulate full career...
      game.completeCareer();
    }
  });
  
  expect(memoryResults.heapUsedDiff).toBeLessThan(20 * 1024 * 1024); // < 20MB
});
```

### Execution Time Tests
```javascript
test('training calculations perform efficiently', () => {
  const character = TestDataFactory.createTestCharacter();
  
  const perfResults = PerformanceTestUtils.measureExecutionTime(() => {
    trainingSystem.performTraining(character, 'speed');
  }, 1000);
  
  expect(perfResults.averageTime).toBeLessThan(5); // < 5ms average
});
```

## 🔍 Debugging Tests

### Test Debugging Tools
```bash
# Run tests in debug mode
npm test -- --detectOpenHandles --forceExit

# Run single test with verbose output
npm test -- --testNamePattern="specific test" --verbose

# Run tests with coverage
npm run test:coverage
```

### Logging Test Data
```javascript
test('debug training progression', () => {
  const character = TestDataFactory.createTestCharacter();
  const progressLog = [];
  
  for (let i = 0; i < 5; i++) {
    const before = { ...character.stats };
    const result = trainingSystem.performTraining(character, 'speed');
    const after = { ...character.stats };
    
    progressLog.push({
      turn: i + 1,
      before,
      after,
      gain: result.statGains,
      energy: character.condition.energy
    });
  }
  
  // Log for manual inspection
  console.table(progressLog);
  
  // Automated assertions
  expect(progressLog.every(log => log.after.speed >= log.before.speed)).toBe(true);
});
```

## 📋 Test Checklist

### Before Committing
- [ ] All unit tests pass (`npm test tests/unit`)
- [ ] Integration tests pass (`npm test tests/integration`)
- [ ] Balance tests validate game mechanics (`npm run test:balance`)
- [ ] Performance tests meet benchmarks
- [ ] Code coverage meets targets (80%+ overall)
- [ ] No memory leaks detected
- [ ] Error handling paths tested

### New Feature Testing
- [ ] Unit tests for new functions/methods
- [ ] Integration tests for feature workflows
- [ ] Balance impact assessment
- [ ] Performance impact measurement
- [ ] Error scenarios covered
- [ ] UI interactions tested (if applicable)

### Bug Fix Testing
- [ ] Reproduction test case created
- [ ] Fix validates in test
- [ ] Regression tests added
- [ ] Related functionality verified
- [ ] Edge cases considered

## 🎯 Continuous Integration

### Automated Test Pipeline
```yaml
# Example CI configuration
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm test
    - run: npm run test:coverage
    - run: npm run test:balance
```

### Test Reports
```bash
# Generate detailed test reports
npm run test:coverage -- --coverageReporters=html
npm run test:coverage -- --coverageReporters=lcov

# Performance benchmarking
npm test -- --testNamePattern="Performance" --verbose > perf-report.txt
```

## 🚀 Advanced Testing Techniques

### Property-Based Testing
```javascript
test('training always increases or maintains stats', () => {
  // Generate random character states
  for (let i = 0; i < 100; i++) {
    const character = TestDataFactory.createTestCharacter({
      speed: Math.floor(Math.random() * 100),
      energy: Math.floor(Math.random() * 100)
    });
    
    const beforeStats = { ...character.stats };
    const result = trainingSystem.performTraining(character, 'speed');
    
    if (result.success) {
      expect(character.stats.speed).toBeGreaterThanOrEqual(beforeStats.speed);
    }
  }
});
```

### Snapshot Testing
```javascript
test('character summary format remains consistent', () => {
  const character = TestDataFactory.createTestCharacter();
  const summary = character.getSummary();
  
  expect(summary).toMatchSnapshot('character-summary');
});
```

### Mutation Testing
Test the tests themselves by introducing deliberate bugs:

```javascript
test('tests catch stat calculation errors', () => {
  // Temporarily break the calculation
  const original = Character.prototype.increaseStat;
  Character.prototype.increaseStat = function() { return 0; };
  
  const character = TestDataFactory.createTestCharacter();
  const result = trainingSystem.performTraining(character, 'speed');
  
  // This should fail, proving our tests work
  expect(result.statGains.speed).toBeGreaterThan(0);
  
  // Restore original function
  Character.prototype.increaseStat = original;
});
```

---

*Comprehensive testing ensures game stability, balance, and player satisfaction. Run tests frequently during development and always before releases.*