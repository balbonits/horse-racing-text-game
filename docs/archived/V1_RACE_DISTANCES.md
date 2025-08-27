# V1.0 Race Distance System

## Overview

Based on real-world horse racing standards and Uma Musume Pretty Derby classifications, v1.0 introduces varied race distances within each category to enhance strategic depth and specialization relevance.

## Distance Categories

### Sprint Races (5-7 furlongs)
**Focus**: Speed and acceleration
**Characteristics**: Fast pace, early speed crucial
**Available Distances**:
- **1000m** (5 furlongs) - Ultra-short sprint, pure speed
- **1200m** (6 furlongs) - Standard sprint distance  
- **1400m** (7 furlongs) - Extended sprint, requires stamina

### Mile Races (7-9 furlongs)  
**Focus**: Balanced speed and stamina
**Characteristics**: Tactical racing, versatile requirements
**Available Distances**:
- **1600m** (8 furlongs) - Classic mile distance
- **1800m** (9 furlongs) - Extended mile, stamina important

### Medium/Intermediate Races (9-12 furlongs)
**Focus**: Stamina with speed balance
**Characteristics**: Classic distances, endurance emphasis
**Available Distances**:
- **2000m** (10 furlongs) - Kentucky Derby distance
- **2200m** (11 furlongs) - European classic distance
- **2400m** (12 furlongs) - Belmont Stakes distance

### Long/Staying Races (12+ furlongs)
**Focus**: Pure endurance and stamina
**Characteristics**: True test of staying power
**Available Distances**:
- **2500m** (12.5 furlongs) - Extended classic
- **3000m** (15 furlongs) - Long-distance test
- **3200m** (16 furlongs) - Melbourne Cup distance

## Real-World Reference

Based on international horse racing standards:

| Distance | Furlongs | Category | Notable Races |
|----------|----------|----------|---------------|
| 1000m | 5f | Sprint | King's Stand Stakes |
| 1200m | 6f | Sprint | Breeders' Cup Sprint |
| 1400m | 7f | Sprint | July Cup, Forego Stakes |
| 1600m | 8f (1 mile) | Mile | Breeders' Cup Mile |
| 1800m | 9f | Mile | Hollywood Derby |
| 2000m | 10f | Medium | Kentucky Derby |
| 2200m | 11f | Medium | St. Leger Stakes |
| 2400m | 12f | Medium | Belmont Stakes |
| 2500m | 12.5f | Long | Goodwood Cup |
| 3000m | 15f | Long | Prix du Cadran |
| 3200m | 16f | Long | Melbourne Cup |

## Track Characteristics

### Surface Types
- **Dirt**: Traditional American racing surface
- **Turf**: Grass surface, common worldwide
- **All-Weather**: Synthetic surfaces (future enhancement)

### Track Patterns
- **Oval Tracks**: Standard 1-1.5 mile circumference
- **Left-Handed**: Counterclockwise (American standard)
- **Right-Handed**: Clockwise (European/Asian variations)
- **Straight Courses**: 5-6 furlong straight sprints

### Track Conditions
- **Fast/Firm**: Optimal racing conditions (100% performance)
- **Good**: Slightly soft (98% performance)
- **Soft/Muddy**: Challenging conditions (95% performance)
- **Heavy/Sloppy**: Difficult conditions (90% performance)

## Specialization Alignment

### Sprinter Specialization
- **Optimal**: 1000m-1400m
- **Competitive**: 1600m
- **Challenging**: 1800m+

### Miler Specialization  
- **Optimal**: 1400m-1800m
- **Competitive**: 1200m, 2000m
- **Challenging**: 1000m, 2200m+

### Stayer Specialization
- **Optimal**: 1800m+
- **Competitive**: 1600m
- **Challenging**: 1400m and shorter

## Breeding System Integration

### Distance Preferences (Genetic)
Horses can inherit distance aptitudes from parents:
- **Sprint Gene**: +10% performance at 1000-1400m
- **Mile Gene**: +10% performance at 1400-1800m  
- **Route Gene**: +10% performance at 1800m+
- **Versatility Gene**: +5% performance at all distances

### Customization Bias
Players can choose distance preferences during character creation:
- **Sprint Bias**: +8 Speed, +5 Power, -3 Stamina
- **Mile Bias**: +4 Speed, +4 Stamina, +2 Power
- **Medium Bias**: +6 Stamina, +2 Speed, +2 Power
- **Long Bias**: +8 Stamina, -2 Speed, -2 Power

## Race Schedule Enhancement (Future)

### Dynamic Race Generation
Instead of fixed 4-race careers, generate varied schedules:

**Example Career A (Sprint-Focused)**:
- Turn 4: 1000m Sprint
- Turn 9: 1200m Sprint  
- Turn 15: 1400m Extended Sprint
- Turn 24: 1600m Mile Championship

**Example Career B (Classic-Focused)**:
- Turn 4: 1200m Maiden
- Turn 9: 1800m Derby Trial
- Turn 15: 2000m Derby
- Turn 24: 2400m Classic

**Example Career C (Staying-Focused)**:
- Turn 4: 1600m Maiden
- Turn 9: 2000m Classic Trial
- Turn 15: 2400m Cup
- Turn 24: 3200m Championship

## Implementation Notes

### Performance Calculation
Each distance affects the stat weighting formula:

```javascript
// Distance-based stat weighting
const getDistanceWeights = (distance) => {
    if (distance <= 1400) return { speed: 0.5, stamina: 0.2, power: 0.3 };
    if (distance <= 1800) return { speed: 0.4, stamina: 0.4, power: 0.2 };
    if (distance <= 2400) return { speed: 0.3, stamina: 0.5, power: 0.2 };
    return { speed: 0.2, stamina: 0.6, power: 0.2 }; // 2500m+
};
```

### Energy Management
Longer distances require more careful energy management:
- **1000-1400m**: High early energy expenditure viable
- **1600-1800m**: Balanced energy distribution optimal  
- **2000-2400m**: Conservative early, strong late required
- **2500m+**: Patient tactics essential

### Racing Styles Effectiveness
Different distances favor different racing styles:

| Distance | Front Runner | Stalker | Closer |
|----------|--------------|---------|--------|
| 1000-1200m | Excellent | Good | Poor |
| 1400-1600m | Good | Excellent | Good |
| 1800-2000m | Good | Excellent | Excellent |
| 2200m+ | Poor | Good | Excellent |

## Future Enhancements

### v1.1+
- **Weather Effects**: Track conditions affect performance
- **Surface Specialists**: Horses with surface preferences
- **Seasonal Campaigns**: Multi-race series with qualification
- **International Racing**: Different regional preferences

### v2.0+
- **Handicap Racing**: Weight penalties for superior horses  
- **Age Restrictions**: 2-year-old, 3-year-old only races
- **Gender Restrictions**: Fillies & Mares only races
- **Stakes Races**: Grade 1/2/3 classification system

---

*This distance system provides the foundation for realistic horse racing simulation while maintaining engaging gameplay mechanics.*