/**
 * Career Builder System
 * Establishes complete careers with horses, race schedules, and training turns
 */

const RaceBuilder = require('./RaceBuilder');
const NPHRoster = require('../models/NPHRoster');

class CareerBuilder {
  constructor() {
    this.raceBuilder = new RaceBuilder();
    
    // Career templates with different focuses and difficulties
    this.careerTemplates = {
      classic: {
        name: 'Classic Career',
        description: 'Traditional horse racing career progression',
        totalTurns: 12,
        raceTurns: [4, 7, 10, 12],
        raceTheme: 'classic',
        nphCount: 15,
        difficulty: 'normal'
      },
      sprint: {
        name: 'Speed Specialist',
        description: 'Career focused on sprint racing and speed development',
        totalTurns: 12,
        raceTurns: [3, 6, 9, 12],
        raceTheme: 'sprint',
        nphCount: 12,
        difficulty: 'normal'
      },
      endurance: {
        name: 'Stayer Career',
        description: 'Long distance specialist path emphasizing stamina',
        totalTurns: 14,
        raceTurns: [5, 8, 11, 14],
        raceTheme: 'endurance',
        nphCount: 18,
        difficulty: 'hard'
      },
      challenge: {
        name: 'Challenge Mode',
        description: 'Expert level career with unpredictable races',
        totalTurns: 15,
        raceTurns: [3, 6, 9, 12, 15],
        raceTheme: 'mixed',
        nphCount: 20,
        difficulty: 'expert'
      },
      quick: {
        name: 'Quick Career',
        description: 'Shortened career for faster gameplay sessions',
        totalTurns: 8,
        raceTurns: [3, 5, 7, 8],
        raceTheme: 'classic',
        nphCount: 10,
        difficulty: 'easy'
      }
    };
  }

  /**
   * Create a complete career setup
   * @param {object} options - Career creation options
   * @returns {object} Complete career configuration
   */
  createCareer(options = {}) {
    const {
      template = 'classic',
      playerHorseName = null,
      customRaceTurns = null,
      customTotalTurns = null,
      nphRosterSize = null,
      difficulty = null,
      raceTheme = null,
      seed = null // For reproducible careers
    } = options;

    // Get base template
    const baseTemplate = this.careerTemplates[template] || this.careerTemplates.classic;
    
    // Apply overrides
    const careerConfig = {
      ...baseTemplate,
      totalTurns: customTotalTurns || baseTemplate.totalTurns,
      raceTurns: customRaceTurns || baseTemplate.raceTurns,
      nphCount: nphRosterSize || baseTemplate.nphCount,
      difficulty: difficulty || baseTemplate.difficulty,
      raceTheme: raceTheme || baseTemplate.raceTheme,
      seed: seed
    };

    // Generate race schedule
    const raceSchedule = this.generateRaceSchedule(careerConfig);

    // Generate NPH roster
    const nphRoster = this.generateNPHRoster(careerConfig);

    // Calculate training turns (all turns that aren't race turns)
    const trainingTurns = [];
    for (let turn = 1; turn <= careerConfig.totalTurns; turn++) {
      if (!careerConfig.raceTurns.includes(turn)) {
        trainingTurns.push(turn);
      }
    }

    return {
      template: template,
      config: careerConfig,
      raceSchedule: raceSchedule,
      nphRoster: nphRoster,
      trainingTurns: trainingTurns,
      totalTrainingTurns: trainingTurns.length,
      totalRaces: raceSchedule.length,
      playerHorse: {
        name: playerHorseName,
        created: false // Will be set when character is created
      },
      metadata: {
        created: new Date().toISOString(),
        seed: seed,
        estimatedDuration: this.estimateCareerDuration(careerConfig)
      }
    };
  }

  /**
   * Generate race schedule for career
   */
  generateRaceSchedule(config) {
    if (config.seed) {
      // TODO: Implement seeded random generation for reproducible careers
    }

    return this.raceBuilder.generateCareerSchedule({
      difficulty: config.difficulty,
      theme: config.raceTheme,
      turns: config.raceTurns
    });
  }

