/**
 * Racing Style System - v1 Specialization Feature
 * 
 * Implements different racing styles that affect how horses perform during races.
 * Each style has unique energy management, positioning preferences, and tactical
 * advantages in different race segments.
 * 
 * Racing Styles:
 * - FRONT_RUNNER: Leads from start, high speed requirement
 * - STALKER: Stays close to leaders, balanced approach  
 * - CLOSER: Saves energy for strong finish, high stamina requirement
 * - WIRE_TO_WIRE: Rare style requiring perfect energy management
 */

class RacingStyle {
  constructor() {
    this.styles = {
      'FRONT_RUNNER': {
        name: 'Front Runner',
        description: 'Takes the early lead and tries to maintain it throughout the race',
        
        // Stat requirements for effectiveness
        statRequirements: {
          speed: 70,      // High speed needed for early lead
          stamina: 60,    // Good stamina to maintain pace
          power: 75       // High power for initial acceleration
        },
        
        // Energy usage patterns during race segments
        energyUsage: {
          start: 0.4,     // 40% energy in first quarter
          middle: 0.35,   // 35% energy in middle sections
          finish: 0.25    // 25% energy for final stretch
        },
        
        // Performance multipliers in different race segments
        segmentPerformance: {
          start: 1.3,     // +30% performance at race start
          early: 1.2,     // +20% in early segments
          middle: 1.1,    // +10% in middle segments
          late: 0.9,      // -10% in late segments (tiring)
          finish: 0.8     // -20% in final stretch (fatigue)
        },
        
        // Distance effectiveness
        distanceEffectiveness: {
          SPRINT: 1.25,   // +25% in sprints (ideal distance)
          MILE: 1.1,      // +10% in miles
          MEDIUM: 0.95,   // -5% in medium distances
          LONG: 0.8       // -20% in long distances (tires out)
        },
        
        // Tactical advantages and risks
        advantages: [
          'Sets pace and controls race tempo',
          'Avoids traffic problems',
          'Psychological advantage over field',
          'Excellent in sprint races'
        ],
        
        risks: [
          'Vulnerable to late closers',
          'Higher energy consumption',
          'Can fade in longer races',
          'Pressure from stalkers'
        ],
        
        // Optimal race conditions
        optimalConditions: {
          field_size: 'small',    // Better with fewer competitors
          pace: 'slow',           // Benefits from slow early pace
          track_bias: 'speed',    // Favors speed-biased tracks
          weather: 'clear'        // Prefers ideal conditions
        }
      },

      'STALKER': {
        name: 'Stalker',
        description: 'Stays within striking distance of leaders, makes calculated moves',
        
        statRequirements: {
          speed: 65,      // Good speed for positioning
          stamina: 70,    // High stamina for sustained effort
          power: 65       // Good power for tactical moves
        },
        
        energyUsage: {
          start: 0.25,    // 25% energy in first quarter
          middle: 0.45,   // 45% energy in middle sections (key positioning)
          finish: 0.30    // 30% energy for final kick
        },
        
        segmentPerformance: {
          start: 1.0,     // Neutral at start
          early: 1.1,     // +10% in early positioning
          middle: 1.25,   // +25% in middle segments (strength)
          late: 1.15,     // +15% in late positioning
          finish: 1.1     // +10% in final stretch
        },
        
        distanceEffectiveness: {
          SPRINT: 1.0,    // Neutral in sprints
          MILE: 1.2,      // +20% in miles (ideal)
          MEDIUM: 1.15,   // +15% in medium distances
          LONG: 1.0       // Neutral in long distances
        },
        
        advantages: [
          'Versatile and adaptable',
          'Good tactical positioning',
          'Balanced energy usage',
          'Effective across distances'
        ],
        
        risks: [
          'Can get trapped behind horses',
          'Requires good race timing',
          'May lack knockout punch',
          'Dependent on pace scenario'
        ],
        
        optimalConditions: {
          field_size: 'medium',   // Works well in average fields
          pace: 'moderate',       // Benefits from honest pace
          track_bias: 'neutral',  // Adaptable to any track bias
          weather: 'any'          // Weather independent
        }
      },

      'CLOSER': {
        name: 'Closer',
        description: 'Stays back early, unleashes powerful late kick to win',
        
        statRequirements: {
          speed: 60,      // Moderate speed sufficient
          stamina: 80,    // Very high stamina essential
          power: 70       // High power for late surge
        },
        
        energyUsage: {
          start: 0.15,    // 15% energy in first quarter (conserving)
          middle: 0.25,   // 25% energy in middle sections  
          finish: 0.60    // 60% energy for massive late kick
        },
        
        segmentPerformance: {
          start: 0.8,     // -20% at start (laying back)
          early: 0.9,     // -10% in early segments
          middle: 1.0,    // Neutral in middle
          late: 1.3,      // +30% in late segments (moving up)
          finish: 1.4     // +40% in final stretch (explosive)
        },
        
        distanceEffectiveness: {
          SPRINT: 0.85,   // -15% in sprints (not enough time)
          MILE: 1.1,      // +10% in miles
          MEDIUM: 1.25,   // +25% in medium distances
          LONG: 1.3       // +30% in long distances (specialty)
        },
        
        advantages: [
          'Devastating late kick',
          'Excellent energy conservation',
          'Thrives in competitive finishes',
          'Dominant in longer races'
        ],
        
        risks: [
          'May leave run too late',
          'Vulnerable to slow pace',
          'Needs racing room late',
          'Can get too far back'
        ],
        
        optimalConditions: {
          field_size: 'large',    // Benefits from competitive pace
          pace: 'fast',           // Needs hot early pace
          track_bias: 'closer',   // Favors late runners
          weather: 'any'          // Adaptable
        }
      },

      'WIRE_TO_WIRE': {
        name: 'Wire-to-Wire',
        description: 'Rare style that leads from start to finish with perfect pacing',
        
        statRequirements: {
          speed: 75,      // High speed for early lead
          stamina: 85,    // Exceptional stamina required
          power: 70       // Good power for sustained pace
        },
        
        energyUsage: {
          start: 0.3,     // 30% energy for early lead
          middle: 0.4,    // 40% energy maintaining pace
          finish: 0.3     // 30% energy to hold off closers
        },
        
        segmentPerformance: {
          start: 1.2,     // +20% at start
          early: 1.15,    // +15% early
          middle: 1.2,    // +20% middle (maintaining lead)
          late: 1.1,      // +10% late
          finish: 1.05    // +5% finish (holding on)
        },
        
        distanceEffectiveness: {
          SPRINT: 1.1,    // +10% in sprints
          MILE: 1.15,     // +15% in miles
          MEDIUM: 1.2,    // +20% in medium (ideal)
          LONG: 1.05      // +5% in long (very difficult)
        },
        
        advantages: [
          'Controls entire race',
          'Avoids all traffic',
          'Demoralizes competition',
          'Spectacular when successful'
        ],
        
        risks: [
          'Extremely demanding on stamina',
          'Vulnerable to multiple closers',
          'Requires perfect pace judgment',
          'High failure rate'
        ],
        
        optimalConditions: {
          field_size: 'small',    // Easier with fewer competitors
          pace: 'controlled',     // Needs to control pace
          track_bias: 'speed',    // Speed-favoring track helpful
          weather: 'ideal'        // Needs perfect conditions
        }
      }
    };
  }

