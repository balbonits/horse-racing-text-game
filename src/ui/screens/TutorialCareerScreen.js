/**
 * Tutorial Career Completion Screen
 * 
 * Shows curated, static results for the tutorial's mini-career simulation.
 * Designed to be predictable and educational rather than dynamic like the main game.
 */

class TutorialCareerScreen {
  constructor(ui, tutorialCharacter) {
    this.ui = ui;
    this.character = tutorialCharacter;
  }

  /**
   * Display the curated tutorial career completion screen
   */
  display() {
    const ui = this.ui;
    
    ui.clearScreen();
    console.log('');
    
    // Header
    console.log('    ═══════════════════════════════════════════════════════');
    console.log('    🎓                TUTORIAL COMPLETE!                🎓');
    console.log('    ═══════════════════════════════════════════════════════');
    console.log('');
    
    // Character summary (using actual tutorial character data)
    console.log('    📊 FINAL CHARACTER SUMMARY');
    console.log('    ─────────────────────────────');
    console.log(`    🐎 Horse: ${this.character.name}`);
    console.log(`    🏃 Speed: ${this.character.stats.speed}    ⚡ Stamina: ${this.character.stats.stamina}    💪 Power: ${this.character.stats.power}`);
    console.log(`    ⚡ Energy: ${this.character.energy}/100`);
    console.log(`    📅 Turns Completed: ${this.character.career.turn - 1}`);
    console.log('');
    
    // Curated race simulation (static results for tutorial)
    console.log('    🏆 TUTORIAL RACE SIMULATION');
    console.log('    ─────────────────────────────');
    console.log('    🏁 Maiden Sprint (1200m - Turf)');
    console.log('    ');
    
    // Static race results based on tutorial character performance
    const totalStats = this.character.stats.speed + this.character.stats.stamina + this.character.stats.power;
    let placement, time, prize;
    
    if (totalStats >= 75) {
      placement = '🥇 1st Place';
      time = '1:12.45';
      prize = '$2,000';
    } else if (totalStats >= 70) {
      placement = '🥈 2nd Place';
      time = '1:12.89';
      prize = '$800';
    } else if (totalStats >= 65) {
      placement = '🥉 3rd Place';
      time = '1:13.12';
      prize = '$400';
    } else {
      placement = '4th Place';
      time = '1:13.67';
      prize = '$200';
    }
    
    console.log(`    📍 Result: ${placement}`);
    console.log(`    ⏱️  Time: ${time}`);
    console.log(`    💰 Prize: ${prize}`);
    console.log('');
    
    // Race commentary (curated based on placement)
    console.log('    🎤 RACE COMMENTARY');
    console.log('    ─────────────────');
    if (totalStats >= 75) {
      console.log(`    "Excellent debut! ${this.character.name} showed great promise`);
      console.log('    with strong speed and stamina. The training clearly paid off!"');
    } else if (totalStats >= 70) {
      console.log(`    "Solid performance from ${this.character.name}. A few more`);
      console.log('    training sessions and this horse could be a winner!"');
    } else if (totalStats >= 65) {
      console.log(`    "Respectable showing for ${this.character.name}. The`);
      console.log('    foundation is there - just needs more development."');
    } else {
      console.log(`    "Good effort from ${this.character.name}. Every champion`);
      console.log('    starts somewhere - time and training will improve results."');
    }
    console.log('');
    
    // Tutorial grade (always positive for learning experience)
    const tutorialGrade = totalStats >= 75 ? 'A' : totalStats >= 70 ? 'B+' : totalStats >= 65 ? 'B' : 'B-';
    
    console.log('    📋 TUTORIAL PERFORMANCE GRADE');
    console.log('    ─────────────────────────────');
    console.log(`    🎯 Overall Grade: ${tutorialGrade}`);
    console.log('');
    console.log('    🌟 What You Learned:');
    console.log('    • Training directly improves your horse\'s stats');
    console.log('    • Energy management is crucial for training');
    console.log('    • Different training types boost different stats');
    console.log('    • Rest days restore energy for more training');
    console.log('    • Stats directly impact race performance');
    console.log('');
    
    // Next steps (encouraging progression to main game)
    console.log('    🚀 READY FOR YOUR FIRST CAREER!');
    console.log('    ───────────────────────────────');
    console.log('    You\'ve mastered the basics! A full career offers:');
    console.log('    • 24 turns of training and development');
    console.log('    • 4 challenging races with unique requirements');
    console.log('    • 24 rival horses with different strategies');
    console.log('    • Career progression and legacy building');
    console.log('    • Randomized stats for variety and replayability');
    console.log('');
    
    // Motivational message
    console.log('    💭 "Every champion was once a beginner."');
    console.log('       "Every expert was once a disaster."');
    console.log('       "Every winner was once a loser."');
    console.log('       "The difference? They kept trying."');
    console.log('');
    
    console.log('    ═══════════════════════════════════════════════════════');
    console.log('    🐎 Press ENTER to return to main menu and start your');
    console.log('       first real career, or explore other options!');
    console.log('    ═══════════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * Get tutorial completion data for debugging/testing
   */
  getTutorialData() {
    const totalStats = this.character.stats.speed + this.character.stats.stamina + this.character.stats.power;
    
    return {
      character: {
        name: this.character.name,
        stats: { ...this.character.stats },
        energy: this.character.energy,
        turns: this.character.career.turn - 1
      },
      race: {
        name: 'Maiden Sprint',
        distance: '1200m',
        surface: 'Turf',
        placement: totalStats >= 75 ? 1 : totalStats >= 70 ? 2 : totalStats >= 65 ? 3 : 4,
        time: totalStats >= 75 ? '1:12.45' : totalStats >= 70 ? '1:12.89' : totalStats >= 65 ? '1:13.12' : '1:13.67',
        prize: totalStats >= 75 ? 2000 : totalStats >= 70 ? 800 : totalStats >= 65 ? 400 : 200
      },
      grade: totalStats >= 75 ? 'A' : totalStats >= 70 ? 'B+' : totalStats >= 65 ? 'B' : 'B-',
      totalStats: totalStats,
      completed: true
    };
  }
}

module.exports = TutorialCareerScreen;