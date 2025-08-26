#!/usr/bin/env node

/**
 * CRITICAL UX ISSUES TEST
 * Quick test to identify game-breaking UX problems that prevent human playability
 */

const GameApp = require('./src/GameApp');

class CriticalUXTester {
  constructor() {
    this.issues = [];
  }

  async runCriticalTests() {
    console.log('🚨 CRITICAL UX ISSUES TEST');
    console.log('=========================\n');

    await this.testStatProgression();
    await this.testTrainingEffectiveness();
    await this.testEnergySystem();
    await this.testRaceImpact();
    await this.testPlayerMotoivation();

    this.reportFindings();
  }

  async testStatProgression() {
    console.log('📊 Testing Stat Progression...');
    
    const app = new GameApp();
    app.game.startNewGame('TestHorse');
    app.setState('training');

    const initialStats = { ...app.game.character.getCurrentStats() };
    console.log(`Initial stats: ${JSON.stringify(initialStats)}`);

    // Try each training type
    const trainingTypes = [
      { input: '1', type: 'speed' },
      { input: '2', type: 'stamina' },
      { input: '3', type: 'power' }
    ];

    let hasImprovement = false;

    for (const training of trainingTypes) {
      app.game.character.condition.energy = 100; // Reset energy
      const beforeStat = app.game.character.stats[training.type];
      
      app.handleTrainingInput(training.input);
      
      const afterStat = app.game.character.stats[training.type];
      const improvement = afterStat - beforeStat;
      
      console.log(`  ${training.type}: ${beforeStat} → ${afterStat} (+${improvement})`);
      
      if (improvement > 0) {
        hasImprovement = true;
      } else {
        this.recordIssue(`${training.type} training provides no stat improvement`, 'critical');
      }
    }

    if (!hasImprovement) {
      this.recordIssue('NO TRAINING PROVIDES STAT IMPROVEMENTS - game is pointless', 'critical');
    }

    app.destroy();
    console.log();
  }

  async testTrainingEffectiveness() {
    console.log('⚡ Testing Training Effectiveness...');
    
    const app = new GameApp();
    app.game.startNewGame('EffectiveTest');
    app.setState('training');

    // Test multiple training sessions to see cumulative effect
    let totalSpeedGain = 0;
    const sessions = 5;

    for (let i = 0; i < sessions; i++) {
      app.game.character.condition.energy = 100;
      const beforeSpeed = app.game.character.stats.speed;
      
      app.handleTrainingInput('1'); // Speed training
      
      const afterSpeed = app.game.character.stats.speed;
      totalSpeedGain += (afterSpeed - beforeSpeed);
    }

    console.log(`Total speed gain over ${sessions} sessions: ${totalSpeedGain}`);

    if (totalSpeedGain < 5) {
      this.recordIssue('Training provides minimal progress - players will feel frustrated', 'high');
    }

    if (totalSpeedGain === 0) {
      this.recordIssue('Training provides ZERO progress - game is broken', 'critical');
    }

    // Test if different moods affect training
    const moods = ['Bad', 'Normal', 'Good', 'Great'];
    console.log('Testing mood effects:');
    
    for (const mood of moods) {
      app.game.character.mood = mood;
      app.game.character.condition.energy = 100;
      const beforeSpeed = app.game.character.stats.speed;
      
      app.handleTrainingInput('1');
      
      const afterSpeed = app.game.character.stats.speed;
      const gain = afterSpeed - beforeSpeed;
      
      console.log(`  ${mood} mood: +${gain} speed`);
    }

    app.destroy();
    console.log();
  }

  async testEnergySystem() {
    console.log('🔋 Testing Energy System...');
    
    const app = new GameApp();
    app.game.startNewGame('EnergyTest');
    app.setState('training');

    // Test energy consumption
    const initialEnergy = app.game.character.condition.energy;
    console.log(`Initial energy: ${initialEnergy}`);

    // High-cost training
    app.handleTrainingInput('1'); // Speed (should cost 15)
    const afterSpeedEnergy = app.game.character.condition.energy;
    console.log(`After speed training: ${afterSpeedEnergy} (change: ${afterSpeedEnergy - initialEnergy})`);

    if (afterSpeedEnergy === initialEnergy) {
      this.recordIssue('Training does not consume energy - no resource management', 'moderate');
    }

    // Test rest recovery
    const lowEnergy = 20;
    app.game.character.condition.energy = lowEnergy;
    
    app.handleTrainingInput('4'); // Rest
    const afterRestEnergy = app.game.character.condition.energy;
    console.log(`After rest: ${lowEnergy} → ${afterRestEnergy} (change: +${afterRestEnergy - lowEnergy})`);

    if (afterRestEnergy <= lowEnergy) {
      this.recordIssue('Rest does not restore energy - players cannot recover', 'critical');
    }

    // Test low energy training
    app.game.character.condition.energy = 5;
    const lowEnergyResult = app.handleTrainingInput('1'); // Expensive training
    
    if (lowEnergyResult && lowEnergyResult.success && app.game.character.condition.energy < 0) {
      this.recordIssue('Game allows negative energy - broken energy system', 'critical');
    }

    app.destroy();
    console.log();
  }

