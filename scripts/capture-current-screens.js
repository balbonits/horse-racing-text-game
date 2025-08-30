#!/usr/bin/env node

/**
 * Capture Current/Correct Game Screens
 * 
 * Creates clean, isolated text snapshots of each game screen state.
 * Uses the fixed SplashScreen (no bleeding) to capture proper UI states.
 */

const { spawn } = require('child_process');
const { setTimeout: sleep } = require('timers/promises');
const fs = require('fs').promises;
const path = require('path');

const CAPTURE_DIR = path.join(__dirname, '../showcase/images');
const GAME_PATH = path.join(__dirname, '../src/app.js');

/**
 * Capture a specific screen state with proper isolation
 */
async function captureIsolatedScreen(screenName, sequence, description) {
    const outputFile = path.join(CAPTURE_DIR, `${screenName}.txt`);
    
    console.log(`📸 Capturing ${description}...`);
    
    return new Promise((resolve, reject) => {
        let output = '';
        
        // Start game process
        const gameProcess = spawn('node', [GAME_PATH], {
            cwd: path.join(__dirname, '../'),
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Collect stdout
        gameProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        gameProcess.stderr.on('data', (data) => {
            console.error(`Error in ${screenName}:`, data.toString());
        });

        gameProcess.on('error', reject);

        // Send input sequence
        setTimeout(async () => {
            for (const input of sequence) {
                if (input.delay) {
                    await sleep(input.delay);
                }
                if (input.keys) {
                    gameProcess.stdin.write(input.keys);
                }
                if (input.waitFor) {
                    await sleep(input.waitFor);
                }
            }
            
            // Give final screen time to render then terminate
            await sleep(1000);
            gameProcess.kill('SIGTERM');
        }, 500);

        gameProcess.on('close', async (code) => {
            try {
                // Extract the final clean screen state
                const cleanContent = extractFinalScreen(output, screenName);
                await fs.writeFile(outputFile, cleanContent, 'utf8');
                
                console.log(`✓ ${description} captured: ${outputFile}`);
                resolve(cleanContent);
            } catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * Extract the final clean screen from terminal output
 */
function extractFinalScreen(output, screenName) {
    const lines = output.split('\n');
    
    // Remove system messages and command echoes
    const filteredLines = lines.filter(line => {
        const clean = line.trim();
        return !clean.startsWith('Horse Racing Text Game - Starting') &&
               !clean.startsWith('Use number keys') &&
               !clean.startsWith('Starting Horse Racing') &&
               clean !== '';
    });

    switch (screenName) {
        case '01-splash-screen':
            return extractPureSplash(filteredLines);
        case '02-main-menu':
            return extractPureMainMenu(filteredLines);
        case '03-character-creation':
            return extractCharacterCreation(filteredLines);
        case '04-training-interface':
            return extractTrainingInterface(filteredLines);
        default:
            return filteredLines.join('\n').trim();
    }
}

/**
 * Extract only splash screen elements
 */
function extractPureSplash(lines) {
    let startIndex = -1;
    let endIndex = -1;
    
    // Find splash boundaries
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Start: ASCII border
        if (startIndex === -1 && line.includes('████████████████████████████████████████████████████████████████████████')) {
            startIndex = i;
        }
        
        // End: After welcome message, before any other content
        if (startIndex !== -1 && 
            (line.includes('═══════════════════════════════════════════════════════════════════') ||
             line.includes('Train Champions • Race for Glory • Build Your Legacy'))) {
            // Include a few more lines to get complete welcome section
            endIndex = Math.min(i + 3, lines.length);
            
            // But stop if we hit main menu content
            for (let j = i + 1; j <= endIndex && j < lines.length; j++) {
                if (lines[j].includes('New Career') || lines[j].includes('MAIN MENU')) {
                    endIndex = j;
                    break;
                }
            }
            break;
        }
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
        return lines.slice(startIndex, endIndex).join('\n').trim();
    }
    
    return lines.join('\n').trim();
}

/**
 * Extract only main menu elements
 */
function extractPureMainMenu(lines) {
    let startIndex = -1;
    let endIndex = lines.length;
    
    // Find menu start
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('MAIN MENU') || 
            (line.includes('HORSE RACING TEXT GAME') && !line.includes('🏇'))) {
            startIndex = i - 1; // Include header line
            break;
        }
    }
    
    // Find menu end
    for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Enter your choice') || line.includes('Q to quit')) {
            endIndex = i + 1;
            break;
        }
    }
    
    if (startIndex !== -1) {
        return lines.slice(Math.max(0, startIndex), endIndex).join('\n').trim();
    }
    
    return lines.join('\n').trim();
}

/**
 * Extract character creation screen
 */
function extractCharacterCreation(lines) {
    return lines.filter(line => 
        line.includes('horse') || 
        line.includes('name') ||
        line.includes('Enter') ||
        line.includes('Create') ||
        line.includes('Training') ||
        line.trim().length > 0
    ).join('\n').trim();
}

/**
 * Extract training interface
 */
function extractTrainingInterface(lines) {
    return lines.filter(line => {
        const clean = line.toLowerCase();
        return clean.includes('training') ||
               clean.includes('stats') ||
               clean.includes('speed') ||
               clean.includes('stamina') ||
               clean.includes('power') ||
               clean.includes('energy') ||
               clean.includes('turn') ||
               line.trim().length > 0;
    }).join('\n').trim();
}

/**
 * Main capture function
 */
async function captureAllCurrentScreens() {
    try {
        await fs.mkdir(CAPTURE_DIR, { recursive: true });
        console.log('🎬 Starting screen capture with fixed UI isolation...\n');

        // 1. Capture pure splash screen (should now be isolated due to our fix)
        await captureIsolatedScreen('01-splash-screen', [
            { delay: 100 },  // Let splash load
            { waitFor: 2500 } // Wait for splash to complete (should clear properly now)
        ], 'Pure Splash Screen');

        await sleep(500);

        // 2. Capture main menu (after splash clears)
        await captureIsolatedScreen('02-main-menu', [
            { delay: 100 },   // Let splash load
            { waitFor: 3000 } // Wait for splash to clear and menu to show
        ], 'Main Menu');

        await sleep(500);

        // 3. Capture character creation
        await captureIsolatedScreen('03-character-creation', [
            { delay: 100 },
            { waitFor: 3000 }, // Wait for menu
            { keys: '1', waitFor: 1000 } // Select "New Career"
        ], 'Character Creation');

        await sleep(500);

        // 4. Capture training interface
        await captureIsolatedScreen('04-training-interface', [
            { delay: 100 },
            { waitFor: 3000 }, // Wait for menu
            { keys: '1', waitFor: 1000 }, // New Career
            { keys: 'TestHorse\n', waitFor: 2000 } // Create character
        ], 'Training Interface');

        console.log('\n✅ All current screen captures completed successfully!');
        console.log('📁 Files created in:', CAPTURE_DIR);

    } catch (error) {
        console.error('❌ Screen capture failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    captureAllCurrentScreens();
}

module.exports = { captureAllCurrentScreens, captureIsolatedScreen };