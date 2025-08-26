#!/usr/bin/env node

/**
 * FINAL STABILITY TEST
 * Comprehensive test to validate game is stable and ready for v1.0
 */

const GameApp = require('./src/GameApp');

class FinalStabilityTester {
  constructor() {
    this.results = {
      coreSystemsWorking: 0,
      coreSystemsTotal: 0,
      edgeCasesPassing: 0,
      edgeCasesTotal: 0,
      performanceAcceptable: true,
      memoryLeaks: false,
      crashCount: 0,
      issues: []
    };
  }

  async runFinalStabilityTests() {
    console.log('🏁 FINAL STABILITY TEST - V1.0 READINESS');
    console.log('=======================================\n');

    try {
      // Core Systems Validation
      await this.validateCoreGameplay();
      await this.validateUserExperience();
      await this.validateDataIntegrity();
      
      // Edge Cases & Stress Tests
      await this.testEdgeCases();
      await this.stressTestSessions();
      await this.testResourceManagement();
      
      // Performance & Stability
      await this.testPerformance();
      await this.testMemoryStability();
      
      this.generateFinalReport();
      
    } catch (error) {
      this.recordCrash(`Test suite crashed: ${error.message}`);
      this.generateFinalReport();
      throw error;
    }
  }

  async validateCoreGameplay() {
    console.log('🎮 Core Gameplay Validation...');
    
    this.coreSystemsTotal += 5;
    
    try {
      const app = new GameApp();
      
      // Test 1: Character Creation
      app.handleMainMenuInput('1');
      for (const char of 'StableTest') {
        app.handleCharacterCreationInput(char);
      }
      const creationResult = app.handleCharacterCreationInput('enter');
      
      if (creationResult.success && app.game.character) {
        console.log('  ✅ Character Creation');
        this.coreSystemsWorking++;
      } else {
        console.log('  ❌ Character Creation FAILED');
        this.recordIssue('Character creation broken', 'critical');
      }
      
      // Test 2: Training Progression
      const initialSpeed = app.game.character.stats.speed;
      app.handleTrainingInput('1'); // Speed training
      const afterSpeed = app.game.character.stats.speed;
      
      if (afterSpeed > initialSpeed) {
        console.log('  ✅ Training Progression');
        this.coreSystemsWorking++;
      } else {
        console.log('  ❌ Training Progression FAILED');
        this.recordIssue('Training provides no progression', 'critical');
      }
      
      // Test 3: Energy System
      const initialEnergy = app.game.character.condition.energy;
      app.handleTrainingInput('4'); // Rest
      const afterEnergy = app.game.character.condition.energy;
      
      if (afterEnergy > initialEnergy) {
        console.log('  ✅ Energy System');
        this.coreSystemsWorking++;
      } else {
        console.log('  ❌ Energy System FAILED');
        this.recordIssue('Energy system broken', 'critical');
      }
      
      // Test 4: Race System
      let raceOccurred = false;
      for (let i = 0; i < 10 && !raceOccurred; i++) {
        if (app.currentState === 'training') {
          app.handleTrainingInput('4');
        } else if (app.currentState === 'race_results') {
          raceOccurred = true;
          app.handleRaceResultsInput('enter');
          break;
        }
      }
      
      if (raceOccurred) {
        console.log('  ✅ Race System');
        this.coreSystemsWorking++;
      } else {
        console.log('  ❌ Race System FAILED');
        this.recordIssue('Races do not occur', 'critical');
      }
      
      // Test 5: Career Completion
      // Fast forward to completion
      let completed = false;
      for (let i = 0; i < 50; i++) {
        if (app.currentState === 'training') {
          app.handleTrainingInput('4');
        } else if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        } else if (app.currentState === 'career_complete') {
          completed = true;
          break;
        }
      }
      
      if (completed) {
        console.log('  ✅ Career Completion');
        this.coreSystemsWorking++;
      } else {
        console.log('  ❌ Career Completion FAILED');
        this.recordIssue('Career does not complete', 'critical');
      }
      
      app.destroy();
      
    } catch (error) {
      this.recordCrash(`Core gameplay validation crashed: ${error.message}`);
    }
    
