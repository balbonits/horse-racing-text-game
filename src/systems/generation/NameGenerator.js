/**
 * Name Generation System for Horse Racing Text Game
 * 
 * Generates original, legally-safe names for horses, races, and tracks.
 * Avoids all copyrighted, trademarked, or real-world racing names.
 */

const legalSafety = require('../../data/generation/legalSafety');

class NameGenerator {
    constructor() {
        this.initializeWordPools();
        this.initializePatterns();
        this.usedNames = {
            horses: new Set(),
            races: new Set(),
            tracks: new Set()
        };
    }

    initializeWordPools() {
        // Horse name components
        this.horseWords = {
            adjectives: [
                // Speed/Movement
                'Swift', 'Fleet', 'Racing', 'Flying', 'Soaring', 'Dashing',
                'Blazing', 'Lightning', 'Rapid', 'Quick', 'Speedy', 'Rushing',
                
                // Power/Strength  
                'Mighty', 'Bold', 'Strong', 'Fierce', 'Brave', 'Gallant',
                'Noble', 'Royal', 'Majestic', 'Grand', 'Supreme', 'Elite',
                
                // Colors
                'Golden', 'Silver', 'Crimson', 'Azure', 'Emerald', 'Onyx',
                'Ivory', 'Copper', 'Bronze', 'Pearl', 'Amber', 'Ruby',
                'Sapphire', 'Diamond', 'Crystal', 'Midnight', 'Dawn',
                
                // Geographic
                'Northern', 'Southern', 'Eastern', 'Western', 'Highland',
                'Mountain', 'Valley', 'River', 'Desert', 'Coastal', 'Prairie',
                'Arctic', 'Tropical', 'Alpine', 'Celtic', 'Nordic'
            ],
            
            nouns: [
                // Natural Elements
                'Thunder', 'Lightning', 'Storm', 'Wind', 'Fire', 'Flame',
                'Star', 'Moon', 'Sun', 'Dawn', 'Dusk', 'Shadow', 'Light',
                'Frost', 'Rain', 'Snow', 'Mist', 'Cloud', 'Sky',
                
                // Geographic Features
                'Ridge', 'Peak', 'Valley', 'River', 'Stream', 'Canyon',
                'Mesa', 'Plains', 'Meadow', 'Forest', 'Grove', 'Glen',
                'Cliff', 'Harbor', 'Bay', 'Point', 'Crest', 'Summit',
                
                // Virtues/Qualities
                'Spirit', 'Heart', 'Soul', 'Dream', 'Hope', 'Pride',
                'Glory', 'Honor', 'Victory', 'Triumph', 'Quest', 'Journey',
                'Legend', 'Destiny', 'Fortune', 'Wonder', 'Magic', 'Power',
                
                // Movement/Action
                'Runner', 'Dancer', 'Strider', 'Walker', 'Flyer', 'Jumper',
                'Racer', 'Chaser', 'Glider', 'Sprinter', 'Charger', 'Pacer'
            ],
            
            mythological: [
                // Fantasy-style single names (original, non-copyrighted)
                'Aethros', 'Valindra', 'Korrath', 'Zelphine', 'Myrcella',
                'Drakon', 'Seraphel', 'Zardos', 'Lyralei', 'Threndor',
                'Valdris', 'Nyxara', 'Zorion', 'Celestara', 'Vorthak',
                'Lumina', 'Tempest', 'Aurelia', 'Shadowmere', 'Starfire'
            ],
            
            heritagePatterns: {
                thoroughbred: ['Noble', 'Royal', 'Majestic', 'Grand', 'Elite', 'Classic'],
                arabian: ['Desert', 'Sahara', 'Mirage', 'Oasis', 'Dune', 'Nomad'],
                quarterHorse: ['Prairie', 'Canyon', 'Mesa', 'Frontier', 'Western', 'Pioneer']
            }
        };

        // Race name components
        this.raceWords = {
            locations: [
                // Geographic regions (generic)
                'Northridge', 'Westfield', 'Eastbrook', 'Southgate',
                'Maplewood', 'Oakridge', 'Pinehurst', 'Elmwood',
                'Willowbrook', 'Riverside', 'Hillcrest', 'Fairfield',
                'Sunset', 'Sunrise', 'Moonrise', 'Starlight', 'Twilight',
                'Golden Valley', 'Silver Creek', 'Thunder Ridge', 'Pine Grove'
            ],
            
            types: [
                'Stakes', 'Classic', 'Cup', 'Championship', 'Derby',
                'Trophy', 'Prize', 'Memorial', 'Invitational', 'Festival',
                'Handicap', 'Trial', 'Qualifier', 'Feature', 'Special'
            ],
            
            themes: [
                // Seasons & Times
                'Spring', 'Summer', 'Autumn', 'Winter',
                'Dawn', 'Sunrise', 'Sunset', 'Twilight', 'Midnight',
                
                // Natural themes  
                'Thunder', 'Lightning', 'Storm', 'Wind', 'Fire',
                'Golden', 'Silver', 'Diamond', 'Crown', 'Royal',
                'Eclipse', 'Comet', 'Meteor', 'Galaxy', 'Constellation'
            ],
            
            distances: [
                'Sprint', 'Mile', 'Route', 'Distance', 'Marathon',
                'Dash', 'Flying', 'Extended', 'Classic', 'Feature'
            ]
        };

        // Track name components
        this.trackWords = {
            locations: [
                // Base location names
                'Moonrise', 'Sunset', 'Sunrise', 'Twilight', 'Starlight',
                'Golden Valley', 'Silver Creek', 'Thunder Ridge', 'Pine Grove',
                'Oak Hill', 'Maple Ridge', 'Willow Creek', 'Cedar Point',
                'Northwind', 'Southgate', 'Eastbrook', 'Westfield',
                'Highland', 'Lowland', 'Midland', 'Coastal', 'Mountain',
                'Crystal', 'Diamond', 'Emerald', 'Ruby', 'Sapphire',
                'Storm', 'Wind', 'Fire', 'Lightning', 'Thunder'
            ],
            
            types: [
                // Track venue types
                'Park', 'Downs', 'Raceway', 'Track', 'Circuit',
                'Speedway', 'Course', 'Field', 'Grounds', 'Arena',
                'Meadows', 'Plains', 'Fields', 'Valley', 'Ridge',
                'Grove', 'Gardens', 'Springs', 'Creek', 'Point'
            ]
        };
    }

