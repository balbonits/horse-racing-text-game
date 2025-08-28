/**
 * Enhanced Race System - v1 Feature
 * 
 * Implements dynamic race name generation, authentic horse racing terminology,
 * weather conditions, and improved race simulation with track segments.
 * 
 * Features:
 * - Dynamic race name generation from authentic components
 * - Track conditions affecting performance
 * - Segment-based race simulation (early/middle/late phases)
 * - Enhanced NPH AI with realistic racing styles
 * - Detailed race commentary and results
 */

const RaceData = require('../data/RaceData');
const GameConstants = require('../data/GameConstants');
const GameMessages = require('../data/GameMessages');

class EnhancedRaceSystem {
  constructor() {
    this.raceData = RaceData;
    this.constants = GameConstants;
    this.messages = GameMessages;
    
    // Track state for race generation
    this.generatedRaces = new Set(); // Prevent duplicate names
    this.seasonalTheme = this.determineSeasonalTheme();
    this.raceHistory = []; // Track all completed races
  }

  /**
   * Generate dynamic race name based on race type and context
   * @param {Object} raceConfig - Race configuration
   * @param {Object} context - Additional context (turn, season, etc.)
   * @returns {string} Generated race name
   */
  generateRaceName(raceConfig, context = {}) {
    const { type, distance, surface, raceType } = raceConfig;
    const { turn, isCareerFinale, themeOverride } = context;
    
    let selectedTheme;
    
    // Determine theme based on context
    if (themeOverride) {
      selectedTheme = this.raceData.themes[themeOverride];
    } else if (isCareerFinale) {
      selectedTheme = { 
        prefixes: ['Championship', 'Grand', 'Ultimate', 'Supreme', 'Final'],
        suffixes: ['Classic', 'Championship', 'Cup', 'Stakes', 'Trophy']
      };
    } else {
      // Use stat-based themes for variety
      selectedTheme = this.selectThemeByRaceType(raceType);
    }
    
    // Get appropriate template for race type
    const templates = this.raceData.templates[type] || this.raceData.templates.allowance;
    const template = this.selectRandomElement(templates);
    
    // Generate unique race name
    let raceName;
    let attempts = 0;
    const maxAttempts = 20;
    
    do {
      const prefix = this.selectRandomElement(
        selectedTheme?.prefixes || this.raceData.prefixes
      );
      const suffix = this.selectRandomElement(
        selectedTheme?.suffixes || this.raceData.suffixes
      );
      
      // Apply template
      raceName = template
        .replace('{prefix}', prefix)
        .replace('{suffix}', suffix);
      
      attempts++;
    } while (this.generatedRaces.has(raceName) && attempts < maxAttempts);
    
    // Add to generated races to prevent duplicates
    this.generatedRaces.add(raceName);
    
    return raceName;
  }

  /**
   * Create enhanced race configuration
   * @param {Object} baseRace - Base race from career progression
   * @param {Object} character - Player character for context
   * @param {number} turn - Current turn number
   * @returns {Object} Enhanced race configuration
   */
  createEnhancedRace(baseRace, character, turn) {
    const isCareerFinale = turn >= this.constants.career.maxTurns;
    
    // Generate dynamic race name
    const raceName = this.generateRaceName(baseRace, {
      turn,
      isCareerFinale,
      themeOverride: this.getThemeForCharacter(character)
    });
    
    // Determine track conditions
    const trackCondition = this.generateTrackCondition(baseRace.surface);
    const weather = this.generateWeather();
    
    // Create field of competitors
    const field = this.generateRaceField(baseRace, character);
    
    // Calculate prize distribution
    const prizeDistribution = this.calculatePrizeDistribution(baseRace.prizePool);
    
    return {
      ...baseRace,
      name: raceName,
      scheduledTurn: turn,
      
      // Enhanced race conditions
      conditions: {
        track: trackCondition,
        weather: weather,
        temperature: this.generateTemperature(),
        wind: this.generateWind()
      },
      
      // Race field
      field: field,
      fieldSize: field.length,
      
      // Financial details
      prizeDistribution: prizeDistribution,
      totalPrize: baseRace.prizePool,
      
      // Race metadata
      grade: this.determineRaceGrade(baseRace.type),
      category: this.categorizeRace(baseRace),
      difficulty: this.calculateRaceDifficulty(baseRace, field),
      
      // Simulation parameters
      segments: this.createRaceSegments(baseRace.distance, baseRace.raceType),
      paceScenario: this.determinePaceScenario(field),
      
      // Commentary data
      commentaryContext: {
        rivals: this.identifyKeyRivals(field, character),
        storyline: this.generateRaceStoryline(baseRace, character, turn),
        keyMoments: []
      }
    };
  }

