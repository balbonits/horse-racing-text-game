#!/usr/bin/env node

/**
 * COMPREHENSIVE REGRESSION TEST SUITE
 * Tests all major game systems, edge cases, and error conditions
 */

const GameApp = require('./src/GameApp');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveRegressionTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: [],
      details: {}
    };
  }

  async runAllTests() {
    console.log('🧪 COMPREHENSIVE REGRESSION TEST SUITE');
    console.log('=====================================\n');

    try {
      // Core Game Flow Tests
      await this.testGroup('Core Game Flow', [
        () => this.testGameInitialization(),
        () => this.testCharacterCreation(),
        () => this.testBasicTraining(),
        () => this.testRaceScheduling(),
        () => this.testCareerCompletion()
      ]);

      // Input Validation Tests  
      await this.testGroup('Input Validation', [
        () => this.testInvalidInputs(),
        () => this.testEdgeCaseInputs(),
        () => this.testStateTransitions(),
        () => this.testKeyboardHandling()
      ]);

      // Training System Tests
      await this.testGroup('Training System', [
        () => this.testAllTrainingTypes(),
        () => this.testEnergyManagement(),
        () => this.testStatProgression(),
        () => this.testMoodEffects(),
        () => this.testFriendshipBonus()
      ]);

      // Race System Tests
      await this.testGroup('Race System', [
        () => this.testRaceExecution(),
        () => this.testRaceTypes(),
        () => this.testRaceResults(),
        () => this.testPerformanceCalculation()
      ]);

      // Save/Load System Tests
      await this.testGroup('Save/Load System', [
        () => this.testSaveGame(),
        () => this.testLoadGame(),
        () => this.testCorruptedSaves(),
        () => this.testMultipleSaves()
      ]);

      // UI System Tests
      await this.testGroup('UI System', [
        () => this.testAllScreens(),
        () => this.testProgressBars(),
        () => this.testErrorMessages(),
        () => this.testHelpSystem()
      ]);

      // Edge Cases and Error Conditions
      await this.testGroup('Edge Cases', [
        () => this.testBoundaryConditions(),
        () => this.testResourceLimits(),
        () => this.testInvalidStates(),
        () => this.testDataCorruption()
      ]);

      // Performance Tests
      await this.testGroup('Performance', [
        () => this.testMemoryUsage(),
        () => this.testResponseTimes(),
        () => this.testLongSessions()
      ]);

      this.generateReport();

    } catch (error) {
      this.recordError(`Test suite crashed: ${error.message}`, error.stack);
      this.generateReport();
      throw error;
    }
  }

  async testGroup(groupName, tests) {
    console.log(`\n📂 ${groupName}`);
    console.log('─'.repeat(groupName.length + 2));

    this.testResults.details[groupName] = {
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const test of tests) {
      try {
        const testName = test.name.replace('bound ', '');
        console.log(`  🧪 ${testName}...`);
        
        await test();
        
        this.testResults.passed++;
        this.testResults.details[groupName].passed++;
        this.testResults.details[groupName].tests.push({
          name: testName,
          status: 'PASSED'
        });
        
        console.log(`  ✅ ${testName} passed`);
        
      } catch (error) {
        this.testResults.failed++;
        this.testResults.details[groupName].failed++;
        this.testResults.details[groupName].tests.push({
          name: test.name.replace('bound ', ''),
          status: 'FAILED',
          error: error.message
        });
        
        this.recordError(`${test.name}: ${error.message}`, error.stack);
        console.log(`  ❌ ${test.name.replace('bound ', '')} failed: ${error.message}`);
      }
    }
  }

  // =====================================
  // CORE GAME FLOW TESTS
  // =====================================

  async testGameInitialization() {
    const app = new GameApp();
    
    // Test initial state
    if (app.currentState !== 'main_menu') {
      throw new Error(`Expected initial state 'main_menu', got '${app.currentState}'`);
    }
    
    // Test game object exists
    if (!app.game) {
      throw new Error('Game object not initialized');
    }
    
    // Test UI object exists
    if (!app.ui) {
      throw new Error('UI object not initialized');
    }
    
    app.destroy();
  }

  async testCharacterCreation() {
    const app = new GameApp();
    
    // Navigate to character creation
    const navResult = app.handleMainMenuInput('1');
    if (!navResult.success || app.currentState !== 'character_creation') {
      throw new Error('Failed to navigate to character creation');
    }
    
    // Test valid character name
    const validNames = ['TestHorse', 'Speed123', 'Lightning', 'A', '12345678901234567890']; // max length
    
    for (const name of validNames) {
      // Clear any existing character
      app.game.character = null;
      app.characterNameBuffer = '';
      
      // Input name character by character
      for (const char of name) {
        const result = app.handleCharacterCreationInput(char);
        if (!result.success) {
          throw new Error(`Failed to input character '${char}' for name '${name}'`);
        }
      }
      
      // Submit name
      const submitResult = app.handleCharacterCreationInput('enter');
      if (!submitResult.success) {
        throw new Error(`Failed to create character with name '${name}': ${JSON.stringify(submitResult)}`);
      }
      
      // Verify character created
      if (!app.game.character || app.game.character.name !== name) {
        throw new Error(`Character not created properly for name '${name}'`);
      }
    }
    
    app.destroy();
  }

  async testBasicTraining() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    const trainingTypes = [
      { input: '1', type: 'speed' },
      { input: '2', type: 'stamina' },
      { input: '3', type: 'power' },
      { input: '4', type: 'rest' },
      { input: '5', type: 'social' }
    ];
    
    for (const training of trainingTypes) {
      const beforeStats = { ...app.game.character.getCurrentStats() };
      const beforeEnergy = app.game.character.condition.energy;
      const beforeTurn = app.game.character.career.turn;
      
      const result = app.handleTrainingInput(training.input);
      if (!result || !result.success) {
        throw new Error(`Training ${training.type} failed: ${JSON.stringify(result)}`);
      }
      
      const afterStats = { ...app.game.character.getCurrentStats() };
      const afterEnergy = app.game.character.condition.energy;
      const afterTurn = app.game.character.career.turn;
      
      // Verify turn advanced
      if (afterTurn !== beforeTurn + 1) {
        throw new Error(`Turn did not advance properly for ${training.type}`);
      }
      
      // Verify appropriate changes
      if (training.type === 'rest') {
        if (afterEnergy <= beforeEnergy) {
          throw new Error(`Rest did not restore energy: ${beforeEnergy} -> ${afterEnergy}`);
        }
      } else if (training.type !== 'social') {
        // Check if stat improved (with some tolerance for mood/friendship effects)
        if (afterStats[training.type] <= beforeStats[training.type] - 2) {
          this.testResults.warnings++;
          console.log(`    ⚠️ Warning: ${training.type} training may not have improved stat effectively`);
        }
      }
    }
    
    app.destroy();
  }

  async testRaceScheduling() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    const expectedRaces = [
      { turn: 4, type: 'sprint' },
      { turn: 8, type: 'mile' },
      { turn: 12, type: 'long' }
    ];
    
    let racesEncountered = 0;
    let turn = 1;
    
    while (turn <= 12 && app.currentState === 'training') {
      const result = app.handleTrainingInput('4'); // Always rest to avoid energy issues
      
      if (!result || !result.success) {
        throw new Error(`Training failed at turn ${turn}`);
      }
      
      // Check if race occurred
      if (app.currentState === 'race_results') {
        racesEncountered++;
        
        // Find expected race for this turn
        const expectedRace = expectedRaces.find(r => r.turn === turn);
        if (!expectedRace) {
          throw new Error(`Unexpected race at turn ${turn}`);
        }
        
        // Continue past race
        const continueResult = app.handleRaceResultsInput('enter');
        if (!continueResult || !continueResult.success) {
          throw new Error(`Failed to continue from race at turn ${turn}`);
        }
      }
      
      turn = app.game.character.career.turn;
      
      if (turn > 12) break;
    }
    
    if (racesEncountered !== 3) {
      throw new Error(`Expected 3 races, but encountered ${racesEncountered}`);
    }
    
    app.destroy();
  }

  async testCareerCompletion() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Fast-forward to turn 12 completion
    while (app.game.character.career.turn < 12 && app.currentState === 'training') {
      const result = app.handleTrainingInput('4'); // Rest only
      
      if (app.currentState === 'race_results') {
        app.handleRaceResultsInput('enter');
      }
      
      if (app.game.character.career.turn > 12) break;
    }
    
    // Do final training to trigger career completion
    if (app.currentState === 'training' && app.game.character.career.turn === 12) {
      const result = app.handleTrainingInput('2');
      if (!result || !result.success) {
        throw new Error('Final training failed');
      }
    }
    
    // Should transition to career complete
    if (app.currentState !== 'career_complete') {
      throw new Error(`Expected career_complete state, got ${app.currentState}`);
    }
    
    app.destroy();
  }

  // =====================================
  // INPUT VALIDATION TESTS
  // =====================================

  async testInvalidInputs() {
    const app = new GameApp();
    
    const invalidInputs = ['', ' ', 'invalid', '99', 'abc', '!@#', '\n', '\t'];
    
    // Test in main menu
    app.setState('main_menu');
    for (const input of invalidInputs) {
      const result = app.handleMainMenuInput(input);
      if (!result || result.success) {
        throw new Error(`Invalid input '${input}' should have failed in main menu`);
      }
    }
    
    // Test in training
    this.setupTestCharacter(app);
    for (const input of invalidInputs) {
      const result = app.handleTrainingInput(input);
      if (!result || result.success) {
        throw new Error(`Invalid input '${input}' should have failed in training`);
      }
    }
    
    app.destroy();
  }

  async testEdgeCaseInputs() {
    const app = new GameApp();
    
    // Test character name edge cases
    app.setState('character_creation');
    app.characterNameBuffer = '';
    
    const edgeCases = [
      { name: '', shouldFail: true, description: 'empty name' },
      { name: ' ', shouldFail: true, description: 'space only' },
      { name: '123456789012345678901', shouldFail: true, description: 'too long (21 chars)' },
      { name: 'Test!', shouldFail: true, description: 'special characters' },
      { name: 'Test Space', shouldFail: true, description: 'spaces in name' }
    ];
    
    for (const testCase of edgeCases) {
      app.characterNameBuffer = testCase.name;
      const result = app.handleCharacterCreationInput('enter');
      
      if (testCase.shouldFail && result.success) {
        throw new Error(`${testCase.description} should have failed but succeeded`);
      }
      
      if (!testCase.shouldFail && !result.success) {
        throw new Error(`${testCase.description} should have succeeded but failed`);
      }
    }
    
    app.destroy();
  }

  async testStateTransitions() {
    const app = new GameApp();
    
    const validTransitions = [
      { from: 'main_menu', to: 'character_creation', input: '1' },
      { from: 'main_menu', to: 'load_game', input: '2' },
      { from: 'main_menu', to: 'help', input: '3' },
      { from: 'character_creation', to: 'training', method: 'createValidCharacter' },
      { from: 'training', to: 'help', input: 'h' },
      { from: 'help', to: 'training', input: 'any' },
      { from: 'training', to: 'main_menu', input: 'q' }
    ];
    
    for (const transition of validTransitions) {
      app.setState(transition.from);
      
      if (transition.method === 'createValidCharacter') {
        // Special case for character creation
        app.characterNameBuffer = 'TestHorse';
        const result = app.handleCharacterCreationInput('enter');
        if (!result.success) {
          throw new Error(`Failed to create character for transition test`);
        }
      } else if (transition.input) {
        const method = `handle${transition.from.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('')}Input`;
        
        if (typeof app[method] === 'function') {
          app[method](transition.input);
        }
      }
      
      if (app.currentState !== transition.to) {
        throw new Error(`Transition ${transition.from} -> ${transition.to} failed. Got: ${app.currentState}`);
      }
    }
    
    app.destroy();
  }

  async testKeyboardHandling() {
    const app = new GameApp();
    
    // Test special keys
    const specialKeys = ['enter', 'q', 'h', 's', 'r'];
    
    for (const key of specialKeys) {
      // Test in different states
      const states = ['main_menu', 'training', 'help'];
      
      for (const state of states) {
        app.setState(state);
        if (state === 'training') {
          this.setupTestCharacter(app);
        }
        
        try {
          const result = app.handleKeyInput(key);
          // Should not crash - result can be success or failure
          if (result && typeof result.success !== 'boolean') {
            throw new Error(`Invalid result format from handleKeyInput: ${JSON.stringify(result)}`);
          }
        } catch (error) {
          throw new Error(`Key '${key}' crashed in state '${state}': ${error.message}`);
        }
      }
    }
    
    app.destroy();
  }

  // =====================================
  // TRAINING SYSTEM TESTS
  // =====================================

  async testAllTrainingTypes() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    const trainingData = [
      { type: 'speed', input: '1', energyCost: 15, statGain: true },
      { type: 'stamina', input: '2', energyCost: 10, statGain: true },
      { type: 'power', input: '3', energyCost: 15, statGain: true },
      { type: 'rest', input: '4', energyCost: 0, energyGain: true },
      { type: 'social', input: '5', energyCost: 5, friendshipGain: true }
    ];
    
    for (const training of trainingData) {
      // Reset character to consistent state
      app.game.character.condition.energy = 100;
      const beforeStats = { ...app.game.character.getCurrentStats() };
      const beforeEnergy = app.game.character.condition.energy;
      const beforeFriendship = app.game.character.friendship;
      
      const result = app.handleTrainingInput(training.input);
      
      if (!result || !result.success) {
        throw new Error(`${training.type} training failed: ${JSON.stringify(result)}`);
      }
      
      const afterStats = { ...app.game.character.getCurrentStats() };
      const afterEnergy = app.game.character.condition.energy;
      const afterFriendship = app.game.character.friendship;
      
      // Verify energy changes
      const expectedEnergyChange = training.energyGain ? 30 : -training.energyCost;
      const actualEnergyChange = afterEnergy - beforeEnergy;
      
      if (training.energyGain && actualEnergyChange <= 0) {
        throw new Error(`${training.type} should have gained energy`);
      }
      
      // Verify stat or friendship gains
      if (training.statGain && afterStats[training.type] <= beforeStats[training.type]) {
        this.testResults.warnings++;
        console.log(`    ⚠️ Warning: ${training.type} training did not improve stat`);
      }
      
      if (training.friendshipGain && afterFriendship <= beforeFriendship) {
        throw new Error(`Social training should have increased friendship`);
      }
    }
    
    app.destroy();
  }

  async testEnergyManagement() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test low energy scenarios
    app.game.character.condition.energy = 10; // Very low energy
    
    // High-cost training should fail or be rejected
    const lowEnergyResult = app.handleTrainingInput('1'); // Speed training (15 cost)
    
    // Should either fail or warn about low energy
    if (lowEnergyResult && lowEnergyResult.success && app.game.character.condition.energy < 0) {
      throw new Error('Training allowed character to go below 0 energy');
    }
    
    // Test energy limits
    app.game.character.condition.energy = 100;
    app.handleTrainingInput('4'); // Rest
    
    if (app.game.character.condition.energy > 100) {
      throw new Error('Energy exceeded maximum of 100');
    }
    
    // Test energy never goes negative
    app.game.character.condition.energy = 5;
    app.handleTrainingInput('3'); // Power training (15 cost)
    
    if (app.game.character.condition.energy < 0) {
      throw new Error('Energy went negative');
    }
    
    app.destroy();
  }

  async testStatProgression() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test stat boundaries
    const statTypes = ['speed', 'stamina', 'power'];
    
    for (const statType of statTypes) {
      // Set stat to near maximum
      app.game.character.stats[statType] = 98;
      
      const beforeStat = app.game.character.stats[statType];
      const trainingInput = statType === 'speed' ? '1' : statType === 'stamina' ? '2' : '3';
      
      app.handleTrainingInput(trainingInput);
      
      const afterStat = app.game.character.stats[statType];
      
      // Stat should not exceed 100
      if (afterStat > 100) {
        throw new Error(`${statType} exceeded maximum of 100: ${afterStat}`);
      }
      
      // Stat should not go below minimum
      if (afterStat < 1) {
        throw new Error(`${statType} went below minimum of 1: ${afterStat}`);
      }
    }
    
    app.destroy();
  }

  async testMoodEffects() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    const moods = ['Bad', 'Normal', 'Good', 'Great'];
    
    for (const mood of moods) {
      app.game.character.mood = mood;
      app.game.character.condition.energy = 100;
      
      const beforeStat = app.game.character.stats.speed;
      app.handleTrainingInput('1'); // Speed training
      const afterStat = app.game.character.stats.speed;
      
      const gain = afterStat - beforeStat;
      
      // Better moods should generally give better gains
      if (mood === 'Bad' && gain > 10) {
        this.testResults.warnings++;
        console.log(`    ⚠️ Warning: Bad mood gave unexpectedly high gain: ${gain}`);
      }
      
      if (mood === 'Great' && gain < 3) {
        this.testResults.warnings++;
        console.log(`    ⚠️ Warning: Great mood gave unexpectedly low gain: ${gain}`);
      }
    }
    
    app.destroy();
  }

  async testFriendshipBonus() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test friendship thresholds
    const friendshipLevels = [0, 50, 79, 80, 90, 100];
    const gains = [];
    
    for (const friendshipLevel of friendshipLevels) {
      app.game.character.friendship = friendshipLevel;
      app.game.character.condition.energy = 100;
      app.game.character.mood = 'Normal'; // Consistent mood
      
      const beforeStat = app.game.character.stats.speed;
      app.handleTrainingInput('1');
      const afterStat = app.game.character.stats.speed;
      
      gains.push({ friendship: friendshipLevel, gain: afterStat - beforeStat });
    }
    
    // Friendship 80+ should give higher gains than lower levels
    const lowFriendshipGain = gains.find(g => g.friendship < 80);
    const highFriendshipGain = gains.find(g => g.friendship >= 80);
    
    if (highFriendshipGain && lowFriendshipGain && 
        highFriendshipGain.gain <= lowFriendshipGain.gain) {
      this.testResults.warnings++;
      console.log(`    ⚠️ Warning: High friendship didn't improve training gains`);
    }
    
    app.destroy();
  }

  // =====================================
  // RACE SYSTEM TESTS
  // =====================================

  async testRaceExecution() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Manually trigger a race
    const raceResult = app.game.runRace();
    
    if (!raceResult || !raceResult.success) {
      throw new Error(`Race execution failed: ${JSON.stringify(raceResult)}`);
    }
    
    // Verify race result structure
    const requiredFields = ['playerPosition', 'raceTime', 'participants'];
    for (const field of requiredFields) {
      if (!(field in raceResult)) {
        throw new Error(`Race result missing field: ${field}`);
      }
    }
    
    // Verify position is valid (1-8)
    if (raceResult.playerPosition < 1 || raceResult.playerPosition > 8) {
      throw new Error(`Invalid race position: ${raceResult.playerPosition}`);
    }
    
    // Verify race time is reasonable
    if (!raceResult.raceTime || raceResult.raceTime.length === 0) {
      throw new Error('Race time not set');
    }
    
    app.destroy();
  }

  async testRaceTypes() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    const raceTypes = ['sprint', 'mile', 'long'];
    
    for (const raceType of raceTypes) {
      const raceResult = app.game.runRace(raceType);
      
      if (!raceResult || !raceResult.success) {
        throw new Error(`${raceType} race failed: ${JSON.stringify(raceResult)}`);
      }
      
      // Different race types should potentially give different results
      // (This is more of a smoke test - detailed validation would require more setup)
    }
    
    app.destroy();
  }

  async testRaceResults() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Run multiple races and verify results are stored
    const initialResults = app.game.getRaceResults().length;
    
    app.game.runRace('sprint');
    app.game.runRace('mile');
    
    const finalResults = app.game.getRaceResults().length;
    
    if (finalResults !== initialResults + 2) {
      throw new Error(`Race results not stored properly. Expected ${initialResults + 2}, got ${finalResults}`);
    }
    
    // Verify race results have required structure
    const results = app.game.getRaceResults();
    if (results.length > 0) {
      const lastResult = results[results.length - 1];
      if (!lastResult.playerPosition || !lastResult.participants) {
        throw new Error('Race result missing required fields');
      }
    }
    
    app.destroy();
  }

  async testPerformanceCalculation() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test with different stat combinations
    const testCases = [
      { speed: 100, stamina: 100, power: 100 },
      { speed: 1, stamina: 1, power: 1 },
      { speed: 50, stamina: 50, power: 50 },
      { speed: 100, stamina: 1, power: 1 },
      { speed: 1, stamina: 100, power: 1 }
    ];
    
    for (const stats of testCases) {
      app.game.character.stats = { ...stats };
      
      const raceResult = app.game.runRace('mile');
      
      if (!raceResult || !raceResult.success) {
        throw new Error(`Race failed for stats ${JSON.stringify(stats)}`);
      }
      
      // Higher stats should generally lead to better positions (though randomness exists)
      // This is a basic sanity check
      if (stats.speed === 100 && stats.stamina === 100 && stats.power === 100 && 
          raceResult.playerPosition > 6) {
        this.testResults.warnings++;
        console.log(`    ⚠️ Warning: Perfect stats resulted in poor position: ${raceResult.playerPosition}`);
      }
    }
    
    app.destroy();
  }

  // =====================================
  // SAVE/LOAD SYSTEM TESTS
  // =====================================

  async testSaveGame() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Advance game state
    app.handleTrainingInput('1'); // Speed training
    app.handleTrainingInput('2'); // Stamina training
    
    const beforeSave = {
      turn: app.game.character.career.turn,
      stats: { ...app.game.character.getCurrentStats() },
      energy: app.game.character.condition.energy
    };
    
    const saveResult = await app.saveGame();
    
    if (!saveResult || !saveResult.success) {
      throw new Error(`Save failed: ${JSON.stringify(saveResult)}`);
    }
    
    // Verify save file was created
    if (!saveResult.saveFile) {
      throw new Error('Save file path not returned');
    }
    
    try {
      const saveData = await fs.readFile(saveResult.saveFile, 'utf8');
      const parsedData = JSON.parse(saveData);
      
      if (!parsedData.character || !parsedData.character.name) {
        throw new Error('Save file missing character data');
      }
      
      // Clean up
      await fs.unlink(saveResult.saveFile);
      
    } catch (error) {
      throw new Error(`Save file validation failed: ${error.message}`);
    }
    
    app.destroy();
  }

  async testLoadGame() {
    const app = new GameApp();
    
    // First create a save
    this.setupTestCharacter(app);
    app.handleTrainingInput('1');
    
    const saveResult = await app.saveGame();
    if (!saveResult.success) {
      throw new Error('Failed to create test save');
    }
    
    const originalStats = { ...app.game.character.getCurrentStats() };
    const originalTurn = app.game.character.career.turn;
    
    // Create new app instance and load
    const loadApp = new GameApp();
    const loadResult = await loadApp.loadGame(saveResult.saveFile);
    
    if (!loadResult || !loadResult.success) {
      throw new Error(`Load failed: ${JSON.stringify(loadResult)}`);
    }
    
    // Verify loaded state matches saved state
    const loadedStats = { ...loadApp.game.character.getCurrentStats() };
    const loadedTurn = loadApp.game.character.career.turn;
    
    if (loadedTurn !== originalTurn) {
      throw new Error(`Turn mismatch: saved ${originalTurn}, loaded ${loadedTurn}`);
    }
    
    for (const stat in originalStats) {
      if (loadedStats[stat] !== originalStats[stat]) {
        throw new Error(`Stat mismatch for ${stat}: saved ${originalStats[stat]}, loaded ${loadedStats[stat]}`);
      }
    }
    
    // Clean up
    await fs.unlink(saveResult.saveFile);
    
    app.destroy();
    loadApp.destroy();
  }

  async testCorruptedSaves() {
    const app = new GameApp();
    
    // Create various corrupted save files
    const corruptedSaves = [
      '{"invalid": "json"', // Invalid JSON
      '{"character": null}', // Missing character
      '{"character": {"name": ""}}', // Invalid character data
      '', // Empty file
      'not json at all' // Not JSON
    ];
    
    for (let i = 0; i < corruptedSaves.length; i++) {
      const savePath = path.join(__dirname, `corrupted_save_${i}.json`);
      
      try {
        await fs.writeFile(savePath, corruptedSaves[i]);
        
        const loadResult = await app.loadGame(savePath);
        
        // Should fail gracefully
        if (loadResult && loadResult.success) {
          throw new Error(`Corrupted save ${i} should have failed to load`);
        }
        
        await fs.unlink(savePath);
        
      } catch (error) {
        // Clean up on error
        try {
          await fs.unlink(savePath);
        } catch {}
        
        if (error.message.includes('should have failed')) {
          throw error;
        }
        // Other errors are expected for corrupted saves
      }
    }
    
    app.destroy();
  }

  async testMultipleSaves() {
    const app = new GameApp();
    
    const saveFiles = [];
    
    try {
      // Create multiple saves with different characters
      const characters = ['Horse1', 'Horse2', 'Horse3'];
      
      for (const charName of characters) {
        app.game.startNewGame(charName);
        app.handleTrainingInput('1'); // Some training
        
        const saveResult = await app.saveGame();
        if (!saveResult.success) {
          throw new Error(`Failed to save character ${charName}`);
        }
        
        saveFiles.push(saveResult.saveFile);
      }
      
      // Verify all saves exist and are different
      for (let i = 0; i < saveFiles.length; i++) {
        const saveData = await fs.readFile(saveFiles[i], 'utf8');
        const parsed = JSON.parse(saveData);
        
        if (parsed.character.name !== characters[i]) {
          throw new Error(`Save ${i} has wrong character name`);
        }
      }
      
      // Test loading each save
      for (let i = 0; i < saveFiles.length; i++) {
        const loadResult = await app.loadGame(saveFiles[i]);
        if (!loadResult.success) {
          throw new Error(`Failed to load save ${i}`);
        }
        
        if (app.game.character.name !== characters[i]) {
          throw new Error(`Loaded wrong character from save ${i}`);
        }
      }
      
    } finally {
      // Clean up all save files
      for (const saveFile of saveFiles) {
        try {
          await fs.unlink(saveFile);
        } catch {}
      }
    }
    
    app.destroy();
  }

  // =====================================
  // UI SYSTEM TESTS
  // =====================================

  async testAllScreens() {
    const app = new GameApp();
    
    const states = [
      'main_menu',
      'character_creation', 
      'load_game',
      'training',
      'race_results',
      'help',
      'career_complete'
    ];
    
    for (const state of states) {
      app.setState(state);
      
      if (state === 'training' || state === 'race_results' || state === 'career_complete') {
        this.setupTestCharacter(app);
      }
      
      if (state === 'race_results') {
        // Need to have a race result
        app.game.runRace();
      }
      
      // Try to render the screen - should not crash
      try {
        app.render();
      } catch (error) {
        throw new Error(`Rendering ${state} crashed: ${error.message}`);
      }
    }
    
    app.destroy();
  }

  async testProgressBars() {
    const app = new GameApp();
    
    // Test progress bar generation with edge values
    const testValues = [0, 1, 50, 99, 100, 150]; // Including out-of-range
    
    for (const value of testValues) {
      try {
        const bar = app.ui.makeBar(value, 100, 10);
        
        if (typeof bar !== 'string') {
          throw new Error(`Progress bar should return string, got ${typeof bar}`);
        }
        
        if (bar.length !== 12) { // [##########] = 12 characters
          throw new Error(`Progress bar wrong length: ${bar.length} (${bar})`);
        }
        
        // Should contain brackets
        if (!bar.startsWith('[') || !bar.endsWith(']')) {
          throw new Error(`Progress bar missing brackets: ${bar}`);
        }
        
      } catch (error) {
        throw new Error(`Progress bar failed for value ${value}: ${error.message}`);
      }
    }
    
    app.destroy();
  }

  async testErrorMessages() {
    const app = new GameApp();
    
    // Test various error conditions
    const errorConditions = [
      () => app.handleMainMenuInput('invalid'),
      () => app.handleTrainingInput('invalid'),
      () => {
        app.setState('character_creation');
        app.characterNameBuffer = ''; 
        return app.handleCharacterCreationInput('enter');
      }
    ];
    
    for (const errorCondition of errorConditions) {
      try {
        const result = errorCondition();
        
        // Should return error result, not crash
        if (!result || typeof result.success !== 'boolean') {
          throw new Error('Error condition should return valid result object');
        }
        
        if (result.success) {
          this.testResults.warnings++;
          console.log(`    ⚠️ Warning: Error condition succeeded when it should have failed`);
        }
        
      } catch (error) {
        throw new Error(`Error handling crashed: ${error.message}`);
      }
    }
    
    app.destroy();
  }

  async testHelpSystem() {
    const app = new GameApp();
    
    // Test help navigation from different states
    const states = ['main_menu', 'training'];
    
    for (const state of states) {
      app.setState(state);
      if (state === 'training') {
        this.setupTestCharacter(app);
      }
      
      // Navigate to help
      const helpResult = app.handleKeyInput('h');
      
      if (app.currentState !== 'help') {
        throw new Error(`Help navigation failed from ${state} state`);
      }
      
      // Try to return from help
      const returnResult = app.handleHelpInput('any');
      
      // Should return to training (or main menu if no character)
      if (app.currentState !== 'training' && app.currentState !== 'main_menu') {
        throw new Error(`Help return failed, got state: ${app.currentState}`);
      }
    }
    
    app.destroy();
  }

  // =====================================
  // EDGE CASES AND ERROR CONDITIONS
  // =====================================

  async testBoundaryConditions() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test extreme stat values
    const extremeValues = [-1, 0, 101, 1000, -1000];
    
    for (const value of extremeValues) {
      app.game.character.stats.speed = value;
      
      try {
        const result = app.handleTrainingInput('1');
        // Should handle gracefully
        
        // Verify stat is within bounds after training
        const finalStat = app.game.character.stats.speed;
        if (finalStat < 1 || finalStat > 100) {
          throw new Error(`Stat not bounded properly: ${finalStat}`);
        }
        
      } catch (error) {
        throw new Error(`Extreme stat value ${value} caused crash: ${error.message}`);
      }
    }
    
    app.destroy();
  }

  async testResourceLimits() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test very long training sessions
    for (let i = 0; i < 50; i++) {
      try {
        if (app.currentState === 'training') {
          app.handleTrainingInput('4'); // Rest
        } else if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        } else if (app.currentState === 'career_complete') {
          break;
        }
      } catch (error) {
        throw new Error(`Long session crashed at iteration ${i}: ${error.message}`);
      }
    }
    
    app.destroy();
  }

  async testInvalidStates() {
    const app = new GameApp();
    
    // Test invalid state transitions
    try {
      app.setState('invalid_state');
      throw new Error('Invalid state should have been rejected');
    } catch (error) {
      if (!error.message.includes('Invalid state')) {
        throw error;
      }
    }
    
    // Test operations in wrong state
    app.setState('main_menu');
    const result = app.handleTrainingInput('1');
    
    // Should fail gracefully
    if (result && result.success) {
      throw new Error('Training input should fail in main menu state');
    }
    
    app.destroy();
  }

  async testDataCorruption() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Test null/undefined character
    const originalCharacter = app.game.character;
    app.game.character = null;
    
    try {
      const result = app.handleTrainingInput('1');
      // Should fail gracefully
      if (result && result.success) {
        throw new Error('Training should fail with null character');
      }
    } finally {
      app.game.character = originalCharacter;
    }
    
    // Test corrupted character data
    app.game.character.stats = null;
    
    try {
      const result = app.handleTrainingInput('1');
      // Should handle gracefully
    } catch (error) {
      throw new Error(`Corrupted character data caused crash: ${error.message}`);
    }
    
    app.destroy();
  }

  // =====================================
  // PERFORMANCE TESTS
  // =====================================

  async testMemoryUsage() {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create and destroy many app instances
    for (let i = 0; i < 10; i++) {
      const app = new GameApp();
      this.setupTestCharacter(app);
      
      // Do some operations
      for (let j = 0; j < 5; j++) {
        app.handleTrainingInput('4');
        if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        }
      }
      
      app.destroy();
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    if (memoryIncrease > 50 * 1024 * 1024) {
      this.testResults.warnings++;
      console.log(`    ⚠️ Warning: Memory usage increased by ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    }
  }

  async testResponseTimes() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    const operations = [
      () => app.handleTrainingInput('1'),
      () => app.handleTrainingInput('2'),
      () => app.handleTrainingInput('3'),
      () => app.handleTrainingInput('4'),
      () => app.render()
    ];
    
    for (const operation of operations) {
      const start = Date.now();
      
      try {
        operation();
      } catch (error) {
        // Ignore operation errors, just test timing
      }
      
      const duration = Date.now() - start;
      
      // Operations should be fast (< 100ms)
      if (duration > 100) {
        this.testResults.warnings++;
        console.log(`    ⚠️ Warning: Operation took ${duration}ms`);
      }
    }
    
    app.destroy();
  }

  async testLongSessions() {
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    // Simulate a very long gaming session
    let operations = 0;
    const maxOperations = 200;
    
    const startTime = Date.now();
    
    while (operations < maxOperations) {
      try {
        if (app.currentState === 'training') {
          app.handleTrainingInput('4'); // Rest
        } else if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        } else if (app.currentState === 'career_complete') {
          // Start new career
          app.setState('main_menu');
          app.handleMainMenuInput('1');
          this.setupQuickCharacter(app);
        }
        
        operations++;
        
      } catch (error) {
        throw new Error(`Long session failed at operation ${operations}: ${error.message}`);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`    ℹ️ Completed ${operations} operations in ${duration}ms`);
    
    app.destroy();
  }

  // =====================================
  // HELPER METHODS
  // =====================================

  setupTestCharacter(app) {
    const result = app.game.startNewGame('TestHorse');
    if (!result.success) {
      throw new Error('Failed to setup test character');
    }
    app.setState('training');
  }

  setupQuickCharacter(app) {
    app.setState('character_creation');
    app.characterNameBuffer = 'QuickHorse';
    app.handleCharacterCreationInput('enter');
  }

  recordError(message, stack = null) {
    this.testResults.errors.push({
      message,
      stack: stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    console.log('\n🏆 COMPREHENSIVE TEST RESULTS');
    console.log('============================');
    
    const total = this.testResults.passed + this.testResults.failed;
    const passRate = total > 0 ? Math.round((this.testResults.passed / total) * 100) : 0;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${this.testResults.passed} ✅`);
    console.log(`Failed: ${this.testResults.failed} ❌`);
    console.log(`Warnings: ${this.testResults.warnings} ⚠️`);
    console.log(`Pass Rate: ${passRate}%`);
    
    console.log('\n📊 TEST GROUP RESULTS:');
    for (const [groupName, groupResults] of Object.entries(this.testResults.details)) {
      const groupTotal = groupResults.passed + groupResults.failed;
      const groupPassRate = groupTotal > 0 ? Math.round((groupResults.passed / groupTotal) * 100) : 0;
      
      console.log(`  ${groupName}: ${groupResults.passed}/${groupTotal} (${groupPassRate}%)`);
      
      // Show failed tests
      for (const test of groupResults.tests) {
        if (test.status === 'FAILED') {
          console.log(`    ❌ ${test.name}: ${test.error}`);
        }
      }
    }
    
    if (this.testResults.errors.length > 0) {
      console.log('\n🚨 ERROR DETAILS:');
      this.testResults.errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
      });
      
      if (this.testResults.errors.length > 5) {
        console.log(`  ... and ${this.testResults.errors.length - 5} more errors`);
      }
    }
    
    const overall = this.testResults.failed === 0 ? 'PASSED ✅' : 'FAILED ❌';
    console.log(`\n🎯 OVERALL RESULT: ${overall}`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! The game is stable and ready for production.');
    } else {
      console.log('\n🔧 Some tests failed. Review the errors above and fix the issues.');
    }
    
    return this.testResults.failed === 0;
  }
}

// Run the comprehensive test suite
async function main() {
  const tester = new ComprehensiveRegressionTester();
  
  try {
    await tester.runAllTests();
    process.exit(tester.testResults.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveRegressionTester;