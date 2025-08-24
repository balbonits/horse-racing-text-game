#!/usr/bin/env node

/**
 * Uma Musume Text-Based Clone - Main Application Entry Point
 * A terminal-based horse racing simulation game
 */

const GameApp = require('./GameApp');

function main() {
  try {
    console.log('Uma Musume Text Clone - Starting...');
    console.log('Use number keys (1-5) for options, Q to quit\n');
    
    // Create and start the game application
    const game = new GameApp();
    game.start();
    
  } catch (error) {
    console.error('Failed to start game:', error.message);
    console.error('Please ensure all dependencies are installed: npm install');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Thanks for playing Uma Musume Text Clone!');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Unexpected error:', error.message);
  console.error('🐛 Please report this issue if it persists');
  process.exit(1);
});

// Start the application
if (require.main === module) {
  main();
}