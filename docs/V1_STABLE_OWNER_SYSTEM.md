# Stable Owner Account System - v1.0

## Overview

The Horse Racing Text Game v1.0 introduces a **Stable Owner Account System** where the player takes the role of a stable owner/manager rather than a single horse trainer. This creates a more immersive and expansive gameplay experience focused on building a racing empire.

## Player Role Transformation

### From Trainer to Stable Owner
- **Previous**: Player was a trainer working with one horse at a time
- **New**: Player is a stable owner managing multiple horses, breeding programs, and racing campaigns
- **Perspective**: Strategic management of an entire racing operation
- **Goal**: Build the world's most successful racing stable

### Stable Owner Responsibilities
- **Horse Management**: Acquire, train, and race multiple horses
- **Breeding Program**: Develop bloodlines through strategic breeding
- **Facility Management**: Upgrade stables, training facilities, breeding barns
- **Staff Management**: Hire trainers, jockeys, veterinarians, breeding specialists
- **Financial Management**: Prize money, expenses, breeding fees, facility costs
- **Reputation Building**: Win prestigious races to establish stable's legacy

---

## Account Creation System

### Owner Profile Creation

#### **Owner Name Generation**
Using the name generation system with owner-specific patterns:

```javascript
const ownerPatterns = [
    '{FirstName} {LastName}',           // "John Winchester", "Sarah Montgomery"
    '{Title} {LastName}',               // "Sir Hamilton", "Lord Blackwood"
    '{FirstName} "{Nickname}" {LastName}' // "Robert "Steel" Harrison"
];

const ownerFirstNames = [
    // Traditional names
    'Alexander', 'Benjamin', 'Charles', 'David', 'Edward', 'Frederick',
    'George', 'Henry', 'James', 'Nicholas', 'Oliver', 'Patrick',
    'Robert', 'Samuel', 'Thomas', 'William',
    
    // Female names
    'Alexandra', 'Catherine', 'Elizabeth', 'Margaret', 'Sarah', 'Victoria',
    'Charlotte', 'Isabella', 'Sophia', 'Emma', 'Grace', 'Claire'
];

const ownerLastNames = [
    // English/Irish heritage (common in horse racing)
    'Armstrong', 'Blackwood', 'Churchill', 'Donovan', 'Fitzgerald',
    'Hamilton', 'Lancaster', 'Montgomery', 'Pemberton', 'Sinclair',
    'Wellington', 'Winchester', 'Kensington', 'Ashford', 'Bradford',
    'Harrington', 'Worthington', 'Lexington', 'Carrington', 'Thornfield'
];
```

#### **Stable Name Generation**
Traditional stable naming conventions:

```javascript
const stablePatterns = [
    '{Location} {Type}',                // "Golden Valley Stables", "Thunder Ridge Farm"
    '{Owner} {Type}',                   // "Winchester Racing", "Hamilton Farms"
    '{Theme} {Descriptor} {Type}',      // "Royal Crown Stables", "Diamond Star Farm"
    '{Geographic} {Natural} {Type}'     // "Meadowbrook Stables", "Hillcrest Racing"
];

const stableTypes = [
    'Stables', 'Farm', 'Ranch', 'Racing', 'Bloodstock',
    'Thoroughbreds', 'Equine Center', 'Racing Stable',
    'Breeding Farm', 'Training Center'
];

const stableThemes = [
    // Prestige themes
    'Royal', 'Crown', 'Diamond', 'Golden', 'Silver', 'Platinum',
    'Elite', 'Premier', 'Supreme', 'Grand', 'Noble', 'Imperial',
    
    // Natural themes  
    'Meadow', 'Valley', 'Ridge', 'Creek', 'Grove', 'Hill',
    'Field', 'Brook', 'Glen', 'Dale', 'Park', 'Haven'
];
```

### Account Creation Flow

#### **1. Welcome & Role Introduction**
```
═══════════════════════════════════════
    WELCOME TO HORSE RACING EMPIRE
═══════════════════════════════════════

You are about to become a STABLE OWNER - the manager
of your own racing empire. Your goal is to build the
world's most successful thoroughbred racing stable.

As a stable owner, you will:
• Manage multiple racehorses simultaneously  
• Develop strategic breeding programs
• Compete in prestigious races worldwide
• Build your stable's reputation and legacy

Press ENTER to begin your journey...
```

