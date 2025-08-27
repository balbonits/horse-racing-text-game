/**
 * UIAdapter - Abstract Base Class for UI Framework Adapters
 * 
 * Provides a standardized interface for different terminal UI frameworks.
 * This allows easy switching between Blessed, Terminal-kit, or basic console
 * without changing the game logic.
 */

class UIAdapter {
    constructor() {
        this.screen = null;
        this.components = new Map();
        this.isInitialized = false;
    }

    // Framework identification
    get frameworkName() {
        return 'Abstract';
    }

    get supportsColors() {
        return false;
    }

    get supportsBoxes() {
        return false;
    }

    get supportsMouse() {
        return false;
    }

    // Abstract methods that must be implemented by concrete adapters
    createScreen(options = {}) {
        throw new Error('Must implement createScreen');
    }

    createDialog(config) {
        throw new Error('Must implement createDialog');
    }

    createMenu(options, config = {}) {
        throw new Error('Must implement createMenu');
    }

    createPanel(config) {
        throw new Error('Must implement createPanel');
    }

    createProgressBar(config) {
        throw new Error('Must implement createProgressBar');
    }

    createTextInput(config) {
        throw new Error('Must implement createTextInput');
    }

    render() {
        throw new Error('Must implement render');
    }

    cleanup() {
        throw new Error('Must implement cleanup');
    }

    // Common utility methods that can be inherited
    registerComponent(id, component) {
        this.components.set(id, component);
    }

    getComponent(id) {
        return this.components.get(id);
    }

    removeComponent(id) {
        const component = this.components.get(id);
        if (component) {
            this.components.delete(id);
            return component;
        }
        return null;
    }

    // Event handling interface
    onKeyPress(callback) {
        throw new Error('Must implement onKeyPress');
    }

    onExit(callback) {
        throw new Error('Must implement onExit');
    }

    // Common screen management
    showComponent(componentId) {
        const component = this.getComponent(componentId);
        if (component && component.show) {
            component.show();
        }
    }

    hideComponent(componentId) {
        const component = this.getComponent(componentId);
        if (component && component.hide) {
            component.hide();
        }
    }

    destroyComponent(componentId) {
        const component = this.removeComponent(componentId);
        if (component && component.destroy) {
            component.destroy();
        }
    }

    // Error handling and graceful degradation
    handleError(error, fallbackAction = null) {
        console.error(`UI Adapter Error (${this.frameworkName}):`, error.message);
        
        if (fallbackAction && typeof fallbackAction === 'function') {
            try {
                return fallbackAction();
            } catch (fallbackError) {
                console.error('Fallback action also failed:', fallbackError.message);
            }
        }
        
        return null;
    }

    // Validation helpers
    validateConfig(config, requiredFields = []) {
        if (!config || typeof config !== 'object') {
            throw new Error('Config must be an object');
        }

        for (const field of requiredFields) {
            if (!(field in config)) {
                throw new Error(`Required field '${field}' missing from config`);
            }
        }

        return true;
    }

    // Common styling utilities
    applyTheme(component, theme = {}) {
        // Base implementation - override in specific adapters
        return component;
    }
}

module.exports = UIAdapter;