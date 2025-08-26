/**
 * Turn Progression Integration Tests
 * Tests the core game experience of training turns and race timing
 */

const GameApp = require('../../src/GameApp');

describe('Turn Progression Core Experience', () => {
  let app;

  beforeEach(() => {
    app = new GameApp();
    
    // Suppress console output for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (app && app.cleanup) {
      app.cleanup();
    }
    jest.restoreAllMocks();
  });

  describe('Basic Turn Progression', () => {
    test('should start at turn 1 and advance correctly', () => {
      // Create character
      const result = app.createCharacter('TurnTest');
      expect(result.success).toBe(true);
      expect(app.game.character.career.turn).toBe(1);
    });

    test('should advance turn after training', () => {
      app.createCharacter('TurnTest');
      
      const initialTurn = app.game.character.career.turn;
      expect(initialTurn).toBe(1);
      
      // Perform training
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.success).toBe(true);
      
      // Turn should advance
      expect(app.game.character.career.turn).toBe(2);
    });

    test('should not trigger race before scheduled turn', () => {
      app.createCharacter('RaceTimingTest');
      
      // Get first scheduled race
      const firstRace = app.game.getScheduledRaces()[0];
      expect(firstRace.turn).toBe(4); // First race should be on turn 4
      
      // Do turns 1, 2, 3 - no races should trigger
      for (let turn = 1; turn < firstRace.turn; turn++) {
        const currentTurn = app.game.character.career.turn;
        console.log(`Training on turn ${currentTurn}, expecting turn ${turn}`);
        
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        expect(trainingResult.raceReady).toBeFalsy();
        expect(app.currentState).toBe('training');
        
        expect(app.game.character.career.turn).toBe(turn + 1);
      }
    });

    test('should trigger race only on correct scheduled turn', () => {
      app.createCharacter('RaceScheduleTest');
      
      const firstRace = app.game.getScheduledRaces()[0];
      
      // Advance to turn before race
      while (app.game.character.career.turn < firstRace.turn) {
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
      }
      
      // Now we should be at the race turn
      expect(app.game.character.career.turn).toBe(firstRace.turn);
      
      // Next training should trigger the race
      const raceTrainingResult = app.performTrainingSync('speed');
      expect(raceTrainingResult.success).toBe(true);
      expect(raceTrainingResult.raceReady).toBe(true);
      expect(app.currentState).toBe('race_preview');
    });
  });

  describe('Complete Turn Sequence', () => {
    test('should progress through all 12 turns correctly', () => {
      app.createCharacter('FullCareerTest');
      
      const turnLog = [];
      
      // Track turn progression
      for (let expectedTurn = 1; expectedTurn <= 12; expectedTurn++) {
        const currentTurn = app.game.character.career.turn;
        turnLog.push(`Before training: expected ${expectedTurn}, actual ${currentTurn}`);
        
        expect(currentTurn).toBe(expectedTurn);
        
        // Check if race is scheduled for this turn
        const raceScheduled = app.game.checkForScheduledRace();
        const scheduledRaces = app.game.getScheduledRaces();
        const raceForThisTurn = scheduledRaces.find(race => race.turn === currentTurn);
        
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        
        if (raceForThisTurn) {
          turnLog.push(`  Race expected on turn ${currentTurn}: ${raceForThisTurn.name}`);
          expect(trainingResult.raceReady).toBe(true);
          expect(app.currentState).toBe('race_preview');
          
          // Complete the race flow to continue
          app.setState('training'); // Simplified race completion
        } else {
          turnLog.push(`  No race on turn ${currentTurn}`);
          expect(trainingResult.raceReady).toBeFalsy();
          expect(app.currentState).toBe('training');
        }
        
        const newTurn = app.game.character.career.turn;
        turnLog.push(`After training: turn is now ${newTurn}`);
      }
      
      // Log the complete progression for debugging
      console.log('Turn progression log:', turnLog);
      
      expect(app.game.character.career.turn).toBe(13); // After 12 turns
    });

    test('should have exactly 3 scheduled races during career', () => {
      app.createCharacter('RaceCountTest');
      
      const scheduledRaces = app.game.getScheduledRaces();
      expect(scheduledRaces).toHaveLength(3);
      
      // Races should be spread across the 12 turns
      scheduledRaces.forEach(race => {
        expect(race.turn).toBeGreaterThan(0);
        expect(race.turn).toBeLessThanOrEqual(12);
      });
      
      // Races should be in order
      for (let i = 1; i < scheduledRaces.length; i++) {
        expect(scheduledRaces[i].turn).toBeGreaterThan(scheduledRaces[i-1].turn);
      }
    });
  });

  describe('Race Timing Edge Cases', () => {
    test('should handle race on turn 1 correctly', () => {
      app.createCharacter('Turn1RaceTest');
      
      // Manually set up a race on turn 1 to test edge case
      const mockRace = { turn: 1, name: 'Early Race' };
      app.game.raceSchedule = [mockRace];
      
      expect(app.game.character.career.turn).toBe(1);
      
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.success).toBe(true);
      expect(trainingResult.raceReady).toBe(true);
    });

    test('should handle race on final turn correctly', () => {
      app.createCharacter('FinalTurnTest');
      
      // Advance to turn 12
      while (app.game.character.career.turn < 12) {
        app.performTrainingSync('speed');
      }
      
      // Manually add race on turn 12
      const finalRace = { turn: 12, name: 'Final Race' };
      app.game.raceSchedule = [finalRace];
      
      expect(app.game.character.career.turn).toBe(12);
      
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.success).toBe(true);
      expect(trainingResult.raceReady).toBe(true);
    });

    test('should not trigger race if already past scheduled turn', () => {
      app.createCharacter('MissedRaceTest');
      
      // Advance past first race turn
      const firstRace = app.game.getScheduledRaces()[0];
      while (app.game.character.career.turn <= firstRace.turn) {
        app.performTrainingSync('speed');
      }
      
      // Should be past the race turn now
      expect(app.game.character.career.turn).toBeGreaterThan(firstRace.turn);
      
      // Continue training should not trigger the old race
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.success).toBe(true);
      expect(trainingResult.raceReady).toBeFalsy();
    });
  });

  describe('State Consistency', () => {
    test('should maintain correct state during turn progression', () => {
      app.createCharacter('StateTest');
      
      expect(app.currentState).toBe('training');
      
      // Each training that doesn't trigger a race should stay in training
      for (let i = 0; i < 3; i++) {
        const trainingResult = app.performTrainingSync('speed');
        expect(trainingResult.success).toBe(true);
        
        if (!trainingResult.raceReady) {
          expect(app.currentState).toBe('training');
        }
      }
    });

    test('should properly transition states when race triggers', () => {
      app.createCharacter('StateTransitionTest');
      
      // Advance to race turn
      const firstRace = app.game.getScheduledRaces()[0];
      while (app.game.character.career.turn < firstRace.turn) {
        app.performTrainingSync('speed');
      }
      
      expect(app.currentState).toBe('training');
      
      // Training on race turn should transition to race_preview
      const raceResult = app.performTrainingSync('speed');
      expect(raceResult.raceReady).toBe(true);
      expect(app.currentState).toBe('race_preview');
    });
  });
});