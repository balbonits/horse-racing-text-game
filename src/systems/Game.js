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
    this.currentRaceIndex = 0;
    this.raceResults = [];
    this.gameHistory = {
      sessions: 0,
      totalWins: 0,
      bestTime: null,
      favoriteTraining: null
    };
  }

  // Getters for test compatibility
  get turnCount() {
    return this.character ? this.character.career.turn : 1;
  }

  set turnCount(value) {
    if (this.character) {
      this.character.career.turn = value;
    }
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
    
    // Calculate grade based on performance
    let grade = 'D';
    const winRate = performance.winRate || 0;
    const avgStats = (stats.speed + stats.stamina + stats.power) / 3;
    
    if (winRate >= 80 && avgStats >= 80) grade = 'S';
    else if (winRate >= 60 && avgStats >= 70) grade = 'A';
    else if (winRate >= 40 && avgStats >= 60) grade = 'B';
    else if (winRate >= 20 && avgStats >= 50) grade = 'C';

    // Calculate legacy bonuses based on final stats and performance
    const legacyBonuses = {
      speed: Math.floor(stats.speed * 0.1), // 10% of final stat
      stamina: Math.floor(stats.stamina * 0.1),
      power: Math.floor(stats.power * 0.1),
      energy: Math.min(10, this.character.career.racesWon * 2) // 2 points per win, max 10
    };

    const careerSummary = {
      characterName: this.character.name,
      finalStats: stats,
      performance: performance,
      grade: grade,
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

  // Training system implementation
  executeTraining(trainingType) {
    if (!this.character) {
      return { success: false, message: 'No character available' };
    }

    const { energy, stats } = require('../utils/gameUtils');
    
    // Handle different training types
    switch (trainingType) {
      case 'speed':
        return this.performStatTraining('speed', 15);
      case 'stamina':
        return this.performStatTraining('stamina', 10);  
      case 'power':
        return this.performStatTraining('power', 15);
      case 'rest':
        return this.performRest();
      case 'social':
        return this.performSocial();
      default:
        return { success: false, message: 'Unknown training type' };
    }
  }

  performStatTraining(statType, energyCost) {
    // Deduct energy
    this.character.energy -= energyCost;
    
    // Calculate stat gain (base 3-7, with modifiers)
    const baseGain = 3 + Math.floor(Math.random() * 5);
    const { stats } = require('../utils/gameUtils');
    const finalGain = stats.calculateTrainingGain(
      baseGain, 
      this.character.mood, 
      this.character.friendship
    );
    
    // Apply stat gain
    this.character.stats[statType] = stats.clampStat(
      this.character.stats[statType] + finalGain
    );
    
    // Advance turn
    this.turnCount += 1;
    
    const result = {
      success: true,
      statGain: finalGain,
      energyChange: -energyCost,
      turnComplete: true
    };
    
    // Check if it's time for a race after advancing turn
    const raceTime = this.checkForScheduledRace();
    if (raceTime) {
      result.raceReady = true;
      result.nextRace = raceTime;
    }
    
    // Check if career is complete after this turn
    if (!this.character.canContinue()) {
      result.careerComplete = true;
    }
    
    return result;
  }

  performRest() {
    const { energy: energyUtil } = require('../utils/gameUtils');
    const newEnergy = energyUtil.calculateRestEnergy(this.character.energy);
    const energyGain = newEnergy - this.character.energy;
    this.character.energy = newEnergy;
    
    // 30% chance to improve mood
    if (Math.random() < 0.3) {
      const moods = ['Bad', 'Normal', 'Good', 'Great'];
      const currentIndex = moods.indexOf(this.character.mood);
      if (currentIndex < moods.length - 1) {
        this.character.mood = moods[currentIndex + 1];
      }
    }
    
    // Advance turn
    this.turnCount += 1;
    
    const result = {
      success: true,
      energyChange: energyGain,
      turnComplete: true
    };
    
    // Check if it's time for a race after advancing turn
    const raceTime = this.checkForScheduledRace();
    if (raceTime) {
      result.raceReady = true;
      result.nextRace = raceTime;
    }
    
    // Check if career is complete after this turn
    if (!this.character.canContinue()) {
      result.careerComplete = true;
    }
    
    return result;
  }

  performSocial() {
    this.character.energy -= 5;
    
    // Increase friendship
    const friendshipGain = 10 + Math.floor(Math.random() * 6); // 10-15
    this.character.friendship = Math.min(100, this.character.friendship + friendshipGain);
    
    // 50% chance to improve mood
    if (Math.random() < 0.5) {
      const moods = ['Bad', 'Normal', 'Good', 'Great'];
      const currentIndex = moods.indexOf(this.character.mood);
      if (currentIndex < moods.length - 1) {
        this.character.mood = moods[currentIndex + 1];
      }
    }
    
    // Advance turn
    this.turnCount += 1;
    
    const result = {
      success: true,
      friendshipGain,
      energyChange: -5,
      turnComplete: true
    };
    
    // Check if it's time for a race after advancing turn
    const raceTime = this.checkForScheduledRace();
    if (raceTime) {
      result.raceReady = true;
      result.nextRace = raceTime;
    }
    
    // Check if career is complete after this turn
    if (!this.character.canContinue()) {
      result.careerComplete = true;
    }
    
    return result;
  }

  // TDD Race Implementation - Replaces old runRace for test compatibility
  runRace(raceData) {
    if (!this.character) {
      return { success: false, message: 'No character available' };
    }

    const { race, ui } = require('../utils/gameUtils');
    
    // Generate AI competitors (7 horses with stats 40-80)
    const aiCompetitors = [];
    for (let i = 0; i < 7; i++) {
      aiCompetitors.push({
        name: `Horse ${i + 1}`,
        stats: {
          speed: 40 + Math.random() * 40,
          stamina: 40 + Math.random() * 40,  
          power: 40 + Math.random() * 40
        }
      });
    }
    
    // Calculate performance for all participants
    const participants = [
      { name: this.character.name, stats: this.character.stats, isPlayer: true },
      ...aiCompetitors
    ];
    
    const distanceType = race.getDistanceType(raceData.distance || 1600);
    
    // Calculate performance scores
    participants.forEach(p => {
      p.performance = race.calculatePerformance(p.stats, distanceType, 1.0);
    });
    
    // Sort by performance (highest first)
    participants.sort((a, b) => b.performance - a.performance);
    
    // Assign positions
    participants.forEach((p, index) => {
      p.position = index + 1;
    });
    
    // Find player result
    const playerResult = participants.find(p => p.isPlayer);
    
    // Generate race time based on distance and performance
    const baseTime = raceData.distance ? (raceData.distance / 15) : 106; // ~15 m/s average
    const performanceModifier = (200 - playerResult.performance) / 100;
    const totalSeconds = baseTime + performanceModifier;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    
    const result = {
      position: playerResult.position,
      time: `${minutes}:${seconds.padStart(5, '0')}`,
      performance: playerResult.performance,
      commentary: ui.formatRaceCommentary(playerResult.position),
      raceData: raceData,
      participants: participants
    };
    
    // Store result
    this.raceResults.push(result);
    
    return result;
  }

  // Auto-run first race when entering race phase
  enterRacePhase() {
    if (this.raceResults.length === 0 && this.getScheduledRaces().length > 0) {
      const firstRace = this.getScheduledRaces()[0];
      this.runRace(firstRace);
      this.currentRaceIndex = 1;
    }
  }

  // P0 Critical Path Methods - Required by tests
  getScheduledRaces() {
    if (!this.raceSchedule || this.raceSchedule.length === 0) {
      return [
        { name: 'Debut Race', distance: 1400, surface: 'Dirt' },
        { name: 'Championship', distance: 1600, surface: 'Turf' },
        { name: 'Final Stakes', distance: 2000, surface: 'Turf' }
      ];
    }
    return this.raceSchedule;
  }

  getRaceResults() {
    return this.raceResults || [];
  }

  getCareerSummary() {
    // Always generate summary from current state for now
    if (true) {
      // Generate summary from current state
      const racesWon = this.raceResults ? this.raceResults.filter(r => r.position === 1).length : 0;
      const racesRun = this.raceResults ? this.raceResults.length : 0;
      const winRate = racesRun > 0 ? Math.round((racesWon / racesRun) * 100) : 0;
      
      const totalStats = this.character ? 
        this.character.stats.speed + this.character.stats.stamina + this.character.stats.power : 60;
      
      let grade = 'D';
      if (racesWon === 3) grade = 'S';
      else if (racesWon === 2) grade = 'A';
      else if (racesWon === 1) grade = 'B';
      else if (totalStats >= 180) grade = 'C';

      let legacyBonuses = { speed: 0, stamina: 0, power: 0 };
      if (grade === 'S') legacyBonuses = { speed: 5, stamina: 5, power: 5 };
      else if (grade === 'A') legacyBonuses = { speed: 3, stamina: 0, power: 0 };
      else if (grade === 'B') legacyBonuses = { speed: 2, stamina: 0, power: 0 };
      else if (grade === 'C') legacyBonuses = { speed: 1, stamina: 0, power: 0 };

      const summary = {
        finalStats: this.character ? this.character.stats : { speed: 20, stamina: 20, power: 20 },
        performance: {
          racesWon,
          racesRun,
          winRate,
          totalStats,
          progressPercent: Math.round((totalStats / 300) * 100)
        },
        grade,
        legacyBonuses
      };
      
      return summary;
    }
    return this.careerResults;
  }
}

module.exports = Game;