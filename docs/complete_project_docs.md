# Uma Musume Text-Based Clone - Complete Documentation

A comprehensive guide for building a terminal-based horse racing simulation game inspired by Uma Musume Pretty Derby.

---

## Table of Contents

1. [Project Overview & Setup](#project-overview--setup)
2. [Development Guide](#development-guide)
3. [Testing Framework](#testing-framework)
4. [Development Journey](#development-journey)
5. [Task Management](#task-management)
6. [Project History](#project-history)
7. [AI Context Reference](#ai-context-reference)

---

# Project Overview & Setup

## Quick Start

```bash
# Install dependencies
npm install

# Run the game
npm start

# Run in development mode
npm run dev
```

## Game Overview

**Core Loop** (15-minute sessions):
1. **Setup** - Pick horse + bonuses from previous runs
2. **Training** - 12 turns of strategic choices
3. **Racing** - Watch 3-4 automated race results
4. **Legacy** - Earn bonuses for next run

## Technical Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| UI | Terminal (`blessed` library) |
| Storage | JSON files |
| Language | JavaScript |

## Game Mechanics

### Stats System
- **Speed** (1-100): Sprint performance in final stretch
- **Stamina** (1-100): Endurance/"HP pool" for races
- **Power** (1-100): Acceleration ability

### Training Options
| Training Type | Energy Cost | Primary Gain |
|---------------|-------------|--------------|
| Speed Training | 15 | +Speed |
| Stamina Training | 10 | +Stamina |
| Power Training | 15 | +Power |
| Rest Day | -30 | Energy recovery |
| Social Time | 5 | Friendship building |

### Race Calculation
```javascript
Performance = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
Final_Result = Performance × Stamina_Factor × Random_Variance
```

## Project Structure

```
uma-musume-clone/
├── package.json
├── jest.config.js          # Jest testing configuration
├── src/
│   ├── app.js              # Game entry point
│   ├── models/             # Data models
│   │   ├── Character.js    # Horse stats & data
│   │   ├── Training.js     # Training mechanics
│   │   └── Race.js         # Race simulation
│   ├── systems/            # Core game systems
│   │   ├── GameLoop.js     # Turn management
│   │   ├── UI.js           # Terminal interface
│   │   └── SaveSystem.js   # Save/load functionality
│   ├── data/               # Game data
│   │   ├── horses.json     # Starting horse templates
│   │   ├── races.json      # Race schedules
│   │   └── saves/          # Player save files
│   └── utils/              # Helper functions
│       └── calculations.js # Game formulas
├── tests/
│   ├── unit/               # Individual function tests
│   ├── integration/        # Full game flow tests
│   ├── balance/            # Game balance validation
│   └── helpers/            # Testing utilities
└── docs/
    ├── README.md
    ├── TESTING.md          # Testing guide & examples
    └── *.md                # Other documentation
```

## Dependencies

### Core Dependencies
```json
{
  "blessed": "^0.1.81",      // Terminal UI framework
  "chalk": "^5.3.0",         // Terminal text colors
  "inquirer": "^9.2.11",     // Interactive prompts
  "commander": "^11.1.0"     // CLI argument parsing
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1",       // Auto-restart during development
  "jest": "^29.7.0"          // Testing framework
}
```

## Key Features

### ✅ Phase 1 (MVP)
- Basic horse creation
- Simple training system
- Stat progression
- Race simulation
- Terminal menus

### 🚧 Phase 2 (Core)
- Energy & mood systems
- Friendship mechanics
- Race variety
- Save/load system
- Legacy progression

### 📋 Phase 3 (Polish)
- ASCII progress bars
- Better UI layouts
- Achievement system
- Balance testing

## Game Balance

| Aspect | Target |
|--------|--------|
| Session Length | 10-15 minutes |
| Training Turns | 8-12 per career |
| Stat Range | 1-100 (simple scale) |
| Race Outcome | 60% skill, 40% random |
| Energy System | 100 max, costs 10-20 |

## Controls

| Key | Action |
|-----|--------|
| `1-5` | Training options |
| `r` | Race schedule |
| `s` | Save game |
| `l` | Load game |
| `q` | Quit game |
| `h` | Help/controls |

## Development

```bash
# Start development server
npm run dev

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run balance tests only
npm run test:balance

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Testing

### Test Categories
| Type | Purpose | Location |
|------|---------|----------|
| **Unit** | Individual function tests | `tests/unit/` |
| **Integration** | Full game flow tests | `tests/integration/` |
| **Balance** | Game balance validation | `tests/balance/` |

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test training.test.js

# Watch mode for development
npm run test:watch

# Balance testing
npm run test:balance
```

### Test Coverage Goals
- **Core mechanics**: 90%+ coverage
- **Game logic**: 80%+ coverage  
- **UI components**: 60%+ coverage

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

MIT License - see LICENSE file for details

## Credits

Inspired by Uma Musume Pretty Derby by Cygames. This is a fan project and not affiliated with the original game.

---

# Development Guide

## Testing Framework

### Quick Start

```bash
# Install testing dependencies
npm install --save-dev jest nodemon

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run specific test category
npm run test:balance
```

### Test Structure

```
tests/
├── unit/                   # Individual function tests
│   ├── training.test.js    # Training calculation tests
│   ├── racing.test.js      # Race simulation tests
│   ├── character.test.js   # Character mechanic tests
│   └── saveload.test.js    # Save/load functionality
├── integration/            # Full game flow tests
│   ├── gameloop.test.js    # Complete career runs
│   ├── ui.test.js          # Terminal interface tests
│   └── progression.test.js # Multi-run progression
├── balance/                # Game balance validation
│   ├── statProgression.test.js # Training curve validation
│   ├── raceOutcomes.test.js    # Race fairness testing
│   └── economy.test.js         # Resource balance
└── helpers/                # Testing utilities
    ├── mockData.js         # Test fixtures
    ├── testRunner.js       # Custom test runners
    └── assertions.js       # Custom assertions
```

### Jest Configuration

Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/data/**',
    '!src/**/*.config.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true
};
```

### Unit Test Examples

#### Training System Tests
```javascript
// tests/unit/training.test.js
const { TrainingSystem } = require('../../src/systems/TrainingSystem');

describe('Training System', () => {
  let trainingSystem;
  let mockCharacter;

  beforeEach(() => {
    trainingSystem = new TrainingSystem();
    mockCharacter = {
      stats: { speed: 50, stamina: 60, power: 40 },
      condition: { mood: 'good', energy: 80 },
      growthRates: { speed: 'A', stamina: 'B', power: 'C' }
    };
  });

  test('speed training increases speed stat', () => {
    const initialSpeed = mockCharacter.stats.speed;
    const gain = trainingSystem.calculateTrainingGain(mockCharacter, 'speed');
    
    expect(gain).toBeGreaterThan(0);
    expect(gain).toBeLessThan(20); // Reasonable upper bound
  });
});
```

#### Race Simulation Tests
```javascript
// tests/unit/racing.test.js
const { RaceSimulator } = require('../../src/systems/RaceSimulator');

describe('Race Simulation', () => {
  test('higher stats lead to better performance', () => {
    const strongHorse = {
      character: { stats: { speed: 90, stamina: 90, power: 90 } }
    };
    const weakHorse = {
      character: { stats: { speed: 30, stamina: 30, power: 30 } }
    };

    const mockRace = { track: { distance: 1600, surface: 'turf', condition: 'good' } };
    const raceSimulator = new RaceSimulator();

    const strongPerformance = raceSimulator.calculatePerformance(strongHorse, mockRace);
    const weakPerformance = raceSimulator.calculatePerformance(weakHorse, mockRace);

    expect(strongPerformance).toBeGreaterThan(weakPerformance);
  });
});
```

### Integration Test Examples

#### Game Loop Tests
```javascript
// tests/integration/gameloop.test.js
const { Game } = require('../../src/game/Game');

describe('Game Loop Integration', () => {
  test('complete career run', async () => {
    const game = new Game();
    const character = game.createCharacter('Test Horse');
    
    // Simulate 12 training turns
    for (let turn = 1; turn <= 12; turn++) {
      const trainingChoice = turn % 3 === 0 ? 'rest' : 'speed';
      game.performTraining(trainingChoice);
      game.nextTurn();
    }

    const raceResults = game.runCareerRaces();
    
    expect(raceResults).toHaveLength(3);
    expect(character.stats.speed).toBeGreaterThan(50);
  });
});
```

### Balance Test Examples

#### Stat Progression Validation
```javascript
// tests/balance/statProgression.test.js
describe('Stat Progression Balance', () => {
  test('normal training progression stays within expected ranges', async () => {
    const results = await runProgressionTest({
      turns: 12,
      trainingFocus: 'speed',
      iterations: 100
    });

    const finalSpeeds = results.map(r => r.finalStats.speed);
    const avgFinalSpeed = finalSpeeds.reduce((a, b) => a + b) / finalSpeeds.length;

    expect(avgFinalSpeed).toBeGreaterThan(65);
    expect(avgFinalSpeed).toBeLessThan(85);
  });
});
```

### Testing Utilities

#### Mock Data Helper
```javascript
// tests/helpers/mockData.js
const createTestCharacter = (overrides = {}) => ({
  id: 'test-horse-1',
  name: 'Test Horse',
  stats: { speed: 50, stamina: 50, power: 50 },
  condition: { mood: 'good', energy: 100, health: 100 },
  growthRates: { speed: 'B', stamina: 'B', power: 'B' },
  ...overrides
});

module.exports = { createTestCharacter };
```

### Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Core calculations | 95% |
| Game mechanics | 90% |
| Save/load system | 85% |
| UI components | 60% |
| Overall project | 80% |

---

# Development Journey

## Project Inception
**Date**: August 20, 2025

### Why This Project?
- Love the strategic depth of Uma Musume but want something I can play in terminal
- Perfect for learning Node.js while building something engaging
- Text-based games have a special charm - focus on mechanics over graphics
- Good portfolio piece showing game logic and terminal UI skills

### Initial Challenges
- **Complexity**: Original Uma Musume has 100+ interconnected systems
- **Balance**: Need to capture the addictive "one more run" feeling
- **Scope**: Easy to over-engineer - need to stay focused on MVP

### Key Design Decisions
- **3 stats instead of 5**: Speed, Stamina, Power (dropped Guts & Wisdom)
- **15-minute sessions**: Short enough for quick play, long enough to feel invested
- **Terminal UI**: Using `blessed` library for rich terminal experience
- **JSON storage**: No database complexity for MVP

## Week 1: Foundation Setup

### Day 1 - Project Structure
- Set up basic folder structure
- Decided on Node.js + JavaScript (my comfort zone)
- Researched terminal UI libraries - `blessed` seems perfect
- Created package.json with essential dependencies

**Mood**: Excited but overwhelmed by the scope

### Day 2 - Core Models
- Built Character.js with simplified stat system
- Struggled with deciding stat ranges (1-100 vs 1-2000 like original)
- Went with 1-100 for simplicity
- Created basic Training.js with simple gain calculations

**Learning**: Keep it simple first, add complexity later

### Day 3 - First Training Loop
- Got basic "select training → gain stats → repeat" working
- Feels satisfying even in this basic form!
- Added energy system (100 max, training costs energy)
- Simple but creates resource management decisions

**Victory**: First playable loop achieved! 🎉

## Week 2: Core Mechanics

### Day 4 - Race Simulation
- Built basic race calculation: Performance = weighted stat sum
- Added random variance (±15%) for excitement
- First race results showing - very satisfying to see training pay off
- Need to balance randomness vs skill

**Insight**: Watching results is more fun than I expected

### Day 5 - Terminal UI
- Started with `blessed` library for terminal interface
- Created basic menus and stat displays
- ASCII progress bars using █ and ░ characters
- Terminal colors with `chalk` for better UX

**Challenge**: Terminal UI is trickier than web UI but more rewarding

## Technical Decisions Log

### Why JavaScript/Node.js?
- Comfort zone - I know frontend JS well
- Can focus on game logic instead of learning new language
- Good ecosystem for terminal apps
- Easy to prototype and iterate quickly

### Why Terminal Interface?
- Unique and nostalgic feel
- Forces focus on mechanics over graphics
- Faster development than GUI
- Fits the "concentrated essence" goal

### Why Simplified Stats?
- Original's 5-stat system too complex for MVP
- Speed/Stamina/Power covers core racing needs
- Easier to balance and understand
- Can always add complexity later

## Fun Discoveries

### ASCII Art is Satisfying
Using █ ░ ▌ ▎ characters for progress bars looks surprisingly good in terminal. Simple but effective visual feedback.

### Random Numbers Need Tuning
15% variance in races feels good - enough surprise without negating skill. Took several iterations to find sweet spot.

### Terminal Apps Feel Retro-Cool
There's something special about a well-crafted terminal application. Feels like the early days of computing.

## Motivation Tracking

### What's Going Well
- Core loop is genuinely fun
- Terminal UI looks better than expected
- Mechanics are emerging naturally
- Learning Node.js concepts effectively

### Challenges
- Balancing complexity vs simplicity
- Terminal UI layout management
- Resisting feature creep
- Finding time for proper testing

### Why I'm Excited
- Building something unique and personal
- Terminal apps have character
- Good portfolio piece
- Actually want to play my own game!

---

# Task Management

## 🚧 Current Sprint (Week 1-2: MVP Core)

### High Priority
- [ ] **Set up project structure** - Create all folders and base files
- [ ] **Initialize package.json** - Add blessed, chalk, inquirer dependencies
- [ ] **Character model** - Basic horse stats (Speed/Stamina/Power)
- [ ] **Training system** - Simple stat gain calculations
- [ ] **Basic terminal menu** - Main navigation using blessed
- [ ] **Race simulation** - Core performance calculation

### Medium Priority
- [ ] **Energy system** - 100 max, training costs 10-20
- [ ] **Save/load basics** - JSON file storage
- [ ] **Race results display** - Show position, time, stats used
- [ ] **Error handling** - Basic try/catch for file operations

### Low Priority
- [ ] **ASCII progress bars** - Use █ ░ characters for stats
- [ ] **Help system** - Controls and game explanation
- [ ] **Basic testing setup** - Jest configuration and first tests

## 📋 Phase 2: Core Mechanics (Week 3-4)

### Game Systems
- [ ] **Mood system** - Great/Good/Normal/Bad affecting training
- [ ] **Friendship mechanics** - Support card bonuses at 80%
- [ ] **Race variety** - Different distances (Sprint/Mile/Long)
- [ ] **Track conditions** - Turf/Dirt with performance modifiers
- [ ] **Skill system** - Basic passive skills for horses

### UI Improvements
- [ ] **Better stat display** - Color-coded progress bars
- [ ] **Race commentary** - Text description of race events
- [ ] **Training feedback** - Show exact stat gains
- [ ] **Menu improvements** - Better navigation flow

### Data Management
- [ ] **Save system upgrade** - Multiple save slots
- [ ] **Horse templates** - Starting horse varieties
- [ ] **Race schedules** - Predefined race calendar
- [ ] **Balance data** - Configurable game constants

### Testing
- [ ] **Unit tests** - Training calculations, race simulation
- [ ] **Integration tests** - Full game flow testing
- [ ] **Mock data setup** - Test character and race data
- [ ] **Test coverage** - Aim for 80%+ coverage on core logic

## 🎨 Phase 3: Polish & Features (Week 5-6)

### Advanced Features
- [ ] **Legacy system** - Veteran bonuses for new runs
- [ ] **Achievement system** - Unlock conditions and rewards
- [ ] **Statistics tracking** - Win rates, best times, career stats
- [ ] **Multiple careers** - Different horse archetypes

### UI/UX Polish
- [ ] **ASCII art** - Horse portraits and race graphics
- [ ] **Animations** - Text scrolling effects
- [ ] **Sound effects** - Terminal beeps for events
- [ ] **Layout responsive** - Handle different terminal sizes

### Testing & Balance
- [ ] **Balance testing framework** - Automated race simulations
- [ ] **Progression testing** - Stat curve validation
- [ ] **Performance testing** - Memory and speed optimization
- [ ] **Error recovery testing** - Handle corrupted saves gracefully
- [ ] **Player testing sessions** - Gather feedback from others
- [ ] **Edge case testing** - Test boundary conditions
- [ ] **Regression testing** - Prevent old bugs from returning

## 🔧 Technical Debt

### Code Quality
- [ ] **Refactor calculations.js** - Split into smaller modules
- [ ] **Add JSDoc comments** - Document all functions
- [ ] **Consistent naming** - Review variable and function names
- [ ] **Error handling** - Add try/catch blocks everywhere
- [ ] **Input validation** - Sanitize all user inputs

### Testing
- [ ] **Unit tests** - Test all calculation functions
- [ ] **Integration tests** - Test game flow end-to-end
- [ ] **Balance tests** - Automated balance validation
- [ ] **UI tests** - Test terminal interface interactions
- [ ] **Performance tests** - Memory usage and speed benchmarks
- [ ] **Error handling tests** - Test all failure scenarios
- [ ] **Save/load tests** - Test data persistence integrity
- [ ] **Mock data creation** - Comprehensive test fixtures

## 🐛 Known Issues

### Critical Bugs
- [ ] **Race calculation overflow** - Large stat values cause errors
- [ ] **Save corruption** - JSON parsing fails sometimes
- [ ] **Memory leaks** - Blessed components not cleaned up

### Minor Issues
- [ ] **Terminal resize** - UI breaks on window resize
- [ ] **Color support** - Some terminals don't show colors
- [ ] **Input lag** - Blessed responses sometimes slow

## 🎯 Sprint Planning

### This Week Focus
1. Get basic game loop working
2. Implement core training mechanics
3. Create simple terminal interface
4. Add basic save/load functionality

### Success Metrics
- [ ] Can complete a full career run (12 training turns + 3 races)
- [ ] Training choices feel meaningful
- [ ] Race results reflect training decisions
- [ ] Can save and resume progress

### Development Guidelines
- **Keep it simple first** - Add complexity gradually
- **Test early and often** - Playtest every major change
- **Document decisions** - Update DEV_JOURNEY.md with reasoning
- **Focus on fun** - If it's not engaging, rethink the approach

---

# Project History

## Version History

### v0.1.0 - Initial Setup (TBD)
**Status**: In Development  
**Branch**: `main`

#### Added
- Project structure and documentation
- Package.json with core dependencies
- Basic README and development documentation
- AI context for Claude Code setup

#### Dependencies Added
```json
{
  "blessed": "^0.1.81",
  "chalk": "^5.3.0", 
  "inquirer": "^9.2.11",
  "commander": "^11.1.0"
}
```

## Planned Releases

### v0.1.0 - MVP Core (Target: Week 2)
**Features**:
- Basic character creation
- Simple training system (3 stats)
- Core race simulation
- Terminal interface with blessed
- Save/load functionality

**Technical Goals**:
- Working game loop (train → race → repeat)
- JSON-based data storage
- Basic error handling
- Simple terminal menus

### v0.2.0 - Core Mechanics (Target: Week 4)
**Features**:
- Energy and mood systems
- Friendship mechanics with bonuses
- Race variety (distance/surface types)
- Improved UI with progress bars
- Legacy system for run bonuses

**Technical Goals**:
- Modular code architecture
- Configuration file system
- Basic testing framework
- Performance optimization

### v0.3.0 - Polish & Features (Target: Week 6)
**Features**:
- Achievement system
- ASCII art and animations
- Advanced race commentary
- Statistics tracking
- Multiple horse archetypes

**Technical Goals**:
- Comprehensive testing
- Documentation completion
- Balance testing framework
- Error recovery systems

## Architecture Decisions

### 2025-08-20: JavaScript/Node.js Selection
**Decision**: Use JavaScript and Node.js for development  
**Reasoning**: 
- Developer familiarity with frontend JavaScript
- Rich ecosystem for terminal applications
- Fast prototyping and iteration
- Easy deployment and distribution

**Alternatives Considered**: Python, Go, Rust  
**Trade-offs**: Performance vs development speed

### 2025-08-20: Terminal Interface Choice
**Decision**: Use `blessed` library for terminal UI  
**Reasoning**:
- Rich terminal UI capabilities
- Good documentation and community
- Handles complex layouts and input
- Cross-platform compatibility

**Alternatives Considered**: Raw console.log, inquirer only, web interface  
**Trade-offs**: Complexity vs user experience

### 2025-08-20: Simplified Stats System
**Decision**: Use 3 stats (Speed/Stamina/Power) instead of original 5  
**Reasoning**:
- Easier to understand and balance
- Sufficient for core racing mechanics
- Reduces UI complexity
- Can expand later if needed

**Alternatives Considered**: Full 5-stat system, 2-stat system  
**Trade-offs**: Simplicity vs depth

## Quality Gates

### Before v0.1.0
- [ ] All core features implemented
- [ ] Basic testing in place
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Performance meets targets

### Before v0.2.0
- [ ] Extended features stable
- [ ] Comprehensive testing
- [ ] User feedback incorporated
- [ ] Code quality standards met

### Before v1.0.0
- [ ] Feature complete
- [ ] Fully tested and documented
- [ ] Performance optimized
- [ ] Ready for public release

---

# AI Context Reference

## Project Overview
Build a text-based horse racing simulation game inspired by Uma Musume Pretty Derby. Focus on **training mechanics**, **stat progression**, and **race simulation** with ASCII/terminal interface.

## Core Game Loop (15-minute sessions)
1. **Setup** - Select horse, assign bonuses from previous runs
2. **Training** - 12 turns of strategic training choices 
3. **Racing** - 3-4 automated races showing training results
4. **Legacy** - Generate bonuses for next run

## Technical Stack
- **Runtime**: Node.js
- **UI**: Terminal-based with `blessed` library
- **Storage**: JSON files (no database needed for MVP)
- **Language**: JavaScript (user prefers frontend JS)

## Essential Dependencies
```json
{
  "blessed": "^0.1.81",
  "chalk": "^5.3.0", 
  "inquirer": "^9.2.11",
  "commander": "^11.1.0"
}
```

## Testing Setup
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:balance": "jest tests/balance --verbose",
    "test:coverage": "jest --coverage"
  }
}
```

## Core Data Models

### Character Stats (simplified from 5 to 3 stats)
- **Speed** (1-100): Final sprint performance
- **Stamina** (1-100): Race endurance/"HP pool" 
- **Power** (1-100): Acceleration ability

### Training System
- 5 training options: Speed, Stamina, Power, Rest, Social
- Energy system: 100 max, training costs 10-20, rest restores 30
- Friendship bonuses: 3x training gains at 80% friendship

### Race Mechanics
```javascript
// Simple race calculation
Performance = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
Final_Time = Base_Time - (Performance × Stamina_Factor × Random)
```

## Core Formulas (Reference)

### Training Gain
```javascript
gain = base_value × growth_rate × mood_modifier × friendship_bonus
```

### Race Performance  
```javascript
score = (speed × 0.4) + (stamina × 0.4) + (power × 0.2)
stamina_factor = current_stamina / max_stamina
final_performance = score × stamina_factor × random(0.85, 1.15)
```

## Development Priorities
1. **Core loop first** - Get basic train → race → repeat working
2. **Simple UI** - Focus on functionality over aesthetics initially  
3. **Test as you build** - Write tests for core mechanics early
4. **Balance testing** - Playtest frequently for engagement
5. **Gradual complexity** - Add features after core is solid

## Documentation Workflow

**IMPORTANT**: Update documentation files with each commit:

### When Making Changes
1. **HISTORY.md** - Log formal commits & version changes
2. **DEV_JOURNEY.md** - Add personal notes & decision reasoning  
3. **TODOS.md** - Update task status & add new issues
4. **README.md** - Update if features/setup changes

### File Purposes
- `README.md`: Technical docs & setup guide
- `DEV_JOURNEY.md`: Personal development journal
- `TODOS.md`: Task tracking & technical debt
- `HISTORY.md`: Formal change log & commits
- `CLAUDE.md`: AI context reference

## Notes for Implementation
- Keep formulas simple initially, add complexity later
- Use lots of console.log for debugging race calculations
- Test with different stat combinations for balance
- Focus on "one more run" addiction loop
- Save player progress between sessions
- **Write tests for core mechanics as you build them**
- **Run `npm run test:watch` during development**
- **Always update documentation files when committing changes**

---

*This complete documentation serves as your comprehensive guide for building the Uma Musume text-based clone. Keep this as reference throughout development and update sections as the project evolves.*