  /**
   * Generate NPH roster for career
   */
  generateNPHRoster(config) {
    const roster = new NPHRoster();
    
    // Generate base roster
    roster.generateRoster(config.nphCount);
    
    // Adjust roster based on difficulty
    if (config.difficulty === 'easy') {
      // Slightly reduce NPH stats
      roster.nphs.forEach(nph => {
        nph.stats.speed = Math.max(15, nph.stats.speed - 5);
        nph.stats.stamina = Math.max(15, nph.stats.stamina - 5);
        nph.stats.power = Math.max(15, nph.stats.power - 5);
      });
    } else if (config.difficulty === 'hard') {
      // Boost NPH stats
      roster.nphs.forEach(nph => {
        nph.stats.speed = Math.min(95, nph.stats.speed + 5);
        nph.stats.stamina = Math.min(95, nph.stats.stamina + 5);
        nph.stats.power = Math.min(95, nph.stats.power + 5);
      });
    } else if (config.difficulty === 'expert') {
      // Significantly boost NPH stats and add more variety
      roster.nphs.forEach(nph => {
        nph.stats.speed = Math.min(98, nph.stats.speed + 10);
        nph.stats.stamina = Math.min(98, nph.stats.stamina + 10);
        nph.stats.power = Math.min(98, nph.stats.power + 10);
      });
    }

    return roster;
  }

  /**
   * Estimate career duration in minutes
   */
  estimateCareerDuration(config) {
    const trainingTurns = config.totalTurns - config.raceTurns.length;
    const estimatedMinutes = (trainingTurns * 0.5) + (config.raceTurns.length * 1.5);
    return Math.round(estimatedMinutes);
  }

  /**
   * Get all available career templates
   */
  getAvailableTemplates() {
    return Object.entries(this.careerTemplates).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description,
      duration: this.estimateCareerDuration(template),
      races: template.raceTurns.length,
      totalTurns: template.totalTurns,
      difficulty: template.difficulty
    }));
  }

  /**
   * Create a quick test career for development
   */
  createTestCareer() {
    return this.createCareer({
      template: 'quick',
      playerHorseName: 'TestHorse',
      difficulty: 'easy'
    });
  }

  /**
   * Create a custom career with specific parameters
   */
  createCustomCareer(params) {
    const {
      totalTurns = 12,
      raceCount = 4,
      difficulty = 'normal',
      theme = 'classic',
      playerName = null
    } = params;

    // Distribute races evenly across career
    const raceTurns = [];
    const spacing = Math.floor(totalTurns / raceCount);
    for (let i = 0; i < raceCount; i++) {
      raceTurns.push(Math.min(totalTurns, spacing * (i + 1)));
    }

    return this.createCareer({
      template: 'custom',
      customTotalTurns: totalTurns,
      customRaceTurns: raceTurns,
      difficulty: difficulty,
      raceTheme: theme,
      playerHorseName: playerName
    });
  }

  /**
   * Validate career configuration
   */
  validateCareerConfig(career) {
    const issues = [];

    // Check race turns are within total turns
    if (career.config.raceTurns.some(turn => turn > career.config.totalTurns)) {
      issues.push('Race turns exceed total career turns');
    }

    // Check race turns are in ascending order
    const sortedTurns = [...career.config.raceTurns].sort((a, b) => a - b);
    if (JSON.stringify(sortedTurns) !== JSON.stringify(career.config.raceTurns)) {
      issues.push('Race turns should be in ascending order');
    }

    // Check minimum training turns
    if (career.trainingTurns.length < 2) {
      issues.push('Career needs at least 2 training turns');
    }

    // Check NPH roster size
    if (career.nphRoster.nphs.length < 3) {
      issues.push('NPH roster too small for competitive races');
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Generate career summary for display
   */
  generateCareerSummary(career) {
    const validation = this.validateCareerConfig(career);
    
    return {
      name: career.config.name,
      description: career.config.description,
      totalTurns: career.config.totalTurns,
      trainingTurns: career.totalTrainingTurns,
      races: career.totalRaces,
      raceTurns: career.config.raceTurns,
      difficulty: career.config.difficulty,
      estimatedDuration: career.metadata.estimatedDuration,
      nphCount: career.config.nphCount,
      valid: validation.valid,
      issues: validation.issues
    };
  }
}

module.exports = CareerBuilder;