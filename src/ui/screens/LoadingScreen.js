/**
 * Loading Screen System - Smooth Transitions Between Game States
 * 
 * Provides contextual loading screens with animations and messages
 * for transitions between different game states.
 */

const ASCIIArt = require('../graphics/ASCIIArt');

class LoadingScreen {
    constructor(colorManager = null) {
        this.colorManager = colorManager;
        this.currentAnimation = null;
        this.animationFrame = 0;
        
        // Loading messages for different transitions
        this.transitionMessages = {
            // Main menu transitions
            'main_menu→character_creation': [
                'Preparing the stables...',
                'Setting up your office...',
                'Meeting the staff...'
            ],
            'main_menu→tutorial': [
                'Loading tutorial...',
                'Preparing guided experience...',
                'Alex Morgan is on the way...'
            ],
            'main_menu→load_game': [
                'Loading save data...',
                'Restoring your stable...',
                'Welcoming back...'
            ],
            
            // Character creation transitions
            'character_creation→training': [
                'Registering your horse...',
                'Setting up training schedule...',
                'Meeting the trainers...',
                'Your journey begins...'
            ],
            
            // Training transitions
            'training→race_preview': [
                'Heading to the track...',
                'Checking race conditions...',
                'Reviewing competition...'
            ],
            
            // Race transitions
            'race_preview→horse_lineup': [
                'Entering the paddock...',
                'Saddling up...',
                'Meeting the other competitors...'
            ],
            'horse_lineup→strategy_select': [
                'Walking to the gate...',
                'Discussing strategy with jockey...',
                'Final preparations...'
            ],
            'strategy_select→race_running': [
                'Taking positions...',
                'Gates loading...',
                'The crowd goes silent...'
            ],
            'race_running→race_results': [
                'Crossing the finish line...',
                'Catching our breath...',
                'Calculating results...'
            ],
            'race_results→training': [
                'Returning to the stables...',
                'Reviewing performance...',
                'Planning next training session...'
            ],
            
            // Career transitions
            'training→career_complete': [
                'Tallying achievements...',
                'Calculating final scores...',
                'Preparing career summary...'
            ],
            'career_complete→main_menu': [
                'Saving legacy...',
                'Returning to menu...',
                'Thank you for playing!'
            ],
            
            // Tutorial transitions
            'tutorial→tutorial_training': [
                'Starting tutorial...',
                'Alex Morgan arrives...',
                'Preparing lesson plan...'
            ],
            'tutorial_training→tutorial_race': [
                'Tutorial race approaching...',
                'Getting ready for your first race...',
                'This is exciting!'
            ],
            'tutorial_race→tutorial_complete': [
                'Finishing tutorial...',
                'Calculating your progress...',
                'Preparing graduation certificate...'
            ],
            'tutorial_complete→main_menu': [
                'Tutorial complete!',
                'You\'re ready for the real thing...',
                'Returning to main menu...'
            ],
            
            // Generic transitions
            'any→main_menu': [
                'Returning to main menu...',
                'Saving progress...',
                'See you at the stables...'
            ],
            'any→help': [
                'Loading help information...',
                'Gathering tips...',
                'Here to help...'
            ]
        };
        
        // Animation frames for loading
        this.loadingAnimations = {
            dots: ['   ', '.  ', '.. ', '...'],
            spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
            horse: ['🐎   ', ' 🐎  ', '  🐎 ', '   🐎', '  🐎 ', ' 🐎  '],
            track: [
                '🏁░░░░░🐎',
                '🏁░░░🐎░░',
                '🏁░░🐎░░░',
                '🏁░🐎░░░░',
                '🏁🐎░░░░░'
            ],
            hoofprints: ['   ', '⬡  ', '⬡⬡ ', '⬡⬡⬡'],
            progress: [
                '[░░░░░░░░░░]',
                '[██░░░░░░░░]',
                '[████░░░░░░]',
                '[██████░░░░]',
                '[████████░░]',
                '[██████████]'
            ]
        };
    }
    
    /**
     * Display loading screen for state transition
     */
    async displayTransition(fromState, toState, duration = 2000) {
        const transitionKey = `${fromState}→${toState}`;
        const messages = this.transitionMessages[transitionKey] || 
                        this.transitionMessages[`any→${toState}`] || 
                        ['Loading...'];
        
        // Pick appropriate animation based on transition
        const animation = this.selectAnimation(fromState, toState);
        
        return this.animateLoading(messages, animation, duration);
    }
    
    /**
     * Select appropriate animation for transition
     */
    selectAnimation(fromState, toState) {
        // Tutorial uses horse animation (check first to avoid conflicts with 'training')
        if (fromState.includes('tutorial') || toState.includes('tutorial')) {
            return 'horse';
        }
        // Character creation uses progress bar
        if (toState === 'character_creation' || fromState === 'character_creation') {
            return 'progress';
        }
        // Race-related transitions use track animation
        if (fromState.includes('race') || toState.includes('race')) {
            return 'track';
        }
        // Training uses hoofprints
        if (fromState.includes('training') || toState.includes('training')) {
            return 'hoofprints';
        }
        // Default to spinner
        return 'spinner';
    }
    
