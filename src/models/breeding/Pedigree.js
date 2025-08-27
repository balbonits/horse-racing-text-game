/**
 * Pedigree system for tracking horse lineage and heritage
 * 
 * Maintains family tree information up to 3 generations (parents, grandparents, great-grandparents)
 * following real-world Thoroughbred pedigree conventions and breeding practices.
 * 
 * @class Pedigree
 */
class Pedigree {
    /**
     * Create a pedigree record
     * @param {Object} sire - Father's information
     * @param {Object} dam - Mother's information
     * @param {Object} options - Additional pedigree options
     */
    constructor(sire = null, dam = null, options = {}) {
        this.sire = sire ? this.createParentRecord(sire) : null;
        this.dam = dam ? this.createParentRecord(dam) : null;
        this.generations = this.calculateGenerations();
        this.inbreedingCoefficient = this.calculateInbreeding();
        this.created = new Date().toISOString();
        this.lineage = this.buildLineage();
        
        // Additional metadata
        this.crossBred = this.isCrossBred();
        this.foundationLines = this.identifyFoundationLines();
        this.pedigreeStrength = this.calculatePedigreeStrength();
    }
    
    /**
     * Create a standardized parent record from horse data
     * @param {Object} parent - Parent horse object
     * @returns {Object} Standardized parent record
     */
    createParentRecord(parent) {
        return {
            name: parent.name || 'Unknown',
            breed: parent.breed || 'Thoroughbred',
            specialization: parent.specialization || 'Miler',
            racingStyle: parent.racingStyle || 'Stalker',
            gender: parent.gender || 'unknown',
            
            // Performance data
            stats: {
                speed: parent.stats?.speed || 0,
                stamina: parent.stats?.stamina || 0,
                power: parent.stats?.power || 0
            },
            
            // Career achievements
            achievements: parent.achievements || [],
            careerGrade: parent.careerGrade || 'F',
            racesWon: parent.racesWon || 0,
            totalRaces: parent.totalRaces || 0,
            
            // Breeding information
            pedigree: parent.pedigree ? this.compressParentPedigree(parent.pedigree) : null,
            geneticTraits: parent.geneticTraits || [],
            
            // Surface and distance preferences
            surfacePreference: parent.surfacePreference || 'balanced',
            distancePreference: parent.distancePreference || 'mile'
        };
    }
    
    /**
     * Compress parent's pedigree to prevent infinite recursion
     * @param {Object} parentPedigree - Parent's full pedigree
     * @returns {Object} Compressed pedigree for storage
     */
    compressParentPedigree(parentPedigree) {
        return {
            sireName: parentPedigree.sire?.name || 'Unknown',
            damName: parentPedigree.dam?.name || 'Unknown',
            generations: Math.max(0, parentPedigree.generations - 1),
            foundationLines: parentPedigree.foundationLines || []
        };
    }
    
    /**
     * Calculate the number of complete generations in this pedigree
     * @returns {number} Number of complete generations
     */
    calculateGenerations() {
        if (!this.sire && !this.dam) return 0;
        if (!this.sire || !this.dam) return 1;
        
        const sireGenerations = this.sire.pedigree ? this.sire.pedigree.generations + 1 : 1;
        const damGenerations = this.dam.pedigree ? this.dam.pedigree.generations + 1 : 1;
        
        return Math.min(sireGenerations, damGenerations, 3); // Cap at 3 generations
    }
    
    /**
     * Calculate inbreeding coefficient (simplified Wright's coefficient)
     * @returns {number} Inbreeding coefficient (0-1)
     */
    calculateInbreeding() {
        if (this.generations < 2) return 0.0;
        
        const ancestors = this.getAllAncestors();
        const ancestorCounts = {};
        
        // Count occurrences of each ancestor
        ancestors.forEach(ancestor => {
            const key = `${ancestor.name}_${ancestor.breed}`;
            ancestorCounts[key] = (ancestorCounts[key] || 0) + 1;
        });
        
        // Calculate inbreeding based on duplicate ancestors
        let inbreedingSum = 0;
        for (const [name, count] of Object.entries(ancestorCounts)) {
            if (count > 1) {
                // Simplified calculation: higher coefficient for closer inbreeding
                inbreedingSum += (count - 1) * 0.125; // 12.5% per duplicate ancestor
            }
        }
        
        return Math.min(inbreedingSum, 0.5); // Cap at 50%
    }
    
