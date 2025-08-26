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
    console.log('           HORSE RACING TEXT GAME            ');
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
  showCharacterCreation(nameBuffer = '', nameOptions = []) {
    this.clear();
    console.log('CHARACTER CREATION');
    console.log('------------------');
    console.log('');
    
    if (nameOptions.length > 0) {
      console.log('Generated name suggestions:');
      console.log('');
      nameOptions.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
      console.log('');
      console.log('Enter a number (1-' + nameOptions.length + ') to select a name,');
      console.log('OR type your own horse name and press ENTER,');
      console.log('OR type "G" to generate new names:');
      console.log('');
      console.log('(Type Q and press ENTER to go back to main menu)');
    } else {
      console.log('Enter your horse name and press ENTER,');
      console.log('OR type "G" to generate name suggestions:');
      console.log('');
      console.log('(Type Q and press ENTER to go back to main menu)');
    }
    console.log('');
  }

  /**
   * Display training interface - simplified
   */
  showTraining(character, nextRace = null) {
    this.clear();
    
    const stats = character.getCurrentStats();
    const condition = character.condition;
    const career = character.career;
    
    console.log('TRAINING - ' + character.name);
    console.log('========================');
    console.log('');
    
    // Simple stats display
    console.log('STATS:');
    console.log('  Speed:   ' + stats.speed + '/100  ' + this.makeProgressBar(stats.speed));
    console.log('  Stamina: ' + stats.stamina + '/100  ' + this.makeProgressBar(stats.stamina));
    console.log('  Power:   ' + stats.power + '/100  ' + this.makeProgressBar(stats.power));
    console.log('');
    
    // Condition
    console.log('CONDITION:');
    console.log('  Energy: ' + Math.round(condition.energy) + '/100  ' + this.makeProgressBar(condition.energy));
    console.log('  Mood:   ' + condition.mood);
    console.log('');
    
    // Career info
    console.log('CAREER:');
    console.log('  Turn: ' + career.turn + '/' + career.maxTurns);
    console.log('  Races Won: ' + career.racesWon + '/' + career.racesRun);
    console.log('');
    
    // Next race info using proper race data
    if (nextRace) {
      const turnsLeft = nextRace.turn - career.turn;
      console.log('=== UPCOMING RACE ===');
      console.log('Race: ' + nextRace.name);
      console.log('Turn: ' + nextRace.turn);
      console.log('Distance: ' + (nextRace.distance || 1600) + 'm');
      console.log('Surface: ' + (nextRace.surface || 'DIRT'));
      console.log('Type: ' + (nextRace.type || 'UNKNOWN'));
      if (turnsLeft === 0) {
        console.log('*** RACE HAPPENS AFTER THIS TRAINING! ***');
      } else if (turnsLeft === 1) {
        console.log('*** RACE HAPPENS NEXT TURN! ***');
      } else {
        console.log('Turns until race: ' + turnsLeft);
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
      const timeValue = result.performance?.time || result.time || 0;
      const time = (typeof timeValue === 'number' ? timeValue : parseFloat(timeValue) || 0).toFixed(2) + 's';
      const placing = this.getHorseRacingPlacing(position);
      
      console.log(`${placing} ${name} - ${time}`);
    });
    
    console.log('');
    
    // Combined podium ceremony with race results
    const playerResult = raceResult.results.find(r => r.participant.isPlayer);
    const playerPosition = raceResult.results.indexOf(playerResult) + 1;
    
    console.log('🏆 RACE CEREMONY 🏆');
    console.log('====================');
    console.log('');
    
    if (playerPosition === 1) {
      console.log('        🥇 WINNER! 🥇');
      console.log(`       ${playerResult.participant.character.name}`);
      const playerTimeValue = playerResult.performance?.time || playerResult.time || 0;
      const playerTime = (typeof playerTimeValue === 'number' ? playerTimeValue : parseFloat(playerTimeValue) || 0).toFixed(2);
      console.log(`       Time: ${playerTime}s`);
      console.log('');
      console.log('🎉 CONGRATULATIONS! 🎉');
      console.log('Amazing performance!');
    } else if (playerPosition === 2) {
      console.log('        🥈 2nd Place 🥈');
      console.log(`       ${playerResult.participant.character.name}`);
      console.log('');
      console.log('Great race! So close to victory!');
    } else if (playerPosition === 3) {
      console.log('        🥉 3rd Place 🥉');
      console.log(`       ${playerResult.participant.character.name}`);
      console.log('');
      console.log('Good job! A podium finish!');
    } else {
      const placing = this.getHorseRacingPlacing(playerPosition).replace(/🏆|🥈|🥉/g, '').trim();
      console.log(`        ${placing} Place`);
      console.log(`       ${playerResult.participant.character.name}`);
      console.log('');
      console.log('Keep training to improve!');
    }
    
    console.log('');
    console.log('Press ENTER to continue');
    console.log('');
  }

  /**
   * Display career completion summary with grade
   */
  showCareerCompletion(careerSummary) {
    console.log('═══════════════════════════════════════');
    console.log('🏁 CAREER COMPLETE! 🏁');
    console.log('═══════════════════════════════════════');
    console.log('');
    
    // Show final grade
    const gradeColors = {
      'S': '🌟',
      'A': '⭐',
      'B': '🔸',
      'C': '🔹',
      'D': '📘',
      'F': '📕'
    };
    
    console.log(`${gradeColors[careerSummary.grade] || '📄'} FINAL GRADE: ${careerSummary.grade} ${gradeColors[careerSummary.grade] || '📄'}`);
    console.log('');
    console.log(`"${careerSummary.message}"`);
    console.log('');
    
    // Show statistics
    console.log('📊 CAREER STATISTICS:');
    console.log('─────────────────────');
    console.log(`Races Won: ${careerSummary.stats.racesWon}/${careerSummary.stats.racesRun}`);
    console.log(`Win Rate: ${careerSummary.stats.racesRun > 0 ? Math.round((careerSummary.stats.racesWon / careerSummary.stats.racesRun) * 100) : 0}%`);
    console.log(`Training Sessions: ${careerSummary.stats.totalTraining}`);
    console.log(`Friendship Level: ${careerSummary.stats.friendship}/100`);
    console.log('');
    
    // Show final stats
    console.log('🏇 FINAL STATS:');
    console.log('───────────────');
    console.log(`Speed:   ${careerSummary.stats.startingStats.speed} → ${careerSummary.stats.finalStats.speed} (+${careerSummary.stats.finalStats.speed - careerSummary.stats.startingStats.speed})`);
    console.log(`Stamina: ${careerSummary.stats.startingStats.stamina} → ${careerSummary.stats.finalStats.stamina} (+${careerSummary.stats.finalStats.stamina - careerSummary.stats.startingStats.stamina})`);
    console.log(`Power:   ${careerSummary.stats.startingStats.power} → ${careerSummary.stats.finalStats.power} (+${careerSummary.stats.finalStats.power - careerSummary.stats.startingStats.power})`);
    console.log('');
    
    // Show achievements
    if (careerSummary.achievements.length > 0) {
      console.log('🏆 ACHIEVEMENTS EARNED:');
      console.log('───────────────────────');
      careerSummary.achievements.forEach(achievement => {
        console.log(`  ${achievement}`);
      });
      console.log('');
    }
    
    console.log('═══════════════════════════════════════');
    console.log('Thank you for playing Horse Racing Game!');
    console.log('Press ENTER to return to main menu');
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
   * Create a more visually appealing progress bar
   */
  makeProgressBar(value, max = 100, width = 20) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    // Use different characters for a more appealing look
    const filledChar = '█';
    const emptyChar = '░';
    
    return '[' + filledChar.repeat(filled) + emptyChar.repeat(empty) + ']';
  }


  /**
   * Display race preview screen
   */
  showRacePreview(raceInfo, character) {
    this.clear();
    console.log('🏁 RACE PREVIEW 🏁');
    console.log('==================');
    console.log('');
    console.log(`Race: ${raceInfo.name}`);
    console.log(`Distance: ${raceInfo.distance || '1600m'}`);
    console.log(`Surface: ${raceInfo.surface || 'Dirt'}`);
    console.log(`Weather: ${raceInfo.weather || 'Clear'}`);
    console.log('');
    console.log('YOUR HORSE:');
    console.log(`Name: ${character.name}`);
    const stats = character.getCurrentStats();
    console.log(`Speed:   ${stats.speed}/100`);
    console.log(`Stamina: ${stats.stamina}/100`);
    console.log(`Power:   ${stats.power}/100`);
    console.log(`Energy:  ${character.condition.energy}/100`);
    console.log('');
    console.log('🏇 Ready to race? Press ENTER to see the competition');
    console.log('');
  }

  /**
   * Display horse lineup screen
   */
  showHorseLineup(raceField, character) {
    this.clear();
    console.log('🐎 HORSE LINEUP 🐎');
    console.log('===================');
    console.log('');
    console.log('Today\'s Competitors:');
    console.log('');
    
    // Show player horse first
    console.log(`${character.name} (YOU) 🟢`);
    const playerStats = character.getCurrentStats();
    console.log(`  Stats: Speed ${playerStats.speed}, Stamina ${playerStats.stamina}, Power ${playerStats.power}`);
    console.log('');
    
    // Show competition
    raceField.forEach((horse, index) => {
      console.log(`${horse.name} ${horse.icon || '🐎'}`);
      console.log(`  Stats: Speed ${Math.round(horse.stats.speed)}, Stamina ${Math.round(horse.stats.stamina)}, Power ${Math.round(horse.stats.power)}`);
      console.log('');
    });
    
    console.log('Press ENTER to select your racing strategy');
    console.log('');
  }

  /**
   * Display strategy selection screen
   */
  showStrategySelect() {
    this.clear();
    console.log('🎯 RACING STRATEGY 🎯');
    console.log('======================');
    console.log('');
    console.log('Choose your racing style:');
    console.log('');
    console.log('1. FRONT RUNNER 🔥');
    console.log('   Take the early lead and hold it');
    console.log('   Best for: High Speed & Power');
    console.log('');
    console.log('2. STALKER 🎯');
    console.log('   Stay with the pack, surge late');
    console.log('   Best for: Balanced stats');
    console.log('');
    console.log('3. CLOSER 💨');
    console.log('   Save energy for final sprint');
    console.log('   Best for: High Stamina');
    console.log('');
    console.log('Enter your choice (1-3):');
    console.log('');
  }

  /**
   * Display podium ceremony
   */
  showPodium(raceResult) {
    this.clear();
    console.log('🏆 RACE CEREMONY 🏆');
    console.log('====================');
    console.log('');
    
    // Find player result
    const playerResult = raceResult.results.find(r => r.participant.isPlayer);
    const position = raceResult.results.indexOf(playerResult) + 1;
    
    if (position === 1) {
      console.log('        🥇 WINNER! 🥇');
      console.log(`       ${playerResult.participant.character.name}`);
      const playerTimeValue = playerResult.performance?.time || playerResult.time || 0;
      const playerTime = (typeof playerTimeValue === 'number' ? playerTimeValue : parseFloat(playerTimeValue) || 0).toFixed(2);
      console.log(`       Time: ${playerTime}s`);
      console.log('');
      console.log('🎉 CONGRATULATIONS! 🎉');
      console.log('Amazing performance!');
    } else if (position === 2) {
      console.log('        🥈 2nd Place 🥈');
      console.log(`       ${playerResult.participant.character.name}`);
      console.log('');
      console.log('Great race! So close to victory!');
    } else if (position === 3) {
      console.log('        🥉 3rd Place 🥉');
      console.log(`       ${playerResult.participant.character.name}`);
      console.log('');
      console.log('Good job! A podium finish!');
    } else {
      const placing = this.getHorseRacingPlacing(position).replace(/🏆|🥈|🥉/g, '').trim();
      console.log(`        ${placing} Place`);
      console.log(`       ${playerResult.participant.character.name}`);
      console.log('');
      console.log('Keep training to improve!');
    }
    
    console.log('');
    console.log('🏁 Final Standings:');
    raceResult.results.forEach((result, index) => {
      const pos = index + 1;
      const name = result.participant.character.name + (result.participant.isPlayer ? ' (YOU)' : '');
      const resultTimeValue = result.performance?.time || result.time || 0;
      const resultTime = (typeof resultTimeValue === 'number' ? resultTimeValue : parseFloat(resultTimeValue) || 0).toFixed(2);
      const placing = this.getHorseRacingPlacing(pos);
      console.log(`${placing} ${name} - ${resultTime}s`);
    });
    
    console.log('');
    console.log('Press ENTER to continue training');
    console.log('');
  }

  /**
   * Get horse racing placing terminology
   */
  getHorseRacingPlacing(position) {
    const placings = {
      1: '🏆 1st',
      2: '🥈 2nd', 
      3: '🥉 3rd',
      4: '4th',
      5: '5th',
      6: '6th',
      7: '7th',
      8: '8th'
    };
    
    return placings[position] || `${position}th`;
  }

  /**
   * Update status for testing
   */
  updateStatus(message) {
    this.lastMessage = message;
  }
}

module.exports = TextUI;