/**
 * Game Flow Validator - Ensures consistent game state transitions and prevents flow issues
 */

class GameFlowValidator {
  constructor() {
    this.validTransitions = {
      'main_menu': ['character_creation', 'load_game', 'help'],
      'character_creation': ['training', 'main_menu'],
      'load_game': ['training', 'main_menu'],
      'training': ['race_preview', 'help', 'main_menu', 'career_complete'],
      'race_preview': ['horse_lineup'],
      'horse_lineup': ['strategy_select'],
      'strategy_select': ['race_running'],
      'race_running': ['race_results'],
      'race_results': ['podium', 'training', 'career_complete'],
      'podium': ['training', 'career_complete'],
      'help': ['training', 'main_menu'],
      'career_complete': ['main_menu']
    };

    this.inputRequirements = {
      'race_preview': { allowEmpty: true, expectedInputs: ['enter', ''] },
      'horse_lineup': { allowEmpty: true, expectedInputs: ['enter', ''] },
      'race_results': { allowEmpty: true, expectedInputs: ['enter', ''] },
      'podium': { allowEmpty: true, expectedInputs: ['enter', ''] },
      'strategy_select': { allowEmpty: false, expectedInputs: ['1', '2', '3'] },
      'training': { allowEmpty: false, expectedInputs: ['1', '2', '3', '4', '5', 's', 'h', 'q'] }
    };
  }

  /**
   * Validate a state transition
   */
  validateStateTransition(currentState, newState) {
    const allowedTransitions = this.validTransitions[currentState];
    
    if (!allowedTransitions) {
      return {
        valid: false,
        error: `Unknown current state: ${currentState}`
      };
    }

    if (!allowedTransitions.includes(newState)) {
      return {
        valid: false,
        error: `Invalid transition from ${currentState} to ${newState}. Allowed: ${allowedTransitions.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate input for current state
   */
  validateStateInput(state, input) {
    const requirements = this.inputRequirements[state];
    
    if (!requirements) {
      // No specific requirements - allow any input
      return { valid: true };
    }

    const isEmpty = !input || input.trim() === '';
    
    if (isEmpty && !requirements.allowEmpty) {
      return {
        valid: false,
        error: `State ${state} requires non-empty input`
      };
    }

    if (!isEmpty && requirements.expectedInputs && !requirements.expectedInputs.includes(input.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid input "${input}" for state ${state}. Expected: ${requirements.expectedInputs.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate complete race flow
   */
  validateRaceFlow(gameState) {
    const issues = [];

    // Check race scheduling
    const scheduledRaces = gameState.getScheduledRaces?.() || [];
    const currentTurn = gameState.character?.career?.turn || 0;
    
    scheduledRaces.forEach(race => {
      if (race.turn < 1 || race.turn > 12) {
        issues.push(`Race "${race.name}" scheduled for invalid turn ${race.turn}`);
      }
    });

    // Check current race state consistency
    if (gameState.currentState === 'race_preview' && !gameState.upcomingRace) {
      issues.push('In race_preview state but no upcomingRace set');
    }

    if (gameState.currentState === 'race_running' && !gameState.raceAnimation) {
      issues.push('In race_running state but no raceAnimation initialized');
    }

    if (gameState.currentState === 'race_results' && !gameState.currentRaceResult) {
      issues.push('In race_results state but no currentRaceResult set');
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Validate career progression
   */
  validateCareerProgression(character, gameState) {
    const issues = [];

    if (!character) {
      issues.push('No character found');
      return { valid: false, issues };
    }

    const turn = character.career?.turn || 0;
    const racesWon = character.career?.racesWon || 0;
    const racesRun = character.career?.racesRun || 0;

    // Validate turn progression
    if (turn < 1 || turn > 12) {
      issues.push(`Invalid career turn: ${turn}`);
    }

    // Validate race statistics
    if (racesWon > racesRun) {
      issues.push(`Races won (${racesWon}) exceeds races run (${racesRun})`);
    }

    // Check if character can continue
    if (!character.canContinue?.()) {
      if (gameState.currentState !== 'career_complete') {
        issues.push('Character cannot continue but not in career_complete state');
      }
    }

    // Validate stats
    const stats = character.getCurrentStats?.() || {};
    ['speed', 'stamina', 'power'].forEach(stat => {
      const value = stats[stat] || 0;
      if (value < 0 || value > 200) { // Allow some buffer above 100
        issues.push(`Invalid ${stat} value: ${value}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Comprehensive game state validation
   */
  validateGameState(gameApp) {
    const issues = [];

    try {
      // Validate current state
      const stateTransition = this.validateStateTransition(
        gameApp.currentState,
        gameApp.currentState
      );

      if (!stateTransition.valid && !gameApp.currentState) {
        issues.push('No current state set');
      }

      // Validate character progression
      if (gameApp.game?.character) {
        const careerValidation = this.validateCareerProgression(
          gameApp.game.character,
          gameApp
        );
        
        if (!careerValidation.valid) {
          issues.push(...careerValidation.issues.map(issue => `Career: ${issue}`));
        }
      }

      // Validate race flow
      if (gameApp.game) {
        const raceValidation = this.validateRaceFlow(gameApp.game);
        
        if (!raceValidation.valid) {
          issues.push(...raceValidation.issues.map(issue => `Race: ${issue}`));
        }
      }

    } catch (error) {
      issues.push(`Validation error: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Get expected next states for current state
   */
  getExpectedNextStates(currentState) {
    return this.validTransitions[currentState] || [];
  }

  /**
   * Get input help for current state
   */
  getInputHelp(state) {
    const requirements = this.inputRequirements[state];
    
    if (!requirements) {
      return 'Any input allowed';
    }

    let help = '';
    
    if (requirements.allowEmpty) {
      help += 'Press ENTER to continue';
    }
    
    if (requirements.expectedInputs) {
      if (help) help += ' or ';
      help += `Enter: ${requirements.expectedInputs.join(', ')}`;
    }

    return help;
  }
}

module.exports = GameFlowValidator;