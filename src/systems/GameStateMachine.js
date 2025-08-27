/**
 * Game-specific State Machine Integration
 * Connects StateMachine to GameApp business logic
 */

const StateMachine = require('./StateMachine');

class GameStateMachine extends StateMachine {
  constructor(gameApp) {
    super();
    this.gameApp = gameApp;
    this.setupGameHandlers();
  }

  /**
   * Setup game-specific event handlers
   * Replaces all the switch-case input handling
   */
  setupGameHandlers() {
    // Listen to state changes to trigger renders
    this.addEventListener('stateChanged', ({ from, to, context }) => {
      this.gameApp.render();
    });

    // Handle custom actions (training, saving, etc.)
    this.addEventListener('customAction', ({ action, input, context }) => {
      this.handleCustomAction(action, input, context);
    });

    // Handle quit events
    this.addEventListener('quit', () => {
      this.gameApp.quit();
    });
  }

  /**
   * Handle game-specific actions
   * O(1) lookup instead of switch-case
   */
  handleCustomAction(action, input, context) {
    // Action handlers map - O(1) lookup
    const actionHandlers = {
      // Training actions
      'speed_training': () => this.gameApp.performTrainingSync('speed'),
      'stamina_training': () => this.gameApp.performTrainingSync('stamina'),
      'power_training': () => this.gameApp.performTrainingSync('power'),
      'rest_training': () => this.gameApp.performTrainingSync('rest'),
      'media_training': () => this.gameApp.performTrainingSync('media'),
      
      // Game management
      'save_game': () => this.gameApp.saveGame(),
      'show_races': () => this.gameApp.showRaceSchedule(),
      'load_game_by_number': () => {
        // Handle quit
        if (input.toLowerCase() === 'q') {
          return this.transitionTo('main_menu');
        }
        
        // Handle number selection
        const choice = parseInt(input);
        if (!isNaN(choice) && choice >= 1) {
          this.gameApp.loadGameByIndex(choice - 1).then(result => {
            if (result.success) {
              this.gameApp.ui.showMessage('Game loaded successfully!');
              this.transitionTo('training');
            } else {
              this.gameApp.ui.showError('Failed to load game: ' + result.message);
            }
            this.gameApp.render();
          }).catch(error => {
            this.gameApp.ui.showError('Load error: ' + error.message);
            this.gameApp.render();
          });
          
          return { success: true, action: 'load_game', choice: choice };
        }
        
        return { success: false, error: 'Invalid save file number' };
      },
      
      // Character creation - handle special cases
      'create_character': () => {
        // Handle quit command
        if (input.toLowerCase() === 'q') {
          this.gameApp.nameOptions = [];
          return this.transitionTo('main_menu');
        }
        
        // Handle name generation
        if (input.toLowerCase() === 'g') {
          this.gameApp.nameOptions = this.gameApp.nameGenerator.generateNameOptions(6);
          this.gameApp.render();
          return { success: true, action: 'generate_names' };
        }
        
        // Handle name selection from generated options
        if (this.gameApp.nameOptions.length > 0) {
          const nameIndex = parseInt(input) - 1;
          if (nameIndex >= 0 && nameIndex < this.gameApp.nameOptions.length) {
            const selectedName = this.gameApp.nameOptions[nameIndex];
            const result = this.gameApp.createCharacter(selectedName);
            this.gameApp.characterNameBuffer = '';
            this.gameApp.nameOptions = [];
            return result;
          }
        }
        
        // Treat input as character name
        const result = this.gameApp.createCharacter(input);
        this.gameApp.characterNameBuffer = '';
        this.gameApp.nameOptions = [];
        return result;
      },
      
      // Career completion
      'new_career': () => this.gameApp.startNewCareer(),
      
      // Special handlers
      'quit': () => this.gameApp.quit()
    };

    const handler = actionHandlers[action];
    if (handler) {
      const result = handler();
      
      // Handle race transitions automatically
      if (result && result.raceReady) {
        this.gameApp.upcomingRace = result.nextRace;
        this.transitionTo('race_preview');
      }
      
      // Handle career completion
      if (result && result.careerComplete) {
        this.transitionTo('career_complete');
      }
      
      return result;
    }

    console.warn(`Unknown action: ${action}`);
    return { success: false, error: `Unknown action: ${action}` };
  }

  /**
   * Enhanced input handling with game context
   */
  processGameInput(input) {
    // Pass game context for function handlers
    const context = {
      game: this.gameApp.game,
      gameApp: this.gameApp
    };
    
    const result = this.handleInput(input, context);
    
    // Handle strategy selection data
    if (result.success && result.data) {
      this.gameApp.selectedStrategy = result.data;
    }
    
    return result;
  }

  /**
   * Check if current state allows race transition
   */
  canTransitionToRace() {
    return this.getCurrentState() === 'training';
  }

  /**
   * Auto-transition based on game state
   */
  checkAutoTransitions() {
    const currentState = this.getCurrentState();
    const game = this.gameApp.game;
    
    // Auto-transition to career_complete
    if (currentState === 'training' && game.character && !game.character.canContinue()) {
      this.transitionTo('career_complete');
      return true;
    }
    
    // Auto-transition from race_running to race_results
    if (currentState === 'race_running' && this.gameApp.currentRaceResult) {
      this.transitionTo('race_results');
      return true;
    }
    
    return false;
  }

  /**
   * Get current game phase for debugging
   */
  getGamePhase() {
    const state = this.getCurrentState();
    const game = this.gameApp.game;
    
    if (!game.character) return 'menu';
    
    const turn = game.character.career.turn;
    const racePhases = ['race_preview', 'horse_lineup', 'strategy_select', 'race_running', 'race_results', 'podium'];
    
    if (racePhases.includes(state)) {
      return `race_turn_${turn}`;
    }
    
    if (state === 'training') {
      return `training_turn_${turn}`;
    }
    
    return state;
  }
}

module.exports = GameStateMachine;