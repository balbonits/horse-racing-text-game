/**
 * Offline Save/Load System - JSON File Storage
 * 
 * Features:
 * - JSON format for easy editing/cheating
 * - Multiple save slots
 * - Automatic backups
 * - Dev commands for wiping saves
 * - Timestamp tracking
 * - Save validation
 */

const fs = require('fs');
const path = require('path');

class OfflineSaveSystem {
    constructor() {
        this.saveDir = path.join(process.cwd(), 'data', 'saves');
        this.metaFile = path.join(this.saveDir, 'save_metadata.json');
        this.backupDir = path.join(this.saveDir, 'backups');
        
        // Ensure directories exist
        this.initializeSaveDirectories();
    }

    /**
     * Initialize save directories
     */
    initializeSaveDirectories() {
        try {
            // Create main save directory
            if (!fs.existsSync(this.saveDir)) {
                fs.mkdirSync(this.saveDir, { recursive: true });
                console.log(`📁 Created save directory: ${this.saveDir}`);
            }

            // Create backup directory  
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
                console.log(`📁 Created backup directory: ${this.backupDir}`);
            }

            // Create default metadata if it doesn't exist
            if (!fs.existsSync(this.metaFile)) {
                this.initializeMetadata();
            }
        } catch (error) {
            console.error('❌ Failed to initialize save directories:', error.message);
        }
    }

    /**
     * Initialize save metadata file
     */
    initializeMetadata() {
        const metadata = {
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            lastAccess: new Date().toISOString(),
            totalSaves: 0,
            saves: {},
            settings: {
                maxSaves: 10,
                autoBackup: true,
                compressionEnabled: false
            }
        };

        try {
            fs.writeFileSync(this.metaFile, JSON.stringify(metadata, null, 2));
            console.log('📝 Initialized save metadata');
        } catch (error) {
            console.error('❌ Failed to create metadata:', error.message);
        }
    }

    /**
     * Save game data to JSON file
     * @param {Object} gameData - Complete game state
     * @param {string} saveName - Optional custom save name
     * @returns {Object} Save result with success/error info
     */
    saveGame(gameData, saveName = null) {
        try {
            // Generate save filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const characterName = gameData.character?.name || 'Unknown';
            const filename = saveName || `${characterName}_${timestamp}.json`;
            const filepath = path.join(this.saveDir, filename);

            // Prepare save data with metadata
            const saveData = {
                // Game data
                ...gameData,
                
                // Save metadata
                saveMetadata: {
                    filename: filename,
                    characterName: characterName,
                    savedAt: new Date().toISOString(),
                    gameVersion: gameData.version || '1.0.0',
                    turn: gameData.character?.career?.turn || 1,
                    racesWon: gameData.character?.career?.racesWon || 0,
                    totalStats: this.calculateTotalStats(gameData.character),
                    playtimeEstimate: this.estimatePlaytime(gameData.character),
                    saveSize: 0 // Will be calculated after writing
                }
            };

            // Create backup if auto-backup is enabled
            if (this.shouldCreateBackup(filename)) {
                this.createBackup(filename, saveData);
            }

            // Write save file
            const saveContent = JSON.stringify(saveData, null, 2);
            fs.writeFileSync(filepath, saveContent);

            // Calculate actual save size
            const stats = fs.statSync(filepath);
            saveData.saveMetadata.saveSize = stats.size;

            // Update metadata
            this.updateMetadata(filename, saveData.saveMetadata);

            console.log(`💾 Game saved: ${filename} (${stats.size} bytes)`);

            return {
                success: true,
                filename: filename,
                filepath: filepath,
                size: stats.size,
                message: `Game saved as ${filename}`
            };

        } catch (error) {
            console.error('❌ Save failed:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to save game'
            };
        }
    }

    /**
     * Load game data from JSON file
     * @param {string} filename - Save file name or full path
     * @returns {Object} Load result with game data or error info
     */
    loadGame(filename) {
        try {
            // Handle both filename and full path
            const filepath = filename.includes(path.sep) ? filename : path.join(this.saveDir, filename);

            // Check if file exists
            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    error: 'Save file not found',
                    message: `Save file ${filename} not found`
                };
            }

            // Read and parse save file
            const saveContent = fs.readFileSync(filepath, 'utf8');
            const saveData = JSON.parse(saveContent);

            // Validate save data
            const validation = this.validateSaveData(saveData);
            if (!validation.valid) {
                return {
                    success: false,
                    error: 'Invalid save data',
                    message: `Save file corrupted: ${validation.reason}`,
                    saveData: null
                };
            }

            // Update access time in metadata
            this.updateLastAccess(filename);

            console.log(`📂 Game loaded: ${filename}`);

            return {
                success: true,
                filename: filename,
                saveData: saveData,
                metadata: saveData.saveMetadata,
                message: `Game loaded from ${filename}`
            };

        } catch (error) {
            console.error('❌ Load failed:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to load game',
                saveData: null
            };
        }
    }

    /**
     * List all available save files
     * @returns {Array} Array of save file info
     */
    listSaves() {
        try {
            const files = fs.readdirSync(this.saveDir)
                .filter(file => file.endsWith('.json') && file !== 'save_metadata.json')
                .map(file => {
                    const filepath = path.join(this.saveDir, file);
                    const stats = fs.statSync(filepath);
                    
                    try {
                        // Try to read basic info from save file
                        const saveContent = fs.readFileSync(filepath, 'utf8');
                        const saveData = JSON.parse(saveContent);
                        
                        return {
                            filename: file,
                            characterName: saveData.character?.name || 'Unknown',
                            turn: saveData.character?.career?.turn || 1,
                            racesWon: saveData.character?.career?.racesWon || 0,
                            savedAt: saveData.saveMetadata?.savedAt || stats.mtime.toISOString(),
                            size: stats.size,
                            version: saveData.version || '1.0.0',
                            valid: true
                        };
                    } catch (parseError) {
                        // Handle corrupted save files
                        return {
                            filename: file,
                            characterName: 'Corrupted',
                            turn: 0,
                            racesWon: 0,
                            savedAt: stats.mtime.toISOString(),
                            size: stats.size,
                            version: 'unknown',
                            valid: false,
                            error: parseError.message
                        };
                    }
                })
                .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)); // Sort by newest first

            return {
                success: true,
                saves: files,
                count: files.length
            };

        } catch (error) {
            console.error('❌ Failed to list saves:', error.message);
            return {
                success: false,
                saves: [],
                count: 0,
                error: error.message
            };
        }
    }

    /**
     * Delete a save file
     * @param {string} filename - Save file to delete
     * @returns {Object} Delete result
     */
    deleteSave(filename) {
        try {
            const filepath = path.join(this.saveDir, filename);
            
            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    error: 'Save file not found',
                    message: `Save file ${filename} not found`
                };
            }

            // Create backup before deletion
            this.createBackup(filename, null, 'pre_delete');

            // Delete the file
            fs.unlinkSync(filepath);

            // Update metadata
            this.removeFromMetadata(filename);

            console.log(`🗑️  Deleted save: ${filename}`);

            return {
                success: true,
                filename: filename,
                message: `Deleted save file ${filename}`
            };

        } catch (error) {
            console.error('❌ Failed to delete save:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete save file'
            };
        }
    }

    /**
     * Wipe all save files (dev command)
     * @param {boolean} includeBackups - Whether to delete backups too
     * @returns {Object} Wipe result
     */
    wipeAllSaves(includeBackups = false) {
        try {
            let deletedCount = 0;

            // Delete all save files
            const files = fs.readdirSync(this.saveDir);
            for (const file of files) {
                if (file.endsWith('.json') && file !== 'save_metadata.json') {
                    const filepath = path.join(this.saveDir, file);
                    fs.unlinkSync(filepath);
                    deletedCount++;
                }
            }

            // Delete backups if requested
            if (includeBackups && fs.existsSync(this.backupDir)) {
                const backupFiles = fs.readdirSync(this.backupDir);
                for (const file of backupFiles) {
                    const filepath = path.join(this.backupDir, file);
                    fs.unlinkSync(filepath);
                }
                console.log(`🗑️  Deleted ${backupFiles.length} backup files`);
            }

            // Reset metadata
            this.initializeMetadata();

            console.log(`🗑️  Wiped ${deletedCount} save files`);

            return {
                success: true,
                deletedCount: deletedCount,
                message: `Wiped ${deletedCount} save files${includeBackups ? ' and backups' : ''}`
            };

        } catch (error) {
            console.error('❌ Failed to wipe saves:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to wipe save files'
            };
        }
    }

    /**
     * Create backup of save file
     */
    createBackup(filename, saveData = null, reason = 'auto') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFilename = `${filename.replace('.json', '')}_${reason}_${timestamp}.json`;
            const backupPath = path.join(this.backupDir, backupFilename);

            if (saveData) {
                // Creating backup during save
                fs.writeFileSync(backupPath, JSON.stringify(saveData, null, 2));
            } else {
                // Creating backup of existing file
                const originalPath = path.join(this.saveDir, filename);
                if (fs.existsSync(originalPath)) {
                    fs.copyFileSync(originalPath, backupPath);
                }
            }

            // Clean up old backups (keep only last 5 per save)
            this.cleanupOldBackups(filename);

        } catch (error) {
            console.error('❌ Backup failed:', error.message);
        }
    }

    /**
     * Validate save data structure
     */
    validateSaveData(saveData) {
        try {
            // Check for required fields
            if (!saveData.character) {
                return { valid: false, reason: 'Missing character data' };
            }

            if (!saveData.character.name) {
                return { valid: false, reason: 'Missing character name' };
            }

            if (!saveData.character.stats) {
                return { valid: false, reason: 'Missing character stats' };
            }

            // Check stats are numbers
            const { speed, stamina, power } = saveData.character.stats;
            if (typeof speed !== 'number' || typeof stamina !== 'number' || typeof power !== 'number') {
                return { valid: false, reason: 'Invalid stat types' };
            }

            // Check stat ranges
            if (speed < 0 || speed > 100 || stamina < 0 || stamina > 100 || power < 0 || power > 100) {
                return { valid: false, reason: 'Stats out of valid range (0-100)' };
            }

            return { valid: true };

        } catch (error) {
            return { valid: false, reason: `Validation error: ${error.message}` };
        }
    }

    /**
     * Utility methods
     */
    calculateTotalStats(character) {
        if (!character?.stats) return 0;
        return character.stats.speed + character.stats.stamina + character.stats.power;
    }

    estimatePlaytime(character) {
        if (!character?.career) return 0;
        const turn = character.career.turn || 1;
        return Math.round(turn * 0.5); // Rough estimate: 30 seconds per turn
    }

    shouldCreateBackup(filename) {
        // Create backup if file already exists
        return fs.existsSync(path.join(this.saveDir, filename));
    }

    updateMetadata(filename, saveMetadata) {
        try {
            const metadata = this.loadMetadata();
            metadata.saves[filename] = saveMetadata;
            metadata.totalSaves = Object.keys(metadata.saves).length;
            metadata.lastAccess = new Date().toISOString();
            
            fs.writeFileSync(this.metaFile, JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.error('❌ Failed to update metadata:', error.message);
        }
    }

    updateLastAccess(filename) {
        try {
            const metadata = this.loadMetadata();
            if (metadata.saves[filename]) {
                metadata.saves[filename].lastAccess = new Date().toISOString();
                fs.writeFileSync(this.metaFile, JSON.stringify(metadata, null, 2));
            }
        } catch (error) {
            console.error('❌ Failed to update access time:', error.message);
        }
    }

    removeFromMetadata(filename) {
        try {
            const metadata = this.loadMetadata();
            delete metadata.saves[filename];
            metadata.totalSaves = Object.keys(metadata.saves).length;
            
            fs.writeFileSync(this.metaFile, JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.error('❌ Failed to remove from metadata:', error.message);
        }
    }

    loadMetadata() {
        try {
            if (fs.existsSync(this.metaFile)) {
                return JSON.parse(fs.readFileSync(this.metaFile, 'utf8'));
            }
        } catch (error) {
            console.error('❌ Failed to load metadata:', error.message);
        }
        
        // Return default metadata if loading fails
        return {
            version: '1.0.0',
            saves: {},
            totalSaves: 0,
            settings: { maxSaves: 10, autoBackup: true }
        };
    }

    cleanupOldBackups(filename) {
        try {
            const baseFilename = filename.replace('.json', '');
            const backupFiles = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith(baseFilename))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    mtime: fs.statSync(path.join(this.backupDir, file)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime); // Sort by newest first

            // Keep only the 5 most recent backups
            const toDelete = backupFiles.slice(5);
            toDelete.forEach(backup => {
                fs.unlinkSync(backup.path);
            });

        } catch (error) {
            console.error('❌ Failed to cleanup backups:', error.message);
        }
    }

    /**
     * Get save system statistics
     */
    getStats() {
        try {
            const metadata = this.loadMetadata();
            const savesList = this.listSaves();
            
            const stats = {
                totalSaves: metadata.totalSaves,
                validSaves: savesList.saves.filter(s => s.valid).length,
                corruptedSaves: savesList.saves.filter(s => !s.valid).length,
                totalSize: savesList.saves.reduce((sum, save) => sum + save.size, 0),
                oldestSave: savesList.saves.length > 0 ? savesList.saves[savesList.saves.length - 1].savedAt : null,
                newestSave: savesList.saves.length > 0 ? savesList.saves[0].savedAt : null,
                backupCount: fs.existsSync(this.backupDir) ? fs.readdirSync(this.backupDir).length : 0
            };

            return {
                success: true,
                stats: stats
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                stats: null
            };
        }
    }
}

module.exports = OfflineSaveSystem;