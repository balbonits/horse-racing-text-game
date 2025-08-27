/**
 * Color Theme Manager - Advanced Terminal Color System with Accessibility
 * 
 * Supports multiple color themes including:
 * - Standard colors for normal vision
 * - Protanopia/Deuteranopia support (red-green colorblind)
 * - Tritanopia support (blue-yellow colorblind)
 * - High contrast mode
 * - Monochrome mode for those who prefer no colors
 * 
 * Uses chalk for terminal color output with ANSI support
 */

const chalk = require('chalk');

class ColorThemeManager {
    constructor() {
        this.currentTheme = 'standard';
        this.themes = this.initializeThemes();
    }

    initializeThemes() {
        return {
            // Standard theme for normal color vision
            standard: {
                name: 'Standard Colors',
                description: 'Full color palette for normal vision',
                colors: {
                    // UI Elements
                    primary: chalk.cyan,           // Main UI elements
                    secondary: chalk.yellow,       // Secondary highlights
                    accent: chalk.magenta,         // Special emphasis
                    
                    // Status indicators
                    success: chalk.green,          // Positive outcomes
                    warning: chalk.yellow,         // Cautions
                    error: chalk.red,              // Errors/failures
                    info: chalk.blue,              // Information
                    
                    // Stats and progress
                    speed: chalk.red,              // Speed stat
                    stamina: chalk.blue,           // Stamina stat
                    power: chalk.yellow,           // Power stat
                    energy: chalk.green,           // Energy levels
                    
                    // Race elements
                    position1: chalk.hex('#FFD700'),  // Gold for 1st place
                    position2: chalk.hex('#C0C0C0'),  // Silver for 2nd place
                    position3: chalk.hex('#CD7F32'),  // Bronze for 3rd place
                    
                    // Text types
                    header: chalk.bold.white,      // Headers and titles
                    subheader: chalk.gray,         // Subtitles
                    text: chalk.white,             // Regular text
                    dimText: chalk.gray,           // Less important text
                    highlight: chalk.bold.cyan,    // Important highlights
                    
                    // Training types
                    speedTraining: chalk.red.bold,
                    staminaTraining: chalk.blue.bold,
                    powerTraining: chalk.yellow.bold,
                    restDay: chalk.green.bold,
                    mediaDay: chalk.magenta.bold
                }
            },

            // Protanopia/Deuteranopia friendly (red-green colorblind)
            protanopia: {
                name: 'Red-Green Colorblind Support',
                description: 'Optimized for protanopia and deuteranopia',
                colors: {
                    primary: chalk.blue,
                    secondary: chalk.yellow,
                    accent: chalk.magenta,
                    
                    success: chalk.blue,           // Blue instead of green
                    warning: chalk.yellow,
                    error: chalk.magenta,          // Magenta instead of red
                    info: chalk.cyan,
                    
                    speed: chalk.magenta,          // Magenta instead of red
                    stamina: chalk.blue,
                    power: chalk.yellow,
                    energy: chalk.cyan,            // Cyan instead of green
                    
                    position1: chalk.hex('#FFD700'),
                    position2: chalk.hex('#C0C0C0'),
                    position3: chalk.hex('#CD7F32'),
                    
                    header: chalk.bold.white,
                    subheader: chalk.gray,
                    text: chalk.white,
                    dimText: chalk.gray,
                    highlight: chalk.bold.blue,
                    
                    speedTraining: chalk.magenta.bold,
                    staminaTraining: chalk.blue.bold,
                    powerTraining: chalk.yellow.bold,
                    restDay: chalk.cyan.bold,
                    mediaDay: chalk.white.bold
                }
            },

            // Tritanopia friendly (blue-yellow colorblind)
            tritanopia: {
                name: 'Blue-Yellow Colorblind Support',
                description: 'Optimized for tritanopia',
                colors: {
                    primary: chalk.red,
                    secondary: chalk.green,
                    accent: chalk.magenta,
                    
                    success: chalk.green,
                    warning: chalk.red,            // Red instead of yellow
                    error: chalk.magenta,
                    info: chalk.cyan,
                    
                    speed: chalk.red,
                    stamina: chalk.green,          // Green instead of blue
                    power: chalk.magenta,          // Magenta instead of yellow
                    energy: chalk.green,
                    
                    position1: chalk.hex('#FFFFFF'),  // White instead of gold
                    position2: chalk.hex('#C0C0C0'),
                    position3: chalk.hex('#808080'),  // Gray instead of bronze
                    
                    header: chalk.bold.white,
                    subheader: chalk.gray,
                    text: chalk.white,
                    dimText: chalk.gray,
                    highlight: chalk.bold.red,
                    
                    speedTraining: chalk.red.bold,
                    staminaTraining: chalk.green.bold,
                    powerTraining: chalk.magenta.bold,
                    restDay: chalk.green.bold,
                    mediaDay: chalk.white.bold
                }
            },

            // High contrast for better visibility
            highContrast: {
                name: 'High Contrast',
                description: 'Maximum contrast for better visibility',
                colors: {
                    primary: chalk.bold.white,
                    secondary: chalk.bold.yellow,
                    accent: chalk.bold.magenta,
                    
                    success: chalk.bold.green,
                    warning: chalk.bold.yellow,
                    error: chalk.bold.red,
                    info: chalk.bold.cyan,
                    
                    speed: chalk.bold.red,
                    stamina: chalk.bold.blue,
                    power: chalk.bold.yellow,
                    energy: chalk.bold.green,
                    
                    position1: chalk.bold.yellow,
                    position2: chalk.bold.white,
                    position3: chalk.bold.gray,
                    
                    header: chalk.bold.white,
                    subheader: chalk.bold.gray,
                    text: chalk.white,
                    dimText: chalk.gray,
                    highlight: chalk.bold.yellow,
                    
                    speedTraining: chalk.bold.red,
                    staminaTraining: chalk.bold.blue,
                    powerTraining: chalk.bold.yellow,
                    restDay: chalk.bold.green,
                    mediaDay: chalk.bold.magenta
                }
            },

            // Monochrome for users who prefer no colors
            monochrome: {
                name: 'Monochrome',
                description: 'No colors, just different text styles',
                colors: {
                    primary: chalk.bold,
                    secondary: chalk.underline,
                    accent: chalk.italic,
                    
                    success: chalk.bold,
                    warning: chalk.underline,
                    error: chalk.bold.underline,
                    info: chalk.italic,
                    
                    speed: chalk.bold,
                    stamina: chalk.underline,
                    power: chalk.italic,
                    energy: chalk.bold,
                    
                    position1: chalk.bold.underline,
                    position2: chalk.bold,
                    position3: chalk.underline,
                    
                    header: chalk.bold,
                    subheader: chalk.italic,
                    text: (text) => text,          // No formatting
                    dimText: chalk.dim,
                    highlight: chalk.bold,
                    
                    speedTraining: chalk.bold,
                    staminaTraining: chalk.underline,
                    powerTraining: chalk.italic,
                    restDay: chalk.bold,
                    mediaDay: chalk.underline
                }
            }
        };
    }

