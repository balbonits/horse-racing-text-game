#!/usr/bin/env node

/**
 * Create Social Media Ready Images
 * 
 * Creates polished, branded images from text screenshots that are perfect for LinkedIn.
 * Includes branding, proper dimensions, and enhanced visual appeal.
 */

const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Social media dimensions (LinkedIn optimal)
const SOCIAL_DIMENSIONS = {
    width: 1200,
    height: 675  // 16:9 aspect ratio
};

// Enhanced color scheme for social media
const BRAND_COLORS = {
    primary: '#1a1a1a',      // Dark background
    secondary: '#f8f8f8',    // Light text
    accent: '#4caf50',       // Green for highlights
    brand: '#ff6b35',        // Orange brand color
    success: '#2e7d32',      // Green for success
    warning: '#f57c00',      // Orange for warnings
    error: '#d32f2f',        // Red for errors
    
    // Terminal colors
    terminal: {
        bg: '#0d1117',
        text: '#c9d1d9',
        green: '#7c3aed',
        blue: '#58a6ff',
        yellow: '#f7df1e',
        red: '#ff6b6b'
    }
};

// Typography
const FONTS = {
    title: { family: 'Arial, sans-serif', size: 32, weight: 'bold' },
    subtitle: { family: 'Arial, sans-serif', size: 18, weight: 'normal' },
    terminal: { family: '"Courier New", monospace', size: 13, weight: 'normal' },
    caption: { family: 'Arial, sans-serif', size: 14, weight: 'normal' }
};

/**
 * Create branded social media image
 */
async function createSocialImage(textFile, title, description) {
    const canvas = createCanvas(SOCIAL_DIMENSIONS.width, SOCIAL_DIMENSIONS.height);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, SOCIAL_DIMENSIONS.height);
    gradient.addColorStop(0, BRAND_COLORS.primary);
    gradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SOCIAL_DIMENSIONS.width, SOCIAL_DIMENSIONS.height);
    
    // Read text content
    const content = await fs.readFile(textFile, 'utf8');
    const lines = content.split('\n').slice(0, 20); // Limit to prevent overflow
    
    // Terminal window area
    const terminalArea = {
        x: 40,
        y: 120,
        width: SOCIAL_DIMENSIONS.width - 80,
        height: 420
    };
    
    // Draw terminal window
    drawTerminalWindow(ctx, terminalArea, lines);
    
    // Header section
    drawHeader(ctx, title, description);
    
    // Footer branding
    drawFooter(ctx);
    
    return canvas;
}

/**
 * Draw terminal window with content
 */
