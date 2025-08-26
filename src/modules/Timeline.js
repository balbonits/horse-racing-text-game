/**
 * Timeline Module
 * Race scheduling and timing logic - single source of truth
 */

class Timeline {
  constructor() {
    // Fixed race schedule based on user requirements
    // Races happen on turns 4, 7, 10, 12 with proper spacing
    this.raceSchedule = [
      {
        turn: 4,
        name: 'Maiden Sprint',
        type: 'SPRINT',
        surface: 'DIRT',
        distance: 1200,
        description: 'Your debut race - a dirt sprint testing raw speed and power'
      },
      {
        turn: 7, 
        name: 'Mile Championship',
        type: 'MILE',
        surface: 'DIRT',
        distance: 1600,
        description: 'Mid-career balanced test on dirt requiring all-around ability'
      },
      {
        turn: 10,
        name: 'Dirt Stakes', 
        type: 'MEDIUM',
        surface: 'DIRT',
        distance: 2000,
        description: 'Endurance test on dirt - stamina and tactical racing'
      },
      {
        turn: 12,
        name: 'Turf Cup Final',
        type: 'LONG',
        surface: 'TURF', 
        distance: 2400,
        description: 'The ultimate test - long distance championship on turf'
      }
    ];
  }

  /**
   * Get race scheduled for specific turn
   * @param {number} turn - Turn number to check
   * @returns {string|null} Race name or null if no race
   */
  getRaceForTurn(turn) {
    const race = this.raceSchedule.find(r => r.turn === turn);
    return race ? race.name : null;
  }

  /**
   * Get information about the next upcoming race
   * @param {number} currentTurn - Current turn number
   * @returns {object|null} Race info or null if no more races
   */
  getNextRaceInfo(currentTurn) {
    const nextRace = this.raceSchedule.find(r => r.turn > currentTurn);
    
    if (!nextRace) {
      return null;
    }
    
    const turnsUntil = nextRace.turn - currentTurn;
    
    return {
      name: nextRace.name,
      turn: nextRace.turn,
      type: nextRace.type,
      surface: nextRace.surface,
      distance: nextRace.distance,
      description: nextRace.description,
      turnsUntil: turnsUntil,
      isNext: turnsUntil === 1
    };
  }

  /**
   * Check if a specific turn is a race turn
   * @param {number} turn - Turn number to check
   * @returns {boolean} True if race is scheduled for this turn
   */
  isRaceTurn(turn) {
    return this.raceSchedule.some(r => r.turn === turn);
  }

  /**
   * Get total number of races in career
   * @returns {number} Total race count
   */
  getTotalRaces() {
    return this.raceSchedule.length;
  }

  /**
   * Get complete race schedule summary
   * @returns {array} Array of race summary objects
   */
  getRaceScheduleSummary() {
    return this.raceSchedule.map(race => ({
      turn: race.turn,
      name: race.name,
      type: race.type,
      surface: race.surface,
      distance: race.distance,
      description: race.description
    }));
  }

  /**
   * Get race details for a specific turn
   * @param {number} turn - Turn number
   * @returns {object|null} Complete race details or null
   */
  getRaceDetails(turn) {
    return this.raceSchedule.find(r => r.turn === turn) || null;
  }

  /**
   * Check if all races in career are scheduled
   * @returns {boolean} True if schedule is complete
   */
  isScheduleComplete() {
    return this.raceSchedule.length === 4;
  }

  /**
   * Get races remaining after current turn
   * @param {number} currentTurn - Current turn number
   * @returns {array} Array of remaining races
   */
  getRacesRemaining(currentTurn) {
    return this.raceSchedule.filter(r => r.turn > currentTurn);
  }

  /**
   * Validate the race schedule
   * @returns {object} Validation result
   */
  validateSchedule() {
    const issues = [];
    
    // Check for correct number of races
    if (this.raceSchedule.length !== 4) {
      issues.push(`Expected 4 races, found ${this.raceSchedule.length}`);
    }
    
    // Check for duplicate turns
    const turns = this.raceSchedule.map(r => r.turn);
    const uniqueTurns = [...new Set(turns)];
    if (turns.length !== uniqueTurns.length) {
      issues.push('Duplicate race turns found');
    }
    
    // Check turn order
    const sortedTurns = [...turns].sort((a, b) => a - b);
    if (JSON.stringify(turns) !== JSON.stringify(sortedTurns)) {
      issues.push('Races not in chronological order');
    }
    
    // Check required race types
    const types = this.raceSchedule.map(r => r.type);
    const expectedTypes = ['SPRINT', 'MILE', 'MEDIUM', 'LONG'];
    const missingTypes = expectedTypes.filter(type => !types.includes(type));
    if (missingTypes.length > 0) {
      issues.push(`Missing race types: ${missingTypes.join(', ')}`);
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
}

module.exports = Timeline;