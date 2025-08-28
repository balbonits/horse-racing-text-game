/**
 * Unified Input Handling System
 * 
 * Centralizes ALL input handling, transformation, and CLI interactions.
 * Eliminates the dual architecture problem by providing a single source of truth.
 * 
 * Features:
 * - Single input processing pipeline
 * - Consistent validation and error handling
 * - State-aware input transformation
 * - Centralized action routing
 * - Input history and debugging
 */

class UnifiedInputHandler {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.stateMachine = gameApp.stateMachine;
    
    // Input history for debugging
    this.inputHistory = [];
    this.maxHistorySize = 100;
    
    // Character creation buffer (centralized)
    this.characterNameBuffer = '';
    this.nameOptions = [];
    
    // Input processing state
    this.isProcessing = false;
    this.processingQueue = [];
  }

  /**
   * Main input processing method - THE SINGLE ENTRY POINT
   * All input from anywhere in the system comes through here
   */
  async processInput(rawInput) {
    // Record input for debugging
    this.recordInput(rawInput);
    
    // Prevent concurrent processing
    if (this.isProcessing) {
      this.processingQueue.push(rawInput);
      return { success: false, error: 'Input queued', queued: true };
    }
    
    this.isProcessing = true;
    
    try {
      // Normalize input
      const normalizedInput = this.normalizeInput(rawInput);
      
      // Get current state
      const currentState = this.stateMachine.getCurrentState();
      
      // State-specific input transformation
      const transformedInput = this.transformInput(normalizedInput, currentState);
      
      // Validate input for current state
      const validation = this.validateInput(transformedInput, currentState);
      if (!validation.valid) {
        return this.createErrorResponse(validation.error, currentState);
      }
      
      // Route to action handler
      const result = await this.routeInputToAction(transformedInput, currentState);
      
      // Post-process result (state transitions, UI updates, etc.)
      const finalResult = await this.postProcessResult(result, transformedInput, currentState);
      
      return finalResult;
      
    } catch (error) {
      console.error('🚨 Unified Input Handler Error:', error);
      return this.createErrorResponse(`Input processing failed: ${error.message}`, this.stateMachine.getCurrentState());
    } finally {
      this.isProcessing = false;
      
      // Process queued inputs
      if (this.processingQueue.length > 0) {
        const nextInput = this.processingQueue.shift();
        setImmediate(() => this.processInput(nextInput));
      }
    }
  }

  /**
   * Normalize input - handles special keys, case sensitivity, etc.
   */
  normalizeInput(rawInput) {
    if (typeof rawInput !== 'string') {
      rawInput = String(rawInput);
    }
    
    // Handle special key mappings
    const keyMappings = {
      'enter': '\n',
      'return': '\n',
      'space': ' ',
      'backspace': '\b',
      'delete': '\b'
    };
    
    return keyMappings[rawInput.toLowerCase()] || rawInput;
  }

  /**
   * Transform input based on current state context
   * This handles state-specific input interpretation
   */
  transformInput(input, currentState) {
    switch (currentState) {
      case 'character_creation':
        return this.transformCharacterCreationInput(input);
        
      default:
        // For all other states, use direct input passing to StateMachine
        return { type: 'direct', value: input };
    }
  }

  /**
   * Character creation specific input transformation
   */
  transformCharacterCreationInput(input) {
    // Handle Enter key - submit buffered name or process command
    if (input === '\n' || input === '') {
      if (this.characterNameBuffer.trim()) {
        return { type: 'custom_name', value: this.characterNameBuffer.trim() };
      } else {
        return { type: 'error', value: 'Please enter a horse name first' };
      }
    }
    
    // Handle special commands
    if (['g', 'q'].includes(input.toLowerCase())) {
      return { type: 'command', value: input.toLowerCase() };
    }
    
    // Handle name selection numbers
    if (/^[1-6]$/.test(input)) {
      return { type: 'name_selection', value: parseInt(input) - 1 };
    }
    
    // Handle backspace
    if (input === '\b') {
      if (this.characterNameBuffer.length > 0) {
        this.characterNameBuffer = this.characterNameBuffer.slice(0, -1);
        return { type: 'buffer_update', value: 'backspace' };
      }
      return { type: 'ignore', value: null };
    }
    
    // Handle character input for name building
    if (input.length === 1 && /[a-zA-Z\s]/.test(input)) {
      this.characterNameBuffer += input;
      return { type: 'buffer_update', value: 'char_added' };
    }
    
    return { type: 'invalid', value: input };
  }


  /**
   * Validate transformed input for current state
   */
  validateInput(transformedInput, currentState) {
    // Invalid inputs are never valid
    if (transformedInput.type === 'invalid') {
      return { 
        valid: false, 
        error: `Invalid input "${transformedInput.value}" for ${currentState}` 
      };
    }
    
    // Error inputs contain their own error message
    if (transformedInput.type === 'error') {
      return { 
        valid: false, 
        error: transformedInput.value 
      };
    }
    
    // State-specific validation
    switch (currentState) {
      case 'character_creation':
        return this.validateCharacterCreationInput(transformedInput);
      default:
        return { valid: true };
    }
  }

  /**
   * Validate character creation input
   */
  validateCharacterCreationInput(transformedInput) {
    switch (transformedInput.type) {
      case 'name_selection':
        if (this.nameOptions.length === 0) {
          return { valid: false, error: 'No names available to select. Generate names first with "g".' };
        }
        if (transformedInput.value >= this.nameOptions.length) {
          return { valid: false, error: `Invalid selection. Choose 1-${this.nameOptions.length}.` };
        }
        return { valid: true };
      
      case 'custom_name':
        // Validate name length and characters
        if (transformedInput.value.length < 2) {
          return { valid: false, error: 'Horse name must be at least 2 characters long.' };
        }
        if (transformedInput.value.length > 18) {
          return { valid: false, error: 'Horse name must be 18 characters or less.' };
        }
        return { valid: true };
        
      default:
        return { valid: true };
    }
  }


  /**
   * Route validated input to appropriate action handler
   */
  async routeInputToAction(transformedInput, currentState) {
    switch (transformedInput.type) {
      case 'command':
        return this.handleCommand(transformedInput.value, currentState);
        
      case 'name_selection':
        return this.handleNameSelection(transformedInput.value);
        
      case 'custom_name':
        return this.handleCustomName(transformedInput.value);
        
      case 'buffer_update':
        return this.handleBufferUpdate(transformedInput.value);
        
      case 'ignore':
        return { success: true, action: 'ignore' };
        
      case 'direct':
        // Pass to StateMachine for processing
        return this.stateMachine.processGameInput(transformedInput.value);
        
      default:
        return { success: false, error: `Unknown input type: ${transformedInput.type}` };
    }
  }


  /**
   * Handle command actions (g, q, etc.)
   */
  async handleCommand(command, currentState) {
    switch (command) {
      case 'g':
        if (currentState === 'character_creation') {
          this.nameOptions = this.gameApp.nameGenerator.generateNameOptions(6);
          // Sync with gameApp for backward compatibility
          this.gameApp.nameOptions = this.nameOptions;
          return { success: true, action: 'generate_names', names: this.nameOptions };
        }
        break;
        
      case 'q':
        if (currentState === 'character_creation') {
          this.clearCharacterCreationState();
          return this.stateMachine.transitionTo('main_menu');
        }
        break;
    }
    
    return { success: false, error: `Command "${command}" not valid in ${currentState}` };
  }


  /**
   * Handle name selection from generated options
   */
  async handleNameSelection(index) {
    if (index >= 0 && index < this.nameOptions.length) {
      const selectedName = this.nameOptions[index];
      const result = await this.gameApp.createCharacter(selectedName);
      this.clearCharacterCreationState();
      return result;
    }
    
    return { success: false, error: 'Invalid name selection' };
  }

  /**
   * Handle custom name input
   */
  async handleCustomName(name) {
    const result = await this.gameApp.createCharacter(name);
    this.clearCharacterCreationState();
    return result;
  }

  /**
   * Handle buffer updates (backspace, character addition)
   */
  async handleBufferUpdate(updateType) {
    // Buffer was already updated in transformInput
    // Sync with gameApp for backward compatibility
    this.gameApp.characterNameBuffer = this.characterNameBuffer;
    return { success: true, action: 'buffer_update', updateType, buffer: this.characterNameBuffer };
  }

  /**
   * Post-process results (handle state transitions, UI updates, etc.)
   */
  async postProcessResult(result, transformedInput, originalState) {
    if (result.success) {
      // Handle automatic state transitions
      if (result.raceReady) {
        this.stateMachine.transitionTo('race_preview');
      }
      
      if (result.careerComplete) {
        this.stateMachine.transitionTo('career_complete');
      }
      
      // Trigger UI re-render
      if (this.gameApp.render) {
        this.gameApp.render();
      }
    }
    
    return result;
  }

  /**
   * Clear character creation state
   */
  clearCharacterCreationState() {
    this.characterNameBuffer = '';
    this.nameOptions = [];
    // Sync with gameApp for backward compatibility
    this.gameApp.nameOptions = [];
    this.gameApp.characterNameBuffer = '';
  }

  /**
   * Create standardized error response
   */
  createErrorResponse(error, currentState) {
    const availableInputs = this.getAvailableInputs(currentState);
    
    return {
      success: false,
      error,
      currentState,
      availableInputs,
      suggestion: this.getInputSuggestion(currentState)
    };
  }

  /**
   * Get available inputs for current state
   */
  getAvailableInputs(state) {
    // Get inputs from StateMachine configuration
    const inputHandlers = this.stateMachine.inputHandlers.get(state);
    return inputHandlers ? Array.from(inputHandlers.keys()) : [];
  }

  /**
   * Get helpful input suggestion for current state
   */
  getInputSuggestion(state) {
    const suggestions = {
      'main_menu': 'Try: 1 (New Career), 2 (Tutorial), 3 (Load Game), 4 (Help), Q (Quit)',
      'character_creation': 'Try: Type a name, G (Generate names), Q (Back to menu)',
      'training': 'Try: 1-5 (Training), S (Save), H (Help), Q (Main menu)',
      'race_preview': 'Press Enter to continue',
      'race_results': 'Press Enter to continue'
    };
    
    return suggestions[state] || 'Check available inputs above';
  }

  /**
   * Record input for debugging and history
   */
  recordInput(input) {
    const record = {
      input,
      timestamp: new Date().toISOString(),
      state: this.stateMachine.getCurrentState()
    };
    
    this.inputHistory.push(record);
    
    // Limit history size
    if (this.inputHistory.length > this.maxHistorySize) {
      this.inputHistory.shift();
    }
  }

  /**
   * Get input history (for debugging)
   */
  getInputHistory(limit = 10) {
    return this.inputHistory.slice(-limit);
  }

  /**
   * Get current state for debugging
   */
  getDebugInfo() {
    return {
      currentState: this.stateMachine.getCurrentState(),
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length,
      characterNameBuffer: this.characterNameBuffer,
      nameOptionsCount: this.nameOptions.length,
      recentInputs: this.getInputHistory(5)
    };
  }
}

module.exports = UnifiedInputHandler;