/**
 * State Machine Input Handler Unit Tests
 * 
 * Tests the state machine's input handling configuration and behavior
 * to ensure every state has proper input coverage and error handling.
 */

const GameStateMachine = require('../../src/systems/GameStateMachine');
const GameApp = require('../../src/GameApp');

describe('State Machine Input Handlers', () => {
  let gameApp;
  let stateMachine;
  
  beforeEach(() => {
    gameApp = new GameApp();
    gameApp.render = jest.fn(); // Mock render to prevent UI interference during tests
    stateMachine = gameApp.stateMachine;
  });
  
  describe('Input Handler Configuration', () => {
    const requiredStates = [
      'main_menu',
      'character_creation', 
      'training',
      'race_preview',
      'race_results',
      'career_complete'
    ];
    
    it('should have input handlers configured for all required states', () => {
      for (const state of requiredStates) {
        const inputHandlers = stateMachine.inputHandlers.get(state);
        expect(inputHandlers).toBeDefined();
        expect(inputHandlers).toBeInstanceOf(Map);
        expect(inputHandlers.size).toBeGreaterThan(0);
      }
    });
    
    describe('Main Menu Input Handlers', () => {
      it('should handle all valid main menu inputs', () => {
        const mainMenuHandlers = stateMachine.inputHandlers.get('main_menu');
        const expectedInputs = ['1', '2', '3', '4', 'h', 'q'];
        
        for (const input of expectedInputs) {
          expect(mainMenuHandlers.has(input)).toBe(true);
        }
      });
    });
    
    describe('Character Creation Input Handlers', () => {
      it('should handle all valid character creation inputs', () => {
        const ccHandlers = stateMachine.inputHandlers.get('character_creation');
        const expectedInputs = ['1', '2', '3', '4', '5', '6', 'g', 'q', 'text'];
        
        for (const input of expectedInputs) {
          expect(ccHandlers.has(input)).toBe(true);
        }
      });
      
      it('should map all inputs to create_character action', () => {
        const ccHandlers = stateMachine.inputHandlers.get('character_creation');
        
        for (const [input, action] of ccHandlers.entries()) {
          expect(action).toBe('create_character');
        }
      });
    });
    
    describe('Training Input Handlers', () => {
      it('should handle all valid training inputs', () => {
        const trainingHandlers = stateMachine.inputHandlers.get('training');
        expect(trainingHandlers).toBeDefined();
        
        const expectedInputs = ['1', '2', '3', '4', '5', 's', 'h', 'q', 'r'];
        
        for (const input of expectedInputs) {
          expect(trainingHandlers.has(input)).toBe(true);
        }
      });
      
      it('should map training inputs to correct actions', () => {
        const trainingHandlers = stateMachine.inputHandlers.get('training');
        
        expect(trainingHandlers.get('1')).toBe('speed_training');
        expect(trainingHandlers.get('2')).toBe('stamina_training');
        expect(trainingHandlers.get('3')).toBe('power_training');
        expect(trainingHandlers.get('4')).toBe('rest_training');
        expect(trainingHandlers.get('5')).toBe('media_training');
        expect(trainingHandlers.get('s')).toBe('save_game');
        expect(trainingHandlers.get('q')).toBe('main_menu');
        expect(trainingHandlers.get('h')).toBe('help');
        expect(trainingHandlers.get('r')).toBe('show_races');
      });
    });
  });
  
  describe('Input Processing Behavior', () => {
    it('should process valid inputs successfully', () => {
      stateMachine.transitionTo('main_menu');
      
      const result = stateMachine.processGameInput('1');
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid inputs with proper error messages', () => {
      stateMachine.transitionTo('main_menu');
      
      const result = stateMachine.processGameInput('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
      expect(result.availableInputs).toBeDefined();
      expect(Array.isArray(result.availableInputs)).toBe(true);
    });
    
    it('should provide available inputs for invalid input attempts', () => {
      stateMachine.transitionTo('training');
      
      const result = stateMachine.processGameInput('9');
      expect(result.success).toBe(false);
      expect(result.availableInputs).toContain('1');
      expect(result.availableInputs).toContain('2');
      expect(result.availableInputs).toContain('3');
      expect(result.availableInputs).toContain('4');
      expect(result.availableInputs).toContain('5');
    });
  });
  
  describe('Action Handler Coverage', () => {
    it('should have action handlers for all mapped actions', () => {
      const allStates = ['main_menu', 'character_creation', 'training', 'race_preview', 'race_results', 'career_complete'];
      const usedActions = new Set();
      
      // Collect all actions used in input handlers
      for (const state of allStates) {
        const inputHandlers = stateMachine.inputHandlers.get(state);
        if (inputHandlers) {
          for (const action of inputHandlers.values()) {
            usedActions.add(action);
          }
        }
      }
      
      // Verify each action has a handler
      for (const action of usedActions) {
        const result = stateMachine.handleCustomAction(action, 'test', {});
        // Action should either succeed or fail gracefully, not throw
        expect(result).toBeDefined();
        if (typeof result.success !== 'boolean') {
          console.error(`Action "${action}" returned result without success field:`, result);
        }
        expect(typeof result.success).toBe('boolean');
      }
    });
  });
  
  describe('State Transition Validation', () => {
    it('should maintain state consistency during input processing', () => {
      const initialState = 'main_menu';
      stateMachine.transitionTo(initialState);
      
      // Valid input should either maintain state or transition to valid state
      const result = stateMachine.processGameInput('1');
      const newState = stateMachine.getCurrentState();
      
      expect(['main_menu', 'character_creation', 'training', 'race_preview', 'race_results', 'career_complete'].includes(newState)).toBe(true);
    });
    
    it('should not change state on invalid input', () => {
      const initialState = 'main_menu';
      stateMachine.transitionTo(initialState);
      
      const result = stateMachine.processGameInput('invalid');
      expect(result.success).toBe(false);
      expect(stateMachine.getCurrentState()).toBe(initialState);
    });
  });
  
  describe('Error Boundary Behavior', () => {
    it('should handle missing state gracefully', () => {
      // Force state machine into invalid state
      stateMachine.currentState = 'nonexistent_state';
      
      const result = stateMachine.processGameInput('1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No input handler');
    });
    
    it('should handle action handler errors gracefully', () => {
      // This test would require mocking action handlers to throw errors
      // For now, we ensure the system doesn't crash on unexpected situations
      
      stateMachine.transitionTo('main_menu');
      const result = stateMachine.processGameInput('1');
      
      // Should not throw, should return a result object
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });
});