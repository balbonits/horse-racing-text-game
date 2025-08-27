const BreedRegistry = require('../breeds/BreedRegistry');
const SpecializationRegistry = require('../specializations/SpecializationRegistry');

/**
 * Randomized stat generation system for enhanced replayability
 * 
 * Generates varied starting stats for all horses (player and NPH) while maintaining
 * balance and applying breed/heritage/customization influences appropriately.
 * 
 * @class StatGenerator
 */
class StatGenerator {
    constructor() {
        // Base stat generation ranges - wider spread for more variation
        this.baseRanges = {
            speed: { min: 20, max: 70 },    // Wide range for speed variation
            stamina: { min: 20, max: 70 },  // Wide range for stamina variation
            power: { min: 20, max: 70 }     // Wide range for power variation
        };
        
        // Stat variation patterns to avoid clustering
        this.variationPatterns = [
            'balanced',      // All stats relatively close
            'speed_focus',   // High speed, lower others
            'stamina_focus', // High stamina, lower others  
            'power_focus',   // High power, lower others
            'speed_stamina', // High speed+stamina, low power
            'speed_power',   // High speed+power, low stamina
            'stamina_power', // High stamina+power, low speed
            'polarized',     // One very high, others very low
            'inverse'        // Opposite of typical expectations
        ];
        
        // Customization bias strength
        this.customizationBias = {
            trackType: 8,       // +/- bias for turf/dirt preference
            distance: 12,       // +/- bias for distance specialization
            strategy: 6         // +/- bias for racing strategy
        };
        
        // Heritage influence strength
        this.heritageInfluence = {
            strong: 0.15,       // 15% influence from strong parent
            moderate: 0.10,     // 10% influence from moderate parent
            weak: 0.05          // 5% influence from weak parent
        };
        
        // Variance settings for different generation types
        this.varianceSettings = {
            foundationHorse: 1.0,    // Full variance for new horses
            bredHorse: 0.8,          // Reduced variance for bred horses
            customized: 0.9          // Slightly reduced variance for customized horses
        };
    }
    
    /**
     * Generate complete horse stats with all influences applied
     * @param {Object} options - Generation options
     * @param {string} options.breed - Horse breed name
     * @param {Object} options.pedigree - Optional pedigree for inheritance
     * @param {Object} options.customization - Optional player customization
     * @param {string} options.type - Generation type ('foundation', 'bred', 'customized')
     * @returns {Object} Generated stats and metadata
     */
    generateStats(options = {}) {
        const {
            breed: breedName = 'Thoroughbred',
            pedigree = null,
            customization = null,
            type = 'foundation'
        } = options;
        
        // Get breed instance
        const breed = BreedRegistry.getBreed(breedName);
        
        // 1. Generate base random stats
        const baseStats = this.generateBaseStats(type);
        
        // 2. Apply breed influence
        const breedInfluencedStats = this.applyBreedInfluence(baseStats, breed);
        
        // 3. Apply heritage influence (if bred horse)
        const heritageStats = pedigree ? 
            this.applyHeritageInfluence(breedInfluencedStats, pedigree) : 
            breedInfluencedStats;
        
        // 4. Apply customization bias (if selected)
        const customizedStats = customization ?
            this.applyCustomizationBias(heritageStats, customization, breed) :
            heritageStats;
        
        // 5. Apply breed stat caps
        const cappedStats = breed.enforceStatCaps(customizedStats);
        
        // 6. Generate secondary attributes
        const secondaryAttributes = this.generateSecondaryAttributes(cappedStats, breed, pedigree);
        
        // Create generation report
        const generationReport = this.createGenerationReport({
            baseStats,
            breedInfluencedStats,
            heritageStats,
            customizedStats,
            finalStats: cappedStats,
            breed,
            pedigree,
            customization,
            type
        });
        
        return {
            stats: cappedStats,
            attributes: secondaryAttributes,
            generation: generationReport
        };
    }
    
    /**
     * Generate base random stats with varied patterns to avoid clustering
     * @param {string} type - Generation type affecting variance
     * @returns {Object} Base random stats with interesting variation
     */
    generateBaseStats(type) {
        // Choose a random variation pattern
        const pattern = this.variationPatterns[Math.floor(Math.random() * this.variationPatterns.length)];
        
        // Generate base stats using the selected pattern
        return this.generateStatsWithPattern(pattern, type);
    }
    
