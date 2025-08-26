const Game = require('./systems/Game');
const TextUI = require('./systems/TextUI');
const fs = require('fs').promises;
const path = require('path');
const { validation, result, energy, ui } = require('./utils/gameUtils');

/**
 * Main Game Application - Integrates all systems
 * Handles UI state management, user input, and coordinates between systems
 */
class GameApp {
  constructor() {
    this.game = new Game();
    this.ui = new TextUI(); // Use pure text UI for maximum simplicity
    this.currentState = 'main_menu';
    this.saveDirectory = path.join(__dirname, '../data/saves');
    this.characterNameBuffer = '';
    
    // No blessed, no screen, just pure console input handling
    this.setupKeyboardInput();
  }

  /**
   * Start the game application with pure console input
   */
  start() {
    console.log('Starting Uma Musume Text Clone...\n');
    this.render();
  }

  setupKeyboardInput() {
    // Use line-based input for maximum compatibility
    const readline = require('readline');
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Handle line input
    this.rl.on('line', (input) => {
      const trimmed = input.trim();
      if (trimmed) {
        this.handleKeyInput(trimmed);
      }
    });
    
    // Handle Ctrl+C
    this.rl.on('SIGINT', () => {
      this.quit();
    });
  }

  handleKeyInput(key) {
    try {
      switch (this.currentState) {
        case 'main_menu':
          return this.handleMainMenuInput(key);
        case 'character_creation':
          return this.handleCharacterCreationInput(key);
        case 'load_game':
          return this.handleLoadGameInput(key);
        case 'training':
          return this.handleTrainingInput(key);
        case 'race_results':
          return this.handleRaceResultsInput(key);
        case 'help':
          return this.handleHelpInput(key);
        case 'career_complete':
          return this.handleCareerCompleteInput(key);
        default:
          return this.handleGlobalInput(key);
      }
    } catch (error) {
      this.displayError(`Input error: ${error.message}`);
      return { success: false, message: 'Input error' };
    }
  }

  handleMainMenuInput(key) {
    switch (key) {
      case '1':
        this.selectMainMenuOption('new_career');
        return { success: true, action: 'new_career' };
      case '2':
        this.selectMainMenuOption('load_game');
        return { success: true, action: 'load_game' };
      case '3':
      case 'h':
        this.selectMainMenuOption('help');
        return { success: true, action: 'help' };
      case '4':
      case 'q':
        this.quit();
        return { success: true, action: 'quit' };
      default:
        return { success: false, action: 'invalid_key', key: key };
    }
  }

  handleCharacterCreationInput(key) {
    console.log('⌨️ Character creation input:', JSON.stringify(key));
    
    // Handle quit (single 'q' or 'Q')
    if (key.toLowerCase() === 'q') {
      console.log('🚪 Quitting character creation');
      this.setState('main_menu');
      return { success: true, action: 'quit' };
    }

    // Since we're using readline, we get full text input, not individual characters
    // Treat the entire input as the horse name
    if (key && key.trim().length > 0) {
      const horseName = key.trim();
      
      // Validate the name (1-20 characters, alphanumeric plus spaces, underscores, and hyphens)
      if (!horseName.match(/^[a-zA-Z0-9_\- ]+$/)) {
        console.log('❌ Invalid characters in name');
        this.ui.updateStatus('❌ Invalid characters in name. Use only letters, numbers, spaces, _ and -');
        this.render(); // Re-render to show the error
        return { success: false, action: 'invalid_input', message: 'Invalid characters' };
      }
      
      if (horseName.length > 20) {
        console.log('❌ Name too long');
        this.ui.updateStatus('❌ Name must be 20 characters or less');
        this.render(); // Re-render to show the error
        return { success: false, action: 'invalid_input', message: 'Name too long' };
      }
      
      console.log('🔄 Creating character with name:', JSON.stringify(horseName));
      
      // Handle async character creation
      this.createCharacter(horseName).then(result => {
        this.characterNameBuffer = '';
        
        if (!result.success) {
          console.log('❌ Character creation failed:', result.message);
          this.ui.updateStatus(`❌ ${result.message}`);
          this.render(); // Re-render to show the error
        }
        // Success case is handled in createCharacter method
      }).catch(error => {
        console.error('Character creation error:', error);
        this.ui.updateStatus(`❌ ${error.message}`);
        this.render();
      });
      
      // Return immediately while async operation continues
      return { success: true, action: 'creating_character' };
    }
    
    // Empty input, just re-render
    this.render();
    return { success: true, action: 'empty_input' };
  }

