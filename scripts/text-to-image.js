#!/usr/bin/env node

/**
 * Convert Text Screenshots to Images
 * 
 * Converts terminal text captures into PNG images that can be shared on social media.
 * Uses Canvas API to render terminal-style text with proper formatting.
 */

const fs = require('fs').promises;
const path = require('path');
const { createCanvas } = require('canvas');

// Terminal color scheme (can be customized)
const TERMINAL_THEME = {
    background: '#1e1e1e',  // Dark terminal background
    foreground: '#d4d4d4',  // Light gray text
    green: '#4ec9b0',       // Cyan-green for headers
    yellow: '#dcdcaa',      // Yellow for highlights
    blue: '#569cd6',        // Blue for prompts
    red: '#f44747',         // Red for alerts
    white: '#ffffff',       // Pure white
    gray: '#808080',        // Gray for borders
    
    // Special colors
    emoji: '#ffb86c',       // Orange tint for emojis
    progressFull: '#50fa7b',  // Green for progress bars
    progressEmpty: '#44475a'  // Dark gray for empty progress
};

// Font settings
const FONT_SETTINGS = {
    family: 'Menlo, Monaco, "Courier New", monospace',
    size: 14,
    lineHeight: 20,
    charWidth: 8.4  // Approximate width of monospace character
};

/**
 * Parse text content and identify special elements
 */
function parseTextContent(text) {
    const lines = text.split('\n');
    const parsed = [];
    
    for (const line of lines) {
        let parsedLine = {
            text: line,
            style: 'normal'
        };
        
        // Identify special line types
        if (line.includes('████')) {
            parsedLine.style = 'border';
        } else if (line.includes('═══')) {
            parsedLine.style = 'divider';
        } else if (line.includes('🏇') || line.includes('🐎') || line.includes('🏁') || line.includes('🏆')) {
            parsedLine.style = 'header';
        } else if (line.includes('Enter') && line.includes('choice')) {
            parsedLine.style = 'prompt';
        } else if (line.match(/^\d\./)) {
            parsedLine.style = 'menu';
        } else if (line.includes('░') || line.includes('█')) {
            parsedLine.style = 'progress';
        }
        
        parsed.push(parsedLine);
    }
    
    return parsed;
}

/**
 * Render text to canvas with terminal styling
 */
function renderToCanvas(text, filename) {
    const lines = text.split('\n');
    
    // Calculate canvas dimensions
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const canvasWidth = Math.max(800, (maxLineLength * FONT_SETTINGS.charWidth) + 40);
    const canvasHeight = (lines.length * FONT_SETTINGS.lineHeight) + 40;
    
    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = TERMINAL_THEME.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Set font
    ctx.font = `${FONT_SETTINGS.size}px ${FONT_SETTINGS.family}`;
    ctx.textBaseline = 'middle';
    
    // Parse content for styling
    const parsedLines = parseTextContent(text);
    
    // Render each line
    let y = 30;
    for (const lineData of parsedLines) {
        const { text: line, style } = lineData;
        
        // Set color based on style
        switch (style) {
            case 'border':
                ctx.fillStyle = TERMINAL_THEME.blue;
                break;
            case 'divider':
                ctx.fillStyle = TERMINAL_THEME.gray;
                break;
            case 'header':
                ctx.fillStyle = TERMINAL_THEME.green;
                break;
            case 'prompt':
                ctx.fillStyle = TERMINAL_THEME.yellow;
                break;
            case 'menu':
                ctx.fillStyle = TERMINAL_THEME.white;
                break;
            case 'progress':
                // Special handling for progress bars
                renderProgressBar(ctx, line, 20, y);
                y += FONT_SETTINGS.lineHeight;
                continue;
            default:
                ctx.fillStyle = TERMINAL_THEME.foreground;
        }
        
        // Render text with emoji support
        renderTextWithEmojis(ctx, line, 20, y);
        y += FONT_SETTINGS.lineHeight;
    }
    
    // Add terminal window decoration (optional)
    if (filename.includes('splash') || filename.includes('main-menu')) {
        addTerminalDecoration(ctx, canvasWidth, canvasHeight);
    }
    
    return canvas;
}

