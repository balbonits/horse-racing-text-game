const Character = require('./Character');

class TrainingSystem {
  constructor() {
    this.trainingTypes = {
      speed: {
        name: 'Speed Training',
        energyCost: 15,
        primaryStat: 'speed',
        baseGain: 8,
        description: 'Intense sprinting drills to improve acceleration and top speed'
      },
      stamina: {
        name: 'Stamina Training', 
        energyCost: 10,
        primaryStat: 'stamina',
        baseGain: 10,
        description: 'Endurance running to build cardiovascular fitness'
      },
      power: {
        name: 'Power Training',
        energyCost: 15, 
        primaryStat: 'power',
        baseGain: 8,
        description: 'Strength training to improve muscle power and acceleration'
      },
      rest: {
        name: 'Rest Day',
        energyCost: -30,
        primaryStat: null,
        baseGain: 0,
        description: 'Take a break to recover energy and improve mood'
      },
      social: {
        name: 'Social Time',
        energyCost: 5,
        primaryStat: 'friendship',
        baseGain: 15,
        description: 'Spend time with supporters to build friendship bonds'
      }
    };
  }

  // Check if character can perform training
  canTrain(character, trainingType) {
    const training = this.trainingTypes[trainingType];
    if (!training) return { canTrain: false, reason: 'Invalid training type' };
    
    if (character.condition.energy < training.energyCost) {
      return { canTrain: false, reason: 'Not enough energy' };
    }
    
    if (!character.canContinue()) {
      return { canTrain: false, reason: 'Career has ended' };
    }
    
    return { canTrain: true };
  }

  // Perform training and return results
  performTraining(character, trainingType) {
    const training = this.trainingTypes[trainingType];
    const canTrainResult = this.canTrain(character, trainingType);
    
    if (!canTrainResult.canTrain) {
      return {
        success: false,
        reason: canTrainResult.reason
      };
    }

    const results = {
      success: true,
      trainingName: training.name,
      energyChange: -training.energyCost,
      statGains: {},
      friendshipGain: 0,
      messages: []
    };

    // Apply energy change first
    character.changeEnergy(-training.energyCost);
    results.energyChange = -training.energyCost;

    // Handle different training types
    switch (trainingType) {
      case 'speed':
      case 'stamina': 
      case 'power':
        const gain = character.increaseStat(training.primaryStat, training.baseGain);
        results.statGains[training.primaryStat] = gain;
        results.messages.push(`${training.primaryStat.toUpperCase()} increased by ${gain}!`);
        
        // Small chance for secondary stat gains
        this.addSecondaryGains(character, trainingType, results);
        break;

      case 'rest':
        // Rest restores energy and improves mood
        character.changeEnergy(30); // This is in addition to the -30 cost, so net +30
        results.energyChange = 30;
        results.messages.push('Feeling refreshed after a good rest!');
        
        // Small chance to recover a bit of health
        if (Math.random() < 0.3) {
          character.condition.health = Math.min(100, character.condition.health + 5);
          results.messages.push('Health improved slightly from relaxation.');
        }
        break;

      case 'social':
        const friendshipGain = this.calculateFriendshipGain(character, training.baseGain);
        character.increaseFriendship(friendshipGain);
        results.friendshipGain = friendshipGain;
        results.messages.push(`Friendship increased by ${friendshipGain}!`);
        
        // High friendship can give small stat bonuses
        if (character.friendship >= 80) {
          const bonusStat = this.getRandomStat();
          const bonus = character.increaseStat(bonusStat, 2);
          results.statGains[bonusStat] = bonus;
          results.messages.push(`Strong friendship gave bonus ${bonusStat.toUpperCase()} +${bonus}!`);
        }
        break;
    }

    // Random events during training
    this.processRandomEvents(character, trainingType, results);

    return results;
  }

  // Add secondary stat gains with small probability
  addSecondaryGains(character, primaryTrainingType, results) {
    const secondaryChance = 0.25; // 25% chance
    
    if (Math.random() < secondaryChance) {
      const stats = ['speed', 'stamina', 'power'];
      const availableStats = stats.filter(stat => stat !== primaryTrainingType);
      const secondaryStat = availableStats[Math.floor(Math.random() * availableStats.length)];
      
      const secondaryGain = character.increaseStat(secondaryStat, 2);
      results.statGains[secondaryStat] = (results.statGains[secondaryStat] || 0) + secondaryGain;
      results.messages.push(`Bonus ${secondaryStat.toUpperCase()} +${secondaryGain}!`);
    }
  }

