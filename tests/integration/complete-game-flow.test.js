/**
 * Complete Game Flow Integration Tests
 * 
 * These tests define the expected behavior of the complete game system.
 * They test the user journey from start to finish, ensuring that:
 * 1. Every state handles all valid inputs correctly
 * 2. Invalid inputs are rejected gracefully 
 * 3. State transitions are deterministic
 * 4. The game never enters an unresponsive state
 */

const GameApp = require('../../src/GameApp');

describe('Complete Game Flow Integration', () => {
  let gameApp;
  
  beforeEach(() => {
    gameApp = new GameApp();
  });
  
  afterEach(() => {
    if (gameApp && gameApp.quit) {
      gameApp.quit();
    }
  });

  describe('Full User Journey: Happy Path', () => {
    it('should complete entire game flow: main menu → character creation → training → race', async () => {
      // Start at main menu
      expect(gameApp.currentState).toBe('main_menu');
      
      // Navigate to character creation
      const menuResult = await gameApp.handleKeyInput('1');
      expect(menuResult.success).toBe(true);
      expect(gameApp.currentState).toBe('character_creation');
      
      // Generate names
      const genResult = await gameApp.handleKeyInput('g');
      expect(genResult.success).toBe(true);
      expect(gameApp.nameOptions).toHaveLength(6);
      expect(gameApp.currentState).toBe('character_creation');
      
      // Store first name option before selecting it
      const firstNameOption = gameApp.nameOptions[0];
      expect(firstNameOption).toBeTruthy();
      
      // Select first name
      const selectResult = await gameApp.handleKeyInput('1');
      expect(selectResult.success).toBe(true);
      expect(gameApp.currentState).toBe('training');
      expect(gameApp.game.character).toBeTruthy();
      expect(gameApp.game.character.name).toBe(firstNameOption);
      
      // Perform speed training
      const trainResult = await gameApp.handleKeyInput('1');
      expect(trainResult.success).toBe(true);
      expect(gameApp.currentState).toBe('training');
      expect(gameApp.game.character.career.turn).toBe(2);
      
      // Continue training until race
      let currentTurn = gameApp.game.character.career.turn;
      while (currentTurn < 4 && gameApp.currentState === 'training') {
        const result = await gameApp.handleKeyInput('1'); // Speed training
        expect(result.success).toBe(true);
        currentTurn = gameApp.game.character.career.turn;
      }
      
      // Should transition to race when turn 4 is reached
      expect(gameApp.currentState).toBe('race_preview');
    });
  });

  describe('State-Specific Input Handling', () => {
    describe('Main Menu State', () => {
      beforeEach(() => {
        gameApp.stateMachine.reset('main_menu');
      });
      
      it('should handle all valid main menu inputs', async () => {
        const validInputs = ['1', '2', '3', '4', 'h', 'q'];
        
        for (const input of validInputs) {
          const result = await gameApp.handleKeyInput(input);
          expect(result.success).toBe(true);
          
          // Reset to main menu for next test
          gameApp.stateMachine.reset('main_menu');
        }
      });
      
      it('should reject invalid main menu inputs gracefully', async () => {
        const invalidInputs = ['0', '5', '9', 'x', '', ' ', '!@#'];
        
        for (const input of invalidInputs) {
          const result = await gameApp.handleKeyInput(input);
          expect(result.success).toBe(false);
          expect(result.error).toBeTruthy();
          expect(gameApp.currentState).toBe('main_menu'); // Should stay in same state
        }
      });
    });

    describe('Character Creation State', () => {
      beforeEach(async () => {
        gameApp.stateMachine.reset('main_menu');
        await gameApp.handleKeyInput('1'); // Navigate to character creation
      });
      
      it('should handle all valid character creation inputs', async () => {
        // Generate names first
        await gameApp.handleKeyInput('g');
        
        const validInputs = ['1', '2', '3', '4', '5', '6', 'g', 'q'];
        
        for (const input of validInputs.slice(0, -1)) { // Exclude 'q' from loop
          const result = await gameApp.handleKeyInput(input);
          expect(result.success).toBe(true);
          
          if (['1', '2', '3', '4', '5', '6'].includes(input)) {
            // Name selection should create character and transition to training
            expect(gameApp.currentState).toBe('training');
            break;
          }
        }
      });
      
      it('should handle custom name input', async () => {
        const customName = 'Thunder Strike';
        
        // Type custom name character by character
        for (const char of customName) {
          if (char === ' ') continue; // Skip spaces for now
          const result = await gameApp.handleKeyInput(char);
          expect(result.success).toBe(true);
        }
        
        // Submit name
        const submitResult = await gameApp.handleKeyInput('\n');
        expect(submitResult.success).toBe(true);
        expect(gameApp.currentState).toBe('training');
      });
    });

    describe('Training State', () => {
      beforeEach(async () => {
        // Create character and get to training state
        gameApp.stateMachine.reset('main_menu');
        await gameApp.handleKeyInput('1'); // Go to character creation
        await gameApp.handleKeyInput('g'); // Generate names
        await gameApp.handleKeyInput('1'); // Select first name
        expect(gameApp.currentState).toBe('training');
      });
      
      it('should handle all valid training inputs', async () => {
        const validInputs = ['1', '2', '3', '4', '5', 's', 'q'];
        
        for (const input of validInputs.slice(0, -1)) { // Exclude 'q' from loop
          const initialState = gameApp.currentState;
          const result = await gameApp.handleKeyInput(input);
          
          expect(result.success).toBe(true);
          
          // Training inputs should either stay in training or advance turn
          if (['1', '2', '3', '4', '5'].includes(input)) {
            expect(['training', 'race_preview'].includes(gameApp.currentState)).toBe(true);
          }
          
          // If we hit a race, break out of test
          if (gameApp.currentState === 'race_preview') {
            break;
          }
        }
      });
      
      it('should reject invalid training inputs gracefully', async () => {
        const invalidInputs = ['0', '6', '9', 'x', '', '!@#'];
        
        for (const input of invalidInputs) {
          const result = await gameApp.handleKeyInput(input);
          expect(result.success).toBe(false);
          expect(result.error).toBeTruthy();
          expect(['training', 'race_preview'].includes(gameApp.currentState)).toBe(true);
        }
      });
      
      it('should maintain game state consistency during training', async () => {
        const initialTurn = gameApp.game.character.career.turn;
        const initialStats = { ...gameApp.game.character.stats };
        
        // Perform speed training
        const result = await gameApp.handleKeyInput('1');
        expect(result.success).toBe(true);
        
        // Verify turn advanced
        expect(gameApp.game.character.career.turn).toBe(initialTurn + 1);
        
        // Verify speed stat increased
        expect(gameApp.game.character.stats.speed).toBeGreaterThan(initialStats.speed);
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle rapid input sequences without breaking', async () => {
      const inputs = ['1', 'g', '1', '1', '1', '1'];
      
      for (const input of inputs) {
        const result = await gameApp.handleKeyInput(input);
        
        // Should never leave game in broken state
        expect(['main_menu', 'character_creation', 'training', 'race_preview'].includes(gameApp.currentState)).toBe(true);
        
        // If we hit a race state, we can stop
        if (gameApp.currentState === 'race_preview') {
          break;
        }
      }
    });
    
    it('should handle inputs during state transitions gracefully', async () => {
      // This test would need to be implemented with async state transitions
      // For now, we verify that state is consistent after each input
      
      await gameApp.handleKeyInput('1');
      expect(gameApp.currentState).toBe('character_creation');
      
      await gameApp.handleKeyInput('g');
      expect(gameApp.currentState).toBe('character_creation');
      expect(gameApp.nameOptions.length).toBe(6);
      
      await gameApp.handleKeyInput('1');
      expect(gameApp.currentState).toBe('training');
      expect(gameApp.game.character).toBeTruthy();
    });
    
    it('should never enter unresponsive state', async () => {
      // Test various input sequences that might break the system
      const testSequences = [
        ['1', 'g', '1'], // Normal flow
        ['1', 'g', '9', '1'], // Invalid then valid
        ['1', 'x', 'g', '1'], // Invalid input in character creation
        ['2', '3', '4', '1', 'g', '1'] // Menu navigation then character creation
      ];
      
      for (const sequence of testSequences) {
        // Reset game for each test
        gameApp = new GameApp();
        
        for (const input of sequence) {
          await gameApp.handleKeyInput(input);
          
          // Game should never be unresponsive - currentState should always be valid
          expect(['main_menu', 'character_creation', 'training', 'race_preview', 'race_results', 'career_complete'].includes(gameApp.currentState)).toBe(true);
          
          // If we created a character and reached training, test passed
          if (gameApp.currentState === 'training' && gameApp.game.character) {
            break;
          }
        }
      }
    });
  });

  describe('State Machine Integrity', () => {
    it('should have input handlers configured for all game states', () => {
      const gameStates = ['main_menu', 'character_creation', 'training', 'race_preview', 'race_results', 'career_complete'];
      
      for (const state of gameStates) {
        const inputHandlers = gameApp.stateMachine.inputHandlers.get(state);
        expect(inputHandlers).toBeDefined();
        expect(inputHandlers.size).toBeGreaterThan(0);
      }
    });
    
    it('should define valid transitions for all states', () => {
      const gameStates = ['main_menu', 'character_creation', 'training', 'race_preview', 'race_results', 'career_complete'];
      
      for (const state of gameStates) {
        const transitions = gameApp.stateMachine.transitions.get(state);
        expect(transitions).toBeDefined();
        expect(transitions.size).toBeGreaterThan(0);
      }
    });
  });
});