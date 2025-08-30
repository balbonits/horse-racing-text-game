#!/usr/bin/env node

/**
 * Extract Pure Main Menu from Mixed Output
 * 
 * Processes the clean_splash.txt file to extract only the main menu
 * portion, removing the splash screen that appears before it.
 */

const fs = require('fs').promises;
const path = require('path');

async function extractMainMenuOnly() {
    const inputFile = path.join(__dirname, '../showcase/images/clean_splash.txt');
    const outputFile = path.join(__dirname, '../showcase/images/02-main-menu-pure.txt');
    
    try {
        console.log('Reading mixed splash + menu output...');
        const content = await fs.readFile(inputFile, 'utf8');
        const lines = content.split('\n');
        
        let menuStartIndex = -1;
        let menuEndIndex = lines.length - 1; // Default to end of file
        
        // Find the start of the main menu (after preparing track message)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('HORSE RACING TEXT GAME') && 
                !line.includes('🏇') && // Not the splash title
                lines[i + 1] && lines[i + 1].includes('====')) {
                menuStartIndex = i;
                console.log(`Found menu start at line ${i}: "${line}"`);
                break;
            }
        }
        
        // Find the end of the main menu (look for input prompt or empty lines)
        for (let i = menuStartIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('Enter your choice') || 
                line.includes('Q to quit') ||
                (line === '' && lines[i+1] && lines[i+1].trim() === '')) {
                menuEndIndex = i + 1;
                console.log(`Found menu end at line ${i}`);
                break;
            }
        }
        
        if (menuStartIndex !== -1) {
            // Extract only the main menu portion
            const menuLines = lines.slice(menuStartIndex, menuEndIndex);
            
            // Clean up any control sequences
            const cleanedLines = menuLines.map(line => 
                line.replace(/\[1A\[2K/g, '')    // Remove cursor movement
                   .replace(/\[1;1H\[0J/g, '')   // Remove screen clear
                   .replace(/\[1G\[0K/g, '')     // Remove line clear
            ).filter(line => line.trim() !== '' || line === ''); // Keep structure but remove extra empty lines
            
            const pureContent = cleanedLines.join('\n').trim();
            
            await fs.writeFile(outputFile, pureContent, 'utf8');
            console.log(`✓ Pure main menu extracted to: ${outputFile}`);
            console.log(`Lines extracted: ${menuLines.length}`);
            
            // Show content as preview
            console.log('\nExtracted main menu content:');
            console.log('='.repeat(50));
            console.log(pureContent);
            console.log('='.repeat(50));
            
        } else {
            console.error('Could not find main menu start');
        }
        
    } catch (error) {
        console.error('Error extracting main menu:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    extractMainMenuOnly();
}

module.exports = { extractMainMenuOnly };