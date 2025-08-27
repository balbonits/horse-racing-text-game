/**
 * Settings Menu UI Component
 * 
 * Provides an interactive settings interface for the terminal application
 * with support for all color themes and accessibility options.
 */

class SettingsMenu {
    constructor(uiAdapter, settingsManager) {
        this.uiAdapter = uiAdapter;
        this.settingsManager = settingsManager;
        this.colorManager = settingsManager.getColorManager();
        this.currentCategory = 0;
        this.currentSetting = 0;
        this.showingPreview = false;
        this.menuData = null;
    }

    /**
     * Display the main settings menu
     */
    show() {
        this.menuData = this.settingsManager.getSettingsMenu();
        this.render();
    }

    /**
     * Render the settings interface
     */
    render() {
        if (!this.menuData) return;

        const category = this.menuData.categories[this.currentCategory];
        const setting = category.settings[this.currentSetting];

        // Build header
        const header = this.colorManager.header('⚙️  Game Settings');
        const categoryNav = this.renderCategoryNavigation();
        
        // Build main content
        const content = [];
        content.push(header);
        content.push('');
        content.push(categoryNav);
        content.push('');
        content.push(this.renderCurrentCategory());
        
        // Add theme preview if showing
        if (this.showingPreview && category.key === 'theme') {
            content.push('');
            content.push(this.colorManager.header('Theme Preview:'));
            content.push(this.renderThemePreview());
        }

        // Add controls
        content.push('');
        content.push(this.renderControls());

        // Output to console (in a real terminal app, this would go to the UI adapter)
        console.clear();
        console.log(content.join('\n'));
    }

    /**
     * Render category navigation tabs
     */
    renderCategoryNavigation() {
        const tabs = this.menuData.categories.map((cat, index) => {
            const isActive = index === this.currentCategory;
            const tabText = isActive ? 
                this.colorManager.highlight(`[${cat.name}]`) : 
                this.colorManager.dimText(`${cat.name}`);
            
            return `${index + 1}. ${tabText}`;
        });
        
        return tabs.join('  ');
    }

    /**
     * Render current category settings
     */
    renderCurrentCategory() {
        const category = this.menuData.categories[this.currentCategory];
        const content = [];
        
        content.push(this.colorManager.subheader(`${category.name} Settings:`));
        content.push('');

        category.settings.forEach((setting, index) => {
            const isSelected = index === this.currentSetting;
            const isEnabled = this.settingsManager.isSettingEnabled(category.key, setting.key);
            
            const prefix = isSelected ? this.colorManager.accent('▶ ') : '  ';
            const statusColor = isEnabled ? 'text' : 'dimText';
            
            let valueDisplay = '';
            if (setting.type === 'boolean') {
                const status = setting.current ? 
                    this.colorManager.success('ON') : 
                    this.colorManager.dimText('OFF');
                valueDisplay = `[${status}]`;
            } else if (setting.type === 'select') {
                const option = setting.options.find(opt => opt.key === setting.current);
                valueDisplay = `[${this.colorManager.info(option ? option.name : setting.current)}]`;
            }

            const settingLine = `${prefix}${this.colorManager[statusColor](setting.name)} ${valueDisplay}`;
            content.push(settingLine);
            
            if (isSelected) {
                const desc = this.colorManager.dimText(`  ${setting.description}`);
                content.push(desc);
                
                // Show options for select settings
                if (setting.type === 'select' && isEnabled) {
                    content.push('');
                    setting.options.forEach((option, optIndex) => {
                        const isCurrent = option.key === setting.current;
                        const optionPrefix = isCurrent ? 
                            this.colorManager.success('  ● ') : 
                            this.colorManager.dimText('  ○ ');
                        
                        const optionText = isCurrent ? 
                            this.colorManager.highlight(option.name) : 
                            this.colorManager.text(option.name);
                        
                        content.push(`${optionPrefix}${optionText}`);
                        if (option.description) {
                            content.push(this.colorManager.dimText(`      ${option.description}`));
                        }
                    });
                }
            }
            
            if (!isEnabled) {
                content.push(this.colorManager.dimText('    (Disabled - enable prerequisites first)'));
            }
        });

        return content.join('\n');
    }

    /**
     * Render theme preview
     */
    renderThemePreview() {
        const category = this.menuData.categories[this.currentCategory];
        const setting = category.settings[this.currentSetting];
        
        if (setting.key === 'colorTheme') {
            const themeName = setting.current;
            return this.settingsManager.getThemePreview(themeName);
        }
        
        return '';
    }