    /**
     * Generate stats using a specific variation pattern for more interesting horses
     * @param {string} pattern - The variation pattern to use
     * @param {string} type - Generation type affecting variance  
     * @returns {Object} Stats with specified pattern
     */
    generateStatsWithPattern(pattern, type) {
        const variance = this.varianceSettings[type] || 1.0;
        
        switch (pattern) {
            case 'balanced':
                return this.generateBalancedStats(variance);
            case 'speed_focus':
                return this.generateFocusedStats('speed', variance);
            case 'stamina_focus':
                return this.generateFocusedStats('stamina', variance);
            case 'power_focus':
                return this.generateFocusedStats('power', variance);
            case 'speed_stamina':
                return this.generateDualFocusStats(['speed', 'stamina'], 'power', variance);
            case 'speed_power':
                return this.generateDualFocusStats(['speed', 'power'], 'stamina', variance);
            case 'stamina_power':
                return this.generateDualFocusStats(['stamina', 'power'], 'speed', variance);
            case 'polarized':
                return this.generatePolarizedStats(variance);
            case 'inverse':
                return this.generateInverseStats(variance);
            default:
                return this.generateBalancedStats(variance);
        }
    }
    
    /**
     * Generate balanced stats where all three are relatively close
     */
    generateBalancedStats(variance) {
        const base = 35 + Math.random() * 30; // 35-65 range
        const spread = 8; // ±8 variation
        
        return {
            speed: Math.round(Math.max(20, Math.min(70, base + (Math.random() - 0.5) * spread * variance))),
            stamina: Math.round(Math.max(20, Math.min(70, base + (Math.random() - 0.5) * spread * variance))),
            power: Math.round(Math.max(20, Math.min(70, base + (Math.random() - 0.5) * spread * variance)))
        };
    }
    
    /**
     * Generate stats focused on one primary stat
     */
    generateFocusedStats(focusStat, variance) {
        const highValue = 55 + Math.random() * 15 * variance; // 55-70 range
        const lowValue = 20 + Math.random() * 25 * variance;  // 20-45 range
        
        const stats = {
            speed: Math.round(lowValue),
            stamina: Math.round(lowValue),
            power: Math.round(lowValue)
        };
        
        stats[focusStat] = Math.round(Math.min(70, highValue));
        return stats;
    }
    
    /**
     * Generate stats with two high stats and one low
     */
    generateDualFocusStats(highStats, lowStat, variance) {
        const highValue = 50 + Math.random() * 20 * variance; // 50-70 range
        const lowValue = 20 + Math.random() * 20 * variance;  // 20-40 range
        
        const stats = {
            speed: Math.round(highValue),
            stamina: Math.round(highValue),
            power: Math.round(highValue)
        };
        
        stats[lowStat] = Math.round(Math.max(20, lowValue));
        return stats;
    }
    
    /**
     * Generate very polarized stats (one very high, others very low)
     */
    generatePolarizedStats(variance) {
        const statNames = ['speed', 'stamina', 'power'];
        const chosenStat = statNames[Math.floor(Math.random() * statNames.length)];
        
        const veryHigh = 60 + Math.random() * 10 * variance; // 60-70
        const veryLow = 20 + Math.random() * 10 * variance;  // 20-30
        
        const stats = {
            speed: Math.round(veryLow),
            stamina: Math.round(veryLow),
            power: Math.round(veryLow)
        };
        
        stats[chosenStat] = Math.round(Math.min(70, veryHigh));
        return stats;
    }
    
    /**
     * Generate stats that go against typical patterns
     */
    generateInverseStats(variance) {
        // Create unusual combinations that don't follow breed stereotypes
        const patterns = [
            { speed: 65, stamina: 25, power: 40 }, // Fast but fragile
            { speed: 30, stamina: 65, power: 25 }, // Endurance specialist
            { speed: 25, stamina: 35, power: 65 }, // Pure power, slow
            { speed: 45, stamina: 45, power: 45 }, // Perfectly balanced
            { speed: 70, stamina: 30, power: 30 }  // Speed demon
        ];
        
        const basePattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // Add variance to the base pattern
        return {
            speed: Math.round(Math.max(20, Math.min(70, basePattern.speed + (Math.random() - 0.5) * 10 * variance))),
            stamina: Math.round(Math.max(20, Math.min(70, basePattern.stamina + (Math.random() - 0.5) * 10 * variance))),
            power: Math.round(Math.max(20, Math.min(70, basePattern.power + (Math.random() - 0.5) * 10 * variance)))
        };
    }
    
