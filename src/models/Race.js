const Character = require('./Character');

class RaceSimulator {
  constructor() {
    this.raceTypes = {
      sprint: {
        name: 'Sprint Race',
        distance: 1200,
        surface: 'turf',
        statWeights: { speed: 0.5, stamina: 0.2, power: 0.3 },
        baseTime: 72.0, // seconds
        description: 'Short distance race emphasizing speed and acceleration'
      },
      mile: {
        name: 'Mile Race', 
        distance: 1600,
        surface: 'turf',
        statWeights: { speed: 0.4, stamina: 0.4, power: 0.2 },
        baseTime: 96.0,
        description: 'Classic distance requiring balanced speed and stamina'
      },
      long: {
        name: 'Long Distance',
        distance: 2000, 
        surface: 'turf',
        statWeights: { speed: 0.3, stamina: 0.5, power: 0.2 },
        baseTime: 120.0,
        description: 'Endurance race where stamina is most important'
      },
      dirt_sprint: {
        name: 'Dirt Sprint',
        distance: 1200,
        surface: 'dirt',
        statWeights: { speed: 0.4, stamina: 0.3, power: 0.3 },
        baseTime: 74.0,
        description: 'Sprint on dirt track requiring more power'
      }
    };

    this.trackConditions = {
      firm: { name: 'Firm', modifier: 1.0, description: 'Perfect racing conditions' },
      good: { name: 'Good', modifier: 0.98, description: 'Slightly soft but good for racing' },
      soft: { name: 'Soft', modifier: 0.95, description: 'Soft ground, slower times' },
      heavy: { name: 'Heavy', modifier: 0.90, description: 'Wet and muddy, very challenging' }
    };
  }

  // Calculate race performance for a character
  calculatePerformance(character, raceType, trackCondition = 'firm') {
    const race = this.raceTypes[raceType];
    const condition = this.trackConditions[trackCondition];
    
    if (!race || !condition) {
      throw new Error('Invalid race type or track condition');
    }

    const stats = character.getCurrentStats();
    
    // Base performance calculation using weighted stats
    const weightedStats = 
      (stats.speed * race.statWeights.speed) +
      (stats.stamina * race.statWeights.stamina) + 
      (stats.power * race.statWeights.power);

    // Stamina factor - how much stamina affects final performance
    const currentStamina = character.condition.energy; // Use energy as current stamina
    const staminaFactor = Math.max(0.3, currentStamina / 100); // Never below 30%

    // Mood affects performance 
    const moodMultiplier = character.getMoodMultiplier();

    // Surface preference (could be expanded later)
    const surfaceBonus = this.getSurfaceBonus(character, race.surface);

    // Calculate base performance score (0-100 scale)
    const basePerformance = weightedStats * staminaFactor * moodMultiplier * surfaceBonus;

    // Apply track condition modifier
    const adjustedPerformance = basePerformance * condition.modifier;

    // Add random variance (±15% for excitement)
    const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
    const finalPerformance = adjustedPerformance * randomFactor;

    // Convert to race time
    const timeReduction = (finalPerformance / 100) * (race.baseTime * 0.3); // Up to 30% improvement
    const finalTime = race.baseTime - timeReduction;

    return {
      performance: Math.round(finalPerformance * 100) / 100,
      time: Math.round(finalTime * 100) / 100,
      baseTime: race.baseTime,
      staminaFactor: Math.round(staminaFactor * 100) / 100,
      moodMultiplier: Math.round(moodMultiplier * 100) / 100,
      randomFactor: Math.round(randomFactor * 100) / 100,
      trackCondition: condition.name
    };
  }

  // Get surface bonus (placeholder for future expansion)
  getSurfaceBonus(character, surface) {
    // Could add surface preferences to characters later
    return 1.0;
  }

  // Simulate a race with multiple competitors
  simulateRace(participants, raceType, trackCondition = 'firm') {
    const race = this.raceTypes[raceType];
    const results = [];

    // Calculate performance for each participant
    participants.forEach((participant, index) => {
      const performance = this.calculatePerformance(participant.character, raceType, trackCondition);
      
      results.push({
        position: 0, // Will be set after sorting
        participant: participant,
        performance: performance,
        character: participant.character.getSummary()
      });
    });

    // Sort by performance (higher is better, lower time is better)
    results.sort((a, b) => b.performance.performance - a.performance.performance);

    // Assign positions
    results.forEach((result, index) => {
      result.position = index + 1;
    });

    // Generate race commentary
    const commentary = this.generateRaceCommentary(results, race, trackCondition);

    return {
      raceType: race.name,
      distance: race.distance,
      surface: race.surface,
      trackCondition: trackCondition,
      results: results,
      commentary: commentary,
      winner: results[0],
      playerResult: results.find(r => r.participant.isPlayer) || null
    };
  }

