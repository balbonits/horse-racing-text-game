const chalk = require('chalk');

/**
 * Simple Console-Based UI System
 * Prioritizes clarity and functionality over complex terminal UI
 */
class SimpleUI {
  constructor() {
    this.lastMessage = '';
    this.currentPrompt = '';
  }

  /**
   * Clear screen and show header
   */
  clearAndShowHeader() {
    console.clear();
    console.log(chalk.yellow.bold('═'.repeat(60)));
    console.log(chalk.yellow.bold('🐴        Horse Racing Text Game       🐴'));
    console.log(chalk.yellow.bold('═'.repeat(60)));
    console.log('');
  }

  /**
   * Display main menu with clear options
   */
  showMainMenu() {
    this.clearAndShowHeader();
    
    console.log(chalk.cyan.bold('🏁 MAIN MENU'));
    console.log('');
    console.log('Choose your action:');
    console.log('');
    console.log(chalk.green('  [1]') + ' New Career - Start training a new horse');
    console.log(chalk.blue('  [2]') + ' Load Game - Continue a saved career');  
    console.log(chalk.yellow('  [3]') + ' Help - Learn how to play');
    console.log(chalk.red('  [4]') + ' Quit - Exit the game');
    console.log('');
    console.log(chalk.gray('💡 Press 1-4 to select, or H for help, Q to quit'));
    console.log('');
    
    this.currentPrompt = 'main_menu';
  }

  /**
   * Display character creation screen
   */
  showCharacterCreation(nameBuffer = '') {
    this.clearAndShowHeader();
    
    console.log(chalk.cyan.bold('🐎 CHARACTER CREATION'));
    console.log('');
    console.log('Time to create your racing horse!');
    console.log('');
    console.log(chalk.yellow('Enter your horse\'s name and press ENTER:'));
    console.log('');
    console.log(chalk.gray('(Type Q and press ENTER to go back to main menu)'));
    console.log('');
    
    this.currentPrompt = 'character_creation';
  }

  /**
   * Display training interface
   */
  showTraining(character, nextRace = null) {
    this.clearAndShowHeader();
    
    const stats = character.getCurrentStats();
    const condition = character.condition;
    const career = character.career;
    
    console.log(chalk.cyan.bold(`🏋️ TRAINING - ${character.name}`));
    console.log('');
    
    // Character stats display
    console.log(chalk.bold('📊 CURRENT STATS:'));
    console.log(`   Speed:   ${this.createProgressBar(stats.speed, 100)} ${stats.speed}/100`);
    console.log(`   Stamina: ${this.createProgressBar(stats.stamina, 100)} ${stats.stamina}/100`);
    console.log(`   Power:   ${this.createProgressBar(stats.power, 100)} ${stats.power}/100`);
    console.log('');
    
    // Condition display
    console.log(chalk.bold('⚡ CONDITION:'));
    console.log(`   Energy: ${this.createEnergyBar(condition.energy, 100)} ${condition.energy}/100`);
    console.log(`   Mood: ${this.getMoodDisplay(condition.mood)}`);
    console.log('');
    
    // Career progress
    console.log(chalk.bold('🗓️ CAREER:'));
    console.log(`   Turn: ${career.turn}/${career.maxTurns}`);
    console.log(`   Races Won: ${career.racesWon}/${career.racesRun}`);
    console.log('');
    
    // Show upcoming race info using proper race data
    if (nextRace) {
      const turnsLeft = nextRace.turn - career.turn;
      console.log(chalk.bold.cyan('🏁 === UPCOMING RACE ==='));
      console.log(chalk.yellow(`   ${nextRace.name} (Turn ${nextRace.turn})`));
      console.log(`   Distance: ${nextRace.distance || 1600}m`);
      console.log(`   Surface: ${nextRace.surface || 'DIRT'}`);
      console.log(`   Type: ${nextRace.type || 'UNKNOWN'}`);
      if (turnsLeft === 0) {
        console.log(chalk.red.bold('   *** RACE HAPPENS AFTER THIS TRAINING! ***'));
      } else if (turnsLeft === 1) {
        console.log(chalk.yellow.bold('   *** RACE HAPPENS NEXT TURN! ***'));
      } else {
        console.log(`   Turns until race: ${turnsLeft}`);
      }
      console.log(chalk.bold.cyan('========================'));
      console.log('');
    }
    
    // Training options
    console.log(chalk.bold('🎯 TRAINING OPTIONS:'));
    console.log('');
    console.log(chalk.red('  [1]') + ' Speed Training   (-15 Energy, +Speed)');
    console.log(chalk.blue('  [2]') + ' Stamina Training (-10 Energy, +Stamina)');  
    console.log(chalk.yellow('  [3]') + ' Power Training   (-15 Energy, +Power)');
    console.log(chalk.green('  [4]') + ' Rest Day         (+30 Energy)');
    console.log(chalk.magenta('  [5]') + ' Social Time      (-5 Energy, +Friendship)');
    console.log('');
    
    console.log(chalk.gray('💡 Press 1-5 to train, R for race schedule, S to save, Q to quit'));
    console.log('');
    
    this.currentPrompt = 'training';
  }