    /**
     * Generate a single random stat within breed-appropriate range
     * @param {string} statName - Name of the stat to generate
     * @param {number} variance - Variance multiplier (0-1)
     * @returns {number} Random stat value
     */
    generateRandomStat(statName, variance = 1.0) {
        const range = this.baseRanges[statName];
        const baseRange = range.max - range.min;
        const adjustedRange = baseRange * variance;
        const adjustedMin = range.min + (baseRange - adjustedRange) / 2;
        const adjustedMax = adjustedMin + adjustedRange;
        
        return Math.round(adjustedMin + Math.random() * (adjustedMax - adjustedMin));
    }
    
    /**
     * Apply breed-specific influences to stats
     * @param {Object} baseStats - Base random stats
     * @param {Object} breed - Breed instance
     * @returns {Object} Breed-influenced stats
     */
    applyBreedInfluence(baseStats, breed) {
        const influenced = { ...baseStats };
        
        // Apply breed growth rate tendencies to starting stats
        for (const [stat, value] of Object.entries(influenced)) {
            const breedTendency = breed.getGrowthRate(stat);
            
            if (breedTendency > 1.1) {
                // Breeds good at this stat get a small starting bonus
                influenced[stat] = Math.round(value * 1.05);
            } else if (breedTendency < 0.9) {
                // Breeds weak at this stat get a small starting penalty
                influenced[stat] = Math.round(value * 0.95);
            }
        }
        
        return influenced;
    }
    
    /**
     * Apply heritage/genetic influence from parents
     * @param {Object} baseStats - Current stats
     * @param {Object} pedigree - Pedigree information
     * @returns {Object} Heritage-influenced stats
     */
    applyHeritageInfluence(baseStats, pedigree) {
        if (!pedigree || (!pedigree.sire && !pedigree.dam)) {
            return baseStats;
        }
        
        const influenced = { ...baseStats };
        
        // Calculate parent contributions
        const parentContributions = this.calculateParentContributions(pedigree);
        
        // Apply inheritance to each stat
        for (const [stat, currentValue] of Object.entries(influenced)) {
            let heritageBonus = 0;
            
            // Sire contribution (50%)
            if (parentContributions.sire) {
                const sireInfluence = this.calculateParentInfluence(
                    parentContributions.sire.stats[stat],
                    parentContributions.sire.strength
                );
                heritageBonus += sireInfluence * 0.5;
            }
            
            // Dam contribution (50%)
            if (parentContributions.dam) {
                const damInfluence = this.calculateParentInfluence(
                    parentContributions.dam.stats[stat],
                    parentContributions.dam.strength
                );
                heritageBonus += damInfluence * 0.5;
            }
            
            // Apply heritage bonus/penalty
            influenced[stat] = Math.round(currentValue + heritageBonus);
        }
        
        // Apply hybrid vigor bonus for crossbreeding
        if (pedigree.crossBred) {
            const hybridVigor = this.calculateHybridVigor(influenced);
            for (const [stat, value] of Object.entries(influenced)) {
                influenced[stat] = Math.round(value + hybridVigor);
            }
        }
        
        // Apply inbreeding depression
        if (pedigree.inbreedingCoefficient > 0) {
            const depression = this.calculateInbreedingDepression(pedigree.inbreedingCoefficient);
            for (const [stat, value] of Object.entries(influenced)) {
                influenced[stat] = Math.round(value * (1 - depression));
            }
        }
        
        return influenced;
    }
    
    /**
     * Calculate parent contribution strength based on performance
     * @param {Object} pedigree - Pedigree information
     * @returns {Object} Parent contribution data
     */
    calculateParentContributions(pedigree) {
        const contributions = {};
        
        if (pedigree.sire) {
            contributions.sire = {
                stats: pedigree.sire.stats,
                strength: this.calculateParentStrength(pedigree.sire)
            };
        }
        
        if (pedigree.dam) {
            contributions.dam = {
                stats: pedigree.dam.stats,
                strength: this.calculateParentStrength(pedigree.dam)
            };
        }
        
        return contributions;
    }
    
