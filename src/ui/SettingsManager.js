/**
 * Settings Manager - Game Configuration and Accessibility Options
 * 
 * Manages user preferences including:
 * - Color themes and accessibility options
 * - UI preferences
 * - Gameplay settings
 * - Save/load settings from JSON file
 */

const fs = require('fs');
const path = require('path');
const ColorThemeManager = require('./ColorThemeManager');

class SettingsManager {
    constructor() {
        this.settingsPath = path.join(__dirname, '../../data/settings.json');
        this.colorManager = new ColorThemeManager();
        
        // Default settings
        this.defaultSettings = {
            version: '1.0.0',
            theme: {
                colorTheme: 'standard',
                lastChanged: new Date().toISOString()
            },
            accessibility: {
                colorblindSupport: false,
                colorblindType: 'none', // 'protanopia', 'deuteranopia', 'tritanopia'
                highContrast: false,
                reducedMotion: false,
                screenReaderMode: false
            },
            ui: {
                animationSpeed: 'normal', // 'slow', 'normal', 'fast', 'instant'
                showProgressBars: true,
                compactMode: false,
                showTips: true
            },
            gameplay: {
                autoSave: true,
                confirmActions: true,
                fastRaceMode: false,
                skipTutorial: false
            },
            advanced: {
                debugMode: false,
                verboseLogging: false,
                developerMode: false
            }
        };

        this.currentSettings = { ...this.defaultSettings };
        this.loadSettings();
    }