    /**
     * Render control instructions
     */
    renderControls() {
        const controls = [];
        
        controls.push(this.colorManager.subheader('Controls:'));
        controls.push(`${this.colorManager.info('1-3')} Switch categories  ${this.colorManager.info('↑/↓')} Navigate settings`);
        controls.push(`${this.colorManager.info('←/→')} Change value     ${this.colorManager.info('SPACE')} Toggle boolean`);
        controls.push(`${this.colorManager.info('P')} Preview theme     ${this.colorManager.info('R')} Reset to defaults`);
        controls.push(`${this.colorManager.info('S')} Save & Exit       ${this.colorManager.info('Q')} Exit without saving`);
        
        return controls.join('\n');
    }

    /**
     * Handle input events
     */
    handleInput(input) {
        const normalizedInput = input.toLowerCase().trim();
        
        // Category switching
        if (['1', '2', '3'].includes(normalizedInput)) {
            const categoryIndex = parseInt(normalizedInput) - 1;
            if (categoryIndex < this.menuData.categories.length) {
                this.currentCategory = categoryIndex;
                this.currentSetting = 0;
                this.showingPreview = false;
                this.render();
                return { handled: true };
            }
        }

        // Navigation
        switch (normalizedInput) {
            case 'arrowup':
            case 'up':
                this.navigateUp();
                return { handled: true };
                
            case 'arrowdown':
            case 'down':
                this.navigateDown();
                return { handled: true };
                
            case 'arrowleft':
            case 'left':
                this.changeSettingValue(-1);
                return { handled: true };
                
            case 'arrowright':
            case 'right':
                this.changeSettingValue(1);
                return { handled: true };
                
            case ' ':
            case 'space':
                this.toggleBoolean();
                return { handled: true };
                
            case 'p':
                this.togglePreview();
                return { handled: true };
                
            case 'r':
                this.resetSettings();
                return { handled: true };
                
            case 's':
                this.saveAndExit();
                return { handled: true, exit: true };
                
            case 'q':
                return { handled: true, exit: true, save: false };
                
            default:
                return { handled: false };
        }
    }

    /**
     * Navigate up through settings
     */
    navigateUp() {
        this.currentSetting = Math.max(0, this.currentSetting - 1);
        this.showingPreview = false;
        this.render();
    }

    /**
     * Navigate down through settings
     */
    navigateDown() {
        const maxSettings = this.menuData.categories[this.currentCategory].settings.length - 1;
        this.currentSetting = Math.min(maxSettings, this.currentSetting + 1);
        this.showingPreview = false;
        this.render();
    }

    /**
     * Change setting value (for select types)
     */
    changeSettingValue(direction) {
        const category = this.menuData.categories[this.currentCategory];
        const setting = category.settings[this.currentSetting];
        
        if (setting.type === 'select' && this.settingsManager.isSettingEnabled(category.key, setting.key)) {
            const currentIndex = setting.options.findIndex(opt => opt.key === setting.current);
            const newIndex = Math.max(0, Math.min(setting.options.length - 1, currentIndex + direction));
            const newValue = setting.options[newIndex].key;
            
            if (newValue !== setting.current) {
                const result = this.settingsManager.changeSetting(category.key, setting.key, newValue);
                if (result.success) {
                    // Update local menu data
                    setting.current = newValue;
                    this.render();
                }
            }
        }
    }

    /**
     * Toggle boolean setting
     */
    toggleBoolean() {
        const category = this.menuData.categories[this.currentCategory];
        const setting = category.settings[this.currentSetting];
        
        if (setting.type === 'boolean' && this.settingsManager.isSettingEnabled(category.key, setting.key)) {
            const newValue = !setting.current;
            const result = this.settingsManager.changeSetting(category.key, setting.key, newValue);
            if (result.success) {
                setting.current = newValue;
                this.render();
            }
        }
    }

    /**
     * Toggle theme preview
     */
    togglePreview() {
        const category = this.menuData.categories[this.currentCategory];
        if (category.key === 'theme') {
            this.showingPreview = !this.showingPreview;
            this.render();
        }
    }

    /**
     * Reset all settings to defaults
     */
    resetSettings() {
        const confirmed = true; // In a real UI, you'd show a confirmation dialog
        if (confirmed) {
            this.settingsManager.resetSettings();
            this.menuData = this.settingsManager.getSettingsMenu();
            this.render();
        }
    }

    /**
     * Save and exit
     */
    saveAndExit() {
        const result = this.settingsManager.saveSettings();
        if (result.success) {
            console.log(this.colorManager.success('\n✓ Settings saved successfully!'));
        } else {
            console.log(this.colorManager.error('\n✗ Error saving settings: ' + result.error));
        }
    }

    /**
     * Quick color theme demo for testing
     */
    demonstrateThemes() {
        const themes = this.colorManager.getAvailableThemes();
        console.log(this.colorManager.header('🎨 Color Theme Demonstration'));
        console.log('');
        
        themes.forEach(theme => {
            console.log(this.colorManager.subheader(`${theme.name}:`));
            console.log(this.settingsManager.getThemePreview(theme.key));
            console.log('');
        });
    }
}

module.exports = SettingsMenu;