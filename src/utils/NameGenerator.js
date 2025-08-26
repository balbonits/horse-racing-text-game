/**
 * Racehorse Name Generator
 * Generates realistic racehorse names based on actual Thoroughbred naming conventions
 */

class NameGenerator {
  constructor() {
    // Common prefixes and suffixes used in racehorse names
    this.prefixes = [
      'Thunder', 'Lightning', 'Storm', 'Wind', 'Fire', 'Ice', 'Shadow', 'Light',
      'Golden', 'Silver', 'Crimson', 'Azure', 'Jade', 'Ruby', 'Diamond', 'Star',
      'Wild', 'Noble', 'Brave', 'Swift', 'Mighty', 'Royal', 'Dancing', 'Flying',
      'Secret', 'Hidden', 'Mystic', 'Ancient', 'Bold', 'Proud', 'Raging', 'Silent',
      'Blazing', 'Shining', 'Rising', 'Soaring', 'Galloping', 'Racing', 'Winning', 'Victory'
    ];

    this.suffixes = [
      'Strike', 'Bolt', 'Dash', 'Arrow', 'Blade', 'Wing', 'Heart', 'Soul',
      'Runner', 'Racer', 'Champion', 'Legend', 'Spirit', 'Dream', 'Hope', 'Glory',
      'Knight', 'Prince', 'King', 'Queen', 'Star', 'Moon', 'Sun', 'Dawn',
      'Storm', 'Wind', 'Fire', 'Ice', 'Thunder', 'Lightning', 'Shadow', 'Light',
      'Victory', 'Triumph', 'Success', 'Honor', 'Pride', 'Glory', 'Fame', 'Power'
    ];

    // Descriptive words commonly used in racehorse names
    this.descriptors = [
      'Magnificent', 'Spectacular', 'Incredible', 'Fantastic', 'Amazing', 'Brilliant',
      'Elegant', 'Graceful', 'Beautiful', 'Stunning', 'Gorgeous', 'Radiant',
      'Powerful', 'Mighty', 'Strong', 'Bold', 'Brave', 'Fearless',
      'Swift', 'Fast', 'Quick', 'Rapid', 'Speedy', 'Fleet',
      'Royal', 'Noble', 'Regal', 'Majestic', 'Imperial', 'Distinguished',
      'Lucky', 'Blessed', 'Fortune', 'Destiny', 'Magic', 'Mystic'
    ];

    // Single word names (often location or concept based)
    this.singleWords = [
      'Secretariat', 'Seabiscuit', 'Affirmed', 'Alydar', 'Citation', 'Whirlaway',
      'Eclipse', 'Pharaoh', 'Justify', 'Authentic', 'Medina', 'Barbaro',
      'Smarty', 'Funny', 'California', 'Kentucky', 'Dubai', 'Seattle',
      'Phoenix', 'Denver', 'Austin', 'Boston', 'Miami', 'Vegas',
      'Thunder', 'Lightning', 'Hurricane', 'Tornado', 'Cyclone', 'Tempest',
      'Blizzard', 'Avalanche', 'Tsunami', 'Volcano', 'Earthquake', 'Meteor'
    ];

    // Playful/Creative names (modern trend)
    this.playfulNames = [
      'My Wife Knows Everything', 'The Wife Doesn\'t Know', 'Notacatbutallama',
      'Gas Station Sushi', 'Fluffy Socks', '50 Shades of Hay', 'Hoof Hearted',
      'Arrr', 'I\'ll Have Another', 'Dude Where\'s My Horse', 'Here Comes Trouble',
      'Are You Kidding Me', 'What A Surprise', 'Just Kidding', 'No Big Deal',
      'Easy Does It', 'Take It Easy', 'Piece of Cake', 'Walk in the Park'
    ];

    // Common racing/speed related terms
    this.racingTerms = [
      'Furlong', 'Derby', 'Stakes', 'Classic', 'Trophy', 'Cup', 'Prize',
      'Track', 'Course', 'Field', 'Gate', 'Post', 'Wire', 'Finish',
      'Victory', 'Triumph', 'Win', 'Place', 'Show', 'Leader', 'Champion',
      'Record', 'Time', 'Speed', 'Pace', 'Stretch', 'Homestretch', 'Final'
    ];

    // Color-based names
    this.colors = [
      'Crimson', 'Scarlet', 'Ruby', 'Cherry', 'Rose', 'Pink',
      'Orange', 'Amber', 'Gold', 'Yellow', 'Lemon', 'Cream',
      'Green', 'Emerald', 'Jade', 'Mint', 'Forest', 'Sage',
      'Blue', 'Azure', 'Navy', 'Teal', 'Cyan', 'Sky',
      'Purple', 'Violet', 'Lavender', 'Plum', 'Indigo', 'Magenta',
      'Black', 'Ebony', 'Onyx', 'Coal', 'Midnight', 'Shadow',
      'White', 'Pearl', 'Ivory', 'Snow', 'Silver', 'Platinum'
    ];
  }