  /**
   * Display race results
   */
  showRaceResults(raceResult) {
    this.clearAndShowHeader();
    
    console.log(chalk.cyan.bold('🏁 RACE RESULTS'));
    console.log('');
    console.log(chalk.bold(`Race: ${raceResult.raceType} (${raceResult.distance}m)`));
    console.log(`Track: ${raceResult.trackCondition}`);
    console.log('');
    
    // Race results table
    console.log(chalk.bold('📊 FINAL STANDINGS:'));
    console.log('');
    
    raceResult.results.forEach((result, index) => {
      const position = index + 1;
      const isPlayer = result.participant.isPlayer;
      
      let positionDisplay;
      if (position === 1) positionDisplay = chalk.yellow.bold(`🥇 ${position}st`);
      else if (position === 2) positionDisplay = chalk.gray.bold(`🥈 ${position}nd`);
      else if (position === 3) positionDisplay = chalk.yellow.bold(`🥉 ${position}rd`);
      else positionDisplay = chalk.white(`   ${position}th`);
      
      const nameDisplay = isPlayer ? 
        chalk.bold.cyan(`${result.participant.character.name} (YOU)`) :
        chalk.white(result.participant.character.name);
      
      const timeDisplay = chalk.gray(`${result.time.toFixed(2)}s`);
      
      console.log(`${positionDisplay} ${nameDisplay.padEnd(25)} ${timeDisplay}`);
    });
    
    console.log('');
    
    // Performance feedback
    const playerResult = raceResult.results.find(r => r.participant.isPlayer);
    const playerPosition = raceResult.results.indexOf(playerResult) + 1;
    
    if (playerPosition === 1) {
      console.log(chalk.green.bold('🎉 VICTORY! Outstanding performance!'));
    } else if (playerPosition <= 3) {
      console.log(chalk.yellow.bold('🏆 Great job! You placed in the top 3!'));
    } else {
      console.log(chalk.blue('💪 Good effort! Keep training to improve!'));
    }
    
    console.log('');
    console.log(chalk.gray('💡 Press ENTER to continue, Q to quit'));
    console.log('');
    
    this.currentPrompt = 'race_results';
  }

  /**
   * Display help screen
   */
  showHelp() {
    this.clearAndShowHeader();
    
    console.log(chalk.cyan.bold('📖 HELP & INSTRUCTIONS'));
    console.log('');
    console.log(chalk.bold('🎯 GOAL:'));
    console.log('Train your horse through a 12-turn career and win races!');
    console.log('');
    console.log(chalk.bold('📊 STATS:'));
    console.log('• Speed: Sprint performance and final stretch power');
    console.log('• Stamina: Race endurance and energy management'); 
    console.log('• Power: Acceleration ability and burst speed');
    console.log('');
    console.log(chalk.bold('⚡ ENERGY & MOOD:'));
    console.log('• Energy decreases with training, increases with rest');
    console.log('• Low energy affects mood and training effectiveness');
    console.log('• Race performance depends on current energy level');
    console.log('');
    console.log(chalk.bold('🏁 RACES:'));
    console.log('• Turn 4: Sprint Race (1200m) - Favors Speed/Power');
    console.log('• Turn 8: Mile Race (1600m) - Balanced requirements');
    console.log('• Turn 12: Championship (2000m) - Favors Stamina');
    console.log('');
    console.log(chalk.bold('⌨️ CONTROLS:'));
    console.log('• Numbers 1-5: Select options');
    console.log('• H: Help screen');
    console.log('• R: Race schedule');
    console.log('• S: Save game'); 
    console.log('• Q: Quit');
    console.log('');
    console.log(chalk.gray('💡 Press any key to return to the previous screen'));
    console.log('');
    
    this.currentPrompt = 'help';
  }