function drawTerminalWindow(ctx, area, lines) {
    // Terminal background
    ctx.fillStyle = BRAND_COLORS.terminal.bg;
    drawRoundedRect(ctx, area.x, area.y, area.width, area.height, 8);
    ctx.fill();
    
    // Terminal title bar
    ctx.fillStyle = '#21262d';
    drawRoundedRect(ctx, area.x, area.y, area.width, 35, [8, 8, 0, 0]);
    ctx.fill();
    
    // Window controls
    const controls = [
        { color: '#ff5f57', x: area.x + 15 },
        { color: '#ffbd2e', x: area.x + 35 },
        { color: '#28ca42', x: area.x + 55 }
    ];
    
    for (const control of controls) {
        ctx.fillStyle = control.color;
        ctx.beginPath();
        ctx.arc(control.x, area.y + 17, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Terminal title
    ctx.fillStyle = BRAND_COLORS.terminal.text;
    ctx.font = '12px Arial';
    ctx.fillText('🐎 Horse Racing Text Game', area.x + 85, area.y + 22);
    
    // Terminal content
    ctx.font = `${FONTS.terminal.size}px ${FONTS.terminal.family}`;
    ctx.fillStyle = BRAND_COLORS.terminal.text;
    
    let y = area.y + 60;
    const lineHeight = 16;
    const maxWidth = area.width - 40;
    
    for (let i = 0; i < Math.min(lines.length, 24); i++) {
        const line = lines[i];
        if (!line.trim()) {
            y += lineHeight;
            continue;
        }
        
        // Style different line types
        if (line.includes('🏇') || line.includes('🐎') || line.includes('🏁')) {
            ctx.fillStyle = BRAND_COLORS.terminal.green;
        } else if (line.includes('═══') || line.includes('████')) {
            ctx.fillStyle = BRAND_COLORS.terminal.blue;
        } else if (line.match(/^\d\./)) {
            ctx.fillStyle = BRAND_COLORS.terminal.yellow;
        } else if (line.includes('█') || line.includes('░')) {
            // Progress bar - special handling
            renderProgressLine(ctx, line, area.x + 20, y, maxWidth);
            y += lineHeight;
            continue;
        } else {
            ctx.fillStyle = BRAND_COLORS.terminal.text;
        }
        
        // Truncate long lines
        let displayLine = line.length > 90 ? line.substring(0, 87) + '...' : line;
        ctx.fillText(displayLine, area.x + 20, y);
        y += lineHeight;
        
        if (y > area.y + area.height - 30) break;
    }
}

/**
 * Render progress bar line with colors
 */
function renderProgressLine(ctx, line, x, y, maxWidth) {
    let currentX = x;
    const charWidth = 7.2;
    
    for (let i = 0; i < Math.min(line.length, Math.floor(maxWidth / charWidth)); i++) {
        const char = line[i];
        
        if (char === '█') {
            ctx.fillStyle = BRAND_COLORS.success;
        } else if (char === '░') {
            ctx.fillStyle = '#444';
        } else {
            ctx.fillStyle = BRAND_COLORS.terminal.text;
        }
        
        ctx.fillText(char, currentX, y);
        currentX += charWidth;
    }
}

/**
 * Draw header with title and description
 */
function drawHeader(ctx, title, description) {
    // Title
    ctx.fillStyle = BRAND_COLORS.secondary;
    ctx.font = `bold ${FONTS.title.size}px ${FONTS.title.family}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, SOCIAL_DIMENSIONS.width / 2, 60);
    
    // Description
    if (description) {
        ctx.fillStyle = BRAND_COLORS.accent;
        ctx.font = `${FONTS.subtitle.size}px ${FONTS.subtitle.family}`;
        ctx.fillText(description, SOCIAL_DIMENSIONS.width / 2, 90);
    }
    
    ctx.textAlign = 'left'; // Reset alignment
}

/**
 * Draw footer with branding
 */
function drawFooter(ctx) {
    const y = SOCIAL_DIMENSIONS.height - 40;
    
    // Project info
    ctx.fillStyle = BRAND_COLORS.secondary;
    ctx.font = `${FONTS.caption.size}px ${FONTS.caption.family}`;
    ctx.fillText('🎮 Horse Racing Text Game v1.0 - Terminal-Based Racing Simulation', 40, y);
    
    // Tech stack
    ctx.fillStyle = BRAND_COLORS.accent;
    ctx.font = `12px ${FONTS.caption.family}`;
    ctx.fillText('Built with Node.js • Blessed Terminal UI • State Machine Architecture', 40, y + 18);
}

/**
 * Draw rounded rectangle manually
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'number') {
        radius = [radius, radius, radius, radius];
    } else if (radius.length === 2) {
        radius = [radius[0], radius[1], radius[0], radius[1]];
    }
    
    ctx.beginPath();
    ctx.moveTo(x + radius[0], y);
    ctx.lineTo(x + width - radius[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
    ctx.lineTo(x + width, y + height - radius[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
    ctx.lineTo(x + radius[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
    ctx.lineTo(x, y + radius[0]);
    ctx.quadraticCurveTo(x, y, x + radius[0], y);
    ctx.closePath();
}

/**
 * Main function to create all social images
 */
async function createAllSocialImages() {
    const CAPTURE_DIR = path.join(__dirname, '../showcase/images');
    
    console.log('🎨 Creating social media ready images...\n');
    
    // Image specifications
    const imageSpecs = [
        {
            file: '01-splash-screen.txt',
            title: '🐎 Horse Racing Text Game',
            description: 'ASCII Art Terminal Welcome Screen',
            output: 'social-01-splash.png'
        },
        {
            file: '02-main-menu.txt', 
            title: '🎮 Main Menu Interface',
            description: 'Clean terminal navigation system',
            output: 'social-02-menu.png'
        },
        {
            file: '03-character-creation.txt',
            title: '🐴 Character Creation',
            description: 'Build your champion racehorse',
            output: 'social-03-creation.png'
        },
        {
            file: '04-training-interface.txt',
            title: '🏋️ Training Interface', 
            description: 'Progress tracking with visual stats',
            output: 'social-04-training.png'
        },
        {
            file: '05-race-results.txt',
            title: '🏁 Race Results',
            description: 'Victory screen with detailed analysis',
            output: 'social-05-results.png'
        },
        {
            file: '06-career-completion.txt',
            title: '🏆 Career Complete',
            description: 'Achievement system and legacy bonuses',
            output: 'social-06-completion.png'
        }
    ];
    
    // Create each social media image
    for (const spec of imageSpecs) {
        const inputPath = path.join(CAPTURE_DIR, spec.file);
        const outputPath = path.join(CAPTURE_DIR, spec.output);
        
        try {
            const canvas = await createSocialImage(inputPath, spec.title, spec.description);
            const buffer = canvas.toBuffer('image/png');
            await fs.writeFile(outputPath, buffer);
            
            console.log(`✓ Created ${spec.output} (${spec.title})`);
        } catch (error) {
            console.error(`✗ Failed to create ${spec.output}: ${error.message}`);
        }
    }
    
    console.log('\n✅ Social media images created successfully!');
    console.log('📱 Perfect for LinkedIn, Twitter, and GitHub README');
    console.log('📐 Optimized dimensions: 1200x675 (16:9 ratio)');
}

// Run if called directly
if (require.main === module) {
    createAllSocialImages().catch(console.error);
}

module.exports = { createSocialImage, createAllSocialImages };