# Horse Racing API Documentation

## Overview

The **Horse Racing API** provides a complete game engine interface for building horse racing simulation games. This API separates game mechanics from user interfaces, allowing developers to create console, web, mobile, or custom interfaces that all consume the same underlying game engine.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Console UI    │    │    Web UI       │    │   Mobile UI     │
│   Adapter       │    │    Adapter      │    │   Adapter       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │     Horse Racing API        │
                    │      (GameEngine)           │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │      Game Systems           │
                    │  • Character Management     │
                    │  • Training System          │
                    │  • Race Simulation          │
                    │  • Specialization System    │
                    │  • Save/Load System         │
                    └─────────────────────────────┘
```

## Core API Classes

### GameEngine
**Main API interface providing all game functionality**

```javascript
const { GameEngine } = require('horse-racing-game');
const engine = new GameEngine();
```

### ConsoleUIAdapter  
**Reference implementation for terminal interfaces**

```javascript
const { ConsoleUIAdapter } = require('horse-racing-game');
const adapter = new ConsoleUIAdapter();
```

---

## API Methods

### Initialization

#### `async initialize()`
Initialize the game engine and all subsystems.

**Returns:** `{success: boolean, sessionId: string, version: string}`

```javascript
const result = await engine.initialize();
if (result.success) {
  console.log(`Game initialized: ${result.sessionId}`);
}
```

---

### Game State

#### `getGameState()`
Get current complete game state.

**Returns:** `{phase, character, turn, maxTurns, nextRace, availableActions}`

```javascript
const state = engine.getGameState();
console.log(`Turn ${state.turn}/${state.maxTurns}`);
console.log(`Available actions: ${state.availableActions}`);
```

---

### Character Management

#### `async createCharacter(name)`
Create new character and start career.

**Parameters:**
- `name` (string): Character name (1-20 characters)

**Returns:** `{success: boolean, character: Object, career: Object}`

```javascript
const result = await engine.createCharacter("Thunder Strike");
if (result.success) {
  console.log(`Character created: ${result.character.name}`);
}
```

#### `async createSpecializedCharacter(name, options)`
Create character with breed and racing style selection.

**Parameters:**
- `name` (string): Character name  
- `options` (object): `{breed: string, racingStyle: string}`

**Returns:** `{success: boolean, character: Object, specialization: Object}`

```javascript
const result = await engine.createSpecializedCharacter("Lightning Bolt", {
  breed: "QUARTER_HORSE",
  racingStyle: "FRONT_RUNNER"
});
```

---

### Training System

#### `async performTraining(trainingType)`
Perform training action and advance turn.

**Parameters:**  
- `trainingType` (string): `'speed'`, `'stamina'`, `'power'`, `'rest'`, `'media'`

**Returns:** `{success: boolean, result: Object, gameState: Object}`

```javascript
const result = await engine.performTraining('speed');
if (result.success) {
  console.log(`Speed training completed!`);
  console.log(`New stats: ${JSON.stringify(result.gameState.character.stats)}`);
}
```

**Training Types:**
- **`speed`**: Increases sprint performance (Cost: 15 energy)
- **`stamina`**: Increases race endurance (Cost: 10 energy)  
- **`power`**: Increases acceleration (Cost: 15 energy)
- **`rest`**: Restores energy (Gain: 30 energy)
- **`media`**: Builds relationships + energy (Gain: 15 energy)

---

### Racing System

#### `async startRace(strategy)`
Start race with chosen strategy.

**Parameters:**
- `strategy` (string): `'FRONT'`, `'MID'`, `'LATE'`

**Returns:** `{success: boolean, raceResult: Object, gameState: Object}`

```javascript
const result = await engine.startRace('FRONT');
if (result.success) {
  console.log(`Finished ${result.raceResult.placement}!`);
}
```

**Racing Strategies:**
- **`FRONT`**: Lead from start (high speed/power requirement)
- **`MID`**: Balanced approach (versatile, moderate requirements)
- **`LATE`**: Save energy for late kick (high stamina requirement)

---

### Specialization System

#### `getAvailableBreeds()`
Get all available horse breeds.

**Returns:** `{success: boolean, breeds: Array}`

```javascript
const result = engine.getAvailableBreeds();
result.breeds.forEach(breed => {
  console.log(`${breed.name}: ${breed.description}`);
});
```

#### `getAvailableRacingStyles()`
Get all available racing styles.

**Returns:** `{success: boolean, styles: Array}`

```javascript
const result = engine.getAvailableRacingStyles();
```

#### `getBreedRecommendations(stats)`
Get breed recommendations for given stats.

**Parameters:**
- `stats` (object): `{speed: number, stamina: number, power: number}`

**Returns:** `{success: boolean, recommendations: Array}`

```javascript
const recommendations = engine.getBreedRecommendations({
  speed: 75, stamina: 60, power: 80
});
```

#### `getCharacterSpecialization()`
Get current character's specialization info.

**Returns:** `{success: boolean, specialization: Object, trainingAdvice: string}`

---

### Utility Methods

#### `generateNames(count)`
Generate horse name suggestions.

**Parameters:**
- `count` (number): Number of names (default: 6)

**Returns:** `{success: boolean, names: Array}`

```javascript
const result = engine.generateNames(5);
console.log(`Suggestions: ${result.names.join(', ')}`);
```

---

### Save System

#### `async saveGame()`
Save current game state.

**Returns:** `{success: boolean, message: string}`

#### `async loadGame(slotIndex)`
Load game from save slot.

**Parameters:**
- `slotIndex` (number): Save slot index (0-based)

**Returns:** `{success: boolean, character: Object, gameState: Object}`

#### `async getAvailableSaves()`
Get list of available save files.

**Returns:** `{success: boolean, saves: Array}`

---

## Events System

The GameEngine uses an event-driven architecture. Listen to events for real-time updates:

### Character Events
```javascript
engine.on('character:created', (data) => {
  console.log(`Character ${data.character.name} created!`);
});

