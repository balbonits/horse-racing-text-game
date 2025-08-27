/**
 * Gender system for horse racing breeding mechanics
 * 
 * Defines horse genders with realistic racing terminology and breeding implications.
 * Follows real-world horse racing conventions where age affects terminology.
 * 
 * @class Gender
 */
class Gender {
    static STALLION = 'stallion';  // Male horse, 4+ years old, breeding capable
    static MARE = 'mare';          // Female horse, 4+ years old, breeding capable  
    static COLT = 'colt';          // Young male horse, typically 3-4 years old
    static FILLY = 'filly';        // Young female horse, typically 3-4 years old
    
    /**
     * Get all available gender options
     * @returns {Array<string>} Array of gender constants
     */
    static getAllGenders() {
        return [
            Gender.STALLION,
            Gender.MARE,
            Gender.COLT,
            Gender.FILLY
        ];
    }
    
    /**
     * Get breeding-capable genders (mature horses)
     * @returns {Array<string>} Array of breeding-capable genders
     */
    static getBreedingGenders() {
        return [
            Gender.STALLION,
            Gender.MARE
        ];
    }
    
    /**
     * Get young horse genders (racing age)
     * @returns {Array<string>} Array of young horse genders
     */
    static getYoungGenders() {
        return [
            Gender.COLT,
            Gender.FILLY
        ];
    }
    
    /**
     * Check if gender is male
     * @param {string} gender - Gender to check
     * @returns {boolean} True if male gender
     */
    static isMale(gender) {
        return gender === Gender.STALLION || gender === Gender.COLT;
    }
    
    /**
     * Check if gender is female
     * @param {string} gender - Gender to check
     * @returns {boolean} True if female gender
     */
    static isFemale(gender) {
        return gender === Gender.MARE || gender === Gender.FILLY;
    }
    
    /**
     * Check if gender is breeding capable
     * @param {string} gender - Gender to check
     * @returns {boolean} True if can breed
     */
    static canBreed(gender) {
        return Gender.getBreedingGenders().includes(gender);
    }
    
    /**
     * Get the mature version of a gender (for retirement/breeding)
     * @param {string} gender - Current gender
     * @returns {string} Mature gender equivalent
     */
    static getMatureGender(gender) {
        switch (gender) {
            case Gender.COLT:
                return Gender.STALLION;
            case Gender.FILLY:
                return Gender.MARE;
            case Gender.STALLION:
            case Gender.MARE:
                return gender; // Already mature
            default:
                throw new Error(`Unknown gender: ${gender}`);
        }
    }
    
    /**
     * Get a random gender appropriate for racing age (3-4 years)
     * @returns {string} Random young gender
     */
    static getRandomRacingGender() {
        const youngGenders = Gender.getYoungGenders();
        return youngGenders[Math.floor(Math.random() * youngGenders.length)];
    }
    
    /**
     * Get a random gender from all options
     * @returns {string} Random gender
     */
    static getRandomGender() {
        const allGenders = Gender.getAllGenders();
        return allGenders[Math.floor(Math.random() * allGenders.length)];
    }
    
    /**
     * Validate if a gender string is valid
     * @param {string} gender - Gender to validate
     * @returns {boolean} True if valid gender
     */
    static isValidGender(gender) {
        return Gender.getAllGenders().includes(gender);
    }
    
    /**
     * Get display name for UI presentation
     * @param {string} gender - Gender to get display name for
     * @returns {string} Formatted display name
     */
    static getDisplayName(gender) {
        const displayNames = {
            [Gender.STALLION]: 'Stallion',
            [Gender.MARE]: 'Mare',
            [Gender.COLT]: 'Colt', 
            [Gender.FILLY]: 'Filly'
        };
        
        return displayNames[gender] || gender;
    }
    
    /**
     * Get breeding role description
     * @param {string} gender - Gender to describe
     * @returns {string} Breeding role description
     */
    static getBreedingRole(gender) {
        const roles = {
            [Gender.STALLION]: 'Sire (Father)',
            [Gender.MARE]: 'Dam (Mother)',
            [Gender.COLT]: 'Not yet breeding age',
            [Gender.FILLY]: 'Not yet breeding age'
        };
        
        return roles[gender] || 'Unknown role';
    }
    
    /**
     * Get gender-specific achievements/titles
     * @param {string} gender - Gender to get achievements for
     * @returns {Array<string>} Array of possible achievements
     */
    static getGenderAchievements(gender) {
        const achievements = {
            [Gender.STALLION]: [
                'Champion Stallion',
                'Foundation Sire',
                'Leading Sire',
                'Stallion of the Year'
            ],
            [Gender.MARE]: [
                'Champion Mare',
                'Foundation Dam',
                'Broodmare of the Year',
                'Blue Hen Mare'
            ],
            [Gender.COLT]: [
                'Champion Colt',
                'Colt of the Year',
                'Future Champion',
                'Rising Star'
            ],
            [Gender.FILLY]: [
                'Champion Filly',
                'Filly of the Year',
                'Future Champion',
                'Rising Star'
            ]
        };
        
        return achievements[gender] || [];
    }
    
    /**
     * Get color coding for UI display
     * @param {string} gender - Gender to get color for
     * @returns {string} Color code for terminal display
     */
    static getDisplayColor(gender) {
        const colors = {
            [Gender.STALLION]: 'blue',    // Blue for mature males
            [Gender.MARE]: 'magenta',     // Magenta for mature females
            [Gender.COLT]: 'cyan',        // Cyan for young males
            [Gender.FILLY]: 'yellow'      // Yellow for young females
        };
        
        return colors[gender] || 'white';
    }
    
    /**
     * Get gender statistics for analytics
     * @param {Array<Object>} horses - Array of horses to analyze
     * @returns {Object} Gender distribution statistics
     */
    static getGenderStatistics(horses) {
        const stats = {
            total: horses.length,
            distribution: {},
            breedingCapable: 0,
            maleCount: 0,
            femaleCount: 0
        };
        
        // Initialize distribution
        Gender.getAllGenders().forEach(gender => {
            stats.distribution[gender] = 0;
        });
        
        // Count horses by gender
        horses.forEach(horse => {
            const gender = horse.gender;
            if (Gender.isValidGender(gender)) {
                stats.distribution[gender]++;
                
                if (Gender.canBreed(gender)) {
                    stats.breedingCapable++;
                }
                
                if (Gender.isMale(gender)) {
                    stats.maleCount++;
                } else if (Gender.isFemale(gender)) {
                    stats.femaleCount++;
                }
            }
        });
        
        // Calculate percentages
        stats.malePercentage = Math.round((stats.maleCount / stats.total) * 100);
        stats.femalePercentage = Math.round((stats.femaleCount / stats.total) * 100);
        stats.breedingCapablePercentage = Math.round((stats.breedingCapable / stats.total) * 100);
        
        return stats;
    }
    
    /**
     * Create gender from legacy save data (backward compatibility)
     * @param {Object|string} saveData - Saved gender data
     * @returns {string} Valid gender or default
     */
    static fromSaveData(saveData) {
        // Handle string format
        if (typeof saveData === 'string') {
            return Gender.isValidGender(saveData) ? saveData : Gender.getRandomRacingGender();
        }
        
        // Handle object format
        if (saveData && saveData.gender) {
            return Gender.isValidGender(saveData.gender) ? saveData.gender : Gender.getRandomRacingGender();
        }
        
        // Default for legacy saves without gender
        return Gender.getRandomRacingGender();
    }
}

module.exports = Gender;