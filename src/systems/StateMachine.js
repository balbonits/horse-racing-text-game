/**
 * Sophisticated State Machine System
 * Replaces repetitive switch-case patterns with efficient data structures
 * Uses graph algorithms and state pattern for robust navigation
 * 
 * TIME & SPACE COMPLEXITY ANALYSIS:
 * =================================
 * 
 * Data Structures Used:
 * • Map<string, Set<string>>: O(1) average lookup, O(n) worst case
 * • Map<string, Map<string, any>>: O(1) average lookup for nested operations
 * • Set<string>: O(1) average membership test, O(log n) worst case
 * • Array (for history): O(1) push/pop, O(n) space
 * 
 * Key Operations:
 * • State transition validation: O(1) average - uses Map + Set lookup
 * • Input handling: O(1) average - direct Map lookup vs O(n) switch-case
 * • Path finding (BFS): O(V + E) time, O(V) space where V=states, E=transitions
 * • State initialization: O(n) where n = number of states
 * 
 * Memory Usage:
 * • Space Complexity: O(V + E) where V = states, E = transitions
 * • History Stack: O(d) where d = maximum navigation depth
 * • Event Listeners: O(l) where l = number of listeners
 * 
 * Performance Benefits vs Switch-Case:
 * • Switch-case: O(n) linear search through cases
 * • Map lookup: O(1) average case, significant improvement for large state machines
 * • Scalability: Adding new states/transitions is O(1) vs O(n) refactoring
 */

class StateMachine {
  constructor() {
    // CORE STATE MANAGEMENT
    // Map<stateName: string, allowedNextStates: Set<string>>
    // Example: 'training' -> Set(['race_preview', 'help', 'main_menu'])
    this.transitions = new Map();
    
    // COMMAND PATTERN HANDLERS  
    // Map<stateName: string, handlerFunction: Function>
    // These execute when entering a state (render, setup, etc.)
    this.stateHandlers = new Map();
    
    // INPUT ROUTING SYSTEM
    // Map<stateName: string, Map<input: string, action: string|object|function>>
    // Example: 'training' -> Map('1' -> 'speed_training', '2' -> 'stamina_training')
    this.inputHandlers = new Map();
    
    // STATE CONFIGURATION
    // Map<stateName: string, metadata: object>
    // Contains validation rules, UI hints, navigation options
    this.stateMetadata = new Map();
    
    // NAVIGATION STATE
    this.currentState = null; // Currently active state
    this.stateHistory = []; // Stack for back navigation (LIFO)
    
    // EVENT SYSTEM
    // Map<eventName: string, Set<listenerFunction: Function>>
    // Allows loose coupling between components
    this.listeners = new Map();
    
    // Initialize the state graph and routing tables
    this.initializeStates();
  }

