# Test-Driven Development Plan
## Horse Racing Text Game - Complete Behavior Specification

## Philosophy
**Define WHAT the app should do before HOW it does it**

---

## 1. Main Menu Behaviors

### GIVEN: User starts the application
**WHEN:** The game launches  
**THEN:** 
- Main menu should display with 4 options
- Option 1: "New Career" should be visible
- Option 2: "Load Game" should be visible  
- Option 3: "Help" should be visible
- Option 4: "Quit" should be visible
- Status bar should show "Select an option (1-4) or press Q to quit"

### GIVEN: User is at main menu
**WHEN:** User presses '1'  
**THEN:** Navigate to character creation screen

**WHEN:** User presses '2'  
**THEN:** 
- IF saves exist: Show save slots
- IF no saves: Show "No saved games found" message

**WHEN:** User presses '3'  
**THEN:** Display help screen with controls and game rules

**WHEN:** User presses '4' or 'q'  
**THEN:** 
- Display "Thanks for playing" message
- Exit application cleanly
- Clean up all resources (no memory leaks)

**WHEN:** User presses invalid key (e.g., 'x', '9')  
**THEN:** Ignore input, remain at main menu

---

## 2. Character Creation Behaviors

### GIVEN: User selected "New Career" 
**WHEN:** Character creation screen appears  
**THEN:**
- Display prompt for horse name
- Show starting stats preview (Speed: 20, Stamina: 20, Power: 20)
- Show energy bar at 100/100
- Status should read "Enter horse name and press Enter..."

### GIVEN: User is naming their horse
**WHEN:** User enters valid name (1-20 characters, alphanumeric)  
**THEN:**
- Create character with that name
- Initialize stats: Speed=20, Stamina=20, Power=20
- Set energy to 100
- Set mood to "Normal"
- Set friendship to 0
- Transition to training phase
- Display "Welcome, [name]! Let's begin training!"

**WHEN:** User enters invalid name (empty, >20 chars, special chars)  
**THEN:**
- Show error: "Name must be 1-20 alphanumeric characters"
- Remain on character creation screen
- Allow retry

**WHEN:** User presses ESC  
**THEN:** Return to main menu without creating character

---

## 3. Training Phase Behaviors

### GIVEN: Character has been created
**WHEN:** Training phase begins  
**THEN:**
- Display turn counter (Turn 1/12)
- Show current stats with progress bars
- Show energy level
- Show mood indicator
- Display 5 training options
- Show "Select training (1-5)" in status

### Training Options Expected Behaviors:

#### Option 1: Speed Training
**GIVEN:** Character has ≥15 energy  
**WHEN:** User selects speed training  
**THEN:**
- Decrease energy by 15
- Increase speed by base amount (3-7)
- Apply mood modifier (Great: x1.2, Good: x1.1, Normal: x1.0, Bad: x0.8)
- Apply friendship bonus if friendship ≥80 (x1.5)
- 10% chance of random event
- Advance turn counter
- Show result: "Speed increased by X! (Current: Y)"

**GIVEN:** Character has <15 energy  
**WHEN:** User selects speed training  
**THEN:**
- Show error: "Not enough energy! You need rest."
- Do NOT advance turn
- Remain on training menu

#### Option 2: Stamina Training  
**GIVEN:** Character has ≥10 energy  
**WHEN:** User selects stamina training  
**THEN:**
- Decrease energy by 10
- Increase stamina by base amount (3-7)
- Apply modifiers same as speed
- Advance turn counter

#### Option 3: Power Training
**GIVEN:** Character has ≥15 energy  
**WHEN:** User selects power training  
**THEN:**
- Decrease energy by 15
- Increase power by base amount (3-7)
- Apply modifiers same as speed
- Advance turn counter

#### Option 4: Rest
**WHEN:** User selects rest  
**THEN:**
- Increase energy by 30 (max 100)
- 30% chance to improve mood
- Advance turn counter
- Show: "Rested well! Energy restored."

#### Option 5: Social Time
**GIVEN:** Character has ≥5 energy  
**WHEN:** User selects social time  
**THEN:**
- Decrease energy by 5
- Increase friendship by 10-15
- 50% chance to improve mood
- Advance turn counter
- Show: "Had fun! Friendship increased."

### Random Events (10% chance per training)
**WHEN:** Random event triggers  
**THEN one of:**
- Skill Breakthrough: +50% training gains
- Minor Injury: -10 energy, mood drops
- Perfect Day: All stats +2
- Friendship Event: +20 friendship

### Turn Progression
**GIVEN:** Any training action completes  
**WHEN:** Turn advances  
**THEN:**
- Increment turn counter
- IF turn > 12: Transition to race phase
- IF turn ≤ 12: Remain in training

---

## 4. Race Phase Behaviors

### GIVEN: Training phase complete (12 turns)
**WHEN:** Race phase begins  
**THEN:**
- Display "Race Day!" message
- Show 3 scheduled races
- Auto-run first race

### Race Execution
**GIVEN:** A race is about to run  
**WHEN:** Race starts  
**THEN:**
1. Generate 7 AI competitors with random stats (40-80 range)
2. Calculate player performance:
   - Base = (Speed × 0.4) + (Stamina × 0.4) + (Power × 0.2)
   - Apply distance modifiers:
     - Sprint (≤1200m): Speed weight increases to 0.6
     - Mile (1201-1800m): Balanced weights
     - Long (>1800m): Stamina weight increases to 0.6
   - Apply random variance (±15%)
3. Sort all 8 participants by performance
4. Assign positions 1-8
5. Display results with commentary