    /**
     * Animate loading screen
     */
    async animateLoading(messages, animationType, duration) {
        const startTime = Date.now();
        const messageInterval = duration / messages.length;
        const frames = this.loadingAnimations[animationType] || this.loadingAnimations.dots;
        
        let messageIndex = 0;
        let frameIndex = 0;
        let lastMessageTime = startTime;
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                
                // Update message based on time
                if (elapsed - lastMessageTime > messageInterval && messageIndex < messages.length - 1) {
                    messageIndex++;
                    lastMessageTime = elapsed;
                }
                
                // Clear and render
                console.clear();
                this.renderLoadingScreen(messages[messageIndex], frames[frameIndex], elapsed / duration);
                
                // Update frame
                frameIndex = (frameIndex + 1) % frames.length;
                
                // Check if done
                if (elapsed >= duration) {
                    resolve();
                } else {
                    setTimeout(animate, 100); // 10 FPS for smooth animation
                }
            };
            
            animate();
        });
    }
    
    /**
     * Render the loading screen
     */
    renderLoadingScreen(message, animationFrame, progress = 0) {
        const lines = [];
        
        // Add spacing
        lines.push('\n'.repeat(8));
        
        // Add animation frame
        lines.push(this.centerText(animationFrame));
        lines.push('');
        
        // Add message
        if (this.colorManager) {
            lines.push(this.centerText(this.colorManager.info(message)));
        } else {
            lines.push(this.centerText(message));
        }
        
        // Add progress bar
        lines.push('');
        lines.push(this.renderProgressBar(progress));
        
        // Add spacing
        lines.push('\n'.repeat(8));
        
        console.log(lines.join('\n'));
    }
    
    /**
     * Render progress bar
     */
    renderProgressBar(progress) {
        const width = 40;
        const filled = Math.floor(progress * width);
        const empty = width - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        const percentage = Math.floor(progress * 100);
        
        const progressText = `[${bar}] ${percentage}%`;
        
        if (this.colorManager) {
            return this.centerText(this.colorManager.info(progressText));
        }
        return this.centerText(progressText);
    }
    
    /**
     * Center text for display
     */
    centerText(text) {
        const width = process.stdout.columns || 80;
        // Remove ANSI codes for length calculation
        const plainText = text.replace(/\x1b\[[0-9;]*m/g, '');
        const padding = Math.max(0, Math.floor((width - plainText.length) / 2));
        return ' '.repeat(padding) + text;
    }
    
    /**
     * Quick loading message (no animation)
     */
    displayQuickMessage(message, duration = 1000) {
        console.clear();
        console.log('\n'.repeat(10));
        
        if (this.colorManager) {
            console.log(this.centerText(this.colorManager.info(message)));
        } else {
            console.log(this.centerText(message));
        }
        
        console.log('\n'.repeat(10));
        
        return new Promise(resolve => setTimeout(resolve, duration));
    }
    
    /**
     * Display error loading screen
     */
    displayError(message, duration = 3000) {
        console.clear();
        console.log('\n'.repeat(10));
        
        console.log(this.centerText('❌ Error ❌'));
        console.log('');
        
        if (this.colorManager) {
            console.log(this.centerText(this.colorManager.error(message)));
        } else {
            console.log(this.centerText(message));
        }
        
        console.log('');
        console.log(this.centerText('Please try again...'));
        console.log('\n'.repeat(10));
        
        return new Promise(resolve => setTimeout(resolve, duration));
    }
    
    /**
     * Display success screen
     */
    displaySuccess(message, duration = 2000) {
        console.clear();
        console.log('\n'.repeat(10));
        
        console.log(this.centerText('✅ Success! ✅'));
        console.log('');
        
        if (this.colorManager) {
            console.log(this.centerText(this.colorManager.success(message)));
        } else {
            console.log(this.centerText(message));
        }
        
        console.log('\n'.repeat(10));
        
        return new Promise(resolve => setTimeout(resolve, duration));
    }
    
    /**
     * Race countdown animation
     */
    async displayRaceCountdown() {
        const countdown = ['3', '2', '1', 'GO!'];
        
        for (const num of countdown) {
            console.clear();
            console.log('\n'.repeat(10));
            
            const display = num === 'GO!' ? 
                `🏁 ${num} 🏁` : 
                `   ${num}   `;
                
            if (this.colorManager) {
                const colored = num === 'GO!' ? 
                    this.colorManager.success(display) :
                    this.colorManager.warning(display);
                console.log(this.centerText(colored));
            } else {
                console.log(this.centerText(display));
            }
            
            console.log('\n'.repeat(10));
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    /**
     * Training complete animation
     */
    async displayTrainingComplete(statGained, amount) {
        const messages = [
            `Training Session Complete!`,
            `${statGained.toUpperCase()} +${amount}`,
            'Great work!'
        ];
        
        for (const msg of messages) {
            console.clear();
            console.log('\n'.repeat(10));
            
            if (this.colorManager) {
                console.log(this.centerText(this.colorManager.success(msg)));
            } else {
                console.log(this.centerText(msg));
            }
            
            console.log('\n'.repeat(10));
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
    
    /**
     * Save game animation
     */
    async displaySaving() {
        const frames = ['💾 Saving', '💾 Saving.', '💾 Saving..', '💾 Saving...'];
        
        for (let i = 0; i < 8; i++) {
            console.clear();
            console.log('\n'.repeat(10));
            console.log(this.centerText(frames[i % frames.length]));
            console.log('\n'.repeat(10));
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        
        return this.displaySuccess('Game Saved!', 1000);
    }
}

module.exports = LoadingScreen;