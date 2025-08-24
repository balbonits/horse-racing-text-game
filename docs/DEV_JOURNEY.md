# Development Journey - Uma Musume Text-Based Clone

A chronicle of the development process, conversations, decisions, and learnings throughout the creation of this terminal-based horse racing game.

---

## 📅 **August 24, 2025**

### **Project Inception**
**Time**: Morning  
**Context**: User requested to start building a horse racing text game project based on complete project documentation.

#### Initial Request
> "I want to start this project, start creating an AI context based on this document: `complete_project_docs.md`."

#### Key Decisions Made
1. **Technology Stack Confirmed**:
   - Node.js runtime
   - Blessed library for terminal UI
   - JSON-based save system
   - Jest for comprehensive testing

2. **Game Mechanics Simplified**:
   - 3-stat system (Speed/Stamina/Power) instead of Uma Musume's 5-stat system
   - 12-turn career structure with 3 scheduled races
   - Energy and friendship systems for resource management

3. **Project Structure**:
   ```
   src/
   ├── models/        # Game logic (Character, Training, Race)
   ├── systems/       # Core systems (Game, UI)
   ├── data/          # JSON data and saves
   └── utils/         # Helper functions
   ```

### **Core Systems Development**

#### Character Model (`src/models/Character.js`)
- Implemented stat system with growth rates (S/A/B/C/D)
- Added mood system tied to energy levels
- Built friendship system with training bonuses
- Created serialization for save/load functionality

**Learning**: Balancing complexity vs. simplicity - decided on percentage-based calculations for intuitive understanding.

#### Training System (`src/models/Training.js`) 
- 5 training types with different costs and benefits
- Random events during training for engagement
- Secondary stat gains to prevent over-specialization
- Effectiveness calculations based on character state

**Challenge**: Making training feel meaningful - solved with visible stat gains and contextual effectiveness percentages.

#### Race Simulation (`src/models/Race.js`)
- Weighted stat formula: Speed (40%), Stamina (40%), Power (20%)
- Multiple race types emphasizing different stats
- AI competitor generation scaled to player level
- Commentary system for engagement

**Innovation**: Stamina factor system - current energy affects race performance, creating resource management tension.

### **UI Development**

#### Terminal Interface (`src/systems/UI.js`)
- Mouse and keyboard support using blessed library
- ASCII progress bars using █ and ░ characters
- Clickable training buttons with hover effects
- Responsive layout handling for different terminal sizes

**Discovery**: Terminal UIs can be surprisingly rich and engaging when well-designed.

#### Game Integration (`src/systems/Game.js`)
- State management for complete game flow
- Save/load system with JSON persistence
- Achievement system and legacy bonuses
- Career progression with milestone tracking

### **Testing Infrastructure**

#### Comprehensive Test Suite
- **Unit Tests**: Individual component validation
- **Integration Tests**: Full game flow testing
- **Performance Tests**: Memory usage and execution time benchmarks
- **UI Tests**: Terminal interface interaction simulation

#### Advanced Testing Tools (`tests/helpers/`)
- Mock data factories for consistent test scenarios
- Spy and stub utilities using Sinon
- Performance measurement utilities
- Error simulation for robustness testing

**Philosophy**: Test-driven development ensures stability and catches edge cases early.

### **Terminal Launcher System**

#### Cross-Platform Support
Added `src/launcher.js` to provide native terminal experience:
- **Windows**: PowerShell/CMD with proper branding
- **macOS**: Terminal.app via AppleScript
- **Linux**: Auto-detection of available terminal emulators

**User Experience**: `npm start` now opens a dedicated terminal window instead of cluttering development environment.

---

## **Late Afternoon - TDD Implementation Phase**

### **Test-First Approach**
User requested: "let's do all that, doing TDD, too."

#### Current Challenge: Integrating Game Logic with UI
**Problem**: Hello World demo needs to be replaced with actual game functionality.

**TDD Process**:
1. ✅ **Red**: Wrote comprehensive integration tests (`tests/integration/gameApp.test.js`)
2. 🔄 **Green**: Currently implementing `GameApp.js` to make tests pass
3. ⏳ **Refactor**: Will optimize once tests pass

#### Test Coverage Goals
- Application startup and state management
- Character creation flow with validation
- Training interface with real stat updates
- Race system integration with UI feedback
- Save/load functionality with file persistence
- Error handling and recovery

### **Technical Decisions in Flight**

#### UI System Adaptations
**Issue**: Blessed library requires active screen, breaking tests
**Solution**: Added mock layout support in `UISystem` constructor
```javascript
if (this.screen && this.screen.append) {
  this.setupMainLayout();
} else {
  this.setupMockLayout();
}
```

**Learning**: Good architecture anticipates testing needs from the start.

#### Game App Architecture
**Design Pattern**: Model-View-Controller approach
- `Game.js`: Business logic controller
- `UISystem.js`: View layer with blessed components
- `GameApp.js`: Application controller coordinating between systems

---

## **Evening - Blessed Rendering Issue Resolution**

### **Critical Bug Fix: "it doesn't work"**
**Time**: Late Afternoon  
**Issue**: User reported game launch failure - blessed components not rendering properly

#### Root Cause Analysis
**Problem**: UISystem was incorrectly detecting blessed screens vs. mock screens
- `screen.smartCSR` property was `undefined` instead of expected boolean
- This caused UISystem to fallback to mock layout instead of real blessed components
- Game launched but displayed no UI content

#### Solution Implementation
**Detection Method Update**: Changed blessed screen detection logic
```javascript
// Old (broken):
if (this.screen && this.screen.append && this.screen.smartCSR !== undefined)

// New (working):
if (this.screen && this.screen.append && this.screen.render && this.screen.title !== undefined)
```

