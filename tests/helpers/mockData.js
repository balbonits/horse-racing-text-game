const Character = require('../../src/models/Character');

// Test data factories
const TestDataFactory = {
  // Create a test character with customizable options
  createTestCharacter(overrides = {}) {
    const defaults = {
      id: 'test-horse-1',
      name: 'Test Horse',
      speed: 50,
      stamina: 50,  
      power: 50,
      energy: 100,
      form: 'Good Form',
      health: 100,
      speedGrowth: 'B',
      staminaGrowth: 'B', 
      powerGrowth: 'B',
      bond: 50
    };

    return new Character(overrides.name || defaults.name, {
      ...defaults,
      ...overrides
    });
  },

  // Create multiple test characters for race simulation
  createTestRaceField(count = 8, playerIndex = 0) {
    const participants = [];
    
    for (let i = 0; i < count; i++) {
      const isPlayer = i === playerIndex;
      const character = this.createTestCharacter({
        name: isPlayer ? 'Player Horse' : `AI Horse ${i}`,
        speed: 40 + Math.random() * 40, // 40-80 range
        stamina: 40 + Math.random() * 40,
        power: 40 + Math.random() * 40
      });

      participants.push({
        character: character,
        isPlayer: isPlayer,
        isAI: !isPlayer
      });
    }

    return participants;
  },

  // Create character with specific stat distribution
  createCharacterWithStats(statDistribution) {
    const { speed, stamina, power } = statDistribution;
    return this.createTestCharacter({ speed, stamina, power });
  },

  // Create character at specific career stage
  createCharacterAtTurn(turn, overrides = {}) {
    const character = this.createTestCharacter(overrides);
    character.career.turn = turn;
    return character;
  },

  // Create character with low energy for testing rest mechanics
  createTiredCharacter() {
    return this.createTestCharacter({
      energy: 20,
      form: 'Poor Form'
    });
  },

  // Create character with high bond for testing bonuses
  createHighFriendshipCharacter() {
    return this.createTestCharacter({
      bond: 85,
      form: 'Peak Form'
    });
  },

  // Create character with maxed stats
  createMaxStatCharacter() {
    return this.createTestCharacter({
      speed: 100,
      stamina: 100,
      power: 100,
      energy: 100,
      bond: 100,
      form: 'Peak Form'
    });
  },

  // Create race result mock data
  createMockRaceResult(playerPosition = 1, participantCount = 8) {
    const participants = this.createTestRaceField(participantCount);
    
    const results = participants.map((participant, index) => ({
      position: index + 1,
      participant: participant,
      character: participant.character.getSummary(),
      performance: {
        performance: 80 - (index * 5), // Decreasing performance
        time: 72.0 + (index * 0.5), // Increasing time
        staminaFactor: 0.9,
        formMultiplier: 1.0,
        randomFactor: 0.95
      }
    }));

    // Adjust player position
    if (playerPosition !== 1) {
      const playerResult = results[0];
      const targetResult = results[playerPosition - 1];
      
      // Swap positions
      results[0] = { ...targetResult, position: playerPosition };
      results[playerPosition - 1] = { ...playerResult, position: 1 };
    }

    return {
      raceType: 'Sprint Race',
      distance: 1200,
      surface: 'turf',
      trackCondition: 'firm',
      results: results,
      winner: results.find(r => r.position === 1),
      playerResult: results.find(r => r.participant.isPlayer),
      commentary: ['Test race commentary']
    };
  }
};

// Common test scenarios
const TestScenarios = {
  // Scenario: New player just starting
  newPlayer() {
    return {
      character: TestDataFactory.createTestCharacter(),
      expectedBehavior: 'Should be able to train and have energy'
    };
  },

  // Scenario: Player near end of career
  lateCareer() {
    return {
      character: TestDataFactory.createCharacterAtTurn(11, {
        speed: 85,
        stamina: 80,
        power: 75,
        bond: 90
      }),
      expectedBehavior: 'Should have high stats and be ready for final race'
    };
  },

  // Scenario: Exhausted player needs rest
  exhaustedPlayer() {
    return {
      character: TestDataFactory.createTiredCharacter(),
      expectedBehavior: 'Should recommend rest training'
    };
  },

  // Scenario: Balanced training progression
  balancedProgression() {
    const character = TestDataFactory.createTestCharacter();
    return {
      character: character,
      trainingPlan: ['speed', 'stamina', 'power', 'rest'].repeat(3),
      expectedOutcome: 'Should have balanced stat growth'
    };
  },

  // Scenario: Speed-focused training
  speedSpecialist() {
    const character = TestDataFactory.createTestCharacter();
    return {
      character: character,
      trainingPlan: ['speed', 'speed', 'social', 'rest'].repeat(3),
      expectedOutcome: 'Should excel in sprint races'
    };
  }
};

// Mock blessed screen for UI testing
const MockBlessedScreen = {
  createMockScreen() {
    const mockElements = new Map();
    
    const mockScreen = {
      append: jest.fn((element) => {
        mockElements.set(element.name || 'unnamed', element);
      }),
      remove: jest.fn((element) => {
        mockElements.delete(element.name || 'unnamed');
      }),
      render: jest.fn(),
      destroy: jest.fn(),
      key: jest.fn(),
      on: jest.fn(),
      elements: mockElements,
      width: 100,
      height: 30
    };

    return mockScreen;
  },

  createMockBox(options = {}) {
    return {
      setContent: jest.fn(),
      append: jest.fn(),
      remove: jest.fn(), 
      on: jest.fn(),
      focus: jest.fn(),
      children: [],
      ...options
    };
  },

  createMockTextbox(options = {}) {
    return {
      ...this.createMockBox(options),
      focus: jest.fn(),
      submit: jest.fn(),
      getValue: jest.fn(() => 'Test Input'),
      setValue: jest.fn()
    };
  }
};

// Error simulation utilities
const ErrorSimulation = {
  // Simulate save/load failures
  createSaveError() {
    return new Error('Failed to save game data');
  },

  createLoadError() {
    return new Error('Corrupted save data');
  },

  // Simulate invalid training scenarios
  createInvalidTrainingError() {
    return new Error('Invalid training type');
  },

  // Simulate race simulation failures
  createRaceSimulationError() {
    return new Error('Race simulation failed');
  }
};

// Performance testing utilities  
const PerformanceTestUtils = {
  // Measure function execution time
  measureExecutionTime(fn, iterations = 1000) {
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    const end = process.hrtime.bigint();
    const totalTime = Number(end - start) / 1000000; // Convert to milliseconds
    
    return {
      totalTime: totalTime,
      averageTime: totalTime / iterations,
      iterations: iterations
    };
  },

  // Memory usage testing
  measureMemoryUsage(fn) {
    const beforeMemory = process.memoryUsage();
    fn();
    const afterMemory = process.memoryUsage();
    
    return {
      heapUsedDiff: afterMemory.heapUsed - beforeMemory.heapUsed,
      heapTotalDiff: afterMemory.heapTotal - beforeMemory.heapTotal,
      rssDiff: afterMemory.rss - beforeMemory.rss
    };
  },

  // Stress test with many iterations
  stressTest(fn, maxIterations = 10000) {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < maxIterations; i++) {
      try {
        fn();
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(error.message);
      }
    }

    return results;
  }
};

module.exports = {
  TestDataFactory,
  TestScenarios,  
  MockBlessedScreen,
  ErrorSimulation,
  PerformanceTestUtils
};