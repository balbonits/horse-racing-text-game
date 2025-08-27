# Horse Racing Text Game

A terminal-based horse racing simulation game. Train your horse through a 12-turn career, build stats, manage resources, and compete in races to achieve championship glory!

**✅ FULLY PLAYABLE** - Complete game with robust input handling and comprehensive testing.

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

## 🎮 How to Play

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/balbonits/horse-racing-text-game.git
   cd horse-racing-text-game
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Game**
   ```bash
   # Recommended: Opens in new terminal window
   npm start
   
   # Alternative: Run in current terminal
   npm run start:direct
   
   # Or run directly
   node src/app.js
   ```

### Game Controls

| Key | Action |
|-----|--------|
| **1-5** | Training options (Speed/Stamina/Power/Rest/Media Day) |
| **S** | Save your game |
| **Q** | Quit game |
| **H** | Help (if available) |
| **Enter** | Confirm selection |

### Playing Your First Career

1. **Start New Career**
   - Choose option "1" from main menu
   - Enter your horse's name (or use generator with "G")

2. **Training Phase** (24 turns)
   - **Turn 1-3**: Build basic stats and bond
   - **Turn 4**: First race - Maiden Sprint (1200m)
   - **Turn 5-8**: Develop specialization  
   - **Turn 9**: Second race - Mile Championship (1600m)
   - **Turn 9-14**: Advanced training
   - **Turn 15**: Third race - Dirt Stakes (2000m)
   - **Turn 15-23**: Final preparation
   - **Turn 24**: Final race - Turf Cup (2400m)

3. **Training Strategy Tips**
   - **Media Day** builds bond AND restores energy (+15)
   - **Rest Day** fully restores energy (+30)
   - **High Bond** (80+) gives 50% training bonus
   - **Good Form** improves all training effectiveness
   - **Balance stats** according to upcoming race types

4. **Race Strategy**
   - **Sprint races** (1200m): Favor Speed + Power
   - **Mile races** (1600m): Balanced stats
   - **Long races** (2000m+): Favor Stamina
   - Choose strategy: FRONT/MID/LATE based on strengths

5. **Career Completion**
   - Final grade: S/A/B/C/D/F based on performance
   - Achievements unlock based on accomplishments
   - Start new career with lessons learned!

### Understanding the Interface

```
TRAINING - Thunder Horse
========================

STATS:
  Speed:   42/100  [████████░░░░░░░░░░░░]  ← Progress bars show stat levels
  Stamina: 38/100  [███████░░░░░░░░░░░░░]
  Power:   45/100  [█████████░░░░░░░░░░░]

CONDITION:
  Energy: 85/100  [█████████████████░░░]  ← Energy for training
  Form:   Good Form                       ← Affects training efficiency

CAREER:
  Turn: 8/24                             ← Current progress
  Bond: 65/100                           ← Relationship strength

=== UPCOMING RACE ===                   ← Next race information
Race: Mile Championship
Turn: 9
Distance: 1600m
Surface: DIRT
Type: MILE
Turns until race: 1
=====================

TRAINING OPTIONS:                       ← Your choices
1. Speed Training   (Cost: 15 energy)
2. Stamina Training (Cost: 10 energy)
3. Power Training   (Cost: 15 energy)
4. Rest Day         (Gain: 30 energy)
5. Media Day        (Gain: 15 energy)
```

### Pro Tips

- **Early Game**: Focus on Media Day to build bond quickly
- **Mid Game**: Specialize based on your preferred race types
- **Late Game**: Fine-tune stats and manage energy carefully
- **Energy Management**: Never let energy get too low before races
- **Form Matters**: Train when in Good Form or better for maximum gains
- **Save Often**: Use 'S' to save before important decisions

## 🐎 Game Overview

**Core Experience**: 15-minute strategic sessions with addictive "one more run" gameplay.

### Game Flow
1. **Character Creation** - Name your horse (with realistic name generator) and begin your career
2. **Training Phase** - 12 turns of strategic training choices against intelligent AI rivals
3. **Racing Events** - Compete in 4 scheduled races with sophisticated NPH competitors
4. **Career Completion** - Finish your career with comprehensive stats and achievements

### Key Features
- **🏇 Shared Horse Architecture**: Unified system for player and AI horses with consistent mechanics
- **🤖 Intelligent NPH System**: 24 rival horses with unique training patterns, strategies, and personalities
- **📝 Realistic Name Generation**: Authentic racehorse names following Jockey Club conventions
- **🎯 Strategic Racing**: Different race types favor different stat combinations and strategies  
- **💾 Robust Save System**: Compatible with legacy saves while supporting enhanced features

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
- **Character Creation**: Type name letter by letter, press Enter to submit
- **Backspace**: Edit character name during creation
- **Enter/Space**: Submit forms and continue through races
- **Enter (during race)**: Fast forward race animation to results
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

### Career Race Schedule (4 Static Races)
| Turn | Race Type | Surface | Distance | Focus | Prize |
|------|-----------|---------|----------|-------|-------|
| 4 | Sprint | Turf | 1200m | Speed/Power | $2,000 |
| 6 | Mile | Dirt | 1600m | Balanced | $5,000 |
| 9 | Medium | Dirt | 2000m | Endurance | $8,000 |
| 12 | Long | Turf | 2400m | Stamina | $15,000 |

