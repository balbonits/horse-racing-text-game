/**
 * Splash Screen - ASCII Art Welcome Screen
 * 
 * Displays the main ASCII art splash screen with horse racing imagery
 * before showing the main menu.
 */

const ASCIIArt = require('../graphics/ASCIIArt');

class SplashScreen {
    constructor(colorManager = null) {
        this.colorManager = colorManager;
        this.animationFrame = 0;
        this.isAnimating = false;
    }

    /**
     * Display the main splash screen
     */
    display() {
        console.clear();
        
        if (this.colorManager) {
            console.log(ASCIIArt.getColoredSplash(this.colorManager));
        } else {
            console.log(ASCIIArt.getMainSplash());
        }

        console.log('\n');
    }

    /**
     * Display animated splash screen
     */
    async displayAnimated() {
        // First show the main splash immediately
        this.display();
        console.log('🐎 Preparing the track...');
        
        // Wait for loading to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // FIX: Clear entire screen for proper state isolation
        // Instead of just clearing loading line, clear everything
        // This prevents screen bleeding into next UI state
        console.clear();
        
        // Return immediately - next screen will render cleanly
        return Promise.resolve();
    }

    /**
     * Display simple loading message
     */
    async displayLoadingAnimation(message = 'Loading...') {
        console.clear();
        console.log('\n'.repeat(10));
        console.log('🐎 ' + message);
        
        // Simple delay instead of complex animation
        return new Promise((resolve) => {
            setTimeout(resolve, 2000); // 2 second delay
        });
    }


    /**
     * Full startup sequence
     */
    async displayStartupSequence() {
        // Show main splash with integrated loading
        await this.displayAnimated();
        
        return { success: true };
    }
}

module.exports = SplashScreen;