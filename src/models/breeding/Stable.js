const Gender = require('./Gender');
const Pedigree = require('./Pedigree');

/**
 * Stable management system for retired horses
 * 
 * Manages the collection of retired horses available for breeding,
 * tracking their breeding records, and providing breeding pair recommendations.
 * 
 * @class Stable
 */
class Stable {
    constructor() {
        this.stallions = new Map();        // Retired male horses (sires)
        this.mares = new Map();           // Retired female horses (dams)
        this.breedings = [];              // Record of all breeding attempts
        this.capacity = 20;               // Maximum horses in stable
        this.founded = Date.now();        // When stable was established
        
        this.statistics = {
            totalRetired: 0,              // Total horses ever retired
            totalOffspring: 0,            // Total horses bred
            championOffspring: 0,         // Offspring that won championships
            averageOffspringGrade: 'F',   // Average performance of bred horses
            successfulBreedings: 0,       // Breedings that produced good horses
            foundationHorses: 0           // Horses with no pedigree
        };
        
        this.preferences = {
            autoRetire: true,             // Automatically retire career-complete horses
            retirementCriteria: {
                minGrade: 'D',            // Minimum career grade to auto-retire
                minRaces: 3               // Minimum races completed
            }
        };
    }
    
    /**
     * Retire a horse to the stable after career completion
     * @param {Object} horse - Horse object to retire
     * @param {Object} careerStats - Complete career statistics
     * @returns {Object} Retirement result with success status and details
     */
    retireHorse(horse, careerStats) {
        // Validate retirement eligibility
        if (!this.canRetire(horse, careerStats)) {
            return {
                success: false,
                reason: 'Horse does not meet retirement criteria',
                details: this.getRetirementRequirements()
            };
        }
        
        // Check stable capacity
        if (this.getTotalHorses() >= this.capacity) {
            return {
                success: false,
                reason: 'Stable is at capacity',
                details: `Maximum ${this.capacity} horses allowed`
            };
        }
        
        // Create retired horse record
        const retiredHorse = this.createRetiredHorseRecord(horse, careerStats);
        
        // Determine mature gender and add to appropriate collection
        const matureGender = Gender.getMatureGender(horse.gender);
        
        if (matureGender === Gender.STALLION) {
            this.stallions.set(horse.name, retiredHorse);
        } else if (matureGender === Gender.MARE) {
            this.mares.set(horse.name, retiredHorse);
        }
        
        // Update statistics
        this.updateRetirementStatistics(retiredHorse);
        
        return {
            success: true,
            horse: retiredHorse,
            message: `${horse.name} retired as ${Gender.getDisplayName(matureGender)}`,
            stableSize: this.getTotalHorses()
        };
    }
    
    /**
     * Check if a horse can be retired to the stable
     * @param {Object} horse - Horse to evaluate
     * @param {Object} careerStats - Career performance data
     * @returns {boolean} True if eligible for retirement
     */
    canRetire(horse, careerStats) {
        // Check if already retired
        if (this.isHorseRetired(horse.name)) {
            return false;
        }
        
        // Check minimum requirements
        const minGrade = this.preferences.retirementCriteria.minGrade;
        const minRaces = this.preferences.retirementCriteria.minRaces;
        
        const gradeOrder = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
        const horseGradeValue = gradeOrder[careerStats.finalGrade] || 0;
        const minGradeValue = gradeOrder[minGrade] || 0;
        
        return (
            horseGradeValue >= minGradeValue &&
            (careerStats.totalRaces || 0) >= minRaces
        );
    }
    