    /**
     * Calculate parent strength for inheritance calculations
     * @param {Object} parent - Parent horse data
     * @returns {string} Strength category ('strong', 'moderate', 'weak')
     */
    calculateParentStrength(parent) {
        const gradeValues = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
        const gradeValue = gradeValues[parent.careerGrade] || 1;
        
        if (gradeValue >= 5) return 'strong';      // A or S grade
        if (gradeValue >= 3) return 'moderate';    // B or C grade
        return 'weak';                             // D or F grade
    }
    
    /**
     * Calculate heritage influence from a single parent
     * @param {number} parentStat - Parent's stat value
     * @param {string} strength - Parent strength category
     * @returns {number} Heritage influence modifier
     */
    calculateParentInfluence(parentStat, strength) {
        const avgStat = 40; // Average expected stat value
        const difference = parentStat - avgStat;
        const influenceStrength = this.heritageInfluence[strength] || 0.05;
        
        return difference * influenceStrength;
    }
    
    /**
     * Calculate hybrid vigor bonus for crossbred horses
     * @param {Object} stats - Current stats
     * @returns {number} Hybrid vigor bonus per stat
     */
    calculateHybridVigor(stats) {
        const totalStats = stats.speed + stats.stamina + stats.power;
        const averageStat = totalStats / 3;
        
        // Hybrid vigor: 2-5% bonus based on base quality
        const vigorPercentage = 0.02 + (averageStat / 100) * 0.03;
        return Math.round(averageStat * vigorPercentage / 3); // Per stat
    }
    
    /**
     * Calculate inbreeding depression penalty
     * @param {number} inbreedingCoefficient - Inbreeding coefficient (0-1)
     * @returns {number} Depression penalty (0-1)
     */
    calculateInbreedingDepression(inbreedingCoefficient) {
        // Linear penalty: 5% depression per 10% inbreeding
        return inbreedingCoefficient * 0.5;
    }
    
    /**
     * Apply player customization bias to stats
     * @param {Object} baseStats - Current stats
     * @param {Object} customization - Player customization choices
     * @param {Object} breed - Breed instance
     * @returns {Object} Customization-biased stats
     */
    applyCustomizationBias(baseStats, customization, breed) {
        const biased = { ...baseStats };
        
        // Apply track type preference bias
        if (customization.trackType) {
            this.applyTrackTypeBias(biased, customization.trackType, breed);
        }
        
        // Apply distance preference bias
        if (customization.distance) {
            this.applyDistanceBias(biased, customization.distance);
        }
        
        // Apply strategy preference bias
        if (customization.strategy) {
            this.applyStrategyBias(biased, customization.strategy);
        }
        
        return biased;
    }
    
    /**
     * Apply track type bias (turf vs dirt)
     * @param {Object} stats - Stats to modify
     * @param {string} trackType - Preferred track type
     * @param {Object} breed - Breed instance
     */
    applyTrackTypeBias(stats, trackType, breed) {
        const bias = this.customizationBias.trackType;
        
        if (trackType === 'turf') {
            // Turf horses tend to have more stamina and less power
            stats.stamina += Math.round(bias * 0.7);
            stats.power -= Math.round(bias * 0.3);
        } else if (trackType === 'dirt') {
            // Dirt horses tend to have more power and speed
            stats.power += Math.round(bias * 0.5);
            stats.speed += Math.round(bias * 0.5);
        }
    }
    
    /**
     * Apply distance preference bias
     * @param {Object} stats - Stats to modify
     * @param {string} distance - Preferred distance type
     */
    applyDistanceBias(stats, distance) {
        const bias = this.customizationBias.distance;
        
        switch (distance) {
            case 'sprint':
                stats.speed += bias;
                stats.power += Math.round(bias * 0.7);
                stats.stamina -= Math.round(bias * 0.5);
                break;
                
            case 'mile':
                stats.speed += Math.round(bias * 0.5);
                stats.stamina += Math.round(bias * 0.5);
                // No power modification - balanced
                break;
                
            case 'medium':
                stats.stamina += Math.round(bias * 0.8);
                stats.speed += Math.round(bias * 0.2);
                stats.power -= Math.round(bias * 0.2);
                break;
                
            case 'long':
                stats.stamina += bias;
                stats.speed -= Math.round(bias * 0.3);
                stats.power -= Math.round(bias * 0.3);
                break;
        }
    }
    
