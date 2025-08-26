/**
 * Race Builder System
 * Flexible race generation with parameterized creation
 */

const { RACE_TYPES, SURFACE_TYPES, WEATHER_CONDITIONS } = require('../data/raceTypes');

class RaceBuilder {
  constructor() {
    // Default race parameters
    this.defaults = {
      name: null, // Generated if not provided
      type: 'MILE', // SPRINT, MILE, MEDIUM, LONG
      surface: 'DIRT', // DIRT, TURF
      weather: 'CLEAR', // CLEAR, WET, FAST
      distance: null, // Auto-calculated based on type if not provided
      turn: null, // Must be specified for career races
      prize: null, // Auto-calculated if not provided
      description: null // Generated if not provided
    };

    // Name generation templates
    this.nameTemplates = {
      SPRINT: [
        'Lightning Stakes', 'Flash Cup', 'Speed Trial', 'Rapid Fire Stakes',
        'Bolt Classic', 'Thunder Run', 'Quick Strike Stakes', 'Dash Championship'
      ],
      MILE: [
        'Heritage Mile', 'Classic Championship', 'Traditional Stakes', 'Mile Challenge',
        'Golden Mile', 'Royal Stakes', 'Premier Championship', 'Elite Mile'
      ],
      MEDIUM: [
        'Endurance Stakes', 'Stamina Test', 'Distance Challenge', 'Persistence Cup',
        'Marathon Prep', 'Staying Stakes', 'Durability Cup', 'Long Haul Stakes'
      ],
      LONG: [
        'Ultimate Stakes', 'Championship Final', 'Grand Stakes', 'Epic Cup',
        'Supreme Test', 'Legendary Stakes', 'Master Challenge', 'Crown Jewel'
      ]
    };

    // Surface name modifiers
    this.surfaceModifiers = {
      DIRT: ['Clay', 'Earth', 'Track', 'Ground'],
      TURF: ['Grass', 'Green', 'Meadow', 'Emerald']
    };

    // Weather descriptors
    this.weatherDescriptors = {
      CLEAR: ['Sunny', 'Perfect', 'Ideal'],
      WET: ['Muddy', 'Sloppy', 'Heavy'],
      FAST: ['Lightning', 'Quick', 'Speed']
    };
  }

  /**
   * Generate a single race with flexible parameters
   * @param {object} params - Race parameters (all optional for random generation)
   * @returns {object} Generated race
   */
  generateRace(params = {}) {
    // Merge with defaults
    const raceParams = { ...this.defaults, ...params };

    // Generate random values for unspecified parameters
    if (!raceParams.type) {
      const types = Object.keys(this.nameTemplates);
      raceParams.type = types[Math.floor(Math.random() * types.length)];
    }

    if (!raceParams.surface) {
      raceParams.surface = Math.random() < 0.7 ? 'DIRT' : 'TURF';
    }

    if (!raceParams.weather) {
      const weathers = Object.keys(this.weatherDescriptors);
      raceParams.weather = weathers[Math.floor(Math.random() * weathers.length)];
    }

    // Generate distance based on type
    if (!raceParams.distance) {
      raceParams.distance = this.getDistanceForType(raceParams.type);
    }

    // Generate name if not provided
    if (!raceParams.name) {
      raceParams.name = this.generateRaceName(raceParams);
    }

    // Generate prize if not provided
    if (!raceParams.prize) {
      raceParams.prize = this.calculatePrize(raceParams);
    }

    // Generate description if not provided
    if (!raceParams.description) {
      raceParams.description = this.generateDescription(raceParams);
    }

    return {
      name: raceParams.name,
      type: raceParams.type,
      surface: raceParams.surface,
      weather: raceParams.weather,
      distance: raceParams.distance,
      turn: raceParams.turn,
      prize: raceParams.prize,
      description: raceParams.description
    };
  }

  /**
   * Get standard distance for race type
   */
  getDistanceForType(type) {
    const distances = {
      SPRINT: 1200,
      MILE: 1600,
      MEDIUM: 2000,
      LONG: 2400
    };
    return distances[type] || 1600;
  }

  /**
   * Generate race name based on parameters
   */
  generateRaceName(params) {
    const baseNames = this.nameTemplates[params.type] || this.nameTemplates.MILE;
    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];

    // Add surface modifier occasionally
    if (Math.random() < 0.3) {
      const modifiers = this.surfaceModifiers[params.surface];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      return `${modifier} ${baseName}`;
    }

    // Add weather descriptor occasionally
    if (Math.random() < 0.2 && params.weather !== 'CLEAR') {
      const descriptors = this.weatherDescriptors[params.weather];
      const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
      return `${descriptor} ${baseName}`;
    }

