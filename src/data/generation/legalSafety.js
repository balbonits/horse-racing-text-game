/**
 * Legal Safety Lists for Name Generation
 * 
 * Contains lists of copyrighted, trademarked, and real-world names
 * that must be avoided in name generation to prevent legal issues.
 */

// Famous racehorse names to avoid
const COPYRIGHTED_HORSE_NAMES = [
    // Triple Crown Winners
    'Secretariat', 'Citation', 'Assault', 'Count Fleet', 'Omaha', 'War Admiral',
    'Whirlaway', 'Seattle Slew', 'Affirmed', 'American Pharoah', 'Justify',
    
    // Legendary Horses
    'Man o\' War', 'Seabiscuit', 'Kelso', 'Dr. Fager', 'Buckpasser', 'Damascus',
    'Spectacular Bid', 'Alydar', 'John Henry', 'Cigar', 'Skip Away', 'Curlin',
    'Rachel Alexandra', 'Zenyatta', 'California Chrome', 'Arrogate',
    
    // International Champions
    'Frankel', 'Sea The Stars', 'Galileo', 'Deep Impact', 'Sunday Silence',
    'Northern Dancer', 'Nijinsky', 'Mill Reef', 'Shergar', 'Enable',
    'Winx', 'Black Caviar', 'Makybe Diva',
    
    // Famous Nicknames
    'Big Red', 'The Gray Ghost', 'The Iron Horse', 'The Bid', 'The Captain',
    'The Black Flash', 'War Horse', 'Triple Crown', 'Horse of the Year'
];

// Real racetracks to avoid
const COPYRIGHTED_TRACK_NAMES = [
    // American Tracks
    'Churchill Downs', 'Belmont Park', 'Pimlico Race Course', 'Santa Anita Park',
    'Keeneland', 'Saratoga Race Course', 'Del Mar Thoroughbred Club', 'Arlington Park',
    'Oaklawn Park', 'Fair Grounds Race Course', 'Gulfstream Park', 'Woodbine Racetrack',
    'Laurel Park', 'Penn National', 'Charles Town Races', 'Monmouth Park',
    'Suffolk Downs', 'Turfway Park', 'Tampa Bay Downs', 'Remington Park',
    
    // International Tracks
    'Royal Ascot', 'Epsom Downs', 'Newmarket', 'Goodwood', 'Cheltenham',
    'Aintree', 'York Racecourse', 'Doncaster', 'Chester', 'Bath',
    'Longchamp', 'Chantilly', 'Deauville', 'Maisons-Laffitte',
    'Tokyo Racecourse', 'Kyoto Racecourse', 'Nakayama', 'Hanshin',
    'Royal Randwick', 'Flemington Racecourse', 'Caulfield', 'Rosehill Gardens',
    'Sha Tin', 'Happy Valley', 'Kranji', 'Singapore Turf Club'
];

// Real race names to avoid  
const COPYRIGHTED_RACE_NAMES = [
    // American Triple Crown
    'Kentucky Derby', 'Preakness Stakes', 'Belmont Stakes',
    
    // Breeders\' Cup Races
    'Breeders\' Cup Classic', 'Breeders\' Cup Distaff', 'Breeders\' Cup Mile',
    'Breeders\' Cup Sprint', 'Breeders\' Cup Turf', 'Breeders\' Cup Juvenile',
    'Breeders\' Cup Filly & Mare Turf', 'Breeders\' Cup Dirt Mile',
    
    // Grade 1 Stakes
    'Travers Stakes', 'Haskell Invitational', 'Pacific Classic', 'Whitney Stakes',
    'Woodward Stakes', 'Jockey Club Gold Cup', 'Cigar Mile', 'Clark Handicap',
    'Santa Anita Handicap', 'Hollywood Gold Cup', 'Metropolitan Handicap',
    'Carter Handicap', 'Forego Stakes', 'King\'s Bishop Stakes',
    
    // International Races
    'Prix de l\'Arc de Triomphe', 'Melbourne Cup', 'Dubai World Cup',
    'Epsom Derby', 'Grand National', 'Cheltenham Gold Cup', 'Champion Stakes',
    'Queen Elizabeth Stakes', 'King George VI and Queen Elizabeth Stakes',
    'Japan Cup', 'Tenno Sho', 'Yasuda Kinen', 'Mile Championship',
    'Hong Kong Cup', 'Queen\'s Plate', 'Canadian International',
    
    // Historical Races
    'Man o\' War Stakes', 'Secretariat Stakes', 'Citation Handicap',
    'Seabiscuit Handicap', 'John Henry Turf Championship'
];

// Racing stable/ownership names to avoid
const COPYRIGHTED_STABLE_NAMES = [
    'Godolphin', 'Coolmore Stud', 'Juddmonte Farms', 'WinStar Farm', 'Claiborne Farm',
    'Calumet Farm', 'Three Chimneys Farm', 'Lane\'s End Farm', 'Taylor Made Farm',
    'Shadwell Estate Company', 'Aga Khan Studs', 'Darley Stud', 'Cheveley Park Stud',
    'Ballydoyle', 'Aidan O\'Brien', 'John Gosden', 'Frankel Racing', 'Team Valor'
];

