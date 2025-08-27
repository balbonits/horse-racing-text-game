const Gender = require('../models/breeding/Gender');
const Pedigree = require('../models/breeding/Pedigree');
const StatGenerator = require('../models/generation/StatGenerator');
const BreedRegistry = require('../models/breeds/BreedRegistry');
const SpecializationRegistry = require('../models/specializations/SpecializationRegistry');
const RacingStyleRegistry = require('../models/styles/RacingStyleRegistry');
const Character = require('../models/Character');

/**
 * Enhanced Character Creation Engine for v1.0
 * 
 * Provides three distinct paths for creating new horses:
 * 1. Create Random Horse - Full randomization with variety
 * 2. Breed New Horse - Select parents from stable for inheritance
 * 3. Customize New Horse - Choose single preference with bias
 * 
 * @class CharacterCreationEngine
 */
class CharacterCreationEngine {
    constructor(stable = null) {
        this.stable = stable;
        this.statGenerator = new StatGenerator();
        this.breedRegistry = BreedRegistry;
        this.specializationRegistry = SpecializationRegistry;
        this.styleRegistry = RacingStyleRegistry;
    }
    
    /**
     * Create a new horse using random generation
     * @param {Object} options - Creation options
     * @param {string} options.name - Horse name (optional, will generate if not provided)
     * @param {boolean} options.showProcess - Whether to return detailed generation info
     * @returns {Object} Created character and creation info
     */
    createRandomHorse(options = {}) {
        const { name, showProcess = false } = options;
        
        // 1. Generate random attributes
        const breed = this.getRandomBreed();
        const gender = Gender.getRandomRacingGender();
        const horseName = name || this.generateRandomName(gender, breed);
        
        // 2. Generate stats with randomization
        const statGeneration = this.statGenerator.generateStats({
            breed: breed.name,
            type: 'foundation'
        });
        
        // 3. Assign random specialization and style based on stats
        const specialization = this.suggestSpecializationFromStats(statGeneration.stats);
        const racingStyle = this.suggestRacingStyleFromStats(statGeneration.stats);
        
        // 4. Create character
        const character = new Character(horseName, {
            breed: breed.name,
            gender,
            specialization: specialization.name,
            racingStyle: racingStyle.name,
            stats: statGeneration.stats,
            pedigree: null, // Foundation horse
            attributes: statGeneration.attributes
        });
        
        // 5. Create detailed creation info
        const creationInfo = {
            method: 'Random Generation',
            breed: breed.name,
            gender: Gender.getDisplayName(gender),
            specialization: specialization.name,
            racingStyle: racingStyle.name,
            generation: statGeneration.generation,
            recommendations: this.getRandomHorseRecommendations(character)
        };
        
        return {
            character,
            creationInfo: showProcess ? creationInfo : null,
            success: true,
            message: `${horseName} created through random generation`
        };
    }
    
    /**
     * Create a new horse through breeding
     * @param {Object} options - Breeding options
     * @param {string} options.sireName - Name of sire from stable
     * @param {string} options.damName - Name of dam from stable  
     * @param {string} options.name - Foal name (optional)
     * @param {boolean} options.showProcess - Whether to return detailed breeding info
     * @returns {Object} Created character and breeding info
     */
    breedNewHorse(options = {}) {
        const { sireName, damName, name, showProcess = false } = options;
        
        // 1. Validate stable and breeding pair
        if (!this.stable) {
            return {
                success: false,
                message: 'No stable available for breeding'
            };
        }
        
        const validationResult = this.validateBreedingPair(sireName, damName);
        if (!validationResult.valid) {
            return {
                success: false,
                message: validationResult.reason
            };
        }
        
        const sire = validationResult.sire;
        const dam = validationResult.dam;
        
        // 2. Create pedigree
        const pedigree = new Pedigree(sire, dam);
        
        // 3. Determine offspring breed (favor sire's breed with some variation)
        const offspringBreed = this.determineOffspringBreed(sire, dam);
        
        // 4. Generate gender for offspring
        const gender = Gender.getRandomRacingGender();
        
        // 5. Generate name
        const foalName = name || this.generateBreedingName(sire.name, dam.name, gender);
        
        // 6. Generate stats with heritage influence
        const statGeneration = this.statGenerator.generateStats({
            breed: offspringBreed,
            pedigree,
            type: 'bred'
        });
        
        // 7. Inherit or determine specialization and racing style
        const specialization = this.inheritSpecialization(sire, dam, statGeneration.stats);
        const racingStyle = this.inheritRacingStyle(sire, dam, statGeneration.stats);
        
        // 8. Create character
        const character = new Character(foalName, {
            breed: offspringBreed,
            gender,
            specialization: specialization.name,
            racingStyle: racingStyle.name,
            stats: statGeneration.stats,
            pedigree,
            attributes: statGeneration.attributes
        });
        
        // 9. Record breeding in stable
        if (this.stable) {
            this.stable.recordBreeding(sire, dam, character);
        }
        
        // 10. Create detailed breeding info
        const breedingInfo = {
            method: 'Breeding',
            parents: {
                sire: { name: sire.name, breed: sire.breed, grade: sire.careerGrade },
                dam: { name: dam.name, breed: dam.breed, grade: dam.careerGrade }
            },
            offspring: {
                name: foalName,
                breed: offspringBreed,
                gender: Gender.getDisplayName(gender)
            },
            pedigree: pedigree.getDisplayInfo(),
            inheritance: {
                specialization: specialization.name,
                racingStyle: racingStyle.name
            },
            generation: statGeneration.generation,
            predictions: this.predictOffspringPotential(character, sire, dam),
            recommendations: this.getBreedingRecommendations(character, pedigree)
        };
        
        return {
            character,
            breedingInfo: showProcess ? breedingInfo : null,
            success: true,
            message: `${foalName} bred from ${sire.name} x ${dam.name}`
        };
    }
    