    initializePatterns() {
        this.patterns = {
            horse: [
                (breed, gender, heritage) => this.adjNounPattern(breed),
                (breed, gender, heritage) => this.colorNaturePattern(),
                (breed, gender, heritage) => this.virtueElementPattern(),
                (breed, gender, heritage) => this.mythologicalPattern(),
                (breed, gender, heritage) => this.heritagePattern(breed)
            ],
            
            race: [
                (distance, surface, prestige) => this.locationDistanceTypePattern(distance),
                (distance, surface, prestige) => this.themeTypePattern(),
                (distance, surface, prestige) => this.seasonalPattern()
            ],
            
            track: [
                (region, surface) => this.locationTrackTypePattern(),
                (region, surface) => this.themeGroundsPattern(),
                (region, surface) => this.naturalFeaturePattern()
            ]
        };
    }

    // HORSE NAME GENERATION METHODS

    generateHorseName(breed = 'thoroughbred', gender = 'colt', heritage = null) {
        // Try multiple patterns to find a unique name
        for (let attempt = 0; attempt < 20; attempt++) {
            const patternIndex = Math.floor(Math.random() * this.patterns.horse.length);
            const pattern = this.patterns.horse[patternIndex];
            const name = pattern(breed, gender, heritage);
            
            if (!this.usedNames.horses.has(name) && this.isValidHorseName(name)) {
                this.usedNames.horses.add(name);
                return name;
            }
        }
        
        // Fallback: Create guaranteed unique name
        return this.createUniqueHorseName();
    }

