/**
 * Console UI Adapter
 * 
 * This adapter connects the GameEngine to the console-based UI system.
 * It translates GameEngine events into console rendering and handles
 * console input translation to GameEngine API calls.
 * 
 * This demonstrates how different UIs can consume the same GameEngine:
 * - ConsoleUIAdapter (this file) - Terminal/console interface  
 * - WebUIAdapter (future) - Browser-based interface
 * - MobileUIAdapter (future) - React Native mobile interface
 * - APIAdapter (future) - REST API for external consumption
 */

const GameEngine = require('../engine/GameEngine');
const TextUI = require('../systems/TextUI');
const ColorThemeManager = require('../ui/ColorThemeManager');
const SplashScreen = require('../ui/screens/SplashScreen');
const readline = require('readline');

class ConsoleUIAdapter {
  constructor() {
    // Core systems
    this.engine = new GameEngine();
    this.ui = new TextUI();
    this.colorManager = new ColorThemeManager();
    this.splashScreen = new SplashScreen(this.colorManager);
    
    // Console interface
    this.rl = null;
    this.currentScreen = 'splash';
    this.inputBuffer = '';
    this.nameOptions = [];
    
    // State tracking
    this.running = false;
    this.initialized = false;
    
    // Bind event handlers
    this.setupEngineEventHandlers();
  }