**Testing Process**:
1. Added debug logging to trace UI initialization flow
2. Identified `screen.smartCSR = undefined` issue
3. Switched to multi-property detection approach
4. Confirmed blessed layout setup with "Setting up main layout..." output
5. Verified screen rendering with blessed control sequences

#### Technical Lessons
1. **Property Detection Fragility**: Relying on single property (`smartCSR`) proved unreliable
2. **Multi-Property Validation**: Using multiple blessed-specific properties creates robust detection
3. **Debug-First Approach**: Adding temporary logging quickly revealed the root cause
4. **Screen Lifecycle**: Blessed screens may not initialize all properties immediately

#### Result
✅ **Game Now Functional**: Terminal UI renders properly with blessed components  
✅ **Consistent Detection**: Same logic applied to both UISystem and GameApp  
✅ **Test Compatibility**: Mock system still works for unit tests  

**User Feedback**: Game launches and displays properly formatted terminal interface

---

## **Test-Driven Development Reset**

### **Pivoting to True TDD Approach**
**Time**: Evening Session 2  
**Trigger**: User feedback - "since i said we should do TDD, you'll really have to write more tests & writing as many scenarios, journeys, and just prioritize on defining what the app SHOULD do before the app does it"

#### Key Realization
**Problem**: Was fixing implementation then writing tests (backwards)  
**Solution**: Define complete behavior specifications FIRST

#### TDD Plan Created
**Document**: `docs/TDD_PLAN.md` - Comprehensive behavior specification
- **10 Major Sections**: Every feature fully specified
- **50+ Scenarios**: GIVEN/WHEN/THEN format
- **Clear Success Criteria**: Must/Should/Nice to have
- **Test-First Strategy**: Write tests → Make them pass

#### Behavior Categories Defined
1. **Main Menu**: Navigation, input handling, state management
2. **Character Creation**: Validation, initialization, error handling  
3. **Training Phase**: Energy system, stat gains, mood effects
4. **Race Execution**: Performance calculation, AI generation, results
5. **Career Completion**: Summary, grades, legacy bonuses
6. **Save/Load**: Persistence, validation, corruption handling
7. **Help System**: Context-sensitive help, navigation
8. **Error Handling**: Input validation, recovery, stability
9. **Performance**: Response times, memory usage, no leaks
10. **User Experience**: Feedback, navigation, accessibility

#### Testing Strategy Layers
1. **Unit Tests**: Core mechanics, formulas, calculations
2. **Integration Tests**: Complete user journeys
3. **Component Tests**: UI behaviors, transitions
4. **System Tests**: Performance, stability, stress

#### Critical Lesson
> "Define WHAT the app should do before HOW it does it"

**Impact**: Shifted from implementation-first to specification-first development

---

## **Development Philosophy & Learnings**

### **What's Working Well**
1. **Modular Architecture**: Each system can be tested independently
2. **TDD Approach**: Tests are catching integration issues early
3. **Terminal UI**: Blessed library provides rich terminal experience
4. **Cross-Platform**: Launcher works on Windows, macOS, and Linux

### **Challenges Encountered**
1. **Testing Terminal UIs**: Required mock system for headless testing
2. **Blessed Library Quirks**: Some functions don't exist (like `screen.focus()`)
3. **State Management**: Coordinating between game state and UI state
4. **File System Operations**: Ensuring save directory exists across platforms

### **Key Technical Insights**
1. **Terminal Games Have Character**: ASCII art and progress bars create engaging experience
2. **Resource Management Creates Tension**: Energy system adds strategic depth
3. **Random Variance Needs Balance**: 15% variance feels right for races
4. **Testing Saves Time**: Comprehensive tests catch bugs before manual testing

### **User Interaction Patterns**
- User prefers iterative development with working demos at each stage
- Emphasis on robust testing and error handling
- Interest in clean architecture and maintainable code
- Focus on user experience even in terminal applications

---

## **Next Steps & Roadmap**

### **Immediate Goals (TDD Continuation)**
1. Complete `GameApp.js` implementation to pass integration tests
2. Fix UI rendering issues with mock systems
3. Implement file-based save/load functionality
4. Add proper error handling and user feedback

### **Version 0.1.0 MVP Remaining**
- [ ] Connect all game systems through GameApp
- [ ] Character creation flow
- [ ] Working training interface with stat updates
- [ ] Race execution with live results
- [ ] Save/load integration
- [ ] Complete career flow testing
- [ ] Error handling polish

### **Future Considerations**
**Web Version (v3)**: Architecture document created for vanilla JS frontend with Node.js/MongoDB backend
**Additional Features**: Achievement system, multiple horse types, weather effects

---

## **Code Quality & Standards**

### **Established Patterns**
- ES6+ JavaScript with modern practices
- Comprehensive error handling with user-friendly messages  
- Extensive documentation and inline comments
- Test coverage targets: 80%+ overall, 95%+ core mechanics

### **Commit Strategy**
- Meaningful commit messages with context
- Feature branches for major additions
- Comprehensive documentation updates with each commit

---

## **Reflections & Meta-Learning**

### **Development Process**
The TDD approach is proving valuable - writing tests first is revealing design issues and forcing better architecture decisions. The mock system requirement pushed us to make the UI system more modular.

### **Game Design Insights**
The simplified stat system (3 instead of 5) is working well - easier to understand and balance. The energy/mood connection creates natural pacing breaks that prevent grinding.

### **Technical Growth**
Terminal applications can be surprisingly sophisticated. The blessed library provides rich UI capabilities that rival simple GUIs. Cross-platform terminal handling is more complex than expected but creates a professional user experience.

---

*This journal documents the organic development process, capturing both technical decisions and the reasoning behind them. It serves as a reference for future features and a learning log for the development journey.*