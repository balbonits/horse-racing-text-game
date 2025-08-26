# Horse Class Architecture Documentation

## Overview

The horse racing game uses a sophisticated class hierarchy built around a shared `Horse` base class that provides common functionality for all horse entities in the system. This architecture eliminates code duplication while enabling specialized behavior for different horse types.

## Class Hierarchy

```
Horse (Base Class)
├── Character (Player Horse)
└── NPH (Non-Player Horse / AI)
```

## Base Horse Class

### Core Properties
- **Stats System**: Speed, Stamina, Power (1-100 scale)
- **Condition System**: Energy, Mood, Health tracking
- **Growth Rates**: S/A/B/C/D grades affecting training gains
- **Racing Strategy**: Front/Mid/Late running styles

### Key Methods
- `getCurrentStats()` - Get current stat values with modifiers
- `getTotalPower()` - Calculate combined horse power
- `increaseStat(stat, amount)` - Apply training gains with growth modifiers
- `changeEnergy(amount)` - Modify energy and update mood automatically
- `getMoodMultiplier()` - Get performance modifier based on current mood
- `prepareForRace()` - Pre-race condition adjustments
- `applyRaceEffects()` - Post-race condition changes

## Character Class (Player Horse)

### Extensions from Horse
- **Friendship System**: 0-100 scale affecting training bonuses
- **Career Management**: Turn tracking, race records, progression limits
- **Legacy Bonuses**: Persistent bonuses from previous careers

### Specialized Features
- **Enhanced Stat Growth**: Friendship multiplier applies to all training
- **Career Validation**: Checks for turn limits and continuation eligibility
- **Save Compatibility**: Handles both legacy and current save formats

### Key Methods
- `getFriendshipBonus()` - Calculates friendship training multiplier
- `canContinue()` - Validates career progression eligibility
- `nextTurn()` - Advances career turn with validation
- `completeRace()` - Records race results and applies effects

## NPH Class (Non-Player Horse)

### Extensions from Horse
- **AI Training Patterns**: 6 distinct training behavior types
- **Personality System**: 8 personality traits affecting decisions
- **Racing Intelligence**: Strategic decision making for races
- **Performance History**: Detailed training and race tracking

### Training Patterns
1. **speed_focus** - Prioritizes speed training (70% speed, 30% power)
2. **stamina_focus** - Emphasizes endurance (70% stamina, 30% rest)
3. **power_focus** - Focuses on acceleration (70% power, 30% speed)
4. **balanced** - Equal distribution across all stats
5. **endurance_build** - Long-term stamina development
6. **late_surge** - Early stamina, late speed development

### Racing Strategies
- **FRONT**: Early leader, maintains pace (favors Speed/Power)
- **MID**: Stalker positioning, tactical racing (balanced stats)
- **LATE**: Closer style, strong finish (favors Stamina)

### Key Methods
- `selectTraining(turn, raceInfo)` - AI training decision logic
- `applyTraining(type)` - Execute training with pattern-specific behavior
- `recordTraining(turn, result)` - Track training history
- `recordRaceResult(info, position, time)` - Store race performance
- `getRacingReadiness()` - Calculate current form/condition
- `predictPerformance(raceType, surface)` - Estimate race capability

## Unified Racing Interface

All horses share the same racing mechanics through the base `Horse` class:

### Race Performance Calculation
```javascript
// Shared across all horse types
const basePower = horse.getTotalPower();
const moodFactor = horse.getMoodMultiplier();
const energyFactor = horse.condition.energy / 100;

// Strategy and surface bonuses applied uniformly
const performance = basePower * moodFactor * energyFactor * strategyBonus;
```

### Race Effects
All horses experience consistent post-race effects:
- Energy reduction based on race distance and effort
- Mood adjustments based on performance
- Health impact from racing stress
- Strategy-specific recovery patterns

## Name Generation Integration

### For Player Horses
- Interactive name generation during character creation
- 6 realistic suggestions using Jockey Club conventions
- Manual name entry with validation support

### For NPH Horses
- Automatic name generation using varied patterns
- Ensures unique names across the 24-horse roster
- Follows authentic naming conventions

### Naming Patterns (10 Types)
1. **prefix_suffix** - "Thunder Strike"
2. **descriptor_noun** - "Magnificent Runner"  
3. **color_noun** - "Crimson Lightning"
4. **single_word** - "Secretariat"
5. **playful** - "My Wife Knows Everything"
6. **racing_term** - "Victory Stakes"
7. **compound** - "Thunderbolt Champion"
8. **alliterative** - "Silver Shadow"
9. **possessive** - "Thunder's Pride"
10. **location_based** - "Kentucky Storm"

## Serialization & Save Compatibility

### Current Format
```javascript
{
  type: 'character' | 'nph',
  name: string,
  stats: { speed, stamina, power },
  condition: { energy, mood, health },
  growthRates: { speed, stamina, power },
  // Class-specific data...
}
```

### Legacy Support
- Automatic detection of old save format
- Conversion of plain NPH objects to class instances
- Backward compatibility maintained for existing saves

## Testing Architecture

### Unit Tests
- Individual class method validation
- Stat progression verification
- Serialization round-trip testing

### Integration Tests
- Cross-class interaction validation
- Race system compatibility testing
- Save/load functionality verification

## Performance Benefits

### Memory Efficiency
- Shared base functionality reduces memory footprint
- Consistent object structure enables optimization
- Prototype chain leveraging for method sharing

### Code Maintainability
- Single source of truth for horse mechanics
- Centralized bug fixes benefit all horse types
- Extensible design for future horse variants

## Future Extensibility

The architecture supports easy addition of new horse types:

```javascript
// Example: Special Event Horse
class EventHorse extends Horse {
  constructor(name, options) {
    super(name, options);
    this.eventType = options.eventType;
    this.specialAbilities = options.abilities || [];
  }
  
  // Override methods for special behavior
  increaseStat(stat, amount) {
    // Special event bonuses
    const eventMultiplier = this.getEventMultiplier();
    return super.increaseStat(stat, amount * eventMultiplier);
  }
}
```

This architecture provides a robust, extensible foundation for the horse racing simulation while maintaining code quality and performance standards.