  // Generate exciting race commentary
  generateRaceCommentary(results, race, trackCondition) {
    const commentary = [];
    const winner = results[0];
    const player = results.find(r => r.participant.isPlayer);
    
    // Race start
    commentary.push(`🏁 The ${race.name} (${race.distance}m) begins under ${trackCondition} conditions!`);
    
    // Mid-race drama
    if (results.length > 1) {
      const timeDiff = Math.abs(results[0].performance.time - results[1].performance.time);
      if (timeDiff < 0.5) {
        commentary.push('🔥 It\'s incredibly close! Neck and neck down the stretch!');
      } else if (timeDiff < 1.0) {
        commentary.push('⚡ A fierce battle for the lead!');
      } else {
        commentary.push(`🏃‍♂️ ${winner.character.name} takes commanding lead!`);
      }
    }

    // Performance highlights
    if (winner.performance.performance > 80) {
      commentary.push('💫 What an exceptional performance!');
    } else if (winner.performance.performance > 70) {
      commentary.push('👏 A solid racing display!');
    }

    // Track condition effects
    if (trackCondition === 'heavy') {
      commentary.push('🌧️ The heavy track conditions made this especially challenging!');
    } else if (trackCondition === 'firm') {
      commentary.push('☀️ Perfect racing conditions brought out the best!');
    }

    // Winner announcement
    commentary.push(`🏆 ${winner.character.name} wins in ${winner.performance.time}s!`);

    // Player-specific commentary
    if (player) {
      if (player.position === 1) {
        commentary.push('🎉 Congratulations on your victory!');
      } else if (player.position <= 3) {
        commentary.push(`🥉 A respectable ${this.getOrdinal(player.position)} place finish!`);
      } else {
        commentary.push(`📈 Room for improvement - finished ${this.getOrdinal(player.position)}.`);
      }
    }

    return commentary;
  }

  // Convert number to ordinal (1st, 2nd, 3rd, etc.)
  getOrdinal(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const mod100 = num % 100;
    return num + (suffixes[(mod100 - 20) % 10] || suffixes[mod100] || suffixes[0]);
  }

  // Create AI competitors for single player races
  createAICompetitors(count = 7, playerLevel = 50) {
    const competitors = [];
    const names = [
      'Thunder Bolt', 'Lightning Flash', 'Storm Chaser', 'Wind Runner',
      'Fire Spirit', 'Ocean Breeze', 'Mountain Peak', 'Star Dancer',
      'Diamond Dust', 'Golden Arrow', 'Silver Moon', 'Crimson Sky'
    ];

    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`;
      
      // Create AI horses with stats roughly matching player level ±20
      const variance = 20;
      const baseStats = playerLevel + (Math.random() - 0.5) * variance;
      
      const character = new Character(name, {
        speed: Math.max(1, Math.min(100, baseStats + (Math.random() - 0.5) * 10)),
        stamina: Math.max(1, Math.min(100, baseStats + (Math.random() - 0.5) * 10)),
        power: Math.max(1, Math.min(100, baseStats + (Math.random() - 0.5) * 10))
      });

      competitors.push({
        character: character,
        isPlayer: false,
        isAI: true
      });
    }

    return competitors;
  }

  // Get race schedule for career mode
  getCareerRaceSchedule() {
    return [
      {
        turn: 4,
        raceType: 'sprint',
        name: 'Maiden Sprint',
        description: 'Your first race - a good introduction to competition'
      },
      {
        turn: 8, 
        raceType: 'mile',
        name: 'Classic Mile',
        description: 'The traditional test of speed and stamina'
      },
      {
        turn: 12,
        raceType: 'long',
        name: 'Season Finale', 
        description: 'The ultimate endurance challenge to crown the champion'
      }
    ];
  }

  // Process race results for character development
  processRaceResults(character, raceResult) {
    const effects = {
      experienceGained: 0,
      moodChange: '',
      energyChange: 0,
      friendshipChange: 0,
      messages: []
    };

    const position = raceResult.playerResult.position;
    
    // Experience and mood based on position
    if (position === 1) {
      effects.experienceGained = 15;
      effects.moodChange = 'great';
      effects.friendshipChange = 5;
      effects.messages.push('🏆 Victory fills everyone with joy!');
    } else if (position <= 3) {
      effects.experienceGained = 10;
      effects.moodChange = 'good';
      effects.friendshipChange = 3;
      effects.messages.push('🥉 A solid podium finish!');
    } else if (position <= 6) {
      effects.experienceGained = 5;
      effects.friendshipChange = 1;
      effects.messages.push('📈 Valuable racing experience gained.');
    } else {
      effects.experienceGained = 3;
      effects.energyChange = -5;
      effects.messages.push('😔 Disappointing result, but learned from it.');
    }

    // Apply effects to character
    character.condition.mood = effects.moodChange || character.condition.mood;
    character.changeEnergy(effects.energyChange);
    character.increaseFriendship(effects.friendshipChange);
    
    // Update career stats
    character.career.racesRun++;
    if (position === 1) {
      character.career.racesWon++;
    }

    return effects;
  }

  // Get race analysis for training recommendations
  analyzeRacePerformance(raceResult) {
    const playerResult = raceResult.playerResult;
    const performance = playerResult.performance;
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    // Analyze performance factors
    if (performance.staminaFactor < 0.7) {
      analysis.weaknesses.push('Low energy affected performance significantly');
      analysis.recommendations.push('Focus on stamina training and rest management');
    }

    if (performance.moodMultiplier < 1.0) {
      analysis.weaknesses.push('Mood was not optimal for racing');
      analysis.recommendations.push('Improve mood through rest and social activities');
    }

    if (playerResult.position <= 3) {
      analysis.strengths.push('Strong competitive performance');
    }

    if (performance.performance > 75) {
      analysis.strengths.push('Excellent racing form displayed');
    }

    return analysis;
  }
}

module.exports = RaceSimulator;