    /**
     * Apply racing strategy bias
     * @param {Object} stats - Stats to modify
     * @param {string} strategy - Preferred strategy
     */
    applyStrategyBias(stats, strategy) {
        const bias = this.customizationBias.strategy;
        
        switch (strategy) {
            case 'front':
                stats.speed += Math.round(bias * 0.8);
                stats.power += Math.round(bias * 0.5);
                stats.stamina += Math.round(bias * 0.2);
                break;
                
            case 'pace':
                // Balanced approach - small boosts to all
                stats.speed += Math.round(bias * 0.4);
                stats.stamina += Math.round(bias * 0.4);
                stats.power += Math.round(bias * 0.2);
                break;
                
            case 'late':
                stats.stamina += Math.round(bias * 0.8);
                stats.speed += Math.round(bias * 0.3);
                stats.power += Math.round(bias * 0.3);
                break;
        }
    }
    
    /**
     * Generate secondary attributes based on stats
     * @param {Object} stats - Final stats
     * @param {Object} breed - Breed instance
     * @param {Object} pedigree - Optional pedigree
     * @returns {Object} Secondary attributes
     */
    generateSecondaryAttributes(stats, breed, pedigree) {
        return {
            // Racing aptitudes
            trackPreference: this.determineTrackPreference(stats, breed),
            distanceAptitude: this.determineDistanceAptitude(stats),
            racingStyle: this.suggestRacingStyle(stats),
            
            // Development potential
            growthPotential: this.calculateGrowthPotential(stats, breed),
            trainingEfficiency: this.calculateTrainingEfficiency(stats, breed),
            
            // Genetic markers
            dominantTrait: this.identifyDominantTrait(stats),
            balanceScore: this.calculateBalanceScore(stats),
            
            // Heritage information
            heritageStrength: pedigree ? this.calculateHeritageStrength(pedigree) : 0,
            geneticDiversity: pedigree ? this.calculateGeneticDiversity(pedigree) : 1.0
        };
    }
    
    /**
     * Create detailed generation report
     * @param {Object} data - All generation data
     * @returns {Object} Comprehensive generation report
     */
    createGenerationReport(data) {
        const { baseStats, finalStats, breed, type } = data;
        
        return {
            type,
            breed: breed.name,
            
            // Stat progression
            progression: {
                base: baseStats,
                final: finalStats,
                totalGain: this.calculateTotalStatGain(baseStats, finalStats)
            },
            
            // Applied influences
            influences: {
                breed: this.summarizeBreedInfluence(data),
                heritage: this.summarizeHeritageInfluence(data),
                customization: this.summarizeCustomizationInfluence(data)
            },
            
            // Quality assessment
            quality: {
                totalStats: finalStats.speed + finalStats.stamina + finalStats.power,
                tier: this.determineTier(finalStats),
                strengths: this.identifyStatStrengths(finalStats),
                weaknesses: this.identifyStatWeaknesses(finalStats)
            },
            
            // Generation metadata
            metadata: {
                timestamp: new Date().toISOString(),
                randomSeed: Math.random().toString(36).substr(2, 9),
                version: '1.0'
            }
        };
    }
    
    /**
     * Helper methods for generation report
     */
    
    calculateTotalStatGain(baseStats, finalStats) {
        return {
            speed: finalStats.speed - baseStats.speed,
            stamina: finalStats.stamina - baseStats.stamina,
            power: finalStats.power - baseStats.power
        };
    }
    
    determineTier(stats) {
        const total = stats.speed + stats.stamina + stats.power;
        if (total >= 180) return 'Elite';
        if (total >= 150) return 'Superior';
        if (total >= 120) return 'Good';
        if (total >= 90) return 'Average';
        return 'Below Average';
    }
    
    identifyStatStrengths(stats) {
        const strengths = [];
        if (stats.speed >= 50) strengths.push('Speed');
        if (stats.stamina >= 50) strengths.push('Stamina');
        if (stats.power >= 50) strengths.push('Power');
        return strengths;
    }
    
    identifyStatWeaknesses(stats) {
        const weaknesses = [];
        if (stats.speed <= 30) weaknesses.push('Speed');
        if (stats.stamina <= 30) weaknesses.push('Stamina');
        if (stats.power <= 30) weaknesses.push('Power');
        return weaknesses;
    }
    
