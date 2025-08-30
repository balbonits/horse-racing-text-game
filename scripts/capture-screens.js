#!/usr/bin/env node

/**
 * Screen Capture Script for Horse Racing Game
 * 
 * Uses script command to capture clean terminal outputs for each game screen.
 * Each capture focuses on a single screen state without transitions.
 */

const { spawn } = require('child_process');
const { setTimeout: sleep } = require('timers/promises');
const fs = require('fs').promises;
const path = require('path');

const CAPTURE_DIR = path.join(__dirname, '../showcase/images');
const GAME_PATH = path.join(__dirname, '../src/app.js');

/**
 * Captures a single screen using script command with specific inputs
 */
async function captureScreen(screenName, inputs, captureDelay = 2000) {
    const outputFile = path.join(CAPTURE_DIR, `${screenName}.txt`);
    
    console.log(`Capturing ${screenName}...`);
    
    return new Promise((resolve, reject) => {
        // Build input sequence
        const inputSequence = inputs.join('\n') + '\n';
        
        // Use script command to capture terminal output - macOS compatible
        const scriptProcess = spawn('script', [
            '-q', outputFile,  // Quiet mode, output to file
            'bash', '-c', 
            `echo "${inputSequence}" | gtimeout 10s node ${GAME_PATH} || echo "${inputSequence}" | node ${GAME_PATH}`
        ], {
            stdio: 'inherit'
        });

        scriptProcess.on('close', async (code) => {
            try {
                // Clean up the captured output
                const rawOutput = await fs.readFile(outputFile, 'utf8');
                const cleanedOutput = cleanTerminalOutput(rawOutput, screenName);
                await fs.writeFile(outputFile, cleanedOutput, 'utf8');
                
                console.log(`✓ Captured ${screenName}`);
                resolve(cleanedOutput);
            } catch (error) {
                reject(error);
            }
        });

        scriptProcess.on('error', reject);
    });
}

/**
 * Cleans terminal output to focus on specific screen content
 */
function cleanTerminalOutput(output, screenName) {
    let lines = output.split('\n');
    
    // Remove command echoes and system messages
    lines = lines.filter(line => {
        const clean = line.trim();
        return !clean.startsWith('echo') &&
               !clean.startsWith('> horse-racing-text-game@') &&
               !clean.startsWith('> node') &&
               !clean.match(/^Script (started|done)/) &&
               clean !== '^D';
    });

    // Screen-specific cleaning
    switch (screenName) {
        case '01-splash-screen':
            return extractSplashScreen(lines);
        case '02-main-menu':
            return extractMainMenu(lines);
        case '03-character-creation':
            return extractCharacterCreation(lines);
        case '04-training-interface':
            return extractTrainingInterface(lines);
        default:
            return lines.join('\n').trim();
    }
}

/**
 * Extract only the splash screen with ASCII art
 */
function extractSplashScreen(lines) {
    let startIndex = -1;
    let endIndex = -1;
    
    // Find the splash screen boundaries
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Start: Find the first ASCII border
        if (startIndex === -1 && line.includes('████████████████████████████████████████████████████████████████████████')) {
            startIndex = i;
        }
        
        // End: Find the end of the welcome message
        if (startIndex !== -1 && line.includes('═══════════════════════════════════════════════════════════════════') && 
            i > startIndex + 5) {
            endIndex = i + 1;
            break;
        }
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
        return lines.slice(startIndex, endIndex).join('\n').trim();
    }
    
    // Fallback: try to find any splash content
    const splashLines = lines.filter(line => 
        line.includes('████') || 
        line.includes('🏇') || 
        line.includes('WELCOME TO THE STABLES') ||
        line.includes('Train Champions') ||
        line.includes('#&&&&&') ||
        line.includes('═══════════════════════════════════════════════════════════════════')
    );
    
    return splashLines.join('\n').trim();
}

/**
 * Extract main menu screen
 */
function extractMainMenu(lines) {
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (startIndex === -1 && line.includes('MAIN MENU')) {
            startIndex = Math.max(0, i - 2); // Include header
        }
        
        if (startIndex !== -1 && (line.includes('Enter your choice') || line.includes('Q to quit'))) {
            endIndex = i + 1;
            break;
        }
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
        return lines.slice(startIndex, endIndex).join('\n').trim();
    }
    
    return lines.join('\n').trim();
}

/**
 * Extract character creation screen
 */
function extractCharacterCreation(lines) {
    // Find character creation specific content
    const relevantLines = lines.filter(line => {
        const clean = line.trim();
        return clean.includes('horse') || 
               clean.includes('name') || 
               clean.includes('Enter') ||
               clean.includes('Create') ||
               clean.includes('Training') ||
               clean.includes('Stats');
    });
    
    return relevantLines.join('\n').trim();
}

/**
 * Extract training interface screen
 */
function extractTrainingInterface(lines) {
    // Find training interface content
    const relevantLines = lines.filter(line => {
        const clean = line.trim().toLowerCase();
        return clean.includes('training') || 
               clean.includes('stats') || 
               clean.includes('speed') ||
               clean.includes('stamina') ||
               clean.includes('power') ||
               clean.includes('energy') ||
               clean.includes('turn');
    });
    
    return relevantLines.join('\n').trim();
}

/**
 * Main capture function
 */
async function captureAllScreens() {
    try {
        // Ensure capture directory exists
        await fs.mkdir(CAPTURE_DIR, { recursive: true });
        
        console.log('Starting screen captures...\n');

        // Capture splash screen only (no inputs, let it show and timeout)
        await captureScreen('01-splash-screen', [], 3000);
        await sleep(1000);

        // Capture main menu (wait for splash to finish)  
        await captureScreen('02-main-menu', [''], 2000);
        await sleep(1000);

        // Capture character creation (navigate to new career)
        await captureScreen('03-character-creation', ['1'], 3000);
        await sleep(1000);

        // Capture training interface (create character and enter training)
        await captureScreen('04-training-interface', ['1', 'TestHorse'], 4000);
        await sleep(1000);

        console.log('\n✅ All screen captures completed!');
        
    } catch (error) {
        console.error('❌ Screen capture failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    captureAllScreens();
}

module.exports = { captureScreen, captureAllScreens };