/**
 * Horse Breed System - v1 Specialization Feature
 * 
 * Implements different horse breeds with unique characteristics, training bonuses,
 * and racing preferences. Each breed has specialized stat growth patterns and
 * optimal racing conditions.
 * 
 * Design Philosophy:
 * - Rock-paper-scissors balance between breeds
 * - Each breed has clear strengths and weaknesses
 * - Training recommendations guide player strategy
 * - Statistical advantages are meaningful but not overpowering
 */

class HorseBreed {
  constructor() {
    // Define all available breeds
    this.breeds = {
      'THOROUGHBRED': {
        name: 'Thoroughbred',
        description: 'The classic racehorse - balanced and versatile',
        rarity: 'COMMON',
        
        // Base stat modifiers (applied to starting stats)
        statModifiers: {
          speed: 1.0,     // Neutral - balanced breed
          stamina: 1.0,   // Neutral
          power: 1.0      // Neutral
        },
        
        // Training efficiency bonuses (multiplied with training gains)
        trainingBonuses: {
          speed: 1.1,     // +10% speed training efficiency
          stamina: 1.1,   // +10% stamina training efficiency  
          power: 1.0,     // Neutral power training
          rest: 1.0,      // Neutral rest recovery
          media: 1.1      // +10% media day effectiveness
        },
        
        // Surface preferences (affect race performance)
        surfacePreferences: {
          DIRT: 1.05,     // +5% performance on dirt
          TURF: 1.0       // Neutral on turf
        },
        
        // Distance specializations
        distancePreferences: {
          SPRINT: 1.0,    // 1000-1400m - Neutral
          MILE: 1.1,      // 1400-1800m - +10% (specialty)  
          MEDIUM: 1.05,   // 1800-2200m - +5%
          LONG: 1.0       // 2200m+ - Neutral
        },
        
        // Optimal racing strategies
        preferredStrategies: ['MID', 'FRONT'],
        
        // Training recommendations
        trainingFocus: ['speed', 'stamina', 'media'],
        
        // Flavor text and characteristics
        characteristics: [
          'Versatile and adaptable',
          'Strong in mile races', 
          'Responds well to media training',
          'Consistent performer across surfaces'
        ]
      },

      'ARABIAN': {
        name: 'Arabian',
        description: 'Desert-bred endurance specialist with incredible stamina',
        rarity: 'UNCOMMON',
        
        statModifiers: {
          speed: 0.9,     // -10% starting speed
          stamina: 1.3,   // +30% starting stamina (major advantage)
          power: 0.8      // -20% starting power
        },
        
        trainingBonuses: {
          speed: 0.9,     // -10% speed training (weakness)
          stamina: 1.4,   // +40% stamina training (major strength)
          power: 0.8,     // -20% power training (weakness)
          rest: 1.2,      // +20% rest recovery (endurance breed)
          media: 1.0      // Neutral media training
        },
        
        surfacePreferences: {
          DIRT: 1.1,      // +10% on dirt (desert heritage)
          TURF: 0.95      // -5% on turf
        },
        
        distancePreferences: {
          SPRINT: 0.8,    // -20% in sprints (weakness)
          MILE: 1.0,      // Neutral in miles
          MEDIUM: 1.15,   // +15% in medium distances
          LONG: 1.25      // +25% in long distances (specialty)
        },
        
        preferredStrategies: ['LATE', 'MID'],
        
        trainingFocus: ['stamina', 'rest'],
        
        characteristics: [
          'Exceptional endurance and stamina',
          'Excels in long-distance races',
          'Strong closer with late-race kicks',
          'Superior recovery between training sessions'
        ]
      },

      'QUARTER_HORSE': {
        name: 'Quarter Horse', 
        description: 'American speed demon built for explosive sprint power',
        rarity: 'UNCOMMON',
        
        statModifiers: {
          speed: 1.25,    // +25% starting speed (major advantage)
          stamina: 0.8,   // -20% starting stamina
          power: 1.2      // +20% starting power
        },
        
        trainingBonuses: {
          speed: 1.3,     // +30% speed training (major strength)
          stamina: 0.8,   // -20% stamina training (weakness)
          power: 1.25,    // +25% power training (strength)
          rest: 0.9,      // -10% rest recovery
          media: 1.05     // +5% media training
        },
        
        surfacePreferences: {
          DIRT: 1.15,     // +15% on dirt (American heritage)
          TURF: 0.9       // -10% on turf
        },
        
        distancePreferences: {
          SPRINT: 1.3,    // +30% in sprints (specialty)
          MILE: 1.1,      // +10% in miles  
          MEDIUM: 0.9,    // -10% in medium distances
          LONG: 0.7       // -30% in long distances (major weakness)
        },
        
        preferredStrategies: ['FRONT', 'MID'],
        
        trainingFocus: ['speed', 'power', 'media'],
        
        characteristics: [
          'Explosive early speed and acceleration',
          'Dominates sprint races',
          'Front-running specialist',
          'Fades in longer distances'
        ]
      }
    };
  }

  /**
   * Get all available breeds
   * @returns {Array} Array of breed objects
   */
  getAllBreeds() {
    return Object.keys(this.breeds).map(key => ({
      id: key,
      ...this.breeds[key]
    }));
  }

  /**
   * Get breed by ID
   * @param {string} breedId - Breed identifier
   * @returns {Object} Breed data or null
   */
  getBreed(breedId) {
    const breed = this.breeds[breedId];
    return breed ? { id: breedId, ...breed } : null;
  }

