/**
 * Input Simulator - Simulates physical user input devices
 * Mimics keyboard and mouse interactions for comprehensive UI testing
 */

class InputSimulator {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.keyDelay = 50; // ms between key presses
    this.mouseDelay = 100; // ms between mouse clicks
  }

  /**
   * Simulate typing a string character by character
   * @param {string} text - Text to type
   * @param {number} delay - Delay between characters (ms)
   */
  async typeText(text, delay = this.keyDelay) {
    for (const char of text) {
      await this.simulateKeyPress(char);
      await this.wait(delay);
    }
  }

  /**
   * Simulate a single key press
   * @param {string} key - Key to press (e.g., 'a', 'enter', 'escape')
   */
  async simulateKeyPress(key) {
    return new Promise((resolve) => {
      // Normalize key names
      const normalizedKey = this.normalizeKey(key);
      
      // Simulate the key event through the game app
      if (this.gameApp && this.gameApp.handleKeyInput) {
        const result = this.gameApp.handleKeyInput(normalizedKey);
        resolve(result);
      } else {
        resolve({ success: false, message: 'No game app available' });
      }
    });
  }

  /**
   * Simulate mouse click at coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} button - Mouse button ('left', 'right', 'middle')
   */
  async simulateMouseClick(x, y, button = 'left') {
    return new Promise((resolve) => {
      // Mock mouse event
      const mouseEvent = {
        x,
        y,
        button,
        type: 'click'
      };

      // For blessed components, simulate element interaction
      if (this.gameApp && this.gameApp.ui && this.gameApp.ui.components) {
        const targetComponent = this.findComponentAt(x, y);
        if (targetComponent && targetComponent.emit) {
          targetComponent.emit('click', mouseEvent);
        }
      }

      resolve({ success: true, event: mouseEvent });
    });
  }

  /**
   * Simulate filling out a form field (textbox)
   * @param {string} text - Text to enter
   * @param {boolean} submit - Whether to submit after typing
   */
  async fillTextbox(text, submit = true) {
    // Type the text
    await this.typeText(text);
    
    // Submit if requested
    if (submit) {
      await this.simulateKeyPress('enter');
    }
  }

  /**
   * Simulate navigating a menu with arrow keys
   * @param {string} direction - Direction to move ('up', 'down', 'left', 'right')
   * @param {number} steps - Number of steps to move
   */
  async navigateMenu(direction, steps = 1) {
    const keyMap = {
      up: 'up',
      down: 'down', 
      left: 'left',
      right: 'right'
    };

    const key = keyMap[direction];
    if (!key) {
      throw new Error(`Invalid direction: ${direction}`);
    }

    for (let i = 0; i < steps; i++) {
      await this.simulateKeyPress(key);
      await this.wait(this.keyDelay);
    }
  }

  /**
   * Simulate selecting a menu option by number
   * @param {number} option - Option number (1-based)
   */
  async selectMenuOption(option) {
    await this.simulateKeyPress(option.toString());
  }

  /**
   * Wait for a specified duration
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulate a complete character creation flow
   * @param {string} characterName - Name for the character
   */
  async createCharacterFlow(characterName) {
    // Navigate to character creation
    await this.selectMenuOption(1);
    await this.wait(100);

    // Fill in character name
    await this.fillTextbox(characterName, true);
    await this.wait(100);

    return {
      success: true,
      characterName,
      character: this.gameApp.game?.character
    };
  }

  /**
   * Simulate a complete training session
   * @param {Array<string>} trainingTypes - Sequence of training types
   */
  async trainingFlow(trainingTypes) {
    const results = [];
    
    for (const trainingType of trainingTypes) {
      const trainingMap = {
        speed: '1',
        stamina: '2', 
        power: '3',
        rest: '4',
        social: '5'
      };

      const key = trainingMap[trainingType];
      if (key) {
        await this.simulateKeyPress(key);
        await this.wait(this.keyDelay);
        
        results.push({
          type: trainingType,
          success: true,
          stats: this.gameApp.game?.character?.stats
        });
      }
    }

    return results;
  }

  /**
   * Simulate completing all races
   */
  async completeRacesFlow() {
    const results = [];
    
    // Keep pressing enter to progress through races
    while (this.gameApp.currentState === 'race_results') {
      await this.simulateKeyPress('enter');
      await this.wait(100);
      
      results.push({
        state: this.gameApp.currentState,
        raceResults: this.gameApp.game?.getRaceResults()?.length || 0
      });

      // Safety break to prevent infinite loops
      if (results.length > 10) break;
    }

    return results;
  }

  /**
   * Simulate a complete game playthrough
   * @param {string} characterName - Character name
   * @param {Array<string>} trainingSequence - Training sequence
   */
  async fullGamePlaythrough(characterName, trainingSequence) {
    const playthrough = {
      steps: [],
      success: false,
      finalState: null,
      character: null
    };

    try {
      // Step 1: Create character
      const creation = await this.createCharacterFlow(characterName);
      playthrough.steps.push({ step: 'character_creation', result: creation });

      // Step 2: Training
      const training = await this.trainingFlow(trainingSequence);
      playthrough.steps.push({ step: 'training', result: training });

      // Step 3: Racing
      const racing = await this.completeRacesFlow();
      playthrough.steps.push({ step: 'racing', result: racing });

      playthrough.success = true;
      playthrough.finalState = this.gameApp.currentState;
      playthrough.character = this.gameApp.game?.character;

    } catch (error) {
      playthrough.error = error.message;
    }

    return playthrough;
  }

  /**
   * Normalize key names for cross-platform compatibility
   * @private
   */
  normalizeKey(key) {
    const keyMap = {
      'return': 'enter',
      'esc': 'escape',
      ' ': 'space'
    };

    return keyMap[key] || key;
  }

  /**
   * Find UI component at coordinates (simplified for blessed)
   * @private
   */
  findComponentAt(x, y) {
    // Simplified component finding - in real implementation
    // this would check blessed component bounds
    if (this.gameApp.ui && this.gameApp.ui.components) {
      return this.gameApp.ui.components.mainBox;
    }
    return null;
  }
}

module.exports = InputSimulator;