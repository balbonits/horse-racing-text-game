#!/usr/bin/env node

/**
 * Complete Gameplay Regression Test
 * Tests a full game from start to finish - new career through completion
 */

const GameApp = require('./src/GameApp');

class GameplayTester {
  constructor() {
    this.app = new GameApp();
    this.testResults = {
      characterCreation: false,
      trainingPhase: false,
      racesCompleted: 0,
      careerCompleted: false,
      finalStats: null,
      errors: []
    };
  }

  async runCompleteGameplay() {
    console.log('🎮 COMPLETE GAMEPLAY REGRESSION TEST');
    console.log('===================================\n');

    try {
      // Step 1: Start new career
      await this.testNewCareer();
      
      // Step 2: Create character  
      await this.testCharacterCreation();
      
      // Step 3: Complete full training career (12 turns with races)
      await this.testCompleteCareer();
      
      // Step 4: Validate final results
      this.validateFinalResults();
      
      this.reportResults();
      
    } catch (error) {
      this.testResults.errors.push(`Critical failure: ${error.message}`);
      this.reportResults();
      throw error;
    }
  }

  async testNewCareer() {
    console.log('📍 STEP 1: Starting New Career');
    console.log('------------------------------');
    
    // Verify initial state
    if (this.app.currentState !== 'main_menu') {
      throw new Error(`Expected main_menu state, got ${this.app.currentState}`);
    }
    
    // Navigate to character creation
    const menuResult = this.app.handleMainMenuInput('1');
    console.log('Menu navigation result:', menuResult.success ? '✅' : '❌');
    
    if (!menuResult.success || menuResult.action !== 'new_career') {
      throw new Error(`Failed to start new career: ${JSON.stringify(menuResult)}`);
    }
    
    if (this.app.currentState !== 'character_creation') {
      throw new Error(`Expected character_creation state, got ${this.app.currentState}`);
    }
    
    console.log('✅ Successfully navigated to character creation\n');
  }

  async testCharacterCreation() {
    console.log('📍 STEP 2: Character Creation');
    console.log('-----------------------------');
    
    const characterName = 'RegressionTest';
    console.log(`Creating character: ${characterName}`);
    
    // Type character name letter by letter
    for (let i = 0; i < characterName.length; i++) {
      const char = characterName[i];
      const inputResult = this.app.handleCharacterCreationInput(char);
      
      if (!inputResult.success) {
        throw new Error(`Failed to input character '${char}': ${JSON.stringify(inputResult)}`);
      }
      
      if (inputResult.buffer !== characterName.substring(0, i + 1)) {
        throw new Error(`Character buffer mismatch. Expected '${characterName.substring(0, i + 1)}', got '${inputResult.buffer}'`);
      }
    }
    
    // Submit character name
    const submitResult = this.app.handleCharacterCreationInput('enter');
    console.log('Character creation result:', submitResult.success ? '✅' : '❌');
    
    if (!submitResult.success || submitResult.action !== 'create_character') {
      throw new Error(`Failed to create character: ${JSON.stringify(submitResult)}`);
    }
    
    // Validate character was created
    if (!this.app.game?.character) {
      throw new Error('Character object not found after creation');
    }
    
    if (this.app.game.character.name !== characterName) {
      throw new Error(`Character name mismatch. Expected '${characterName}', got '${this.app.game.character.name}'`);
    }
    
    if (this.app.currentState !== 'training') {
      throw new Error(`Expected training state after character creation, got ${this.app.currentState}`);
    }
    
    // Validate initial stats
    const stats = this.app.game.character.getCurrentStats();
    console.log('Initial stats:', stats);
    
    if (stats.speed !== 20 || stats.stamina !== 20 || stats.power !== 20) {
      throw new Error(`Invalid initial stats: ${JSON.stringify(stats)}`);
    }
    
    this.testResults.characterCreation = true;
    console.log(`✅ Character '${characterName}' created successfully\n`);
  }

