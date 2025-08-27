# V1.0 Breeding & Legacy System Architecture

## Overview

The Breeding & Legacy System introduces realistic horse racing genetics, enabling players to breed retired horses and create lineages that influence future generations. This mimics real-world Thoroughbred breeding practices with simplified mechanics suitable for gameplay.

## Core Components

### 1. Horse Gender System

```javascript
// Gender enumeration
const Gender = {
    STALLION: 'stallion',  // Male breeding horse
    MARE: 'mare',          // Female breeding horse  
    COLT: 'colt',          // Young male (< 4 years old)
    FILLY: 'filly'         // Young female (< 4 years old)
};

// In Horse/Character model
{
    gender: Gender.STALLION,
    age: 3,                    // Racing age (typically 3-5 years)
    breedingEligible: false    // Becomes true after career completion
}
```

### 2. Heritage/Pedigree System

**Pedigree Depth**: Track 3 generations (parents, grandparents, great-grandparents)

```javascript
// Pedigree structure
const pedigree = {
    sire: {                    // Father
        name: "Thunder King",
        breed: "Quarter Horse",
        specialization: "Sprinter",
        achievements: ["Sprint Champion"],
        stats: { speed: 92, stamina: 78, power: 89 }
    },
    dam: {                     // Mother  
        name: "Desert Queen",
        breed: "Arabian",
        specialization: "Stayer", 
        achievements: ["Endurance Master"],
        stats: { speed: 76, stamina: 95, power: 82 }
    },
    generations: 2,            // How deep the pedigree goes
    inbreeding: 0.0           // Coefficient of inbreeding (0-1)
};
```

### 3. Stable Management System

**The Stable**: Repository for retired horses available for breeding

```javascript
class Stable {
    constructor() {
        this.stallions = new Map();    // Retired male horses
        this.mares = new Map();        // Retired female horses
        this.capacity = 20;            // Maximum horses in stable
        this.founded = Date.now();     // Stable establishment date
    }
    
    // Core operations
    retireHorse(horse, careerStats)
    getAvailableStallions()
    getAvailableMares()  
    getBreedingOptions(gender)
    calculateBreedingFee(stallion, mare)
}
```

### 4. Genetics & Inheritance System

**Genetic Traits**: Inheritable characteristics that influence offspring

```javascript
const GeneticTraits = {
    // Physical traits
    EARLY_SPEED: 'early_speed',        // Gate speed and early pace
    STAMINA_RESERVE: 'stamina_reserve', // Endurance capacity
    LATE_KICK: 'late_kick',            // Finishing speed
    ACCELERATION: 'acceleration',       // Power and burst speed
    
    // Mental traits  
    RACE_IQ: 'race_iq',               // Tactical awareness
    TEMPERAMENT: 'temperament',        // Form consistency
    COMPETITIVE_DRIVE: 'competitive_drive', // Clutch performance
    
    // Physical attributes
    SURFACE_ADAPTATION: 'surface_adaptation', // Turf vs dirt
    DISTANCE_APTITUDE: 'distance_aptitude'    // Sprint vs distance
};
```

**Inheritance Rules**:
- 50% from sire, 50% from dam (base)
- Dominant/recessive trait system
- Hybrid vigor bonus for outcrossing
- Inbreeding depression for line breeding

### 5. Randomized Stat Generation

**Base Stat Generation**: All horses get randomized stats with breed/heritage influence

```javascript
// Stat generation formula
baseStats = {
    speed: random(30, 60),      // Base random range
    stamina: random(30, 60),
    power: random(30, 60)
};

// Apply breed modifiers
breedModifiedStats = applyBreedInfluence(baseStats, breed);

// Apply heritage influence (if bred horse)
if (pedigree) {
    heritageStats = applyHeritageInfluence(breedModifiedStats, pedigree);
}

// Apply customization bias (if selected)
finalStats = applyCustomizationBias(heritageStats, customization);
```

### 6. Enhanced Character Creation Flow

**Three Creation Paths**:

1. **Create New Horse** (Original system + randomization)
   - Random breed assignment
   - Random gender assignment
   - Random stat distribution
   - Random specialization assignment

2. **Breed New Horse** (New breeding system)
   - Select sire from stable stallions
   - Select dam from stable mares  
   - Genetic inheritance calculation
   - Pedigree generation

3. **Customize New Horse** (New customization system)
   - Choose ONE preference category:
     - Track Type: Turf or Dirt
     - Distance: Sprint/Mile/Medium/Long
     - Strategy: Front/Mid/Late
   - All other attributes randomized
   - Stats biased toward chosen preference

### 7. Breeding Mechanics

**Breeding Process**:

```javascript
class BreedingEngine {
    breedHorses(sire, dam, customization = null) {
        // 1. Validate breeding pair
        validateBreeding(sire, dam);
        
        // 2. Generate base stats with inheritance
        const baseStats = inheritStats(sire.stats, dam.stats);
        
        // 3. Apply genetic traits
        const traits = inheritTraits(sire.traits, dam.traits);
        
        // 4. Apply breed influence
        const breed = determineOffspringBreed(sire.breed, dam.breed);
        
        // 5. Apply randomization
        const finalStats = addRandomVariation(baseStats);
        
        // 6. Create pedigree
        const pedigree = createPedigree(sire, dam);
        
        // 7. Apply customization bias (if any)
        if (customization) {
            applyCustomizationBias(finalStats, customization);
        }
        
        return new Character(name, {
            breed,
            stats: finalStats,
            traits,
            pedigree,
            gender: randomGender(),
            age: 3
        });
    }
}
```

