#!/usr/bin/env node

/**
 * Extract Pure Splash Screen from Mixed Output
 * 
 * Processes the clean_splash.txt file to extract only the splash screen
 * portion, removing the main menu that appears after it.
 */

const fs = require('fs').promises;
const path = require('path');

async function extractSplashOnly() {
    const inputFile = path.join(__dirname, '../showcase/images/clean_splash.txt');
    const outputFile = path.join(__dirname, '../showcase/images/01-splash-screen-pure.txt');
    
    try {
        console.log('Reading mixed splash + menu output...');
        const content = await fs.readFile(inputFile, 'utf8');
        const lines = content.split('\n');
        
        let splashStartIndex = -1;
        let splashEndIndex = -1;
        
        // Find the start of the actual splash screen (first ASCII border)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('████████████████████████████████████████████████████████████████████████')) {
                splashStartIndex = i;
                console.log(`Found splash start at line ${i}`);
                break;
            }
        }
        
        // Find the end of the splash screen (last part of welcome message)
        for (let i = splashStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('🐎 Preparing the track...')) {
                splashEndIndex = i + 1; // Include the "Preparing" line
                console.log(`Found splash end at line ${i}`);
                break;
            }
        }
        
        if (splashStartIndex !== -1 && splashEndIndex !== -1) {
            // Extract only the splash screen portion
            const splashLines = lines.slice(splashStartIndex, splashEndIndex);
            
            // Clean up any control sequences and normalize
            const cleanedLines = splashLines.map(line => 
                line.replace(/\[1A\[2K/g, '')    // Remove cursor movement
                   .replace(/\[1;1H\[0J/g, '')   // Remove screen clear
                   .replace(/\[1G\[0K/g, '')     // Remove line clear
            );
            
            const pureContent = cleanedLines.join('\n').trim();
            
            await fs.writeFile(outputFile, pureContent, 'utf8');
            console.log(`✓ Pure splash screen extracted to: ${outputFile}`);
            console.log(`Lines extracted: ${splashLines.length}`);
            
            // Show first few lines as preview
            console.log('\nPreview of extracted content:');
            console.log('='.repeat(50));
            console.log(cleanedLines.slice(0, 8).join('\n'));
            console.log('='.repeat(50));
            
        } else {
            console.error('Could not find splash screen boundaries');
            console.log(`Splash start: ${splashStartIndex}, end: ${splashEndIndex}`);
        }
        
    } catch (error) {
        console.error('Error extracting splash screen:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    extractSplashOnly();
}

module.exports = { extractSplashOnly };