engine.on('character:error', (data) => {
  console.error(`Character error: ${data.error}`);
});
```

### Training Events  
```javascript
engine.on('training:completed', (data) => {
  console.log(`${data.type} training completed!`);
  console.log(`New stats: ${JSON.stringify(data.newStats)}`);
});

engine.on('training:failed', (data) => {
  console.error(`Training failed: ${data.error}`);
});
```

### Race Events
```javascript
engine.on('race:ready', (data) => {
  console.log(`Race ready: ${data.race.name}`);
});

engine.on('race:completed', (data) => {
  console.log(`Race finished! Placed ${data.result.placement}`);
});
```

### System Events
```javascript
engine.on('engine:initialized', (data) => {
  console.log(`Engine ready: ${data.sessionId}`);
});

engine.on('save:completed', () => {
  console.log('Game saved!');
});

engine.on('warning:added', (data) => {
  console.warn(data.message);
});
```

---

## Data Structures

### Character Object
```javascript
{
  name: "Thunder Strike",
  stats: {
    speed: 45,    // 1-100 scale
    stamina: 38,  // 1-100 scale  
    power: 42     // 1-100 scale
  },
  condition: {
    energy: 85,   // 0-100 current energy
    form: "good"  // excellent/good/normal/poor/terrible
  },
  career: {
    turn: 5,         // Current turn
    racesWon: 1,     // Races won
    racesRun: 2      // Total races completed
  }
}
```

### Race Result Object
```javascript
{
  placement: 2,           // Final placement (1st, 2nd, etc.)
  raceName: "Royal Stakes",
  distance: 1600,
  surface: "DIRT",
  strategy: "FRONT",
  prize: 2500,           // Prize money won
  time: "1:38.45",       // Race time
  performance: 78        // Performance score
}
```

### Specialization Object
```javascript
{
  breed: {
    name: "Quarter Horse",
    rarity: "UNCOMMON",
    characteristics: ["Explosive early speed", "Sprint specialist"]
  },
  racingStyle: {
    name: "Front Runner", 
    advantages: ["Controls pace", "Avoids traffic"],
    risks: ["Vulnerable to closers", "High energy usage"]
  },
  preferredConditions: {
    surface: "DIRT",
    distance: "SPRINT",
    strategy: "FRONT"
  }
}
```

---

## Error Handling

All API methods return standardized result objects:

### Success Response
```javascript
{
  success: true,
  // ... method-specific data
}
```

### Error Response  
```javascript
{
  success: false,
  error: "Error message explaining what went wrong"
}
```

### Common Errors
- `"Game engine not initialized"` - Call `initialize()` first
- `"No active character"` - Create character before training/racing
- `"Not enough energy!"` - Character needs rest before training
- `"Invalid input provided"` - Check parameter validation

---

## Usage Examples

### Complete Game Flow
```javascript
const { GameEngine } = require('horse-racing-game');