    /**
     * Get all ancestors in the pedigree
     * @returns {Array<Object>} Array of all ancestor records
     */
    getAllAncestors() {
        const ancestors = [];
        
        if (this.sire) {
            ancestors.push(this.sire);
            if (this.sire.pedigree && this.sire.pedigree.foundationLines) {
                this.sire.pedigree.foundationLines.forEach(line => ancestors.push({ name: line }));
            }
        }
        
        if (this.dam) {
            ancestors.push(this.dam);
            if (this.dam.pedigree && this.dam.pedigree.foundationLines) {
                this.dam.pedigree.foundationLines.forEach(line => ancestors.push({ name: line }));
            }
        }
        
        return ancestors;
    }
    
    /**
     * Build complete lineage string for display
     * @returns {string} Formatted lineage string
     */
    buildLineage() {
        if (!this.sire && !this.dam) {
            return 'Foundation Horse';
        }
        
        const sireName = this.sire?.name || 'Unknown Sire';
        const damName = this.dam?.name || 'Unknown Dam';
        
        return `${sireName} x ${damName}`;
    }
    
    /**
     * Check if this is a cross-bred horse (different breeds in pedigree)
     * @returns {boolean} True if cross-bred
     */
    isCrossBred() {
        if (!this.sire || !this.dam) return false;
        
        return this.sire.breed !== this.dam.breed;
    }
    
    /**
     * Identify foundation bloodlines in the pedigree
     * @returns {Array<string>} Array of foundation line names
     */
    identifyFoundationLines() {
        const lines = new Set();
        
        if (this.sire) {
            lines.add(`${this.sire.name} (${this.sire.breed})`);
            if (this.sire.pedigree?.foundationLines) {
                this.sire.pedigree.foundationLines.forEach(line => lines.add(line));
            }
        }
        
        if (this.dam) {
            lines.add(`${this.dam.name} (${this.dam.breed})`);
            if (this.dam.pedigree?.foundationLines) {
                this.dam.pedigree.foundationLines.forEach(line => lines.add(line));
            }
        }
        
        return Array.from(lines).slice(0, 8); // Limit to 8 foundation lines
    }
    
    /**
     * Calculate overall pedigree strength based on parent performance
     * @returns {number} Pedigree strength score (0-100)
     */
    calculatePedigreeStrength() {
        if (!this.sire && !this.dam) return 0;
        
        let totalStrength = 0;
        let parentCount = 0;
        
        if (this.sire) {
            const sireStrength = this.calculateParentStrength(this.sire);
            totalStrength += sireStrength;
            parentCount++;
        }
        
        if (this.dam) {
            const damStrength = this.calculateParentStrength(this.dam);
            totalStrength += damStrength;
            parentCount++;
        }
        
        const baseStrength = parentCount > 0 ? totalStrength / parentCount : 0;
        
        // Apply bonuses and penalties
        let modifiedStrength = baseStrength;
        
        // Cross-breeding bonus (hybrid vigor)
        if (this.crossBred) {
            modifiedStrength *= 1.05;
        }
        
        // Inbreeding penalty
        if (this.inbreedingCoefficient > 0) {
            modifiedStrength *= (1 - this.inbreedingCoefficient * 0.5);
        }
        
        // Generation depth bonus
        if (this.generations >= 3) {
            modifiedStrength *= 1.02;
        }
        
        return Math.round(Math.min(modifiedStrength, 100));
    }
    
