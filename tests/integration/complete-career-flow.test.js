/**
 * Complete Career Flow Integration Test
 * Tests the entire game progression from character creation to career completion
 */

const GameApp = require('../../src/GameApp');

describe('Complete Career Flow', () => {
  let app;

  beforeEach(() => {
    app = new GameApp();
  });

  afterEach(() => {
    if (app) {
      app.cleanup();
    }
  });

  test('should complete full career from start to finish', async () => {
    console.log('=== Testing Complete Career Flow ===');
    
    // 1. Character Creation
    const createResult = app.createCharacter('Career Test Horse');
    expect(createResult.success).toBe(true);
    expect(app.currentState).toBe('training');
    expect(app.game.character.career.turn).toBe(1);
    console.log('✅ Character creation works');

    // Track career progress
    const maxTurns = 12;
    const scheduledRaces = app.game.getScheduledRaces();
    console.log(`📋 Scheduled races: ${scheduledRaces.length}`);
    
    let racesCompleted = 0;
    let currentTurn = 1;

    while (currentTurn <= maxTurns && app.currentState !== 'career_complete') {
      console.log(`\n--- Turn ${currentTurn} ---`);
      
      // Check if we're expecting a race this turn
      const raceThisTurn = scheduledRaces.find(race => race.turn === currentTurn);
      
      if (raceThisTurn) {
        console.log(`🏁 Race expected: ${raceThisTurn.name}`);
        
        // Do training that should trigger race
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        
        if (trainingResult.raceReady) {
          console.log(`   Race triggered successfully`);
          expect(app.currentState).toBe('race_preview');
          
          // Test complete race flow
          console.log('   Testing race progression...');
          
          // race_preview → horse_lineup
          const previewResult = app.handleKeyInput('enter');
          expect(previewResult.success).toBe(true);
          expect(app.currentState).toBe('horse_lineup');
          
          // horse_lineup → strategy_select
          const lineupResult = app.handleKeyInput('enter');
          expect(lineupResult.success).toBe(true);
          expect(app.currentState).toBe('strategy_select');
          
          // strategy_select → race_running
          const strategyResult = app.handleKeyInput('2'); // MID strategy
          expect(strategyResult.success).toBe(true);
          expect(app.currentState).toBe('race_running');
          expect(app.selectedStrategy).toBe('MID');
          
          // Wait for race animation to complete
          console.log('   Running race animation...');
          if (app.raceAnimation) {
            const raceResults = await app.raceAnimation.run();
            expect(raceResults).toBeDefined();
            expect(raceResults.results.length).toBeGreaterThan(0);
            
            // Should transition to race_results
            expect(app.currentState).toBe('race_results');
            
            // Test race results → training progression
            const resultsResult = app.handleKeyInput('enter');
            expect(resultsResult.success).toBe(true);
            
            racesCompleted++;
            console.log(`   ✅ Race ${racesCompleted} completed successfully`);
            
            // Should return to training (unless career is complete)
            if (racesCompleted < scheduledRaces.length) {
              expect(app.currentState).toBe('training');
            }
          }
        } else {
          console.log(`   ⚠️ Race not triggered for turn ${currentTurn}`);
        }
      } else {
        // Regular training turn
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        expect(app.currentState).toBe('training');
        console.log(`   Regular training completed`);
      }
      
      currentTurn = app.game.character.career.turn;
      
      // Prevent infinite loops
      if (currentTurn > maxTurns + 2) {
        throw new Error(`Career exceeded expected turns: ${currentTurn}`);
      }
    }

    console.log(`\n=== Career Summary ===`);
    console.log(`Final turn: ${currentTurn}`);
    console.log(`Races completed: ${racesCompleted}`);
    console.log(`Final state: ${app.currentState}`);
    console.log(`Career complete: ${app.currentState === 'career_complete'}`);

    // Verify career completion
    expect(racesCompleted).toBe(scheduledRaces.length);
    expect(app.currentState).toBe('career_complete');
    
    console.log('✅ Complete career flow successful!');
    
  }, 60000); // Allow 60 seconds for complete career

  test('should handle race transitions correctly at each scheduled race', () => {
    app.createCharacter('Race Transition Test');
    const scheduledRaces = app.game.getScheduledRaces();
    
    scheduledRaces.forEach(race => {
      console.log(`Testing race transition for turn ${race.turn}: ${race.name}`);
      
      // Advance to the race turn
      while (app.game.character.career.turn < race.turn) {
        app.performTrainingSync('speed');
      }
      
      // Training on race turn should trigger race
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.success).toBe(true);
      expect(trainingResult.raceReady).toBe(true);
      expect(app.currentState).toBe('race_preview');
      expect(app.upcomingRace).toBeDefined();
      expect(app.upcomingRace.name).toBe(race.name);
      
      // Reset for next race test by creating new app
      app.cleanup();
      app = new GameApp();
      app.createCharacter('Race Transition Test');
    });
  });

  test('should maintain correct game state throughout career', () => {
    app.createCharacter('State Test Horse');
    
    const initialStats = app.game.character.getCurrentStats();
    expect(initialStats.speed).toBeGreaterThan(0);
    expect(initialStats.stamina).toBeGreaterThan(0);
    expect(initialStats.power).toBeGreaterThan(0);
    
    // Train for a few turns and verify stats improve
    for (let i = 0; i < 3; i++) {
      const beforeStats = app.game.character.getCurrentStats();
      const trainingResult = app.performTrainingSync('speed');
      
      expect(trainingResult.success).toBe(true);
      expect(app.currentState).toBe('training');
      expect(app.game.character.career.turn).toBe(i + 2);
      
      const afterStats = app.game.character.getCurrentStats();
      expect(afterStats.speed).toBeGreaterThanOrEqual(beforeStats.speed);
    }
  });

  test('should handle ENTER key properly in all race states', () => {
    app.createCharacter('Enter Key Test');
    
    // Advance to a race
    while (app.game.character.career.turn < 4) {
      app.performTrainingSync('speed');
    }
    
    // Trigger race
    app.performTrainingSync('speed');
    expect(app.currentState).toBe('race_preview');
    
    // Test ENTER key in race_preview
    expect(app.isNavigationState()).toBe(true);
    const previewResult = app.handleKeyInput('enter');
    expect(previewResult.success).toBe(true);
    expect(app.currentState).toBe('horse_lineup');
    
    // Test ENTER key in horse_lineup
    expect(app.isNavigationState()).toBe(false); // horse_lineup not in navigation states
    const lineupResult = app.handleKeyInput('enter');
    expect(lineupResult.success).toBe(true);
    expect(app.currentState).toBe('strategy_select');
  });
});