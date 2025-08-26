/**
 * TurnController Module
 * Turn progression and race triggering orchestration
 */

class TurnController {
  constructor(character, timeline, trainingEngine, raceEngine = null) {
    this.character = character;
    this.timeline = timeline;
    this.trainingEngine = trainingEngine;
    this.raceEngine = raceEngine; // Optional for now, can be added later
  }

  /**
   * Process a complete turn (training + turn advancement + race check)
   * @param {string} trainingType - Type of training to perform
   * @returns {object} Turn result including any race triggers
   */
  processTurn(trainingType) {
    try {
      // Validate training first
      const validation = this.trainingEngine.validateTraining(this.character, trainingType);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Apply training to character
      const gains = this.trainingEngine.applyTraining(this.character, trainingType);

      // Advance turn
      this.character.career.turn++;
      const newTurn = this.character.career.turn;

      // Check if race is triggered on this new turn
      const raceName = this.timeline.getRaceForTurn(newTurn);
      const raceTriggered = raceName !== null;

      // Build result object
      const result = {
        success: true,
        gains: gains,
        newTurn: newTurn,
        previousTurn: newTurn - 1,
        raceTriggered: raceTriggered,
        trainingType: trainingType
      };

      // Add race information if race is triggered
      if (raceTriggered) {
        result.race = raceName;
        result.raceDetails = this.timeline.getRaceDetails(newTurn);
        result.message = `Training complete! ${raceName} starts now!`;
        result.raceContext = {
          raceNumber: this.getRaceNumber(newTurn),
          totalRaces: this.timeline.getTotalRaces(),
          isFirstRace: this.getRaceNumber(newTurn) === 1,
          isFinalRace: this.getRaceNumber(newTurn) === this.timeline.getTotalRaces()
        };
      } else {
        result.message = `Training complete! Turn ${newTurn} begins.`;
      }

      return result;

    } catch (error) {
      // Don't advance turn if training fails
      throw error;
    }
  }

  /**
   * Get the sequential number of the race (1st, 2nd, 3rd, 4th)
   * @param {number} turn - Turn number of the race
   * @returns {number} Race sequence number
   */
  getRaceNumber(turn) {
    const raceSchedule = this.timeline.getRaceScheduleSummary();
    const raceIndex = raceSchedule.findIndex(race => race.turn === turn);
    return raceIndex >= 0 ? raceIndex + 1 : 0;
  }

  /**
   * Get upcoming race information for UI display
   * @returns {object|null} Next race info or null if no more races
   */
  getUpcomingRaceInfo() {
    return this.timeline.getNextRaceInfo(this.character.career.turn);
  }

  /**
   * Check if current turn has a scheduled race
   * @returns {object|null} Race details or null
   */
  getCurrentRace() {
    const raceName = this.timeline.getRaceForTurn(this.character.career.turn);
    return raceName ? this.timeline.getRaceDetails(this.character.career.turn) : null;
  }

  /**
   * Simulate multiple turns (for testing)
   * @param {array} trainingSequence - Array of training types
   * @returns {array} Array of turn results
   */
  simulateMultipleTurns(trainingSequence) {
    const results = [];
    
    for (const trainingType of trainingSequence) {
      try {
        const result = this.processTurn(trainingType);
        results.push(result);
        
        // Stop if career is complete (beyond turn 12)
        if (this.character.career.turn > 12) {
          break;
        }
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          turn: this.character.career.turn
        });
        break;
      }
    }

    return results;
  }

  /**
   * Get training recommendations based on character state and upcoming races
   * @returns {array} Array of recommendations
   */
  getTrainingRecommendations() {
    const recommendations = this.trainingEngine.getTrainingRecommendations(this.character);
    
    // Add race-specific recommendations
    const upcomingRace = this.getUpcomingRaceInfo();
    if (upcomingRace && upcomingRace.turnsUntil <= 2) {
      if (upcomingRace.type === 'SPRINT') {
        recommendations.push('Sprint race approaching - focus on Speed and Power training');
      } else if (upcomingRace.type === 'LONG') {
        recommendations.push('Long race approaching - prioritize Stamina training');
      } else if (upcomingRace.type === 'MILE') {
        recommendations.push('Mile race approaching - balance all stats');
      }
      
      if (upcomingRace.turnsUntil === 1) {
        recommendations.push('⚠️ Race is NEXT - consider rest to ensure good energy');
      }
    }

    return recommendations;
  }

  /**
   * Get career progress summary
   * @returns {object} Career progress information
   */
  getCareerProgress() {
    const completedRaces = this.timeline.getRaceScheduleSummary()
      .filter(race => race.turn < this.character.career.turn);
    
    const upcomingRaces = this.timeline.getRaceScheduleSummary()
      .filter(race => race.turn >= this.character.career.turn);

    return {
      currentTurn: this.character.career.turn,
      totalTurns: 12,
      racesCompleted: completedRaces.length,
      totalRaces: this.timeline.getTotalRaces(),
      racesRemaining: upcomingRaces.length,
      nextRace: upcomingRaces[0] || null,
      isCareerComplete: this.character.career.turn > 12
    };
  }

  /**
   * Validate turn controller state
   * @returns {object} Validation result
   */
  validateState() {
    const issues = [];

    // Check character
    if (!this.character) {
      issues.push('No character assigned');
    }

    // Check timeline
    if (!this.timeline) {
      issues.push('No timeline assigned');
    } else {
      const scheduleValidation = this.timeline.validateSchedule();
      if (!scheduleValidation.valid) {
        issues.push(...scheduleValidation.issues);
      }
    }

    // Check training engine
    if (!this.trainingEngine) {
      issues.push('No training engine assigned');
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Reset character to beginning of career (for testing)
   */
  resetCareer() {
    this.character.career.turn = 1;
    this.character.career.racesRun = 0;
    this.character.career.racesWon = 0;
    this.character.raceHistory = [];
    this.character.stats = { speed: 20, stamina: 20, power: 20 };
    this.character.condition = { energy: 100, mood: 'Normal' };
  }
}

module.exports = TurnController;