    /**
     * Load settings from file
     */
    loadSettings() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            if (fs.existsSync(this.settingsPath)) {
                const settingsData = fs.readFileSync(this.settingsPath, 'utf8');
                const loadedSettings = JSON.parse(settingsData);
                
                // Merge with defaults to handle new settings
                this.currentSettings = this.mergeSettings(this.defaultSettings, loadedSettings);
                
                // Apply color theme
                this.colorManager.setTheme(this.currentSettings.theme.colorTheme);
                
                return { success: true, message: 'Settings loaded successfully' };
            } else {
                // First run - create default settings file
                this.saveSettings();
                return { success: true, message: 'Default settings created' };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.currentSettings = { ...this.defaultSettings };
            return { success: false, error: error.message };
        }
    }

    /**
     * Save settings to file
     */
    saveSettings() {
        try {
            const dataDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Update last changed timestamp
            this.currentSettings.theme.lastChanged = new Date().toISOString();
            
            const settingsJson = JSON.stringify(this.currentSettings, null, 2);
            fs.writeFileSync(this.settingsPath, settingsJson, 'utf8');
            
            return { success: true, message: 'Settings saved successfully' };
        } catch (error) {
            console.error('Error saving settings:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Merge settings objects, preserving structure
     */
    mergeSettings(defaults, loaded) {
        const merged = { ...defaults };
        
        for (const [key, value] of Object.entries(loaded)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                merged[key] = { ...defaults[key], ...value };
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.currentSettings };
    }

    /**
     * Get specific setting category
     */
    getCategory(category) {
        return this.currentSettings[category] || {};
    }

    /**
     * Update theme settings
     */
    setColorTheme(themeName) {
        if (this.colorManager.setTheme(themeName)) {
            this.currentSettings.theme.colorTheme = themeName;
            this.saveSettings();
            return { success: true, theme: themeName };
        }
        return { success: false, error: 'Invalid theme name' };
    }

    /**
     * Configure accessibility options
     */
    setAccessibilityOption(option, value) {
        if (this.currentSettings.accessibility.hasOwnProperty(option)) {
            this.currentSettings.accessibility[option] = value;
            
            // Auto-apply colorblind support
            if (option === 'colorblindSupport' && value) {
                // Don't auto-change theme, let user choose
            } else if (option === 'colorblindType' && this.currentSettings.accessibility.colorblindSupport) {
                // Map colorblind types to themes
                const themeMap = {
                    'protanopia': 'protanopia',
                    'deuteranopia': 'protanopia', // Use same theme for both red-green types
                    'tritanopia': 'tritanopia',
                    'none': 'standard'
                };
                
                if (themeMap[value]) {
                    this.setColorTheme(themeMap[value]);
                }
            } else if (option === 'highContrast' && value) {
                this.setColorTheme('highContrast');
            }
            
            this.saveSettings();
            return { success: true, option, value };
        }
        return { success: false, error: 'Invalid accessibility option' };
    }

    /**
     * Get color manager instance
     */
    getColorManager() {
        return this.colorManager;
    }

    /**
     * Generate settings menu data
     */
    getSettingsMenu() {
        const themes = this.colorManager.getAvailableThemes();
        const currentTheme = this.currentSettings.theme.colorTheme;
        
        return {
            categories: [
                {
                    name: 'Theme & Accessibility',
                    key: 'theme',
                    settings: [
                        {
                            name: 'Color Theme',
                            key: 'colorTheme',
                            type: 'select',
                            current: currentTheme,
                            options: themes,
                            description: 'Choose your preferred color scheme'
                        },
                        {
                            name: 'Colorblind Support',
                            key: 'colorblindSupport',
                            type: 'boolean',
                            current: this.currentSettings.accessibility.colorblindSupport,
                            description: 'Enable colorblind-friendly options'
                        },
                        {
                            name: 'Colorblind Type',
                            key: 'colorblindType',
                            type: 'select',
                            current: this.currentSettings.accessibility.colorblindType,
                            options: [
                                { key: 'none', name: 'None', description: 'Normal color vision' },
                                { key: 'protanopia', name: 'Protanopia', description: 'Red-green colorblind (no red)' },
                                { key: 'deuteranopia', name: 'Deuteranopia', description: 'Red-green colorblind (no green)' },
                                { key: 'tritanopia', name: 'Tritanopia', description: 'Blue-yellow colorblind' }
                            ],
                            description: 'Specify your colorblind type for optimization',
                            enabled: this.currentSettings.accessibility.colorblindSupport
                        },
                        {
                            name: 'High Contrast',
                            key: 'highContrast',
                            type: 'boolean',
                            current: this.currentSettings.accessibility.highContrast,
                            description: 'Use high contrast colors for better visibility'
                        }
                    ]
                },
                {
                    name: 'Interface',
                    key: 'ui',
                    settings: [
                        {
                            name: 'Show Progress Bars',
                            key: 'showProgressBars',
                            type: 'boolean',
                            current: this.currentSettings.ui.showProgressBars,
                            description: 'Display visual progress bars for stats'
                        },
                        {
                            name: 'Animation Speed',
                            key: 'animationSpeed',
                            type: 'select',
                            current: this.currentSettings.ui.animationSpeed,
                            options: [
                                { key: 'slow', name: 'Slow', description: 'Relaxed pace' },
                                { key: 'normal', name: 'Normal', description: 'Standard speed' },
                                { key: 'fast', name: 'Fast', description: 'Quick animations' },
                                { key: 'instant', name: 'Instant', description: 'Skip animations' }
                            ],
                            description: 'Control animation and transition speeds'
                        },
                        {
                            name: 'Compact Mode',
                            key: 'compactMode',
                            type: 'boolean',
                            current: this.currentSettings.ui.compactMode,
                            description: 'Use less screen space for UI elements'
                        }
                    ]
                },
                {
                    name: 'Gameplay',
                    key: 'gameplay',
                    settings: [
                        {
                            name: 'Auto-Save',
                            key: 'autoSave',
                            type: 'boolean',
                            current: this.currentSettings.gameplay.autoSave,
                            description: 'Automatically save progress'
                        },
                        {
                            name: 'Fast Race Mode',
                            key: 'fastRaceMode',
                            type: 'boolean',
                            current: this.currentSettings.gameplay.fastRaceMode,
                            description: 'Skip race animations and show results immediately'
                        },
                        {
                            name: 'Confirm Actions',
                            key: 'confirmActions',
                            type: 'boolean',
                            current: this.currentSettings.gameplay.confirmActions,
                            description: 'Ask for confirmation on important actions'
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Apply a setting change
     */
    changeSetting(category, key, value) {
        if (!this.currentSettings[category]) {
            return { success: false, error: 'Invalid category' };
        }

        // Special handling for theme changes
        if (category === 'theme' && key === 'colorTheme') {
            return this.setColorTheme(value);
        }

        // Special handling for accessibility
        if (category === 'accessibility') {
            return this.setAccessibilityOption(key, value);
        }

        // Regular setting change
        if (this.currentSettings[category].hasOwnProperty(key)) {
            this.currentSettings[category][key] = value;
            this.saveSettings();
            return { success: true, category, key, value };
        }

        return { success: false, error: 'Invalid setting key' };
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        this.colorManager.setTheme('standard');
        this.saveSettings();
        return { success: true, message: 'Settings reset to defaults' };
    }

    /**
     * Get theme preview for settings menu
     */
    getThemePreview(themeName = null) {
        return this.colorManager.generateThemePreview(themeName);
    }

    /**
     * Check if setting should be shown (based on dependencies)
     */
    isSettingEnabled(category, key) {
        const setting = this.findSetting(category, key);
        if (!setting || !setting.enabled) {
            return true;
        }
        
        // Check if dependency is met
        if (typeof setting.enabled === 'boolean') {
            return setting.enabled;
        }
        
        return true;
    }

    /**
     * Find setting definition
     */
    findSetting(category, key) {
        const menu = this.getSettingsMenu();
        const categoryData = menu.categories.find(cat => cat.key === category);
        if (!categoryData) return null;
        
        return categoryData.settings.find(setting => setting.key === key);
    }
}

module.exports = SettingsManager;