async function playGame() {
  const engine = new GameEngine();
  
  // Initialize
  await engine.initialize();
  
  // Create character
  const character = await engine.createCharacter("My Horse");
  
  // Training loop
  for (let turn = 1; turn <= 12; turn++) {
    const state = engine.getGameState();
    
    if (state.nextRace && state.turn >= state.nextRace.scheduledTurn) {
      // Race time!
      const raceResult = await engine.startRace('MID');
      console.log(`Race result: ${raceResult.raceResult.placement}`);
    } else {
      // Training
      const training = await engine.performTraining('speed');
      console.log(`Training complete: ${training.success}`);
    }
  }
  
  // Final state
  const finalState = engine.getGameState();
  console.log(`Career complete! Final stats: ${JSON.stringify(finalState.character.stats)}`);
}

playGame().catch(console.error);
```

### Custom UI Integration
```javascript
class CustomUIAdapter {
  constructor() {
    this.engine = new GameEngine();
    this.setupEventHandlers();
  }
  
  async initialize() {
    await this.engine.initialize();
    this.render();
  }
  
  setupEventHandlers() {
    this.engine.on('training:completed', (data) => {
      this.showTrainingResult(data);
    });
    
    this.engine.on('race:completed', (data) => {
      this.showRaceResult(data);  
    });
  }
  
  async handleTrainingInput(trainingType) {
    const result = await this.engine.performTraining(trainingType);
    if (!result.success) {
      this.showError(result.error);
    }
  }
  
  render() {
    const state = this.engine.getGameState();
    // Custom UI rendering logic here
  }
}
```

---

## Distribution

### Standalone Executables
Pre-built executables available for direct download:

- **Windows**: `horse-racing-game-win.exe` 
- **macOS**: `horse-racing-game-macos`
- **Linux**: `horse-racing-game-linux`

### NPM Installation
```bash
npm install -g horse-racing-game
horse-racing-game --help
```

### Command Line Options
```bash
horse-racing-game                    # Start normally
horse-racing-game --no-splash       # Skip splash screen
horse-racing-game --quick-start     # Create test character automatically  
horse-racing-game --debug           # Enable debug mode
horse-racing-game --version         # Show version info
horse-racing-game --help            # Show help
```

---

## Technical Specifications

- **Node.js**: v14+ required for development
- **Engine**: Event-driven, async/await based
- **Storage**: JSON file-based saves (no database required)
- **Performance**: O(1) input handling, efficient state management
- **Memory**: Minimal footprint, proper cleanup on exit
- **Cross-platform**: Windows, macOS, Linux support

---

## Version Information

- **API Version**: 1.0
- **Game Version**: 1.0.0
- **Documentation**: v1.0
- **Last Updated**: August 28, 2025