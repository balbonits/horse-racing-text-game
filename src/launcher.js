#!/usr/bin/env node

/**
 * Simple Launcher for Uma Musume Text-Based Clone
 * Just runs the game directly for maximum compatibility
 */

const GameApp = require('./GameApp');

console.log('===============================================');
console.log('           UMA MUSUME TEXT CLONE             ');
console.log('===============================================');
console.log('Starting game...\n');

try {
  // Create and start the game directly
  const app = new GameApp();
  app.start();
} catch (error) {
  console.error('Failed to start game:', error.message);
  console.error('Please ensure all dependencies are installed: npm install');
  process.exit(1);
}