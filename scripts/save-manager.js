#!/usr/bin/env node
/**
 * Save File Management Script
 * 
 * Development and player utility for managing save files
 * Supports JSON format for easy editing/cheating
 */

const OfflineSaveSystem = require('../src/systems/OfflineSaveSystem');
const path = require('path');

class SaveManager {
    constructor() {
        this.saveSystem = new OfflineSaveSystem();
    }

    /**
     * List all save files with details
     */
    list() {
        console.log('📋 Save File Manager - Listing Saves');
        console.log('=====================================');
        
        const result = this.saveSystem.listSaves();
        
        if (!result.success) {
            console.error('❌ Failed to list saves:', result.error);
            return;
        }

        if (result.count === 0) {
            console.log('📂 No save files found');
            return;
        }

        console.log(`📂 Found ${result.count} save files:\n`);

        result.saves.forEach((save, index) => {
            const status = save.valid ? '✅' : '❌';
            const size = this.formatFileSize(save.size);
            const date = new Date(save.savedAt).toLocaleString();
            
            console.log(`${index + 1}. ${status} ${save.filename}`);
            console.log(`   Character: ${save.characterName}`);
            console.log(`   Progress: Turn ${save.turn}, Races Won: ${save.racesWon}`);
            console.log(`   Saved: ${date} (${size})`);
            console.log(`   Version: ${save.version}`);
            if (!save.valid) {
                console.log(`   ❌ Error: ${save.error}`);
            }
            console.log();
        });
    }

    /**
     * Wipe all save files
     */
    wipeAll(includeBackups = false) {
        console.log('🗑️  Save File Wiper');
        console.log('===================');
        
        const result = this.saveSystem.wipeAllSaves(includeBackups);
        
        if (result.success) {
            console.log(`✅ ${result.message}`);
        } else {
            console.error(`❌ ${result.message}`);
        }
    }

    /**
     * Show save system statistics
     */
    stats() {
        console.log('📊 Save System Statistics');
        console.log('=========================');
        
        const result = this.saveSystem.getStats();
        
        if (!result.success) {
            console.error('❌ Failed to get stats:', result.error);
            return;
        }

        const stats = result.stats;
        
        console.log(`Total Saves: ${stats.totalSaves}`);
        console.log(`Valid Saves: ${stats.validSaves}`);
        console.log(`Corrupted Saves: ${stats.corruptedSaves}`);
        console.log(`Total Size: ${this.formatFileSize(stats.totalSize)}`);
        console.log(`Backup Files: ${stats.backupCount}`);
        
        if (stats.oldestSave) {
            console.log(`Oldest Save: ${new Date(stats.oldestSave).toLocaleString()}`);
        }
        
        if (stats.newestSave) {
            console.log(`Newest Save: ${new Date(stats.newestSave).toLocaleString()}`);
        }
    }

    /**
     * Validate a save file
     */
    validate(filename) {
        console.log(`🔍 Validating: ${filename}`);
        console.log('========================');
        
        const loadResult = this.saveSystem.loadGame(filename);
        
        if (loadResult.success) {
            const saveData = loadResult.saveData;
            console.log('✅ Save file is valid');
            console.log(`Character: ${saveData.character.name}`);
            console.log(`Turn: ${saveData.character.career?.turn || 1}`);
            console.log(`Stats: Speed ${saveData.character.stats.speed}, Stamina ${saveData.character.stats.stamina}, Power ${saveData.character.stats.power}`);
            console.log(`Energy: ${saveData.character.energy || 100}`);
            console.log(`Version: ${saveData.version || '1.0.0'}`);
        } else {
            console.log('❌ Save file is invalid');
            console.log(`Error: ${loadResult.error}`);
            console.log(`Message: ${loadResult.message}`);
        }
    }

    /**
     * Create a test save file for development
     */
    createTestSave(characterName = 'Dev Horse') {
        console.log(`🧪 Creating test save: ${characterName}`);
        
        const testSaveData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            character: {
                name: characterName,
                stats: {
                    speed: 50,
                    stamina: 50,
                    power: 50
                },
                energy: 100,
                mood: 'Normal',
                career: {
                    turn: 1,
                    maxTurns: 24,
                    racesWon: 0,
                    racesRun: 0,
                    totalTraining: 0
                },
                legacyBonuses: {
                    speedBonus: 0,
                    staminaBonus: 0,
                    powerBonus: 0,
                    energyBonus: 0
                }
            },
            gameState: 'training',
            raceSchedule: [],
            completedRaces: [],
            gameHistory: {
                sessions: 1,
                totalWins: 0,
                bestTime: null,
                favoriteTraining: null
            }
        };

        const result = this.saveSystem.saveGame(testSaveData, `test_${characterName.toLowerCase().replace(' ', '_')}.json`);
        
        if (result.success) {
            console.log(`✅ Created test save: ${result.filename}`);
        } else {
            console.log(`❌ Failed to create test save: ${result.message}`);
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show help information
     */
    help() {
        console.log(`
🐎 Horse Racing Text Game - Save Manager

Usage:
  npm run save:list          List all save files
  npm run save:wipe          Wipe all save files (keeps backups)
  npm run save:wipe:all      Wipe all saves and backups
  npm run save:stats         Show save system statistics
  npm run save:validate      Validate a save file
  npm run save:test          Create test save file
  npm run save:help          Show this help

Examples:
  npm run save:validate my_horse_2025-01-27.json
  npm run save:test "Super Horse"

Notes:
  - Save files are stored in data/saves/ directory
  - Files are in JSON format for easy editing
  - Automatic backups are created in data/saves/backups/
  - You can manually edit save files to "cheat" or test features
        `);
    }
}

// CLI Interface
function main() {
    const saveManager = new SaveManager();
    const command = process.argv[2];
    const argument = process.argv[3];

    try {
        switch (command) {
            case 'list':
                saveManager.list();
                break;
            case 'wipe':
                saveManager.wipeAll(false);
                break;
            case 'wipe-all':
                saveManager.wipeAll(true);
                break;
            case 'stats':
                saveManager.stats();
                break;
            case 'validate':
                if (!argument) {
                    console.error('❌ Please specify a filename to validate');
                    console.log('Usage: npm run save:validate <filename>');
                    return;
                }
                saveManager.validate(argument);
                break;
            case 'test':
                const testName = argument || 'Dev Horse';
                saveManager.createTestSave(testName);
                break;
            case 'help':
            default:
                saveManager.help();
        }
    } catch (error) {
        console.error(`❌ Save manager error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SaveManager;