  /**
   * Simulate enhanced race with segment-based progression
   * @param {Object} enhancedRace - Enhanced race configuration
   * @param {Object} playerCharacter - Player's character
   * @param {string} playerStrategy - Chosen racing strategy
   * @returns {Object} Detailed race result
   */
  async simulateEnhancedRace(enhancedRace, playerCharacter, playerStrategy) {
    const raceResult = {
      raceName: enhancedRace.name,
      distance: enhancedRace.distance,
      surface: enhancedRace.surface,
      conditions: enhancedRace.conditions,
      field: enhancedRace.field,
      
      // Simulation results
      segments: [],
      finalResults: [],
      commentary: [],
      
      // Player-specific results
      playerResult: {},
      
      // Race statistics
      winTime: null,
      margins: [],
      splits: [],
      
      // Post-race analysis
      analysis: {}
    };

    // Initialize race simulation
    const runners = this.initializeRunners(enhancedRace.field, playerCharacter, playerStrategy);
    const segments = enhancedRace.segments;
    
    // Simulate each race segment
    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
      const segment = segments[segmentIndex];
      const segmentResult = await this.simulateSegment(
        segment, 
        runners, 
        enhancedRace,
        segmentIndex
      );
      
      raceResult.segments.push(segmentResult);
      raceResult.commentary.push(...segmentResult.commentary);
      
      // Update runner positions and energy
      this.updateRunnersAfterSegment(runners, segmentResult);
    }
    
    // Calculate final results
    raceResult.finalResults = this.calculateFinalResults(runners);
    raceResult.playerResult = this.extractPlayerResult(raceResult.finalResults, playerCharacter);
    
    // Generate post-race analysis
    raceResult.analysis = this.generateRaceAnalysis(raceResult, playerCharacter, playerStrategy);
    
    // Update race history
    this.raceHistory.push({
      race: enhancedRace,
      result: raceResult,
      date: new Date().toISOString()
    });
    