  /**
   * Generate a random racehorse name using various naming patterns
   */
  generateName() {
    const patterns = [
      'prefix_suffix',      // Thunder Strike
      'descriptor_noun',    // Magnificent Runner
      'color_noun',         // Crimson Lightning
      'single_word',        // Secretariat
      'playful',            // My Wife Knows Everything
      'racing_term',        // Victory Stakes
      'compound',           // Thunderbolt Champion
      'alliterative',       // Silver Shadow
      'possessive',         // Thunder's Pride
      'location_based'      // Kentucky Storm
    ];

    const pattern = this.randomChoice(patterns);
    let name = '';

    switch (pattern) {
      case 'prefix_suffix':
        name = `${this.randomChoice(this.prefixes)} ${this.randomChoice(this.suffixes)}`;
        break;
        
      case 'descriptor_noun':
        name = `${this.randomChoice(this.descriptors)} ${this.randomChoice(this.suffixes)}`;
        break;
        
      case 'color_noun':
        name = `${this.randomChoice(this.colors)} ${this.randomChoice(this.suffixes)}`;
        break;
        
      case 'single_word':
        name = this.randomChoice(this.singleWords);
        break;
        
      case 'playful':
        name = this.randomChoice(this.playfulNames);
        break;
        
      case 'racing_term':
        name = `${this.randomChoice(this.prefixes)} ${this.randomChoice(this.racingTerms)}`;
        break;
        
      case 'compound':
        const first = this.randomChoice(this.prefixes);
        const second = this.randomChoice(this.suffixes);
        const third = this.randomChoice(this.racingTerms);
        name = `${first}${second.toLowerCase()} ${third}`;
        break;
        
      case 'alliterative':
        const letter = this.randomChoice(['S', 'T', 'G', 'B', 'F', 'M', 'R', 'C']);
        const alliterativeWords = [...this.prefixes, ...this.suffixes, ...this.colors]
          .filter(word => word.startsWith(letter));
        if (alliterativeWords.length >= 2) {
          name = `${this.randomChoice(alliterativeWords)} ${this.randomChoice(alliterativeWords)}`;
        } else {
          name = `${this.randomChoice(this.prefixes)} ${this.randomChoice(this.suffixes)}`;
        }
        break;
        
      case 'possessive':
        name = `${this.randomChoice(this.prefixes)}'s ${this.randomChoice(this.suffixes)}`;
        break;
        
      case 'location_based':
        const locations = ['Kentucky', 'California', 'Dubai', 'Irish', 'English', 'American', 'Canadian'];
        name = `${this.randomChoice(locations)} ${this.randomChoice(this.suffixes)}`;
        break;
        
      default:
        name = `${this.randomChoice(this.prefixes)} ${this.randomChoice(this.suffixes)}`;
    }

    // Ensure name doesn't exceed 18 character limit (Jockey Club rule)
    if (name.length > 18) {
      // Try a shorter pattern
      name = `${this.randomChoice(this.prefixes)} ${this.randomChoice(['Bolt', 'Star', 'Fire', 'Wind', 'King', 'Dawn'])}`;
      if (name.length > 18) {
        name = this.randomChoice(['Thunder', 'Lightning', 'Storm', 'Fire', 'Star', 'Wind', 'Shadow', 'Light']);
      }
    }

    return name;
  }

