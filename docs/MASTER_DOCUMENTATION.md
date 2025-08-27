# Horse Racing Text Game - Master Documentation

## 📚 Documentation Index

This master document consolidates all project documentation for easy navigation.

### 🏗️ **Architecture & Design**
- **[System Architecture](#system-architecture)** - Overall system design and patterns
- **[V1 Features](#v1-features)** - Version 1.0 feature specifications
- **[Race System](#race-system)** - Race mechanics and implementation
- **[Save System](#save-system)** - File-based save/load system

### 🧪 **Development & Testing**
- **[TDD Methodology](#tdd-methodology)** - Test-driven development practices
- **[Testing Strategy](#testing-strategy)** - Test organization and coverage
- **[Build & Release](#build-release)** - Version management and deployment

### ⚖️ **Legal & Compliance**
- **[Legal Protection](#legal-protection)** - Disclaimer and IP protection
- **[US Legal Framework](#us-legal-framework)** - Compliance requirements

### 📈 **Development Journey**
- **[Development History](#development-history)** - Complete development chronology
- **[Version History](#version-history)** - Release notes and changes

---

## 🏗️ System Architecture

### Core Design Patterns

**State Machine Architecture**
- O(1) input handling with Map-based lookups
- Graph-based navigation system
- Efficient transition validation
- Event-driven architecture with command pattern

**Modular UI System**
- Adapter pattern for framework independence
- Support for blessed.js, terminal-kit, or console
- Cross-platform compatibility
- Easy framework switching

**TDD-First Development**
- Tests written before implementation
- 70+ comprehensive test cases
- Integration and unit test coverage
- Balance validation testing

### Data Structures & Performance

**Time & Space Complexity**
- State transitions: O(1) average case
- Input routing: O(1) Map lookups vs O(n) switch-case
- Memory usage: O(V + E) where V=states, E=transitions
- Scalable design for large state machines

**Core Systems**
- Character progression with stat management
- NPH (rival horse) AI system
- Race simulation with realistic mechanics
- Training system with energy management

---

## 🎮 V1 Features

### Completed v1.0 Features

**Legal Startup System**
- Legal disclaimers for IP protection
- Startup screens with acceptance flow
- US legal compliance framework

**Modular UI Architecture**
- BlessedAdapter for terminal UI
- UIAdapter base class for framework switching
- TrainerDialog component system
- Cross-platform screen management

**Character Creation Engine**
- Name generation with uniqueness tracking
- Stat generation with 9 variation patterns
- Breed characteristics and specializations
- Genetic inheritance system for breeding

**Trainer System**
- 3 trainers with distinct personalities:
  - Coach Johnson (Speed specialist - energetic, direct)
  - Coach Martinez (Stamina specialist - patient, methodical) 
  - Coach Thompson (Power specialist - tough, motivational)
- Stat-based dialog responses
- Relationship tracking with horses
- Pre/post training conversations

**Enhanced Game Features**
- StableOwner account system
- 24 intelligent NPH rivals with unique behaviors
- Advanced stat generation preventing clustering
- Comprehensive save/load with v1.0 data structures

### Save/Load System

**JSON-Based Storage**
- Human-readable format for editing/cheating
- Automatic backups with cleanup
- Multiple save slots
- Save validation and corruption detection
- Development commands for save management

**Save Commands**
```bash
npm run save:list          # List all saves
npm run save:wipe          # Wipe saves (dev)
npm run save:stats         # Show statistics
npm run save:validate      # Check save integrity
npm run save:test          # Create test save
```

---

## 🏁 Race System

### Static 4-Race Career Structure

| Turn | Race Name | Type | Surface | Distance | Prize |
|------|-----------|------|---------|----------|-------|
| 4 | Debut Sprint | Sprint | Turf | 1200m | $2,000 |
| 9 | Heritage Mile | Mile | Dirt | 1600m | $5,000 |
| 15 | Classic Stakes | Medium | Dirt | 2000m | $8,000 |
| 24 | Championship Final | Long | Turf | 2400m | $15,000 |

### Race Mechanics

**Performance Calculation**
```javascript
Performance = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
Final_Result = Performance × Stamina_Factor × Random_Variance(0.85-1.15)
```

**NPH AI Racing**
- 24 intelligent rivals with training patterns
- Strategy-based racing (FRONT, MID, LATE)
- Realistic performance distributions
- Dynamic rivalry development

---

## 🧪 TDD Methodology

### Test-Driven Development Process

**Workflow: Document → Test → Code → Verify**
1. Document expected behavior
2. Write failing tests
3. Implement minimal code to pass
4. Refactor and optimize
5. Verify with comprehensive testing

### Test Organization

**Test Categories** (70+ tests total)
- **Unit Tests**: Individual function validation
- **Integration Tests**: System interaction testing
- **Journey Tests**: Complete user workflow testing
- **Balance Tests**: Game mechanics validation
- **Snapshot Tests**: UI regression prevention

**Key Test Files**
- `tests/unit/ui/UIAdapter.test.js` - UI adapter system
- `tests/unit/ui/TrainerDialog.test.js` - Trainer conversations
- `tests/unit/generation/StatGenerator.test.js` - Stat generation
- `tests/integration/complete-career-flow.test.js` - Full careers
- `tests/critical-path/p0-core-journey.test.js` - Essential paths

---

## 🚀 Build & Release

### Automated Version Management

**Semantic Versioning (SemVer)**
- MAJOR.MINOR.PATCH format
- Automated version bumping
- Git integration with tagging
- Branch-based workflow

**Build Commands**
```bash
npm run build:major     # Breaking changes (1.0.0 -> 2.0.0)
npm run build:minor     # New features (1.0.0 -> 1.1.0)
npm run build:patch     # Bug fixes (1.0.0 -> 1.0.1)
npm run build:release   # Create release branch
npm run build:cleanup   # Clean old branches
```

### GitHub Actions Workflows

**Automated CI/CD**
- Release workflow with semantic commit detection
- Branch cleanup with safety mechanisms
- Test validation before releases
- Automated changelog generation

**Branch Strategy (GitFlow)**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `release/*`: Release preparation
- `hotfix/*`: Critical fixes

---

## ⚖️ Legal Protection

### IP Protection Strategy

**Bland Naming Convention**
- "Horse Racing Text Game" - generic, non-infringing
- Avoids trademarked racing terminology
- Educational/simulation focus
- Clear non-commercial intent

**Legal Disclaimers**
- Educational purpose statements
- No real gambling or betting
- Intellectual property respect
- User acceptance requirements

### US Legal Compliance

**Gaming Law Considerations**
- No real money transactions
- No gambling mechanics
- Simulation/entertainment focus
- Clear educational value

---

## 📈 Development History

### Major Milestones

**August 27, 2025 - Automated Versioning System**
- Enterprise-grade version management
- GitHub Actions CI/CD workflows
- Branch cleanup automation
- Comprehensive build scripts

**August 26, 2025 - Career Completion System**
- S-F grading system implementation
- Achievement system integration
- Race progression fixes
- Enhanced UI with Unicode progress bars

**Previous Development Phases**
- Phase 1: MVP Core (basic mechanics)
- Phase 2: Enhanced features (energy, mood, friendship)
- Phase 3: Polish (legacy system, achievements)
- Phase 4: TDD Integration (comprehensive testing)

### Technical Achievements

**Performance Optimizations**
- O(1) state machine implementation
- Efficient data structure usage
- Memory management improvements
- Cross-platform compatibility

**Code Quality Metrics**
- 70+ test cases with high coverage
- TDD methodology adherence
- Modular architecture implementation
- Comprehensive documentation

---

## 🔧 Development Commands

### Daily Development
```bash
npm run dev              # Start with auto-restart
npm run test:watch       # Run tests in watch mode
npm run save:wipe        # Clean saves for testing
```

### Testing
```bash
npm test                 # Run all tests
npm run test:balance     # Validate game balance
npm run test:coverage    # Generate coverage report
```

### Version Management
```bash
npm run build:info       # Show version info
npm run build:minor      # Release new version
npm run build:cleanup    # Clean old branches
```

### Save Management
```bash
npm run save:list        # List all saves
npm run save:stats       # Show save statistics
npm run save:test        # Create test save
```

---

## 📁 File Organization

### Source Code Structure
```
src/
├── models/             # Data models (Character, Horse, NPH)
├── systems/            # Core systems (Game, UI, StateMachine)
├── ui/                 # UI components and adapters
├── engines/            # Creation and generation engines
└── utils/              # Utility functions and helpers

tests/
├── unit/               # Individual component tests
├── integration/        # System interaction tests
├── journeys/           # Complete user workflow tests
└── critical-path/      # Essential functionality tests

docs/
└── MASTER_DOCUMENTATION.md  # This consolidated guide

scripts/
├── build.js            # Version management
└── save-manager.js     # Save file utilities
```

---

*This master documentation consolidates all project knowledge into a single, navigable resource. Individual documentation files have been preserved for detailed technical specifications.*

**Last Updated**: August 27, 2025  
**Version**: 1.0.0 "Thunder Runner"  
**Status**: Production Ready