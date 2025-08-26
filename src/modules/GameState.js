/**
 * GameState Module
 * Game state management and transition validation
 */

class GameState {
  constructor() {
    // Initial state
    this.current = 'character_creation';
    
    // State transition history
    this.history = ['character_creation'];
    
    // Valid state transitions - prevents the duplicate state issues encountered
    this.validTransitions = {
      'character_creation': ['training'],
      'training': ['race_preview', 'career_complete'],
      'race_preview': ['race_lineup'],
      'race_lineup': ['race_animation'],
      'race_animation': ['race_results'],
      'race_results': ['training', 'career_complete'],
      'career_complete': ['character_creation'] // Allow new career
    };
  }

  /**
   * Transition to a new state
   * @param {string} newState - Target state
   * @returns {object} Transition result
   */
  transition(newState) {
    // Check for duplicate state (ignore duplicate transitions)
    if (this.current === newState) {
      return {
        success: true,
        ignored: true,
        previousState: this.current
      };
    }

    // Validate transition
    const allowedStates = this.validTransitions[this.current] || [];
    if (!allowedStates.includes(newState)) {
      throw new Error(
        `Invalid transition: ${this.current} -> ${newState}. ` +
        `Valid transitions from ${this.current}: ${allowedStates.join(', ')}`
      );
    }

    // Perform transition
    const previousState = this.current;
    this.current = newState;
    this.history.push(newState);

    return {
      success: true,
      ignored: false,
      previousState: previousState
    };
  }

  /**
   * Check if currently in specified state
   * @param {string} state - State to check
   * @returns {boolean} True if in specified state
   */
  is(state) {
    return this.current === state;
  }

  /**
   * Get valid next states from current state
   * @returns {array} Array of valid next states
   */
  getValidNextStates() {
    return this.validTransitions[this.current] || [];
  }

  /**
   * Get state transition history
   * @returns {array} Array of states in chronological order
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Go back to previous state (if valid)
   * @returns {object} Transition result
   */
  goBack() {
    if (this.history.length < 2) {
      return {
        success: false,
        error: 'No previous state to return to'
      };
    }

    // Get previous state (second to last in history)
    const previousState = this.history[this.history.length - 2];
    
    // For goBack, we allow returning to the previous state since we came from there
    // Remove current state from history and transition back
    this.history.pop();
    this.current = previousState;

    return {
      success: true,
      newState: this.current
    };
  }

  /**
   * Reset state to initial state
   */
  reset() {
    this.current = 'character_creation';
    this.history = ['character_creation'];
  }

  /**
   * Check if transition is valid without performing it
   * @param {string} targetState - State to check transition to
   * @returns {boolean} True if transition is valid
   */
  canTransitionTo(targetState) {
    if (this.current === targetState) {
      return true; // Always allow staying in same state
    }
    
    const allowedStates = this.validTransitions[this.current] || [];
    return allowedStates.includes(targetState);
  }

  /**
   * Get current state information
   * @returns {object} State information
   */
  getStateInfo() {
    return {
      current: this.current,
      validNextStates: this.getValidNextStates(),
      historyLength: this.history.length,
      canGoBack: this.history.length > 1
    };
  }

  /**
   * Validate state machine configuration
   * @returns {object} Validation result
   */
  validateConfiguration() {
    const issues = [];
    
    // Check for unreachable states
    const allStates = new Set(Object.keys(this.validTransitions));
    const reachableStates = new Set(['character_creation']);
    
    // Build reachable states
    let changed = true;
    while (changed) {
      changed = false;
      for (const [state, transitions] of Object.entries(this.validTransitions)) {
        if (reachableStates.has(state)) {
          for (const target of transitions) {
            if (!reachableStates.has(target)) {
              reachableStates.add(target);
              changed = true;
            }
          }
        }
      }
    }
    
    // Check for unreachable states
    for (const state of allStates) {
      if (!reachableStates.has(state)) {
        issues.push(`State ${state} is unreachable`);
      }
    }
    
    // Check for dead ends (states with no outgoing transitions)
    for (const [state, transitions] of Object.entries(this.validTransitions)) {
      if (transitions.length === 0 && state !== 'career_complete') {
        issues.push(`State ${state} is a dead end`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      totalStates: allStates.size,
      reachableStates: reachableStates.size
    };
  }
}

module.exports = GameState;