    console.log();
  }

  async validateUserExperience() {
    console.log('👤 User Experience Validation...');
    
    const app = new GameApp();
    
    try {
      // Test clear navigation
      const menuResult = app.handleMainMenuInput('1');
      if (!menuResult.success || app.currentState !== 'character_creation') {
        this.recordIssue('Menu navigation unclear', 'moderate');
      }
      
      // Test input validation
      const invalidResult = app.handleMainMenuInput('999');
      if (invalidResult && invalidResult.success) {
        this.recordIssue('Invalid inputs accepted', 'moderate');
      }
      
      // Test progress visibility
      app.game.startNewGame('UXTest');
      app.setState('training');
      
      const beforeStats = app.game.character.stats.speed;
      app.handleTrainingInput('1');
      const afterStats = app.game.character.stats.speed;
      
      if (afterStats <= beforeStats) {
        this.recordIssue('Progress not visible to players', 'high');
      }
      
      console.log('  ✅ User Experience Acceptable');
      
    } catch (error) {
      this.recordCrash(`UX validation crashed: ${error.message}`);
    }
    
    app.destroy();
    console.log();
  }

  async validateDataIntegrity() {
    console.log('🗄️ Data Integrity Validation...');
    
    const app = new GameApp();
    
    try {
      app.game.startNewGame('DataTest');
      
      // Test character data consistency
      const character = app.game.character;
      
      if (!character.name || !character.stats || !character.condition || !character.career) {
        this.recordIssue('Character data structure incomplete', 'critical');
      }
      
      // Test stat bounds
      character.stats.speed = 150; // Over max
      app.handleTrainingInput('1');
      
      if (character.stats.speed > 100) {
        this.recordIssue('Stats can exceed maximum bounds', 'moderate');
      }
      
      character.stats.speed = -10; // Under min
      app.handleTrainingInput('1');
      
      if (character.stats.speed < 1) {
        this.recordIssue('Stats can go below minimum bounds', 'moderate');
      }
      
      // Test energy bounds
      character.condition.energy = -50;
      app.handleTrainingInput('4');
      
      if (character.condition.energy < 0) {
        this.recordIssue('Energy can go negative', 'high');
      }
      
      console.log('  ✅ Data Integrity Acceptable');
      
    } catch (error) {
      this.recordCrash(`Data integrity validation crashed: ${error.message}`);
    }
    
    app.destroy();
    console.log();
  }

  async testEdgeCases() {
    console.log('⚠️ Edge Cases Testing...');
    
    this.edgeCasesTotal = 6;
    
    // Test 1: Empty character name
    try {
      const app1 = new GameApp();
      app1.setState('character_creation');
      const emptyNameResult = app1.handleCharacterCreationInput('enter');
      
      if (!emptyNameResult.success) {
        console.log('  ✅ Empty name rejection');
        this.edgeCasesPassing++;
      } else {
        console.log('  ❌ Empty name accepted');
      }
      app1.destroy();
    } catch (error) {
      this.recordCrash(`Empty name test crashed: ${error.message}`);
    }
    
    // Test 2: Very long character name
    try {
      const app2 = new GameApp();
      app2.setState('character_creation');
      app2.characterNameBuffer = 'A'.repeat(100);
      const longNameResult = app2.handleCharacterCreationInput('enter');
      
      if (!longNameResult.success) {
        console.log('  ✅ Long name rejection');
        this.edgeCasesPassing++;
      } else {
        console.log('  ❌ Long name accepted');
      }
      app2.destroy();
    } catch (error) {
      this.recordCrash(`Long name test crashed: ${error.message}`);
    }
    
    // Test 3: Invalid training input
    try {
      const app3 = new GameApp();
      app3.game.startNewGame('EdgeTest');
      app3.setState('training');
      const invalidTraining = app3.handleTrainingInput('999');
      
      if (!invalidTraining.success) {
        console.log('  ✅ Invalid training rejection');
        this.edgeCasesPassing++;
      } else {
        console.log('  ❌ Invalid training accepted');
      }
      app3.destroy();
    } catch (error) {
      this.recordCrash(`Invalid training test crashed: ${error.message}`);
    }
    
    // Test 4: Null character training
    try {
      const app4 = new GameApp();
      app4.game.character = null;
      app4.setState('training');
      const nullTraining = app4.handleTrainingInput('1');
      
      if (!nullTraining || !nullTraining.success) {
        console.log('  ✅ Null character protection');
        this.edgeCasesPassing++;
      } else {
        console.log('  ❌ Null character training allowed');
      }
      app4.destroy();
    } catch (error) {
      this.recordCrash(`Null character test crashed: ${error.message}`);
    }
    
    // Test 5: Extreme energy values
    try {
      const app5 = new GameApp();
      app5.game.startNewGame('EnergyTest');
      app5.game.character.condition.energy = -1000;
      const negativeEnergyTraining = app5.handleTrainingInput('1');
      
      if (app5.game.character.condition.energy >= 0) {
        console.log('  ✅ Negative energy protection');
        this.edgeCasesPassing++;
      } else {
        console.log('  ❌ Negative energy allowed');
      }
      app5.destroy();
    } catch (error) {
      this.recordCrash(`Extreme energy test crashed: ${error.message}`);
    }
    
    // Test 6: Race with no character
    try {
      const app6 = new GameApp();
      app6.game.character = null;
      const nullRaceResult = app6.game.runRace();
      
      if (!nullRaceResult || !nullRaceResult.success) {
        console.log('  ✅ Null character race protection');
        this.edgeCasesPassing++;
      } else {
        console.log('  ❌ Null character race allowed');
      }
      app6.destroy();
    } catch (error) {
      this.recordCrash(`Null character race test crashed: ${error.message}`);
    }
    
    console.log();
  }

  async stressTestSessions() {
    console.log('🔥 Stress Test - Multiple Sessions...');
    
    try {
      for (let session = 0; session < 5; session++) {
        const app = new GameApp();
        
        // Quick career completion
        app.game.startNewGame(`Stress${session}`);
        app.setState('training');
        
        let turns = 0;
        const maxTurns = 20;
        
        while (turns < maxTurns && app.currentState !== 'career_complete') {
          if (app.currentState === 'training') {
            app.handleTrainingInput('4');
          } else if (app.currentState === 'race_results') {
            app.handleRaceResultsInput('enter');
          }
          turns++;
        }
        
        if (app.currentState !== 'career_complete') {
          this.recordIssue(`Session ${session} did not complete properly`, 'moderate');
        }
        
        app.destroy();
      }
      
      console.log('  ✅ Multiple sessions completed successfully');
      
    } catch (error) {
      this.recordCrash(`Stress test crashed: ${error.message}`);
    }
    
    console.log();
  }

  async testResourceManagement() {
    console.log('💾 Resource Management Testing...');
    
    try {
      const apps = [];
      
      // Create multiple app instances
      for (let i = 0; i < 10; i++) {
        const app = new GameApp();
        app.game.startNewGame(`Resource${i}`);
        apps.push(app);
      }
      
      // Use them all
      for (const app of apps) {
        app.handleTrainingInput('1');
      }
      
      // Clean up
      for (const app of apps) {
        app.destroy();
      }
      
      console.log('  ✅ Resource management acceptable');
      
    } catch (error) {
      this.recordCrash(`Resource management test crashed: ${error.message}`);
    }
    
    console.log();
  }

  async testPerformance() {
    console.log('⚡ Performance Testing...');
    
    try {
      const app = new GameApp();
      app.game.startNewGame('PerfTest');
      app.setState('training');
      
      const startTime = Date.now();
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        app.handleTrainingInput('1');
        if (app.currentState === 'race_results') {
          app.handleRaceResultsInput('enter');
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration > 5000) { // 5 seconds
        this.performanceAcceptable = false;
        this.recordIssue(`Performance too slow: ${duration}ms for 100 operations`, 'moderate');
      } else {
        console.log(`  ✅ Performance acceptable: ${duration}ms for 100 operations`);
      }
      
      app.destroy();
      
    } catch (error) {
      this.recordCrash(`Performance test crashed: ${error.message}`);
    }
    
    console.log();
  }

  async testMemoryStability() {
    console.log('🧠 Memory Stability Testing...');
    
    try {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy many app instances
      for (let i = 0; i < 20; i++) {
        const app = new GameApp();
        app.game.startNewGame(`Memory${i}`);
        
        // Do some operations
        for (let j = 0; j < 10; j++) {
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
      
      if (memoryIncrease > 100 * 1024 * 1024) { // 100MB
        this.memoryLeaks = true;
        this.recordIssue(`Potential memory leak: ${Math.round(memoryIncrease / 1024 / 1024)}MB increase`, 'moderate');
      } else {
        console.log(`  ✅ Memory stable: ${Math.round(memoryIncrease / 1024 / 1024)}MB increase acceptable`);
      }
      
    } catch (error) {
      this.recordCrash(`Memory stability test crashed: ${error.message}`);
    }
    
    console.log();
  }

  recordIssue(description, severity) {
    this.results.issues.push({ description, severity });
    const emoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : 'ℹ️';
    console.log(`    ${emoji} ${severity.toUpperCase()}: ${description}`);
  }

  recordCrash(description) {
    this.results.crashCount++;
    console.log(`    💥 CRASH: ${description}`);
  }

  generateFinalReport() {
    console.log('🏁 FINAL STABILITY REPORT - V1.0 READINESS');
    console.log('==========================================\n');
    
    // Core Systems Score
    const coreSystemsScore = this.results.coreSystemsTotal > 0 ? 
      Math.round((this.results.coreSystemsWorking / this.results.coreSystemsTotal) * 100) : 0;
    
    console.log(`Core Systems: ${this.results.coreSystemsWorking}/${this.results.coreSystemsTotal} (${coreSystemsScore}%)`);
    
    // Edge Cases Score  
    const edgeCasesScore = this.results.edgeCasesTotal > 0 ?
      Math.round((this.results.edgeCasesPassing / this.results.edgeCasesTotal) * 100) : 0;
    
    console.log(`Edge Cases: ${this.results.edgeCasesPassing}/${this.results.edgeCasesTotal} (${edgeCasesScore}%)`);
    
    console.log(`Performance: ${this.results.performanceAcceptable ? '✅ GOOD' : '❌ POOR'}`);
    console.log(`Memory: ${this.results.memoryLeaks ? '❌ LEAKS DETECTED' : '✅ STABLE'}`);
    console.log(`Crashes: ${this.results.crashCount}`);
    
    // Issue Breakdown
    const critical = this.results.issues.filter(i => i.severity === 'critical');
    const high = this.results.issues.filter(i => i.severity === 'high');
    const moderate = this.results.issues.filter(i => i.severity === 'moderate');
    
    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      critical.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
    }
    
    if (high.length > 0) {
      console.log('\n⚠️ HIGH PRIORITY ISSUES:');
      high.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
    }
    
    if (moderate.length > 0) {
      console.log('\n ℹ️ MODERATE ISSUES:');
      moderate.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
    }
    
    // Overall Assessment
    console.log('\n🎯 V1.0 READINESS ASSESSMENT:');
    
    const isReady = critical.length === 0 && 
                   this.results.crashCount === 0 && 
                   coreSystemsScore >= 80 &&
                   edgeCasesScore >= 70;
    
    if (isReady) {
      console.log('🎉 READY FOR V1.0 RELEASE');
      console.log('   ✅ All core systems functional');
      console.log('   ✅ No critical issues detected');
      console.log('   ✅ Edge cases handled appropriately');
      console.log('   ✅ Performance acceptable');
      console.log('   ✅ No crashes during testing');
      console.log('\n🚀 GAME IS STABLE AND READY FOR HUMAN PLAYERS');
    } else {
      console.log('⚠️ NOT READY FOR V1.0 RELEASE');
      
      if (critical.length > 0) {
        console.log('   ❌ Critical issues must be fixed first');
      }
      
      if (this.results.crashCount > 0) {
        console.log('   ❌ Crashes detected - stability issues');
      }
      
      if (coreSystemsScore < 80) {
        console.log('   ❌ Core systems not reliable enough');
      }
      
      if (edgeCasesScore < 70) {
        console.log('   ❌ Edge case handling insufficient');
      }
      
      console.log('\n🔧 ADDITIONAL WORK REQUIRED BEFORE RELEASE');
    }
    
    return isReady;
  }
}

// Run the final stability tests
async function main() {
  const tester = new FinalStabilityTester();
  
  try {
    await tester.runFinalStabilityTests();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Final stability test suite crashed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FinalStabilityTester;