const sinon = require('sinon');

// Advanced testing utilities for spies, mocks, and stubs
class TestUtils {
  constructor() {
    this.spies = [];
    this.stubs = [];
    this.mocks = [];
  }

  // Clean up all spies, stubs, and mocks after each test
  cleanup() {
    this.spies.forEach(spy => spy.restore && spy.restore());
    this.stubs.forEach(stub => stub.restore && stub.restore());
    this.mocks.forEach(mock => mock.restore && mock.restore());
    
    this.spies = [];
    this.stubs = [];
    this.mocks = [];
    
    sinon.restore();
  }

  // Create and track spies
  createSpy(object, method) {
    const spy = sinon.spy(object, method);
    this.spies.push(spy);
    return spy;
  }

  // Create and track stubs
  createStub(object, method) {
    const stub = sinon.stub(object, method);
    this.stubs.push(stub);
    return stub;
  }

  // Create and track mocks
  createMock(object) {
    const mock = sinon.mock(object);
    this.mocks.push(mock);
    return mock;
  }

  // Stub Math.random for predictable test results
  stubMathRandom(returnValue = 0.5) {
    return this.createStub(Math, 'random').returns(returnValue);
  }

  // Stub console methods to suppress output during tests
  stubConsole() {
    return {
      log: this.createStub(console, 'log'),
      error: this.createStub(console, 'error'),
      warn: this.createStub(console, 'warn')
    };
  }

  // Create fake timer for time-based tests
  useFakeTimers() {
    const clock = sinon.useFakeTimers();
    return clock;
  }