/**
 * Render text with proper emoji handling
 */
function renderTextWithEmojis(ctx, text, x, y) {
    // Save current fill style
    const originalFill = ctx.fillStyle;
    
    // Simple rendering - emojis are handled by the font
    ctx.fillText(text, x, y);
    
    // Restore fill style
    ctx.fillStyle = originalFill;
}

/**
 * Render progress bars with colors
 */
function renderProgressBar(ctx, line, x, y) {
    let currentX = x;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '█') {
            ctx.fillStyle = TERMINAL_THEME.progressFull;
        } else if (char === '░') {
            ctx.fillStyle = TERMINAL_THEME.progressEmpty;
        } else {
            ctx.fillStyle = TERMINAL_THEME.foreground;
        }
        
        ctx.fillText(char, currentX, y);
        currentX += FONT_SETTINGS.charWidth;
    }
}

/**
 * Add terminal window decoration
 */
function addTerminalDecoration(ctx, width, height) {
    // Add subtle terminal frame
    ctx.strokeStyle = TERMINAL_THEME.gray;
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    // Add terminal "title bar" effect
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(5, 5, width - 10, 25);
    
    // Add window controls (red, yellow, green dots)
    const controls = [
        { color: '#ff5f56', x: 20 },  // Red
        { color: '#ffbd2e', x: 40 },  // Yellow
        { color: '#27c93f', x: 60 }   // Green
    ];
    
    for (const control of controls) {
        ctx.fillStyle = control.color;
        ctx.beginPath();
        ctx.arc(control.x, 17, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add terminal title
    ctx.fillStyle = TERMINAL_THEME.foreground;
    ctx.font = `12px ${FONT_SETTINGS.family}`;
    ctx.fillText('Horse Racing Text Game', width / 2 - 60, 17);
}

/**
 * Convert text file to PNG image
 */
async function convertTextToImage(inputFile, outputFile) {
    try {
        // Read text content
        const content = await fs.readFile(inputFile, 'utf8');
        
        // Render to canvas
        const canvas = renderToCanvas(content, path.basename(inputFile));
        
        // Save as PNG
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputFile, buffer);
        
        console.log(`✓ Converted ${path.basename(inputFile)} to ${path.basename(outputFile)}`);
        
        return true;
    } catch (error) {
        console.error(`✗ Failed to convert ${path.basename(inputFile)}: ${error.message}`);
        return false;
    }
}

/**
 * Main conversion function
 */
async function convertAllScreenshots() {
    const CAPTURE_DIR = path.join(__dirname, '../showcase/images');
    
    console.log('🎨 Converting text screenshots to images...\n');
    console.log('⚠️  Note: This requires the "canvas" npm package.');
    console.log('   Run: npm install canvas\n');
    
    // Check if canvas is available
    try {
        require('canvas');
    } catch (error) {
        console.error('❌ Canvas package not installed!');
        console.error('   Please run: npm install canvas');
        console.error('   Then try again.');
        process.exit(1);
    }
    
    // Get all .txt files
    const files = await fs.readdir(CAPTURE_DIR);
    const textFiles = files.filter(f => f.endsWith('.txt'));
    
    console.log(`Found ${textFiles.length} text files to convert.\n`);
    
    // Convert each file
    for (const textFile of textFiles) {
        const inputPath = path.join(CAPTURE_DIR, textFile);
        const outputPath = path.join(CAPTURE_DIR, textFile.replace('.txt', '.png'));
        
        await convertTextToImage(inputPath, outputPath);
    }
    
    console.log('\n✅ All text screenshots converted to PNG images!');
    console.log('📁 Images ready for social media sharing');
}

// Run if called directly
if (require.main === module) {
    convertAllScreenshots().catch(console.error);
}

module.exports = { convertTextToImage, convertAllScreenshots };