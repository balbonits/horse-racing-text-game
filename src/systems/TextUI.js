/**
 * Ultra-Simple Text-Only UI System
 * Pure ASCII, no colors, no complex formatting - maximum compatibility
 */
class TextUI {
  constructor() {
    this.lastMessage = '';
  }

  /**
   * Clear screen and show simple header
   */
  clear() {
    console.clear();
    console.log('===============================================');
    console.log('           UMA MUSUME TEXT CLONE             ');
    console.log('===============================================');
    console.log('');
  }

  /**
   * Display main menu - pure text
   */
  showMainMenu() {
    this.clear();
    console.log('MAIN MENU');
    console.log('---------');
    console.log('');
    console.log('1. New Career - Start training a new horse');
    console.log('2. Load Game - Continue a saved career');
    console.log('3. Help - Learn how to play');
    console.log('4. Quit - Exit the game');
    console.log('');
    console.log('Enter your choice (1-4):');
    console.log('');
  }

  /**
   * Display character creation screen
   */
  showCharacterCreation(nameBuffer = '') {
    this.clear();
    console.log('CHARACTER CREATION');
    console.log('------------------');
    console.log('');
    console.log('Enter your horse name and press ENTER:');
    console.log('');
    console.log('(Type Q and press ENTER to go back to main menu)');
    console.log('');
  }

  /**
   * Display training interface - simplified
   */
  showTraining(character) {
    this.clear();
    
    const stats = character.getCurrentStats();
    const condition = character.condition;
    const career = character.career;
    
    console.log('TRAINING - ' + character.name);
    console.log('========================');
    console.log('');
    
    // Simple stats display
    console.log('STATS:');
    console.log('  Speed:   ' + stats.speed + '/100  ' + this.makeBar(stats.speed));
    console.log('  Stamina: ' + stats.stamina + '/100  ' + this.makeBar(stats.stamina));
    console.log('  Power:   ' + stats.power + '/100  ' + this.makeBar(stats.power));
    console.log('');
    
    // Condition
    console.log('CONDITION:');
    console.log('  Energy: ' + condition.energy + '/100  ' + this.makeBar(condition.energy));
    console.log('  Mood:   ' + condition.mood);
    console.log('');
    
    // Career info
    console.log('CAREER:');
    console.log('  Turn: ' + career.turn + '/' + career.maxTurns);
    console.log('  Races Won: ' + career.racesWon + '/' + career.racesRun);
    console.log('');
    
    // Next race info - make it more prominent
    const nextRaceInfo = this.getNextRaceInfo(career.turn);
    if (nextRaceInfo) {
      console.log('=== UPCOMING RACE ===');
      console.log('Race: ' + nextRaceInfo.name);
      console.log('Turn: ' + nextRaceInfo.turn);
      console.log('Distance: ' + nextRaceInfo.distance);
      console.log('Focus: ' + nextRaceInfo.focus);
      if (nextRaceInfo.turnsLeft === 0) {
        console.log('*** RACE HAPPENS AFTER THIS TRAINING! ***');
      } else if (nextRaceInfo.turnsLeft === 1) {
        console.log('*** RACE HAPPENS NEXT TURN! ***');
      } else {
        console.log('Turns until race: ' + nextRaceInfo.turnsLeft);
      }
      console.log('=====================');
      console.log('');
    }
    
    // Training options
    console.log('TRAINING OPTIONS:');
    console.log('1. Speed Training   (Cost: 15 energy)');
    console.log('2. Stamina Training (Cost: 10 energy)');
    console.log('3. Power Training   (Cost: 15 energy)');
    console.log('4. Rest Day         (Gain: 30 energy)');
    console.log('5. Social Time      (Cost: 5 energy)');
    console.log('');
    console.log('Enter your choice (1-5), or S to save, Q to quit:');
    console.log('');
  }

  /**
   * Display save game list
   */
  showSaveGameList(saves) {
    this.clear();
    console.log('LOAD GAME');
    console.log('---------');
    console.log('');
    
    if (saves.length === 0) {
      console.log('No saved games found.');
      console.log('');
      console.log('Press any key to return to main menu');
      return;
    }
    
    console.log('Select a save file:');
    console.log('');
    
    saves.forEach((save, index) => {
      console.log((index + 1) + '. ' + save.character.name + 
                 ' (Turn ' + save.character.career.turn + '/' + save.character.career.maxTurns + ')');
    });
    
    console.log('');
    console.log('Enter save number (1-' + saves.length + '), or Q to go back:');
    console.log('');
  }

