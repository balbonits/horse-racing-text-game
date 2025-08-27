# Version 1.0 Architecture Design

## Horse Specialization System Design

### Core Architecture Overview

```
Horse (base class)
├── Character (player horses)
│   └── SpecializedCharacter (v1.0 - breed + specialization)
└── NPH (AI horses)  
    └── SpecializedNPH (v1.0 - breed + specialization)

Breed System (composition)
├── Thoroughbred (balanced growth)
├── Arabian (stamina specialist) 
└── QuarterHorse (speed specialist)

Specialization System (composition)
├── Sprinter (1000-1400m optimal)
├── Miler (1400-1800m optimal)
└── Stayer (1800m+ optimal)

Racing Style System (composition)
├── FrontRunner (early pace, high energy cost)
├── Stalker (mid-pace, balanced energy)
└── Closer (late pace, energy conservation)
```

### 1. Horse Breed System

#### Breed Base Class
```javascript
class Breed {
  constructor(name, statCaps, growthRates, surfacePreferences) {
    this.name = name;
    this.statCaps = statCaps;          // {speed: 95, stamina: 105, power: 90}
    this.growthRates = growthRates;    // {speed: 1.0, stamina: 1.2, power: 0.9}
    this.surfacePreferences = surfacePreferences; // {turf: 1.1, dirt: 0.95}
  }
}
```

#### Specific Breed Implementations
- **Thoroughbred**: Balanced (100 cap all stats, 1.0 growth rate)
- **Arabian**: Stamina specialist (105 stamina cap, 1.2 stamina growth)  
- **Quarter Horse**: Speed specialist (105 speed cap, 1.2 speed growth)

### 2. Racing Specialization System

#### Specialization Base Class
```javascript
class RacingSpecialization {
  constructor(name, optimalDistances, statWeighting, trainingBonus) {
    this.name = name;
    this.optimalDistances = optimalDistances; // [1000, 1400] for Sprinter
    this.statWeighting = statWeighting;       // {speed: 0.6, stamina: 0.2, power: 0.2}
    this.trainingBonus = trainingBonus;       // {speed: 1.2, power: 1.1}
  }
}
```

#### Specialization Types
- **Sprinter**: 1000-1400m optimal, Speed/Power focused
- **Miler**: 1400-1800m optimal, Balanced stats  
- **Stayer**: 1800m+ optimal, Stamina focused

### 3. Racing Style System

#### Racing Style Base Class
```javascript
class RacingStyle {
  constructor(name, energyStrategy, paceProfile, positionPreference) {
    this.name = name;
    this.energyStrategy = energyStrategy;     // Energy management pattern
    this.paceProfile = paceProfile;           // Early/mid/late race performance
    this.positionPreference = positionPreference; // Front/mid/back of pack
  }
}
```

#### Style Types
- **Front Runner**: Early pace, high energy usage, leads from start
- **Stalker**: Mid-pace, balanced energy, sits behind leaders
- **Closer**: Late pace, energy conservation, strong finish

### 4. Enhanced Character Architecture

#### SpecializedCharacter Class (extends Character)
```javascript
class SpecializedCharacter extends Character {
  constructor(name, breed, specialization, racingStyle) {
    super(name);
    this.breed = breed;
    this.specialization = specialization;
    this.racingStyle = racingStyle;
    
    // Apply breed stat caps
    this.applyBreedLimitations();
    
    // Calculate combined performance modifiers
    this.performanceModifiers = this.calculateModifiers();
  }
}
```

### 5. Training System Enhancements

#### Specialized Training Recommendations
- **Breed-based**: Arabian horses get stamina training recommendations
- **Specialization-based**: Sprinters get speed/power recommendations  
- **Style-based**: Front runners need higher stamina for early pace

#### Training Effectiveness Modifiers
```javascript
Training Gain = base_gain × breed_modifier × specialization_modifier × form_modifier × bond_modifier
```

### 6. Race Performance Calculation v1.0

#### Enhanced Performance Formula
```javascript
// Base performance (v0.1.0)
base_performance = (speed × 0.4) + (stamina × 0.4) + (power × 0.2)

// v1.0 modifiers
breed_modifier = breed.surfacePreferences[race.surface]
specialization_modifier = calculateDistanceMatch(specialization, race.distance)
style_modifier = calculateStyleEffectiveness(racingStyle, race.pace)
weather_modifier = race.weather.getPerformanceMultiplier()

// Final v1.0 performance
final_performance = base_performance × breed_modifier × specialization_modifier × style_modifier × weather_modifier × energy_factor × random_variance
```

## Implementation Priority

### Phase 1A: Breed System Foundation (Week 1)
1. Create Breed base class and three breed implementations
2. Update Character class to accept breed parameter
3. Apply breed stat caps and growth rate modifiers
4. Create breed selection UI in character creation

### Phase 1B: Specialization System (Week 2)
1. Create RacingSpecialization base class and implementations  
2. Integrate specialization with training recommendations
3. Add specialization selection to character creation
4. Update training effectiveness calculations

### Phase 1C: Racing Style System (Week 3)
1. Create RacingStyle base class and implementations
2. Integrate style with race performance calculations
3. Add style selection to character creation  
4. Balance energy management strategies

### Phase 1D: Integration & Testing (Week 4)
1. Comprehensive integration testing
2. Balance validation for all breed/specialization/style combinations
3. UI/UX refinements for new systems
4. Performance optimization

## Success Criteria for Phase 1

- [ ] 3 distinct breeds with meaningful stat differences
- [ ] 3 specializations with optimal distance ranges
- [ ] 3 racing styles with different energy strategies  
- [ ] Character creation allows selection of all three systems
- [ ] Training recommendations adapt to breed/specialization/style
- [ ] Race performance reflects specialization choices
- [ ] Comprehensive test coverage for all combinations
- [ ] Balanced gameplay across all viable combinations

## Technical Considerations

### Backward Compatibility
- All v1.0 features must gracefully handle v0.1.0 save files
- Default breed/specialization/style for legacy characters
- Progressive enhancement without breaking existing functionality

### Performance Optimization
- Use Map/Set data structures for O(1) breed/specialization lookups
- Cache calculated modifiers to avoid repetitive calculations
- Maintain state machine architecture for input handling

### Testing Strategy
- Unit tests for each breed/specialization/style class
- Integration tests for combined modifier calculations
- Balance tests for viable strategy verification
- Snapshot tests for updated UI components