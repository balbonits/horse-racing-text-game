# AI Context for Uma Musume Text-Based Clone

## Project Overview
Build a text-based horse racing simulation game inspired by Uma Musume Pretty Derby. This is a **Node.js terminal application** focused on training mechanics, stat progression, and race simulation with ASCII/terminal interface.

**Target Experience**: 15-minute addictive sessions with "one more run" appeal.

## Core Game Loop (15-minute sessions)
1. **Setup** - Select horse, assign bonuses from previous runs
2. **Training** - 12 turns of strategic training choices 
3. **Racing** - 3-4 automated races showing training results
4. **Legacy** - Generate bonuses for next run

## Technical Stack
- **Runtime**: Node.js
- **UI**: Terminal-based with `blessed` library
- **Storage**: JSON files (no database needed for MVP)
- **Language**: JavaScript
- **Testing**: Jest framework

## Essential Dependencies
```json
{
  "blessed": "^0.1.81",      // Terminal UI framework
  "chalk": "^5.3.0",         // Terminal text colors
  "inquirer": "^9.2.11",     // Interactive prompts
  "commander": "^11.1.0"     // CLI argument parsing
}
```

## Development Dependencies
```json
{
  "nodemon": "^3.0.1",       // Auto-restart during development
  "jest": "^29.7.0"          // Testing framework
}
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
    └── *.md                # Other documentation
```

## Core Data Models

### Character Stats (simplified from 5 to 3 stats)
- **Speed** (1-100): Final sprint performance
- **Stamina** (1-100): Race endurance/"HP pool" 
- **Power** (1-100): Acceleration ability

### Training System
| Training Type | Energy Cost | Primary Gain |
|---------------|-------------|--------------|
| Speed Training | 15 | +Speed |
| Stamina Training | 10 | +Stamina |
| Power Training | 15 | +Power |
| Rest Day | -30 | Energy recovery |
| Social Time | 5 | Friendship building |

- Energy system: 100 max, training costs 10-20, rest restores 30
- Friendship bonuses: 3x training gains at 80% friendship

### Race Mechanics
```javascript
// Simple race calculation
Performance = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
Final_Result = Performance × Stamina_Factor × Random_Variance(0.85-1.15)
```

## Core Formulas

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

## Testing Framework Setup

### Jest Configuration (jest.config.js)
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

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:balance": "jest tests/balance --verbose",
    "test:coverage": "jest --coverage"
  }
}
```

### Test Categories & Coverage Goals
| Type | Purpose | Location | Coverage Goal |
|------|---------|----------|---------------|
| **Unit** | Individual function tests | `tests/unit/` | 95% |
| **Integration** | Full game flow tests | `tests/integration/` | 90% |
| **Balance** | Game balance validation | `tests/balance/` | 85% |

## Development Priorities & Implementation Order

### Phase 1 - MVP Core (Week 1-2)
1. **Project Structure** - Create all folders and base files
2. **Character Model** - Basic horse stats (Speed/Stamina/Power)
3. **Training System** - Simple stat gain calculations
4. **Basic Terminal Menu** - Main navigation using blessed
5. **Race Simulation** - Core performance calculation
6. **Save/Load Basics** - JSON file storage

### Phase 2 - Core Mechanics (Week 3-4)  
7. **Energy System** - 100 max, training costs 10-20
8. **Mood System** - Great/Good/Normal/Bad affecting training
9. **Friendship Mechanics** - Support card bonuses at 80%
10. **Race Variety** - Different distances (Sprint/Mile/Long)
11. **UI Improvements** - ASCII progress bars, better layouts

### Phase 3 - Polish & Features (Week 5-6)
12. **Legacy System** - Veteran bonuses for new runs
13. **Achievement System** - Unlock conditions and rewards
14. **Advanced Testing** - Balance testing framework
15. **Performance Optimization** - Memory and speed improvements

## Game Balance Targets
| Aspect | Target Value |
|--------|--------------|
| Session Length | 10-15 minutes |
| Training Turns | 8-12 per career |
| Stat Range | 1-100 (simple scale) |
| Race Outcome | 60% skill, 40% random |
| Energy System | 100 max, costs 10-20 |

## Controls & User Interface
| Key | Action |
|-----|--------|
| `1-5` | Training options |
| `r` | Race schedule |
| `s` | Save game |
| `l` | Load game |
| `q` | Quit game |
| `h` | Help/controls |

## Development Guidelines

### Code Quality Standards
- **Keep formulas simple initially** - Add complexity later
- **Test as you build** - Write tests for core mechanics immediately
- **Focus on engagement** - Prioritize "one more run" addiction loop
- **Use console.log liberally** - Debug race calculations thoroughly
- **Balance early and often** - Test with different stat combinations

### Testing Workflow
- **Run `npm run test:watch` during development**
- **Write unit tests for all calculation functions**
- **Create integration tests for complete game flows**
- **Build balance tests to validate progression curves**
- **Mock data helpers for consistent test fixtures**

### Documentation Maintenance
**Always update these files when making changes**:
- `README.md` - Technical setup and features
- `CLAUDE.md` - This AI context file
- Development journal notes in comments

## Common Development Commands
```bash
# Development workflow
npm run dev              # Start with auto-restart
npm run test:watch       # Run tests in watch mode

# Testing
npm test                 # Run all tests
npm run test:balance     # Run balance validation tests
npm run test:coverage    # Generate coverage report

# Game operations
npm start                # Start the game
node src/app.js          # Direct game launch
```

## Key Implementation Notes

### UI Development with Blessed
- Use `blessed` for rich terminal interfaces
- Implement ASCII progress bars with █ ░ characters
- Add colors with `chalk` for better UX
- Handle terminal resizing gracefully

### Race Simulation Focus
- Balance randomness (15% variance feels good)
- Ensure training choices feel meaningful
- Make race results clearly reflect stat investments
- Add simple commentary for engagement

### Save System Design
- Use JSON for simple persistence
- Support multiple save slots
- Handle corrupted save files gracefully
- Auto-save progress between training turns

### Performance Considerations
- Terminal apps should feel instant
- Minimize memory usage during long sessions
- Clean up blessed components properly
- Optimize race calculations for multiple simulations

## Success Metrics for MVP
- [ ] Can complete a full career run (12 training turns + 3 races)
- [ ] Training choices feel meaningful and impactful
- [ ] Race results clearly reflect training decisions  
- [ ] Can save and resume progress reliably
- [ ] Session length stays within 10-15 minutes
- [ ] Player wants to immediately start another run

---

*Keep this context updated as the project evolves. Focus on core mechanics first, then gradually add complexity and polish.*