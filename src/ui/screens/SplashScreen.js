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
        console.log('                         Press any key to continue...');
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
        
        // Replace loading message with continue prompt
        // Move cursor up one line and clear it, then show continue message
        process.stdout.write('\u001b[1A\u001b[2K');
        console.log('                         Press any key to continue...');
        
        // Return immediately - let GameApp's readline handle the input
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