### Race Results Display
**WHEN:** Race completes  
**THEN:**
- Show position achieved (1st-8th)
- Display time (based on distance and performance)
- Show top 3 finishers
- Generate appropriate commentary:
  - 1st: "Amazing victory!"
  - 2nd-3rd: "Great performance!"
  - 4th-5th: "Solid effort"
  - 6th-8th: "Need more training"
- Update career stats (races won/total)
- Show "Press Enter to continue"

### Race Progression
**GIVEN:** User presses Enter after race  
**WHEN:** There are more races  
**THEN:** Run next race automatically

**WHEN:** All 3 races complete  
**THEN:** Transition to career complete screen

---

## 5. Career Completion Behaviors

### GIVEN: All races complete
**WHEN:** Career summary displays  
**THEN show:**
- Final stats (Speed/Stamina/Power)
- Race record (X wins / 3 races)
- Win rate percentage
- Total stat points gained
- Performance grade (S/A/B/C/D)
- Legacy bonuses earned

### Legacy Bonus Calculation
**BASED ON performance:**
- S Grade (3/3 wins): +5 to all stats next run
- A Grade (2/3 wins): +3 to highest stat
- B Grade (1/3 wins): +2 to one random stat
- C Grade (0/3 wins, high stats): +1 to one stat
- D Grade (0/3 wins, low stats): No bonus

### Post-Career Options
**WHEN:** User views career summary  
**THEN provide options:**
- Press Enter: Start new career (with legacy bonus)
- Press S: Save career results
- Press Q: Return to main menu

---

## 6. Save/Load System Behaviors

### Save Game
**GIVEN:** User is in training phase  
**WHEN:** User presses 'S'  
**THEN:**
- Create save file with:
  - Character name and stats
  - Current turn number
  - Energy and mood
  - Friendship level
  - Training history
  - Timestamp
- Show "Game saved!" message
- Continue playing

### Load Game
**GIVEN:** User selects "Load Game" from main menu  
**WHEN:** Save files exist  
**THEN:**
- Display list of saves with:
  - Character name
  - Turn X/12
  - Save date/time
- Allow selection (1-5)
- Load selected save
- Resume at exact state

**WHEN:** No saves exist  
**THEN:**
- Show "No saved games found"
- Return to main menu

### Save Validation
**WHEN:** Loading corrupted save  
**THEN:**
- Show "Save file corrupted"
- Offer to delete corrupted file
- Return to save selection

---

## 7. Help System Behaviors

### GIVEN: User presses 'H' from any screen
**WHEN:** Help displays  
**THEN show:**
- Game objective
- Controls reference
- Training explanations
- Stat explanations
- Tips for success
- "Press any key to return"

---

## 8. Error Handling Behaviors

### Input Errors
**WHEN:** Invalid input received  
**THEN:** 
- Ignore input
- Optionally flash error in status bar
- Remain on current screen

### System Errors
**WHEN:** File I/O error occurs  
**THEN:**
- Log error internally
- Show user-friendly message
- Provide recovery option
- Never crash

### Memory Management
**WHEN:** Game runs for extended time  
**THEN:**
- No memory leaks
- Stable performance
- Clean resource disposal

---

## 9. Performance Requirements

### Response Times
- Input response: < 100ms
- Screen transition: < 200ms  
- Training calculation: < 50ms
- Race simulation: < 500ms
- Save/Load: < 1 second

### Resource Usage
- Memory: < 100MB after 1 hour
- CPU: < 5% idle, < 25% active
- No memory leaks
- Clean shutdown

---

## 10. User Experience Requirements

### Feedback
- EVERY action provides immediate feedback
- Clear success/failure messages
- Progress always visible
- Stats changes highlighted

### Navigation
- Can always return to previous screen
- Can always access help
- Can always quit cleanly
- No dead ends

### Accessibility
- Clear text contrast
- Readable fonts
- Keyboard-only navigation
- No reliance on color alone

---

## Test Implementation Strategy

### Phase 1: Core Mechanics (Unit Tests)
1. Character creation validation
2. Stat calculations
3. Training formulas
4. Race performance algorithms
5. Save/load serialization

### Phase 2: User Journeys (Integration Tests)
1. Complete first-time player flow
2. Full career progression
3. Save and resume flow
4. Multiple career runs with legacy
5. Error recovery scenarios

### Phase 3: UI Behaviors (Component Tests)
1. Menu navigation
2. Input handling
3. Screen transitions
4. Display updates
5. Status messages

### Phase 4: System Tests
1. Memory leak detection
2. Performance benchmarks
3. Stress testing (1000 actions)
4. Edge case handling
5. Crash recovery

---

## Success Criteria

### Must Pass (Launch Blocking)
- [ ] Can complete full career without errors
- [ ] All inputs work as specified
- [ ] Stats calculate correctly
- [ ] Races produce varied results
- [ ] Save/load works reliably
- [ ] No crashes or hangs
- [ ] Memory stable over time

### Should Pass (Quality)
- [ ] All feedback immediate
- [ ] Transitions smooth
- [ ] Help accessible
- [ ] Errors handled gracefully
- [ ] Performance targets met

### Nice to Have (Polish)
- [ ] Animations smooth
- [ ] Sound effects work
- [ ] Achievements unlock
- [ ] Statistics tracking
- [ ] Replay system

---

## Testing Priorities

1. **P0 - Critical Path**: New game → Create character → Train → Race → Complete
2. **P1 - Core Features**: Save/Load, Help, All training types
3. **P2 - Edge Cases**: Invalid inputs, Corrupted saves, Resource limits
4. **P3 - Polish**: Animations, Statistics, Achievements

---

*This document defines the complete expected behavior of the application. All tests should verify these behaviors, and all implementation should satisfy these requirements.*