  /**
   * Initialize all game states with their relationships
   * Uses declarative configuration instead of hardcoded switch statements
   */
  initializeStates() {
    // Define state graph structure
    const stateGraph = {
      'main_menu': {
        transitions: ['character_creation', 'load_game', 'help', 'training'],
        inputs: {
          '1': 'character_creation',
          '2': 'load_game', 
          '3': 'help',
          'h': 'help',
          'q': 'quit'
        },
        metadata: {
          allowEmpty: false,
          description: 'Main game menu',
          backEnabled: false
        }
      },
      
      'character_creation': {
        transitions: ['training', 'main_menu', 'race_preview'],
        inputs: {
          'text': 'create_character', // Special handler for names and numbers
          'g': 'create_character', // Generate name suggestions
          '1': 'create_character', // Name selection options
          '2': 'create_character',
          '3': 'create_character', 
          '4': 'create_character',
          '5': 'create_character',
          '6': 'create_character',
          'q': 'main_menu'
        },
        metadata: {
          allowEmpty: false,
          description: 'Create new character',
          backEnabled: true,
          backTarget: 'main_menu'
        }
      },
      
      'load_game': {
        transitions: ['training', 'main_menu'],
        inputs: {
          'text': 'load_game_by_number',
          'q': 'main_menu'
        },
        metadata: {
          allowEmpty: false,
          description: 'Select save file to load',
          backEnabled: true,
          backTarget: 'main_menu'
        }
      },
      
      'training': {
        transitions: ['race_preview', 'help', 'main_menu', 'career_complete'],
        inputs: {
          '1': 'speed_training',
          '2': 'stamina_training', 
          '3': 'power_training',
          '4': 'rest_training',
          '5': 'social_training',
          's': 'save_game',
          'h': 'help',
          'q': 'main_menu',
          'r': 'show_races'
        },
        metadata: {
          allowEmpty: false,
          description: 'Training phase',
          backEnabled: false
        }
      },
      
      'race_preview': {
        transitions: ['horse_lineup'],
        inputs: {
          'enter': 'horse_lineup',
          '': 'horse_lineup'
        },
        metadata: {
          allowEmpty: true,
          description: 'Pre-race information',
          backEnabled: false,
          autoProgress: 'horse_lineup'
        }
      },
      
      'horse_lineup': {
        transitions: ['strategy_select'],
        inputs: {
          'enter': 'strategy_select',
          '': 'strategy_select'
        },
        metadata: {
          allowEmpty: true,
          description: 'View competitors',
          backEnabled: false,
          autoProgress: 'strategy_select'
        }
      },
      
      'strategy_select': {
        transitions: ['race_running'],
        inputs: {
          '1': { target: 'race_running', data: 'FRONT' },
          '2': { target: 'race_running', data: 'MID' },
          '3': { target: 'race_running', data: 'LATE' }
        },
        metadata: {
          allowEmpty: false,
          description: 'Choose racing strategy',
          backEnabled: false
        }
      },
      
      'race_running': {
        transitions: ['race_results'],
        inputs: {
          'auto': 'race_results' // Animation handles transition
        },
        metadata: {
          allowEmpty: true,
          description: 'Race in progress',
          backEnabled: false,
          autoProgress: 'race_results'
        }
      },
      
      'race_results': {
        transitions: ['training', 'career_complete'],
        inputs: {
          'enter': 'training',
          '': 'training'
        },
        metadata: {
          allowEmpty: true,
          description: 'Combined race results and ceremony',
          backEnabled: false,
          autoProgress: 'training'
        }
      },
      
      'podium': {
        transitions: ['training', 'career_complete'],
        inputs: {
          'enter': 'training',
          '': 'training'
        },
        metadata: {
          allowEmpty: true,
          description: 'Victory ceremony',
          backEnabled: false,
          autoProgress: 'training'
        }
      },
      
      'help': {
        transitions: ['training', 'main_menu'],
        inputs: {
          'enter': 'back',
          '': 'back'
        },
        metadata: {
          allowEmpty: true,
          description: 'Help information',
          backEnabled: true,
          autoProgress: 'back'
        }
      },
      
      'career_complete': {
        transitions: ['main_menu', 'character_creation'],
        inputs: {
          'enter': 'character_creation',
          '': 'character_creation',
          'q': 'main_menu'
        },
        metadata: {
          allowEmpty: true,
          description: 'Career completed',
          backEnabled: false,
          autoProgress: 'character_creation'
        }
      }
    };

    // Build efficient data structures from configuration
    for (const [state, config] of Object.entries(stateGraph)) {
      this.transitions.set(state, new Set(config.transitions));
      this.inputHandlers.set(state, new Map(Object.entries(config.inputs)));
      this.stateMetadata.set(state, config.metadata);
    }
  }

  /**
   * Register a state handler using command pattern
   */
  registerStateHandler(state, handler) {
    this.stateHandlers.set(state, handler);
  }

  /**
   * Register event listener for state changes
   */
  addEventListener(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
  }