  handleTrainingInput(key) {
    const trainingMap = {
      '1': 'speed',
      '2': 'stamina', 
      '3': 'power',
      '4': 'rest',
      '5': 'social'
    };

    if (trainingMap[key]) {
      // Handle async training
      this.performTraining(trainingMap[key]).then(result => {
        if (result.success) {
          this.render(); // Re-render after training completes
        } else {
          this.ui.updateStatus(`❌ ${result.message}`);
          this.render();
        }
      }).catch(error => {
        console.error('Training error:', error);
        this.ui.updateStatus(`❌ Training failed: ${error.message}`);
        this.render();
      });
      
      // Return immediately while async operation continues
      return { success: true, action: 'training' };
    } else if (key === 'r') {
      this.showRaceSchedule();
      return { success: true };
    } else if (key === 's') {
      return this.saveGame();
    } else if (key === 'h') {
      this.setState('help');
      return { success: true };
    } else if (key === 'q') {
      this.setState('main_menu');
      return { success: true };
    }
    return { success: false, message: 'Invalid input' };
  }

  handleRaceResultsInput(key) {
    if (key === 'enter' || key === ' ' || key === '1' || key === '2' || key === '3' || key === '4' || key === '5') {
      // Check if there are more races to run
      const scheduledRaces = this.game.getScheduledRaces();
      const completedRaces = this.game.getRaceResults();
      
      if (completedRaces.length < scheduledRaces.length) {
        // Check if there are more scheduled races in the near future
        // If not, return to training
        this.setState('training');
        return { success: true, action: 'continue_training' };
      } else {
        // All races complete - finish career
        this.setState('career_complete');
        return { success: true, action: 'career_complete' };
      }
    } else {
      // Return to training
      this.setState('training');
      return { success: true, action: 'continue_training' };
    }
  }

  handleHelpInput(key) {
    this.setState('training');
    return { success: true, action: 'return_to_training' };
  }

  handleCareerCompleteInput(key) {
    if (key === 'enter') {
      this.startNewCareer();
      return { success: true, action: 'new_career' };
    } else if (key === 'q') {
      this.quit();
      return { success: true, action: 'quit' };
    }
    return { success: false, message: 'Invalid input. Press Enter for new career or Q to quit.' };
  }

  handleGlobalInput(key) {
    if (key === 'q') {
      this.quit();
      return { success: true, action: 'quit' };
    } else if (key === 'h') {
      this.setState('help');
      return { success: true, action: 'help' };
    }
    return { success: false, message: 'Invalid input' };
  }

  // State management
  setState(newState) {
    const validStates = [
      'main_menu', 'character_creation', 'load_game', 'training', 
      'race_results', 'help', 'career_complete'
    ];
    
    if (!validStates.includes(newState)) {
      console.error('❌ Invalid state:', newState);
      throw new Error(`Invalid state: ${newState}`);
    }
    
    const oldState = this.currentState;
    this.currentState = newState;
    
    // Clear character name buffer when leaving character creation
    if (this.currentState !== 'character_creation') {
      if (this.characterNameBuffer) {
        this.characterNameBuffer = '';
      }
    }
    
    // Auto-run first race when entering race phase
    if (newState === 'race_results' && this.game.getRaceResults().length === 0) {
      this.game.enterRacePhase();
    }
    
    this.render();
  }

  // Main menu methods
  getMainMenuOptions() {
    return ['New Career', 'Load Game', 'Help', 'Quit'];
  }

  selectMainMenuOption(option) {
    switch (option) {
      case 'new_career':
        this.setState('character_creation');
        break;
      case 'load_game':
        this.setState('load_game');
        break;
      case 'help':
        this.setState('help');
        break;
      case 'quit':
        this.quit();
        break;
    }
  }