    return raceResult;
  }

  /**
   * Generate race field with NPH competitors
   * @param {Object} raceConfig - Race configuration
   * @param {Object} playerCharacter - Player character for balancing
   * @returns {Array} Array of competitor horses
   */
  generateRaceField(raceConfig, playerCharacter) {
    const field = [];
    const targetFieldSize = raceConfig.fieldSize || 10;
    const playerStats = playerCharacter.getCurrentStats();
    
    // Calculate average player stat level for balancing
    const avgPlayerStat = (playerStats.speed + playerStats.stamina + playerStats.power) / 3;
    
    for (let i = 0; i < targetFieldSize - 1; i++) { // -1 for player
      const competitor = this.generateNPHCompetitor(raceConfig, avgPlayerStat, i);
      field.push(competitor);
    }
    
    // Add player to field
    field.push({
      name: playerCharacter.name,
      isPlayer: true,
      stats: playerStats,
      condition: { ...playerCharacter.condition },
      racingStyle: playerCharacter.racingStyle || 'STALKER',
      breed: playerCharacter.breed || 'THOROUGHBRED',
      postPosition: targetFieldSize, // Player gets final post position
      odds: this.calculatePlayerOdds(playerStats, field)
    });
    
    return field;
  }

  /**
   * Generate NPH competitor with balanced stats
   * @param {Object} raceConfig - Race configuration  
   * @param {number} playerLevel - Player's average stat level
   * @param {number} index - Competitor index for variety
   * @returns {Object} NPH competitor
   */
  generateNPHCompetitor(raceConfig, playerLevel, index) {
    // Create stat spread around player level
    const variance = 15; // ±15 stat points variance
    const baseLevel = Math.max(20, Math.min(85, 
      playerLevel + (Math.random() - 0.5) * variance * 2
    ));
    
    // Generate realistic horse name
    const name = this.generateCompetitorName();
    
    // Assign racing style based on race type preferences
    const racingStyle = this.selectRacingStyleForRace(raceConfig.raceType);
    
    // Generate stats that favor the assigned racing style
    const stats = this.generateStatsForStyle(racingStyle, baseLevel);
    
    return {
      name: name,
      isPlayer: false,
      stats: stats,
      condition: {
        energy: Math.random() * 20 + 80, // 80-100 energy
        form: this.selectRandomElement(['excellent', 'good', 'good', 'normal', 'normal'])
      },
      racingStyle: racingStyle,
      breed: this.selectRandomElement(['THOROUGHBRED', 'THOROUGHBRED', 'ARABIAN', 'QUARTER_HORSE']),
      postPosition: index + 1,
      odds: this.calculateCompetitorOdds(stats, baseLevel),
      
      // AI behavior parameters
      aggressiveness: Math.random(),
      consistency: Math.random() * 0.3 + 0.7, // 70-100% consistency
      experience: Math.floor(Math.random() * 10), // 0-9 experience points
      
      // Flavor details
      colors: this.generateHorseColors(),
      jockey: this.generateJockeyName(),
      trainer: this.generateTrainerName()
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Select theme based on race type characteristics
   */
  selectThemeByRaceType(raceType) {
    switch (raceType) {
      case 'SPRINT':
        return this.raceData.themes.speed;
      case 'LONG':
        return this.raceData.themes.endurance;
      case 'MEDIUM':
        return this.raceData.themes.power;
      default:
        return null; // Use general themes
    }
  }

  /**
   * Determine seasonal theme based on current date/context
   */
  determineSeasonalTheme() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Generate track condition based on surface and randomness
   */
  generateTrackCondition(surface) {
    const conditions = this.raceData.conditions.track[surface];
    const conditionKeys = Object.keys(conditions);
    
    // Weight toward better conditions (80% good conditions)
    const weights = surface === 'DIRT' 
      ? [0.5, 0.3, 0.15, 0.05] // fast, good, muddy, sloppy
      : [0.5, 0.3, 0.15, 0.05]; // firm, good, yielding, soft
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        const conditionKey = conditionKeys[i];
        return {
          condition: conditionKey,
          ...conditions[conditionKey]
        };
      }
    }
    
    // Fallback to first condition
    const firstKey = conditionKeys[0];
    return {
      condition: firstKey,
      ...conditions[firstKey]
    };
  }

  /**
   * Generate weather conditions
   */
  generateWeather() {
    const weatherTypes = this.raceData.conditions.weather;
    const weatherKeys = Object.keys(weatherTypes);
    
    // Weight toward clear weather (70% clear)
    const weights = [0.7, 0.15, 0.1, 0.05]; // clear, cloudy, windy, rainy
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        const weatherKey = weatherKeys[i];
        return {
          condition: weatherKey,
          ...weatherTypes[weatherKey]
        };
      }
    }
    
    return { condition: 'clear', description: 'Clear skies', modifier: 1.0 };
  }

  /**
   * Create race segments for simulation
   */
  createRaceSegments(distance, raceType) {
    const segments = [];
    
    // Standard segment breakdown based on race type
    if (raceType === 'SPRINT') {
      segments.push(
        { name: 'break', distance: distance * 0.1, description: 'Gate break and early positioning' },
        { name: 'early', distance: distance * 0.4, description: 'Early pace development' },
        { name: 'stretch', distance: distance * 0.5, description: 'Final sprint to the wire' }
      );
    } else if (raceType === 'MILE') {
      segments.push(
        { name: 'break', distance: distance * 0.1, description: 'Gate break' },
        { name: 'early', distance: distance * 0.3, description: 'Early positioning' },
        { name: 'middle', distance: distance * 0.35, description: 'Middle pace phase' },
        { name: 'stretch', distance: distance * 0.25, description: 'Stretch drive' }
      );
    } else if (raceType === 'MEDIUM') {
      segments.push(
        { name: 'break', distance: distance * 0.08, description: 'Gate break' },
        { name: 'early', distance: distance * 0.27, description: 'Early pace' },
        { name: 'middle', distance: distance * 0.35, description: 'Middle sections' },
        { name: 'late', distance: distance * 0.15, description: 'Late positioning' },
        { name: 'stretch', distance: distance * 0.15, description: 'Final stretch' }
      );
    } else { // LONG
      segments.push(
        { name: 'break', distance: distance * 0.06, description: 'Gate break' },
        { name: 'early', distance: distance * 0.24, description: 'Early pace' },
        { name: 'middle1', distance: distance * 0.25, description: 'First middle phase' },
        { name: 'middle2', distance: distance * 0.25, description: 'Second middle phase' },
        { name: 'late', distance: distance * 0.12, description: 'Late positioning' },
        { name: 'stretch', distance: distance * 0.08, description: 'Final stretch' }
      );
    }
    
    return segments;
  }

  /**
   * Select random element from array
   */
  selectRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate competitor name using racing terminology
   */
  generateCompetitorName() {
    const prefixes = ['Thunder', 'Lightning', 'Storm', 'Wind', 'Fire', 'Star', 'Golden', 'Silver', 'Royal', 'Noble'];
    const suffixes = ['Strike', 'Bolt', 'Runner', 'Dash', 'Arrow', 'Spirit', 'Dream', 'Glory', 'Victory', 'Champion'];
    
    return `${this.selectRandomElement(prefixes)} ${this.selectRandomElement(suffixes)}`;
  }

  /**
   * Calculate race difficulty based on field strength
   */
  calculateRaceDifficulty(raceConfig, field) {
    const avgFieldStrength = field.reduce((sum, horse) => {
      if (horse.isPlayer) return sum;
      return sum + (horse.stats.speed + horse.stats.stamina + horse.stats.power) / 3;
    }, 0) / (field.length - 1);
    
    // Difficulty scale: 1-10
    return Math.max(1, Math.min(10, Math.round(avgFieldStrength / 10)));
  }

  // Placeholder methods for race simulation (to be expanded)
  initializeRunners(field, playerCharacter, strategy) {
    return field.map(horse => ({
      ...horse,
      position: 0,
      energy: horse.condition.energy,
      currentStrategy: horse.isPlayer ? strategy : horse.racingStyle
    }));
  }

  async simulateSegment(segment, runners, race, segmentIndex) {
    // Simplified segment simulation - to be expanded
    return {
      segmentName: segment.name,
      positions: runners.map(r => ({ name: r.name, position: Math.random() })),
      commentary: [`Through the ${segment.description.toLowerCase()}...`]
    };
  }

  updateRunnersAfterSegment(runners, segmentResult) {
    // Update runner states after segment
  }

  calculateFinalResults(runners) {
    // Sort runners by final position and return results
    return runners
      .sort((a, b) => (b.position || 0) - (a.position || 0))
      .map((runner, index) => ({
        placement: index + 1,
        name: runner.name,
        isPlayer: runner.isPlayer,
        margin: index === 0 ? 0 : Math.random() * 5 + 0.5,
        time: this.generateRaceTime(2000) // Placeholder
      }));
  }

  extractPlayerResult(finalResults, playerCharacter) {
    return finalResults.find(result => result.isPlayer);
  }

  generateRaceAnalysis(raceResult, playerCharacter, strategy) {
    return {
      paceAnalysis: 'Moderate early pace',
      keyMoments: ['Clean break from gate', 'Tight finish'],
      playerPerformance: 'Solid effort',
      recommendations: ['Continue current training approach']
    };
  }

  // Additional placeholder methods...
  getThemeForCharacter(character) { return null; }
  generateTemperature() { return Math.floor(Math.random() * 20) + 60; }
  generateWind() { return { speed: Math.floor(Math.random() * 10), direction: 'W' }; }
  determineRaceGrade(type) { return type === 'grade1' ? 'G1' : type === 'stakes' ? 'G2' : 'G3'; }
  categorizeRace(race) { return race.type; }
  determinePaceScenario(field) { return 'moderate'; }
  identifyKeyRivals(field, character) { return []; }
  generateRaceStoryline(race, character, turn) { return 'Standard race'; }
  selectRacingStyleForRace(raceType) { return 'STALKER'; }
  generateStatsForStyle(style, baseLevel) { 
    return { speed: baseLevel, stamina: baseLevel, power: baseLevel }; 
  }
  calculateCompetitorOdds(stats, baseLevel) { return '3-1'; }
  calculatePlayerOdds(stats, field) { return '5-2'; }
  generateHorseColors() { return 'Bay'; }
  generateJockeyName() { return 'J. Smith'; }
  generateTrainerName() { return 'T. Jones'; }
  calculatePrizeDistribution(total) { return [total * 0.6, total * 0.25, total * 0.15]; }
  generateRaceTime(distance) { return '2:01.50'; }
}

module.exports = EnhancedRaceSystem;