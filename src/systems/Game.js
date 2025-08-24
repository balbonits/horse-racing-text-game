const Character = require('../models/Character');
const TrainingSystem = require('../models/Training');
const RaceSimulator = require('../models/Race');

class Game {
  constructor() {
    this.character = null;
    this.trainingSystem = new TrainingSystem();
    this.raceSimulator = new RaceSimulator();
    this.gameState = 'menu'; // menu, character_creation, training, racing, results, game_over
    this.currentRace = null;
    this.raceSchedule = [];
    this.gameHistory = {
      sessions: 0,
      totalWins: 0,
      bestTime: null,
      favoriteTraining: null
    };
  }

  // Initialize a new game session
  startNewGame(characterName, options = {}) {
    this.character = new Character(characterName, options);
    this.gameState = 'training';
    this.raceSchedule = this.raceSimulator.getCareerRaceSchedule();
    this.gameHistory.sessions++;
    
    return {
      success: true,
      message: `Welcome ${characterName}! Your racing career begins now!`,
      character: this.character.getSummary()
    };
  }

  // Get current game status
  getGameStatus() {
    if (!this.character) {
      return {
        state: 'no_character',
        message: 'No active character. Please create a new character.'
      };
    }

    const summary = this.character.getSummary();
    const nextRace = this.getNextRace();
    const trainingOptions = this.trainingSystem.getTrainingOptions(this.character);
    
    return {
      state: this.gameState,
      turn: this.character.career.turn,
      maxTurns: this.character.career.maxTurns,
      character: summary,
      nextRace: nextRace,
      trainingOptions: trainingOptions,
      canContinue: this.character.canContinue(),
      progress: this.getProgressSummary()
    };
  }

  // Perform training action
  performTraining(trainingType) {
    if (!this.character || this.gameState !== 'training') {
      return {
        success: false,
        message: 'Cannot train at this time.'
      };
    }

    const result = this.trainingSystem.performTraining(this.character, trainingType);
    
    if (result.success) {
      // Check if it's time for a race
      const raceTime = this.checkForScheduledRace();
      if (raceTime) {
        this.gameState = 'pre_race';
        result.raceReady = true;
        result.nextRace = raceTime;
      }
      
      // Check if career is complete
      if (!this.character.canContinue()) {
        this.gameState = 'career_complete';
        result.careerComplete = true;
      }
    }

    return result;
  }

  // Check if there's a scheduled race this turn
  checkForScheduledRace() {
    return this.raceSchedule.find(race => race.turn === this.character.career.turn);
  }

  // Get next upcoming race
  getNextRace() {
    return this.raceSchedule.find(race => race.turn >= this.character.career.turn);
  }

  // Run a race
  runRace(raceType = null) {
    if (!this.character) {
      return { success: false, message: 'No active character.' };
    }

    // Determine race type
    const scheduledRace = this.checkForScheduledRace();
    const finalRaceType = raceType || (scheduledRace ? scheduledRace.raceType : 'sprint');

    // Create competitors
    const playerAvgStat = (this.character.stats.speed + this.character.stats.stamina + this.character.stats.power) / 3;
    const competitors = this.raceSimulator.createAICompetitors(7, playerAvgStat);
    
    // Add player to participants
    const participants = [
      { character: this.character, isPlayer: true },
      ...competitors
    ];

    // Run the race simulation
    const raceResult = this.raceSimulator.simulateRace(participants, finalRaceType);
    
    // Process race effects on character
    const effects = this.raceSimulator.processRaceResults(this.character, raceResult);
    
    // Update game state
    this.gameState = 'race_results';
    this.currentRace = {
      result: raceResult,
      effects: effects,
      analysis: this.raceSimulator.analyzeRacePerformance(raceResult)
    };

    // Update history
    if (raceResult.playerResult.position === 1) {
      this.gameHistory.totalWins++;
    }

    // Advance turn after race
    this.character.nextTurn();

    return {
      success: true,
      raceResult: raceResult,
      effects: effects,
      analysis: this.currentRace.analysis
    };
  }

  // Advance to next turn
  nextTurn() {
    if (!this.character) return false;
    
    const advanced = this.character.nextTurn();
    
    if (!advanced || !this.character.canContinue()) {
      this.gameState = 'career_complete';
      return false;
    }
    
    this.gameState = 'training';
    return true;
  }

  // Get training recommendations
  getTrainingRecommendations() {
    if (!this.character) return [];
    return this.trainingSystem.getTrainingRecommendations(this.character);
  }

  // Get progress summary for UI display
  getProgressSummary() {
    if (!this.character) return null;

    const stats = this.character.getCurrentStats();
    const totalStats = stats.speed + stats.stamina + stats.power;
    const maxStats = 300; // 3 stats × 100 max each
    const progressPercent = Math.round((totalStats / maxStats) * 100);

    return {
      totalStats: totalStats,
      maxStats: maxStats,
      progressPercent: progressPercent,
      turn: this.character.career.turn,
      maxTurns: this.character.career.maxTurns,
      racesWon: this.character.career.racesWon,
      racesRun: this.character.career.racesRun,
      winRate: this.character.career.racesRun > 0 ? 
        Math.round((this.character.career.racesWon / this.character.career.racesRun) * 100) : 0
    };
  }