  /**
   * Get all available racing styles
   * @returns {Array} Array of racing style objects
   */
  getAllStyles() {
    return Object.keys(this.styles).map(key => ({
      id: key,
      ...this.styles[key]
    }));
  }

  /**
   * Get racing style by ID
   * @param {string} styleId - Style identifier
   * @returns {Object} Style data or null
   */
  getStyle(styleId) {
    const style = this.styles[styleId];
    return style ? { id: styleId, ...style } : null;
  }

  /**
   * Determine optimal racing style for horse stats
   * @param {Object} stats - Horse stats {speed, stamina, power}
   * @returns {Object} Recommended style with suitability score
   */
  getOptimalStyle(stats) {
    const styleRatings = [];
    
    this.getAllStyles().forEach(style => {
      let suitabilityScore = 0;
      let totalRequirements = 0;
      
      // Calculate how well stats match requirements
      Object.entries(style.statRequirements).forEach(([stat, requirement]) => {
        const statValue = stats[stat] || 0;
        const ratio = statValue / requirement;
        
        // Score from 0-100 based on how well stat meets requirement
        const statScore = Math.min(100, Math.max(0, ratio * 100));
        suitabilityScore += statScore;
        totalRequirements++;
      });
      
      // Average suitability score
      const averageScore = suitabilityScore / totalRequirements;
      
      styleRatings.push({
        style: style,
        suitability: Math.round(averageScore),
        reasons: this.getSuitabilityReasons(stats, style)
      });
    });
    
    // Sort by suitability score
    styleRatings.sort((a, b) => b.suitability - a.suitability);
    
    return styleRatings[0]; // Return best match
  }

  /**
   * Get reasons why a style suits the horse's stats
   * @param {Object} stats - Horse stats
   * @param {Object} style - Racing style
   * @returns {Array} Array of reason strings
   */
  getSuitabilityReasons(stats, style) {
    const reasons = [];
    
    Object.entries(style.statRequirements).forEach(([stat, requirement]) => {
      const statValue = stats[stat] || 0;
      
      if (statValue >= requirement * 1.1) {
        reasons.push(`Excellent ${stat} (${statValue}) exceeds requirement`);
      } else if (statValue >= requirement) {
        reasons.push(`Good ${stat} (${statValue}) meets requirement`);
      } else if (statValue >= requirement * 0.9) {
        reasons.push(`Adequate ${stat} (${statValue}) close to requirement`);
      } else {
        reasons.push(`Low ${stat} (${statValue}) below requirement (${requirement})`);
      }
    });
    
    return reasons;
  }

