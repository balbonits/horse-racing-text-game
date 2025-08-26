#!/usr/bin/env node

/**
 * USER EXPERIENCE & PLAYABILITY TEST
 * Tests the game from a real human player's perspective
 * Validates that the game is actually playable by humans, not just AI
 */

const GameApp = require('./src/GameApp');
const readline = require('readline');

class UXPlayabilityTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      uxIssues: [],
      criticalIssues: [],
      playabilityScore: 0
    };
  }

  async runUXTests() {
    console.log('🎮 USER EXPERIENCE & PLAYABILITY TESTS');
    console.log('====================================\n');

    try {
      // Core UX Tests
      await this.testGameAccessibility();
      await this.testFirstTimePlayerExperience();
      await this.testInputClarity();
      await this.testFeedbackCycles();
      await this.testProgressFeeling();
      await this.testErrorHandling();
      await this.testSessionFlow();
      await this.testGamePacing();
      
      // Human Interaction Tests
      await this.testTypingExperience();
      await this.testDecisionMaking();
      await this.testLearningCurve();
      
      // Engagement Tests
      await this.testMotivation();
      await this.testReplayability();
      await this.testSatisfaction();

      this.generateUXReport();

    } catch (error) {
      this.recordCriticalIssue(`UX test suite crashed: ${error.message}`, error.stack);
      this.generateUXReport();
      throw error;
    }
  }

  // =====================================
  // ACCESSIBILITY & FIRST IMPRESSION TESTS
  // =====================================

  async testGameAccessibility() {
    console.log('🔍 Testing Game Accessibility...');
    
    const app = new GameApp();
    
    try {
      // Test 1: Can a user easily understand how to start?
      app.setState('main_menu');
      app.render();
      
      // Check if main menu is clear
      const menuText = this.captureUIOutput(app);
      if (!menuText.includes('1') || !menuText.includes('New') || !menuText.includes('Career')) {
        this.recordUXIssue('Main menu not clear - users may not know how to start a new game');
      }

      // Test 2: Are instructions visible?
      if (!menuText.includes('Enter') && !menuText.includes('choice') && !menuText.includes('select')) {
        this.recordUXIssue('Main menu lacks clear instructions on how to make a selection');
      }

      // Test 3: Is quit option obvious?
      if (!menuText.includes('Q') && !menuText.includes('quit') && !menuText.includes('Quit')) {
        this.recordUXIssue('No obvious way to quit the game');
      }

      this.testResults.passed++;
      console.log('✅ Game accessibility check passed');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Game accessibility test failed', error.message);
      console.log('❌ Game accessibility check failed');
    }
    
    app.destroy();
  }

  async testFirstTimePlayerExperience() {
    console.log('🆕 Testing First Time Player Experience...');
    
    const app = new GameApp();
    
    try {
      // Simulate a new player's journey
      app.setState('main_menu');
      
      // Test: Can player navigate to character creation easily?
      const navResult = app.handleMainMenuInput('1');
      if (!navResult.success) {
        this.recordCriticalIssue('New player cannot start a new game');
      }
      
      // Test: Is character creation self-explanatory?
      const creationText = this.captureUIOutput(app);
      
      if (!creationText.includes('name') && !creationText.includes('Name')) {
        this.recordUXIssue('Character creation screen unclear about naming');
      }
      
      if (!creationText.includes('Enter') && !creationText.includes('type')) {
        this.recordUXIssue('Character creation lacks typing instructions');
      }
      
      // Test: Character creation with typical name
      const testName = 'Secretariat';
      for (const char of testName) {
        const result = app.handleCharacterCreationInput(char);
        if (!result.success) {
          this.recordCriticalIssue(`Character creation fails on normal character '${char}'`);
        }
      }
      
      const submitResult = app.handleCharacterCreationInput('enter');
      if (!submitResult.success) {
        this.recordCriticalIssue('Character creation submission fails');
      }
      
      // Test: Does player understand they're now in the game?
      if (app.currentState !== 'training') {
        this.recordCriticalIssue('Player not taken to main game after character creation');
      }
      
      const gameText = this.captureUIOutput(app);
      if (!gameText.includes('TRAINING') && !gameText.includes('Training')) {
        this.recordUXIssue('Game state not clear to new player');
      }

      this.testResults.passed++;
      console.log('✅ First time player experience acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('First time player experience test failed', error.message);
      console.log('❌ First time player experience has issues');
    }
    
    app.destroy();
  }

  async testInputClarity() {
    console.log('⌨️ Testing Input Clarity...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      // Test: Are training options clearly numbered?
      const trainingText = this.captureUIOutput(app);
      
      const requiredOptions = ['1', '2', '3', '4', '5'];
      const missingOptions = requiredOptions.filter(opt => !trainingText.includes(opt));
      
      if (missingOptions.length > 0) {
        this.recordUXIssue(`Training options missing numbers: ${missingOptions.join(', ')}`);
      }
      
      // Test: Are training types clearly described?
      const requiredDescriptions = ['Speed', 'Stamina', 'Power', 'Rest'];
      const missingDescriptions = requiredDescriptions.filter(desc => 
        !trainingText.toLowerCase().includes(desc.toLowerCase())
      );
      
      if (missingDescriptions.length > 0) {
        this.recordUXIssue(`Training descriptions unclear: ${missingDescriptions.join(', ')}`);
      }
      
      // Test: Are energy costs visible?
      if (!trainingText.includes('Cost') && !trainingText.includes('energy')) {
        this.recordUXIssue('Energy costs not visible to player');
      }
      
      // Test: Are input instructions clear?
      if (!trainingText.includes('Enter') && !trainingText.includes('choice')) {
        this.recordUXIssue('No clear instructions on how to select training');
      }

      this.testResults.passed++;
      console.log('✅ Input clarity acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Input clarity test failed', error.message);
      console.log('❌ Input clarity has issues');
    }
    
    app.destroy();
  }

  // =====================================
  // FEEDBACK & PROGRESSION TESTS
  // =====================================

  async testFeedbackCycles() {
    console.log('🔄 Testing Feedback Cycles...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      const beforeStats = { ...app.game.character.getCurrentStats() };
      const beforeEnergy = app.game.character.condition.energy;
      
      // Test: Does player get immediate feedback after training?
      const result = app.handleTrainingInput('1'); // Speed training
      if (!result || !result.success) {
        this.recordCriticalIssue('No feedback when training succeeds');
      }
      
      const afterStats = { ...app.game.character.getCurrentStats() };
      const afterEnergy = app.game.character.condition.energy;
      
      // Test: Can player see stat changes?
      if (afterStats.speed === beforeStats.speed) {
        this.recordUXIssue('Player cannot see immediate stat improvements');
      }
      
      // Test: Can player see energy changes?
      if (afterEnergy === beforeEnergy) {
        this.recordUXIssue('Player cannot see energy consumption');
      }
      
      // Test: Is turn progression visible?
      const currentText = this.captureUIOutput(app);
      if (!currentText.includes('Turn') && !currentText.includes('turn')) {
        this.recordUXIssue('Player cannot see turn progression');
      }
      
      // Test: Does player get clear success messages?
      // This would be checked via the UI status or message system
      
      this.testResults.passed++;
      console.log('✅ Feedback cycles working');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Feedback cycles test failed', error.message);
      console.log('❌ Feedback cycles have issues');
    }
    
    app.destroy();
  }

  async testProgressFeeling() {
    console.log('📈 Testing Progress Feeling...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      // Simulate several turns of training
      let progressMade = false;
      
      const initialStats = { ...app.game.character.getCurrentStats() };
      
      for (let i = 0; i < 5; i++) {
        app.handleTrainingInput('1'); // Speed training
        
        if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        }
      }
      
      const finalStats = { ...app.game.character.getCurrentStats() };
      
      // Test: Did stats actually improve meaningfully?
      const speedGain = finalStats.speed - initialStats.speed;
      if (speedGain < 5) {
        this.recordUXIssue('Progress feels too slow - minimal stat gains');
      }
      
      if (speedGain > 30) {
        this.recordUXIssue('Progress feels too fast - may lack challenge');
      }
      
      // Test: Are progress bars meaningful?
      const currentText = this.captureUIOutput(app);
      const progressBarMatches = currentText.match(/\[#+\.+\]/g);
      
      if (!progressBarMatches || progressBarMatches.length < 3) {
        this.recordUXIssue('Progress bars missing or not visible');
      }
      
      // Test: Can player see overall career progress?
      if (!currentText.includes('/12') && !currentText.includes('12')) {
        this.recordUXIssue('Player cannot see overall career progress');
      }

      this.testResults.passed++;
      console.log('✅ Progress feeling acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Progress feeling test failed', error.message);
      console.log('❌ Progress feeling has issues');
    }
    
    app.destroy();
  }

  // =====================================
  // ERROR HANDLING & RECOVERY TESTS
  // =====================================

  async testErrorHandling() {
    console.log('🛠️ Testing Error Handling...');
    
    const app = new GameApp();
    
    try {
      // Test: Invalid menu input
      const invalidMenuResult = app.handleMainMenuInput('99');
      
      if (invalidMenuResult && invalidMenuResult.success) {
        this.recordCriticalIssue('Game accepts invalid menu input');
      }
      
      // Player should still be in main menu after invalid input
      if (app.currentState !== 'main_menu') {
        this.recordCriticalIssue('Invalid input changes game state unexpectedly');
      }
      
      // Test: Invalid character name
      app.setState('character_creation');
      app.characterNameBuffer = '';
      const invalidNameResult = app.handleCharacterCreationInput('enter');
      
      if (invalidNameResult && invalidNameResult.success) {
        this.recordCriticalIssue('Game accepts empty character name');
      }
      
      // Player should still be in character creation
      if (app.currentState !== 'character_creation') {
        this.recordUXIssue('Failed character creation kicks player out instead of allowing retry');
      }
      
      // Test: Invalid training input
      this.setupTestCharacter(app);
      const invalidTrainingResult = app.handleTrainingInput('99');
      
      if (invalidTrainingResult && invalidTrainingResult.success) {
        this.recordCriticalIssue('Game accepts invalid training input');
      }
      
      // Test: Low energy training
      app.game.character.condition.energy = 5;
      const lowEnergyResult = app.handleTrainingInput('1'); // Expensive training
      
      // Should either fail gracefully or warn the player
      if (lowEnergyResult && lowEnergyResult.success && app.game.character.condition.energy < 0) {
        this.recordCriticalIssue('Game allows negative energy');
      }

      this.testResults.passed++;
      console.log('✅ Error handling acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Error handling test failed', error.message);
      console.log('❌ Error handling has issues');
    }
    
    app.destroy();
  }

  // =====================================
  // SESSION FLOW & PACING TESTS
  // =====================================

  async testSessionFlow() {
    console.log('🎯 Testing Session Flow...');
    
    const app = new GameApp();
    
    try {
      // Test: Complete session from start to finish
      const startTime = Date.now();
      
      // Start new game
      app.handleMainMenuInput('1');
      
      // Create character
      const characterName = 'FlowTest';
      for (const char of characterName) {
        app.handleCharacterCreationInput(char);
      }
      app.handleCharacterCreationInput('enter');
      
      // Play through several turns
      let turns = 0;
      const maxTurns = 15; // Safety limit
      
      while (turns < maxTurns && app.currentState !== 'career_complete') {
        if (app.currentState === 'training') {
          app.handleTrainingInput('4'); // Rest (safe choice)
        } else if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        } else {
          break; // Unexpected state
        }
        turns++;
      }
      
      const endTime = Date.now();
      const sessionDuration = endTime - startTime;
      
      // Test: Session completes in reasonable time
      if (sessionDuration > 10000) { // 10 seconds
        this.recordUXIssue(`Session takes too long: ${sessionDuration}ms`);
      }
      
      // Test: Session reaches natural conclusion
      if (app.currentState !== 'career_complete' && turns >= maxTurns) {
        this.recordCriticalIssue('Session does not reach natural conclusion');
      }
      
      // Test: Player can continue after completion
      if (app.currentState === 'career_complete') {
        const continueResult = app.handleCareerCompleteInput('enter');
        if (!continueResult || !continueResult.success) {
          this.recordUXIssue('Player cannot easily start new session after completion');
        }
      }

      this.testResults.passed++;
      console.log('✅ Session flow acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Session flow test failed', error.message);
      console.log('❌ Session flow has issues');
    }
    
    app.destroy();
  }

  async testGamePacing() {
    console.log('⏱️ Testing Game Pacing...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      // Test: Training sessions feel appropriately paced
      const pacingTests = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        app.handleTrainingInput('1'); // Speed training
        
        if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        }
        
        const endTime = Date.now();
        pacingTests.push(endTime - startTime);
      }
      
      const avgTime = pacingTests.reduce((a, b) => a + b, 0) / pacingTests.length;
      
      // Test: Individual actions aren't too slow
      if (avgTime > 500) {
        this.recordUXIssue(`Training actions feel slow: ${avgTime.toFixed(1)}ms average`);
      }
      
      // Test: Actions aren't too fast (need time to read)
      if (avgTime < 10) {
        this.recordUXIssue(`Training actions too fast for human comprehension: ${avgTime.toFixed(1)}ms average`);
      }
      
      // Test: Race frequency feels appropriate
      // (Races should happen every ~4 turns, not too often/rare)
      
      this.testResults.passed++;
      console.log('✅ Game pacing acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Game pacing test failed', error.message);
      console.log('❌ Game pacing has issues');
    }
    
    app.destroy();
  }

  // =====================================
  // HUMAN INTERACTION TESTS
  // =====================================

  async testTypingExperience() {
    console.log('⌨️ Testing Typing Experience...');
    
    const app = new GameApp();
    
    try {
      // Test: Character name typing feels natural
      app.setState('character_creation');
      
      const testNames = [
        'Quick',           // Short name
        'MyFavoriteHorse', // Long name with mixed case
        'Horse123',        // Alphanumeric
        'Test'             // Common name
      ];
      
      for (const name of testNames) {
        app.characterNameBuffer = '';
        
        // Type each character
        for (let i = 0; i < name.length; i++) {
          const char = name[i];
          const result = app.handleCharacterCreationInput(char);
          
          if (!result.success) {
            this.recordCriticalIssue(`Character '${char}' rejected during typing of '${name}'`);
          }
          
          // Check buffer shows progress
          if (app.characterNameBuffer !== name.substring(0, i + 1)) {
            this.recordUXIssue(`Character buffer doesn't match typed progress for '${name}'`);
          }
        }
        
        // Test submission
        const submitResult = app.handleCharacterCreationInput('enter');
        if (!submitResult.success) {
          this.recordUXIssue(`Valid name '${name}' rejected on submission`);
        }
        
        // Reset for next test
        app.game.character = null;
        app.setState('character_creation');
      }
      
      // Test: Backspace/correction (if supported)
      // Test: Visual feedback during typing
      
      this.testResults.passed++;
      console.log('✅ Typing experience acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Typing experience test failed', error.message);
      console.log('❌ Typing experience has issues');
    }
    
    app.destroy();
  }

  async testDecisionMaking() {
    console.log('🤔 Testing Decision Making...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      // Test: Training choices feel meaningful
      const decisionScenarios = [
        { 
          energy: 100,
          description: 'Full energy - all options should be viable',
          expectedOptions: ['1', '2', '3', '4', '5']
        },
        {
          energy: 10,
          description: 'Low energy - rest should be encouraged',
          expectedOptions: ['4'] // Rest should be most viable
        }
      ];
      
      for (const scenario of decisionScenarios) {
        app.game.character.condition.energy = scenario.energy;
        
        const gameText = this.captureUIOutput(app);
        
        // Check if all expected options are visible
        for (const option of scenario.expectedOptions) {
          if (!gameText.includes(option)) {
            this.recordUXIssue(`Option ${option} not visible in scenario: ${scenario.description}`);
          }
        }
        
        // Test making a decision
        const decision = scenario.expectedOptions[0];
        const result = app.handleTrainingInput(decision);
        
        if (!result || !result.success) {
          this.recordUXIssue(`Decision ${decision} failed in scenario: ${scenario.description}`);
        }
        
        // Reset for next scenario
        app.game.character.career.turn = 1;
      }
      
      // Test: Consequences of decisions are clear
      // Test: Player can understand trade-offs
      
      this.testResults.passed++;
      console.log('✅ Decision making acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Decision making test failed', error.message);
      console.log('❌ Decision making has issues');
    }
    
    app.destroy();
  }

  async testLearningCurve() {
    console.log('📚 Testing Learning Curve...');
    
    const app = new GameApp();
    
    try {
      // Test: New player can understand basic concepts quickly
      
      // 1. Can player figure out how to start?
      app.setState('main_menu');
      const menuText = this.captureUIOutput(app);
      
      // Should be obvious that '1' starts a new game
      if (!menuText.includes('1') || (!menuText.includes('New') && !menuText.includes('new'))) {
        this.recordUXIssue('Starting a new game not obvious to new player');
      }
      
      // 2. Can player figure out character creation?
      app.handleMainMenuInput('1');
      const creationText = this.captureUIOutput(app);
      
      if (!creationText.toLowerCase().includes('name')) {
        this.recordUXIssue('Character creation purpose not clear');
      }
      
      // 3. Can player understand training basics?
      this.setupTestCharacter(app);
      const trainingText = this.captureUIOutput(app);
      
      // Should show numbered options
      const hasNumbers = ['1', '2', '3', '4', '5'].every(num => 
        trainingText.includes(num)
      );
      
      if (!hasNumbers) {
        this.recordUXIssue('Training options not clearly numbered');
      }
      
      // Should show what each training does
      const hasDescriptions = ['Speed', 'Stamina', 'Power'].every(stat => 
        trainingText.includes(stat)
      );
      
      if (!hasDescriptions) {
        this.recordUXIssue('Training purposes not clear');
      }
      
      // 4. Can player understand energy system?
      if (!trainingText.toLowerCase().includes('energy')) {
        this.recordUXIssue('Energy system not explained');
      }

      this.testResults.passed++;
      console.log('✅ Learning curve acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Learning curve test failed', error.message);
      console.log('❌ Learning curve has issues');
    }
    
    app.destroy();
  }

  // =====================================
  // ENGAGEMENT & MOTIVATION TESTS
  // =====================================

  async testMotivation() {
    console.log('🎯 Testing Player Motivation...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      // Test: Player has clear short-term goals
      const gameText = this.captureUIOutput(app);
      
      if (!gameText.includes('RACE') && !gameText.includes('Race')) {
        this.recordUXIssue('No visible upcoming goals (races)');
      }
      
      // Test: Player can see progress toward goals
      if (!gameText.includes('Turn') && !gameText.includes('turn')) {
        this.recordUXIssue('No visible progress toward races');
      }
      
      // Test: Stats provide sense of growth
      const initialStats = { ...app.game.character.getCurrentStats() };
      
      // Do some training
      for (let i = 0; i < 3; i++) {
        app.handleTrainingInput('1'); // Speed training
      }
      
      const afterStats = { ...app.game.character.getCurrentStats() };
      
      if (afterStats.speed <= initialStats.speed) {
        this.recordUXIssue('Player cannot see meaningful stat growth');
      }
      
      // Test: Variety in activities
      // Should have multiple training options, races, etc.
      
      this.testResults.passed++;
      console.log('✅ Player motivation elements present');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Player motivation test failed', error.message);
      console.log('❌ Player motivation has issues');
    }
    
    app.destroy();
  }

  async testReplayability() {
    console.log('🔄 Testing Replayability...');
    
    const app = new GameApp();
    
    try {
      // Test: Player can easily start new careers
      
      // Complete a career quickly
      this.setupTestCharacter(app);
      
      // Fast-forward to completion (simplified)
      while (app.currentState !== 'career_complete' && app.game.character?.career.turn < 15) {
        if (app.currentState === 'training') {
          app.handleTrainingInput('4'); // Rest
        } else if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        }
      }
      
      // Test: Clear option to play again
      if (app.currentState === 'career_complete') {
        const completeText = this.captureUIOutput(app);
        
        if (!completeText.toLowerCase().includes('enter') && 
            !completeText.toLowerCase().includes('new') &&
            !completeText.toLowerCase().includes('again')) {
          this.recordUXIssue('No clear option to play again after career completion');
        }
        
        // Test: Actually starting new career
        const newCareerResult = app.handleCareerCompleteInput('enter');
        
        if (!newCareerResult || !newCareerResult.success) {
          this.recordUXIssue('Cannot easily start new career');
        }
      }

      this.testResults.passed++;
      console.log('✅ Replayability acceptable');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Replayability test failed', error.message);
      console.log('❌ Replayability has issues');
    }
    
    app.destroy();
  }

  async testSatisfaction() {
    console.log('😊 Testing Player Satisfaction...');
    
    const app = new GameApp();
    this.setupTestCharacter(app);
    
    try {
      // Test: Races feel rewarding
      
      // Train character to decent stats
      for (let i = 0; i < 6; i++) {
        if (app.currentState === 'training') {
          app.handleTrainingInput('1'); // Speed training
        } else if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        }
      }
      
      // Check if a race occurred and felt meaningful
      const raceResults = app.game.getRaceResults();
      
      if (raceResults.length === 0) {
        this.recordUXIssue('No races occurred during typical play session');
      }
      
      // Test: Final results feel meaningful
      const gameText = this.captureUIOutput(app);
      const currentStats = app.game.character.getCurrentStats();
      
      // Stats should show meaningful improvement
      const totalImprovement = (currentStats.speed + currentStats.stamina + currentStats.power) - 60; // Started with 20 each
      
      if (totalImprovement < 10) {
        this.recordUXIssue('Character improvement feels minimal');
      }
      
      // Test: Player gets positive feedback
      // Should have encouraging messages, not just dry stats

      this.testResults.passed++;
      console.log('✅ Player satisfaction elements present');
      
    } catch (error) {
      this.testResults.failed++;
      this.recordCriticalIssue('Player satisfaction test failed', error.message);
      console.log('❌ Player satisfaction has issues');
    }
    
    app.destroy();
  }

  // =====================================
  // HELPER METHODS
  // =====================================

  setupTestCharacter(app) {
    const result = app.game.startNewGame('UXTestHorse');
    if (!result.success) {
      throw new Error('Failed to setup test character for UX testing');
    }
    app.setState('training');
  }

  captureUIOutput(app) {
    // Simulate capturing what the player would see
    // In a real implementation, this would capture the actual rendered output
    try {
      // Create a mock output capture
      let output = '';
      const originalLog = console.log;
      
      console.log = (...args) => {
        output += args.join(' ') + '\n';
      };
      
      app.render();
      
      console.log = originalLog;
      
      return output;
      
    } catch (error) {
      // Fallback - return basic state info
      return `State: ${app.currentState}, Character: ${app.game.character?.name || 'none'}`;
    }
  }

  recordUXIssue(issue) {
    this.testResults.uxIssues.push({
      issue,
      severity: 'moderate',
      timestamp: new Date().toISOString()
    });
    console.log(`    ⚠️ UX Issue: ${issue}`);
  }

  recordCriticalIssue(issue, details = null) {
    this.testResults.criticalIssues.push({
      issue,
      details,
      severity: 'critical',
      timestamp: new Date().toISOString()
    });
    console.log(`    🚨 Critical Issue: ${issue}`);
  }

  calculatePlayabilityScore() {
    const totalTests = this.testResults.passed + this.testResults.failed;
    const passRate = totalTests > 0 ? (this.testResults.passed / totalTests) * 100 : 0;
    
    // Deduct points for UX issues
    const uxDeduction = this.testResults.uxIssues.length * 5;
    const criticalDeduction = this.testResults.criticalIssues.length * 15;
    
    const score = Math.max(0, passRate - uxDeduction - criticalDeduction);
    return Math.round(score);
  }

  generateUXReport() {
    console.log('\n🎮 USER EXPERIENCE TEST RESULTS');
    console.log('===============================');
    
    const totalTests = this.testResults.passed + this.testResults.failed;
    const playabilityScore = this.calculatePlayabilityScore();
    
    console.log(`Tests Passed: ${this.testResults.passed}/${totalTests}`);
    console.log(`UX Issues: ${this.testResults.uxIssues.length}`);
    console.log(`Critical Issues: ${this.testResults.criticalIssues.length}`);
    console.log(`Playability Score: ${playabilityScore}/100`);
    
    // Grade the playability
    let grade = 'F';
    if (playabilityScore >= 90) grade = 'A';
    else if (playabilityScore >= 80) grade = 'B';
    else if (playabilityScore >= 70) grade = 'C';
    else if (playabilityScore >= 60) grade = 'D';
    
    console.log(`Overall Grade: ${grade}`);
    
    if (this.testResults.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES (Game-Breaking):');
      this.testResults.criticalIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.issue}`);
        if (issue.details) {
          console.log(`     Details: ${issue.details}`);
        }
      });
    }
    
    if (this.testResults.uxIssues.length > 0) {
      console.log('\n⚠️ UX ISSUES (Playability Problems):');
      this.testResults.uxIssues.slice(0, 10).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.issue}`);
      });
      
      if (this.testResults.uxIssues.length > 10) {
        console.log(`  ... and ${this.testResults.uxIssues.length - 10} more issues`);
      }
    }
    
    console.log('\n📊 PLAYABILITY ASSESSMENT:');
    
    if (playabilityScore >= 80) {
      console.log('✅ Game is PLAYABLE by humans');
      console.log('   - Core mechanics work');
      console.log('   - User interface is functional');
      console.log('   - Player experience is acceptable');
    } else if (playabilityScore >= 60) {
      console.log('⚠️ Game has PLAYABILITY ISSUES');
      console.log('   - Basic functionality works');
      console.log('   - Multiple UX problems need fixing');
      console.log('   - Player frustration likely');
    } else {
      console.log('❌ Game is NOT READY for human players');
      console.log('   - Critical functionality broken');
      console.log('   - User experience severely impacted');
      console.log('   - Major fixes required');
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (this.testResults.criticalIssues.length > 0) {
      console.log('   1. FIX CRITICAL ISSUES FIRST - game is unplayable');
    }
    
    if (this.testResults.uxIssues.length > 5) {
      console.log('   2. Address major UX issues - players will get frustrated');
    }
    
    if (playabilityScore < 70) {
      console.log('   3. Test with real human players before release');
      console.log('   4. Focus on first-time player experience');
    }
    
    console.log('   5. Consider automated UX testing in development pipeline');
    
    return playabilityScore >= 70;
  }
}

// Run the UX playability tests
async function main() {
  const tester = new UXPlayabilityTester();
  
  try {
    await tester.runUXTests();
    const isPlayable = tester.generateUXReport();
    process.exit(isPlayable ? 0 : 1);
  } catch (error) {
    console.error('\n💥 UX test suite crashed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = UXPlayabilityTester;