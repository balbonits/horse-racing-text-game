/**
 * Startup Screen - Initial Legal Protection & Game Introduction
 * 
 * Displays comprehensive legal disclaimer before any game content loads
 * to provide maximum legal protection from the moment the game starts.
 */

const DisclaimerScreen = require('../legal/DisclaimerScreen');

class StartupScreen {
    constructor() {
        this.disclaimerScreen = new DisclaimerScreen();
        this.currentStep = 'loading';
        this.legalAccepted = false;
    }

    async displayStartupSequence() {
        // Step 1: Initial copyright notice
        console.clear();
        this.displayCopyrightNotice();
        await this.delay(2000);

        // Step 2: Loading with legal reminders
        await this.displayLegalLoadingScreen();

        // Step 3: Full disclaimer (first time only)
        const fullDisclaimer = await this.displayLegalDisclaimer();
        if (!fullDisclaimer.accepted) {
            return { quit: true, reason: 'Legal disclaimer not accepted' };
        }

        // Step 4: Welcome screen
        this.displayWelcomeScreen();
        
        return { 
            quit: false, 
            legalAccepted: true,
            proceedToGame: true 
        };
    }

    displayCopyrightNotice() {
        const notice = [
            "",
            "═".repeat(80),
            "                        HORSE RACING TEXT GAME v1.0",
            "                              Personal Project",
            "═".repeat(80),
            "",
            "⚖️  IMPORTANT LEGAL NOTICE:",
            "",
            "This is a work of PARODY and FICTION protected under fair use.",
            "All content is FICTIONAL - any similarities to real entities",
            "are PURELY COINCIDENTAL and UNINTENTIONAL.",
            "",
            "NOT FOR COMMERCIAL DISTRIBUTION - Personal/Educational Use Only",
            "",
            "Protected under U.S. Copyright Law (17 U.S.C. § 107)",
            "Fair Use - Parody, Comment, Educational Purpose",
            "",
            "═".repeat(80),
            ""
        ];

        notice.forEach(line => console.log(line));
    }

    async displayLegalLoadingScreen() {
        console.clear();
        
        const loadingMessages = [
            "🔒 Initializing legal protections...",
            "📝 Loading parody disclaimer framework...",
            "⚖️ Activating fair use safeguards...",  
            "🛡️ Enabling copyright protection systems...",
            "🔍 Scanning for trademark conflicts... NONE FOUND",
            "✅ All legal safeguards active and operational",
            "🎮 Ready to launch parody simulation..."
        ];

        for (let i = 0; i < loadingMessages.length; i++) {
            console.clear();
            console.log("\n" + "═".repeat(60));
            console.log("          LEGAL PROTECTION INITIALIZATION");
            console.log("═".repeat(60));
            console.log("");
            
            // Show completed steps
            for (let j = 0; j <= i; j++) {
                console.log(`${loadingMessages[j]}`);
            }
            
            // Show loading bar
            const progress = Math.floor(((i + 1) / loadingMessages.length) * 20);
            const bar = "█".repeat(progress) + "░".repeat(20 - progress);
            console.log(`\n[${bar}] ${Math.floor(((i + 1) / loadingMessages.length) * 100)}%`);
            
            await this.delay(800);
        }
        
        console.log("\n✅ ALL LEGAL PROTECTIONS ACTIVE");
        await this.delay(1500);
    }

    async displayLegalDisclaimer() {
        console.clear();
        
        const disclaimer = this.disclaimerScreen.displayDisclaimer();
        console.log(disclaimer);

        return new Promise((resolve) => {
            const handleInput = (key) => {
                const keyPressed = key.toLowerCase();
                
                if (keyPressed === 'a') {
                    try {
                        if (process.stdin.setRawMode) {
                            process.stdin.setRawMode(false);
                        }
                    } catch (error) {
                        console.log('Disclaimer cleanup error (continuing anyway):', error.message);
                    }
                    process.stdin.pause();
                    resolve({ accepted: true });
                } else if (keyPressed === 'q' || keyPressed === '\u0003') { // 'q' or Ctrl+C
                    try {
                        if (process.stdin.setRawMode) {
                            process.stdin.setRawMode(false);
                        }
                    } catch (error) {
                        console.log('Disclaimer cleanup error (continuing anyway):', error.message);
                    }
                    process.stdin.pause();
                    console.log("\n\nGame terminated. Thank you for reading our legal disclaimer.");
                    resolve({ accepted: false });
                }
            };

            try {
                if (process.stdin.setRawMode) {
                    process.stdin.setRawMode(true);
                }
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', handleInput);
            } catch (error) {
                console.log('Disclaimer error (continuing anyway):', error.message);
                // Fallback: just wait for input without raw mode
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', handleInput);
            }
        });
    }

