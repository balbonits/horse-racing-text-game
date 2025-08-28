/**
 * Game Engine - Pure Game Logic API
 * 
 * This is the core game engine that handles all game mechanics without any UI dependencies.
 * It provides a clean API that can be consumed by any UI system (console, web, mobile).
 * 
 * Design Principles:
 * - Pure game logic with no UI/rendering code
 * - Event-driven architecture for loose coupling
 * - Stateless API methods where possible
 * - Comprehensive error handling and validation
 * - Thread-safe operations for future multiplayer support
 */

const EventEmitter = require('events');
const Game = require('../systems/Game');
const OfflineSaveSystem = require('../systems/OfflineSaveSystem');
const NameGenerator = require('../utils/NameGenerator');
const SpecializedCharacter = require('../models/SpecializedCharacter');
const HorseBreed = require('../models/specializations/HorseBreed');
const RacingStyle = require('../models/specializations/RacingStyle');

class GameEngine extends EventEmitter {
  constructor() {
    super();
    
    // Core game systems
    this.game = new Game();
    this.saveSystem = new OfflineSaveSystem();
    this.nameGenerator = new NameGenerator();
    
    // v1 Specialization systems
    this.breedSystem = new HorseBreed();
    this.styleSystem = new RacingStyle();
    
    // Game state tracking
    this.gameState = {
      phase: 'menu', // menu, character_creation, training, racing, career_complete
      character: null,
      career: null,
      currentTurn: 0,
      upcomingRace: null,
      warnings: []
    };
    
    // Session tracking
    this.sessionId = this.generateSessionId();
    this.initialized = false;
  }

