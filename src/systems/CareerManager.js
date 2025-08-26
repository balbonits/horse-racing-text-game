/**
 * Career Manager System
 * Creates and manages complete career configurations with flexible race/training patterns
 */

const RaceBuilder = require('./RaceBuilder');
const Timeline = require('../modules/Timeline');

class CareerManager {
  constructor() {
    this.raceBuilder = new RaceBuilder();
  }

  /**
   * Create a complete career configuration
   * @param {object} playerHorse - Player horse configuration
   * @param {array} nonPlayerHorses - Array of NPH configurations  
   * @param {number|array} races - Either number of races (1-9) or array of race configurations
   * @param {number|array} training - Either single number or array matching races for training turns between races
   * @returns {object} Complete career configuration
   */
  createCareer(playerHorse, nonPlayerHorses, races, training) {
    // Validate inputs
    this.validateCareerInputs(playerHorse, nonPlayerHorses, races, training);

    // Process races parameter
    const raceConfigurations = this.processRacesParameter(races);
    
    // Process training parameter  
    const trainingPattern = this.processTrainingParameter(training, raceConfigurations.length);
    
    // Calculate race turns based on training pattern
    const raceTurns = this.calculateRaceTurns(trainingPattern);
    
    // Generate actual races with turn assignments
    const raceSchedule = this.generateRaceSchedule(raceConfigurations, raceTurns);
    
    // Calculate total career turns
    const totalTurns = this.calculateTotalTurns(trainingPattern);
    
    // Create timeline with the race schedule
    const timeline = new Timeline();
    timeline.setCustomSchedule(raceSchedule);

    return {
      playerHorse: playerHorse,
      nonPlayerHorses: nonPlayerHorses,
      raceSchedule: raceSchedule,
      trainingPattern: trainingPattern,
      raceTurns: raceTurns,
      totalTurns: totalTurns,
      timeline: timeline,
      metadata: {
        created: new Date().toISOString(),
        raceCount: raceSchedule.length,
        trainingTurns: trainingPattern.reduce((sum, turns) => sum + turns, 0),
        estimatedDuration: this.estimateCareerDuration(totalTurns)
      }
    };
  }

  /**
   * Validate career creation inputs
   */
  validateCareerInputs(playerHorse, nonPlayerHorses, races, training) {
    if (!playerHorse) {
      throw new Error('Player horse is required');
    }
    
    if (!Array.isArray(nonPlayerHorses)) {
      throw new Error('Non-player horses must be an array');
    }
    
    if (typeof races === 'number') {
      if (races < 1 || races > 9) {
        throw new Error('Race count must be between 1-9');
      }
    } else if (Array.isArray(races)) {
      if (races.length < 1 || races.length > 9) {
        throw new Error('Race array must have 1-9 races');
      }
    } else {
      throw new Error('Races must be a number (1-9) or array of race configurations');
    }
    
    if (typeof training === 'number') {
      if (training < 1 || training > 20) {
        throw new Error('Training turns must be between 1-20');
      }
    } else if (Array.isArray(training)) {
      if (training.some(t => t < 1 || t > 20)) {
        throw new Error('All training values must be between 1-20');
      }
    } else {
      throw new Error('Training must be a number or array of numbers');
    }
  }

  /**
   * Process races parameter into race configurations
   */
  processRacesParameter(races) {
    if (typeof races === 'number') {
      // Generate races using RaceBuilder
      const raceConfigs = [];
      for (let i = 0; i < races; i++) {
        raceConfigs.push(this.raceBuilder.generateRandomRace());
      }
      return raceConfigs;
    } else {
      // Use provided race configurations
      return races.map(race => {
        if (typeof race === 'object' && race.name) {
          return race;
        } else {
          // Convert simple race spec to full configuration
          return this.raceBuilder.generateRace(race || {});
        }
      });
    }
  }

  /**
   * Process training parameter into training pattern array
   */
  processTrainingParameter(training, raceCount) {
    if (typeof training === 'number') {
      // Same number of training turns between all races
      return new Array(raceCount).fill(training);
    } else {
      // Custom training pattern
      if (training.length !== raceCount) {
        throw new Error(`Training array length (${training.length}) must match race count (${raceCount})`);
      }
      return [...training];
    }
  }

  /**
   * Calculate race turns based on training pattern
   */
  calculateRaceTurns(trainingPattern) {
    const raceTurns = [];
    let currentTurn = 1;
    
    for (const trainingTurns of trainingPattern) {
      currentTurn += trainingTurns; // Add training turns
      raceTurns.push(currentTurn); // Race happens on this turn
      currentTurn++; // Race consumes a turn
    }
    
    return raceTurns;
  }

  /**
   * Generate race schedule with turn assignments
   */
  generateRaceSchedule(raceConfigurations, raceTurns) {
    return raceConfigurations.map((race, index) => ({
      ...race,
      turn: raceTurns[index],
      raceNumber: index + 1
    }));
  }

  /**
   * Calculate total career turns
   */
  calculateTotalTurns(trainingPattern) {
    // Sum all training turns + 1 turn per race
    return trainingPattern.reduce((sum, turns) => sum + turns, 0) + trainingPattern.length;
  }

  /**
   * Estimate career duration in minutes
   */
  estimateCareerDuration(totalTurns) {
    // Rough estimate: 30 seconds per training turn, 2 minutes per race
    const trainingTime = (totalTurns - this.raceCount) * 0.5;
    const raceTime = this.raceCount * 2;
    return Math.round(trainingTime + raceTime);
  }

  /**
   * Create career with user's specific 3,4,5,8 pattern
   */
  createUserPatternCareer(playerHorse, nonPlayerHorses) {
    return this.createCareer(
      playerHorse,
      nonPlayerHorses,
      4, // 4 races
      [3, 4, 5, 8] // 3→race→4→race→5→race→8→race pattern
    );
  }

  /**
   * Create simple career for testing
   */
  createTestCareer(playerHorse, nonPlayerHorses, raceCount = 3, trainingTurns = 3) {
    return this.createCareer(playerHorse, nonPlayerHorses, raceCount, trainingTurns);
  }

  /**
   * Create career from template patterns
   */
  createFromTemplate(template, playerHorse, nonPlayerHorses) {
    const templates = {
      sprint: {
        races: [
          { type: 'SPRINT', surface: 'DIRT' },
          { type: 'SPRINT', surface: 'DIRT' },
          { type: 'SPRINT', surface: 'TURF' }
        ],
        training: [2, 3, 4]
      },
      endurance: {
        races: [
          { type: 'MILE', surface: 'DIRT' },
          { type: 'MEDIUM', surface: 'DIRT' },
          { type: 'LONG', surface: 'TURF' },
          { type: 'LONG', surface: 'TURF' }
        ],
        training: [4, 5, 6, 8]
      },
      classic: {
        races: 4,
        training: [3, 4, 5, 8] // User's preferred pattern
      }
    };

    const config = templates[template];
    if (!config) {
      throw new Error(`Unknown template: ${template}`);
    }

    return this.createCareer(playerHorse, nonPlayerHorses, config.races, config.training);
  }
}

module.exports = CareerManager;