  async testCompleteCareer() {
    console.log('📍 STEP 3: Complete Career (12 turns + races)');
    console.log('----------------------------------------------');
    
    // Smart training strategy that manages energy
    const getSmartTraining = (turn, energy) => {
      // Rest when energy is low
      if (energy < 20) {
        return 'rest';
      }
      
      // Focus on different stats at different phases
      if (turn <= 4) {
        // Pre-sprint race: focus on speed/power
        return turn % 2 === 0 ? 'speed' : 'power';
      } else if (turn <= 8) {
        // Pre-mile race: balanced training with rest management
        if (energy < 40) return 'rest';
        return ['speed', 'stamina', 'power'][turn % 3];
      } else {
        // Pre-championship: focus on stamina for long race
        if (energy < 30) return 'rest';
        return turn % 2 === 0 ? 'stamina' : 'speed';
      }
    };
    
    const trainingMap = {
      'speed': '1',
      'stamina': '2', 
      'power': '3',
      'rest': '4',
      'social': '5'
    };
    
    let turn = 1;
    let racesEncountered = 0;
    
    while (turn <= 12 && this.app.currentState === 'training') {
      console.log(`\n--- Turn ${turn} ---`);
      
      const character = this.app.game.character;
      const beforeStats = { ...character.getCurrentStats() };
      const beforeEnergy = character.condition.energy;
      
      console.log(`Before: Speed=${beforeStats.speed}, Stamina=${beforeStats.stamina}, Power=${beforeStats.power}, Energy=${beforeEnergy}`);
      
      // Perform smart training based on current situation
      const trainingType = getSmartTraining(turn, beforeEnergy);
      const trainingInput = trainingMap[trainingType];
      
      console.log(`Training choice: ${trainingType} (${trainingInput})`);
      
      const trainingResult = this.app.handleTrainingInput(trainingInput);
      
      if (!trainingResult || !trainingResult.success) {
        throw new Error(`Training failed on turn ${turn}: ${JSON.stringify(trainingResult)}`);
      }
      
      // Check if race occurred
      if (this.app.currentState === 'race_results') {
        racesEncountered++;
        console.log(`🏁 RACE ${racesEncountered} occurred!`);
        
        // Continue past race results
        const continueResult = this.app.handleRaceResultsInput('enter');
        if (!continueResult.success) {
          throw new Error(`Failed to continue from race results: ${JSON.stringify(continueResult)}`);
        }
        
        // Update races completed
        this.testResults.racesCompleted = racesEncountered;
      }
      
      // Validate we're still in training or completed
      if (this.app.currentState !== 'training' && this.app.currentState !== 'career_complete') {
        throw new Error(`Unexpected state after turn ${turn}: ${this.app.currentState}`);
      }
      
      if (this.app.currentState === 'training') {
        const afterStats = { ...character.getCurrentStats() };
        const afterEnergy = character.condition.energy;
        
        console.log(`After:  Speed=${afterStats.speed}, Stamina=${afterStats.stamina}, Power=${afterStats.power}, Energy=${afterEnergy}`);
        
        // Validate stats changed appropriately
        if (trainingType === 'speed' && afterStats.speed <= beforeStats.speed) {
          console.log('⚠️ Warning: Speed training did not increase speed');
        }
        if (trainingType === 'stamina' && afterStats.stamina <= beforeStats.stamina) {
          console.log('⚠️ Warning: Stamina training did not increase stamina');
        }
        if (trainingType === 'power' && afterStats.power <= beforeStats.power) {
          console.log('⚠️ Warning: Power training did not increase power');
        }
        if (trainingType === 'rest' && afterEnergy <= beforeEnergy) {
          console.log('⚠️ Warning: Rest did not increase energy');
        }
        
        // Validate turn progression
        const currentTurn = character.career.turn;
        if (currentTurn !== turn + 1) {
          throw new Error(`Turn progression error. Expected turn ${turn + 1}, got ${currentTurn}`);
        }
        
        turn = currentTurn;
      } else {
        // Career completed
        break;
      }
    }
    
    // Validate career completion
    if (this.app.currentState !== 'career_complete') {
      throw new Error(`Career should be complete, but state is: ${this.app.currentState}`);
    }
    
    this.testResults.trainingPhase = true;
    this.testResults.careerCompleted = true;
    
    console.log(`\n✅ Career completed successfully!`);
    console.log(`   - Turns completed: ${turn - 1}`);
    console.log(`   - Races encountered: ${racesEncountered}`);
    
    // Validate expected races (should be 3: turns 4, 8, 12)
    if (racesEncountered !== 3) {
      this.testResults.errors.push(`Expected 3 races, but encountered ${racesEncountered}`);
    }
  }

  validateFinalResults() {
    console.log('\n📍 STEP 4: Final Results Validation');
    console.log('-----------------------------------');
    
    const character = this.app.game.character;
    if (!character) {
      throw new Error('Character object missing at end of game');
    }
    
    const finalStats = character.getCurrentStats();
    this.testResults.finalStats = finalStats;
    
    console.log('Final character stats:', finalStats);
    console.log('Career record:', {
      turn: character.career.turn,
      maxTurns: character.career.maxTurns,
      racesWon: character.career.racesWon,
      racesRun: character.career.racesRun,
      totalTraining: character.career.totalTraining
    });
    
    // Validate stats improved from initial values
    if (finalStats.speed <= 20 && finalStats.stamina <= 20 && finalStats.power <= 20) {
      this.testResults.errors.push('No stat improvement detected - all stats remain at starting values');
    }
    
    // Validate career completed properly
    if (character.career.turn < 12) {
      this.testResults.errors.push(`Career ended early at turn ${character.career.turn}`);
    }
    
    if (character.career.racesRun < 3) {
      this.testResults.errors.push(`Expected 3 races, but only ran ${character.career.racesRun}`);
    }
    
    console.log('✅ Final results validated');
  }

  reportResults() {
    console.log('\n🏆 COMPLETE GAMEPLAY TEST RESULTS');
    console.log('=================================');
    
    console.log('Character Creation:', this.testResults.characterCreation ? '✅ PASSED' : '❌ FAILED');
    console.log('Training Phase:', this.testResults.trainingPhase ? '✅ PASSED' : '❌ FAILED');
    console.log('Career Completion:', this.testResults.careerCompleted ? '✅ PASSED' : '❌ FAILED');
    console.log('Races Completed:', this.testResults.racesCompleted, '/3');
    
    if (this.testResults.finalStats) {
      console.log('Final Stats:', this.testResults.finalStats);
    }
    
    if (this.testResults.errors.length > 0) {
      console.log('\n⚠️ WARNINGS/ERRORS:');
      this.testResults.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    const passed = this.testResults.characterCreation && 
                   this.testResults.trainingPhase && 
                   this.testResults.careerCompleted && 
                   this.testResults.racesCompleted >= 3;
    
    console.log('\n🎯 OVERALL RESULT:', passed ? '✅ PASSED' : '❌ FAILED');
    
    if (passed) {
      console.log('\n🎉 Complete gameplay regression test SUCCESSFUL!');
      console.log('The game is fully playable from start to finish.');
    } else {
      console.log('\n💥 Complete gameplay regression test FAILED!');
      console.log('Critical gameplay issues detected.');
    }
    
    return passed;
  }
}

// Run the complete gameplay test
async function main() {
  const tester = new GameplayTester();
  
  try {
    await tester.runCompleteGameplay();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Gameplay test crashed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}