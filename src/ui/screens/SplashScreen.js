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
        // First show the main splash
        this.display();
        
        // Wait for user input
        return new Promise((resolve) => {
            const handleInput = () => {
                process.stdin.removeListener('data', handleInput);
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            };

            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', handleInput);
        });
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
        // Show loading
        await this.displayLoadingAnimation('Preparing the track...');
        
        // Show main splash
        await this.displayAnimated();
        
        return { success: true };
    }
}

module.exports = SplashScreen;