    /**
     * Create a customized horse with player preferences
     * @param {Object} options - Customization options
     * @param {string} options.name - Horse name (optional)
     * @param {Object} options.customization - Single customization preference
     * @param {boolean} options.showProcess - Whether to return detailed customization info
     * @returns {Object} Created character and customization info
     */
    customizeNewHorse(options = {}) {
        const { name, customization, showProcess = false } = options;
        
        // 1. Validate customization (only one preference allowed)
        const validationResult = this.validateCustomization(customization);
        if (!validationResult.valid) {
            return {
                success: false,
                message: validationResult.reason
            };
        }
        
        // 2. Generate random base attributes
        const breed = this.getRandomBreed();
        const gender = Gender.getRandomRacingGender();
        const horseName = name || this.generateCustomizedName(gender, breed, customization);
        
        // 3. Generate stats with customization bias
        const statGeneration = this.statGenerator.generateStats({
            breed: breed.name,
            customization,
            type: 'customized'
        });
        
        // 4. Choose specialization and style based on customization and stats
        const specialization = this.deriveSpecializationFromCustomization(customization, statGeneration.stats);
        const racingStyle = this.deriveRacingStyleFromCustomization(customization, statGeneration.stats);
        
        // 5. Create character
        const character = new Character(horseName, {
            breed: breed.name,
            gender,
            specialization: specialization.name,
            racingStyle: racingStyle.name,
            stats: statGeneration.stats,
            pedigree: null, // Foundation horse with customization
            attributes: statGeneration.attributes,
            customization // Store customization for reference
        });
        
        // 6. Create detailed customization info
        const customizationInfo = {
            method: 'Customized Creation',
            breed: breed.name,
            gender: Gender.getDisplayName(gender),
            customization: this.describeCustomization(customization),
            specialization: specialization.name,
            racingStyle: racingStyle.name,
            generation: statGeneration.generation,
            advantages: this.getCustomizationAdvantages(customization, character),
            recommendations: this.getCustomizationRecommendations(character, customization)
        };
        
        return {
            character,
            customizationInfo: showProcess ? customizationInfo : null,
            success: true,
            message: `${horseName} created with ${this.describeCustomization(customization)} preference`
        };
    }
    
    /**
     * Get available creation options for UI display
     * @returns {Object} Available options for each creation method
     */
    getCreationOptions() {
        return {
            random: {
                available: true,
                description: 'Create a completely random horse with varied stats and attributes',
                features: ['Random breed', 'Random stats', 'Random specialization', 'High variety']
            },
            
            breeding: {
                available: this.stable && this.stable.getTotalHorses() >= 2,
                description: 'Breed from your stable horses for genetic inheritance',
                features: ['Parent selection', 'Genetic inheritance', 'Pedigree tracking', 'Heritage bonuses'],
                requirements: this.getBreedingRequirements()
            },
            
            customization: {
                available: true,
                description: 'Choose one racing preference to influence development',
                features: ['Single preference choice', 'Stat bias', 'Controlled randomization', 'Strategic focus'],
                options: this.getCustomizationOptions()
            }
        };
    }
    