  /**
   * Initialize the console UI adapter
   */
  async initialize() {
    try {
      // Initialize engine
      const engineResult = await this.engine.initialize();
      if (!engineResult.success) {
        throw new Error(`Engine initialization failed: ${engineResult.error}`);
      }

      // Setup console interface
      this.setupConsoleInterface();
      
      this.initialized = true;
      this.running = true;
      
      // Show splash screen
      await this.showSplashScreen();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to initialize console UI:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup readline interface for console input
   */
  setupConsoleInterface() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    // Handle input
    this.rl.on('line', (input) => {
      this.handleInput(input.trim());
    });

    // Handle cleanup on exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * Setup GameEngine event handlers
   */
  setupEngineEventHandlers() {
    // Character events
    this.engine.on('character:created', (data) => {
      this.currentScreen = 'training';
      this.render();
    });

    this.engine.on('character:error', (data) => {
      this.ui.showError(`Character creation failed: ${data.error}`);
      this.render();
    });

    // Training events
    this.engine.on('training:completed', (data) => {
      this.ui.showSuccess(`${data.trainingType} training completed!`);
      
      // Check for race or career completion
      const gameState = data.gameState;
      if (gameState.phase === 'race_preview') {
        this.currentScreen = 'race_preview';
      } else if (gameState.phase === 'career_complete') {
        this.currentScreen = 'career_complete';
      }
      
      this.render();
    });

    this.engine.on('training:failed', (data) => {
      this.ui.showError(data.error);
      this.render();
    });

    // Race events
    this.engine.on('race:ready', (data) => {
      this.currentScreen = 'race_preview';
      this.render();
    });

    this.engine.on('race:completed', (data) => {
      this.currentScreen = 'race_results';
      this.ui.showSuccess(`Race completed! Placed ${data.result.placement}`);
      this.render();
    });

    // Save/Load events
    this.engine.on('save:completed', (data) => {
      this.ui.showSuccess('Game saved successfully!');
      this.render();
    });

    this.engine.on('load:completed', (data) => {
      this.currentScreen = 'training';
      this.ui.showSuccess('Game loaded successfully!');
      this.render();
    });

    // Warning events
    this.engine.on('warning:added', (data) => {
      this.ui.showWarning(data.message);
    });

    // Error events
    this.engine.on('engine:error', (data) => {
      this.ui.showError(`Engine error: ${data.error}`);
    });
  }

  /**
   * Show splash screen
   */
  async showSplashScreen() {
    console.clear();
    this.splashScreen.display();
    
    // Wait a short moment then transition to main menu automatically
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Transition to main menu
    this.currentScreen = 'main_menu';
    this.render();
  }

  /**
   * Handle user input based on current screen
   */
  async handleInput(input) {
    if (!this.running) return;

    // Ignore input during splash screen
    if (this.currentScreen === 'splash') {
      return;
    }

    try {
      switch (this.currentScreen) {
        case 'main_menu':
          await this.handleMainMenuInput(input);
          break;
          
        case 'character_creation':
          await this.handleCharacterCreationInput(input);
          break;
          
        case 'training':
          await this.handleTrainingInput(input);
          break;
          
        case 'race_preview':
          await this.handleRacePreviewInput(input);
          break;
          
        case 'strategy_select':
          await this.handleStrategySelectInput(input);
          break;
          
        case 'race_results':
          await this.handleRaceResultsInput(input);
          break;
          
        case 'career_complete':
          await this.handleCareerCompleteInput(input);
          break;
          
        case 'load_game':
          await this.handleLoadGameInput(input);
          break;
          
        default:
          this.ui.showError(`Unknown screen: ${this.currentScreen}`);
      }
    } catch (error) {
      this.ui.showError(`Input handling error: ${error.message}`);
      this.render();
    }
  }

  /**
   * Handle main menu input
   */
  async handleMainMenuInput(input) {
    switch (input) {
      case '1':
        this.currentScreen = 'character_creation';
        this.inputBuffer = '';
        this.nameOptions = [];
        break;
        
      case '2':
        // Tutorial (future feature)
        this.ui.showError('Tutorial not yet implemented in v1');
        break;
        
      case '3':
        this.currentScreen = 'load_game';
        break;
        
      case '4':
      case 'h':
        this.showHelp();
        break;
        
      case 'q':
        await this.cleanup();
        return;
        
      default:
        this.ui.showError('Invalid option. Press 1-4, H for help, or Q to quit.');
    }
    
    this.render();
  }

  /**
   * Handle character creation input
   */
  async handleCharacterCreationInput(input) {
    if (input.toLowerCase() === 'q') {
      this.currentScreen = 'main_menu';
      this.inputBuffer = '';
      this.nameOptions = [];
    } else if (input.toLowerCase() === 'g') {
      // Generate name options
      const result = this.engine.generateNames(6);
      if (result.success) {
        this.nameOptions = result.names;
      } else {
        this.ui.showError(result.error);
      }
    } else if (/^[1-6]$/.test(input) && this.nameOptions.length > 0) {
      // Select from generated names
      const selectedName = this.nameOptions[parseInt(input) - 1];
      await this.createCharacterWithName(selectedName);
    } else if (input.length > 0) {
      // Use typed name
      await this.createCharacterWithName(input);
    } else {
      this.ui.showError('Please enter a horse name, generate names (G), or quit (Q).');
    }
    
    this.render();
  }

  /**
   * Create character with given name
   */
  async createCharacterWithName(name) {
    const result = await this.engine.createCharacter(name);
    if (result.success) {
      this.currentScreen = 'training';
      this.inputBuffer = '';
      this.nameOptions = [];
    }
    // Error handling is done by engine event handlers
  }

  /**
   * Handle training input
   */
  async handleTrainingInput(input) {
    switch (input) {
      case '1':
        await this.engine.performTraining('speed');
        break;
      case '2':
        await this.engine.performTraining('stamina');
        break;
      case '3':
        await this.engine.performTraining('power');
        break;
      case '4':
        await this.engine.performTraining('rest');
        break;
      case '5':
        await this.engine.performTraining('media');
        break;
      case 's':
        await this.engine.saveGame();
        break;
      case 'q':
        this.currentScreen = 'main_menu';
        this.render();
        break;
      default:
        this.ui.showError('Invalid option. Choose 1-5, S to save, or Q to quit.');
        this.render();
    }
  }

  /**
   * Handle race preview input
   */
  async handleRacePreviewInput(input) {
    if (input === '' || input === 'enter') {
      this.currentScreen = 'strategy_select';
      this.render();
    }
  }

  /**
   * Handle strategy selection input
   */
  async handleStrategySelectInput(input) {
    let strategy;
    switch (input) {
      case '1':
        strategy = 'FRONT';
        break;
      case '2':
        strategy = 'MID';
        break;
      case '3':
        strategy = 'LATE';
        break;
      default:
        this.ui.showError('Invalid strategy. Choose 1 (Front), 2 (Mid), or 3 (Late).');
        this.render();
        return;
    }
    
    await this.engine.startRace(strategy);
  }

  /**
   * Handle race results input
   */
  async handleRaceResultsInput(input) {
    if (input === '' || input === 'enter') {
      const gameState = this.engine.getGameState();
      
      if (gameState.phase === 'career_complete') {
        this.currentScreen = 'career_complete';
      } else {
        this.currentScreen = 'training';
      }
      
      this.render();
    }
  }

  /**
   * Handle career completion input
   */
  async handleCareerCompleteInput(input) {
    if (input === '' || input === 'enter') {
      this.currentScreen = 'main_menu';
      this.render();
    }
  }

  /**
   * Handle load game input
   */
  async handleLoadGameInput(input) {
    if (input.toLowerCase() === 'q') {
      this.currentScreen = 'main_menu';
    } else {
      const slotIndex = parseInt(input) - 1;
      if (!isNaN(slotIndex) && slotIndex >= 0) {
        await this.engine.loadGame(slotIndex);
      } else {
        this.ui.showError('Invalid save slot. Enter a number or Q to quit.');
      }
    }
    
    this.render();
  }

  /**
   * Render current screen
   */
  render() {
    if (!this.running) return;

    console.clear();
    
    switch (this.currentScreen) {
      case 'splash':
        // Splash screen is handled by showSplashScreen() method
        // Don't render anything here to avoid conflicts
        break;
      case 'main_menu':
        this.renderMainMenu();
        break;
      case 'character_creation':
        this.renderCharacterCreation();
        break;
      case 'training':
        this.renderTraining();
        break;
      case 'race_preview':
        this.renderRacePreview();
        break;
      case 'strategy_select':
        this.renderStrategySelect();
        break;
      case 'race_results':
        this.renderRaceResults();
        break;
      case 'career_complete':
        this.renderCareerComplete();
        break;
      case 'load_game':
        this.renderLoadGame();
        break;
      default:
        console.log('Unknown screen:', this.currentScreen);
    }
  }

  /**
   * Render main menu
   */
  renderMainMenu() {
    console.log('═══════════════════════════════════════');
    console.log('             MAIN MENU');
    console.log('═══════════════════════════════════════');
    console.log(`
1. Start New Career
2. Tutorial (Coming in v1)
3. Load Game  
4. Help

H - Help
Q - Quit Game
`);
  }

  /**
   * Render character creation screen
   */
  renderCharacterCreation() {
    console.log('═══════════════════════════════════════');
    console.log('        CHARACTER CREATION');
    console.log('═══════════════════════════════════════');
    
    if (this.nameOptions.length > 0) {
      console.log('Generated name suggestions:\n');
      this.nameOptions.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
      console.log(`
Enter a number (1-6) to select a name,
OR type your own horse name and press ENTER,
OR type "G" to generate new names:

(Type Q and press ENTER to go back to main menu)`);
    } else {
      console.log(`
Enter your horse name and press ENTER,
OR type "G" to generate name suggestions:

(Type Q and press ENTER to go back to main menu)`);
    }
  }

  /**
   * Render training screen
   */
  renderTraining() {
    const gameState = this.engine.getGameState();
    
    if (!gameState.character) {
      this.ui.showError('No character data available');
      return;
    }

    console.log('═══════════════════════════════════════');
    console.log(`        TRAINING - ${gameState.character.name}`);
    console.log('═══════════════════════════════════════');
    
    // Show stats
    console.log('STATS:');
    this.ui.showProgressBar('Speed', gameState.character.stats.speed, 100);
    this.ui.showProgressBar('Stamina', gameState.character.stats.stamina, 100);
    this.ui.showProgressBar('Power', gameState.character.stats.power, 100);
    
    console.log('\nCONDITION:');
    this.ui.showProgressBar('Energy', gameState.character.condition.energy, 100);
    console.log(`Form: ${gameState.character.condition.form || 'Normal'}\n`);
    
    console.log('CAREER:');
    console.log(`Turn: ${gameState.turn}/${gameState.maxTurns}`);
    console.log(`Races Won: ${gameState.character.career?.wins || 0}/${gameState.character.career?.racesRun || 0}\n`);
    
    // Show next race info
    if (gameState.nextRace) {
      console.log('=== UPCOMING RACE ===');
      console.log(`Race: ${gameState.nextRace.name}`);
      console.log(`Turn: ${gameState.nextRace.scheduledTurn}`);
      console.log(`Distance: ${gameState.nextRace.distance}m`);
      console.log(`Surface: ${gameState.nextRace.surface}`);
      console.log(`Type: ${gameState.nextRace.type}`);
      console.log(`Turns until race: ${gameState.nextRace.scheduledTurn - gameState.turn}`);
      console.log('=====================\n');
    }
    
    // Training options
    console.log('TRAINING OPTIONS:');
    console.log('1. Speed Training   (Cost: 15 energy)');
    console.log('2. Stamina Training (Cost: 10 energy)');
    console.log('3. Power Training   (Cost: 15 energy)');
    console.log('4. Rest Day         (Gain: 30 energy)');
    console.log('5. Media Day        (Gain: 15 energy)');
    console.log('\nEnter your choice (1-5), or S to save, Q to quit:');
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
=== GAME HELP ===

CONTROLS:
- Numbers (1-5): Select menu options and training
- G: Generate name suggestions (character creation)
- S: Save game (during training)
- Q: Quit/Go back
- ENTER: Continue/Confirm

TRAINING TYPES:
- Speed Training: Increases sprint performance
- Stamina Training: Increases race endurance  
- Power Training: Increases acceleration
- Rest Day: Recovers energy
- Media Day: Builds relationships, partial energy recovery

STATS:
- Speed (1-100): Final sprint performance
- Stamina (1-100): Race endurance and "HP pool"
- Power (1-100): Acceleration ability

ENERGY SYSTEM:
- Maximum 100 energy
- Training costs 10-20 energy
- Rest Day restores 30 energy
- Media Day restores 15 energy

Press ENTER to continue...`);
  }

  /**
   * Render race preview
   */
  renderRacePreview() {
    const gameState = this.engine.getGameState();
    
    console.log('═══════════════════════════════════════');
    console.log('            RACE PREVIEW');
    console.log('═══════════════════════════════════════');
    
    if (gameState.nextRace) {
      console.log(`Race: ${gameState.nextRace.name}`);
      console.log(`Distance: ${gameState.nextRace.distance}m`);
      console.log(`Surface: ${gameState.nextRace.surface}`);
      console.log(`Prize Money: $${gameState.nextRace.prize || 5000}`);
      console.log('\nPress ENTER to continue to strategy selection...');
    }
  }

  /**
   * Render strategy selection
   */
  renderStrategySelect() {
    console.log('═══════════════════════════════════════');
    console.log('           RACE STRATEGY');
    console.log('═══════════════════════════════════════');
    
    console.log(`
Choose your racing strategy:

1. Front Runner - Lead from the start, high speed/power requirement
2. Mid Pack - Balanced approach, stay in contention
3. Late Closer - Save energy, strong finish, high stamina requirement

Enter your choice (1-3):`);
  }

  /**
   * Render race results
   */
  renderRaceResults() {
    // This would show detailed race results
    // For now, just continue prompt
    console.log('\nPress ENTER to continue...');
  }

  /**
   * Render career completion
   */
  renderCareerComplete() {
    const gameState = this.engine.getGameState();
    
    console.log('═══════════════════════════════════════');
    console.log('          CAREER COMPLETE');
    console.log('═══════════════════════════════════════');
    
    if (gameState.character) {
      console.log(`Final Stats for ${gameState.character.name}:`);
      console.log(`Speed: ${gameState.character.stats.speed}/100`);
      console.log(`Stamina: ${gameState.character.stats.stamina}/100`);
      console.log(`Power: ${gameState.character.stats.power}/100`);
      console.log(`\nCareer Record: ${gameState.character.career?.wins || 0} wins in ${gameState.character.career?.racesRun || 0} races`);
    }
    
    console.log('\nPress ENTER to return to main menu...');
  }

  /**
   * Render load game screen
   */
  async renderLoadGame() {
    console.log('═══════════════════════════════════════');
    console.log('            LOAD GAME');
    console.log('═══════════════════════════════════════');
    
    const savesResult = await this.engine.getAvailableSaves();
    
    if (savesResult.success && savesResult.saves.length > 0) {
      console.log('Available save files:\n');
      savesResult.saves.forEach((save, index) => {
        console.log(`${index + 1}. ${save.name} (Turn ${save.turn || 'N/A'})`);
      });
      console.log('\nEnter the number of the save file to load, or Q to go back:');
    } else {
      console.log('No save files found.\n\nPress Q to go back to main menu:');
    }
  }

  /**
   * Cleanup resources and exit
   */
  async cleanup() {
    this.running = false;
    
    console.log('\n🧹 Cleaning up resources...');
    
    // Cleanup engine
    if (this.engine) {
      await this.engine.cleanup();
    }
    
    // Cleanup console interface
    if (this.rl) {
      this.rl.close();
    }
    
    console.log('✅ Goodbye! Thanks for playing!');
    process.exit(0);
  }
}

module.exports = ConsoleUIAdapter;