  // Generate stat bars for UI display
  generateStatBars(stats, maxWidth = 10) {
    const bars = {};
    
    Object.keys(stats).forEach(stat => {
      const value = stats[stat];
      const filledBars = Math.round((value / 100) * maxWidth);
      const emptyBars = maxWidth - filledBars;
      
      bars[stat] = {
        value: value,
        bar: '█'.repeat(filledBars) + '░'.repeat(emptyBars),
        percentage: Math.round(value)
      };
    });

    return bars;
  }

  // Get race history and statistics
  getRaceHistory() {
    return {
      career: {
        turn: this.character?.career.turn || 0,
        racesWon: this.character?.career.racesWon || 0,
        racesRun: this.character?.career.racesRun || 0,
        totalTraining: this.character?.career.totalTraining || 0
      },
      allTime: { ...this.gameHistory }
    };
  }

  // Complete current career and generate legacy bonuses
  completeCareer() {
    if (!this.character) return null;

    const stats = this.character.getCurrentStats();
    const performance = this.getProgressSummary();
    
    // Calculate legacy bonuses based on final stats and performance
    const legacyBonuses = {
      speedBonus: Math.floor(stats.speed * 0.1), // 10% of final stat
      staminaBonus: Math.floor(stats.stamina * 0.1),
      powerBonus: Math.floor(stats.power * 0.1),
      energyBonus: Math.min(10, this.character.career.racesWon * 2) // 2 points per win, max 10
    };

    const careerSummary = {
      characterName: this.character.name,
      finalStats: stats,
      performance: performance,
      legacyBonuses: legacyBonuses,
      achievements: this.generateAchievements()
    };

    // Reset for next career
    this.character = null;
    this.gameState = 'career_summary';
    this.currentRace = null;

    return careerSummary;
  }

  // Generate achievements based on career performance
  generateAchievements() {
    const achievements = [];
    
    if (!this.character) return achievements;

    const stats = this.character.getCurrentStats();
    const career = this.character.career;

    // Stat-based achievements
    if (Math.max(stats.speed, stats.stamina, stats.power) >= 90) {
      achievements.push({ name: 'Elite Athlete', description: 'Reached 90+ in a stat' });
    }

    if (stats.speed >= 80 && stats.stamina >= 80 && stats.power >= 80) {
      achievements.push({ name: 'Triple Threat', description: 'All stats above 80' });
    }

    // Race achievements
    if (career.racesWon === career.racesRun && career.racesRun > 0) {
      achievements.push({ name: 'Undefeated', description: 'Won every race' });
    }

    if (career.racesWon >= 3) {
      achievements.push({ name: 'Champion', description: 'Won 3+ races' });
    }

    // Training achievements
    if (career.totalTraining >= 15) {
      achievements.push({ name: 'Dedicated Trainer', description: '15+ training sessions' });
    }

    if (this.character.friendship >= 90) {
      achievements.push({ name: 'Best Friends', description: 'Maximum friendship achieved' });
    }

    return achievements;
  }

  // Save game state (simplified JSON save)
  saveGame() {
    if (!this.character) return { success: false, message: 'No character to save' };

    const saveData = {
      character: this.character.toJSON(),
      gameState: this.gameState,
      raceSchedule: this.raceSchedule,
      gameHistory: this.gameHistory,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      saveData: saveData,
      message: 'Game saved successfully!'
    };
  }

  // Load game state
  loadGame(saveData) {
    try {
      this.character = Character.fromJSON(saveData.character);
      this.gameState = saveData.gameState || 'training';
      this.raceSchedule = saveData.raceSchedule || this.raceSimulator.getCareerRaceSchedule();
      this.gameHistory = { ...this.gameHistory, ...saveData.gameHistory };

      return {
        success: true,
        message: `${this.character.name} loaded successfully!`,
        character: this.character.getSummary()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to load game: ' + error.message
      };
    }
  }

  // Get help text for game mechanics
  getHelp() {
    return {
      controls: {
        '1-5': 'Select training options',
        'r': 'View race schedule', 
        's': 'Save game',
        'l': 'Load game',
        'h': 'Show this help',
        'q': 'Quit game'
      },
      gameFlow: [
        '1. Train your horse by selecting training types (1-5)',
        '2. Manage energy - rest when needed',
        '3. Build friendship through social time',
        '4. Race at scheduled turns to test your progress',
        '5. Complete 12 turns to finish career and earn legacy bonuses'
      ],
      tips: [
        'Higher stats improve race performance',
        'Energy affects training gains and race performance', 
        'Good mood boosts training effectiveness',
        'High friendship (80+) gives 50% bonus to training',
        'Balance training - weak stats hurt race performance',
        'Rest when energy is low (below 30)'
      ]
    };
  }
}

module.exports = Game;