  // Calculate friendship gain with mood modifiers
  calculateFriendshipGain(character, baseGain) {
    const moodMultiplier = character.getMoodMultiplier();
    const randomVariance = Math.random() * 0.4 + 0.8; // ±20% variance
    return Math.round(baseGain * moodMultiplier * randomVariance);
  }

  // Process random events during training
  processRandomEvents(character, trainingType, results) {
    const eventChance = 0.15; // 15% chance of random event
    
    if (Math.random() < eventChance) {
      const events = this.getRandomEvents(trainingType);
      const event = events[Math.floor(Math.random() * events.length)];
      
      // Apply event effects
      if (event.energyChange) {
        character.changeEnergy(event.energyChange);
        results.energyChange += event.energyChange;
      }
      
      if (event.statGain) {
        const gain = character.increaseStat(event.statGain.stat, event.statGain.amount);
        results.statGains[event.statGain.stat] = (results.statGains[event.statGain.stat] || 0) + gain;
      }
      
      results.messages.push(event.message);
    }
  }

  // Get random events for different training types
  getRandomEvents(trainingType) {
    const commonEvents = [
      { message: 'Perfect weather made training extra effective!', energyChange: 5 },
      { message: 'A small stumble, but quick recovery!', energyChange: -3 },
      { message: 'Feeling inspired by the beautiful scenery!', energyChange: 3 }
    ];

    const specificEvents = {
      speed: [
        { message: 'Lightning-fast finish to the sprint!', statGain: { stat: 'speed', amount: 3 } },
        { message: 'Perfect running form today!', energyChange: 2 }
      ],
      stamina: [
        { message: 'Found a perfect running rhythm!', statGain: { stat: 'stamina', amount: 3 } },
        { message: 'Breathing technique improved!', energyChange: 5 }
      ],
      power: [
        { message: 'Explosive power in that last set!', statGain: { stat: 'power', amount: 3 } },
        { message: 'Muscle memory is improving!', energyChange: 2 }
      ],
      social: [
        { message: 'Shared some great stories and laughs!', energyChange: 8 },
        { message: 'Made a deeper connection today!', energyChange: 5 }
      ]
    };

    return [...commonEvents, ...(specificEvents[trainingType] || [])];
  }

  // Get a random stat name
  getRandomStat() {
    const stats = ['speed', 'stamina', 'power'];
    return stats[Math.floor(Math.random() * stats.length)];
  }

  // Get training recommendations based on character state
  getTrainingRecommendations(character) {
    const recommendations = [];
    const stats = character.getCurrentStats();
    
    // Energy-based recommendations
    if (character.condition.energy < 30) {
      recommendations.push({
        type: 'rest',
        reason: 'Low energy - rest is highly recommended',
        priority: 'high'
      });
    }
    
    // Stat-based recommendations
    const lowestStat = Object.keys(stats).reduce((lowest, stat) => 
      stats[stat] < stats[lowest] ? stat : lowest
    );
    
    if (stats[lowestStat] < 50) {
      recommendations.push({
        type: lowestStat,
        reason: `${lowestStat} is your weakest stat`,
        priority: 'medium'
      });
    }
    
    // Friendship recommendations
    if (character.friendship < 60) {
      recommendations.push({
        type: 'social',
        reason: 'Building friendship will boost training gains',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  // Get all available training options with current effectiveness
  getTrainingOptions(character) {
    const options = {};
    
    Object.keys(this.trainingTypes).forEach(type => {
      const training = this.trainingTypes[type];
      const canTrainResult = this.canTrain(character, type);
      
      options[type] = {
        ...training,
        available: canTrainResult.canTrain,
        reason: canTrainResult.reason || null,
        effectiveness: this.calculateEffectiveness(character, type)
      };
    });
    
    return options;
  }

  // Calculate training effectiveness percentage
  calculateEffectiveness(character, trainingType) {
    const training = this.trainingTypes[trainingType];
    
    if (!training.primaryStat || training.primaryStat === 'friendship') {
      return 100; // Rest and social are always 100% effective
    }
    
    const growthMultiplier = character.getGrowthMultiplier(training.primaryStat);
    const moodMultiplier = character.getMoodMultiplier();
    const friendshipBonus = character.getFriendshipBonus();
    
    const totalMultiplier = growthMultiplier * moodMultiplier * friendshipBonus;
    return Math.round(totalMultiplier * 100);
  }
}

module.exports = TrainingSystem;