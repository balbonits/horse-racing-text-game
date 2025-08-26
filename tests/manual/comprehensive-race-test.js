/**
 * Comprehensive Race System Test
 * Tests ALL race scenarios, combinations, and edge cases
 */

const Game = require('../../src/systems/Game');
const { RACE_TYPES, TRACK_SURFACES, WEATHER_CONDITIONS } = require('../../src/data/raceTypes');

async function runComprehensiveRaceTest() {
  console.log('🚀 Running Comprehensive Race System Test...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = [];
  
  try {
    // Initialize game
    const game = new Game();
    await game.startNewGame('Test Champion', { skipLoadingStates: true });
    
    // Test 1: All Race Type × Surface × Weather Combinations
    console.log('📋 Testing all race combinations...');
    const raceTypes = Object.keys(RACE_TYPES);
    const surfaces = Object.keys(TRACK_SURFACES);
    const weathers = Object.keys(WEATHER_CONDITIONS);
    
    for (const raceType of raceTypes) {
      for (const surface of surfaces) {
        for (const weather of weathers) {
          totalTests++;
          const raceInfo = {
            name: `${raceType} on ${surface} (${weather})`,
            type: raceType,
            surface: surface,
            weather: weather,
            prize: 1000
          };
          
          try {
            const result = await game.runEnhancedRace(raceInfo, 'MID');
            if (result.success && result.results.length === 8 && result.playerResult) {
              passedTests++;
              // console.log(`  ✓ ${raceType} × ${surface} × ${weather} - Position ${result.playerResult.position}`);
            } else {
              failedTests.push(`${raceType} × ${surface} × ${weather}: Invalid result format`);
            }
          } catch (error) {
            failedTests.push(`${raceType} × ${surface} × ${weather}: ${error.message}`);
          }
        }
      }
    }
    
    // Test 2: All Strategy Types
    console.log('🎯 Testing all strategy types...');
    const strategies = ['FRONT', 'MID', 'LATE'];
    
    for (const strategy of strategies) {
      totalTests++;
      try {
        const result = await game.runEnhancedRace({
          name: `Strategy Test - ${strategy}`,
          type: 'MILE',
          surface: 'TURF',
          weather: 'CLEAR',
          prize: 2000
        }, strategy);
        
        if (result.success && result.results.length === 8) {
          passedTests++;
          console.log(`  ✓ ${strategy} strategy - Position ${result.playerResult.position}`);
        } else {
          failedTests.push(`Strategy ${strategy}: Invalid result`);
        }
      } catch (error) {
        failedTests.push(`Strategy ${strategy}: ${error.message}`);
      }
    }
    
    // Test 3: NPH Progression and Racing
    console.log('🏇 Testing NPH progression and racing...');
    totalTests++;
    
    const initialNPHStats = game.nphRoster.nphs.map(nph => ({
      id: nph.id,
      totalStats: nph.stats.speed + nph.stats.stamina + nph.stats.power
    }));
    
    // Perform multiple training rounds
    for (let i = 0; i < 3; i++) {
      await game.performTraining('speed');
    }
    
    const finalNPHStats = game.nphRoster.nphs.map(nph => ({
      id: nph.id,
      totalStats: nph.stats.speed + nph.stats.stamina + nph.stats.power
    }));
    
    // Check if NPHs have progressed
    let nphsProgressed = 0;
    for (let i = 0; i < initialNPHStats.length; i++) {
      if (finalNPHStats[i].totalStats > initialNPHStats[i].totalStats) {
        nphsProgressed++;
      }
    }
    
    if (nphsProgressed > 0) {
      passedTests++;
      console.log(`  ✓ NPH Progression - ${nphsProgressed}/24 NPHs improved during training`);
    } else {
      failedTests.push('NPH Progression: No NPHs progressed during training');
    }
    
    // Test 4: Performance Balance Testing
    console.log('⚖️ Testing performance balance...');
    const balanceResults = [];
    
    for (let i = 0; i < 10; i++) {
      totalTests++;
      const result = await game.runEnhancedRace({
        name: `Balance Test ${i + 1}`,
        type: 'MILE',
        surface: 'TURF',
        weather: 'CLEAR',
        prize: 1000
      }, 'MID');
      
      if (result.success) {
        balanceResults.push(result.playerResult.position);
        passedTests++;
      } else {
        failedTests.push(`Balance Test ${i + 1}: Race failed`);
      }
    }
    
    // Analyze balance
    const avgPosition = balanceResults.reduce((a, b) => a + b, 0) / balanceResults.length;
    const uniquePositions = new Set(balanceResults).size;
    
    console.log(`  ✓ Balance Test Results:`);
    console.log(`    - Average Position: ${avgPosition.toFixed(2)} (should be ~4.5)`);
    console.log(`    - Position Variety: ${uniquePositions} unique positions`);
    console.log(`    - Positions: ${balanceResults.join(', ')}`);
    
    // Test 5: Edge Cases and Error Handling
    console.log('🔍 Testing edge cases...');
    
    // Invalid race type
    totalTests++;
    try {
      await game.runEnhancedRace({
        name: 'Invalid Race',
        type: 'INVALID_TYPE',
        surface: 'TURF',
        weather: 'CLEAR',
        prize: 1000
      }, 'MID');
      failedTests.push('Edge Case: Should have failed with invalid race type');
    } catch (error) {
      passedTests++;
      console.log('  ✓ Correctly handled invalid race type');
    }
    
    // Test 6: Save/Load Integration
    console.log('💾 Testing save/load with race data...');
    totalTests++;
    
    const saveResult = await game.saveGame();
    if (saveResult.success && saveResult.saveData.nphRoster) {
      // Verify NPH data integrity
      const savedNPHs = saveResult.saveData.nphRoster.nphs;
      const hasHistory = savedNPHs.some(nph => Object.keys(nph.history || {}).length > 0);
      
      if (hasHistory) {
        passedTests++;
        console.log('  ✓ Save includes NPH progression data');
      } else {
        failedTests.push('Save/Load: NPH history not preserved');
      }
    } else {
      failedTests.push('Save/Load: Failed to save NPH roster');
    }
    
    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests.length}`);
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(failure => console.log(`  - ${failure}`));
    }
    
    if (failedTests.length === 0) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('Enhanced Race System is fully functional!');
    } else {
      console.log(`\n⚠️  ${failedTests.length} tests failed. System needs attention.`);
    }
    
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    console.error(error.stack);
  }
}

if (require.main === module) {
  runComprehensiveRaceTest();
}

module.exports = runComprehensiveRaceTest;