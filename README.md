# Uma Musume Text-Based Clone

A terminal-based horse racing simulation game inspired by Uma Musume Pretty Derby. Train your horse through a 12-turn career, build stats, manage resources, and compete in races to achieve championship glory!

## 🎮 Quick Start

```bash
# Install dependencies
npm install

# Run the game (opens in new terminal window)
npm start

# Run directly in current terminal
npm run start:direct

# Development mode with auto-restart
npm run dev
```

## 🐎 Game Overview

**Core Experience**: 15-minute strategic sessions with addictive "one more run" gameplay.

### Game Flow
1. **Character Creation** - Name your horse and begin your career
2. **Training Phase** - 12 turns of strategic training choices
3. **Racing Events** - Compete in 3 scheduled races to prove your progress
4. **Career Completion** - Earn legacy bonuses for your next run

### Core Stats System
- **Speed** (1-100): Sprint performance and final stretch power
- **Stamina** (1-100): Race endurance and energy management
- **Power** (1-100): Acceleration ability and burst speed
- **Energy** (0-100): Current stamina for training and racing
- **Friendship** (0-100): Bond with supporters for training bonuses

## 🎯 Gameplay Mechanics

### Training Options
| Training Type | Energy Cost | Primary Benefit | Best For |
|---------------|-------------|-----------------|----------|
| Speed Training | -15 | +Speed stat | Sprint races |
| Stamina Training | -10 | +Stamina stat | Long distance races |
| Power Training | -15 | +Power stat | Acceleration |
| Rest Day | +30 | Energy recovery | When tired |
| Social Time | -5 | +Friendship | Unlocking bonuses |

### Race Performance
Race results are calculated using:
```
Performance = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
Final Result = Performance × Energy Factor × Mood × Random Variance
```

### Progression Systems
- **Growth Rates**: Each horse has talent grades (S/A/B/C/D) affecting training gains
- **Mood System**: Energy levels affect mood, which impacts training effectiveness
- **Friendship Bonuses**: 80+ friendship provides 50% bonus to all training
- **Legacy System**: Complete careers to earn permanent bonuses for future runs

## 🖥️ Controls & Interface

### Keyboard Controls
- **1-5**: Select training options
- **R**: View race schedule and information  
- **S**: Save current game progress
- **L**: Load saved game
- **H**: Show help and game information
- **Q / ESC**: Quit game

### Mouse Support
- **Click**: Interactive buttons for training selection
- **Hover**: Visual feedback on clickable elements
- **Scroll**: Navigate through longer text displays

## 🏁 Race Types & Schedule

### Career Race Schedule
| Turn | Race Type | Distance | Focus | Description |
|------|-----------|----------|-------|-------------|
| 4 | Sprint Race | 1200m | Speed/Power | Debut race introduction |
| 8 | Mile Race | 1600m | Balanced | Classic test of all abilities |
| 12 | Long Distance | 2000m | Stamina | Championship finale |

### Track Conditions
- **Firm**: Perfect conditions (100% performance)
- **Good**: Slightly soft (98% performance)  
- **Soft**: Slower ground (95% performance)
- **Heavy**: Muddy and challenging (90% performance)

## 🧪 Development & Testing

### Running Tests
```bash
# All tests
npm test

# Watch mode for development
npm run test:watch

# Test specific categories
npm run test:balance        # Game balance validation
npm run test:coverage       # Generate coverage report

# Specific test files
npm test character.test.js  # Character model tests
npm test ui.test.js         # UI system tests
```

### Test Categories
- **Unit Tests**: Individual component validation (`tests/unit/`)
- **Integration Tests**: Full game flow testing (`tests/integration/`)  
- **Balance Tests**: Gameplay balance validation (`tests/balance/`)
- **Performance Tests**: Memory and speed benchmarks
- **UI Tests**: Terminal interface interaction testing

### Development Tools
```bash
npm run dev          # Development with auto-restart
npm run lint         # Code style checking (if configured)
npm run build        # Production build (if configured)
```

## 📊 Technical Architecture

### Project Structure
```
src/
├── app.js                 # Game entry point
├── models/               # Core game logic
│   ├── Character.js      # Horse stats and progression
│   ├── Training.js       # Training system mechanics
│   └── Race.js           # Race simulation engine
├── systems/              # Game management
│   ├── Game.js           # Main game controller
│   └── UI.js             # Terminal interface system
├── data/                 # Game data files
│   ├── horses.json       # Starting templates
│   └── saves/            # Player save files
└── utils/                # Helper functions
    └── calculations.js   # Math and formulas
```

### Key Dependencies
- **blessed**: Terminal UI framework for rich interfaces
- **inquirer**: Interactive command-line prompts
- **commander**: CLI argument parsing
- **jest**: Testing framework with comprehensive utilities

## 🎨 Game Design Philosophy

### Core Principles
1. **Meaningful Choices**: Every training decision impacts race performance
2. **Resource Management**: Energy and mood create strategic depth
3. **Progressive Complexity**: Simple start, deep optimization potential
4. **Immediate Feedback**: Clear cause-and-effect relationships
5. **Replayability**: Legacy system encourages multiple careers

### Balance Goals
- **Session Length**: 10-15 minutes per career
- **Skill vs Luck**: 60% player decisions, 40% random variance
- **Progression Curve**: Smooth advancement with occasional breakthroughs
- **Specialization vs Balance**: Both strategies should be viable

## 🏆 Achievements & Goals

### Career Achievements
- **Triple Threat**: All stats above 80
- **Elite Athlete**: Any stat reaches 90+
- **Undefeated**: Win every race in a career
- **Champion**: Win 3+ races total
- **Best Friends**: Achieve 90+ friendship
- **Dedicated Trainer**: Complete 15+ training sessions

### Legacy Progression
- **Stat Bonuses**: 10% of final stats carry over
- **Energy Bonus**: +2 max energy per race won (max +10)
- **Experience**: Faster learning from previous careers

## 🐛 Troubleshooting

### Common Issues
- **Controls not working**: Ensure terminal supports blessed library
- **Display problems**: Try adjusting terminal window size
- **Save/load errors**: Check file permissions in saves directory
- **Performance issues**: Run `npm test:performance` to diagnose

### System Requirements
- **Node.js**: Version 16+ recommended
- **Terminal**: Any modern terminal with Unicode support
- **OS**: Windows, macOS, or Linux
- **Memory**: 50MB+ available RAM

## 🚀 Future Roadmap

### Planned Features
- **Multiple Horse Types**: Different breeds with unique characteristics
- **Skill System**: Passive abilities and special techniques  
- **Weather Effects**: Dynamic track conditions
- **Tournament Mode**: Multi-race championship series
- **Statistics Tracking**: Detailed career history and analytics

### Technical Improvements
- **Save System**: Cloud save support and backup
- **Performance**: Optimization for large save files
- **Accessibility**: Screen reader compatibility
- **Localization**: Multi-language support

## 🤝 Contributing

We welcome contributions! Please see our development guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests to ensure stability (`npm test`)
4. Commit changes with clear messages
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Standards
- Write tests for new functionality
- Follow existing code style and patterns
- Update documentation for user-facing changes
- Ensure all tests pass before submitting

## 📄 License

MIT License - feel free to use this project as learning material or build upon it for your own games.

## 🙏 Acknowledgments

- **Uma Musume Pretty Derby** by Cygames - Original inspiration
- **blessed** community - Excellent terminal UI framework
- **Node.js** ecosystem - Robust development platform

---

*Ready to start your racing career? Run `npm start` and begin training your champion!* 🏇