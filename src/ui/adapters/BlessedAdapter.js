/**
 * BlessedAdapter - Blessed.js Implementation of UIAdapter
 * 
 * Implements the UIAdapter interface using the Blessed terminal UI library.
 * Provides rich terminal UI components with cross-platform compatibility.
 */

const blessed = require('blessed');
const UIAdapter = require('../core/UIAdapter');

class BlessedAdapter extends UIAdapter {
    constructor() {
        super();
        this.blessed = blessed;
    }

    // Framework identification
    get frameworkName() {
        return 'Blessed';
    }

    get supportsColors() {
        return true;
    }

    get supportsBoxes() {
        return true;
    }

    get supportsMouse() {
        return true;
    }

    // Screen management
    createScreen(options = {}) {
        if (this.screen) {
            return this.screen; // Return existing screen
        }

        try {
            const defaultOptions = {
                smartCSR: true,
                dockBorders: true,
                autoPadding: true,
                debug: process.env.NODE_ENV === 'development'
            };

            this.screen = blessed.screen({
                ...defaultOptions,
                ...options
            });

            // Set up global key handlers
            this.screen.key(['q', 'C-c'], () => {
                this.cleanup();
                process.exit(0);
            });

            this.isInitialized = true;
            return this.screen;
        } catch (error) {
            return this.handleError(error, () => {
                console.log('Failed to create Blessed screen, falling back to basic mode');
                return null;
            });
        }
    }