  /**
   * Fire event to all listeners
   */
  fireEvent(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * Transition to new state with validation
   * 
   * Time Complexity: O(1) average case
   * Space Complexity: O(1) for single transition + O(1) for history entry
   * 
   * Performance: Map.get() + Set.has() are both O(1) average
   * vs switch-case which would be O(n) linear scan
   */
  transitionTo(newState, context = {}) {
    if (!this.currentState) {
      this.currentState = newState;
      this.fireEvent('stateChanged', { from: null, to: newState, context });
      return { success: true };
    }

    // Check if transition is valid using set lookup O(1)
    const validTransitions = this.transitions.get(this.currentState);
    if (!validTransitions || !validTransitions.has(newState)) {
      const allowed = validTransitions ? Array.from(validTransitions) : [];
      return {
        success: false,
        error: `Invalid transition from ${this.currentState} to ${newState}`,
        allowedTransitions: allowed
      };
    }

    // Store previous state for back navigation
    this.stateHistory.push(this.currentState);
    
    // Perform transition
    const oldState = this.currentState;
    this.currentState = newState;
    
    // Fire events
    this.fireEvent('stateChanged', { from: oldState, to: newState, context });
    
    return { success: true };
  }

  /**
   * Handle input using efficient lookup
   * 
   * Time Complexity: O(1) average case for input resolution
   * Space Complexity: O(1) for temporary variables
   * 
   * Algorithm: Direct hash table lookup vs linear switch-case scan
   * Worst case: O(n) only if hash collisions occur (rare with good hash function)
   */
  handleInput(input, context = {}) {
    const inputMap = this.inputHandlers.get(this.currentState);
    if (!inputMap) {
      return { success: false, error: `No input handler for state ${this.currentState}` };
    }

    // Normalize input
    const normalizedInput = this.normalizeInput(input);
    
    // Try exact match first
    let handler = inputMap.get(normalizedInput);
    
    // Try special handlers
    if (!handler && this.isTextInput(normalizedInput)) {
      handler = inputMap.get('text');
    }
    
    if (!handler) {
      const metadata = this.stateMetadata.get(this.currentState);
      if (metadata?.allowEmpty && (normalizedInput === '' || normalizedInput === 'enter')) {
        handler = inputMap.get('') || inputMap.get('enter');
      }
    }

    if (!handler) {
      const availableInputs = Array.from(inputMap.keys()).filter(key => key !== 'text');
      return {
        success: false,
        error: `Invalid input "${input}" for state ${this.currentState}`,
        availableInputs: availableInputs
      };
    }

    // Execute handler
    return this.executeHandler(handler, normalizedInput, context);
  }

  /**
   * Execute input handler (can be string, object, or function)
   */
  executeHandler(handler, input, context) {
    if (typeof handler === 'string') {
      // Simple state transition
      if (handler === 'back') {
        return this.goBack();
      }
      
      if (handler === 'quit') {
        this.fireEvent('quit', context);
        return { success: true, action: 'quit' };
      }
      
      // Check if it's a state transition
      if (this.transitions.has(handler)) {
        return this.transitionTo(handler, context);
      }
      
      // It's a custom action
      this.fireEvent('customAction', { action: handler, input, context });
      return { success: true, action: handler };
      
    } else if (typeof handler === 'object') {
      // Handler with data
      const result = this.transitionTo(handler.target, { ...context, data: handler.data });
      if (result.success) {
        result.data = handler.data;
      }
      return result;
      
    } else if (typeof handler === 'function') {
      // Custom handler function
      return handler(input, context, this);
    }

    return { success: false, error: 'Invalid handler type' };
  }

  /**
   * Go back to previous state
   */
  goBack() {
    if (this.stateHistory.length === 0) {
      return { success: false, error: 'No previous state' };
    }

    const previousState = this.stateHistory.pop();
    const oldState = this.currentState;
    this.currentState = previousState;
    
    this.fireEvent('stateChanged', { from: oldState, to: previousState, context: { back: true } });
    return { success: true, action: 'back' };
  }

  /**
   * Get available transitions from current state
   */
  getAvailableTransitions() {
    const transitions = this.transitions.get(this.currentState);
    return transitions ? Array.from(transitions) : [];
  }

  /**
   * Get available inputs for current state
   */
  getAvailableInputs() {
    const inputMap = this.inputHandlers.get(this.currentState);
    return inputMap ? Array.from(inputMap.keys()) : [];
  }

  /**
   * Get state metadata
   */
  getStateMetadata(state = this.currentState) {
    return this.stateMetadata.get(state) || {};
  }

  /**
   * Check if state allows empty input
   */
  allowsEmptyInput(state = this.currentState) {
    const metadata = this.getStateMetadata(state);
    return metadata.allowEmpty || false;
  }

  /**
   * Get help text for current state
   */
  getHelpText() {
    const metadata = this.getStateMetadata();
    const inputs = this.getAvailableInputs().filter(input => input !== 'text');
    
    let help = metadata.description || `In ${this.currentState} state`;
    
    if (metadata.allowEmpty) {
      help += '\nPress ENTER to continue';
    }
    
    if (inputs.length > 0) {
      help += `\nAvailable inputs: ${inputs.join(', ')}`;
    }
    
    if (metadata.backEnabled) {
      help += '\nPress B to go back';
    }

    return help;
  }

  /**
   * Normalize input for consistent handling
   */
  normalizeInput(input) {
    if (!input || input.trim() === '') return '';
    return input.trim().toLowerCase();
  }

  /**
   * Check if input looks like text (not a command)
   */
  isTextInput(input) {
    return input.length > 1 && !/^[0-9]$/.test(input) && !['enter', 'back', 'quit', 'help'].includes(input);
  }

  /**
   * Find shortest path between states using BFS
   * 
   * Time Complexity: O(V + E) where V = vertices (states), E = edges (transitions)
   * Space Complexity: O(V) for visited set + O(V) for queue in worst case
   * 
   * Algorithm: Breadth-First Search guarantees shortest path in unweighted graph
   * Use case: Complex navigation, automated state routing, user guidance
   */
  findPath(fromState, toState) {
    if (fromState === toState) return [fromState];
    
    const queue = [[fromState]];
    const visited = new Set([fromState]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      const neighbors = this.transitions.get(current);
      if (!neighbors) continue;
      
      for (const neighbor of neighbors) {
        if (neighbor === toState) {
          return [...path, neighbor];
        }
        
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    
    return null; // No path found
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Reset state machine
   */
  reset(initialState = 'main_menu') {
    this.currentState = initialState;
    this.stateHistory = [];
    this.fireEvent('reset', { initialState });
  }
}

module.exports = StateMachine;