    /**
     * Validation and helper methods
     */
    
    validateBreedingPair(sireName, damName) {
        if (!sireName || !damName) {
            return { valid: false, reason: 'Both sire and dam must be selected' };
        }
        
        if (sireName === damName) {
            return { valid: false, reason: 'Cannot breed a horse with itself' };
        }
        
        const sire = this.stable.stallions.get(sireName);
        const dam = this.stable.mares.get(damName);
        
        if (!sire) {
            return { valid: false, reason: `Sire ${sireName} not found in stable` };
        }
        
        if (!dam) {
            return { valid: false, reason: `Dam ${damName} not found in stable` };
        }
        
        // Check for excessive inbreeding
        const potentialInbreeding = this.calculatePotentialInbreeding(sire, dam);
        if (potentialInbreeding > 0.4) {
            return { valid: false, reason: 'Excessive inbreeding - choose different parents' };
        }
        
        return { valid: true, sire, dam };
    }
    
    validateCustomization(customization) {
        if (!customization) {
            return { valid: false, reason: 'No customization preference selected' };
        }
        
        const preferences = Object.keys(customization).filter(key => customization[key]);
        
        if (preferences.length === 0) {
            return { valid: false, reason: 'Must select one customization preference' };
        }
        
        if (preferences.length > 1) {
            return { valid: false, reason: 'Only one customization preference allowed' };
        }
        
        const validPreferences = ['trackType', 'distance', 'strategy'];
        const selectedPreference = preferences[0];
        
        if (!validPreferences.includes(selectedPreference)) {
            return { valid: false, reason: `Invalid preference: ${selectedPreference}` };
        }
        
        return { valid: true, preference: selectedPreference };
    }
    
    getRandomBreed() {
        const breedNames = this.breedRegistry.getBreedNames();
        const randomIndex = Math.floor(Math.random() * breedNames.length);
        return this.breedRegistry.getBreed(breedNames[randomIndex]);
    }
    
    suggestSpecializationFromStats(stats) {
        const statRatios = {
            speed: stats.speed / (stats.speed + stats.stamina + stats.power),
            stamina: stats.stamina / (stats.speed + stats.stamina + stats.power),
            power: stats.power / (stats.speed + stats.stamina + stats.power)
        };
        
        if (statRatios.speed > 0.4) {
            return this.specializationRegistry.getSpecialization('Sprinter');
        } else if (statRatios.stamina > 0.4) {
            return this.specializationRegistry.getSpecialization('Stayer');
        } else {
            return this.specializationRegistry.getSpecialization('Miler');
        }
    }
    
    suggestRacingStyleFromStats(stats) {
        const speedDominant = stats.speed > Math.max(stats.stamina, stats.power);
        const staminaDominant = stats.stamina > Math.max(stats.speed, stats.power);
        
        if (speedDominant) {
            return this.styleRegistry.getStyle('Front Runner');
        } else if (staminaDominant) {
            return this.styleRegistry.getStyle('Closer');
        } else {
            return this.styleRegistry.getStyle('Stalker');
        }
    }
    
    determineOffspringBreed(sire, dam) {
        // If same breed, offspring is that breed
        if (sire.breed === dam.breed) {
            return sire.breed;
        }
        
        // For crossbreeding, favor sire's breed (traditional convention)
        return Math.random() < 0.6 ? sire.breed : dam.breed;
    }
    
    inheritSpecialization(sire, dam, stats) {
        // 50% chance to inherit from either parent, 30% based on stats, 20% random
        const inheritanceRoll = Math.random();
        
        if (inheritanceRoll < 0.25) {
            return this.specializationRegistry.getSpecialization(sire.specialization);
        } else if (inheritanceRoll < 0.5) {
            return this.specializationRegistry.getSpecialization(dam.specialization);
        } else if (inheritanceRoll < 0.8) {
            return this.suggestSpecializationFromStats(stats);
        } else {
            // Random specialization
            const specs = this.specializationRegistry.getSpecializationNames();
            return this.specializationRegistry.getSpecialization(specs[Math.floor(Math.random() * specs.length)]);
        }
    }
    
