# Modular Architecture for Platform Independence

## Overview
This document outlines the modular architecture design to decouple the core game system from the terminal UI, enabling deployment across multiple platforms (terminal, web, mobile native, etc.).

## Core Principles

### 1. Separation of Concerns
- **Game Core**: Pure business logic, no UI dependencies
- **Platform Adapters**: Interface implementations for specific platforms
- **Shared Interfaces**: Common contracts between core and adapters

### 2. Platform Independence
- Core game logic is platform-agnostic
- UI/presentation layer is pluggable
- Data persistence is abstracted
- Input/output is abstracted through interfaces

### 3. Modular Design
- Each system is self-contained with clear boundaries
- Systems communicate through well-defined interfaces
- Easy to test, maintain, and extend

## Architecture Layers

```
┌─────────────────────────────────────────┐
│             Platform Layer              │
├─────────────────┬───────────────────────┤
│   Terminal UI   │   Web UI   │ Native  │
├─────────────────┼────────────┼─────────┤
│             Interface Layer             │
├─────────────────────────────────────────┤
│              Game Core                  │
├─────────────────────────────────────────┤
│              Data Layer                 │
└─────────────────────────────────────────┘
```

## Proposed Structure

```
src/
├── core/                    # Platform-agnostic game logic
│   ├── GameEngine.js        # Main game controller
│   ├── models/              # Game entities
│   │   ├── Character.js
│   │   ├── NPHRoster.js
│   │   └── RaceSystem.js
│   ├── systems/             # Business logic systems
│   │   ├── TrainingSystem.js
│   │   ├── RaceEngine.js
│   │   └── SaveSystem.js
│   └── data/                # Game configuration
│       ├── raceTypes.js
│       └── gameConfig.js
├── interfaces/              # Contracts and abstractions
│   ├── IRenderer.js         # UI rendering interface
│   ├── IInputHandler.js     # Input handling interface
│   ├── IDataStore.js        # Data persistence interface
│   └── ILoadingStates.js    # Loading/progress interface
├── adapters/                # Platform-specific implementations
│   ├── terminal/            # Terminal/CLI implementation
│   │   ├── TerminalRenderer.js
│   │   ├── TerminalInput.js
│   │   ├── TerminalLoader.js
│   │   └── FileDataStore.js
│   ├── web/                 # Future web implementation
│   │   ├── WebRenderer.js
│   │   ├── WebInput.js
│   │   └── BrowserStore.js
│   └── native/              # Future native implementation
├── platforms/               # Platform entry points
│   ├── terminal/
│   │   └── index.js         # Terminal app launcher
│   ├── web/
│   │   └── index.js         # Web app launcher
│   └── shared/
│       └── GameFactory.js   # Platform-aware game factory
└── utils/                   # Shared utilities
    ├── calculations.js
    └── validators.js
```

## Core Interfaces

### IRenderer Interface
```javascript
/**
 * Platform-agnostic rendering interface
 */
class IRenderer {
  async renderGameState(state) { throw new Error('Not implemented'); }
  async renderCharacterStats(character) { throw new Error('Not implemented'); }
  async renderRacePreview(raceInfo, field) { throw new Error('Not implemented'); }
  async renderRaceResults(results) { throw new Error('Not implemented'); }
  async renderTrainingOptions(options) { throw new Error('Not implemented'); }
  async showMessage(message, type = 'info') { throw new Error('Not implemented'); }
  async clear() { throw new Error('Not implemented'); }
}
```

### IInputHandler Interface
```javascript
/**
 * Platform-agnostic input handling interface
 */
class IInputHandler {
  async getTextInput(prompt, validation) { throw new Error('Not implemented'); }
  async getChoice(prompt, options) { throw new Error('Not implemented'); }
  async getConfirmation(prompt) { throw new Error('Not implemented'); }
  async waitForKeyPress() { throw new Error('Not implemented'); }
  onKeyPress(callback) { throw new Error('Not implemented'); }
}
```

### IDataStore Interface
```javascript
/**
 * Platform-agnostic data persistence interface
 */
class IDataStore {
  async save(key, data) { throw new Error('Not implemented'); }
  async load(key) { throw new Error('Not implemented'); }
  async exists(key) { throw new Error('Not implemented'); }
  async delete(key) { throw new Error('Not implemented'); }
  async list() { throw new Error('Not implemented'); }
}
```

### ILoadingStates Interface
```javascript
/**
 * Platform-agnostic loading/progress interface
 */
class ILoadingStates {
  async showProgress(message, progress) { throw new Error('Not implemented'); }
  async showSpinner(message) { throw new Error('Not implemented'); }
  async hideLoading() { throw new Error('Not implemented'); }
  async showTransition(fromState, toState) { throw new Error('Not implemented'); }
}
```

## Game Core Refactor

