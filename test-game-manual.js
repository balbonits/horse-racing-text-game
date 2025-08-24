/**
 * Manual Game Test - Tests the game flow without blessed UI complications
 */

const GameApp = require('./src/GameApp');

async function testGameManually() {
  console.log('🧪 Manual Game Test Starting...\n');
  
  try {
    // Create game without blessed screen (null screen)
    const app = new GameApp(null);
    
    console.log('✅ Game created successfully');
    console.log('📍 Current state:', app.currentState);
    
    // Test main menu navigation
    console.log('\n🎮 Testing main menu...');
    let result = app.handleKeyInput('1');
    console.log('🔍 Pressed "1" (New Career):', result);
    console.log('📍 Current state:', app.currentState);
    
    if (app.currentState === 'character_creation') {
      console.log('\n🐴 Testing character creation...');
      
      // Type character name letter by letter
      const name = 'TestHorse';
      for (const char of name) {
        result = app.handleKeyInput(char);
        console.log(`🔤 Typed "${char}":`, result);
      }
      
      // Submit the name
      console.log('\n⏎ Submitting name...');
      result = app.handleKeyInput('enter');
      console.log('🔍 Pressed Enter:', result);
      console.log('📍 Current state:', app.currentState);
      console.log('🐎 Character created:', app.game.character ? app.game.character.name : 'null');
      
      if (app.game.character) {
        console.log('📊 Character stats:', app.game.character.stats);
        
        console.log('\n🏋️ Testing training...');
        
        // Do a few training actions
        const trainings = ['1', '2', '3', '4']; // speed, stamina, power, rest
        for (const training of trainings) {
          result = app.handleKeyInput(training);
          console.log(`🏃 Training "${training}":`, result);
          console.log('📊 Stats:', app.game.character.stats);
          console.log('⚡ Energy:', app.game.character.condition.energy);
          console.log('🔄 Turn:', app.game.character.career.turn);
        }
        
        // Complete training to reach races
        console.log('\n🏁 Completing training to reach races...');
        while (app.currentState === 'training' && app.game.character.career.turn <= 12) {
          app.handleKeyInput('4'); // Rest
          console.log(`🔄 Turn ${app.game.character.career.turn}, State: ${app.currentState}`);
        }
        
        console.log('🏆 Final state:', app.currentState);
        if (app.currentState === 'race_results') {
          console.log('🏁 Race results:', app.game.getRaceResults().length);
        }
      }
    }
    
    app.cleanup();
    console.log('\n✅ Manual test completed successfully!');
    
  } catch (error) {
    console.error('❌ Manual test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testGameManually().then(() => {
  console.log('\n🎉 Test finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});