    adjNounPattern(breed) {
        const adj = this.randomFromArray(this.horseWords.adjectives);
        const noun = this.randomFromArray(this.horseWords.nouns);
        return `${adj} ${noun}`;
    }

    colorNaturePattern() {
        const colors = ['Golden', 'Silver', 'Crimson', 'Azure', 'Emerald', 'Onyx', 'Pearl', 'Amber'];
        const nature = ['Thunder', 'Lightning', 'Storm', 'Wind', 'Fire', 'Star', 'Moon', 'Dawn'];
        return `${this.randomFromArray(colors)} ${this.randomFromArray(nature)}`;
    }

    virtueElementPattern() {
        const virtues = ['Swift', 'Bold', 'Noble', 'Brave', 'Royal', 'Mighty'];
        const elements = ['Spirit', 'Heart', 'Soul', 'Pride', 'Glory', 'Victory'];
        return `${this.randomFromArray(virtues)} ${this.randomFromArray(elements)}`;
    }

    mythologicalPattern() {
        return this.randomFromArray(this.horseWords.mythological);
    }

    heritagePattern(breed) {
        if (this.horseWords.heritagePatterns[breed]) {
            const heritageWord = this.randomFromArray(this.horseWords.heritagePatterns[breed]);
            const noun = this.randomFromArray(this.horseWords.nouns);
            return `${heritageWord} ${noun}`;
        }
        return this.adjNounPattern(breed);
    }

    createUniqueHorseName() {
        const base = this.adjNounPattern('thoroughbred');
        const suffix = Math.floor(Math.random() * 100) + 1;
        const uniqueName = `${base} ${this.romanNumeral(suffix)}`;
        this.usedNames.horses.add(uniqueName);
        return uniqueName;
    }

    // RACE NAME GENERATION METHODS

    generateRaceName(distance = '1600m', surface = 'dirt', prestige = 'stakes') {
        for (let attempt = 0; attempt < 10; attempt++) {
            const patternIndex = Math.floor(Math.random() * this.patterns.race.length);
            const pattern = this.patterns.race[patternIndex];
            const name = pattern(distance, surface, prestige);
            
            if (!this.usedNames.races.has(name) && legalSafety.isNameSafe(name, 'race')) {
                this.usedNames.races.add(name);
                return name;
            }
        }
        
        // Fallback
        const location = this.randomFromArray(this.raceWords.locations);
        const type = this.randomFromArray(this.raceWords.types);
        const fallback = `${location} ${type}`;
        this.usedNames.races.add(fallback);
        return fallback;
    }

    locationDistanceTypePattern(distance) {
        const location = this.randomFromArray(this.raceWords.locations);
        const distanceType = this.getDistanceCategory(distance);
        const type = this.randomFromArray(this.raceWords.types);
        return `${location} ${distanceType} ${type}`;
    }

    themeTypePattern() {
        const theme = this.randomFromArray(this.raceWords.themes);
        const type = this.randomFromArray(this.raceWords.types);
        return `${theme} ${type}`;
    }

    seasonalPattern() {
        const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
        const season = this.randomFromArray(seasons);
        const type = this.randomFromArray(this.raceWords.types);
        return `${season} ${type}`;
    }

    // TRACK NAME GENERATION METHODS

    generateTrackName(region = 'generic', surface = 'dirt') {
        for (let attempt = 0; attempt < 10; attempt++) {
            const patternIndex = Math.floor(Math.random() * this.patterns.track.length);
            const pattern = this.patterns.track[patternIndex];
            const name = pattern(region, surface);
            
            if (!this.usedNames.tracks.has(name) && legalSafety.isNameSafe(name, 'track')) {
                this.usedNames.tracks.add(name);
                return name;
            }
        }
        
        // Fallback
        const location = this.randomFromArray(this.trackWords.locations);
        const type = this.randomFromArray(this.trackWords.types);
        const fallback = `${location} ${type}`;
        this.usedNames.tracks.add(fallback);
        return fallback;
    }