### GameEngine (Platform-Agnostic)
```javascript
class GameEngine {
  constructor(renderer, inputHandler, dataStore, loadingStates) {
    this.renderer = renderer;
    this.input = inputHandler;
    this.dataStore = dataStore;
    this.loading = loadingStates;
    
    // Core systems
    this.character = null;
    this.nphRoster = null;
    this.trainingSystem = new TrainingSystem();
    this.raceEngine = new RaceEngine();
  }
  
  async startNewGame(characterName) {
    await this.loading.showProgress('Creating character...', 0.2);
    this.character = new Character(characterName);
    
    await this.loading.showProgress('Generating rivals...', 0.5);
    this.nphRoster = new NPHRoster();
    this.nphRoster.generateRoster(this.character, 24);
    
    await this.loading.showProgress('Game ready!', 1.0);
    return { success: true };
  }
  
  async performTraining(type) {
    const result = this.trainingSystem.train(this.character, type);
    this.nphRoster.progressNPHs(this.character.career.turn);
    
    await this.renderer.renderCharacterStats(this.character.getSummary());
    return result;
  }
  
  async runRace(raceInfo, strategy) {
    await this.renderer.renderRacePreview(raceInfo, this.getRaceField(raceInfo));
    const strategy = await this.input.getChoice('Select strategy:', ['FRONT', 'MID', 'LATE']);
    
    await this.loading.showProgress('Race starting...', 0.8);
    const results = await this.raceEngine.runEnhancedRace(raceInfo, strategy);
    
    await this.renderer.renderRaceResults(results);
    return results;
  }
  
  // ... other core methods without UI dependencies
}
```

## Platform Implementations

### Terminal Adapter
```javascript
// adapters/terminal/TerminalRenderer.js
const blessed = require('blessed');
const chalk = require('chalk');

class TerminalRenderer extends IRenderer {
  constructor() {
    super();
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Uma Musume Text Clone'
    });
  }
  
  async renderGameState(state) {
    // Terminal-specific rendering using blessed
  }
  
  async renderCharacterStats(character) {
    // ASCII progress bars and blessed components
  }
  
  async renderRacePreview(raceInfo, field) {
    // Terminal race preview layout
  }
  
  // ... other terminal-specific rendering
}

// adapters/terminal/TerminalInput.js
class TerminalInput extends IInputHandler {
  async getTextInput(prompt, validation) {
    // Use inquirer or blessed input
  }
  
  async getChoice(prompt, options) {
    // Terminal choice menu
  }
}
```

### Web Adapter (Future)
```javascript
// adapters/web/WebRenderer.js
class WebRenderer extends IRenderer {
  constructor(domContainer) {
    super();
    this.container = domContainer;
  }
  
  async renderGameState(state) {
    // React/Vue/HTML rendering
  }
  
  async renderCharacterStats(character) {
    // HTML progress bars and styled components
  }
  
  // ... other web-specific rendering
}

// adapters/web/WebInput.js
class WebInput extends IInputHandler {
  async getTextInput(prompt, validation) {
    // HTML form inputs, modal dialogs
  }
  
  async getChoice(prompt, options) {
    // Button groups, dropdown menus
  }
}
```

## Platform Factory

### GameFactory
```javascript
// platforms/shared/GameFactory.js
class GameFactory {
  static createGame(platform, options = {}) {
    switch (platform) {
      case 'terminal':
        return this.createTerminalGame(options);
      case 'web':
        return this.createWebGame(options);
      case 'native':
        return this.createNativeGame(options);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  static createTerminalGame(options) {
    const renderer = new TerminalRenderer(options);
    const input = new TerminalInput(options);
    const dataStore = new FileDataStore('./data/saves');
    const loading = new TerminalLoader(renderer);
    
    return new GameEngine(renderer, input, dataStore, loading);
  }
  
  static createWebGame(options) {
    const renderer = new WebRenderer(options.container);
    const input = new WebInput(options.container);
    const dataStore = new BrowserStore();
    const loading = new WebLoader(renderer);
    
    return new GameEngine(renderer, input, dataStore, loading);
  }
}
```

## Migration Strategy

### Phase 1: Interface Definition
1. Define all core interfaces (IRenderer, IInputHandler, etc.)
2. Create base abstract classes
3. Document contracts and expected behaviors

### Phase 2: Core Extraction
1. Extract pure game logic from existing systems
2. Remove direct UI dependencies from core systems
3. Create GameEngine as main coordinator

### Phase 3: Terminal Adapter
1. Implement terminal-specific adapters
2. Migrate existing blessed/inquirer code
3. Test terminal implementation thoroughly

### Phase 4: Platform Factory
1. Create factory system for platform selection
2. Update entry points to use factory
3. Ensure backward compatibility

### Phase 5: Additional Platforms
1. Implement web adapters (HTML/CSS/JS)
2. Create native adapters (React Native, Electron)
3. Test cross-platform compatibility

## Benefits

### 1. Platform Independence
- Same game logic runs everywhere
- Easy to add new platforms
- Consistent gameplay across platforms

### 2. Maintainability
- Clear separation of concerns
- Easier testing (mock interfaces)
- Reduced coupling between systems

### 3. Scalability
- Platform-specific optimizations
- Independent deployment
- Team specialization (core vs UI)

### 4. User Experience
- Native feel on each platform
- Platform-appropriate interactions
- Consistent game state/progress

## Testing Strategy

### Core System Tests
- Unit tests for pure game logic
- Mock all interface dependencies
- Test game state transitions

### Adapter Tests
- Test each platform adapter independently
- Mock core game engine
- Test platform-specific behaviors

### Integration Tests
- Test complete workflows
- Test cross-platform save compatibility
- Performance testing per platform

## Implementation Priority

1. **High Priority**: Terminal adapter (maintain current functionality)
2. **Medium Priority**: Web adapter (expand user base)
3. **Low Priority**: Native mobile adapter (future expansion)

This modular architecture ensures the game core remains pure and reusable while providing excellent platform-specific user experiences.