  /**
   * Display race results
   */
  showRaceResults(raceResult) {
    this.clear();
    console.log('RACE RESULTS');
    console.log('============');
    console.log('');
    console.log('Race: ' + raceResult.raceType);
    console.log('Distance: ' + raceResult.distance + 'm');
    console.log('');
    console.log('FINAL STANDINGS:');
    console.log('');
    
    raceResult.results.forEach((result, index) => {
      const position = index + 1;
      const isPlayer = result.participant.isPlayer;
      const name = result.participant.character.name + (isPlayer ? ' (YOU)' : '');
      const time = result.time.toFixed(2) + 's';
      
      console.log(position + '. ' + name + ' - ' + time);
    });
    
    console.log('');
    
    // Simple performance message
    const playerResult = raceResult.results.find(r => r.participant.isPlayer);
    const playerPosition = raceResult.results.indexOf(playerResult) + 1;
    
    if (playerPosition === 1) {
      console.log('VICTORY! Great job!');
    } else if (playerPosition <= 3) {
      console.log('Good performance! Top 3 finish!');
    } else {
      console.log('Keep training to improve your performance!');
    }
    
    console.log('');
    console.log('Press ENTER to continue');
    console.log('');
  }

  /**
   * Display help screen
   */
  showHelp() {
    this.clear();
    console.log('HELP');
    console.log('====');
    console.log('');
    console.log('GOAL:');
    console.log('Train your horse through 12 turns and win races!');
    console.log('');
    console.log('STATS:');
    console.log('- Speed: Final sprint performance');
    console.log('- Stamina: Race endurance'); 
    console.log('- Power: Acceleration ability');
    console.log('');
    console.log('ENERGY:');
    console.log('- Training costs energy');
    console.log('- Rest recovers energy');
    console.log('- Low energy affects performance');
    console.log('');
    console.log('RACES:');
    console.log('- Turn 4: Sprint Race (favors Speed/Power)');
    console.log('- Turn 8: Mile Race (balanced)');
    console.log('- Turn 12: Championship (favors Stamina)');
    console.log('');
    console.log('CONTROLS:');
    console.log('- Use number keys 1-5 to select options');
    console.log('- S to save game');
    console.log('- Q to quit');
    console.log('');
    console.log('Press any key to continue');
    console.log('');
  }

  /**
   * Display career completion
   */
  showCareerComplete(character, finalGrade) {
    this.clear();
    console.log('CAREER COMPLETE!');
    console.log('================');
    console.log('');
    console.log(character.name + '\'s Final Results:');
    console.log('');
    
    const stats = character.getCurrentStats();
    console.log('FINAL STATS:');
    console.log('  Speed:   ' + stats.speed + '/100');
    console.log('  Stamina: ' + stats.stamina + '/100');
    console.log('  Power:   ' + stats.power + '/100');
    console.log('');
    
    console.log('RACE RECORD:');
    console.log('  Races Won: ' + character.career.racesWon + '/' + character.career.racesRun);
    console.log('');
    
    console.log('FINAL GRADE: ' + finalGrade);
    console.log('');
    console.log('Thanks for playing!');
    console.log('');
    console.log('Press ENTER for main menu, Q to quit');
    console.log('');
  }

  /**
   * Show simple status message
   */
  showMessage(message) {
    console.log('');
    console.log('>> ' + message);
    console.log('');
  }

  /**
   * Show error message
   */
  showError(message) {
    console.log('');
    console.log('ERROR: ' + message);
    console.log('');
  }

  /**
   * Create simple ASCII progress bar
   */
  makeBar(value, max = 100, width = 10) {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return '[' + '#'.repeat(filled) + '.'.repeat(empty) + ']';
  }

  /**
   * Get detailed next race info
   */
  getNextRaceInfo(turn) {
    if (turn <= 4) {
      return {
        name: 'Debut Sprint',
        turn: 4,
        distance: '1200m',
        focus: 'Speed & Power',
        turnsLeft: 4 - turn
      };
    }
    if (turn <= 8) {
      return {
        name: 'Mile Challenge',
        turn: 8,
        distance: '1600m',
        focus: 'Balanced Stats',
        turnsLeft: 8 - turn
      };
    }
    if (turn <= 12) {
      return {
        name: 'Championship',
        turn: 12,
        distance: '2000m',
        focus: 'Stamina & Endurance',
        turnsLeft: 12 - turn
      };
    }
    return null;
  }

  /**
   * Update status for testing
   */
  updateStatus(message) {
    this.lastMessage = message;
  }
}

module.exports = TextUI;