    locationTrackTypePattern() {
        const location = this.randomFromArray(this.trackWords.locations);
        const type = this.randomFromArray(this.trackWords.types);
        return `${location} ${type}`;
    }

    themeGroundsPattern() {
        const themes = ['Golden', 'Silver', 'Thunder', 'Lightning', 'Wind', 'Storm'];
        const grounds = ['Meadows', 'Fields', 'Grounds', 'Park', 'Gardens'];
        const theme = this.randomFromArray(themes);
        const ground = this.randomFromArray(grounds);
        return `${theme} ${ground}`;
    }

    naturalFeaturePattern() {
        const features = ['Ridge', 'Valley', 'Creek', 'Grove', 'Point', 'Springs'];
        const locations = ['Pine', 'Oak', 'Maple', 'Willow', 'Cedar', 'Birch'];
        const location = this.randomFromArray(locations);
        const feature = this.randomFromArray(features);
        const type = this.randomFromArray(['Park', 'Track', 'Course']);
        return `${location} ${feature} ${type}`;
    }

    // UTILITY METHODS

    getDistanceCategory(distance) {
        const meters = parseInt(distance.replace('m', ''));
        if (meters <= 1400) return 'Sprint';
        if (meters <= 1800) return 'Mile';
        if (meters <= 2400) return 'Classic';
        return 'Distance';
    }