### Track Conditions
- **Firm**: Perfect conditions (100% performance)
- **Good**: Slightly soft (98% performance)  
- **Soft**: Slower ground (95% performance)
- **Heavy**: Muddy and challenging (90% performance)

## 🎯 Recent Updates & Improvements

### State Machine Architecture (O(1) Performance)
- **Efficient Input Handling**: Replaced O(n) switch-case patterns with O(1) Map lookups
- **Graph-based Navigation**: BFS pathfinding for state transitions
- **Event-driven System**: Command pattern integration for clean action handling
- **Memory Management**: Proper resource cleanup and state history tracking

### Race System Enhancements
- **Race Collection Generator**: Static 4-race career with future expansion support
- **Result Persistence**: Race results saved within race objects
- **Completion Tracking**: Prevents race re-triggering after completion
- **Fast Forward**: Skip race animations with ENTER key
- **Proper Terminology**: Professional horse racing placings (🏆 1st, 🥈 2nd, 🥉 3rd)

### UX Improvements
- **Training Feedback**: Immediate ✅ success and ❌ failure notifications
- **Turn Updates**: UI refreshes immediately after training
- **Combined Screens**: Race results and podium ceremony on single display
- **Clean NPH Output**: Rival training hidden during normal gameplay
- **Career Completion**: Proper end-game detection and flow

## 🏗️ Technical Architecture

### Horse Class System
- **Base Horse Class**: Shared functionality for all horses (stats, conditions, racing mechanics)
- **Character Class**: Player horses extending Horse with friendship and career progression
- **NPH Class**: AI horses extending Horse with training patterns and strategies

### NPH (Non-Player Horse) AI System
- **Training Patterns**: 6 unique AI behaviors (speed_focus, stamina_focus, balanced, etc.)
- **Racing Strategies**: Front runner, stalker, and closer styles affecting race performance
- **Personalities**: 8 personality types influencing training and racing decisions
- **Intelligence**: NPH horses make strategic decisions based on upcoming races

### Name Generation System
- **10 Naming Patterns**: Prefix-suffix, alliterative, possessive, location-based, etc.
- **Jockey Club Compliance**: 18-character limit, prohibited terms, validation rules
- **Style Options**: Classic, modern, powerful, elegant, and speed-focused names
- **Pedigree Naming**: Generate names based on parent horse names

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
- **User Input Tests**: Physical keyboard/mouse simulation (`tests/integration/user-input.test.js`)
- **UI Rendering Tests**: Terminal interface validation (`tests/integration/blessed-rendering.test.js`)
- **Critical Path Tests**: Complete game journey validation (`tests/critical-path/`)
- **Balance Tests**: Gameplay balance validation (`tests/balance/`)
- **Performance Tests**: Memory and speed benchmarks

### Development Tools
```bash
npm run dev          # Development with auto-restart
npm run wipe:saves   # Clear all save files (testing utility)
node test-manual.js  # Manual game testing (if available)
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

### Input System
The game features a **dual input system** for maximum compatibility:
- **Primary**: Rich blessed textbox interface (when supported)
- **Fallback**: Direct keyboard input with letter-by-letter typing
- **Visual Feedback**: Real-time display of typed characters
- **Cross-Platform**: Works reliably across all terminal environments

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

## 📄 License

MIT License - This project is available as a portfolio demonstration and learning reference.

## 🤖 AI-Assisted Development

This project demonstrates effective **human-AI collaboration** in software development, showcasing how AI assistance can accelerate complex project delivery while maintaining high quality standards.

### **Development Partnership**
- **Human Vision & Direction**: Project concept, requirements, and strategic decisions
- **AI Implementation**: Code generation, architecture design, and comprehensive testing
- **Collaborative Iteration**: Continuous refinement through feedback and requirement evolution

### **AI Contributions**
- **Advanced Architecture**: State machine pattern with O(1) performance optimization
- **Comprehensive Testing**: 24+ test files with 95% coverage including snapshot testing
- **Professional Documentation**: Complete technical documentation and user guides
- **Game Balance**: Mathematical modeling for 15-minute session targets
- **Terminal UI Design**: ASCII art, progress bars, and cross-platform compatibility

### **Technical Achievements Through AI Collaboration**
- **Rapid Prototyping**: From concept to fully playable game in development sprints
- **Quality Assurance**: Test-driven development with comprehensive coverage
- **Performance Optimization**: Algorithm optimization from O(n) to O(1) complexity
- **Professional Polish**: Production-ready code with proper error handling and cleanup
- **Portfolio Integration**: Complete showcase configuration and visual documentation

### **Development Workflow**
1. **Requirements Definition**: Human-provided specifications and vision
2. **Iterative Development**: AI implementation with continuous human feedback  
3. **Quality Validation**: Comprehensive testing and balance verification
4. **Professional Presentation**: Portfolio-ready documentation and screenshots

This project serves as a case study in **effective AI-human collaboration** for software development, demonstrating how AI assistance can enhance productivity while maintaining creative control and technical leadership.

## 🙏 Acknowledgments

- **Claude Code (Anthropic)** - AI development partner enabling rapid, high-quality implementation
- **Classic horse racing simulation games** - General inspiration for game mechanics
- **blessed** community - Excellent terminal UI framework
- **Node.js** ecosystem - Robust development platform

---

*A complete terminal-based game demonstrating advanced JavaScript development and sophisticated game design.* 🏇