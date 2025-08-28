#!/usr/bin/env node

/**
 * Final test - proper tutorial flow with longer delays
 */

const { spawn } = require('child_process');

async function finalTutorialTest() {
  console.log('=== FINAL TUTORIAL FLOW TEST ===\n');
  
  // Start the game process
  const gameProcess = spawn('node', ['src/app.js'], {
    stdio: ['pipe', 'inherit', 'inherit']
  });
  
  // Wait for splash screen
  console.log('Waiting for splash screen...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  console.log('Sending ENTER to continue past splash');
  gameProcess.stdin.write('\n');
  
  // Wait for main menu
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Sending 2 to select tutorial');
  gameProcess.stdin.write('2\n');
  
  // Wait for tutorial screen
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Sending ENTER to start tutorial training');
  gameProcess.stdin.write('\n');
  
  // Give time for tutorial training to render completely
  console.log('Waiting 5 seconds for tutorial training to render...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Tutorial test complete - check what rendered above');
  gameProcess.kill();
}

finalTutorialTest().catch(console.error);