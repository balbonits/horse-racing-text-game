/**
 * Goodbye Screen
 * 
 * Shows a thank you message when the player exits the game.
 * Provides a warm, encouraging farewell experience.
 */

class GoodbyeScreen {
  constructor(colorManager = null) {
    this.colorManager = colorManager;
  }

  /**
   * Display the goodbye message
   */
  display() {
    console.clear();
    console.log('\n'.repeat(3));
    
    console.log('    ████████████████████████████████████████████████████████████████');
    console.log('    █                                                              █');
    console.log('    █           🐎 THANK YOU FOR PLAYING! 🏇                       █');
    console.log('    █                                                              █');
    console.log('    ████████████████████████████████████████████████████████████████');
    console.log('');
    console.log('');
    console.log('    🏆  Thank you for playing Horse Racing Text Game!');
    console.log('');
    console.log('    🌟  Whether you trained champions or are still learning,');
    console.log('        every journey starts with a single step.');
    console.log('');
    console.log('    🐴  Your horses may rest, but legends never fade.');
    console.log('');
    console.log('    🎯  Come back anytime to:');
    console.log('        • Train new champions');
    console.log('        • Try different strategies');
    console.log('        • Beat your previous records');
    console.log('        • Experience the thrill of victory');
    console.log('');
    console.log('    ⭐  Until next time, may your horses run swift');
    console.log('        and your victories be legendary!');
    console.log('');
    console.log('    ════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('                       👋 Goodbye, Champion! 🏇');
    console.log('');
  }

  /**
   * Show goodbye screen with delay, then exit
   */
  async showAndExit() {
    this.display();
    
    // Give user time to read the message
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('    Exiting game...\n');
    process.exit(0);
  }

  /**
   * Show brief goodbye for quick exits
   */
  displayBrief() {
    console.log('\n');
    console.log('    🐎 Thanks for playing Horse Racing Text Game! 🏇');
    console.log('    👋 Come back anytime, Champion!');
    console.log('\n');
  }
}

module.exports = GoodbyeScreen;