  // Character creation
  async createCharacter(name) {
    console.log('🎮 createCharacter() called with name:', JSON.stringify(name));
    
    try {
      // Use DRY validation utility
      console.log('🔍 Validating character name...');
      const nameValidation = validation.validateCharacterName(name);
      console.log('✅ Name validation result:', nameValidation);
      
      if (!nameValidation.valid) {
        console.log('❌ Name validation failed:', nameValidation.message);
        return result.failure(nameValidation.message);
      }

      // If validation passes, create character
      console.log('🚀 Creating new game with name:', name.trim());
      const gameResult = await this.game.startNewGame(name.trim());
      
      if (gameResult.success) {
        this.setState('training');
      } else {
        console.log('❌ Game creation failed:', gameResult);
      }
      
      return gameResult;
    } catch (error) {
      console.error('💥 Character creation error:', error);
      return result.failure(`Character creation failed: ${error.message}`);
    }
  }

  // Training system
  getTrainingOptions() {
    if (!this.game.character) {
      return {};
    }
    return this.game.getGameStatus().trainingOptions;
  }

  async performTraining(trainingType) {
    try {
      if (!this.game.character) {
        return result.failure('No active character');
      }

      // Check energy using DRY utility
      if (!energy.hasEnoughEnergy(this.game.character.energy, trainingType)) {
        this.ui.updateStatus('Not enough energy! You need rest.');
        return result.failure('Not enough energy! You need rest.');
      }

      // Perform the training (now async)
      const trainingResult = await this.game.performTraining(trainingType);
      
      // Check for null/undefined result - this should not happen but let's be safe
      if (!trainingResult) {
        const errorMsg = `Training returned null/undefined result for ${trainingType}`;
        console.error('🚨 ' + errorMsg);
        return result.failure(errorMsg);
      }
      
      // Update UI message using DRY utility
      if (trainingResult.success) {
        let statusMessage;
        if (trainingType === 'rest') {
          statusMessage = 'Rested well! Energy restored.';
        } else if (trainingType === 'social') {
          statusMessage = 'Had fun! Friendship increased.';
        } else {
          const gain = trainingResult.statGain || 5;
          const currentValue = this.game.character.stats[trainingType];
          statusMessage = ui.formatTrainingResult(trainingType, gain, currentValue);
        }
        this.ui.updateStatus(statusMessage);

        // Check if a race is scheduled after this training
        if (trainingResult.raceReady && trainingResult.nextRace) {
          console.log('🏁 Race scheduled after training:', trainingResult.nextRace);
          console.log('');
          console.log('🚨 === RACE DAY! ===');
          console.log(`🏇 It's time for the ${trainingResult.nextRace.name}!`);
          console.log('🏃‍♂️ Your horse is heading to the starting line...');
          console.log('================');
          console.log('');
          this.setState('race_results');
          // Auto-run the scheduled race
          this.game.enterRacePhase();
        }
        
        // Check if career is complete
        if (trainingResult.careerComplete) {
          console.log('🏆 Career complete after training!');
          this.setState('career_complete');
          this.ui.updateStatus('Career Complete!');
        }
      }

      this.render();
      return trainingResult;
    } catch (error) {
      return result.failure(`Training failed: ${error.message}`);
    }
  }

  // Race system
  isRaceAvailable() {
    if (!this.game.character) return false;
    return this.game.checkForScheduledRace() !== null;
  }

