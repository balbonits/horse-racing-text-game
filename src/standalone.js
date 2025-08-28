#!/usr/bin/env node

/**
 * Standalone Executable for Horse Racing Game v1
 * 
 * This creates a self-contained executable that can be:
 * 1. Run directly with `node standalone.js`
 * 2. Packaged into binary with `pkg` for distribution
 * 3. Installed globally via npm and run as `horse-racing-game`
 * 
 * Features:
 * - No external dependencies for end users
 * - Cross-platform support (Windows, macOS, Linux)
 * - Command line argument parsing
 * - Proper error handling and logging
 * - Graceful cleanup on exit
 */

const path = require('path');
const fs = require('fs');

// Command line argument parsing
const argv = process.argv.slice(2);
const flags = {
  help: argv.includes('--help') || argv.includes('-h'),
  version: argv.includes('--version') || argv.includes('-v'),
  debug: argv.includes('--debug') || argv.includes('-d'),
  noSplash: argv.includes('--no-splash'),
  quickStart: argv.includes('--quick-start')
};

// Version information
const VERSION = '1.0.0';
const BUILD_DATE = new Date().toISOString().split('T')[0];

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Horse Racing Text Game v${VERSION}
===============================

A terminal-based horse racing simulation game focused on training mechanics,
stat progression, and race simulation.

USAGE:
  horse-racing-game [options]

OPTIONS:
  -h, --help        Show this help message
  -v, --version     Show version information
  -d, --debug       Enable debug mode with verbose logging
  --no-splash       Skip splash screen and go directly to main menu
  --quick-start     Create a test character and jump to training

EXAMPLES:
  horse-racing-game                    # Start the game normally
  horse-racing-game --no-splash       # Skip splash screen
  horse-racing-game --quick-start     # Quick start for testing
  horse-racing-game --debug           # Enable debug logging

GAME FEATURES:
  • 24-turn careers with 4 exciting races
  • Strategic training system with energy management
  • Multiple training types: Speed, Stamina, Power, Rest, Media Day
  • Bond system with NPH (Non-Player Horses)
  • Form system affecting training effectiveness
  • Save/Load system for multiple careers
  • Career grading system (S/A/B/C/D/F)
  • Achievement system

For more information, visit: https://github.com/yourrepo/horse-racing-text-game
`);
}

/**
 * Display version information
 */
function showVersion() {
  console.log(`
Horse Racing Text Game v${VERSION}
Build Date: ${BUILD_DATE}
Node.js: ${process.version}
Platform: ${process.platform} ${process.arch}

Game Engine: Standalone
UI Adapter: Console
Architecture: Event-Driven API
`);
}

/**
 * Check system requirements
 */
function checkSystemRequirements() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 14) {
    console.error(`❌ Error: Node.js v14 or higher required. Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  // Check if terminal supports color
  const supportsColor = process.stdout.isTTY && process.env.TERM !== 'dumb';
  if (!supportsColor && !flags.debug) {
    console.warn('⚠️  Warning: Terminal may not support colors properly');
  }
  
  return { nodeVersion, supportsColor };
}

/**
 * Setup debug mode
 */
function setupDebugMode() {
  if (flags.debug) {
    console.log('🔧 Debug mode enabled');
    
    // Enhanced error handling
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', error);
      process.exit(1);
    });
    
    // Log game events
    console.log('📊 System Info:', {
      node: process.version,
      platform: `${process.platform} ${process.arch}`,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      cwd: process.cwd()
    });
  }
}

/**
 * Create quick start character for testing
 */
async function createQuickStartCharacter(adapter) {
  try {
    console.log('🚀 Quick Start: Creating test character...');
    
    // Create a test character
    const result = await adapter.engine.createCharacter('Quick Test Horse');
    
    if (result.success) {
      console.log('✅ Test character created successfully!');
      adapter.currentScreen = 'training';
      adapter.render();
    } else {
      console.error('❌ Failed to create quick start character:', result.error);
      adapter.currentScreen = 'main_menu';
      adapter.render();
    }
    
  } catch (error) {
    console.error('❌ Quick start error:', error.message);
    adapter.currentScreen = 'main_menu';
    adapter.render();
  }
}

/**
 * Main application entry point
 */
async function main() {
  try {
    // Handle command line flags
    if (flags.help) {
      showHelp();
      process.exit(0);
    }
    
    if (flags.version) {
      showVersion();
      process.exit(0);
    }
    
    // Setup debug mode
    setupDebugMode();
    
    // Check system requirements
    const systemInfo = checkSystemRequirements();
    
    if (flags.debug) {
      console.log('✅ System requirements check passed');
      console.log('🎮 Starting Horse Racing Game...');
    }
    
    // Import game systems (done here to avoid import overhead for help/version)
    const ConsoleUIAdapter = require('./adapters/ConsoleUIAdapter');
    
    // Initialize game
    const adapter = new ConsoleUIAdapter();
    
    // Initialize with options
    const initResult = await adapter.initialize();
    
    if (!initResult.success) {
      console.error(`❌ Game initialization failed: ${initResult.error}`);
      process.exit(1);
    }
    
    // Handle special startup modes
    if (flags.noSplash) {
      adapter.currentScreen = 'main_menu';
      adapter.render();
    }
    
    if (flags.quickStart) {
      await createQuickStartCharacter(adapter);
    }
    
    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Received interrupt signal...');
      await adapter.cleanup();
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Received terminate signal...');
      await adapter.cleanup();
    });
    
    if (flags.debug) {
      console.log('✅ Game initialized successfully');
      console.log('🎯 Type --help for usage information');
    }
    
    // Game loop is now handled by the ConsoleUIAdapter
    // The process will remain alive until explicitly closed
    
  } catch (error) {
    console.error('❌ Fatal error during startup:', error.message);
    
    if (flags.debug) {
      console.error('Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// Handle different execution contexts
if (require.main === module) {
  // Running as standalone executable
  main().catch(error => {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  });
} else {
  // Being required as module - export the main function
  module.exports = { main, VERSION, showHelp, showVersion };
}