    return baseName;
  }

  /**
   * Calculate prize money based on race parameters
   */
  calculatePrize(params) {
    const baseValues = {
      SPRINT: 2000,
      MILE: 5000,
      MEDIUM: 8000,
      LONG: 12000
    };

    let base = baseValues[params.type] || 5000;

    // Surface bonus
    if (params.surface === 'TURF') {
      base *= 1.2;
    }

    // Weather adjustment
    if (params.weather === 'WET') {
      base *= 0.9; // Slightly less for difficult conditions
    } else if (params.weather === 'FAST') {
      base *= 1.1; // Bonus for fast conditions
    }

    // Turn-based scaling (later races worth more)
    if (params.turn) {
      const turnMultiplier = 1 + (params.turn / 20); // Gradual increase
      base *= turnMultiplier;
    }

    return Math.round(base);
  }

  /**
   * Generate race description
   */
  generateDescription(params) {
    const typeDescriptions = {
      SPRINT: 'A short explosive test of raw speed and power',
      MILE: 'The classic distance requiring balanced ability',
      MEDIUM: 'An endurance challenge testing staying power',
      LONG: 'The ultimate stamina test for true champions'
    };

    const surfaceDescriptions = {
      DIRT: 'on the traditional dirt surface',
      TURF: 'on the elegant grass course'
    };

    const weatherDescriptions = {
      CLEAR: 'under perfect racing conditions',
      WET: 'in challenging wet conditions',
      FAST: 'on a lightning-fast track'
    };

    return `${typeDescriptions[params.type]} ${surfaceDescriptions[params.surface]} ${weatherDescriptions[params.weather]}.`;
  }

  /**
   * Generate a complete random race (no parameters needed)
   * @returns {object} Completely randomized race
   */
  generateRandomRace() {
    return this.generateRace({});
  }

  /**
   * Generate multiple races with optional constraints
   * @param {number} count - Number of races to generate
   * @param {object} constraints - Common constraints for all races
   * @returns {array} Array of generated races
   */
  generateMultipleRaces(count, constraints = {}) {
    const races = [];
    for (let i = 0; i < count; i++) {
      races.push(this.generateRace(constraints));
    }
    return races;
  }

  /**
   * Generate a themed race series (e.g., all dirt races, all sprints)
   * @param {object} theme - Theme constraints
   * @param {number} count - Number of races
   * @returns {array} Themed race series
   */
  generateThemedSeries(theme, count = 4) {
    return this.generateMultipleRaces(count, theme);
  }

  /**
   * Create a standard career race schedule
   * @param {object} options - Career options
   * @returns {array} Career race schedule
   */
  generateCareerSchedule(options = {}) {
    const {
      difficulty = 'normal', // easy, normal, hard, expert
      theme = 'classic', // classic, sprint, endurance, mixed
      turns = [4, 7, 10, 12]
    } = options;

    const races = [];

    if (theme === 'classic') {
      // Traditional career progression
      races.push(this.generateRace({ 
        name: 'Maiden Sprint', 
        type: 'SPRINT', 
        surface: 'DIRT', 
        turn: turns[0],
        description: 'Your debut race - a dirt sprint testing raw speed and power'
      }));
      races.push(this.generateRace({ 
        name: 'Mile Championship', 
        type: 'MILE', 
        surface: 'DIRT', 
        turn: turns[1],
        description: 'Mid-career balanced test on dirt requiring all-around ability'
      }));
      races.push(this.generateRace({ 
        name: 'Dirt Stakes', 
        type: 'MEDIUM', 
        surface: 'DIRT', 
        turn: turns[2],
        description: 'Endurance test on dirt - stamina and tactical racing'
      }));
      races.push(this.generateRace({ 
        name: 'Turf Cup Final', 
        type: 'LONG', 
        surface: 'TURF', 
        turn: turns[3],
        description: 'The ultimate test - long distance championship on turf'
      }));
    } else if (theme === 'sprint') {
      // Sprint specialist career
      for (let i = 0; i < 4; i++) {
        races.push(this.generateRace({ 
          type: 'SPRINT',
          turn: turns[i],
          surface: i === 3 ? 'TURF' : 'DIRT' // Final race on turf
        }));
      }
    } else if (theme === 'endurance') {
      // Distance specialist career
      const types = ['MILE', 'MEDIUM', 'LONG', 'LONG'];
      for (let i = 0; i < 4; i++) {
        races.push(this.generateRace({ 
          type: types[i],
          turn: turns[i],
          surface: i >= 2 ? 'TURF' : 'DIRT' // Later races on turf
        }));
      }
    } else if (theme === 'mixed') {
      // Completely random career
      const types = ['SPRINT', 'MILE', 'MEDIUM', 'LONG'];
      for (let i = 0; i < 4; i++) {
        races.push(this.generateRace({ 
          type: types[Math.floor(Math.random() * types.length)],
          turn: turns[i]
        }));
      }
    }

    return races;
  }
}

module.exports = RaceBuilder;