    // Dialog box creation
    createDialog(config) {
        this.validateConfig(config, ['content']);
        
        try {
            const defaultConfig = {
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: '60%',
                height: '40%',
                border: { type: 'line' },
                style: {
                    fg: 'white',
                    bg: 'black',
                    border: { fg: '#87ceeb' }
                },
                tags: true,
                keys: true,
                vi: true,
                scrollable: true,
                alwaysScroll: true
            };

            const dialogConfig = { ...defaultConfig, ...config };
            
            const dialog = blessed.box(dialogConfig);
            
            // Set content with title integration
            const fullContent = config.title ? 
                `${config.title}\n\n${config.content}` : 
                config.content;
            dialog.setContent(fullContent);
            
            // Add to screen and register
            if (this.screen) {
                this.screen.append(dialog);
            }
            
            const componentId = config.id || `dialog_${Date.now()}`;
            this.registerComponent(componentId, dialog);
            
            return dialog;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Menu creation
    createMenu(options, config = {}) {
        if (!Array.isArray(options) || options.length === 0) {
            throw new Error('Menu options must be a non-empty array');
        }

        try {
            const defaultConfig = {
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: '50%',
                height: Math.min(options.length + 4, 15),
                border: { type: 'line' },
                style: {
                    fg: 'white',
                    bg: 'black',
                    border: { fg: '#87ceeb' },
                    selected: { fg: 'black', bg: 'white' }
                },
                keys: true,
                vi: true,
                items: options
            };

            const menuConfig = { ...defaultConfig, ...config };
            const menu = blessed.list(menuConfig);
            
            // Add selection handlers
            menu.on('select', (item, index) => {
                if (config.onSelect) {
                    config.onSelect(item.content || item, index);
                }
            });

            if (this.screen) {
                this.screen.append(menu);
                menu.focus();
            }

            const componentId = config.id || `menu_${Date.now()}`;
            this.registerComponent(componentId, menu);
            
            return menu;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Panel creation
    createPanel(config) {
        this.validateConfig(config);

        try {
            const defaultConfig = {
                parent: this.screen,
                top: config.top || 0,
                left: config.left || 0,
                width: config.width || '30%',
                height: config.height || '20%',
                border: { type: 'line' },
                style: {
                    fg: 'white',
                    bg: 'black',
                    border: { fg: '#87ceeb' }
                },
                tags: true,
                content: config.content || ''
            };

            const panelConfig = { ...defaultConfig, ...config };
            const panel = blessed.box(panelConfig);

            if (this.screen) {
                this.screen.append(panel);
            }

            const componentId = config.id || `panel_${Date.now()}`;
            this.registerComponent(componentId, panel);

            return panel;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Progress bar creation
    createProgressBar(config) {
        this.validateConfig(config);

        try {
            const defaultConfig = {
                parent: this.screen,
                top: config.top || 'center',
                left: config.left || 'center',
                width: config.width || '60%',
                height: config.height || 3,
                border: { type: 'line' },
                style: {
                    fg: 'blue',
                    bg: 'black',
                    border: { fg: '#87ceeb' }
                },
                ch: '█',
                filled: 0
            };

            const barConfig = { ...defaultConfig, ...config };
            const progressBar = blessed.progressbar(barConfig);

            if (this.screen) {
                this.screen.append(progressBar);
            }

            const componentId = config.id || `progress_${Date.now()}`;
            this.registerComponent(componentId, progressBar);

            return progressBar;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Text input creation
    createTextInput(config) {
        this.validateConfig(config);

        try {
            const defaultConfig = {
                parent: this.screen,
                top: config.top || 'center',
                left: config.left || 'center',
                width: config.width || '50%',
                height: config.height || 3,
                border: { type: 'line' },
                style: {
                    fg: 'white',
                    bg: 'black',
                    border: { fg: '#87ceeb' }
                },
                keys: true,
                mouse: true,
                inputOnFocus: true
            };

            const inputConfig = { ...defaultConfig, ...config };
            const textInput = blessed.textbox(inputConfig);

            if (this.screen) {
                this.screen.append(textInput);
            }

            const componentId = config.id || `input_${Date.now()}`;
            this.registerComponent(componentId, textInput);

            return textInput;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Rendering
    render() {
        if (this.screen) {
            try {
                this.screen.render();
            } catch (error) {
                this.handleError(error, () => {
                    console.log('Render failed, attempting screen refresh');
                });
            }
        }
    }

    // Event handling
    onKeyPress(callback) {
        if (this.screen) {
            this.screen.on('keypress', callback);
        }
    }

    onExit(callback) {
        if (this.screen) {
            this.screen.key(['q', 'C-c'], callback);
        }
    }

    // Cleanup and resource management
    cleanup() {
        try {
            // Destroy all registered components
            for (const [id, component] of this.components) {
                if (component && component.destroy) {
                    component.destroy();
                }
            }
            this.components.clear();

            // Clean up screen
            if (this.screen) {
                this.screen.destroy();
                this.screen = null;
            }

            this.isInitialized = false;
        } catch (error) {
            console.error('Cleanup error:', error.message);
        }
    }

    // Theme application
    applyTheme(component, theme = {}) {
        if (!component || !component.style) {
            return component;
        }

        try {
            // Apply theme to component style
            Object.assign(component.style, theme);
            
            // If component is already rendered, update it
            if (this.screen) {
                this.render();
            }
        } catch (error) {
            this.handleError(error);
        }

        return component;
    }

    // Blessed-specific utilities
    showNotification(message, duration = 3000) {
        const notification = this.createDialog({
            content: message,
            width: '40%',
            height: '20%',
            title: 'Notice',
            id: 'notification'
        });

        if (notification) {
            this.render();
            
            // Auto-hide after duration
            setTimeout(() => {
                this.destroyComponent('notification');
                this.render();
            }, duration);
        }

        return notification;
    }

    // Focus management
    focusComponent(componentId) {
        const component = this.getComponent(componentId);
        if (component && component.focus) {
            component.focus();
            this.render();
        }
    }

    // Screen dimensions
    getScreenDimensions() {
        if (this.screen) {
            return {
                width: this.screen.width,
                height: this.screen.height
            };
        }
        return { width: 80, height: 24 }; // Fallback dimensions
    }
}

module.exports = BlessedAdapter;