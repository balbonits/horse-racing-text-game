/**
 * GameState Module Tests
 * Tests for game state management and transitions
 */

const GameState = require('../../src/modules/GameState');

describe('GameState Module', () => {
  let gameState;
  
  beforeEach(() => {
    gameState = new GameState();
  });
  
  describe('Initial State', () => {
    test('should start in character_creation state', () => {
      expect(gameState.current).toBe('character_creation');
    });

    test('should have valid state transition rules defined', () => {
      expect(gameState.validTransitions).toBeDefined();
      expect(typeof gameState.validTransitions).toBe('object');
    });
  });
  
  describe('State Transitions', () => {
    test('should allow valid transitions from character_creation', () => {
      const result = gameState.transition('training');
      
      expect(result.success).toBe(true);
      expect(result.ignored).toBeFalsy();
      expect(gameState.current).toBe('training');
    });
    
    test('should allow training to race_preview transition', () => {
      gameState.transition('training');
      
      const result = gameState.transition('race_preview');
      expect(result.success).toBe(true);
      expect(gameState.current).toBe('race_preview');
    });

    test('should allow complete race flow', () => {
      gameState.transition('training');
      gameState.transition('race_preview');
      gameState.transition('race_lineup');
      gameState.transition('race_animation');
      gameState.transition('race_results');
      
      expect(gameState.current).toBe('race_results');
    });

    test('should allow return to training from race_results', () => {
      gameState.transition('training');
      gameState.transition('race_preview');
      gameState.transition('race_lineup');
      gameState.transition('race_animation');
      gameState.transition('race_results');
      
      const result = gameState.transition('training');
      expect(result.success).toBe(true);
      expect(gameState.current).toBe('training');
    });
    
    test('should reject invalid transitions', () => {
      expect(() => {
        gameState.transition('race_results');
      }).toThrow('Invalid transition');
      
      expect(gameState.current).toBe('character_creation');
    });
    
    test('should ignore duplicate state transitions', () => {
      gameState.transition('training');
      
      const result = gameState.transition('training');
      
      expect(result.success).toBe(true);
      expect(result.ignored).toBe(true);
      expect(gameState.current).toBe('training');
    });

    test('should provide information about failed transitions', () => {
      try {
        gameState.transition('invalid_state');
      } catch (error) {
        expect(error.message).toContain('Invalid transition');
        expect(error.message).toContain('character_creation');
        expect(error.message).toContain('invalid_state');
      }
    });
  });
  
  describe('State Queries', () => {
    test('should correctly identify current state', () => {
      expect(gameState.is('character_creation')).toBe(true);
      expect(gameState.is('training')).toBe(false);
      
      gameState.transition('training');
      
      expect(gameState.is('training')).toBe(true);
      expect(gameState.is('character_creation')).toBe(false);
    });

    test('should provide list of valid next states', () => {
      const validNext = gameState.getValidNextStates();
      expect(validNext).toContain('training');
      
      gameState.transition('training');
      const validFromTraining = gameState.getValidNextStates();
      expect(validFromTraining).toContain('race_preview');
    });
  });

  describe('State History', () => {
    test('should track state transition history', () => {
      gameState.transition('training');
      gameState.transition('race_preview');
      
      const history = gameState.getHistory();
      expect(history).toEqual([
        'character_creation',
        'training', 
        'race_preview'
      ]);
    });

    test('should allow going back to previous state', () => {
      gameState.transition('training');
      gameState.transition('race_preview');
      
      const result = gameState.goBack();
      expect(result.success).toBe(true);
      expect(gameState.current).toBe('training');
    });
  });

  describe('Career End States', () => {
    test('should allow transition to career_complete', () => {
      gameState.transition('training');
      
      const result = gameState.transition('career_complete');
      expect(result.success).toBe(true);
      expect(gameState.current).toBe('career_complete');
    });
  });
});