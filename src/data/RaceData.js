/**
 * Race Data Collection
 * 
 * Centralized collection of race names, templates, and race-specific data.
 * This supports the enhanced race system with dynamic names and authentic
 * horse racing terminology.
 */

const RaceData = {
  // ==================== RACE NAME COMPONENTS ====================
  
  // Prestigious race name prefixes
  prefixes: [
    // Classic/Traditional
    'Classic', 'Royal', 'Imperial', 'Crown', 'Golden', 'Silver', 'Diamond', 'Platinum',
    'Premier', 'Champion', 'Supreme', 'Elite', 'Grand', 'Great', 'Noble', 'Majestic',
    
    // Geographic/Cultural
    'Metropolitan', 'International', 'Continental', 'National', 'Regional', 'City',
    'Valley', 'Ridge', 'Summit', 'Harbor', 'Bay', 'River', 'Mountain', 'Prairie',
    
    // Historical/Legendary
    'Heritage', 'Legacy', 'Tradition', 'Memorial', 'Founders', 'Pioneer', 'Victory',
    'Liberty', 'Independence', 'Centennial', 'Millennium', 'Anniversary',
    
    // Seasonal/Temporal
    'Spring', 'Summer', 'Autumn', 'Winter', 'Dawn', 'Sunset', 'Twilight', 'Midnight',
    'New Year', 'Midsummer', 'Harvest', 'Solstice'
  ],

  // Race name suffixes (race types)
  suffixes: [
    // Classic race types
    'Stakes', 'Derby', 'Cup', 'Trophy', 'Championship', 'Classic', 'Handicap',
    'Invitational', 'Open', 'Memorial', 'Challenge', 'Series', 'Grand Prix',
    
    // Formal designations
    'Stakes Race', 'Feature Race', 'Main Event', 'Finale', 'Special', 'Showcase',
    'Gala', 'Festival', 'Celebration', 'Spectacular', 'Exhibition',
    
    // Achievement-focused
    'Winners Circle', 'Hall of Fame', 'Legend', 'Icon', 'Milestone', 'Record',
    'Breakthrough', 'Triumph', 'Glory', 'Honor'
  ],

  // ==================== RACE TEMPLATES BY TYPE ====================
  
  templates: {
    // Maiden races (first-time winners only)
    maiden: [
      '{prefix} Maiden Stakes',
      'Maiden {suffix}', 
      '{prefix} Debut Stakes',
      'First Time {suffix}',
      'Newcomer {suffix}',
      'Rising Star Stakes'
    ],
    
    // Allowance races (mid-tier)
    allowance: [
      '{prefix} Allowance',
      '{prefix} {suffix}',
      '{prefix} Stakes',
      'Open {suffix}',
      '{prefix} Challenge',
      '{prefix} Invitational'
    ],
    
    // Stakes races (high-tier)  
    stakes: [
      '{prefix} Stakes',
      '{prefix} {suffix}',
      '{prefix} Classic',
      '{prefix} Championship',
      'Grade II {prefix} Stakes',
      '{prefix} Feature'
    ],
    
    // Grade 1 races (top-tier)
    grade1: [
      'Grade I {prefix} Stakes',
      '{prefix} Derby',
      '{prefix} Cup',
      '{prefix} Championship',
      '{prefix} Classic',
      '{prefix} Grand Prix'
    ]
  },

  // ==================== THEMED RACE COLLECTIONS ====================
  
  themes: {
    // Speed-focused themes
    speed: {
      prefixes: ['Lightning', 'Thunder', 'Flash', 'Bolt', 'Rocket', 'Blazing', 'Swift'],
      suffixes: ['Sprint', 'Dash', 'Rush', 'Blitz', 'Express', 'Velocity', 'Acceleration']
    },
    
    // Stamina-focused themes  
    endurance: {
      prefixes: ['Marathon', 'Endurance', 'Distance', 'Stamina', 'Persistence', 'Fortitude'],
      suffixes: ['Challenge', 'Test', 'Trial', 'Journey', 'Quest', 'Odyssey', 'Marathon']
    },
    
    // Power-focused themes
    power: {
      prefixes: ['Power', 'Strength', 'Mighty', 'Force', 'Impact', 'Dynamic', 'Explosive'],
      suffixes: ['Showcase', 'Display', 'Exhibition', 'Demonstration', 'Performance', 'Show']
    },
    
    // Seasonal themes
    seasonal: {
      spring: {
        prefixes: ['Spring', 'Renewal', 'Bloom', 'Fresh', 'New', 'Dawn', 'Rising'],
        suffixes: ['Festival', 'Celebration', 'Classic', 'Stakes', 'Opening']
      },
      summer: {
        prefixes: ['Summer', 'Heat', 'Sun', 'Bright', 'Glory', 'Peak', 'High'],
        suffixes: ['Championship', 'Classic', 'Festival', 'Spectacular', 'Gala']
      },
      autumn: {
        prefixes: ['Autumn', 'Harvest', 'Gold', 'Amber', 'Rich', 'Mature', 'Prime'],
        suffixes: ['Classic', 'Stakes', 'Trophy', 'Championship', 'Finale']
      },
      winter: {
        prefixes: ['Winter', 'Crystal', 'Ice', 'Diamond', 'Pure', 'Crisp', 'Sharp'],
        suffixes: ['Classic', 'Stakes', 'Challenge', 'Trophy', 'Cup']
      }
    }
  },

  // ==================== SPECIFIC RACE CONFIGURATIONS ====================
  
  // Career race progression (4 races)
  careerRaces: [
    {
      turn: 4,
      type: 'maiden',
      distance: 1200,
      surface: 'DIRT',
      raceType: 'SPRINT',
      prizePool: 5000,
      fieldSize: 8,
      description: 'Your first race - prove you belong on the track'
    },
    {
      turn: 9, 
      type: 'allowance',
      distance: 1600,
      surface: 'DIRT', 
      raceType: 'MILE',
      prizePool: 10000,
      fieldSize: 10,
      description: 'Step up in class against more experienced competition'
    },
    {
      turn: 15,
      type: 'stakes',
      distance: 2000,
      surface: 'TURF',
      raceType: 'MEDIUM', 
      prizePool: 20000,
      fieldSize: 12,
      description: 'High stakes racing with serious prize money'
    },
    {
      turn: 24,
      type: 'grade1',
      distance: 2400,
      surface: 'TURF',
      raceType: 'LONG',
      prizePool: 50000,
      fieldSize: 14,
      description: 'The ultimate test - championship level competition'
    }
  ],

  // ==================== RACE CONDITIONS & MODIFIERS ====================
  
  conditions: {
    // Track conditions
    track: {
      DIRT: {
        fast: { description: 'Fast - Ideal conditions', modifier: 1.0 },
        good: { description: 'Good - Slightly slower', modifier: 0.98 },
        muddy: { description: 'Muddy - Challenging footing', modifier: 0.95 },
        sloppy: { description: 'Sloppy - Difficult conditions', modifier: 0.92 }
      },
      TURF: {
        firm: { description: 'Firm - Perfect turf conditions', modifier: 1.0 },
        good: { description: 'Good - Slightly soft turf', modifier: 0.98 },
        yielding: { description: 'Yielding - Soft turf', modifier: 0.96 },
        soft: { description: 'Soft - Very soft turf', modifier: 0.94 }
      }
    },
    
    // Weather effects (future feature)
    weather: {
      clear: { description: 'Clear skies', modifier: 1.0 },
      cloudy: { description: 'Overcast conditions', modifier: 0.99 },
      windy: { description: 'Windy conditions', modifier: 0.97 },
      rainy: { description: 'Rain affecting track', modifier: 0.95 }
    }
  },

  // ==================== RACE COMMENTARY TEMPLATES ====================
  
  commentary: {
    // Pre-race setup
    preRace: [
      'The field is loading into the starting gate...',
      'Horses are circling behind the gate...',
      'Final preparations being made...',
      'The crowd settles in anticipation...',
      'Track officials making final checks...'
    ],
    
    // Race start
    start: [
      'They\'re off and running!',
      'A clean break from the gate!',
      'The field gets away smoothly!',
      'And they\'re racing!',
      'The race is underway!'
    ],
    
    // Early pace descriptions  
    earlyPace: [
      '{leader} jumps out to the early lead...',
      '{leader} shows good early speed...',
      'It\'s {leader} setting the pace...',
      '{leader} takes command early...',
      '{leader} breaks alertly and leads...'
    ],
    
    // Mid-race positioning
    midRace: [
      '{leader} continues to lead as they approach the turn...',
      'The field tightens up behind {leader}...',
      '{challenger} moves up to challenge {leader}...',
      'Positions remain fairly stable through the middle stages...',
      '{leader} holds a clear advantage at the halfway point...'
    ],
    
    // Stretch run
    stretch: [
      'Into the stretch they come!',
      'Now they turn for home!',
      'The real racing begins now!',
      'Here comes the drive to the wire!',
      'The stretch run is on!'
    ],
    
    // Close finish
    closeFinish: [
      'It\'s very close at the wire!',
      'A thrilling finish!',
      'They\'re locked together!',
      'Photo finish coming up!',
      'Too close to call!'
    ],
    
    // Dominant win
    dominantWin: [
      '{winner} pulls away impressively!',
      '{winner} wins going away!',
      'A commanding victory for {winner}!',
      '{winner} makes it look easy!',
      'Daylight between {winner} and the field!'
    ],
    
    // Upset win
    upsetWin: [
      'What an upset! {winner} comes from nowhere!',
      'A shocking victory for {winner}!',
      '{winner} springs a major surprise!',
      'Long shot {winner} gets up to win!',
      'Against all odds, {winner} prevails!'
    ]
  },

  // ==================== ACHIEVEMENT RACE NAMES ====================
  
  achievementRaces: {
    // Special races unlocked by achievements
    perfectRecord: 'Undefeated Champion Stakes',
    speedSpecialist: 'Lightning Bolt Sprint',
    staminaExpert: 'Endurance Master Marathon', 
    powerHouse: 'Explosive Power Showcase',
    bondMaster: 'Friendship Cup',
    trainingExpert: 'Preparation Stakes'
  },

  // ==================== HISTORICAL RACE REFERENCES ====================
  
  historical: {
    // References to famous real races (for inspiration)
    legendary: [
      'Triple Crown', 'Kentucky Derby', 'Preakness', 'Belmont Stakes',
      'Breeders Cup', 'Dubai World Cup', 'Prix de l\'Arc de Triomphe',
      'Melbourne Cup', 'Grand National', 'Royal Ascot'
    ],
    
    // Classic distance references
    distances: {
      'Derby Distance': 2000,  // Classic derby distance
      'Mile Championship': 1600,  // Standard mile
      'Sprint Championship': 1200,  // Standard sprint
      'Stayers Cup': 2400  // Long distance championship
    }
  }
};

module.exports = RaceData;