    inheritRacingStyle(sire, dam, stats) {
        // Similar inheritance pattern for racing style
        const inheritanceRoll = Math.random();
        
        if (inheritanceRoll < 0.25) {
            return this.styleRegistry.getStyle(sire.racingStyle);
        } else if (inheritanceRoll < 0.5) {
            return this.styleRegistry.getStyle(dam.racingStyle);
        } else if (inheritanceRoll < 0.8) {
            return this.suggestRacingStyleFromStats(stats);
        } else {
            // Random style
            const styles = this.styleRegistry.getStyleNames();
            return this.styleRegistry.getStyle(styles[Math.floor(Math.random() * styles.length)]);
        }
    }
    
    deriveSpecializationFromCustomization(customization, stats) {
        if (customization.distance) {
            switch (customization.distance) {
                case 'sprint':
                    return this.specializationRegistry.getSpecialization('Sprinter');
                case 'mile':
                case 'medium':
                    return this.specializationRegistry.getSpecialization('Miler');
                case 'long':
                    return this.specializationRegistry.getSpecialization('Stayer');
            }
        }
        
        // Fall back to stat-based suggestion
        return this.suggestSpecializationFromStats(stats);
    }
    
    deriveRacingStyleFromCustomization(customization, stats) {
        if (customization.strategy) {
            switch (customization.strategy) {
                case 'front':
                    return this.styleRegistry.getStyle('Front Runner');
                case 'pace':
                    return this.styleRegistry.getStyle('Stalker');
                case 'late':
                    return this.styleRegistry.getStyle('Closer');
            }
        }
        
        // Fall back to stat-based suggestion
        return this.suggestRacingStyleFromStats(stats);
    }
    
    calculatePotentialInbreeding(sire, dam) {
        // Simplified inbreeding calculation
        if (!sire.pedigree || !dam.pedigree) return 0;
        
        // Check for common ancestors
        let commonAncestors = 0;
        
        if (sire.pedigree.sire?.name === dam.pedigree.sire?.name) commonAncestors++;
        if (sire.pedigree.dam?.name === dam.pedigree.dam?.name) commonAncestors++;
        if (sire.pedigree.sire?.name === dam.pedigree.dam?.name) commonAncestors++;
        if (sire.pedigree.dam?.name === dam.pedigree.sire?.name) commonAncestors++;
        
        return commonAncestors * 0.125; // 12.5% per common ancestor
    }
    