  /**
   * Get random breed based on rarity weights
   * @returns {Object} Random breed
   */
  getRandomBreed() {
    // Rarity weights: COMMON=50%, UNCOMMON=30%, RARE=15%, LEGENDARY=5%
    const rarityWeights = {
      'COMMON': 50,
      'UNCOMMON': 30, 
      'RARE': 15,
      'LEGENDARY': 5
    };
    
    const breeds = this.getAllBreeds();
    const totalWeight = breeds.reduce((sum, breed) => {
      return sum + (rarityWeights[breed.rarity] || 0);
    }, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const breed of breeds) {
      const weight = rarityWeights[breed.rarity] || 0;
      random -= weight;
      if (random <= 0) {
        return breed;
      }
    }
    
    // Fallback to Thoroughbred
    return this.getBreed('THOROUGHBRED');
  }

  /**
   * Apply breed modifiers to starting stats
   * @param {Object} baseStats - Base character stats
   * @param {string} breedId - Breed identifier
   * @returns {Object} Modified stats
   */
  applyStatModifiers(baseStats, breedId) {
    const breed = this.getBreed(breedId);
    if (!breed) return baseStats;
    
    return {
      speed: Math.round(baseStats.speed * breed.statModifiers.speed),
      stamina: Math.round(baseStats.stamina * breed.statModifiers.stamina),
      power: Math.round(baseStats.power * breed.statModifiers.power)
    };
  }

  /**
   * Calculate training efficiency for a breed
   * @param {string} breedId - Breed identifier
   * @param {string} trainingType - Training type
   * @returns {number} Training efficiency multiplier
   */
  getTrainingEfficiency(breedId, trainingType) {
    const breed = this.getBreed(breedId);
    if (!breed) return 1.0;
    
    return breed.trainingBonuses[trainingType] || 1.0;
  }

  /**
   * Calculate race performance modifier for breed
   * @param {string} breedId - Breed identifier
   * @param {Object} raceInfo - Race information (surface, distance, etc.)
   * @returns {number} Performance multiplier
   */
  getRacePerformanceModifier(breedId, raceInfo) {
    const breed = this.getBreed(breedId);
    if (!breed) return 1.0;
    
    let modifier = 1.0;
    
    // Apply surface preference
    if (raceInfo.surface && breed.surfacePreferences[raceInfo.surface]) {
      modifier *= breed.surfacePreferences[raceInfo.surface];
    }
    
    // Apply distance preference
    if (raceInfo.type && breed.distancePreferences[raceInfo.type]) {
      modifier *= breed.distancePreferences[raceInfo.type];
    }
    
    return modifier;
  }

  /**
   * Get training recommendations for a breed
   * @param {string} breedId - Breed identifier
   * @returns {Object} Training recommendations
   */
  getTrainingRecommendations(breedId) {
    const breed = this.getBreed(breedId);
    if (!breed) return { focus: [], avoid: [] };
    
    const trainingTypes = ['speed', 'stamina', 'power', 'rest', 'media'];
    const bonuses = breed.trainingBonuses;
    
    // Recommend training types with bonuses > 1.0
    const focus = trainingTypes.filter(type => bonuses[type] > 1.0);
    
    // Avoid training types with penalties < 0.9
    const avoid = trainingTypes.filter(type => bonuses[type] < 0.9);
    
    return {
      focus: focus,
      avoid: avoid,
      strategies: breed.preferredStrategies || [],
      characteristics: breed.characteristics || []
    };
  }

  /**
   * Get optimal racing strategy for breed
   * @param {string} breedId - Breed identifier
   * @param {Object} raceInfo - Race information
   * @returns {string} Recommended strategy
   */
  getOptimalStrategy(breedId, raceInfo) {
    const breed = this.getBreed(breedId);
    if (!breed || !breed.preferredStrategies.length) return 'MID';
    
    // For now, return first preferred strategy
    // In future versions, this could analyze race conditions
    return breed.preferredStrategies[0];
  }

  /**
   * Generate breed description for UI
   * @param {string} breedId - Breed identifier  
   * @returns {string} Formatted description
   */
  getBreedDescription(breedId) {
    const breed = this.getBreed(breedId);
    if (!breed) return 'Unknown breed';
    
    const recommendations = this.getTrainingRecommendations(breedId);
    
    let description = `${breed.name} (${breed.rarity})\n`;
    description += `${breed.description}\n\n`;
    
    if (recommendations.characteristics.length > 0) {
      description += 'Characteristics:\n';
      recommendations.characteristics.forEach(char => {
        description += `• ${char}\n`;
      });
      description += '\n';
    }
    
    if (recommendations.focus.length > 0) {
      description += `Focus on: ${recommendations.focus.join(', ')} training\n`;
    }
    
    if (recommendations.avoid.length > 0) {
      description += `Avoid: ${recommendations.avoid.join(', ')} training\n`;
    }
    
    if (recommendations.strategies.length > 0) {
      description += `Preferred strategies: ${recommendations.strategies.join(', ')}\n`;
    }
    
    return description.trim();
  }

  /**
   * Validate breed configuration
   * @returns {Object} Validation results
   */
  validateBreeds() {
    const errors = [];
    const warnings = [];
    
    Object.entries(this.breeds).forEach(([id, breed]) => {
      // Check required fields
      if (!breed.name) errors.push(`Breed ${id} missing name`);
      if (!breed.description) warnings.push(`Breed ${id} missing description`);
      
      // Validate stat modifiers
      const requiredStats = ['speed', 'stamina', 'power'];
      requiredStats.forEach(stat => {
        if (typeof breed.statModifiers[stat] !== 'number') {
          errors.push(`Breed ${id} missing ${stat} modifier`);
        }
      });
      
      // Check balance - no breed should have all bonuses
      const bonusCount = Object.values(breed.statModifiers)
        .filter(mod => mod > 1.0).length;
      if (bonusCount > 2) {
        warnings.push(`Breed ${id} may be overpowered (${bonusCount} stat bonuses)`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = HorseBreed;