    /**
     * Calculate strength contribution from a single parent
     * @param {Object} parent - Parent record
     * @returns {number} Parent strength score (0-100)
     */
    calculateParentStrength(parent) {
        let strength = 0;
        
        // Stat contribution (40%)
        const avgStat = (parent.stats.speed + parent.stats.stamina + parent.stats.power) / 3;
        strength += (avgStat / 100) * 40;
        
        // Career grade contribution (30%)
        const gradeValues = { S: 30, A: 25, B: 20, C: 15, D: 10, F: 5 };
        strength += gradeValues[parent.careerGrade] || 5;
        
        // Win rate contribution (20%)
        if (parent.totalRaces > 0) {
            const winRate = parent.racesWon / parent.totalRaces;
            strength += winRate * 20;
        }
        
        // Achievement contribution (10%)
        strength += Math.min(parent.achievements.length * 2, 10);
        
        return Math.min(strength, 100);
    }
    
    /**
     * Get breeding recommendations based on pedigree analysis
     * @returns {Array<string>} Array of breeding recommendations
     */
    getBreedingRecommendations() {
        const recommendations = [];
        
        if (this.inbreedingCoefficient > 0.25) {
            recommendations.push('High inbreeding detected - consider outcrossing');
        }
        
        if (this.crossBred) {
            recommendations.push('Cross-bred lineage - benefits from hybrid vigor');
        }
        
        if (this.pedigreeStrength > 80) {
            recommendations.push('Elite pedigree - excellent breeding prospect');
        } else if (this.pedigreeStrength < 40) {
            recommendations.push('Moderate pedigree - focus on performance improvement');
        }
        
        if (this.generations < 2) {
            recommendations.push('Shallow pedigree - could benefit from established bloodlines');
        }
        
        return recommendations;
    }
    
    /**
     * Get formatted pedigree display for UI
     * @returns {Object} Formatted pedigree information
     */
    getDisplayInfo() {
        return {
            lineage: this.lineage,
            generations: this.generations,
            inbreeding: `${(this.inbreedingCoefficient * 100).toFixed(1)}%`,
            strength: this.pedigreeStrength,
            crossBred: this.crossBred,
            foundationLines: this.foundationLines.slice(0, 4), // Show top 4
            
            parents: {
                sire: this.sire ? {
                    name: this.sire.name,
                    breed: this.sire.breed,
                    grade: this.sire.careerGrade,
                    specialization: this.sire.specialization
                } : null,
                
                dam: this.dam ? {
                    name: this.dam.name,
                    breed: this.dam.breed,
                    grade: this.dam.careerGrade,
                    specialization: this.dam.specialization
                } : null
            }
        };
    }
    
    /**
     * Serialize pedigree to JSON for save/load
     * @returns {Object} Serializable pedigree data
     */
    toJSON() {
        return {
            sire: this.sire,
            dam: this.dam,
            generations: this.generations,
            inbreedingCoefficient: this.inbreedingCoefficient,
            created: this.created,
            lineage: this.lineage,
            crossBred: this.crossBred,
            foundationLines: this.foundationLines,
            pedigreeStrength: this.pedigreeStrength
        };
    }
    
    /**
     * Create pedigree from JSON data (for save/load)
     * @param {Object} data - Serialized pedigree data
     * @returns {Pedigree} Restored pedigree instance
     */
    static fromJSON(data) {
        const pedigree = new Pedigree();
        
        pedigree.sire = data.sire;
        pedigree.dam = data.dam;
        pedigree.generations = data.generations || 0;
        pedigree.inbreedingCoefficient = data.inbreedingCoefficient || 0;
        pedigree.created = data.created;
        pedigree.lineage = data.lineage;
        pedigree.crossBred = data.crossBred || false;
        pedigree.foundationLines = data.foundationLines || [];
        pedigree.pedigreeStrength = data.pedigreeStrength || 0;
        
        return pedigree;
    }
    
    /**
     * Create empty/foundation pedigree for horses without parents
     * @returns {Pedigree} Foundation pedigree
     */
    static createFoundation() {
        const pedigree = new Pedigree();
        pedigree.lineage = 'Foundation Horse';
        pedigree.foundationLines = ['Foundation Stock'];
        return pedigree;
    }
}

module.exports = Pedigree;