  // Wait for promises to resolve in tests
  async flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
  }

  // Assert function calls with detailed error messages
  assertCalled(spy, expectedCallCount = 1, message = '') {
    expect(spy.callCount).toBe(expectedCallCount);
    if (message) {
      expect(spy.called).toBe(true);
    }
  }

  assertCalledWith(spy, ...expectedArgs) {
    expect(spy.calledWith(...expectedArgs)).toBe(true);
  }

  assertCalledOnce(spy) {
    expect(spy.calledOnce).toBe(true);
  }

  // Advanced matchers for testing
  expectToBeInRange(value, min, max) {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  }

  expectArrayContainsObject(array, expectedObject) {
    expect(array.some(item => 
      Object.keys(expectedObject).every(key => item[key] === expectedObject[key])
    )).toBe(true);
  }

  // Test async error handling
  async expectAsyncError(asyncFn, expectedErrorMessage) {
    await expect(asyncFn()).rejects.toThrow(expectedErrorMessage);
  }

  // Mock file system operations
  mockFileSystem() {
    const fs = require('fs');
    
    return {
      readFile: this.createStub(fs, 'readFile'),
      writeFile: this.createStub(fs, 'writeFile'),
      existsSync: this.createStub(fs, 'existsSync'),
      mkdirSync: this.createStub(fs, 'mkdirSync')
    };
  }

  // Test data validation helpers
  validateCharacterStats(character) {
    const stats = character.getCurrentStats();
    
    expect(stats.speed).toBeGreaterThanOrEqual(1);
    expect(stats.speed).toBeLessThanOrEqual(100);
    expect(stats.stamina).toBeGreaterThanOrEqual(1);
    expect(stats.stamina).toBeLessThanOrEqual(100);
    expect(stats.power).toBeGreaterThanOrEqual(1);
    expect(stats.power).toBeLessThanOrEqual(100);
    
    expect(character.condition.energy).toBeGreaterThanOrEqual(0);
    expect(character.condition.energy).toBeLessThanOrEqual(100);
    expect(character.friendship).toBeGreaterThanOrEqual(0);
    expect(character.friendship).toBeLessThanOrEqual(100);
  }

  validateTrainingResult(result) {
    expect(result).toHaveProperty('success');
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(result).toHaveProperty('trainingName');
      expect(result).toHaveProperty('energyChange');
      expect(result).toHaveProperty('messages');
      expect(Array.isArray(result.messages)).toBe(true);
    } else {
      expect(result).toHaveProperty('reason');
    }
  }

  validateRaceResult(raceResult) {
    expect(raceResult).toHaveProperty('raceType');
    expect(raceResult).toHaveProperty('results');
    expect(Array.isArray(raceResult.results)).toBe(true);
    expect(raceResult.results.length).toBeGreaterThan(0);
    
    raceResult.results.forEach(result => {
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('participant');
      expect(result).toHaveProperty('performance');
      expect(result.position).toBeGreaterThan(0);
    });
    
    // Check positions are consecutive
    const positions = raceResult.results.map(r => r.position).sort((a, b) => a - b);
    positions.forEach((pos, index) => {
      expect(pos).toBe(index + 1);
    });
  }

  // Stress testing utilities
  async runStressTest(testFunction, iterations = 100) {
    const results = {
      passed: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < iterations; i++) {
      try {
        await testFunction();
        results.passed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          iteration: i,
          error: error.message
        });
      }
    }

    return results;
  }

  // Load testing for race simulation
  async performanceTestRaceSimulation(participantCount, iterations = 50) {
    const { TestDataFactory, PerformanceTestUtils } = require('./mockData');
    const RaceSimulator = require('../../src/models/Race');
    
    const raceSimulator = new RaceSimulator();
    const participants = TestDataFactory.createTestRaceField(participantCount);
    
    const perfResults = PerformanceTestUtils.measureExecutionTime(() => {
      raceSimulator.simulateRace(participants, 'sprint');
    }, iterations);

    return {
      participantCount: participantCount,
      iterations: iterations,
      ...perfResults,
      memoryUsage: PerformanceTestUtils.measureMemoryUsage(() => {
        raceSimulator.simulateRace(participants, 'sprint');
      })
    };
  }

  // UI interaction testing
  simulateUserInput(mockElement, inputValue) {
    if (mockElement.submit) {
      mockElement.submit(inputValue);
    }
    if (mockElement.emit) {
      mockElement.emit('submit', inputValue);
    }
    return mockElement;
  }

  simulateButtonClick(mockButton) {
    if (mockButton.emit) {
      mockButton.emit('click');
    }
    return mockButton;
  }

  simulateKeyPress(mockScreen, key) {
    if (mockScreen.emit) {
      mockScreen.emit('keypress', null, { name: key });
    }
    return mockScreen;
  }

  // Error injection for robustness testing
  injectRandomErrors(targetObject, methods, errorRate = 0.1) {
    const originalMethods = {};
    
    methods.forEach(method => {
      if (typeof targetObject[method] === 'function') {
        originalMethods[method] = targetObject[method];
        
        targetObject[method] = (...args) => {
          if (Math.random() < errorRate) {
            throw new Error(`Injected error in ${method}`);
          }
          return originalMethods[method].apply(targetObject, args);
        };
      }
    });

    // Return cleanup function
    return () => {
      Object.keys(originalMethods).forEach(method => {
        targetObject[method] = originalMethods[method];
      });
    };
  }

  // Test data generation
  generateRandomTrainingSequence(length = 12) {
    const trainingTypes = ['speed', 'stamina', 'power', 'rest', 'social'];
    const sequence = [];
    
    for (let i = 0; i < length; i++) {
      sequence.push(trainingTypes[Math.floor(Math.random() * trainingTypes.length)]);
    }
    
    return sequence;
  }

  // Assertion helpers for complex objects
  expectObjectsToBeEquivalent(actual, expected, ignoredKeys = []) {
    const filteredActual = { ...actual };
    const filteredExpected = { ...expected };
    
    ignoredKeys.forEach(key => {
      delete filteredActual[key];
      delete filteredExpected[key];
    });
    
    expect(filteredActual).toEqual(filteredExpected);
  }

  // Snapshot testing helper
  expectMatchesSnapshot(data, snapshotName) {
    expect(data).toMatchSnapshot(snapshotName);
  }
}

// Global test utilities instance
const testUtils = new TestUtils();

// Setup and teardown helpers
const setupTest = () => {
  return testUtils;
};

const teardownTest = () => {
  testUtils.cleanup();
};

module.exports = {
  TestUtils,
  testUtils,
  setupTest,
  teardownTest
};