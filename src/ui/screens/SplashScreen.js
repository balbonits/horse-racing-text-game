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
                try {
                    if (process.stdin.setRawMode) {
                        process.stdin.setRawMode(false);
                    }
                } catch (error) {
                    console.log('Splash screen cleanup error (continuing anyway):', error.message);
                }
                process.stdin.pause();
                resolve();
            };

            try {
                if (process.stdin.setRawMode) {
                    process.stdin.setRawMode(true);
                }
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', handleInput);
            } catch (error) {
                console.log('Splash screen error (continuing anyway):', error.message);
                // Fallback: just wait for any input without raw mode
                try {
                    if (process.stdin.resume) {
                        process.stdin.resume();
                    }
                    if (process.stdin.setEncoding) {
                        process.stdin.setEncoding('utf8');
                    }
                    process.stdin.on('data', handleInput);
                } catch (fallbackError) {
                    console.log('Splash screen fallback error (skipping):', fallbackError.message);
                    // Final fallback - just resolve immediately
                    setTimeout(handleInput, 1000);
                }
            }
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