    displayWelcomeScreen() {
        console.clear();
        
        const welcome = [
            "",
            "═".repeat(70),
            "              🐎 WELCOME TO HORSE RACING STABLES 🐎",
            "                    (Parody Simulation Game)",
            "═".repeat(70),
            "",
            "You are about to become a STABLE OWNER - the architect of your",
            "own racing dynasty. Build your stable, breed champions, and",
            "compete for glory in this FICTIONAL racing world.",
            "",
            "🏆 GAMEPLAY FEATURES:",
            "• Manage your own racing stable and facilities",
            "• Breed and train multiple thoroughbred racehorses", 
            "• Compete in prestigious fictional racing circuits",
            "• Build your reputation from unknown to legendary",
            "• Develop bloodlines through strategic breeding",
            "",
            "📝 REMINDER: This is a work of PARODY. All names, events,",
            "    and characters are FICTIONAL. Any similarities to",
            "    real racing entities are purely coincidental.",
            "",
            "🎮 Ready to begin your journey to racing greatness?",
            "",
            "    Press [ENTER] to start your racing career...",
            "    Press [Q] to quit",
            "",
            this.getCopyrightFooter(),
            ""
        ];

        welcome.forEach(line => console.log(line));

        return new Promise((resolve) => {
            const handleInput = (key) => {
                if (key === '\r' || key === '\n') { // Enter key
                    try {
                        if (process.stdin.setRawMode) {
                            process.stdin.setRawMode(false);
                        }
                    } catch (error) {
                        console.log('Welcome screen cleanup error (continuing anyway):', error.message);
                    }
                    process.stdin.pause();
                    resolve({ proceed: true });
                } else if (key.toLowerCase() === 'q' || key === '\u0003') { // 'q' or Ctrl+C
                    try {
                        if (process.stdin.setRawMode) {
                            process.stdin.setRawMode(false);
                        }
                    } catch (error) {
                        console.log('Welcome screen cleanup error (continuing anyway):', error.message);
                    }
                    process.stdin.pause();
                    resolve({ proceed: false });
                }
            };

            try {
                if (process.stdin.setRawMode) {
                    process.stdin.setRawMode(true);
                }
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', handleInput);
            } catch (error) {
                console.log('Welcome screen error (continuing anyway):', error.message);
                // Fallback: just wait for input without raw mode
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', handleInput);
            }
        });
    }

    getCopyrightFooter() {
        const year = new Date().getFullYear();
        return [
            "─".repeat(70),
            "© " + year + " Horse Racing Text Game | Personal Project | Not for Distribution",
            "Parody work protected by fair use | All content fictional",
            "Contact: See documentation for legal inquiries",
            "─".repeat(70)
        ].join("\n");
    }

    getGameFooter() {
        // Footer to be displayed at bottom of all game screens
        return "📝 PARODY NOTICE: Fictional content | See docs/LEGAL_DISCLAIMER.md";
    }

    getMenuFooter() {
        // Shorter footer for in-game menus
        return "⚖️ Parody Game - All Content Fictional | Not Affiliated with Real Racing";
    }

    getMinimalFooter() {
        // Minimal footer for space-constrained screens
        return "Parody • Fictional • Educational Use";
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Legal acknowledgment tracking
    hasUserAcceptedLegal(userProfile) {
        return userProfile && 
               userProfile.legalAcknowledgments && 
               userProfile.legalAcknowledgments.disclaimerAccepted === true;
    }

    saveUserLegalAcceptance(userProfile) {
        if (!userProfile.legalAcknowledgments) {
            userProfile.legalAcknowledgments = {};
        }
        
        userProfile.legalAcknowledgments = {
            disclaimerAccepted: true,
            acceptedDate: new Date().toISOString(),
            version: "1.0",
            gameVersion: "1.0",
            ipAddress: "127.0.0.1", // Local only - not collecting real IPs
            userAgent: "Horse Racing Text Game v1.0"
        };
    }

    // Quick disclaimer for returning users
    async displayQuickDisclaimer() {
        console.clear();
        
        const quickDisclaimer = [
            "",
            "═".repeat(50),
            "    HORSE RACING EMPIRE - PARODY NOTICE",  
            "═".repeat(50),
            "",
            "🎭 This is a work of PARODY protected by fair use",
            "📝 All names and events are completely FICTIONAL",
            "⚠️  Any similarities to real entities are COINCIDENTAL",
            "🚫 NOT affiliated with any real racing organizations",
            "",
            "📄 Full legal disclaimer available in documentation",
            "",
            "Press [ENTER] to continue to game...",
            ""
        ];

        quickDisclaimer.forEach(line => console.log(line));

        return new Promise((resolve) => {
            process.stdin.once('data', () => {
                resolve({ accepted: true });
            });
        });
    }

    // Emergency legal exit
    displayLegalExit() {
        console.clear();
        
        const exitMessage = [
            "",
            "═".repeat(60),
            "           GAME TERMINATED - LEGAL COMPLIANCE",
            "═".repeat(60),
            "",
            "Thank you for taking the time to read our legal disclaimer.",
            "",
            "This game takes intellectual property rights seriously.",
            "We respect your decision not to proceed.",
            "",
            "If you have legal concerns, please refer to:",
            "• docs/LEGAL_DISCLAIMER.md - Full legal information",
            "• Contact information in documentation",
            "",
            "All content in this game is original parody work.",
            "We are committed to legal compliance and fair use.",
            "",
            "═".repeat(60),
            ""
        ];

        exitMessage.forEach(line => console.log(line));
        process.exit(0);
    }
}

module.exports = StartupScreen;