    isValidHorseName(name) {
        // Basic validation rules
        if (name.length < 3 || name.length > 25) return false;
        if (name.includes('  ')) return false; // No double spaces
        if (!/^[A-Za-z\s']+$/.test(name)) return false; // Only letters, spaces, apostrophes
        
        // Legal safety check
        if (!legalSafety.isNameSafe(name, 'horse')) return false;
        
        return true;
    }

    randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    romanNumeral(num) {
        const values = [100, 90, 50, 40, 10, 9, 5, 4, 1];
        const symbols = ['C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
        let result = '';
        
        for (let i = 0; i < values.length; i++) {
            while (num >= values[i]) {
                result += symbols[i];
                num -= values[i];
            }
        }
        return result;
    }

    // PERSISTENCE METHODS

    getUsedNames() {
        return {
            horses: Array.from(this.usedNames.horses),
            races: Array.from(this.usedNames.races),
            tracks: Array.from(this.usedNames.tracks)
        };
    }

    setUsedNames(usedNames) {
        if (usedNames) {
            this.usedNames.horses = new Set(usedNames.horses || []);
            this.usedNames.races = new Set(usedNames.races || []);
            this.usedNames.tracks = new Set(usedNames.tracks || []);
        }
    }

    reset() {
        this.usedNames = {
            horses: new Set(),
            races: new Set(),
            tracks: new Set()
        };
    }

    // STABLE OWNER NAME GENERATION METHODS

    generateOwnerName(gender = null) {
        const firstNames = {
            male: [
                'Alexander', 'Benjamin', 'Charles', 'David', 'Edward', 'Frederick',
                'George', 'Henry', 'James', 'Nicholas', 'Oliver', 'Patrick',
                'Robert', 'Samuel', 'Thomas', 'William', 'Michael', 'Christopher',
                'Daniel', 'Matthew', 'Andrew', 'Joseph', 'Richard', 'Jonathan'
            ],
            female: [
                'Alexandra', 'Catherine', 'Elizabeth', 'Margaret', 'Sarah', 'Victoria',
                'Charlotte', 'Isabella', 'Sophia', 'Emma', 'Grace', 'Claire',
                'Amanda', 'Jennifer', 'Michelle', 'Rebecca', 'Rachel', 'Jessica',
                'Emily', 'Ashley', 'Lauren', 'Stephanie', 'Nicole', 'Samantha'
            ]
        };

        const lastNames = [
            'Armstrong', 'Blackwood', 'Churchill', 'Donovan', 'Fitzgerald',
            'Hamilton', 'Lancaster', 'Montgomery', 'Pemberton', 'Sinclair',
            'Wellington', 'Winchester', 'Kensington', 'Ashford', 'Bradford',
            'Harrington', 'Worthington', 'Lexington', 'Carrington', 'Thornfield',
            'Sterling', 'Fairfax', 'Whitmore', 'Cranston', 'Beaumont'
        ];

        const titles = ['Sir', 'Lord', 'Lady', 'Dr.', null, null, null]; // Most names have no title

        // Determine gender if not specified
        const selectedGender = gender || (Math.random() < 0.5 ? 'male' : 'female');
        
        const firstName = this.randomFromArray(firstNames[selectedGender]);
        const lastName = this.randomFromArray(lastNames);
        const title = this.randomFromArray(titles);

        if (title) {
            return `${title} ${firstName} ${lastName}`;
        } else {
            return `${firstName} ${lastName}`;
        }
    }

    generateStableName(ownerName = null) {
        const stableTypes = [
            'Stables', 'Farm', 'Ranch', 'Racing', 'Bloodstock',
            'Thoroughbreds', 'Equine Center', 'Racing Stable',
            'Breeding Farm', 'Training Center', 'Racing Operations'
        ];

        const stableThemes = [
            // Prestige themes
            'Royal', 'Crown', 'Diamond', 'Golden', 'Silver', 'Platinum',
            'Elite', 'Premier', 'Supreme', 'Grand', 'Noble', 'Imperial',
            
            // Natural themes  
            'Meadow', 'Valley', 'Ridge', 'Creek', 'Grove', 'Hill',
            'Field', 'Brook', 'Glen', 'Dale', 'Park', 'Haven',
            'Wind', 'Star', 'Moon', 'Sun', 'Storm', 'Thunder'
        ];

        const patterns = [
            () => {
                // Pattern: [Theme] [Natural] [Type]
                const theme = this.randomFromArray(stableThemes);
                const type = this.randomFromArray(stableTypes);
                return `${theme} ${type}`;
            },
            () => {
                // Pattern: [Location] [Type] 
                const location = this.randomFromArray(this.trackWords.locations);
                const type = this.randomFromArray(stableTypes);
                return `${location} ${type}`;
            },
            () => {
                // Pattern: Owner-based (if owner name provided)
                if (ownerName) {
                    const lastName = ownerName.split(' ').pop();
                    const type = this.randomFromArray(['Racing', 'Stables', 'Bloodstock', 'Farm']);
                    return `${lastName} ${type}`;
                }
                return this.generateStableName(); // Fallback to other pattern
            }
        ];

        for (let attempt = 0; attempt < 10; attempt++) {
            const pattern = this.randomFromArray(patterns);
            const name = pattern();
            
            if (name && !this.usedNames.stables?.has(name) && legalSafety.isNameSafe(name, 'stable')) {
                if (!this.usedNames.stables) this.usedNames.stables = new Set();
                this.usedNames.stables.add(name);
                return name;
            }
        }

        // Fallback
        const theme = this.randomFromArray(stableThemes);
        const type = this.randomFromArray(stableTypes);
        const fallback = `${theme} ${type}`;
        if (!this.usedNames.stables) this.usedNames.stables = new Set();
        this.usedNames.stables.add(fallback);
        return fallback;
    }

    // BATCH GENERATION FOR TESTING

    generateMultipleHorseNames(count, breed = 'thoroughbred') {
        const names = [];
        for (let i = 0; i < count; i++) {
            names.push(this.generateHorseName(breed, 'colt'));
        }
        return names;
    }

    generateMultipleRaceNames(count) {
        const names = [];
        for (let i = 0; i < count; i++) {
            names.push(this.generateRaceName());
        }
        return names;
    }

    generateMultipleTrackNames(count) {
        const names = [];
        for (let i = 0; i < count; i++) {
            names.push(this.generateTrackName());
        }
        return names;
    }
}

module.exports = NameGenerator;