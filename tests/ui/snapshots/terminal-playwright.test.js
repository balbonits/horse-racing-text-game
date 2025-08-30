/**
 * Terminal Screen Capture Tests using Playwright
 * 
 * Captures text-based snapshots of actual terminal output for each game screen.
 * Each snapshot focuses on a single screen state without UI transitions.
 */

const { spawn } = require('child_process');
const { setTimeout: sleep } = require('timers/promises');
const fs = require('fs').promises;
const path = require('path');

describe('Terminal Screen Snapshots', () => {
    let gameProcess;
    let outputBuffer = '';
    let lastScreenContent = '';

    const SNAPSHOT_DIR = path.join(__dirname, '../../../showcase/images');
    const TIMEOUT = 5000; // 5 second timeout for screen capture

    beforeEach(() => {
        outputBuffer = '';
        lastScreenContent = '';
    });

    afterEach(async () => {
        if (gameProcess) {
            gameProcess.kill('SIGTERM');
            await sleep(100); // Give process time to clean up
            gameProcess = null;
        }
    });

    /**
     * Starts the game process and sets up output capture
     */
    const startGame = () => {
        return new Promise((resolve, reject) => {
            gameProcess = spawn('node', ['src/app.js'], {
                cwd: path.join(__dirname, '../../../'),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            gameProcess.stdout.on('data', (data) => {
                outputBuffer += data.toString();
            });

            gameProcess.stderr.on('data', (data) => {
                console.error('Game stderr:', data.toString());
            });

            gameProcess.on('error', reject);

            // Wait for initial splash screen
            setTimeout(() => resolve(), 2000);
        });
    };

    /**
     * Sends input to the game process
     */
    const sendInput = async (input) => {
        if (gameProcess && gameProcess.stdin.writable) {
            gameProcess.stdin.write(input);
            await sleep(500); // Wait for game to process input
        }
    };

    /**
     * Waits for screen content to stabilize and captures it
     */
    const captureScreen = async (screenName) => {
        // Wait for content to stabilize
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const currentContent = extractCurrentScreen(outputBuffer);
            
            if (currentContent === lastScreenContent && currentContent.trim()) {
                // Screen has stabilized
                const cleanedContent = cleanScreenCapture(currentContent);
                await saveSnapshot(screenName, cleanedContent);
                return cleanedContent;
            }

            lastScreenContent = currentContent;
            await sleep(300);
            attempts++;
        }

        throw new Error(`Screen ${screenName} did not stabilize within timeout`);
    };

    /**
     * Extracts the current screen content from terminal output
     */
    const extractCurrentScreen = (output) => {
        // Look for the last complete screen render
        // Terminal apps often use clear screen sequences
        const lines = output.split('\n');
        
        // Find the last clear screen or significant UI element
        let lastScreenStart = 0;
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            // Look for UI boundaries or clear indicators
            if (line.includes('════') || line.includes('████') || line.includes('HORSE RACING TEXT GAME')) {
                // Found a likely screen boundary, capture from here
                const screenLines = lines.slice(Math.max(0, i - 10), i + 20);
                return screenLines.join('\n');
            }
        }

        // Fallback: take the last 30 lines
        return lines.slice(-30).join('\n');
    };

    /**
     * Cleans captured screen content to focus on the target screen only
     */
    const cleanScreenCapture = (content) => {
        let lines = content.split('\n');
        
        // Remove command line echoes and system messages
        lines = lines.filter(line => {
            const cleanLine = line.trim();
            return !cleanLine.startsWith('>') &&
                   !cleanLine.startsWith('npm') &&
                   !cleanLine.startsWith('node') &&
                   !cleanLine.includes('Horse Racing Text Game - Starting...') &&
                   !cleanLine.includes('Use number keys');
        });

        // Find the actual screen content boundaries
        let startIndex = 0;
        let endIndex = lines.length - 1;

        // Find start of actual screen content
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('████') || line.includes('═══') || 
                line.includes('HORSE RACING') || line.includes('🏇')) {
                startIndex = i;
                break;
            }
        }

        // Find end of screen content (before input prompts or loading indicators)
        for (let i = lines.length - 1; i >= startIndex; i--) {
            const line = lines[i].trim();
            if (line && !line.match(/^[⠋⠙⠸⠴⠦⠇]$/) && !line.includes('Enter your choice')) {
                endIndex = i;
                break;
            }
        }

        const screenContent = lines.slice(startIndex, endIndex + 1);
        return screenContent.join('\n').trim();
    };

    /**
     * Saves a text snapshot to file
     */
    const saveSnapshot = async (screenName, content) => {
        await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
        const filePath = path.join(SNAPSHOT_DIR, `${screenName}.txt`);
        await fs.writeFile(filePath, content, 'utf8');
    };

    test('captures splash screen only', async () => {
        await startGame();
        
        // Wait for splash screen to render completely
        await sleep(1000);
        
        const splashContent = await captureScreen('01-splash-screen');
        
        // Verify it contains splash elements but not main menu
        expect(splashContent).toContain('🏇 HORSE RACING TEXT GAME');
        expect(splashContent).toContain('████████████');
        expect(splashContent).toContain('WELCOME TO THE STABLES');
        expect(splashContent).not.toContain('New Career'); // Should not include main menu
    });

    test('captures main menu screen', async () => {
        await startGame();
        await sleep(2000); // Wait for splash to complete and menu to appear
        
        const menuContent = await captureScreen('02-main-menu');
        
        // Verify main menu content
        expect(menuContent).toContain('MAIN MENU');
        expect(menuContent).toContain('New Career');
        expect(menuContent).toContain('Tutorial');
        expect(menuContent).toContain('Load Game');
        expect(menuContent).toContain('Help');
        expect(menuContent).toContain('Enter your choice (1-4)');
    });

    test('captures character creation screen', async () => {
        await startGame();
        await sleep(2000);
        
        // Navigate to character creation
        await sendInput('1'); // New Career
        await sleep(1000);
        
        const creationContent = await captureScreen('03-character-creation');
        
        // Verify character creation content
        expect(creationContent).toMatch(/horse.*name/i);
    });

    test('captures training interface', async () => {
        await startGame();
        await sleep(2000);
        
        // Navigate through to training
        await sendInput('1'); // New Career
        await sleep(1000);
        await sendInput('TestHorse\n'); // Horse name
        await sleep(1000);
        
        const trainingContent = await captureScreen('04-training-interface');
        
        // Verify training interface content
        expect(trainingContent).toMatch(/training|stats|speed|stamina|power/i);
    });

    test('captures race results screen', async () => {
        // This test would simulate getting to a race and capturing results
        // Implementation depends on game flow
        await startGame();
        // ... navigate to race results
        // const raceContent = await captureScreen('05-race-results');
    });

    test('captures career completion screen', async () => {
        // This test would simulate completing a career
        // Implementation depends on game flow  
        await startGame();
        // ... navigate to career completion
        // const careerContent = await captureScreen('06-career-completion');
    });
});