  /**
   * Display career completion screen
   */
  showCareerComplete(character, finalGrade) {
    this.clearAndShowHeader();
    
    console.log(chalk.cyan.bold('🏆 CAREER COMPLETE'));
    console.log('');
    console.log(chalk.bold(`🐎 ${character.name}'s Racing Career Summary`));
    console.log('');
    
    const stats = character.getCurrentStats();
    const career = character.career;
    
    console.log(chalk.bold('📊 FINAL STATS:'));
    console.log(`   Speed:   ${stats.speed}/100`);
    console.log(`   Stamina: ${stats.stamina}/100`);
    console.log(`   Power:   ${stats.power}/100`);
    console.log('');
    
    console.log(chalk.bold('🏁 RACE RECORD:'));
    console.log(`   Races Won: ${career.racesWon}/${career.racesRun}`);
    console.log(`   Win Rate: ${Math.round((career.racesWon / career.racesRun) * 100)}%`);
    console.log('');
    
    console.log(chalk.bold('🎓 FINAL GRADE:'));
    console.log(chalk.yellow.bold(`   ${finalGrade}`));
    console.log('');
    
    console.log(chalk.green.bold('🎉 Thank you for playing!'));
    console.log('');
    console.log(chalk.gray('💡 Press ENTER for main menu, Q to quit'));
    console.log('');
    
    this.currentPrompt = 'career_complete';
  }

  /**
   * Show status message
   */
  showStatus(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    const color = colors[type] || chalk.white;
    console.log('');
    console.log(color(`📢 ${message}`));
    console.log('');
  }

  /**
   * Show error message
   */
  showError(message) {
    console.log('');
    console.log(chalk.red.bold(`❌ ${message}`));
    console.log('');
  }

  /**
   * Create ASCII progress bar
   */
  createProgressBar(value, max, length = 20) {
    const percentage = Math.min(value / max, 1);
    const filled = Math.round(percentage * length);
    const empty = length - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    if (percentage >= 0.8) return chalk.green(bar);
    if (percentage >= 0.6) return chalk.yellow(bar);
    if (percentage >= 0.4) return chalk.blue(bar);
    return chalk.red(bar);
  }

  /**
   * Create energy bar with different colors
   */
  createEnergyBar(energy, max, length = 20) {
    const percentage = energy / max;
    const filled = Math.round(percentage * length);
    const empty = length - filled;
    
    const bar = '⚡'.repeat(filled) + '░'.repeat(empty);
    
    if (percentage >= 0.7) return chalk.green(bar);
    if (percentage >= 0.4) return chalk.yellow(bar);
    return chalk.red(bar);
  }

  /**
   * Get mood display with emoji
   */
  getMoodDisplay(mood) {
    const moodMap = {
      'Excellent': '😄 Excellent',
      'Great': '😊 Great', 
      'Good': '🙂 Good',
      'Normal': '😐 Normal',
      'Tired': '😴 Tired',
      'Bad': '😞 Bad'
    };
    
    return moodMap[mood] || `😐 ${mood}`;
  }


  /**
   * Get race turn
   */
  getRaceTurn(raceName) {
    const raceMap = {
      'Sprint Race': 4,
      'Mile Race': 8,
      'Championship': 12
    };
    return raceMap[raceName] || '?';
  }

  /**
   * Update last message for testing
   */
  updateStatus(message) {
    this.lastMessage = message;
  }
}

module.exports = SimpleUI;