  /**
   * Generate a name with specific characteristics
   */
  generateNameByStyle(style = 'classic') {
    switch (style) {
      case 'classic':
        return `${this.randomChoice(this.prefixes)} ${this.randomChoice(this.suffixes)}`;
        
      case 'modern':
        return this.randomChoice(this.playfulNames);
        
      case 'powerful':
        const powerWords = ['Thunder', 'Lightning', 'Storm', 'Mighty', 'Bold', 'Strong'];
        return `${this.randomChoice(powerWords)} ${this.randomChoice(this.suffixes)}`;
        
      case 'elegant':
        const elegantWords = ['Elegant', 'Graceful', 'Beautiful', 'Radiant', 'Royal', 'Noble'];
        return `${this.randomChoice(elegantWords)} ${this.randomChoice(this.suffixes)}`;
        
      case 'speed':
        const speedWords = ['Swift', 'Fast', 'Quick', 'Rapid', 'Fleet', 'Lightning'];
        return `${this.randomChoice(speedWords)} ${this.randomChoice(this.suffixes)}`;
        
      default:
        return this.generateName();
    }
  }

  /**
   * Generate multiple name options
   */
  generateNameOptions(count = 6) {
    const names = new Set();
    while (names.size < count) {
      names.add(this.generateName());
    }
    return Array.from(names);
  }

  /**
   * Generate a name based on parent horses (pedigree-based naming)
   */
  generatePedigreeName(sireName, damName) {
    if (!sireName || !damName) {
      return this.generateName();
    }

    // Extract key words from parent names
    const sireWords = sireName.split(' ');
    const damWords = damName.split(' ');
    
    const patterns = [
      // Combine parts from both parents
      () => `${sireWords[0]} ${damWords[0]}`,
      () => `${damWords[0]} ${sireWords[sireWords.length - 1]}`,
      // Use variations of parent names
      () => `${sireWords[0]}'s ${this.randomChoice(this.suffixes)}`,
      () => `${damWords[0]} ${this.randomChoice(['Jr', 'II', 'Legacy', 'Heir', 'Daughter', 'Son'])}`,
      // Thematic connection
      () => this.generateNameByTheme(sireWords.concat(damWords))
    ];

    let name = this.randomChoice(patterns)();
    
    // Ensure length limit
    if (name.length > 18) {
      name = this.generateName();
    }
    
    return name;
  }

  /**
   * Generate name by theme based on keywords
   */
  generateNameByTheme(keywords) {
    // Look for themes in the keywords
    const themes = {
      storm: ['Thunder', 'Lightning', 'Storm', 'Hurricane', 'Tempest'],
      royal: ['King', 'Queen', 'Prince', 'Royal', 'Noble', 'Crown'],
      light: ['Star', 'Sun', 'Dawn', 'Light', 'Bright', 'Shine'],
      speed: ['Fast', 'Quick', 'Swift', 'Rapid', 'Lightning', 'Bolt'],
      power: ['Mighty', 'Strong', 'Bold', 'Power', 'Force', 'Strength']
    };

    for (const [theme, themeWords] of Object.entries(themes)) {
      if (keywords.some(keyword => themeWords.includes(keyword))) {
        return `${this.randomChoice(themeWords)} ${this.randomChoice(this.suffixes)}`;
      }
    }

    return this.generateName();
  }

  /**
   * Validate name against basic Jockey Club rules
   */
  validateName(name) {
    const errors = [];

    // Length check
    if (name.length > 18) {
      errors.push('Name exceeds 18 character limit');
    }

    // Cannot end with horse-related terms
    const forbiddenEndings = ['filly', 'colt', 'stud', 'mare', 'stallion', 'horse', 'pony'];
    const lowercaseName = name.toLowerCase();
    if (forbiddenEndings.some(ending => lowercaseName.endsWith(ending))) {
      errors.push('Name cannot end with horse-related terms');
    }

    // Cannot consist only of numbers
    if (/^\d+$/.test(name)) {
      errors.push('Name cannot consist only of numbers');
    }

    // Cannot consist only of initials
    if (/^[A-Z\s]+$/.test(name) && name.replace(/\s/g, '').length <= 4) {
      errors.push('Name cannot consist only of initials');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Helper method to get a random choice from an array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

module.exports = NameGenerator;