    determineTrackPreference(stats, breed) {
        const turfPreference = breed.getSurfacePreference('turf');
        const dirtPreference = breed.getSurfacePreference('dirt');
        
        if (Math.abs(turfPreference - dirtPreference) < 0.02) {
            return 'balanced';
        }
        
        return turfPreference > dirtPreference ? 'turf' : 'dirt';
    }
    
    determineDistanceAptitude(stats) {
        const speedRatio = stats.speed / (stats.speed + stats.stamina + stats.power);
        const staminaRatio = stats.stamina / (stats.speed + stats.stamina + stats.power);
        
        if (speedRatio > 0.4) return 'sprint';
        if (staminaRatio > 0.4) return 'distance';
        return 'mile';
    }
    
    suggestRacingStyle(stats) {
        const speedDominant = stats.speed > Math.max(stats.stamina, stats.power);
        const staminaDominant = stats.stamina > Math.max(stats.speed, stats.power);
        
        if (speedDominant) return 'Front Runner';
        if (staminaDominant) return 'Closer';
        return 'Stalker';
    }
    
    calculateGrowthPotential(stats, breed) {
        let potential = 0;
        
        for (const [stat, value] of Object.entries(stats)) {
            const cap = breed.getStatCap(stat);
            const remaining = cap - value;
            const growthRate = breed.getGrowthRate(stat);
            potential += remaining * growthRate;
        }
        
        return Math.round(potential);
    }
    
    calculateTrainingEfficiency(stats, breed) {
        const efficiencies = {};
        
        for (const [stat, value] of Object.entries(stats)) {
            const growthRate = breed.getGrowthRate(stat);
            const cap = breed.getStatCap(stat);
            const utilization = value / cap;
            
            efficiencies[stat] = growthRate * (1 - utilization);
        }
        
        return efficiencies;
    }
    
    identifyDominantTrait(stats) {
        const sortedStats = Object.entries(stats).sort(([,a], [,b]) => b - a);
        return sortedStats[0][0];
    }
    
    calculateBalanceScore(stats) {
        const values = Object.values(stats);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to balance score (0-1, where 1 is perfectly balanced)
        return Math.max(0, 1 - (standardDeviation / avg));
    }
    
    calculateHeritageStrength(pedigree) {
        return pedigree.pedigreeStrength || 0;
    }
    
    calculateGeneticDiversity(pedigree) {
        return Math.max(0, 1 - (pedigree.inbreedingCoefficient || 0));
    }
    
    summarizeBreedInfluence(data) {
        return `${data.breed.name} breed characteristics applied`;
    }
    
    summarizeHeritageInfluence(data) {
        if (!data.pedigree) return 'None - Foundation horse';
        return `${data.pedigree.lineage} bloodline influence`;
    }
    
    summarizeCustomizationInfluence(data) {
        if (!data.customization) return 'None - Random generation';
        
        const preferences = [];
        if (data.customization.trackType) preferences.push(`${data.customization.trackType} track`);
        if (data.customization.distance) preferences.push(`${data.customization.distance} distance`);
        if (data.customization.strategy) preferences.push(`${data.customization.strategy} running`);
        
        return preferences.length > 0 ? `Customized for ${preferences.join(', ')}` : 'None';
    }

    // Additional methods required by tests

    /**
     * Generate base stats with a specific seed for reproducible testing
     * @param {number} seed - Random seed for reproducible generation
     * @returns {Object} Seeded base stats
     */
    generateBaseStatsWithSeed(seed) {
        // Simple seeded random implementation
        const seededRandom = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        };

        let currentSeed = seed;
        const nextRandom = () => {
            currentSeed++;
            return seededRandom(currentSeed);
        };

