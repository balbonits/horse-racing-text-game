/**
 * Loading States System
 * Manages transition animations and loading feedback
 */

const chalk = require('chalk');

class LoadingStates {
  constructor() {
    this.loadingChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.currentFrame = 0;
    this.activeLoader = null;
  }

  /**
   * Show loading animation for screen transitions
   */
  showTransition(fromState, toState, duration = 1500) {
    return new Promise((resolve) => {
      const messages = {
        'main_menu→character_creation': 'Preparing character creation...',
        'character_creation→training': 'Creating your horse...',
        'training→race_preview': 'Preparing for race...',
        'race_preview→strategy_select': 'Loading race lineup...',
        'strategy_select→race_running': 'Horses heading to starting line...',
        'race_running→race_results': 'Calculating race results...',
        'race_results→podium': 'Preparing victory ceremony...',
        'podium→training': 'Returning to training...',
        'training→save': 'Saving your progress...',
        'load_game→training': 'Loading your horse...',
        'any→help': 'Loading help system...',
        'any→main_menu': 'Returning to main menu...'
      };

      const key = `${fromState}→${toState}`;
      const fallbackKey = `any→${toState}`;
      const message = messages[key] || messages[fallbackKey] || 'Loading...';

      this.startSpinner(message);

      // Simulate loading time
      setTimeout(() => {
        this.stopSpinner();
        resolve();
      }, duration);
    });
  }

  /**
   * Show progress for multi-step operations
   */
  showProgress(steps, currentStep, message) {
    const progress = Math.round((currentStep / steps) * 100);
    const barLength = 20;
    const filled = Math.round((progress / 100) * barLength);
    const empty = barLength - filled;
    
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
    
    if (process.env.NODE_ENV !== 'test') {
      console.clear();
      console.log('===============================================');
      console.log('           HORSE RACING TEXT GAME            ');
      console.log('===============================================');
      console.log('');
      console.log(chalk.cyan.bold(message));
      console.log('');
      console.log(chalk.yellow(`[${progressBar}] ${progress}%`));
      console.log(chalk.gray(`Step ${currentStep} of ${steps}`));
      console.log('');
    }
  }

  /**
   * Show loading for NPH generation
   */
  async showNPHGeneration(totalHorses) {
    for (let i = 0; i < totalHorses; i++) {
      this.showProgress(totalHorses, i + 1, 'Generating rival horses...');
      
      // Show individual horse creation
      if (i < 3) { // Show details for first few
        await this.delay(200);
        if (process.env.NODE_ENV !== 'test') {
          console.log(chalk.green(`✓ Created rival horse ${i + 1}`));
        }
        await this.delay(100);
      } else {
        await this.delay(50); // Faster for bulk
      }
    }
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('');
      console.log(chalk.green.bold('✅ All rival horses ready!'));
    }
    await this.delay(800);
  }

  /**
   * Show race preparation loading
   */
  async showRacePreparation() {
    const steps = [
      'Generating race field...',
      'Assigning starting positions...',
      'Checking weather conditions...',
      'Preparing track surface...',
      'Final equipment checks...'
    ];

    for (let i = 0; i < steps.length; i++) {
      this.showProgress(steps.length, i + 1, steps[i]);
      await this.delay(300 + Math.random() * 200); // Varied timing
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log('');
      console.log(chalk.green.bold('🏁 Race ready to begin!'));
    }
    await this.delay(500);
  }

  /**
   * Show save/load operations
   */
  async showSaveOperation(filename) {
    const steps = [
      'Serializing game data...',
      'Compressing save file...',
      'Writing to disk...',
      'Verifying save integrity...'
    ];

    for (let i = 0; i < steps.length; i++) {
      this.showProgress(steps.length, i + 1, steps[i]);
      await this.delay(200 + Math.random() * 100);
    }

    console.log('');
    console.log(chalk.green.bold(`💾 Saved as ${filename}`));
    console.log('');
    console.log(chalk.yellow('Press ENTER to return to game...'));
    
    // Wait for user input to continue
    await new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  async showLoadOperation(filename) {
    const steps = [
      'Reading save file...',
      'Decompressing data...',
      'Validating save integrity...',
      'Restoring game state...'
    ];

    for (let i = 0; i < steps.length; i++) {
      this.showProgress(steps.length, i + 1, steps[i]);
      await this.delay(200 + Math.random() * 100);
    }

    console.log('');
    console.log(chalk.green.bold(`📂 Loaded ${filename}`));
    await this.delay(600);
  }

  /**
   * Spinning loader animation
   */
  startSpinner(message = 'Loading...') {
    if (this.activeLoader) {
      this.stopSpinner();
    }

    console.clear();
    console.log('===============================================');
    console.log('           HORSE RACING TEXT GAME            ');
    console.log('===============================================');
    console.log('');

    this.activeLoader = setInterval(() => {
      const spinner = this.loadingChars[this.currentFrame];
      console.log(`\r${chalk.cyan(spinner)} ${message}`);
      this.currentFrame = (this.currentFrame + 1) % this.loadingChars.length;
    }, 100);
  }

  stopSpinner() {
    if (this.activeLoader) {
      clearInterval(this.activeLoader);
      this.activeLoader = null;
      this.currentFrame = 0;
    }
  }

  /**
   * Quick loading flash for instant operations
   */
  async quickFlash(message, duration = 300) {
    console.log(chalk.yellow.bold(`⚡ ${message}`));
    await this.delay(duration);
  }

  /**
   * Error loading state
   */
  showError(message, duration = 2000) {
    console.clear();
    console.log('===============================================');
    console.log('           HORSE RACING TEXT GAME            ');
    console.log('===============================================');
    console.log('');
    console.log(chalk.red.bold('❌ ERROR'));
    console.log('');
    console.log(chalk.red(message));
    console.log('');
    console.log(chalk.gray('Press any key to continue...'));
    
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * Success confirmation
   */
  async showSuccess(message, duration = 1000) {
    console.log('');
    console.log(chalk.green.bold(`✅ ${message}`));
    console.log('');
    await this.delay(duration);
  }

  /**
   * Typewriter effect for important messages
   */
  async typewriter(text, speed = 50) {
    for (let i = 0; i < text.length; i++) {
      process.stdout.write(text[i]);
      await this.delay(speed);
    }
    console.log(''); // New line after typing
  }

  /**
   * Dramatic pause for race moments
   */
  async dramaticPause(message, dots = 3, speed = 500) {
    process.stdout.write(message);
    
    for (let i = 0; i < dots; i++) {
      await this.delay(speed);
      process.stdout.write('.');
    }
    
    console.log(''); // New line
    await this.delay(200);
  }

  /**
   * Race countdown
   */
  async raceCountdown() {
    const countdowns = ['3', '2', '1', 'GO!'];
    
    for (const count of countdowns) {
      console.clear();
      console.log('');
      console.log('');
      console.log(chalk.yellow.bold(`     ${count}`));
      console.log('');
      
      if (count === 'GO!') {
        console.log(chalk.green.bold('     🏁 RACE START! 🏁'));
        await this.delay(800);
      } else {
        await this.delay(1000);
      }
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up any active loaders
   */
  cleanup() {
    if (this.activeLoader) {
      this.stopSpinner();
    }
  }
}

module.exports = LoadingStates;