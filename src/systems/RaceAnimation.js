/**
 * Race Animation System - Displays animated horse racing progression
 */
class RaceAnimation {
  constructor(raceField, playerHorse, raceInfo) {
    this.raceField = raceField || [];
    this.playerHorse = playerHorse;
    this.raceInfo = raceInfo;
    this.trackLength = 50; // ASCII track length
    this.duration = 12000; // 12 seconds total
    this.frameRate = 200; // Update every 200ms
    this.participants = [];
    this.isRunning = false;
    this.fastForward = false;
  }

  /**
   * Initialize race participants with performance calculations
   */
  initializeParticipants() {
    this.participants = [];
    
    // Add player horse
    const playerStats = this.playerHorse.getCurrentStats();
    const playerPerformance = this.calculatePerformance(playerStats);
    this.participants.push({
      name: this.playerHorse.name,
      stats: playerStats,
      performance: playerPerformance,
      progress: 0,
      icon: '🟢', // Green for player
      isPlayer: true,
      position: 0
    });

    // Add AI horses
    this.raceField.forEach((horse, index) => {
      const performance = this.calculatePerformance(horse.stats);
      this.participants.push({
        name: horse.name,
        stats: horse.stats,
        performance: performance,
        progress: 0,
        icon: horse.icon || ['🐎', '🏇', '🐴'][index % 3],
        isPlayer: false,
        position: 0
      });
    });
  }

  /**
   * Calculate horse performance with randomness
   */
  calculatePerformance(stats) {
    const basePerformance = (stats.speed * 0.4) + (stats.stamina * 0.4) + (stats.power * 0.2);
    const randomFactor = 0.85 + Math.random() * 0.3; // ±15% variance
    return basePerformance * randomFactor;
  }

  /**
   * Run the animated race
   */
  /**
   * Enable fast forward to skip animation
   */
  enableFastForward() {
    this.fastForward = true;
  }

  async run() {
    this.initializeParticipants();
    this.isRunning = true;
    
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      this.updateInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / this.duration, 1.0);
        
        // If fast forward enabled, jump to end
        if (this.fastForward) {
          progress = 1.0;
        }
        
        this.updateRaceProgress(progress);
        
        // Only display animation if not fast forwarding
        if (!this.fastForward) {
          this.displayRaceFrame(elapsed);
        }
        
        if (progress >= 1.0) {
          this.cleanup();
          
          // Calculate final results
          const results = this.calculateFinalResults();
          resolve(results);
        }
      }, this.frameRate);
    });
  }

  /**
   * Clean up race animation resources
   */
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Update horse positions based on performance
   */
  updateRaceProgress(raceProgress) {
    this.participants.forEach(horse => {
      // Each horse progresses at different rates based on performance
      const speedFactor = horse.performance / 100;
      const randomVariance = 0.95 + Math.random() * 0.1; // Small variance per frame
      
      horse.progress = Math.min(raceProgress * speedFactor * randomVariance, 1.0);
    });

    // Sort by progress for position display
    this.participants.sort((a, b) => b.progress - a.progress);
    this.participants.forEach((horse, index) => {
      horse.position = index + 1;
    });
  }

  /**
   * Display current race frame
   */
  displayRaceFrame(elapsed) {
    // Clear screen (simple version for terminal)
    console.clear();
    
    console.log('🏁 RACE IN PROGRESS 🏁');
    console.log('======================');
    console.log('');
    
    // Show race info
    console.log(`Race: ${this.raceInfo?.name || 'Race'}`);
    console.log(`Time: ${(elapsed / 1000).toFixed(1)}s`);
    console.log('');
    console.log('💡 Press ENTER to fast forward to results');
    console.log('');
    
    // Show track with horses
    this.participants.forEach((horse, index) => {
      const position = Math.floor(horse.progress * this.trackLength);
      const track = '░'.repeat(position) + horse.icon + '░'.repeat(Math.max(0, this.trackLength - position));
      const name = (horse.name + (horse.isPlayer ? ' (YOU)' : '')).padEnd(20);
      
      console.log(`${horse.position}. ${name} |${track}|`);
    });
    
    console.log('');
    console.log('═'.repeat(this.trackLength + 25));
    
    // Show phase
    const phase = this.getCurrentPhase(elapsed / 1000);
    console.log(`Phase: ${phase}`);
    console.log('');
  }

  /**
   * Get current race phase description
   */
  getCurrentPhase(seconds) {
    if (seconds < 4) return 'Starting Gate 🚪';
    if (seconds < 8) return 'Early Pace 🏃';
    if (seconds < 10) return 'Middle Stretch 🔥';
    return 'Final Sprint! 💨';
  }

  /**
   * Calculate final race results
   */
  calculateFinalResults() {
    // Sort by final progress/performance
    const finalStandings = [...this.participants].sort((a, b) => b.performance - a.performance);
    
    // Generate realistic times based on performance
    const baseTime = 60 + Math.random() * 20; // 60-80 seconds base
    
    const results = finalStandings.map((horse, index) => {
      const timeModifier = index * 0.5 + Math.random() * 0.5;
      const finalTime = baseTime + timeModifier;
      
      return {
        participant: {
          isPlayer: horse.isPlayer,
          character: { name: horse.name }
        },
        time: finalTime.toFixed(2),
        performance: horse.performance,
        position: index + 1
      };
    });

    return {
      results: results,
      raceType: this.raceInfo?.name || 'Race',
      distance: this.raceInfo?.distance || 1600,
      trackCondition: this.raceInfo?.surface || 'Good'
    };
  }
}

module.exports = RaceAnimation;