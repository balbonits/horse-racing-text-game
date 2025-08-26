/**
 * Race Collection Generator
 * Creates static race collections for each career with 4 race types
 */

class RaceGenerator {
  constructor() {
    // Static race templates with proper spacing (turns: 4, 7, 10, 12)
    this.raceTemplates = [
      {
        type: 'SPRINT',
        surface: 'DIRT',
        name: 'Maiden Sprint',
        description: 'Your debut race - a dirt sprint testing raw speed and power',
        turn: 4
      },
      {
        type: 'MILE', 
        surface: 'DIRT',
        name: 'Mile Championship',
        description: 'Mid-career balanced test on dirt requiring all-around ability',
        turn: 7
      },
      {
        type: 'MEDIUM',
        surface: 'DIRT', 
        name: 'Dirt Stakes',
        description: 'Endurance test on dirt - stamina and tactical racing',
        turn: 10
      },
      {
        type: 'LONG',
        surface: 'TURF',
        name: 'Turf Cup Final',
        description: 'The ultimate stamina challenge on turf',
        turn: 12
      }
    ];
    
    // Race name variations for future expansion
    this.nameVariations = {
      SPRINT: ['Flash Stakes', 'Lightning Cup', 'Speed Trial', 'Rapid Fire Stakes'],
      MILE: ['Classic Mile', 'Heritage Stakes', 'Mile Championship', 'Traditional Cup'], 
      MEDIUM: ['Endurance Stakes', 'Stamina Test', 'Distance Challenge', 'Persistence Cup'],
      LONG: ['Marathon Stakes', 'Ultimate Cup', 'Championship Final', 'Grand Stakes']
    };
    
    this.surfaceVariations = {
      TURF: ['Emerald', 'Meadow', 'Grass', 'Green'],
      DIRT: ['Clay', 'Track', 'Earth', 'Ground']
    };
  }

  /**
   * Generate static race collection for a career
   * For now, uses fixed template - future versions will randomize
   * @param {string} characterName - Player character name for customization
   * @returns {Array} Array of race objects for the career
   */
  generateCareerRaces(characterName = 'Rookie') {
    // For now, return static template
    // Future: randomize names, turns (within ranges), prizes, weather
    const races = this.raceTemplates.map(template => ({
      ...template,
      id: `race_${template.type}_${template.surface}`,
      weather: 'CLEAR', // Future: randomize weather
      // Future customization based on character name or other factors
      customName: this.generateCustomRaceName(template, characterName)
    }));
    
    return races;
  }

  /**
   * Generate custom race name (placeholder for future expansion)
   * @param {Object} template - Race template
   * @param {string} characterName - Character name
   * @returns {string} Custom race name
   */
  generateCustomRaceName(template, characterName) {
    // For now, return template name
    // Future: combine character name, location, sponsors, etc.
    return template.name;
  }

  /**
   * Validate race collection for completeness
   * Ensures all 4 race types are present
   * @param {Array} races - Array of race objects
   * @returns {Object} Validation result
   */
  validateRaceCollection(races) {
    const requiredTypes = ['SPRINT', 'MILE', 'MEDIUM', 'LONG'];
    const requiredSurfaces = ['TURF', 'DIRT'];
    
    const presentTypes = races.map(r => r.type);
    const presentSurfaces = [...new Set(races.map(r => r.surface))];
    
    const missingTypes = requiredTypes.filter(type => !presentTypes.includes(type));
    const missingSurfaces = requiredSurfaces.filter(surface => !presentSurfaces.includes(surface));
    
    return {
      valid: missingTypes.length === 0 && missingSurfaces.length === 0,
      missingTypes,
      missingSurfaces,
      raceCount: races.length,
      expectedCount: 4
    };
  }

  /**
   * Get race schedule summary for display
   * @param {Array} races - Array of race objects
   * @returns {Array} Schedule summary
   */
  getRaceScheduleSummary(races) {
    return races.map(race => ({
      turn: race.turn,
      name: race.name,
      type: race.type,
      surface: race.surface,
      prize: race.prize,
      description: race.description
    }));
  }

  /**
   * Future expansion: Generate specialization-based races
   * Generate races based on character specialization preferences
   * @param {Object} character - Character with specialization data
   * @param {Object} options - Generation options
   * @returns {Array} Generated race collection tailored to specialization
   */
  generateSpecializationRaces(character, options = {}) {
    // Future implementation:
    // - Analyze character's specialization (Sprinter, Miler, Stayer, Dirt/Turf specialist)
    // - Generate races that complement the specialization path
    // - Include qualifying races, G3/G2/G1 progression
    // - Add rival horses with competing specializations
    // - Create story arcs and seasonal campaigns
    
    // For now, return static races
    return this.generateCareerRaces(character.name);
  }

  /**
   * Future expansion: Generate dynamic races
   * This will be used when we want variety between careers
   * @param {Object} options - Generation options
   * @returns {Array} Generated race collection
   */
  generateDynamicRaces(options = {}) {
    // Placeholder for future dynamic generation
    // Will randomize:
    // - Race names from variations
    // - Turn scheduling (within constraints)
    // - Weather conditions
    // - Prize money (within ranges)
    // - Special conditions/modifiers
    
    return this.generateCareerRaces(options.characterName);
  }
}

module.exports = RaceGenerator;