  startRace() {
    try {
      const result = this.game.runRace();
      
      if (result.success) {
        this.setState('race_results');
        this.currentRaceResult = result;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Race failed: ${error.message}`
      };
    }
  }

  showRaceSchedule() {
    // For now, just show a message
    this.ui.updateStatus('Race schedule: Check your turn progress for upcoming races!');
  }

  // Save/Load system
  async saveGame() {
    try {
      if (!this.game.character) {
        return {
          success: false,
          message: 'No game to save'
        };
      }

      // Ensure save directory exists
      await this.ensureSaveDirectory();

      const saveData = this.game.saveGame();
      if (!saveData.success) {
        return saveData;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${this.game.character.name}_${timestamp}.json`;
      const filepath = path.join(this.saveDirectory, filename);

      await fs.writeFile(filepath, JSON.stringify(saveData.saveData, null, 2));

      this.ui.updateStatus(`Game saved as ${filename}`);
      
      return {
        success: true,
        saveFile: filepath,
        filename: filename
      };
    } catch (error) {
      return {
        success: false,
        message: `Save failed: ${error.message}`
      };
    }
  }

  async loadGame(filepath) {
    try {
      const data = await fs.readFile(filepath, 'utf8');
      const saveData = JSON.parse(data);
      
      const result = this.game.loadGame(saveData);
      
      if (result.success) {
        this.setState('training');
        this.ui.updateStatus(`Loaded ${result.character.name}`);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Failed to load game: ${error.message}`
      };
    }
  }

  async showLoadGameDialog() {
    try {
      await this.ensureSaveDirectory();
      const files = await fs.readdir(this.saveDirectory);
      const saveFiles = files.filter(file => file.endsWith('.json'));
      
      if (saveFiles.length === 0) {
        this.ui.updateStatus('No saved games found');
        return;
      }

      // For now, load the most recent save
      // TODO: Implement proper load game UI
      const latestSave = saveFiles[saveFiles.length - 1];
      const result = await this.loadGame(path.join(this.saveDirectory, latestSave));
      
      if (!result.success) {
        this.displayError(result.message);
      }
    } catch (error) {
      this.displayError(`Load game failed: ${error.message}`);
    }
  }

  async ensureSaveDirectory() {
    try {
      await fs.mkdir(this.saveDirectory, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  // Career management
  isCareerComplete() {
    return this.game.character && !this.game.character.canContinue();
  }

  getCareerSummary() {
    return this.game.completeCareer();
  }

  startNewCareer() {
    try {
      // Save legacy bonuses if career was completed
      const legacyBonuses = this.game.character ? 
        this.game.completeCareer()?.legacyBonuses : {};
      
      this.game = new Game();
      this.setState('character_creation');
      
      return {
        success: true,
        legacyBonuses: legacyBonuses
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start new career: ${error.message}`
      };
    }
  }

  // Error handling
  displayError(message) {
    this.ui.updateStatus(`❌ ${message}`);
    console.error('GameApp Error:', message);
  }

  // UI rendering
  render() {
    try {
      switch (this.currentState) {
        case 'main_menu':
          this.renderMainMenu();
          break;
        case 'character_creation':
          this.renderCharacterCreation();
          break;
        case 'load_game':
          this.renderLoadGame();
          break;
        case 'training':
          this.renderTraining();
          break;
        case 'race_results':
          this.renderRaceResults();
          break;
        case 'help':
          this.renderHelp();
          break;
        case 'career_complete':
          this.renderCareerComplete();
          break;
      }
      // Pure console output - no blessed rendering needed
    } catch (error) {
      console.error('Render error:', error);
      // Don't crash on render errors
    }
  }

  renderMainMenu() {
    this.ui.showMainMenu();
  }

  renderCharacterCreation() {
    this.ui.showCharacterCreation(this.characterNameBuffer);
  }

  renderTraining() {
    if (!this.game.character) {
      this.setState('main_menu');
      return;
    }

    this.ui.showTraining(this.game.character);
  }

  renderRaceResults() {
    if (this.currentRaceResult) {
      this.ui.showRaceResults(this.currentRaceResult);
    }
  }

  renderLoadGame() {
    // Get all save files and display them
    this.loadSaveFiles().then(saves => {
      this.ui.showSaveGameList(saves);
    }).catch(error => {
      this.ui.showError('Failed to load save files: ' + error.message);
      this.setState('main_menu');
    });
  }

  renderHelp() {
    this.ui.showHelp();
  }

  renderCareerComplete() {
    if (this.game.character) {
      const finalGrade = this.calculateFinalGrade();
      this.ui.showCareerComplete(this.game.character, finalGrade);
    }
  }

  calculateFinalGrade() {
    if (!this.game.character) return 'F';
    
    const stats = this.game.character.getCurrentStats();
    const career = this.game.character.career;
    
    // Calculate grade based on stats and performance
    const avgStats = (stats.speed + stats.stamina + stats.power) / 3;
    const winRate = career.racesRun > 0 ? career.racesWon / career.racesRun : 0;
    
    const score = (avgStats * 0.6) + (winRate * 40);
    
    if (score >= 85) return 'S';
    if (score >= 75) return 'A';
    if (score >= 65) return 'B';  
    if (score >= 55) return 'C';
    if (score >= 45) return 'D';
    return 'F';
  }

  async loadSaveFiles() {
    try {
      await this.ensureSaveDirectory();
      const files = await fs.readdir(this.saveDirectory);
      const saveFiles = files.filter(file => file.endsWith('.json'));
      
      const saves = [];
      for (const filename of saveFiles) {
        try {
          const filePath = path.join(this.saveDirectory, filename);
          const data = await fs.readFile(filePath, 'utf8');
          const saveData = JSON.parse(data);
          saves.push(saveData);
        } catch (error) {
          console.log('Failed to load save file:', filename, error.message);
        }
      }
      
      return saves;
    } catch (error) {
      throw new Error('Could not access save directory: ' + error.message);
    }
  }

  handleLoadGameInput(key) {
    // Handle quit
    if (key === 'q') {
      this.setState('main_menu');
      return { success: true, action: 'back_to_menu' };
    }

    // Handle number selection
    const choice = parseInt(key);
    if (!isNaN(choice) && choice >= 1) {
      this.loadGameByIndex(choice - 1).then(result => {
        if (result.success) {
          this.ui.showMessage('Game loaded successfully!');
          this.setState('training');
        } else {
          this.ui.showError('Failed to load game: ' + result.message);
        }
        this.render();
      }).catch(error => {
        this.ui.showError('Load error: ' + error.message);
        this.render();
      });
      
      return { success: true, action: 'load_game', choice: choice };
    }

    return { success: false, action: 'invalid_key', key: key };
  }

  async loadGameByIndex(index) {
    try {
      const saves = await this.loadSaveFiles();
      if (index < 0 || index >= saves.length) {
        return { success: false, message: 'Invalid save file number' };
      }

      const saveData = saves[index];
      const result = this.game.loadFromData(saveData);
      
      if (result.success) {
        return { success: true, message: 'Game loaded successfully' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // P0 Critical Path Methods - Required by tests
  getMenuOptions() {
    return [
      { key: '1', text: 'New Career' },
      { key: '2', text: 'Load Game' },
      { key: '3', text: 'Help' },
      { key: '4', text: 'Quit' }
    ];
  }

  getStatusMessage() {
    return this.ui.lastMessage || 'Select an option (1-4) or press Q to quit';
  }

  getCharacterCreationData() {
    return {
      prompt: 'Enter horse name and press Enter...',
      previewStats: {
        speed: 20,
        stamina: 20,
        power: 20,
        energy: 100
      }
    };
  }

  getTrainingOptions() {
    return [
      { key: '1', name: 'Speed Training', energyCost: 15 },
      { key: '2', name: 'Stamina Training', energyCost: 10 },
      { key: '3', name: 'Power Training', energyCost: 15 },
      { key: '4', name: 'Rest', energyCost: 0 },
      { key: '5', name: 'Social Time', energyCost: 5 }
    ];
  }

  getCurrentDisplayStats() {
    if (!this.game.character) return null;
    return {
      speed: this.game.character.stats.speed,
      stamina: this.game.character.stats.stamina,
      power: this.game.character.stats.power,
      energy: this.game.character.energy,
      mood: this.game.character.mood,
      turn: this.game.turnCount,
      maxTurns: 12
    };
  }

  getLastMessage() {
    return this.ui.lastMessage || '';
  }

  // Application lifecycle
  quit() {
    console.log('\nThanks for playing Uma Musume Text Clone!');
    
    // Close readline interface
    if (this.rl) {
      this.rl.close();
    }
    
    // Only exit if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  }
  

  destroy() {
    // Clean up readline interface
    if (this.rl) {
      this.rl.close();
    }
  }
}

module.exports = GameApp;