#### **2. Owner Creation Options**
```
═══════════════════════════════════════
       CREATE YOUR STABLE OWNER
═══════════════════════════════════════

How would you like to create your owner profile?

[1] Generate Random Owner
    → Quick start with generated name and stable
    
[2] Custom Owner Details  
    → Choose your own owner and stable names
    
[3] Legacy Owner
    → Continue from previous stable ownership

Enter your choice [1-3]: _
```

#### **3. Owner Customization (if chosen)**
```
═══════════════════════════════════════
         OWNER CUSTOMIZATION
═══════════════════════════════════════

Enter your owner name (or press ENTER for random):
> _

Enter your stable name (or press ENTER for random):  
> _

Choose your stable's founding philosophy:
[1] Speed Focus - Emphasis on sprint racing
[2] Classic Focus - Traditional distance racing  
[3] Breeding Focus - Bloodline development
[4] Balanced Approach - All-around excellence

Selection: _
```

#### **4. Starting Resources**
```
═══════════════════════════════════════
        STABLE STARTING PACKAGE
═══════════════════════════════════════

Your stable begins with:

💰 Starting Capital: $50,000
🐎 Foundation Horse: 1 young racehorse  
🏟️ Basic Training Facilities
👥 Core Staff: 1 trainer, 1 groom
📍 Stable Location: [Regional assignment]

Stable Focus: [Chosen philosophy]
Initial Reputation: Unknown (0 points)

Ready to begin? [Y/N]: _
```

---

## Stable Account Data Structure

### Owner Profile Model
```javascript
class StableOwner {
    constructor(name, stableName, philosophy) {
        this.profile = {
            name: name,                          // "Alexander Winchester"
            title: null,                         // "Sir", "Lord", etc.
            stableName: stableName,              // "Winchester Racing Stables"
            founded: new Date(),                 // Stable founding date
            philosophy: philosophy,              // 'speed'|'classic'|'breeding'|'balanced'
            reputation: 0,                       // Global reputation points
            experience: 'Rookie',                // Rookie → Veteran → Champion → Legend
            region: 'Kentucky'                   // Base region
        };

        this.financial = {
            cash: 50000,                         // Starting capital
            totalEarnings: 0,                    // Career prize money
            totalExpenses: 0,                    // Career costs
            monthlyOperatingCost: 5000,          // Ongoing facility costs
            netWorth: 50000                      // Total assets value
        };

        this.facilities = {
            stalls: 10,                          // Horse capacity
            trainingTrack: 'basic',              // basic|intermediate|professional
            breedingBarn: false,                 // Breeding capability
            veterinaryClinic: false,             // Health facility
            quarantineFacility: false,           // Import/health isolation
            guestAccommodations: false           // For visiting staff/owners
        };

        this.staff = {
            trainers: 1,                         // Hired trainers
            jockeys: 0,                          // Contract jockeys
            grooms: 1,                           // Horse care staff
            veterinarian: false,                 // On-staff vet
            breedingSpecialist: false,           // Breeding expert
            facilityManager: false               // Operations manager
        };

        this.achievements = {
            racesWon: 0,                         // Total race victories
            gradeOneWins: 0,                     // Prestigious race wins
            breedingChampions: 0,                // Champions bred at stable
            yearEndAwards: [],                   // Horse of the Year, etc.
            prestigiousRaces: [],                // Major stakes wins
            breedingSuccesses: []                // Notable breeding achievements
        };

        this.statistics = {
            horsesOwned: 0,                      // Current roster size
            horsesRaced: 0,                      // Total horses raced
            horsesBred: 0,                       // Horses bred at stable  
            totalStarts: 0,                      // Race entries
            winPercentage: 0.0,                  // Success rate
            earningsPerStart: 0.0,               // Financial efficiency
            championsProduced: 0                 // Elite horses developed
        };
    }
}
```

### Stable Reputation System
```javascript
const reputationLevels = {
    0: { level: 'Unknown', description: 'New stable with no reputation' },
    100: { level: 'Local', description: 'Known in regional racing circuits' },
    300: { level: 'Regional', description: 'Recognized across multiple states' },
    600: { level: 'National', description: 'Respected nationwide' },
    1000: { level: 'Elite', description: 'Top-tier racing stable' },
    1500: { level: 'Legendary', description: 'World-renowned racing empire' }
};

// Reputation earned through:
// - Race wins: 1-10 points based on race prestige
// - Breeding successes: 5-15 points for champion offspring
// - Facility upgrades: 2-5 points for major improvements
// - Media coverage: 3-8 points for notable achievements
```

