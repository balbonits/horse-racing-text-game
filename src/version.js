/**
 * Version Management System
 * 
 * Central version configuration for the Horse Racing Text Game.
 * This file is updated by the build script during releases.
 */

module.exports = {
    // Current version - Updated by build script
    VERSION: '1.0.0',
    VERSION_MAJOR: 1,
    VERSION_MINOR: 0,
    VERSION_PATCH: 0,
    VERSION_TAG: '',
    
    // Build metadata
    BUILD_DATE: '2025-08-27',
    BUILD_NUMBER: 2,
    CODENAME: 'Thunder Runner',
    
    // Git information - Updated by build script
    GIT_COMMIT: '181b506',
    GIT_BRANCH: 'v1',
    
    // Compatibility ranges
    SAVE_COMPATIBILITY: {
        MIN_VERSION: '1.0.0',  // Minimum save file version we can load
        MAX_VERSION: '1.x.x',  // Maximum save file version we support
        CURRENT_FORMAT: '1.0'  // Current save format version
    },
    
    // Feature flags for version-specific features
    FEATURES: {
        breeding: true,
        trainers: true,
        trainer_dialog: true,
        modular_ui: true,
        stat_patterns: true,
        legacy_system: false,
        multiplayer: false,
        advanced_genetics: false,
        weather_system: false
    },
    
    // Version comparison utilities
    isCompatible(version) {
        if (!version) return false;
        
        const [major, minor] = version.split('.').map(Number);
        const [minMajor, minMinor] = this.SAVE_COMPATIBILITY.MIN_VERSION.split('.').map(Number);
        
        // Check minimum version
        if (major < minMajor || (major === minMajor && minor < minMinor)) {
            return false;
        }
        
        // Check maximum version (only major version matters for compatibility)
        if (major > this.VERSION_MAJOR) {
            return false;
        }
        
        return true;
    },
    
    needsMigration(version) {
        if (!version) return true;
        
        const [major, minor, patch] = version.split('.').map(Number);
        
        // Different major version always needs migration
        if (major !== this.VERSION_MAJOR) return true;
        
        // Same major, older minor might need migration
        if (minor < this.VERSION_MINOR) return true;
        
        return false;
    },
    
    getVersionString() {
        let version = `v${this.VERSION}`;
        if (this.VERSION_TAG) {
            version += `-${this.VERSION_TAG}`;
        }
        return version;
    },
    
    getFullVersionString() {
        let version = this.getVersionString();
        if (this.CODENAME) {
            version += ` "${this.CODENAME}"`;
        }
        if (this.BUILD_DATE) {
            version += ` (${this.BUILD_DATE})`;
        }
        return version;
    },
    
    getBuildInfo() {
        return {
            version: this.VERSION,
            build: this.BUILD_NUMBER,
            date: this.BUILD_DATE,
            commit: this.GIT_COMMIT,
            branch: this.GIT_BRANCH,
            codename: this.CODENAME
        };
    },
    
    // Get feature availability
    isFeatureEnabled(feature) {
        return this.FEATURES[feature] === true;
    },
    
    // Version history for changelog display
    HISTORY: [
        {
            version: '1.0.0',
            date: '2025-01-27',
            codename: 'Thunder Runner',
            highlights: [
                'Modular UI Architecture with Blessed.js',
                'Trainer Dialog System (3 personalities)',
                'Advanced Stat Generation (9 patterns)',
                'Genetic Inheritance System',
                'Comprehensive TDD test suite (70 tests)'
            ]
        }
    ]
};