  async testRaceImpact() {
    console.log('🏁 Testing Race Impact...');
    
    const app = new GameApp();
    app.game.startNewGame('RaceTest');
    app.setState('training');

    // Train to race turn and see if races occur
    let raceOccurred = false;
    let turn = 1;

    while (turn < 15 && !raceOccurred) { // Safety limit
      if (app.currentState === 'training') {
        app.handleTrainingInput('4'); // Safe rest training
        turn = app.game.character.career.turn;
        
        if (app.currentState === 'race_results') {
          raceOccurred = true;
          console.log(`Race occurred at turn ${turn}`);
          
          // Check race results
          const raceResults = app.game.getRaceResults();
          console.log(`Total races completed: ${raceResults.length}`);
          
          if (raceResults.length === 0) {
            this.recordIssue('Races state transitions but no results recorded', 'high');
          }
          
          // Continue past race
          app.handleRaceResultsInput('enter');
          break;
        }
      }
    }

    if (!raceOccurred) {
      this.recordIssue('No races occur during normal gameplay - missing key feature', 'critical');
    }

    // Check if races affect career progression
    const finalRaceCount = app.game.getRaceResults().length;
    console.log(`Final race count: ${finalRaceCount}`);

    app.destroy();
    console.log();
  }

  async testPlayerMotoivation() {
    console.log('🎯 Testing Player Motivation...');
    
    const app = new GameApp();
    app.game.startNewGame('MotivationTest');
    app.setState('training');

    // Check if player has clear goals
    const trainingScreen = this.captureBasicOutput(app);
    
    if (!trainingScreen.includes('RACE') && !trainingScreen.includes('Turn')) {
      this.recordIssue('No visible goals or progress indicators', 'high');
    }

    // Test meaningful choice differences
    const choices = [
      { input: '1', desc: 'Speed Training' },
      { input: '2', desc: 'Stamina Training' }, 
      { input: '3', desc: 'Power Training' },
      { input: '4', desc: 'Rest Day' }
    ];

    console.log('Testing choice meaningfulness:');
    let meaningfulChoices = 0;

    for (const choice of choices) {
      app.game.character = { ...app.game.character }; // Reset
      app.game.character.stats = { speed: 50, stamina: 50, power: 50 };
      app.game.character.condition.energy = 100;
      
      const beforeStats = { speed: app.game.character.stats.speed, stamina: app.game.character.stats.stamina, power: app.game.character.stats.power };
      const beforeEnergy = app.game.character.condition.energy;
      
      app.handleTrainingInput(choice.input);
      
      const afterStats = { speed: app.game.character.stats.speed, stamina: app.game.character.stats.stamina, power: app.game.character.stats.power };
      const afterEnergy = app.game.character.condition.energy;
      
      const hasStatChange = JSON.stringify(beforeStats) !== JSON.stringify(afterStats);
      const hasEnergyChange = beforeEnergy !== afterEnergy;
      
      if (hasStatChange || hasEnergyChange) {
        meaningfulChoices++;
        console.log(`  ✅ ${choice.desc}: Meaningful`);
      } else {
        console.log(`  ❌ ${choice.desc}: No effect`);
      }
    }

    if (meaningfulChoices < 3) {
      this.recordIssue('Most training choices have no meaningful effect', 'high');
    }

    app.destroy();
    console.log();
  }

  captureBasicOutput(app) {
    // Very basic output capture - just check what state we're in and basic info
    return `State: ${app.currentState}, Turn: ${app.game.character?.career.turn || 'unknown'}`;
  }

  recordIssue(description, severity) {
    this.issues.push({ description, severity });
    const emoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : 'ℹ️';
    console.log(`    ${emoji} ${severity.toUpperCase()}: ${description}`);
  }

  reportFindings() {
    console.log('📋 CRITICAL UX FINDINGS');
    console.log('=======================\n');

    const critical = this.issues.filter(i => i.severity === 'critical');
    const high = this.issues.filter(i => i.severity === 'high');
    const moderate = this.issues.filter(i => i.severity === 'moderate');

    if (critical.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Game-Breaking):');
      critical.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
      console.log();
    }

    if (high.length > 0) {
      console.log('⚠️ HIGH PRIORITY ISSUES:');
      high.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
      console.log();
    }

    if (moderate.length > 0) {
      console.log('ℹ️ MODERATE ISSUES:');
      moderate.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
      console.log();
    }

    console.log('🎯 PLAYABILITY ASSESSMENT:');
    
    if (critical.length > 0) {
      console.log('❌ GAME IS NOT PLAYABLE');
      console.log('   Critical issues prevent meaningful gameplay');
      console.log('   Players cannot progress or enjoy the experience');
    } else if (high.length > 2) {
      console.log('⚠️ GAME HAS SERIOUS ISSUES');  
      console.log('   Major UX problems will frustrate players');
      console.log('   Core mechanics need improvement');
    } else {
      console.log('✅ GAME IS BASICALLY PLAYABLE');
      console.log('   Core mechanics work acceptably');
      console.log('   Some improvements needed but functional');
    }

    console.log(`\nTotal Issues: ${this.issues.length} (${critical.length} critical, ${high.length} high, ${moderate.length} moderate)`);
    
    return critical.length === 0;
  }
}

// Run the critical UX tests
async function main() {
  const tester = new CriticalUXTester();
  
  try {
    await tester.runCriticalTests();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Critical UX test crashed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CriticalUXTester;