---

## Stable Philosophy Impact

### **Speed Focus Philosophy**
```javascript
const speedFocusBonus = {
    sprintRaceBonus: 1.15,              // +15% performance in sprint races
    trainingEfficiency: 1.1,            // +10% speed training gains
    jockeyAttraction: 1.2,              // +20% chance to hire good sprint jockeys
    facilityCost: 0.95,                 // -5% cost for speed training facilities
    breedingPenalty: 0.9                // -10% breeding program effectiveness
};
```

### **Classic Focus Philosophy**  
```javascript
const classicFocusBonus = {
    distanceRaceBonus: 1.15,            // +15% performance in classic+ races
    staminaTraining: 1.1,               // +10% stamina training gains
    prestigeRaceAccess: 1.25,           // +25% chance for Grade 1 invitations
    traditionBonus: 1.1,                // +10% reputation from major wins
    modernFacilityPenalty: 1.05         // +5% cost for high-tech facilities
};
```

### **Breeding Focus Philosophy**
```javascript
const breedingFocusBonus = {
    breedingSuccess: 1.2,               // +20% breeding program effectiveness
    pedigreeValue: 1.15,                // +15% value from good bloodlines
    stallionAttraction: 1.3,            // +30% chance to acquire top stallions
    breedingFacilityCost: 0.85,         // -15% breeding facility costs
    racePerformancePenalty: 0.95        // -5% active racing performance
};
```

### **Balanced Approach Philosophy**
```javascript
const balancedApproachBonus = {
    versatilityBonus: 1.05,             // +5% in all areas
    adaptabilityBonus: 1.1,             // +10% ability to change focus
    staffSatisfaction: 1.1,             // +10% staff efficiency
    facilityFlexibility: 1.05,          // +5% upgrade flexibility
    specializationPenalty: 0.95         // -5% peak specialization effectiveness
};
```

---

## Stable Management Interface

### Main Stable Dashboard
```
═══════════════════════════════════════════════════════════════
                    WINCHESTER RACING STABLES
              Owner: Alexander Winchester | Founded: 2024
═══════════════════════════════════════════════════════════════

STABLE STATUS                    CURRENT OPERATIONS
═══════════════╤═══════════════  ═══════════════╤═══════════════  
 Reputation    │ Elite (1,240)   Active Horses  │ 8/10 stalls   
 Philosophy    │ Classic Focus   In Training    │ 3 horses      
 Region        │ Kentucky        Racing This    │ 2 horses      
 Net Worth     │ $485,000        Month          │              
═══════════════╧═══════════════  ═══════════════╧═══════════════

QUICK ACTIONS                    RECENT ACTIVITY
═══════════════════════════════  ═══════════════════════════════
[1] View Horse Roster            🏆 Golden Thunder won Mile Stakes
[2] Training Management          💰 $15,000 prize money earned  
[3] Breeding Operations          🐎 Silver Storm retired to stud
[4] Facility Upgrades           📈 Reputation increased to Elite
[5] Staff Management            
[6] Financial Records           
[7] Race Calendar               
[8] Achievements & Awards       

═══════════════════════════════════════════════════════════════
Enter choice [1-8] or 'help' for commands: _
```

### Horse Roster View
```
═══════════════════════════════════════════════════════════════
                      ACTIVE HORSE ROSTER
              Winchester Racing Stables | 8/10 stalls
═══════════════════════════════════════════════════════════════

NAME              AGE  GENDER  SPECIALTY   CAREER      STATUS
═══════════════════════════════════════════════════════════════
Golden Thunder    3    Colt    Miler       4-2-1-0     Training
Silver Storm      4    Stallion Classic    8-5-2-1     Racing  
Midnight Star     2    Filly   Sprinter    0-0-0-0     Training
Azure Lightning   3    Colt    Stayer      6-3-1-1     Injured
Crimson Dawn      2    Filly   Miler       1-1-0-0     Training
Thunder Ridge     5    Stallion Classic    12-8-2-2    Retired*
Swift Spirit      3    Mare    Sprinter    7-4-1-2     Breeding
Noble Heart       2    Colt    Stayer      0-0-0-0     Training

*Available for breeding | 🏥 Injured | 🏃 Racing next week
═══════════════════════════════════════════════════════════════

[V] View horse details  [T] Training schedule  [R] Race entries
[B] Breeding program   [F] Financial summary  [M] Medical status

Select horse by number or action [V/T/R/B/F/M]: _
```

