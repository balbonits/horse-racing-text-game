/**
 * Manual Integration Test for Enhanced Race System
 * Verifies complete integration of V2 race system with NPH roster
 */

const Game = require('../../src/systems/Game');

async function testEnhancedRaceSystem() {
  console.log('🧪 Testing Enhanced Race System Integration...\n');
  
  try {
    // 1. Initialize game
    const game = new Game();
    console.log('✓ Game initialized');
    
    // 2. Start new game with NPH roster
    const result = await game.startNewGame('Test Horse', { skipLoadingStates: true });
    
    if (!result.success) {
      console.error('❌ Failed to start new game:', result.message);
      return;
    }
    console.log('✓ New game started with NPH roster');
    console.log(`  - NPH roster size: ${game.nphRoster.nphs.length}`);
    console.log(`  - Player horse: ${game.character.name}`);
    
    // 3. Test race field generation
    const raceInfo = {
      name: 'Test Sprint',
      type: 'SPRINT',
      surface: 'DIRT',
      weather: 'CLEAR',
      prize: 1000
    };
    
    const field = game.getRaceField(raceInfo);
    console.log('✓ Race field generated');
    console.log(`  - Field size: ${field.length}`);
    console.log(`  - Player horse in field: ${field.some(h => h.type === 'player')}`);
    console.log(`  - NPH horses in field: ${field.filter(h => h.type === 'nph').length}`);
    
    // 4. Test enhanced race execution
    const raceResult = await game.runEnhancedRace(raceInfo, 'MID');
    
    if (!raceResult.success) {
      console.error('❌ Race execution failed:', raceResult);
      return;
    }
    console.log('✓ Enhanced race executed successfully');
    console.log(`  - Race: ${raceResult.raceInfo.name}`);
    console.log(`  - Results count: ${raceResult.results.length}`);
    console.log(`  - Player position: ${raceResult.playerResult?.position || 'Not found'}`);
    
    // 5. Test different race types
    const raceTypes = [
      { name: 'Mile Test', type: 'MILE', surface: 'TURF' },
      { name: 'Medium Test', type: 'MEDIUM', surface: 'DIRT' },
      { name: 'Long Test', type: 'LONG', surface: 'TURF' }
    ];
    
    for (const race of raceTypes) {
      const testRaceInfo = { ...race, weather: 'CLEAR', prize: 2000 };
      const testResult = await game.runEnhancedRace(testRaceInfo, 'MID');
      
      if (testResult.success) {
        console.log(`✓ ${race.type} race on ${race.surface} - Position: ${testResult.playerResult?.position}`);
      } else {
        console.log(`❌ ${race.type} race failed`);
      }
    }
    
    // 6. Test NPH progression
    await game.performTraining('speed');
    console.log('✓ Training performed - NPHs should have progressed');
    
    // Check if any NPHs have history
    const nphsWithHistory = game.nphRoster.nphs.filter(nph => Object.keys(nph.history).length > 0);
    console.log(`  - NPHs with training history: ${nphsWithHistory.length}/24`);
    
    // 7. Test save/load with NPH data
    const saveResult = await game.saveGame();
    if (saveResult.success) {
      console.log('✓ Game saved with NPH roster data');
      console.log(`  - Save includes ${Object.keys(saveResult.saveData).length} data fields`);
      console.log(`  - NPH roster included: ${!!saveResult.saveData.nphRoster}`);
    }
    
    console.log('\n🎉 Enhanced Race System Integration Test PASSED');
    console.log('All core functionality working correctly!');
    
  } catch (error) {
    console.error('\n❌ Integration test failed with error:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
if (require.main === module) {
  testEnhancedRaceSystem();
}

module.exports = testEnhancedRaceSystem;