    /**
     * Create a standardized retired horse record
     * @param {Object} horse - Original horse object
     * @param {Object} careerStats - Career statistics
     * @returns {Object} Standardized retired horse record
     */
    createRetiredHorseRecord(horse, careerStats) {
        return {
            // Basic information
            name: horse.name,
            originalGender: horse.gender,
            matureGender: Gender.getMatureGender(horse.gender),
            breed: horse.breed,
            specialization: horse.specialization,
            racingStyle: horse.racingStyle,
            
            // Final stats
            stats: { ...horse.stats },
            bond: horse.bond || horse.friendship || 0,
            
            // Career performance
            careerGrade: careerStats.finalGrade,
            totalRaces: careerStats.totalRaces || 0,
            racesWon: careerStats.racesWon || 0,
            winRate: careerStats.totalRaces > 0 ? 
                Math.round((careerStats.racesWon / careerStats.totalRaces) * 100) : 0,
            achievements: careerStats.achievements || [],
            
            // Breeding information
            pedigree: horse.pedigree || null,
            geneticTraits: horse.geneticTraits || [],
            breedingRecord: {
                timesUsed: 0,
                offspring: [],
                successfulOffspring: 0,
                championOffspring: 0
            },
            
            // Metadata
            retiredDate: new Date().toISOString(),
            retiredTurn: careerStats.finalTurn || 24,
            stableGeneration: this.calculateStableGeneration(horse.pedigree)
        };
    }
    
    /**
     * Calculate which generation this horse represents in the stable
     * @param {Object} pedigree - Horse's pedigree
     * @returns {number} Generation number (1 = foundation, 2+ = bred)
     */
    calculateStableGeneration(pedigree) {
        if (!pedigree || (!pedigree.sire && !pedigree.dam)) {
            return 1; // Foundation horse
        }
        
        return pedigree.generations + 1;
    }
    
    /**
     * Get all available stallions for breeding
     * @param {Object} filters - Optional filters for stallion selection
     * @returns {Array<Object>} Array of available stallions
     */
    getAvailableStallions(filters = {}) {
        let stallions = Array.from(this.stallions.values());
        
        // Apply filters
        if (filters.breed) {
            stallions = stallions.filter(s => s.breed === filters.breed);
        }
        
        if (filters.specialization) {
            stallions = stallions.filter(s => s.specialization === filters.specialization);
        }
        
        if (filters.minGrade) {
            const minGradeValue = this.getGradeValue(filters.minGrade);
            stallions = stallions.filter(s => this.getGradeValue(s.careerGrade) >= minGradeValue);
        }
        
        if (filters.maxInbreeding) {
            stallions = stallions.filter(s => {
                const inbreeding = s.pedigree?.inbreedingCoefficient || 0;
                return inbreeding <= filters.maxInbreeding;
            });
        }
        
        // Sort by breeding desirability
        return stallions.sort((a, b) => this.compareBreedingDesirability(a, b));
    }
    
    /**
     * Get all available mares for breeding
     * @param {Object} filters - Optional filters for mare selection
     * @returns {Array<Object>} Array of available mares
     */
    getAvailableMares(filters = {}) {
        let mares = Array.from(this.mares.values());
        
        // Apply same filters as stallions
        if (filters.breed) {
            mares = mares.filter(m => m.breed === filters.breed);
        }
        
        if (filters.specialization) {
            mares = mares.filter(m => m.specialization === filters.specialization);
        }
        
        if (filters.minGrade) {
            const minGradeValue = this.getGradeValue(filters.minGrade);
            mares = mares.filter(m => this.getGradeValue(m.careerGrade) >= minGradeValue);
        }
        
        if (filters.maxInbreeding) {
            mares = mares.filter(m => {
                const inbreeding = m.pedigree?.inbreedingCoefficient || 0;
                return inbreeding <= filters.maxInbreeding;
            });
        }
        
        // Sort by breeding desirability  
        return mares.sort((a, b) => this.compareBreedingDesirability(a, b));
    }
    