---

## Integration with Existing Systems

### Enhanced Character Creation
```javascript
// Updated CharacterCreationEngine integration
class StableOwnerCreation {
    async createNewStable() {
        const owner = await this.createOwnerProfile();
        const stable = await this.createStableProfile(owner);
        const foundationHorse = await this.createFoundationHorse(stable);
        
        return new StableAccount(owner, stable, [foundationHorse]);
    }
    
    createOwnerProfile() {
        // Use NameGenerator for owner names
        const ownerName = this.nameGenerator.generateOwnerName();
        const philosophy = this.selectPhilosophy();
        
        return new StableOwner(ownerName, null, philosophy);
    }
    
    createStableProfile(owner) {
        // Use NameGenerator for stable names
        const stableName = this.nameGenerator.generateStableName(owner.name);
        owner.profile.stableName = stableName;
        
        return owner;
    }
}
```

### Breeding System Integration
```javascript
// Enhanced breeding with stable ownership context
class StableBreedingProgram {
    constructor(stableOwner) {
        this.owner = stableOwner;
        this.breedingRecords = new Map();
        this.stallionRoster = [];
        this.mareRoster = [];
    }
    
    planBreeding(stallion, mare) {
        // Consider stable philosophy in breeding decisions
        const philosophyBonus = this.getBreedingBonus();
        const compatibility = this.analyzeBreedingPair(stallion, mare);
        
        return {
            success: compatibility * philosophyBonus,
            cost: this.calculateBreedingCost(stallion, mare),
            expectedTraits: this.predictOffspring(stallion, mare)
        };
    }
}
```

### Save System Integration
```javascript
// Enhanced save system with stable account data
class SaveSystem {
    saveGame(gameState) {
        return {
            version: '1.0',
            stableOwner: gameState.owner.serialize(),
            activeHorses: gameState.horses.map(h => h.serialize()),
            retiredHorses: gameState.stable.serialize(),
            breedingProgram: gameState.breeding.serialize(),
            nameGenerator: gameState.names.getUsedNames(),
            facilities: gameState.facilities.serialize(),
            staff: gameState.staff.serialize(),
            financial: gameState.financial.serialize(),
            timestamp: new Date().toISOString()
        };
    }
}
```

---

## Stable Name Generation Examples

### Traditional Stable Names
- "Winchester Racing Stables"
- "Golden Valley Farm" 
- "Thunder Ridge Thoroughbreds"
- "Royal Crown Racing"
- "Diamond Star Bloodstock"

### Regional Themed Names
- "Kentucky Bluegrass Stables"
- "Virginia Highland Farm"
- "California Coastal Racing"
- "Florida Sunshine Stables"
- "New York Empire Racing"

### Philosophy-Influenced Names
- **Speed Focus**: "Lightning Bolt Racing", "Sprint Valley Stables"
- **Classic Focus**: "Heritage Racing", "Traditional Thoroughbreds" 
- **Breeding Focus**: "Premier Bloodlines", "Champion Genetics Farm"
- **Balanced**: "Elite Performance Stables", "Victory Lane Racing"

---

## Future Enhancements (v1.1+)

### Multiplayer Elements
- **Stable rivalries**: Compete against AI stable owners
- **Breeding partnerships**: Collaborate with other stables
- **Auction system**: Buy/sell horses between stables
- **Leaderboards**: Global stable rankings

### Advanced Management
- **Regional expansion**: Open satellite facilities
- **International racing**: Compete in global circuits
- **Media relations**: Manage public image and sponsorships
- **Economic cycles**: Market fluctuations affect horse values

### Storyline Elements
- **Stable history**: Develop multi-generational storylines
- **Owner biography**: Personal background affects gameplay
- **Legacy objectives**: Long-term goals spanning multiple generations
- **Historical events**: Racing industry changes over time

---

*The Stable Owner Account System transforms the Horse Racing Text Game from individual horse management into a comprehensive racing empire simulation, providing deeper strategic gameplay and long-term progression.*