/**
 * Race Preview Bug Reproduction Test
 * Tests to reproduce the specific issue from the screenshot
 */

const GameApp = require('../../src/GameApp');

describe('Race Preview Bug Reproduction', () => {
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

  test('should reproduce the exact scenario from screenshot', () => {
    // Create character (this should put us in training state at turn 1)
    const createResult = app.createCharacter('Screenshot Test');
    expect(createResult.success).toBe(true);
    expect(app.currentState).toBe('training');
    expect(app.game.character.career.turn).toBe(1);
    
    console.log(`Initial state: ${app.currentState}, Turn: ${app.game.character.career.turn}`);
    
    // Check what races are scheduled
    const scheduledRaces = app.game.getScheduledRaces();
    console.log('Scheduled races:', scheduledRaces.map(r => `Turn ${r.turn}: ${r.name}`));
    
    // The screenshot shows "Race: Debut Sprint, Turn: 4" in the UI
    // But the user is on Turn 1 and there are NPH training messages showing
    
    // Verify first race is on turn 4, not turn 1
    const firstRace = scheduledRaces[0];
    expect(firstRace.turn).toBe(4);
    expect(firstRace.name).toBe('Debut Sprint');
    
    // Training on turn 1 should NOT trigger race
    const turn1Training = app.performTrainingSync('speed');
    expect(turn1Training.success).toBe(true);
    expect(turn1Training.raceReady).toBeFalsy();
    expect(app.currentState).toBe('training');
    expect(app.game.character.career.turn).toBe(2);
    
    console.log(`After turn 1 training: State=${app.currentState}, Turn=${app.game.character.career.turn}`);
    
    // Continue training until turn 4
    let currentTurn = app.game.character.career.turn;
    while (currentTurn < 4) {
      console.log(`Training on turn ${currentTurn}`);
      const trainingResult = app.performTrainingSync('speed');
      expect(trainingResult.success).toBe(true);
      expect(trainingResult.raceReady).toBeFalsy();
      expect(app.currentState).toBe('training');
      
      currentTurn = app.game.character.career.turn;
      console.log(`After training: Turn is now ${currentTurn}`);
    }
    
    // Now we should be at turn 4, race should be available
    expect(app.game.character.career.turn).toBe(4);
    const raceNow = app.game.checkForScheduledRace();
    expect(raceNow).toBeDefined();
    expect(raceNow.name).toBe('Debut Sprint');
    
    // Training on turn 4 should trigger the race
    const raceTraining = app.performTrainingSync('speed');
    expect(raceTraining.success).toBe(true);
    expect(raceTraining.raceReady).toBe(true);
    expect(app.currentState).toBe('race_preview');
    
    console.log('Race correctly triggered on turn 4');
  });

  test('should verify NPH training simulation timing', () => {
    // The screenshot shows NPH training messages, which suggests
    // NPH training might be running when it shouldn't
    
    app.createCharacter('NPH Timing Test');
    expect(app.game.character.career.turn).toBe(1);
    
    // Check if NPH roster exists and when it runs
    if (app.game.nphRoster) {
      console.log('NPH roster exists, checking training timing');
      
      // NPH training should align with player turns
      const initialNPHCount = app.game.nphRoster.nphs.length;
      console.log(`NPH count: ${initialNPHCount}`);
      
      // Player training should trigger NPH progression
      const beforeTraining = Date.now();
      app.performTrainingSync('speed');
      const afterTraining = Date.now();
      
      console.log(`Training took ${afterTraining - beforeTraining}ms`);
      
      // NPH training should happen during player training
      // but not cause display issues
    }
  });

  test('should check UI state vs game state consistency', () => {
    app.createCharacter('UI Consistency Test');
    
    // Get game status that UI would display
    const gameStatus = app.game.getGameStatus();
    
    console.log('Game status:', {
      turn: gameStatus.turn,
      maxTurns: gameStatus.maxTurns,
      character: gameStatus.character?.name,
      nextRace: gameStatus.nextRace
    });
    
    // UI should show turn 1, next race on turn 4
    expect(gameStatus.turn).toBe(1);
    expect(gameStatus.maxTurns).toBe(12);
    
    if (gameStatus.nextRace) {
      expect(gameStatus.nextRace.turn).toBe(4);
      expect(gameStatus.nextRace.name).toBe('Debut Sprint');
    }
    
    // Current state should be training
    expect(app.currentState).toBe('training');
  });

  test('should handle the exact input sequence from screenshot', () => {
    // Reproduce the exact scenario: user created character, 
    // is in training, and sees race preview when they shouldn't
    
    app.createCharacter('Exact Sequence Test');
    expect(app.currentState).toBe('training');
    expect(app.game.character.career.turn).toBe(1);
    
    // User would see training options and press '1' for speed training
    const result = app.handleKeyInput('1');
    expect(result.success).toBe(true);
    
    // After speed training on turn 1, should still be in training
    // NOT in race preview as shown in screenshot
    expect(app.currentState).toBe('training');
    expect(app.game.character.career.turn).toBe(2);
    
    // Verify no race was triggered
    expect(app.upcomingRace).toBeUndefined();
    
    console.log('Input sequence handled correctly - no premature race');
  });

  test('should identify any race condition in turn advancement', () => {
    app.createCharacter('Race Condition Test');
    
    const turnLog = [];
    
    // Rapidly perform training to see if there are any race conditions
    for (let i = 0; i < 5; i++) {
      const beforeTurn = app.game.character.career.turn;
      const beforeState = app.currentState;
      
      turnLog.push(`Before training ${i + 1}: Turn=${beforeTurn}, State=${beforeState}`);
      
      const result = app.performTrainingSync('rest'); // Use rest to avoid energy issues
      
      const afterTurn = app.game.character.career.turn;
      const afterState = app.currentState;
      
      turnLog.push(`After training ${i + 1}: Turn=${afterTurn}, State=${afterState}, Success=${result.success}, RaceReady=${result.raceReady}`);
      
      // Each training should advance turn by exactly 1
      expect(afterTurn).toBe(beforeTurn + 1);
      
      // Should not trigger race until proper turn
      if (afterTurn < 4) {
        expect(result.raceReady).toBeFalsy();
        expect(afterState).toBe('training');
      }
    }
    
    console.log('Turn advancement log:', turnLog);
  });
});