  /**
   * Initialize the game engine
   * @returns {Object} Initialization result
   */
  async initialize() {
    try {
      this.emit('engine:initializing');
      
      // Initialize subsystems (OfflineSaveSystem auto-initializes in constructor)
      // No async initialization needed for OfflineSaveSystem
      
      this.initialized = true;
      this.emit('engine:initialized', { sessionId: this.sessionId });
      
      return {
        success: true,
        sessionId: this.sessionId,
        version: '1.0.0'
      };
    } catch (error) {
      this.emit('engine:error', { type: 'initialization', error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current game state
   * @returns {Object} Current game state
   */
  getGameState() {
    return {
      ...this.gameState,
      character: this.game.character ? {
        name: this.game.character.name,
        stats: { ...this.game.character.stats },
        condition: { ...this.game.character.condition },
        career: this.game.character.career ? { ...this.game.character.career } : null
      } : null,
      turn: this.game.character?.turn || 0,
      maxTurns: this.game.character?.maxTurns || 24,
      nextRace: this.getNextRaceInfo(),
      availableActions: this.getAvailableActions()
    };
  }

  /**
   * Create a new character and start career
   * @param {string} name - Character name
   * @returns {Object} Creation result
   */
  async createCharacter(name) {
    try {
      if (!this.initialized) {
        throw new Error('Game engine not initialized');
      }

      this.emit('character:creating', { name });

      // Validate name
      if (!name || name.trim().length === 0 || name.length > 20) {
        throw new Error('Name must be 1-20 characters');
      }

      // Create new game
      const result = this.game.startNewGameSync(name.trim());
      if (!result.success) {
        throw new Error(result.message || 'Failed to create character');
      }

      // Update game state
      this.gameState.phase = 'training';
      this.gameState.character = this.game.character;
      this.gameState.career = result.career;
      this.gameState.currentTurn = 1;

      this.emit('character:created', {
        character: this.getGameState().character,
        career: this.gameState.career
      });

      return {
        success: true,
        character: this.getGameState().character,
        career: this.gameState.career
      };

    } catch (error) {
      this.emit('character:error', { type: 'creation', error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform training action
   * @param {string} trainingType - Type of training (speed, stamina, power, rest, media)
   * @returns {Object} Training result
   */
  async performTraining(trainingType) {
    try {
      if (!this.game.character) {
        throw new Error('No active character');
      }

      if (this.gameState.phase !== 'training') {
        throw new Error(`Cannot train during ${this.gameState.phase} phase`);
      }

      this.emit('training:starting', { type: trainingType, turn: this.gameState.currentTurn });

      // Perform training
      const result = this.game.performTrainingSync(trainingType);
      
      if (!result.success) {
        this.emit('training:failed', { 
          type: trainingType, 
          error: result.message,
          turn: this.gameState.currentTurn
        });
        return result;
      }

      // Update game state
      this.gameState.currentTurn = this.game.character.turn;
      this.clearWarnings();

      // Check for race transitions
      if (result.raceReady) {
        this.gameState.phase = 'race_preview';
        this.gameState.upcomingRace = result.nextRace;
        
        this.emit('race:ready', {
          race: result.nextRace,
          turn: this.gameState.currentTurn
        });
      }

      // Check for career completion
      if (result.careerComplete) {
        this.gameState.phase = 'career_complete';
        
        this.emit('career:complete', {
          character: this.getGameState().character,
          finalStats: result.finalStats || {}
        });
      }

      this.emit('training:completed', {
        type: trainingType,
        result: result,
        newStats: this.getGameState().character.stats,
        turn: this.gameState.currentTurn
      });

      return {
        success: true,
        trainingType,
        result: result,
        gameState: this.getGameState()
      };

    } catch (error) {
      this.emit('training:error', { type: trainingType, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start a race
   * @param {string} strategy - Racing strategy (FRONT, MID, LATE)
   * @returns {Object} Race result
   */
  async startRace(strategy = 'MID') {
    try {
      if (!this.game.character) {
        throw new Error('No active character');
      }

      if (this.gameState.phase !== 'race_preview') {
        throw new Error(`Cannot start race during ${this.gameState.phase} phase`);
      }

      this.emit('race:starting', { 
        strategy, 
        race: this.gameState.upcomingRace,
        turn: this.gameState.currentTurn
      });

      this.gameState.phase = 'racing';

      // Simulate race (this would be expanded for real-time race simulation)
      const raceResult = await this.simulateRace(strategy);

      this.gameState.phase = 'race_results';

      this.emit('race:completed', {
        result: raceResult,
        turn: this.gameState.currentTurn
      });

      return {
        success: true,
        raceResult,
        gameState: this.getGameState()
      };

    } catch (error) {
      this.emit('race:error', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate name suggestions
   * @param {number} count - Number of names to generate
   * @returns {Object} Generated names
   */
  generateNames(count = 6) {
    try {
      const names = this.nameGenerator.generateNameOptions(count);
      
      this.emit('names:generated', { names, count });
      
      return {
        success: true,
        names
      };
    } catch (error) {
      this.emit('names:error', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all available horse breeds
   * @returns {Object} Available breeds
   */
  getAvailableBreeds() {
    try {
      const breeds = this.breedSystem.getAllBreeds();
      
      return {
        success: true,
        breeds: breeds.map(breed => ({
          id: breed.id,
          name: breed.name,
          description: breed.description,
          rarity: breed.rarity,
          characteristics: breed.characteristics
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all available racing styles
   * @returns {Object} Available racing styles
   */
  getAvailableRacingStyles() {
    try {
      const styles = this.styleSystem.getAllStyles();
      
      return {
        success: true,
        styles: styles.map(style => ({
          id: style.id,
          name: style.name,
          description: style.description,
          advantages: style.advantages,
          risks: style.risks
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get breed recommendation for character stats
   * @param {Object} stats - Character stats
   * @returns {Object} Breed recommendations
   */
  getBreedRecommendations(stats) {
    try {
      const breeds = this.breedSystem.getAllBreeds();
      const recommendations = [];
      
      breeds.forEach(breed => {
        // Calculate compatibility score
        let score = 0;
        let factors = 0;
        
        // Check stat compatibility
        Object.entries(breed.statModifiers).forEach(([stat, modifier]) => {
          if (modifier > 1.0 && stats[stat] >= 50) {
            score += 20; // Good match - high stat with breed bonus
          } else if (modifier < 1.0 && stats[stat] <= 50) {
            score += 10; // Acceptable - low stat with breed penalty
          }
          factors++;
        });
        
        recommendations.push({
          breed: breed,
          compatibility: Math.round(score / factors),
          reasons: this.getBreedCompatibilityReasons(stats, breed)
        });
      });
      
      recommendations.sort((a, b) => b.compatibility - a.compatibility);
      
      return {
        success: true,
        recommendations
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get racing style recommendations for character stats
   * @param {Object} stats - Character stats
   * @returns {Object} Style recommendations
   */
  getRacingStyleRecommendations(stats) {
    try {
      const recommendations = this.styleSystem.getStyleRecommendations(stats);
      
      return {
        success: true,
        recommended: recommendations.recommended,
        alternatives: recommendations.alternatives,
        summary: recommendations.summary
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create specialized character with breed and style selection
   * @param {string} name - Character name
   * @param {Object} options - Creation options {breed, racingStyle}
   * @returns {Object} Creation result
   */
  async createSpecializedCharacter(name, options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Game engine not initialized');
      }

      this.emit('character:creating', { name, specialization: options });

      // Validate name
      if (!name || name.trim().length === 0 || name.length > 20) {
        throw new Error('Name must be 1-20 characters');
      }

      // Create specialized character
      const character = new SpecializedCharacter(name.trim(), {
        breed: options.breed,
        racingStyle: options.racingStyle
      });

      // Initialize game with specialized character
      const result = this.game.startNewGameWithCharacter(character);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create specialized character');
      }

      // Update game state
      this.gameState.phase = 'training';
      this.gameState.character = character;
      this.gameState.career = result.career;
      this.gameState.currentTurn = 1;

      this.emit('character:created', {
        character: this.getGameState().character,
        career: this.gameState.career,
        specialization: character.getSpecializationInfo()
      });

      return {
        success: true,
        character: this.getGameState().character,
        career: this.gameState.career,
        specialization: character.getSpecializationInfo()
      };

    } catch (error) {
      this.emit('character:error', { type: 'specialization', error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get character specialization info
   * @returns {Object} Specialization information
   */
  getCharacterSpecialization() {
    try {
      if (!this.game.character || !(this.game.character instanceof SpecializedCharacter)) {
        return {
          success: false,
          error: 'No specialized character found'
        };
      }

      const info = this.game.character.getSpecializationInfo();
      const advice = this.game.character.getTrainingAdvice();

      return {
        success: true,
        specialization: info,
        trainingAdvice: advice
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save game state
   * @returns {Object} Save result
   */
  async saveGame() {
    try {
      if (!this.game.character) {
        throw new Error('No active character to save');
      }

      this.emit('save:starting');

      const saveResult = await this.saveSystem.saveGame(
        this.game.character.name,
        this.game.character,
        {
          career: this.gameState.career,
          turn: this.gameState.currentTurn,
          phase: this.gameState.phase
        }
      );

      this.emit('save:completed', { result: saveResult });

      return saveResult;

    } catch (error) {
      this.emit('save:error', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load game state
   * @param {number} slotIndex - Save slot index
   * @returns {Object} Load result
   */
  async loadGame(slotIndex) {
    try {
      this.emit('load:starting', { slotIndex });

      const loadResult = await this.saveSystem.loadGame(slotIndex);
      
      if (!loadResult.success) {
        throw new Error(loadResult.message);
      }

      // Restore game state
      const gameResult = this.game.loadCharacterSync(loadResult.character);
      if (!gameResult.success) {
        throw new Error('Failed to load character data');
      }

      // Restore engine state
      this.gameState.phase = loadResult.metadata?.phase || 'training';
      this.gameState.character = this.game.character;
      this.gameState.career = loadResult.metadata?.career;
      this.gameState.currentTurn = loadResult.metadata?.turn || this.game.character.turn;

      this.emit('load:completed', { 
        character: this.getGameState().character,
        phase: this.gameState.phase
      });

      return {
        success: true,
        character: this.getGameState().character,
        gameState: this.getGameState()
      };

    } catch (error) {
      this.emit('load:error', { slotIndex, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available save files
   * @returns {Object} Available saves
   */
  async getAvailableSaves() {
    try {
      const saves = await this.saveSystem.getAvailableSaves();
      
      return {
        success: true,
        saves
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Get breed compatibility reasons
   * @param {Object} stats - Character stats
   * @param {Object} breed - Breed information
   * @returns {Array} Compatibility reasons
   */
  getBreedCompatibilityReasons(stats, breed) {
    const reasons = [];
    
    Object.entries(breed.statModifiers).forEach(([stat, modifier]) => {
      if (modifier > 1.0) {
        reasons.push(`+${Math.round((modifier - 1) * 100)}% ${stat} bonus`);
      } else if (modifier < 1.0) {
        reasons.push(`${Math.round((1 - modifier) * 100)}% ${stat} penalty`);
      }
    });
    
    if (breed.characteristics && breed.characteristics.length > 0) {
      reasons.push(`Traits: ${breed.characteristics[0]}`);
    }
    
    return reasons;
  }

  /**
   * Simulate a race (placeholder for full race system)
   * @param {string} strategy - Racing strategy
   * @returns {Object} Race simulation result
   */
  async simulateRace(strategy) {
    // This is a simplified race simulation
    // In v1, this would be expanded to include:
    // - Track segments
    // - Weather conditions
    // - NPH AI behaviors
    // - Real-time race progression
    
    const character = this.game.character;
    const race = this.gameState.upcomingRace;
    
    // Simple performance calculation
    const speedWeight = strategy === 'FRONT' ? 0.5 : strategy === 'LATE' ? 0.3 : 0.4;
    const staminaWeight = strategy === 'LATE' ? 0.4 : strategy === 'FRONT' ? 0.2 : 0.35;
    const powerWeight = 1 - speedWeight - staminaWeight;
    
    const performance = (
      character.stats.speed * speedWeight +
      character.stats.stamina * staminaWeight +
      character.stats.power * powerWeight
    ) * (character.condition.energy / 100) * (Math.random() * 0.3 + 0.85);
    
    // Determine placement based on performance
    const placement = performance > 75 ? 1 : performance > 60 ? 2 : performance > 45 ? 3 : Math.ceil(Math.random() * 5) + 3;
    
    return {
      placement,
      performance: Math.round(performance),
      strategy,
      race: race,
      prize: placement <= 3 ? [5000, 3000, 1500][placement - 1] : 0,
      time: `${Math.floor(race.distance / 100)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    };
  }

  /**
   * Get next race information
   * @returns {Object} Next race info or null
   */
  getNextRaceInfo() {
    if (!this.game.character || !this.game.timeline) {
      return null;
    }

    const nextRace = this.game.timeline.getNextRaceInfo(this.gameState.currentTurn);
    return nextRace || null;
  }

  /**
   * Get available actions for current game state
   * @returns {Array} Available actions
   */
  getAvailableActions() {
    if (!this.game.character) {
      return ['create_character'];
    }

    switch (this.gameState.phase) {
      case 'training':
        return ['speed_training', 'stamina_training', 'power_training', 'rest_training', 'media_training', 'save_game'];
      case 'race_preview':
        return ['start_race'];
      case 'racing':
        return ['fast_forward'];
      case 'race_results':
        return ['continue'];
      case 'career_complete':
        return ['new_career', 'view_stats'];
      default:
        return [];
    }
  }

  /**
   * Add warning message
   * @param {string} message - Warning message
   * @param {string} type - Warning type
   */
  addWarning(message, type = 'general') {
    this.gameState.warnings.push({ message, type, timestamp: Date.now() });
    this.emit('warning:added', { message, type });
  }

  /**
   * Clear all warnings
   */
  clearWarnings() {
    this.gameState.warnings = [];
    this.emit('warnings:cleared');
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      this.emit('engine:cleanup:starting');
      
      // Cleanup subsystems
      if (this.saveSystem && typeof this.saveSystem.cleanup === 'function') {
        await this.saveSystem.cleanup();
      }
      
      // Reset state
      this.gameState = {
        phase: 'menu',
        character: null,
        career: null,
        currentTurn: 0,
        upcomingRace: null,
        warnings: []
      };
      
      this.initialized = false;
      
      this.emit('engine:cleanup:completed');
      
      return { success: true };
    } catch (error) {
      this.emit('engine:cleanup:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

module.exports = GameEngine;