  /**
   * Calculate race performance modifier based on style
   * @param {string} styleId - Racing style ID
   * @param {Object} raceInfo - Race information
   * @param {string} segment - Current race segment
   * @returns {number} Performance multiplier
   */
  getSegmentPerformance(styleId, raceInfo, segment) {
    const style = this.getStyle(styleId);
    if (!style) return 1.0;
    
    let modifier = 1.0;
    
    // Apply segment performance
    if (style.segmentPerformance[segment]) {
      modifier *= style.segmentPerformance[segment];
    }
    
    // Apply distance effectiveness
    if (raceInfo.type && style.distanceEffectiveness[raceInfo.type]) {
      modifier *= style.distanceEffectiveness[raceInfo.type];
    }
    
    return modifier;
  }

  /**
   * Calculate energy usage for race segment
   * @param {string} styleId - Racing style ID
   * @param {string} segment - Race segment (start, middle, finish)
   * @returns {number} Energy usage percentage
   */
  getEnergyUsage(styleId, segment) {
    const style = this.getStyle(styleId);
    if (!style) return 0.33; // Default equal distribution
    
    return style.energyUsage[segment] || 0.0;
  }

  /**
   * Get racing style recommendations
   * @param {Object} stats - Horse stats
   * @returns {Object} Style recommendations
   */
  getStyleRecommendations(stats) {
    const allRatings = [];
    
    this.getAllStyles().forEach(style => {
      const rating = this.getOptimalStyle(stats);
      if (rating.style.id === style.id) {
        allRatings.push(rating);
      }
    });
    
    // Re-evaluate all styles for comprehensive comparison
    const allStyles = this.getAllStyles().map(style => {
      let score = 0;
      Object.entries(style.statRequirements).forEach(([stat, req]) => {
        score += Math.min(100, (stats[stat] / req) * 100);
      });
      
      return {
        style: style,
        suitability: Math.round(score / 3), // Average of 3 stats
        recommendation: this.getRecommendationLevel(score / 3)
      };
    });
    
    allStyles.sort((a, b) => b.suitability - a.suitability);
    
    return {
      recommended: allStyles[0],
      alternatives: allStyles.slice(1),
      summary: this.generateRecommendationSummary(stats, allStyles)
    };
  }

  /**
   * Get recommendation level based on suitability score
   * @param {number} score - Suitability score
   * @returns {string} Recommendation level
   */
  getRecommendationLevel(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    return 'POOR';
  }

  /**
   * Generate recommendation summary
   * @param {Object} stats - Horse stats
   * @param {Array} styleRatings - Rated styles
   * @returns {string} Summary text
   */
  generateRecommendationSummary(stats, styleRatings) {
    const best = styleRatings[0];
    let summary = `Based on your horse's stats, ${best.style.name} is the ${best.recommendation.toLowerCase()} choice. `;
    
    // Add specific advice based on stat strengths
    const maxStat = Object.entries(stats).reduce((max, [stat, value]) => 
      value > max.value ? { stat, value } : max, { stat: '', value: 0 });
    
    if (maxStat.stat === 'speed' && maxStat.value >= 70) {
      summary += 'High speed makes you suitable for front-running tactics.';
    } else if (maxStat.stat === 'stamina' && maxStat.value >= 75) {
      summary += 'Excellent stamina gives you closing kick potential.';
    } else if (maxStat.stat === 'power' && maxStat.value >= 70) {
      summary += 'Strong power enables tactical flexibility.';
    } else {
      summary += 'Continue training to improve style effectiveness.';
    }
    
    return summary;
  }

  /**
   * Validate racing style configuration
   * @returns {Object} Validation results  
   */
  validateStyles() {
    const errors = [];
    const warnings = [];
    
    Object.entries(this.styles).forEach(([id, style]) => {
      // Check energy usage totals to 100%
      const energyTotal = Object.values(style.energyUsage)
        .reduce((sum, usage) => sum + usage, 0);
      
      if (Math.abs(energyTotal - 1.0) > 0.01) {
        errors.push(`Style ${id} energy usage doesn't total 100% (${energyTotal * 100}%)`);
      }
      
      // Check stat requirements are reasonable
      Object.entries(style.statRequirements).forEach(([stat, req]) => {
        if (req > 100 || req < 0) {
          errors.push(`Style ${id} has invalid ${stat} requirement: ${req}`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = RacingStyle;