**Breeding Compatibility Rules**:
- Same breed: 100% breed purity, standard inheritance
- Cross-breed: Hybrid vigor bonus (+5% all stats), mixed breed traits
- Line breeding: Inbreeding depression (-2% per generation), trait concentration
- Outcrossing: Maximum hybrid vigor, diverse traits

## Integration with Existing Systems

### Career Mode Integration

**Career Start Options**:
```
=== NEW CAREER ===
1. Create Random Horse    [Original system + randomization]
2. Breed New Horse       [Select from stable]
3. Customize New Horse   [Choose one preference] 
4. Import Horse          [From another save/player]
```

### Training System Integration

**Heritage Bonuses**: Horses with good pedigrees get slight training bonuses
```javascript
// Heritage training modifier
const heritageBonus = calculateHeritageBonus(horse.pedigree);
trainingGain = baseGain * breedModifier * specializationModifier * heritageBonus;
```

### Achievement System Integration

**Breeding Achievements**:
- **Foundation Sire/Dam**: First horse retired to stable
- **Champion Bloodline**: Breed 3 generation winners
- **Hybrid Vigor**: Successfully cross-breed different breeds
- **Dynasty Builder**: Create 5-generation pedigree
- **Genetic Perfectionist**: Breed horse with 90+ in primary stat

## Technical Implementation

### Database Schema

```javascript
// Enhanced Horse model
class Horse {
    constructor(name, options = {}) {
        // Existing properties
        this.name = name;
        this.breed = options.breed;
        this.stats = options.stats;
        
        // New breeding properties
        this.gender = options.gender || randomGender();
        this.age = options.age || 3;
        this.pedigree = options.pedigree || null;
        this.geneticTraits = options.traits || generateRandomTraits();
        this.breedingRecord = {
            offspring: [],
            earnings: 0,
            championships: 0
        };
    }
}

// New Stable model
class Stable {
    constructor() {
        this.horses = new Map();
        this.breedings = [];
        this.founded = Date.now();
        this.statistics = {
            totalRetired: 0,
            totalOffspring: 0,
            championOffspring: 0
        };
    }
}
```

### File Structure

```
src/
├── models/
│   ├── breeding/
│   │   ├── Stable.js              # Stable management
│   │   ├── Pedigree.js           # Pedigree tracking
│   │   ├── GeneticTraits.js      # Trait definitions
│   │   └── BreedingEngine.js     # Core breeding logic
│   ├── generation/
│   │   ├── StatGenerator.js      # Randomized stat generation
│   │   ├── TraitGenerator.js     # Genetic trait generation
│   │   └── NameGenerator.js      # Enhanced name generation
│   └── Character.js              # Enhanced with gender/pedigree
├── engines/
│   ├── BreedingEngine.js         # Breeding calculations
│   ├── GeneticsEngine.js         # Inheritance logic
│   └── CustomizationEngine.js    # Character customization
└── ui/
    ├── BreedingInterface.js      # Breeding UI screens
    ├── StableInterface.js        # Stable management UI
    └── CustomizationInterface.js # Character creation UI
```

## Development Phases

### Phase 1: Core Foundation (Weeks 1-2)
- [ ] Implement Gender system
- [ ] Create Pedigree data structure
- [ ] Build basic Stable management
- [ ] Add randomized stat generation

### Phase 2: Breeding Mechanics (Weeks 3-4)  
- [ ] Implement BreedingEngine
- [ ] Create genetic inheritance system
- [ ] Add breeding UI screens
- [ ] Build pedigree display system

### Phase 3: Enhanced Creation (Week 5)
- [ ] Create customization system
- [ ] Build new character creation flow
- [ ] Add preference-based stat biasing
- [ ] Implement breeding achievements

### Phase 4: Integration & Polish (Week 6)
- [ ] Integrate with existing career mode
- [ ] Add breeding-related achievements  
- [ ] Create comprehensive testing
- [ ] Balance breeding bonuses/penalties

## Balance Considerations

### Breeding Advantages
- Heritage bonuses: +2-5% training efficiency
- Genetic traits: Specialized bonuses (e.g., +10% late-race speed)
- Pedigree prestige: Cosmetic recognition

### Breeding Limitations
- Stable capacity: Maximum 20 horses
- Breeding costs: Requires in-game currency/achievements
- Inbreeding depression: Penalties for excessive line breeding
- RNG element: Always some randomness in outcomes

### Gameplay Balance
- Bred horses should be 10-15% better than random horses
- Multiple viable breeding strategies
- Random horses remain competitive
- Breeding unlocks gradually through gameplay

## Future Enhancement Hooks

### V1.1+ Features
- **Stallion/Mare aging**: Breeding ability decreases with age
- **Breeding seasons**: Timed breeding windows
- **Syndicate system**: Share breeding rights with other players
- **Genetic diseases**: Rare negative traits requiring careful breeding
- **Advanced pedigree analysis**: Detailed genetic compatibility scoring

### V2.0+ Features  
- **International bloodlines**: Import horses from different regions
- **Breeding facilities**: Upgradeable stables with bonuses
- **AI breeding advisors**: NPCs that offer breeding recommendations
- **Genetic engineering**: Advanced manipulation of traits
- **Tournament breeding**: Special events for bred horses only

## Success Metrics

### Engagement Metrics
- [ ] 70%+ of players retire at least one horse to stable
- [ ] 40%+ of players attempt breeding in first 10 careers
- [ ] 60%+ of bred horses outperform random horses
- [ ] Average 3+ generations per stable lineage

### Quality Metrics
- [ ] Breeding system adds 30+ minutes to session length
- [ ] 85%+ player satisfaction with breeding mechanics
- [ ] 0% game-breaking breeding exploits
- [ ] Balanced distribution across breeding strategies

---

*This breeding system establishes the foundation for a dynasty-building meta-game that enhances long-term engagement while preserving the core racing experience.*