// Racing terminology that is generic and safe to use
const SAFE_RACING_TERMS = [
    // Generic race types
    'Stakes', 'Handicap', 'Classic', 'Cup', 'Trophy', 'Prize', 'Championship',
    'Derby', 'Oaks', 'Trial', 'Qualifier', 'Feature', 'Special', 'Memorial',
    'Invitational', 'Festival', 'Celebration', 'Gala', 'Tournament',
    
    // Distance categories (generic)
    'Sprint', 'Mile', 'Route', 'Distance', 'Marathon', 'Dash', 'Flying',
    'Extended', 'Classic', 'Feature', 'Maiden', 'Allowance',
    
    // Track features (generic)
    'Park', 'Downs', 'Raceway', 'Track', 'Circuit', 'Speedway', 'Course',
    'Field', 'Grounds', 'Arena', 'Meadows', 'Plains', 'Fields', 'Valley',
    'Ridge', 'Grove', 'Gardens', 'Springs', 'Creek', 'Point'
];

// Generic geographic terms that are safe to use
const SAFE_GEOGRAPHIC_TERMS = [
    // Directional
    'North', 'South', 'East', 'West', 'Northern', 'Southern', 'Eastern', 'Western',
    'Northeast', 'Northwest', 'Southeast', 'Southwest', 'Central', 'Mid',
    
    // Natural features (generic)
    'Valley', 'Ridge', 'Creek', 'River', 'Lake', 'Bay', 'Point', 'Grove',
    'Hill', 'Peak', 'Mesa', 'Canyon', 'Plains', 'Meadow', 'Forest', 'Woods',
    'Glen', 'Dale', 'Field', 'Garden', 'Spring', 'Falls', 'Harbor', 'Cove',
    
    // Weather/Natural phenomena
    'Storm', 'Thunder', 'Lightning', 'Wind', 'Rain', 'Snow', 'Frost', 'Mist',
    'Cloud', 'Star', 'Moon', 'Sun', 'Dawn', 'Dusk', 'Sunset', 'Sunrise',
    
    // Colors (natural)
    'Golden', 'Silver', 'Bronze', 'Copper', 'Ivory', 'Pearl', 'Crystal',
    'Amber', 'Ruby', 'Emerald', 'Sapphire', 'Diamond', 'Onyx', 'Jade'
];

// Validation function to check if a name is safe to use
function isNameSafe(name, type = 'horse') {
    const nameLower = name.toLowerCase();
    
    // Check against copyrighted horse names
    if (type === 'horse' || type === 'all') {
        for (const copyrighted of COPYRIGHTED_HORSE_NAMES) {
            if (nameLower === copyrighted.toLowerCase()) {
                return false;
            }
        }
    }
    
    // Check against copyrighted track names
    if (type === 'track' || type === 'all') {
        for (const copyrighted of COPYRIGHTED_TRACK_NAMES) {
            if (nameLower === copyrighted.toLowerCase()) {
                return false;
            }
        }
    }
    
    // Check against copyrighted race names
    if (type === 'race' || type === 'all') {
        for (const copyrighted of COPYRIGHTED_RACE_NAMES) {
            if (nameLower === copyrighted.toLowerCase()) {
                return false;
            }
        }
    }
    
    // Check against stable names
    if (type === 'stable' || type === 'all') {
        for (const copyrighted of COPYRIGHTED_STABLE_NAMES) {
            if (nameLower.includes(copyrighted.toLowerCase())) {
                return false;
            }
        }
    }
    
    return true;
}

// Function to suggest safe alternatives for problematic names
function suggestSafeAlternative(problematicName, type = 'horse') {
    const suggestions = {
        horse: [
            'Golden Thunder', 'Silver Storm', 'Crimson Dawn', 'Azure Lightning',
            'Emerald Wind', 'Midnight Star', 'Swift Spirit', 'Noble Heart',
            'Racing Thunder', 'Flying Storm', 'Bold Victory', 'Royal Pride'
        ],
        track: [
            'Golden Valley Park', 'Thunder Ridge Downs', 'Silver Creek Raceway',
            'Sunset Mesa Track', 'Pine Grove Circuit', 'Starlight Speedway',
            'Wind River Course', 'Crystal Point Park'
        ],
        race: [
            'Golden Valley Stakes', 'Thunder Ridge Classic', 'Silver Creek Cup',
            'Sunset Championship', 'Pine Grove Derby', 'Starlight Trophy',
            'Wind River Prize', 'Crystal Point Stakes'
        ]
    };
    
    const typeAlternatives = suggestions[type] || suggestions.horse;
    return typeAlternatives[Math.floor(Math.random() * typeAlternatives.length)];
}

module.exports = {
    COPYRIGHTED_HORSE_NAMES,
    COPYRIGHTED_TRACK_NAMES,
    COPYRIGHTED_RACE_NAMES,
    COPYRIGHTED_STABLE_NAMES,
    SAFE_RACING_TERMS,
    SAFE_GEOGRAPHIC_TERMS,
    isNameSafe,
    suggestSafeAlternative
};