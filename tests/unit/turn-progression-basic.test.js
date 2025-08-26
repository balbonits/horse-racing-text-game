/**
 * Basic Turn Progression Unit Tests
 * Simple tests to identify turn advancement issues
 */

const GameApp = require('../../src/GameApp');

describe('Basic Turn Progression', () => {
  let app;

  beforeEach(() => {
    app = new GameApp();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (app && app.cleanup) {
      app.cleanup();
    }
    jest.restoreAllMocks();
  });

  test('should start at turn 1', () => {
    const result = app.createCharacter('Turn Test');
    expect(result.success).toBe(true);
    expect(app.game.character.career.turn).toBe(1);
  });

  test('should advance turn after training', () => {
    app.createCharacter('Turn Advance Test');
    
    const initialTurn = app.game.character.career.turn;
    expect(initialTurn).toBe(1);
    
    const trainingResult = app.performTrainingSync('speed');
    expect(trainingResult.success).toBe(true);
    
    const newTurn = app.game.character.career.turn;
    console.log(`Turn progression: ${initialTurn} -> ${newTurn}`);
    
    expect(newTurn).toBe(initialTurn + 1);
  });

  test('should not trigger race on turn 1', () => {
    app.createCharacter('No Early Race Test');
    
    expect(app.game.character.career.turn).toBe(1);
    
    // Check race schedule
    const scheduledRaces = app.game.getScheduledRaces();
    console.log('Scheduled races:', scheduledRaces.map(r => `Turn ${r.turn}: ${r.name}`));
    
    // Check for race on turn 1
    const raceOnTurn1 = app.game.checkForScheduledRace();
    console.log('Race on turn 1:', raceOnTurn1);
    
    expect(raceOnTurn1).toBeFalsy();
    
    // Training on turn 1 should not trigger race
    const trainingResult = app.performTrainingSync('speed');
    expect(trainingResult.success).toBe(true);
    expect(trainingResult.raceReady).toBeFalsy();
    expect(app.currentState).toBe('training');
  });

  test('should show correct race schedule', () => {
    app.createCharacter('Race Schedule Test');
    
    const races = app.game.getScheduledRaces();
    expect(races.length).toBeGreaterThan(0);
    
    races.forEach(race => {
      expect(race.turn).toBeGreaterThan(1); // First race should not be on turn 1
      expect(race.turn).toBeLessThanOrEqual(12);
      expect(race.name).toBeDefined();
    });
    
    console.log('Race schedule verification passed');
  });

  test('should check race timing logic', () => {
    app.createCharacter('Race Timing Test');
    
    // Test race checking on different turns (races scheduled for 4,7,10,12)
    for (let turn = 1; turn <= 12; turn++) {
      // Manually set turn to test race checking logic
      app.game.character.career.turn = turn;
      
      const raceForTurn = app.game.checkForScheduledRace();
      console.log(`Turn ${turn}: Race = ${raceForTurn ? raceForTurn.name : 'None'}`);
      
      if (![4, 7, 10, 12].includes(turn)) {
        expect(raceForTurn).toBeFalsy();
      } else if ([4, 7, 10, 12].includes(turn)) {
        expect(raceForTurn).toBeTruthy();
        console.log(`✓ Race found on turn ${turn}: ${raceForTurn.name}`);
      }
    }
  });
});