    /**
     * Set the current color theme
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            return true;
        }
        return false;
    }

    /**
     * Get current theme information
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            info: this.themes[this.currentTheme]
        };
    }

    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return Object.keys(this.themes).map(key => ({
            key,
            name: this.themes[key].name,
            description: this.themes[key].description
        }));
    }

    /**
     * Apply color to text using current theme
     */
    color(colorType, text) {
        const theme = this.themes[this.currentTheme];
        const colorFunction = theme.colors[colorType];
        
        if (colorFunction && typeof colorFunction === 'function') {
            return colorFunction(text);
        }
        
        // Fallback to plain text if color type not found
        return text;
    }

    /**
     * Convenient methods for common UI elements
     */
    header(text) { return this.color('header', text); }
    subheader(text) { return this.color('subheader', text); }
    success(text) { return this.color('success', text); }
    warning(text) { return this.color('warning', text); }
    error(text) { return this.color('error', text); }
    info(text) { return this.color('info', text); }
    highlight(text) { return this.color('highlight', text); }
    
    // Stat colors
    speed(text) { return this.color('speed', text); }
    stamina(text) { return this.color('stamina', text); }
    power(text) { return this.color('power', text); }
    energy(text) { return this.color('energy', text); }

    // Training colors
    speedTraining(text) { return this.color('speedTraining', text); }
    staminaTraining(text) { return this.color('staminaTraining', text); }
    powerTraining(text) { return this.color('powerTraining', text); }
    restDay(text) { return this.color('restDay', text); }
    mediaDay(text) { return this.color('mediaDay', text); }

    // Position colors
    position1(text) { return this.color('position1', text); }
    position2(text) { return this.color('position2', text); }
    position3(text) { return this.color('position3', text); }

    /**
     * Create a progress bar with colors
     */
    progressBar(current, max, width = 20, statType = 'primary') {
        const percentage = Math.min(current / max, 1);
        const filled = Math.floor(percentage * width);
        const empty = width - filled;
        
        const filledChar = '█';
        const emptyChar = '░';
        
        const filledPart = this.color(statType, filledChar.repeat(filled));
        const emptyPart = this.color('dimText', emptyChar.repeat(empty));
        
        return `[${filledPart}${emptyPart}] ${current}/${max}`;
    }

    /**
     * Create a stat display with appropriate colors
     */
    statDisplay(statName, value, maxValue = 100) {
        const statColor = statName.toLowerCase();
        const displayName = this.color(statColor, statName.toUpperCase());
        const progressBar = this.progressBar(value, maxValue, 15, statColor);
        
        return `${displayName}: ${progressBar}`;
    }

    /**
     * Theme preview for settings menu
     */
    generateThemePreview(themeName = null) {
        const originalTheme = this.currentTheme;
        if (themeName) this.setTheme(themeName);
        
        const preview = [
            this.header('█ Theme Preview'),
            '',
            `${this.success('✓ Success')} ${this.warning('⚠ Warning')} ${this.error('✗ Error')}`,
            '',
            this.statDisplay('Speed', 75, 100),
            this.statDisplay('Stamina', 60, 100),
            this.statDisplay('Power', 85, 100),
            '',
            `${this.speedTraining('1. Speed Training')} ${this.staminaTraining('2. Stamina Training')}`,
            `${this.powerTraining('3. Power Training')} ${this.restDay('4. Rest Day')}`,
            ''
        ].join('\n');
        
        // Restore original theme
        this.setTheme(originalTheme);
        return preview;
    }

    /**
     * Auto-detect best theme based on environment (if needed)
     */
    autoDetectTheme() {
        // In a real implementation, you might detect terminal capabilities
        // For now, just return standard as default
        return 'standard';
    }
}

module.exports = ColorThemeManager;