    /**
     * Get breeding recommendations for a specific horse
     * @param {Object} targetHorse - Horse to find breeding matches for
     * @param {number} maxSuggestions - Maximum number of suggestions to return
     * @returns {Array<Object>} Array of breeding recommendations
     */
    getBreedingRecommendations(targetHorse, maxSuggestions = 5) {
        const isTargetMale = Gender.isMale(targetHorse.matureGender);
        const availablePartners = isTargetMale ? this.getAvailableMares() : this.getAvailableStallions();
        
        const recommendations = availablePartners.map(partner => {
            const compatibility = this.calculateBreedingCompatibility(targetHorse, partner);
            
            return {
                partner,
                compatibilityScore: compatibility.overall,
                advantages: compatibility.advantages,
                concerns: compatibility.concerns,
                expectedOutcome: compatibility.expectedOutcome,
                breedingType: this.classifyBreedingType(targetHorse, partner)
            };
        });
        
        // Sort by compatibility score and return top suggestions
        return recommendations
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, maxSuggestions);
    }
    
    /**
     * Calculate breeding compatibility between two horses
     * @param {Object} horse1 - First horse
     * @param {Object} horse2 - Second horse
     * @returns {Object} Compatibility analysis
     */
    calculateBreedingCompatibility(horse1, horse2) {
        const analysis = {
            overall: 0,
            advantages: [],
            concerns: [],
            expectedOutcome: {}
        };
        
        let compatibilityScore = 50; // Base score
        
        // Breed compatibility
        if (horse1.breed === horse2.breed) {
            compatibilityScore += 10;
            analysis.advantages.push('Same breed - consistent traits');
        } else {
            compatibilityScore += 5;
            analysis.advantages.push('Cross-breeding - hybrid vigor potential');
        }
        
        // Performance compatibility
        const avgGrade1 = this.getGradeValue(horse1.careerGrade);
        const avgGrade2 = this.getGradeValue(horse2.careerGrade);
        const combinedGradeScore = (avgGrade1 + avgGrade2) / 2;
        compatibilityScore += combinedGradeScore * 5;
        
        if (combinedGradeScore >= 5) {
            analysis.advantages.push('Both parents have strong racing records');
        }
        
        // Specialization synergy
        if (horse1.specialization === horse2.specialization) {
            compatibilityScore += 5;
            analysis.advantages.push('Matching specializations - focused breeding');
        } else {
            analysis.advantages.push('Diverse specializations - versatile offspring');
        }
        
        // Inbreeding check
        const inbreeding = this.calculatePotentialInbreeding(horse1, horse2);
        if (inbreeding > 0.2) {
            compatibilityScore -= 15;
            analysis.concerns.push('Potential inbreeding detected');
        } else if (inbreeding > 0.1) {
            compatibilityScore -= 5;
            analysis.concerns.push('Some line breeding present');
        }
        
        // Stat complementarity
        const statSynergy = this.calculateStatSynergy(horse1.stats, horse2.stats);
        compatibilityScore += statSynergy;
        
        if (statSynergy > 5) {
            analysis.advantages.push('Complementary stat distributions');
        }
        
        analysis.overall = Math.max(0, Math.min(100, compatibilityScore));
        
        return analysis;
    }
    
    /**
     * Record a breeding attempt and its outcome
     * @param {Object} sire - Father horse
     * @param {Object} dam - Mother horse  
     * @param {Object} offspring - Resulting foal
     * @returns {Object} Breeding record
     */
    recordBreeding(sire, dam, offspring) {
        const breedingRecord = {
            sire: sire.name,
            dam: dam.name,
            offspring: offspring.name,
            date: new Date().toISOString(),
            breedingType: this.classifyBreedingType(sire, dam),
            expectedGrade: this.predictOffspringGrade(sire, dam),
            actualGrade: null, // Will be updated when offspring completes career
            success: false     // Will be updated based on offspring performance
        };
        
        this.breedings.push(breedingRecord);
        
        // Update parent breeding records
        if (this.stallions.has(sire.name)) {
            const stallion = this.stallions.get(sire.name);
            stallion.breedingRecord.timesUsed++;
            stallion.breedingRecord.offspring.push(offspring.name);
        }
        
        if (this.mares.has(dam.name)) {
            const mare = this.mares.get(dam.name);
            mare.breedingRecord.timesUsed++;
            mare.breedingRecord.offspring.push(offspring.name);
        }
        
        this.statistics.totalOffspring++;
        
        return breedingRecord;
    }
    
    /**
     * Helper methods for breeding calculations
     */
    
    isHorseRetired(name) {
        return this.stallions.has(name) || this.mares.has(name);
    }
    
    getTotalHorses() {
        return this.stallions.size + this.mares.size;
    }
    
    getGradeValue(grade) {
        const gradeValues = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
        return gradeValues[grade] || 1;
    }
    
    compareBreedingDesirability(horse1, horse2) {
        const score1 = this.getGradeValue(horse1.careerGrade) + (horse1.winRate / 10);
        const score2 = this.getGradeValue(horse2.careerGrade) + (horse2.winRate / 10);
        return score2 - score1;
    }
    
    calculatePotentialInbreeding(horse1, horse2) {
        // Simplified inbreeding calculation
        if (!horse1.pedigree || !horse2.pedigree) return 0;
        
        const ancestors1 = this.getAncestorNames(horse1.pedigree);
        const ancestors2 = this.getAncestorNames(horse2.pedigree);
        
        const commonAncestors = ancestors1.filter(name => ancestors2.includes(name));
        return commonAncestors.length * 0.125; // 12.5% per common ancestor
    }
    
    getAncestorNames(pedigree) {
        const names = [];
        if (pedigree.sire) names.push(pedigree.sire.name);
        if (pedigree.dam) names.push(pedigree.dam.name);
        return names;
    }
    
    calculateStatSynergy(stats1, stats2) {
        // Reward complementary stats (high + low = good)
        let synergy = 0;
        
        const statPairs = [
            [stats1.speed, stats2.speed],
            [stats1.stamina, stats2.stamina],
            [stats1.power, stats2.power]
        ];
        
        statPairs.forEach(([stat1, stat2]) => {
            const avg = (stat1 + stat2) / 2;
            if (avg > 75) synergy += 3;
            else if (avg > 60) synergy += 1;
        });
        
        return synergy;
    }
    
    classifyBreedingType(horse1, horse2) {
        if (horse1.breed === horse2.breed) {
            return 'purebred';
        } else {
            return 'crossbred';
        }
    }
    
    predictOffspringGrade(sire, dam) {
        const avgGrade = (this.getGradeValue(sire.careerGrade) + this.getGradeValue(dam.careerGrade)) / 2;
        const gradeMap = ['F', 'F', 'D', 'C', 'B', 'A', 'S'];
        return gradeMap[Math.floor(avgGrade)] || 'F';
    }
    
    updateRetirementStatistics(horse) {
        this.statistics.totalRetired++;
        if (!horse.pedigree || (!horse.pedigree.sire && !horse.pedigree.dam)) {
            this.statistics.foundationHorses++;
        }
    }
    
    getRetirementRequirements() {
        return {
            minimumGrade: this.preferences.retirementCriteria.minGrade,
            minimumRaces: this.preferences.retirementCriteria.minRaces,
            capacityRemaining: this.capacity - this.getTotalHorses()
        };
    }
    
    /**
     * Get comprehensive stable statistics
     * @returns {Object} Detailed stable statistics
     */
    getStableStatistics() {
        return {
            ...this.statistics,
            currentHorses: {
                stallions: this.stallions.size,
                mares: this.mares.size,
                total: this.getTotalHorses(),
                capacity: this.capacity,
                utilizationRate: Math.round((this.getTotalHorses() / this.capacity) * 100)
            },
            breedings: {
                total: this.breedings.length,
                successful: this.statistics.successfulBreedings,
                successRate: this.breedings.length > 0 ? 
                    Math.round((this.statistics.successfulBreedings / this.breedings.length) * 100) : 0
            }
        };
    }
    
    /**
     * Serialize stable to JSON for save/load
     * @returns {Object} Serializable stable data
     */
    toJSON() {
        return {
            stallions: Array.from(this.stallions.entries()),
            mares: Array.from(this.mares.entries()),
            breedings: this.breedings,
            capacity: this.capacity,
            founded: this.founded,
            statistics: this.statistics,
            preferences: this.preferences
        };
    }
    
    /**
     * Create stable from JSON data (for save/load)
     * @param {Object} data - Serialized stable data
     * @returns {Stable} Restored stable instance
     */
    static fromJSON(data) {
        const stable = new Stable();
        
        stable.stallions = new Map(data.stallions || []);
        stable.mares = new Map(data.mares || []);
        stable.breedings = data.breedings || [];
        stable.capacity = data.capacity || 20;
        stable.founded = data.founded || Date.now();
        stable.statistics = { ...stable.statistics, ...data.statistics };
        stable.preferences = { ...stable.preferences, ...data.preferences };
        
        return stable;
    }
}

module.exports = Stable;