        return {
            speed: Math.round(20 + nextRandom() * 60),
            stamina: Math.round(20 + nextRandom() * 60),
            power: Math.round(20 + nextRandom() * 60)
        };
    }

    /**
     * Generate stats for a specific breed with breed modifiers
     * @param {string} breedName - Name of the breed
     * @returns {Object} Breed-specific stats
     */
    generateStatsForBreed(breedName) {
        const validBreeds = ['thoroughbred', 'arabian', 'quarter horse', 'standardbred'];
        
        if (!validBreeds.includes(breedName.toLowerCase())) {
            throw new Error('Invalid breed');
        }

        const baseStats = this.generateBaseStats();
        
        // Apply breed-specific modifiers - stronger to overcome base variation
        switch (breedName.toLowerCase()) {
            case 'thoroughbred':
                return {
                    speed: Math.round(baseStats.speed * 1.25), // Very strong speed advantage
                    stamina: Math.round(baseStats.stamina * 0.90), // Stamina penalty
                    power: Math.round(baseStats.power * 1.05)
                };
            case 'arabian':
                return {
                    speed: Math.round(baseStats.speed * 0.90),
                    stamina: Math.round(baseStats.stamina * 1.30), // Very strong stamina advantage
                    power: Math.round(baseStats.power * 0.90)
                };
            case 'quarter horse':
                return {
                    speed: Math.round(baseStats.speed * 1.30), // Extremely strong speed
                    stamina: Math.round(baseStats.stamina * 0.80), // Lower stamina
                    power: Math.round(baseStats.power * 1.20)
                };
            default:
                return baseStats;
        }
    }

    /**
     * Generate inherited stats from parent horses
     * @param {Object} sireStats - Sire's stats
     * @param {Object} damStats - Dam's stats
     * @returns {Object} Offspring stats with inheritance and variation
     */
    generateInheritedStats(sireStats, damStats) {
        if (!sireStats || !damStats) {
            throw new Error('Invalid parent stats');
        }

        if (!sireStats.speed || !damStats.speed || !sireStats.stamina || !damStats.stamina || !sireStats.power || !damStats.power) {
            throw new Error('Invalid parent stats');
        }

        // Average parent stats with variation
        const averageSpeed = (sireStats.speed + damStats.speed) / 2;
        const averageStamina = (sireStats.stamina + damStats.stamina) / 2;
        const averagePower = (sireStats.power + damStats.power) / 2;

        // Add variation (±15%)
        const variation = 0.15;
        return {
            speed: Math.max(20, Math.min(80, Math.round(averageSpeed + (Math.random() - 0.5) * 2 * averageSpeed * variation))),
            stamina: Math.max(20, Math.min(80, Math.round(averageStamina + (Math.random() - 0.5) * 2 * averageStamina * variation))),
            power: Math.max(20, Math.min(80, Math.round(averagePower + (Math.random() - 0.5) * 2 * averagePower * variation)))
        };
    }

    /**
     * Apply legacy bonuses from previous careers
     * @param {Object} baseStats - Base stats to modify
     * @param {Object} legacyBonuses - Legacy bonuses to apply
     * @returns {Object} Stats with legacy bonuses applied
     */
    applyLegacyBonuses(baseStats, legacyBonuses) {
        if (!baseStats || typeof baseStats !== 'object') {
            throw new Error('Invalid stats format');
        }

        if (typeof baseStats.speed !== 'number' || typeof baseStats.stamina !== 'number' || typeof baseStats.power !== 'number') {
            throw new Error('Invalid stats format');
        }

        return {
            speed: Math.max(1, Math.min(100, baseStats.speed + (legacyBonuses.speed || 0))),
            stamina: Math.max(1, Math.min(100, baseStats.stamina + (legacyBonuses.stamina || 0))),
            power: Math.max(1, Math.min(100, baseStats.power + (legacyBonuses.power || 0)))
        };
    }

    /**
     * Generate growth potential ratings for each stat
     * @param {Object} stats - Horse stats
     * @returns {Object} Growth potential ratings (S/A/B/C/D)
     */
    generateGrowthPotential(stats) {
        const ratings = ['S', 'A', 'B', 'C', 'D'];
        
        // Higher stats tend to get better growth potential, but with randomness
        const getGrowthRating = (statValue) => {
            const baseChance = statValue / 100; // 0-1 based on stat value
            const random = Math.random();
            
            if (random < baseChance * 0.1) return 'S';
            if (random < baseChance * 0.3) return 'A';
            if (random < baseChance * 0.6) return 'B';
            if (random < baseChance * 0.8) return 'C';
            return 'D';
        };

        return {
            speed: getGrowthRating(stats.speed),
            stamina: getGrowthRating(stats.stamina),
            power: getGrowthRating(stats.power)
        };
    }
}

module.exports = StatGenerator;