    // Name generation methods
    generateRandomName(gender, breed) {
        // Simple name generation - in a full implementation, this would be more sophisticated
        const prefixes = ['Thunder', 'Lightning', 'Storm', 'Fire', 'Silver', 'Gold', 'Royal', 'Swift'];
        const suffixes = ['King', 'Queen', 'Runner', 'Dancer', 'Strike', 'Flash', 'Spirit', 'Legend'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix} ${suffix}`;
    }
    
    generateBreedingName(sireName, damName, gender) {
        // Create name that reflects parentage
        const sireFirst = sireName.split(' ')[0];
        const damFirst = damName.split(' ')[0];
        
        if (Math.random() < 0.5) {
            return `${sireFirst}'s ${Gender.isMale(gender) ? 'Prince' : 'Princess'}`;
        } else {
            return `${damFirst} ${Gender.isMale(gender) ? 'Colt' : 'Filly'}`;
        }
    }
    
    generateCustomizedName(gender, breed, customization) {
        // Generate name that reflects customization
        const baseName = this.generateRandomName(gender, breed);
        
        if (customization.trackType === 'turf') {
            return `Turf ${baseName}`;
        } else if (customization.distance === 'sprint') {
            return `Sprint ${baseName}`;
        } else if (customization.strategy === 'front') {
            return `Front ${baseName}`;
        }
        
        return baseName;
    }
    
    // Information methods for UI display
    getBreedingRequirements() {
        if (!this.stable) {
            return ['Stable required for breeding'];
        }
        
        const requirements = [];
        const stallionCount = this.stable.stallions.size;
        const mareCount = this.stable.mares.size;
        
        if (stallionCount === 0) requirements.push('At least one stallion needed');
        if (mareCount === 0) requirements.push('At least one mare needed');
        if (stallionCount + mareCount < 2) requirements.push('At least two horses needed in stable');
        
        return requirements.length > 0 ? requirements : ['Ready for breeding'];
    }
    
    getCustomizationOptions() {
        return {
            trackType: {
                label: 'Track Preference',
                options: {
                    turf: 'Turf Track Specialist',
                    dirt: 'Dirt Track Specialist'
                },
                description: 'Influence surface performance and stat distribution'
            },
            
            distance: {
                label: 'Distance Preference',
                options: {
                    sprint: 'Sprint (1000-1400m)',
                    mile: 'Mile (1400-1600m)',
                    medium: 'Medium (1600-2000m)',
                    long: 'Long (2000m+)'
                },
                description: 'Bias stats toward preferred race distances'
            },
            
            strategy: {
                label: 'Racing Strategy',
                options: {
                    front: 'Front Runner',
                    pace: 'Stalker/Pace',
                    late: 'Closer/Late'
                },
                description: 'Influence racing style and energy management'
            }
        };
    }
    
    describeCustomization(customization) {
        if (customization.trackType) {
            return `${customization.trackType} track specialist`;
        } else if (customization.distance) {
            return `${customization.distance} distance specialist`;
        } else if (customization.strategy) {
            return `${customization.strategy} running specialist`;
        }
        
        return 'unknown preference';
    }
    
    getRandomHorseRecommendations(character) {
        return [
            'Random horses offer maximum variety and surprise',
            'Use training to develop stats based on natural tendencies',
            'Adapt racing strategy to discovered strengths'
        ];
    }
    
    getBreedingRecommendations(character, pedigree) {
        const recommendations = [];
        
        if (pedigree.pedigreeStrength > 80) {
            recommendations.push('Elite breeding - expect superior performance potential');
        }
        
        if (pedigree.crossBred) {
            recommendations.push('Cross-bred vigor may provide stat bonuses');
        }
        
        if (pedigree.inbreedingCoefficient > 0.1) {
            recommendations.push('Some inbreeding present - monitor for trait concentration');
        }
        
        return recommendations;
    }
    
    getCustomizationAdvantages(customization, character) {
        const advantages = [];
        
        if (customization.trackType) {
            advantages.push(`Enhanced performance on ${customization.trackType} tracks`);
        }
        
        if (customization.distance) {
            advantages.push(`Optimized for ${customization.distance} distance racing`);
        }
        
        if (customization.strategy) {
            advantages.push(`Natural aptitude for ${customization.strategy} running tactics`);
        }
        
        return advantages;
    }
    
    getCustomizationRecommendations(character, customization) {
        return [
            'Focus training on your chosen specialty area',
            'Select races that match your customization preference',
            'Use your specialized strengths strategically'
        ];
    }
    
    predictOffspringPotential(character, sire, dam) {
        const avgParentGrade = this.calculateAverageParentGrade(sire.careerGrade, dam.careerGrade);
        const expectedPerformance = this.predictPerformanceFromStats(character.stats);
        
        return {
            expectedGrade: avgParentGrade,
            performanceTier: expectedPerformance,
            strengths: this.identifyOffspringStrengths(character, sire, dam),
            challenges: this.identifyOffspringChallenges(character, sire, dam)
        };
    }
    
    calculateAverageParentGrade(sireGrade, damGrade) {
        const gradeValues = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
        const avgValue = (gradeValues[sireGrade] + gradeValues[damGrade]) / 2;
        const grades = ['F', 'F', 'D', 'C', 'B', 'A', 'S'];
        return grades[Math.floor(avgValue)] || 'F';
    }
    
    predictPerformanceFromStats(stats) {
        const total = stats.speed + stats.stamina + stats.power;
        if (total >= 180) return 'Elite';
        if (total >= 150) return 'Superior';
        if (total >= 120) return 'Good';
        return 'Average';
    }
    
    identifyOffspringStrengths(character, sire, dam) {
        const strengths = [];
        
        if (sire.careerGrade === 'A' || sire.careerGrade === 'S') {
            strengths.push(`Strong paternal lineage from ${sire.name}`);
        }
        
        if (dam.careerGrade === 'A' || dam.careerGrade === 'S') {
            strengths.push(`Excellent maternal heritage from ${dam.name}`);
        }
        
        if (character.pedigree.crossBred) {
            strengths.push('Hybrid vigor from cross-breeding');
        }
        
        return strengths;
    }
    
    identifyOffspringChallenges(character, sire, dam) {
        const challenges = [];
        
        if (character.pedigree.inbreedingCoefficient > 0.15) {
            challenges.push('Moderate inbreeding may affect performance');
        }
        
        if (sire.careerGrade === 'D' || sire.careerGrade === 'F') {
            challenges.push('Paternal performance was below average');
        }
        
        if (dam.careerGrade === 'D' || dam.careerGrade === 'F') {
            challenges.push('Maternal performance was below average');
        }
        
        return challenges;
    }
}

module.exports = CharacterCreationEngine;