/**
 * Game Messages Collection
 * 
 * Centralized collection of all game messages, text, and copy.
 * This makes localization easier and keeps all user-facing text in one place.
 * 
 * Organization:
 * - errors: Error messages and validation failures
 * - success: Success and confirmation messages  
 * - ui: Interface labels and descriptions
 * - training: Training-related messages
 * - racing: Race-related messages
 * - character: Character creation and management
 * - specialization: Breed and style descriptions
 */

const GameMessages = {
  // ==================== ERROR MESSAGES ====================
  errors: {
    // General errors
    gameNotInitialized: 'Game engine not initialized',
    invalidInput: 'Invalid input provided',
    noActiveCharacter: 'No active character found',
    
    // Character creation errors
    nameRequired: 'Name must be 1-20 characters',
    nameInvalid: 'Name contains invalid characters',
    characterCreationFailed: 'Failed to create character',
    noSpecializedCharacter: 'No specialized character found',
    
    // Training errors
    insufficientEnergy: (required, current) => `❌ Not enough energy! You need ${required} energy but only have ${current}. Try Rest Day to recover energy.`,
    trainingFailed: (type) => `${type} training failed`,
    invalidTrainingType: 'Invalid training type selected',
    
    // Race errors
    raceNotAvailable: 'No race available at this time',
    invalidStrategy: 'Invalid racing strategy selected',
    raceSimulationFailed: 'Race simulation failed',
    
    // Save/Load errors
    saveGameFailed: 'Failed to save game',
    loadGameFailed: 'Failed to load game',
    invalidSaveSlot: 'Invalid save slot number',
    noSaveFiles: 'No save files found',
    
    // System errors
    initializationFailed: (reason) => `Initialization failed: ${reason}`,
    systemRequirement: (requirement) => `System requirement not met: ${requirement}`,
    unexpectedError: 'An unexpected error occurred'
  },

  // ==================== SUCCESS MESSAGES ====================
  success: {
    // General success
    gameInitialized: '✅ Game initialized successfully',
    operationComplete: 'Operation completed successfully',
    
    // Character creation
    characterCreated: (name) => `✅ ${name} created successfully!`,
    specializedCharacterCreated: (name, breed) => `✅ ${name} (${breed}) created successfully!`,
    
    // Training success
    trainingCompleted: (type) => `✅ ${type} training completed!`,
    energyRestored: (amount) => `✅ Energy restored by ${amount} points`,
    bondIncreased: (amount) => `✅ Bond increased by ${amount} points`,
    
    // Race success
    raceCompleted: (placement) => `🏁 Race completed! Placed ${placement}`,
    raceWon: '🏆 Congratulations! You won the race!',
    podiumFinish: (placement) => `🥉 Great job! Finished ${placement}`,
    
    // Save/Load success
    gameSaved: '💾 Game saved successfully!',
    gameLoaded: '📁 Game loaded successfully!',
    
    // Career milestones
    careerComplete: '🎉 Career completed!',
    newRecord: '📈 New personal record!',
    achievementUnlocked: (achievement) => `🏅 Achievement unlocked: ${achievement}`
  },

  // ==================== UI LABELS AND TEXT ====================
  ui: {
    // Main navigation
    mainMenu: 'MAIN MENU',
    characterCreation: 'CHARACTER CREATION',
    training: 'TRAINING',
    racing: 'RACING',
    careerComplete: 'CAREER COMPLETE',
    
    // Menu options
    startNewCareer: '1. Start New Career',
    tutorial: '2. Tutorial',
    loadGame: '3. Load Game',
    help: '4. Help',
    quit: 'Q - Quit Game',
    
    // Common actions
    pressEnterToContinue: 'Press ENTER to continue...',
    pressQToGoBack: 'Press Q to go back',
    invalidOption: 'Invalid option. Please try again.',
    
    // Stats display
    stats: 'STATS:',
    condition: 'CONDITION:',
    career: 'CAREER:',
    
    // Progress indicators
    turn: (current, max) => `Turn: ${current}/${max}`,
    racesWon: (won, total) => `Races Won: ${won}/${total}`,
    energy: (current, max) => `Energy: ${Math.round(current)}/${max}`,
    
    // Specialization UI
    breed: 'Breed:',
    racingStyle: 'Racing Style:',
    trainingRecommendations: 'Training Recommendations:',
    preferredConditions: 'Preferred Conditions:',
    
    // Loading and status
    loading: '⏳ Loading...',
    saving: '💾 Saving...',
    processing: '🔄 Processing...',
    
    // Headers and separators
    gameTitle: 'HORSE RACING TEXT GAME',
    separator: '==============================================='
  },

  // ==================== TRAINING MESSAGES ====================
  training: {
    // Training types
    types: {
      speed: 'Speed Training',
      stamina: 'Stamina Training', 
      power: 'Power Training',
      rest: 'Rest Day',
      media: 'Media Day'
    },
    
    // Training descriptions
    descriptions: {
      speed: 'Increases sprint performance and final kick ability',
      stamina: 'Improves race endurance and energy capacity',
      power: 'Enhances acceleration and tactical positioning',
      rest: 'Restores energy and improves form',
      media: 'Builds relationships and provides moderate energy recovery'
    },
    
    // Training costs/benefits
    costs: {
      speed: 15,
      stamina: 10,
      power: 15,
      rest: -30,  // Negative means it restores energy
      media: -15
    },
    
    // Training menu
    trainingOptions: 'TRAINING OPTIONS:',
    trainingMenu: [
      '1. Speed Training   (Cost: 15 energy)',
      '2. Stamina Training (Cost: 10 energy)', 
      '3. Power Training   (Cost: 15 energy)',
      '4. Rest Day         (Gain: 30 energy)',
      '5. Media Day        (Gain: 15 energy)',
      '',
      'Enter your choice (1-5), or S to save, Q to quit:'
    ].join('\n'),
    
    // Training results
    results: {
      excellent: 'Excellent training session!',
      good: 'Good training progress!',
      average: 'Average training session.',
      poor: 'Poor training - low energy or form affecting results.',
      failed: 'Training session failed.'
    },
    
    // Form-based messages
    formMessages: {
      excellent: 'Your horse is in peak condition!',
      good: 'Your horse is feeling confident.',
      normal: 'Your horse is in normal condition.',
      poor: 'Your horse seems tired.',
      terrible: 'Your horse is struggling and needs rest.'
    }
  },

  // ==================== RACING MESSAGES ====================
  racing: {
    // Race phases
    phases: {
      preview: 'RACE PREVIEW',
      lineup: 'HORSE LINEUP',
      strategy: 'RACE STRATEGY',
      running: 'RACE IN PROGRESS',
      results: 'RACE RESULTS',
      podium: 'VICTORY CEREMONY'
    },
    
    // Racing strategies
    strategies: {
      FRONT: {
        name: 'Front Runner',
        description: 'Lead from the start, high speed/power requirement'
      },
      MID: {
        name: 'Mid Pack',
        description: 'Balanced approach, stay in contention'  
      },
      LATE: {
        name: 'Late Closer',
        description: 'Save energy, strong finish, high stamina requirement'
      }
    },
    
    // Strategy selection
    strategyPrompt: [
      'Choose your racing strategy:',
      '',
      '1. Front Runner - Lead from the start, high speed/power requirement',
      '2. Mid Pack - Balanced approach, stay in contention',
      '3. Late Closer - Save energy, strong finish, high stamina requirement',
      '',
      'Enter your choice (1-3):'
    ].join('\n'),
    
    // Race commentary templates
    commentary: {
      start: [
        'They\'re off and running!',
        'The field breaks cleanly from the gate!',
        'A good start for all runners!'
      ],
      early: [
        '{leader} takes the early lead...',
        'Setting a strong pace in front is {leader}...',
        '{leader} shows the way in the early going...'
      ],
      middle: [
        '{leader} still leads as they approach the turn...',
        'The field bunches up as {challenger} makes a move...',
        '{leader} holds the advantage at the halfway point...'
      ],
      stretch: [
        'Into the stretch they come!',
        'Now they\'re in the drive to the wire!',
        'The real racing begins now!'
      ],
      finish: [
        '{winner} wins it!',
        'Victory goes to {winner}!',
        '{winner} crosses the line first!'
      ]
    },
    
    // Placement messages
    placementMessages: {
      1: '🏆 WINNER! Congratulations on a fantastic victory!',
      2: '🥈 Second place! A great effort, just missed the win.',
      3: '🥉 Third place! Good job earning a podium finish.',
      4: '4th place - Just off the podium but still a solid run.',
      5: '5th place - Room for improvement in future races.'
    },
    
    // Race information display
    raceInfo: {
      upcoming: '=== UPCOMING RACE ===',
      details: (race) => [
        `Race: ${race.name}`,
        `Turn: ${race.scheduledTurn}`,
        `Distance: ${race.distance}m`,
        `Surface: ${race.surface}`,
        `Type: ${race.type}`,
        `Turns until race: ${race.scheduledTurn - race.currentTurn || 0}`
      ].join('\n') + '\n====================='
    }
  },

  // ==================== CHARACTER CREATION ====================
  character: {
    // Creation prompts
    namePrompt: [
      'Enter your horse name and press ENTER,',
      'OR type "G" to generate name suggestions:',
      '',
      '(Type Q and press ENTER to go back to main menu)'
    ].join('\n'),
    
    nameOptionsPrompt: (options) => [
      'Generated name suggestions:',
      '',
      ...options.map((name, index) => `${index + 1}. ${name}`),
      '',
      'Enter a number (1-6) to select a name,',
      'OR type your own horse name and press ENTER,',
      'OR type "G" to generate new names:',
      '',
      '(Type Q and press ENTER to go back to main menu)'
    ].join('\n'),
    
    // Validation messages
    validation: {
      nameTooShort: 'Name must be at least 1 character',
      nameTooLong: 'Name must be 20 characters or less',
      nameInvalidChars: 'Name can only contain letters, numbers, spaces, apostrophes, and hyphens',
      nameRequired: 'Please enter a horse name first'
    },
    
    // Stats display for character creation
    statsHeader: 'Starting Stats:',
    statsDisplay: (stats) => [
      `Speed:   ${stats.speed}/100`,
      `Stamina: ${stats.stamina}/100`, 
      `Power:   ${stats.power}/100`
    ].join('\n')
  },

  // ==================== SPECIALIZATION SYSTEM ====================
  specialization: {
    // Breed selection
    breedSelection: {
      header: 'BREED SELECTION',
      prompt: 'Choose your horse breed (affects stats and training efficiency):',
      random: 'R - Random breed',
      recommendations: 'Based on your preferences:'
    },
    
    // Racing style selection  
    styleSelection: {
      header: 'RACING STYLE SELECTION',
      prompt: 'Choose your preferred racing style:',
      recommendations: 'Recommended for your stats:'
    },
    
    // Specialization display
    breedInfo: (breed) => [
      `Breed: ${breed.name} (${breed.rarity})`,
      breed.description,
      '',
      'Characteristics:',
      ...breed.characteristics.map(char => `• ${char}`)
    ].join('\n'),
    
    styleInfo: (style) => [
      `Racing Style: ${style.name}`,
      style.description,
      '',
      'Advantages:',
      ...style.advantages.map(adv => `+ ${adv}`),
      '',
      'Risks:',
      ...style.risks.map(risk => `- ${risk}`)
    ].join('\n'),
    
    // Training advice
    trainingAdvice: {
      focus: (types) => `Focus on: ${types.join(', ')} training`,
      avoid: (types) => `Avoid: ${types.join(', ')} training`,
      strategies: (strats) => `Preferred strategies: ${strats.join(', ')}`,
      general: 'Continue balanced training to develop your horse\'s potential.'
    }
  },

  // ==================== HELP SYSTEM ====================
  help: {
    // General help
    header: '=== GAME HELP ===',
    
    // Controls section
    controls: {
      header: 'CONTROLS:',
      list: [
        '- Numbers (1-5): Select menu options and training',
        '- G: Generate name suggestions (character creation)',
        '- S: Save game (during training)',
        '- Q: Quit/Go back', 
        '- ENTER: Continue/Confirm'
      ]
    },
    
    // Training help
    trainingHelp: {
      header: 'TRAINING TYPES:',
      list: [
        '- Speed Training: Increases sprint performance',
        '- Stamina Training: Increases race endurance',
        '- Power Training: Increases acceleration', 
        '- Rest Day: Recovers energy',
        '- Media Day: Builds relationships, partial energy recovery'
      ]
    },
    
    // Stats explanation
    statsHelp: {
      header: 'STATS:',
      list: [
        '- Speed (1-100): Final sprint performance',
        '- Stamina (1-100): Race endurance and "HP pool"',
        '- Power (1-100): Acceleration ability'
      ]
    },
    
    // Energy system
    energyHelp: {
      header: 'ENERGY SYSTEM:',
      list: [
        '- Maximum 100 energy',
        '- Training costs 10-20 energy',
        '- Rest Day restores 30 energy', 
        '- Media Day restores 15 energy'
      ]
    }
  },

  // ==================== SYSTEM MESSAGES ====================
  system: {
    // Startup messages
    startup: {
      welcome: 'Welcome to Horse Racing Text Game!',
      version: (version) => `Version ${version}`,
      initializing: '🚀 Initializing game systems...',
      ready: '✅ Game ready! Have fun!'
    },
    
    // Shutdown messages
    shutdown: {
      cleanup: '🧹 Cleaning up resources...',
      goodbye: '✅ Goodbye! Thanks for playing!',
      interrupt: '🛑 Received interrupt signal...',
      terminate: '🛑 Received terminate signal...'
    },
    
    // Debug messages
    debug: {
      enabled: '🔧 Debug mode enabled',
      systemInfo: '📊 System Info:',
      eventFired: (event) => `🔥 Event fired: ${event}`,
      stateChange: (from, to) => `🔄 State: ${from} → ${to}`
    }
  }
};

module.exports = GameMessages;