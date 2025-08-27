const Game = require('./systems/Game');
const TextUI = require('./systems/TextUI');
const RaceAnimation = require('./systems/RaceAnimation');
const GameStateMachine = require('./systems/GameStateMachine');
const NameGenerator = require('./utils/NameGenerator');
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
    this.nameGenerator = new NameGenerator();
    this.stateMachine = new GameStateMachine(this); // Replace validator with state machine
    this.saveDirectory = path.join(__dirname, '../data/saves');
    this.characterNameBuffer = '';
    this.nameOptions = [];
    
    // Career data structures - established at career start
    this.careerConfig = null;      // Career configuration (turns, races, training pattern)
    this.careerNPHs = null;        // All rival horses for this career
    this.careerRaces = null;       // All race configurations for this career
    this.careerTimeline = null;    // Race schedule timeline
    
    // Warning message system
    this.warningMessage = null;    // Current warning message to display
    this.warningType = null;       // Type of warning (energy, etc.)
    
    // Initialize state machine
    this.stateMachine.reset('main_menu');
    
    // No blessed, no screen, just pure console input handling
    this.setupKeyboardInput();
  }

  // Property accessor for backward compatibility
  get currentState() {
    return this.stateMachine ? this.stateMachine.getCurrentState() : 'main_menu';
  }
  
  set currentState(state) {
    // This setter is mainly for backward compatibility
    if (this.stateMachine) {
      this.stateMachine.transitionTo(state);
    }
  }

  /**
   * Start the game application with pure console input
   */
  start() {
    console.log('Starting Horse Racing Text Game...\n');
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
      
      // Always process non-empty input, allow empty input for navigation states
      if (trimmed !== '' || this.isNavigationState()) {
        this.handleKeyInput(trimmed || 'enter');
      }
    });
    
    // Handle Ctrl+C with clean shutdown
    this.rl.on('SIGINT', () => {
      console.log('\n\n👋 Received interrupt signal, cleaning up...');
      this.cleanup();
      process.exit(0);
    });
  }

  handleKeyInput(key) {
    try {
      // Handle fast forward during race animation
      if (this.isRaceAnimationRunning && (key === 'enter' || key === '')) {
        console.log('⚡ Fast forwarding to race results...');
        this.raceAnimation.enableFastForward();
        return { success: true, message: 'Fast forwarding...' };
      }
      
      // Use state machine for O(1) input handling vs O(n) switch-case
      const result = this.stateMachine.processGameInput(key);
      
      if (!result.success) {
        console.log(`❌ ${result.error}`);
        if (result.availableInputs) {
          console.log(`💡 Available inputs: ${result.availableInputs.join(', ')}`);
        }
        // Re-render the current state to refresh the screen
        this.render();
      } else {
        // If successful, render the new state
        this.render();
      }
      
      return result;
    } catch (error) {
      this.displayError(`Input error: ${error.message}`);
      // Re-render on error
      this.render();
      return { success: false, message: 'Input error' };
    }
  }

  // Input handlers now managed by GameStateMachine for O(1) performance

  // Character creation input now handled by GameStateMachine

  // All input handlers moved to GameStateMachine for O(1) lookup vs O(n) switch-case

  // Helper method to check if current state expects navigation input
  isNavigationState() {
    const currentState = this.stateMachine.getCurrentState();
    const metadata = this.stateMachine.getStateMetadata(currentState);
    return metadata.allowEmpty || false;
  }

  // State management using O(1) state machine
  setState(newState) {
    const result = this.stateMachine.transitionTo(newState);
    
    if (!result.success) {
      console.error('❌ Invalid state transition:', result.error);
      console.log(`💡 Allowed transitions: ${result.allowedTransitions?.join(', ') || 'none'}`);
      throw new Error(`Invalid state transition: ${result.error}`);
    }
    
    // Clear character name buffer when leaving character creation
    if (newState !== 'character_creation') {
      if (this.characterNameBuffer) {
        this.characterNameBuffer = '';
      }
    }
    
    // Auto-run first race when entering race phase
    if (newState === 'race_results' && this.game.getRaceResults().length === 0) {
      this.game.enterRacePhase();
    }
    
    // Check for auto-transitions
    this.stateMachine.checkAutoTransitions();
    
    this.render();
  }

  // Main menu methods
  getMainMenuOptions() {
    return ['New Career', 'Load Game', 'Help', 'Quit'];
  }

  selectMainMenuOption(option) {
    // Use Map lookup for O(1) performance vs O(n) switch-case
    const optionHandlers = new Map([
      ['new_career', () => this.setState('character_creation')],
      ['load_game', () => this.setState('load_game')],
      ['help', () => this.setState('help')],
      ['quit', () => this.quit()]
    ]);
    
    const handler = optionHandlers.get(option);
    if (handler) {
      handler();
    }
  }

  // Character creation
  createCharacter(name) {
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

      // If validation passes, create character synchronously
      console.log('🚀 Creating new game with name:', name.trim());
      const gameResult = this.game.startNewGameSync(name.trim());
      
      if (gameResult.success) {
        // Store all career data structures for gameplay
        this.careerConfig = gameResult.career;
        this.careerNPHs = this.game.nphRoster.nphs;
        this.careerRaces = this.game.timeline.getRaceScheduleSummary();
        this.careerTimeline = this.game.timeline;
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

  /**
   * Get energy cost for a training type
   */
  getTrainingEnergyCost(trainingType) {
    const costs = {
      'speed': 15,
      'stamina': 10,
      'power': 15,
      'rest': 0,
      'media': 0  // Media day doesn't cost energy, provides partial recovery
    };
    return costs[trainingType] || 0;
  }

  performTrainingSync(trainingType) {
    try {
      if (!this.game.character) {
        return result.failure('No active character');
      }

      // Check energy requirements with clear warning
      const energyRequired = this.getTrainingEnergyCost(trainingType);
      const currentEnergy = this.game.character.condition.energy;
      
      if (currentEnergy < energyRequired) {
        const warningMsg = `❌ Not enough energy! You need ${energyRequired} energy but only have ${currentEnergy}. Try Rest Day to recover energy.`;
        this.setWarning(warningMsg, 'energy');
        return result.failure(warningMsg);
      }

      // Clear any existing warning since we have sufficient energy
      this.clearWarning();

      // Perform the training synchronously
      const trainingResult = this.game.performTrainingSync(trainingType);
      
      // Check for null/undefined result - this should not happen but let's be safe
      if (!trainingResult) {
        const errorMsg = `Training returned null/undefined result for ${trainingType}`;
        console.error('🚨 ' + errorMsg);
        return result.failure(errorMsg);
      }
      
      // Update UI message using DRY utility
      if (trainingResult.success) {
        // Use the detailed messages from the training result
        const message = (trainingResult.messages && trainingResult.messages.length > 0) 
          ? trainingResult.messages[0] 
          : trainingResult.message || `${trainingType} training completed!`;
        this.ui.updateStatus(message);
        
        // Display success message immediately
        console.log('');
        console.log(`✅ ${message}`);
        console.log('');
        
        // Handle race transitions - Start with race preview (only if not already in race flow)
        if (trainingResult.raceReady && this.currentState !== 'race_preview') {
          console.log('🏁 Race is ready after training!');
          this.upcomingRace = trainingResult.nextRace;
          this.setState('race_preview');
        }
        
        // Check if career is complete
        if (trainingResult.careerComplete) {
          console.log('🏆 Career complete after training!');
          this.setState('career_complete');
        }
        
        // Re-render the training screen to show updated turn and stats
        if (!trainingResult.raceReady && !trainingResult.careerComplete) {
          this.render();
        }
      } else {
        this.ui.updateStatus(`❌ ${trainingResult.message}`);
        
        // Display failure message immediately
        console.log('');
        console.log(`❌ ${trainingResult.message}`);
        console.log('');
        
        this.render(); // Re-render even on failure to show current state
      }
      
      return trainingResult;
    } catch (error) {
      console.error('💥 Training error:', error);
      return result.failure(`Training failed: ${error.message}`);
    }
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

        // Check if a race is scheduled after this training (only if not already in race flow)
        if (trainingResult.raceReady && trainingResult.nextRace && this.currentState !== 'race_preview') {
          console.log('🏁 Race scheduled after training:', trainingResult.nextRace);
          console.log('');
          console.log('🚨 === RACE DAY! ===');
          console.log(`🏇 It's time for the ${trainingResult.nextRace.name}!`);
          console.log('🏃‍♂️ Your horse is heading to the starting line...');
          console.log('================');
          console.log('');
          this.setState('race_preview');
          // Store upcoming race info for race flow
          this.upcomingRace = trainingResult.nextRace;
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
      const currentState = this.stateMachine.getCurrentState();
      
      // Use Map for O(1) lookup vs O(n) switch-case
      const renderHandlers = new Map([
        ['main_menu', () => this.renderMainMenu()],
        ['character_creation', () => this.renderCharacterCreation()],
        ['load_game', () => this.renderLoadGame()],
        ['training', () => this.renderTraining()],
        ['race_preview', () => this.renderRacePreview()],
        ['horse_lineup', () => this.renderHorseLineup()],
        ['strategy_select', () => this.renderStrategySelect()],
        ['race_running', () => this.renderRaceRunning()],
        ['race_results', () => this.renderRaceResults()],
        ['career_complete', () => this.renderCareerComplete()],
        ['podium', () => this.renderPodium()],
        ['help', () => this.renderHelp()]
      ]);
      
      const renderHandler = renderHandlers.get(currentState);
      if (renderHandler) {
        renderHandler();
      } else {
        console.warn(`⚠️ No render handler for state: ${currentState}`);
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
    this.ui.showCharacterCreation(this.characterNameBuffer, this.nameOptions);
  }

  renderTraining() {
    if (!this.game.character) {
      this.setState('main_menu');
      return;
    }

    // Get proper next race info from the game system
    const nextRace = this.game.getNextRace();
    this.ui.showTraining(this.game.character, nextRace, this.warningMessage);
  }

  renderRaceResults() {
    // Clean up race animation now that race is complete
    if (this.raceAnimation) {
      this.raceAnimation.cleanup();
      this.raceAnimation = null;
    }
    
    if (this.currentRaceResult) {
      this.ui.showRaceResults(this.currentRaceResult);
      
      // Check if this was the final race and prepare career completion data
      const isLastRace = this.careerRaces && 
                         this.game.character.career.racesRun >= this.careerRaces.length;
      
      if (isLastRace) {
        // Store career summary for the dedicated career complete screen
        this.careerSummary = this.generateCareerSummary();
      }
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

  renderCareerComplete() {
    if (this.careerSummary) {
      this.ui.showCareerCompletion(this.careerSummary);
    }
  }

  renderHelp() {
    this.ui.showHelp();
  }

  /**
   * Set a warning message that will persist until acknowledged
   */
  setWarning(message, type = 'general') {
    this.warningMessage = message;
    this.warningType = type;
  }

  /**
   * Clear the current warning message
   */
  clearWarning() {
    this.warningMessage = null;
    this.warningType = null;
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

  // Load game input now handled by GameStateMachine

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

  // Application lifecycle with clean shutdown
  quit() {
    console.log('\n\n🌟 Thanks for playing Horse Racing Text Game!');
    console.log('👋 Goodbye!');
    
    this.cleanup();
    
    // Only exit if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  }

  // New race flow render methods
  renderRacePreview() {
    // Ensure we have fresh race data
    this.refreshCurrentRaceData();
    this.raceField = null; // Reset race field for new race
    this.ui.showRacePreview(this.upcomingRace, this.game.character);
  }

  renderHorseLineup() {
    // Generate fresh competition field for this race
    this.raceField = this.generateRaceField();
    this.ui.showHorseLineup(this.raceField, this.game.character);
  }

  renderStrategySelect() {
    this.ui.showStrategySelect();
  }

  renderRaceRunning() {
    // Ensure we have fresh race data for the current turn
    this.refreshCurrentRaceData();
    
    // Start race animation if not already running
    if (!this.raceAnimation) {
      this.startRaceAnimation();
    }
  }

  /**
   * Refresh race data for current turn to prevent stale data issues
   */
  refreshCurrentRaceData() {
    if (!this.game.character) return;
    
    // Get current race data from Timeline (this is the race for THIS turn)
    const currentTurn = this.game.character.career.turn;
    const currentRace = this.game.timeline.getRaceDetails(currentTurn);
    
    if (currentRace) {
      this.upcomingRace = {
        name: currentRace.name,
        type: currentRace.type,
        surface: currentRace.surface,
        distance: currentRace.distance,
        turn: currentRace.turn,
        description: currentRace.description
      };
      
      // Race data refreshed silently
    } else {
      console.warn(`⚠️ No race data found for turn ${currentTurn}`);
    }
  }

  renderPodium() {
    if (this.currentRaceResult) {
      this.ui.showPodium(this.currentRaceResult);
    }
  }

  generateRaceField() {
    // Use the pre-established career NPH data for consistent competition
    if (this.careerNPHs && this.careerNPHs.length > 0) {
      // Select a subset for this race (typically 7 competitors)
      const fieldSize = Math.min(7, this.careerNPHs.length);
      return this.careerNPHs.slice(0, fieldSize).map(horse => ({
        name: horse.name,
        stats: horse.getCurrentStats(),
        icon: horse.icon || '🐎'
      }));
    }
    
    // Fallback to NPH roster if available
    if (this.game.nphRoster) {
      return this.game.nphRoster.getRaceField(7);
    }
    
    // Last resort fallback
    const field = [];
    for (let i = 0; i < 7; i++) {
      field.push({
        name: `Horse ${i + 1}`,
        stats: {
          speed: 30 + Math.random() * 40,
          stamina: 30 + Math.random() * 40,
          power: 30 + Math.random() * 40
        },
        icon: ['🐎', '🏇', '🐴'][i % 3]
      });
    }
    return field;
  }

  startRaceAnimation() {
    // Create race animation instance
    this.raceAnimation = new RaceAnimation(
      this.raceField,
      this.game.character,
      this.upcomingRace
    );
    
    // Enable fast forward input during animation
    this.isRaceAnimationRunning = true;
    
    this.raceAnimation.run().then(result => {
      this.isRaceAnimationRunning = false;
      this.currentRaceResult = result;
      
      // Complete the race and update character stats
      const playerPosition = result.results.findIndex(r => r.participant.isPlayer) + 1;
      this.game.character.completeRace(playerPosition, result.results.length);
      
      // Advance to next turn after race
      this.game.character.career.turn++;
      
      // Always go to race_results first, then check career completion there
      this.setState('race_results');
    });
  }

  /**
   * Generate career summary and grade for the player horse
   */
  generateCareerSummary() {
    const character = this.game.character;
    const raceResults = this.game.getRaceResults();
    
    // Calculate career statistics
    const stats = {
      finalStats: character.getCurrentStats(),
      startingStats: { speed: 20, stamina: 20, power: 20 }, // Default starting stats
      racesWon: character.career.racesWon,
      racesRun: character.career.racesRun,
      totalTraining: character.career.totalTraining,
      bond: character.bond
    };
    
    // Calculate grade based on performance
    const grade = this.calculateCareerGrade(stats, raceResults);
    
    return {
      stats: stats,
      grade: grade,
      achievements: this.calculateAchievements(stats, raceResults),
      message: this.getGradeMessage(grade)
    };
  }

  /**
   * Calculate career grade (S, A, B, C, D, F)
   */
  calculateCareerGrade(stats, raceResults) {
    let score = 0;
    
    // Race performance (40% of grade)
    const winRate = stats.racesRun > 0 ? stats.racesWon / stats.racesRun : 0;
    score += winRate * 40;
    
    // Average placement in races (20% of grade)
    let avgPlacement = 0;
    if (raceResults.length > 0) {
      avgPlacement = raceResults.reduce((sum, race) => sum + race.playerPosition, 0) / raceResults.length;
      score += Math.max(0, (8 - avgPlacement) / 7 * 20); // Better placement = higher score
    }
    
    // Stat development (30% of grade)
    const totalStatGain = (stats.finalStats.speed - stats.startingStats.speed) +
                          (stats.finalStats.stamina - stats.startingStats.stamina) +
                          (stats.finalStats.power - stats.startingStats.power);
    score += Math.min(30, totalStatGain / 8); // Up to 240 total stat gain for max points
    
    // Friendship bonus (10% of grade)
    score += (stats.bond / 100) * 10;
    
    // Convert to letter grade
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Calculate achievements earned during career
   */
  calculateAchievements(stats, raceResults) {
    const achievements = [];
    
    // Race achievements
    if (stats.racesWon === stats.racesRun && stats.racesRun > 0) {
      achievements.push('🏆 Perfect Record - Won every race!');
    } else if (stats.racesWon >= 3) {
      achievements.push('🥇 Champion - Won 3+ races');
    } else if (stats.racesWon >= 1) {
      achievements.push('🥉 Winner - Won at least one race');
    }
    
    // Stat achievements
    const maxStat = Math.max(stats.finalStats.speed, stats.finalStats.stamina, stats.finalStats.power);
    if (maxStat >= 100) {
      achievements.push('⭐ Maxed Out - Reached 100 in a stat');
    }
    
    const totalFinalStats = stats.finalStats.speed + stats.finalStats.stamina + stats.finalStats.power;
    if (totalFinalStats >= 270) {
      achievements.push('💎 Elite Athlete - Total stats over 270');
    }
    
    // Bond achievements
    if (stats.bond >= 100) {
      achievements.push('❤️ Perfect Bond - Maximum bond');
    } else if (stats.bond >= 80) {
      achievements.push('😊 Strong Bond - High bond');
    }
    
    // Training achievements
    if (stats.totalTraining >= 20) {
      achievements.push('🏃 Training Fanatic - 20+ training sessions');
    }
    
    return achievements;
  }

  /**
   * Get grade-specific message
   */
  getGradeMessage(grade) {
    const messages = {
      'S': 'Legendary career! Your horse is destined for greatness!',
      'A': 'Outstanding performance! A truly exceptional horse!',
      'B': 'Solid career with impressive achievements!',
      'C': 'Good effort with room for improvement!',
      'D': 'A decent start, but more training needed!',
      'F': 'Tough career, but every champion starts somewhere!'
    };
    return messages[grade] || 'Career complete!';
  }

  cleanup() {
    console.log('🧹 Cleaning up resources...');
    
    // Close readline interface with proper cleanup
    if (this.rl) {
      this.rl.removeAllListeners();
      this.rl.close();
      this.rl = null;
    }
    
    // Cleanup race animation
    if (this.raceAnimation) {
      this.raceAnimation.cleanup();
      this.raceAnimation = null;
    }
    
    // Reset state machine
    if (this.stateMachine) {
      this.stateMachine.reset();
    }
    
    // Clear any pending timeouts/intervals
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    
    // Clear console for clean exit
    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[2J\x1b[0f'); // Clear screen
    }
    
    console.log('✅ Cleanup complete');
  }
  

  destroy() {
    // Clean up readline interface
    if (this.rl) {
      this.rl.close();
    }
  }
}

module.exports = GameApp;