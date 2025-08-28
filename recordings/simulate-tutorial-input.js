#!/usr/bin/env node

/**
 * Simulate tutorial navigation for recording
 * This script will provide automated input to test the tutorial flow
 */

const { spawn } = require('child_process');

async function simulateTutorialInput() {
  console.log('Starting tutorial navigation simulation...\n');
  
  // Start the game process
  const gameProcess = spawn('node', ['src/app.js'], {
    stdio: ['pipe', 'inherit', 'inherit']
  });
  
  // Wait for game to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Sending input: ENTER (to pass splash screen)');
  gameProcess.stdin.write('\n');
  
  // Wait for main menu
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Sending input: 2 (select tutorial)');
  gameProcess.stdin.write('2\n');
  
  // Wait for tutorial to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Sending input: ENTER (start tutorial)');
  gameProcess.stdin.write('\n');
  
  // Wait for tutorial training
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Tutorial navigation complete. Game should be in tutorial_training state.');
  
  // Let it run for a few more seconds to see the output
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Terminating game process...');
  gameProcess.kill();
}

simulateTutorialInput().catch(console.error);