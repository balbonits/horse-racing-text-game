# UX Strategy & Testing Plan

## Core Philosophy
**"15-minute addictive sessions with one more run appeal"**

## Critical User Journeys

### 1. First-Time Player Journey (5 minutes)
```
Start Game → Main Menu → New Career → Name Horse → First Training → See Results → First Race → Understand Progress
```
**Success Criteria:**
- Player understands game mechanics within 2 minutes
- Clear feedback on every action
- No confusion about what numbers mean
- Immediate satisfaction from first training choice

### 2. Core Gameplay Loop (10 minutes)
```
Training Phase (8 turns) → Race Phase (3 races) → Career Results → Legacy Bonus → Start New Run
```
**Success Criteria:**
- Each training decision feels meaningful
- Clear stat progression visibility
- Race results clearly reflect training choices
- Legacy system encourages immediate replay

### 3. Power User Journey (15+ minutes)
```
Load Save → Review Stats → Strategic Training → Multiple Races → Save Progress → Plan Next Session
```
**Success Criteria:**
- Save/load is seamless and reliable
- Can quickly resume where left off
- Advanced strategies are rewarded
- Can track long-term progress

## Core Mechanics Testing Priority

### P0 - MUST WORK (Game Breaking)
1. **Main Menu Navigation**
   - Keys 1-4 work correctly
   - Q quits properly
   - Screen renders without errors

2. **Character Creation**
   - Name input works
   - Character is created with correct initial stats
   - Proceeds to training phase

3. **Training Execution**
   - Training options 1-5 are selectable
   - Stats actually increase
   - Energy decreases correctly
   - Turn counter advances

4. **Race Execution**
   - Races run automatically
   - Results are calculated correctly
   - Performance reflects stats

### P1 - SHOULD WORK (Core Experience)
1. **Save/Load System**
   - Can save at any point
   - Loads preserve exact state
   - Multiple save slots work

2. **Energy Management**
   - Rest restores energy
   - Can't train without energy
   - Clear energy display

3. **Mood System**
   - Mood affects training
   - Random events trigger
   - Mood changes are visible

### P2 - NICE TO HAVE (Polish)
1. **Visual Feedback**
   - Progress bars animate
   - Colors indicate good/bad
   - ASCII art enhances experience

2. **Help System**
   - Context-sensitive help
   - Tutorial mode
   - Controls reference

## Testing Strategy

### 1. Unit Tests (Existing)
- Character stat calculations ✓
- Training formulas ✓
- Race performance ✓

### 2. Integration Tests (Need Focus)
- **User Journey Tests**: Full flows from start to finish
- **State Transition Tests**: Menu → Game → Results
- **Input Validation Tests**: All keyboard/mouse inputs

### 3. Regression Tests (To Build)
```javascript
describe('Core User Journeys', () => {
  test('New player can complete first career', async () => {
    // Start game
    // Create character
    // Complete 8 training turns
    // Run 3 races
    // See results
  });

  test('Training choices affect race outcomes', async () => {
    // High speed training → Better sprint performance
    // High stamina training → Better long races
    // Balanced training → Consistent results
  });

  test('Save and load preserves game state', async () => {
    // Play 5 turns
    // Save game
    // Quit
    // Load game
    // Verify exact state
  });
});
```

## Input Testing Matrix

| Action | Keyboard | Mouse | Expected Result | Priority |
|--------|----------|-------|-----------------|----------|
| Main Menu Option 1 | Press '1' | Click "New Career" | Start character creation | P0 |
| Main Menu Option 2 | Press '2' | Click "Load Game" | Show save slots | P0 |
| Training Speed | Press '1' | Click Speed button | +Speed, -15 Energy | P0 |
| Training Stamina | Press '2' | Click Stamina button | +Stamina, -10 Energy | P0 |
| Rest | Press '4' | Click Rest button | +30 Energy | P0 |
| Quit | Press 'q' or ESC | Click X | Confirm & exit | P0 |
| Help | Press 'h' | Click Help | Show help screen | P1 |
| Save | Press 's' | Click Save | Save to slot | P1 |

## Error Scenarios to Test

### Critical Errors (Must Handle)
1. **No Energy for Training**: Show clear message, force rest
2. **Invalid Input**: Ignore or show feedback
3. **Save File Corrupted**: Graceful fallback
4. **Screen Resize**: Maintain layout

### Recovery Flows
1. **Accidental Quit**: Autosave or confirm dialog
2. **Wrong Menu Choice**: Back/Cancel options
3. **Misclick Training**: Undo last action (future)

## Visual Testing Checklist

### Screen States to Validate
- [ ] Main Menu renders correctly
- [ ] Character creation form displays
- [ ] Training menu shows all options
- [ ] Stats display accurately
- [ ] Energy bar updates visually
- [ ] Race progress animates
- [ ] Results screen formats properly
- [ ] Save/Load UI works

### Blessed Component Tests
```javascript
// Test blessed rendering without actual terminal
test('Main menu displays all options', () => {
  const screen = createMockScreen();
  const app = new GameApp(screen);
  
  expect(screen.content).toContain('1. New Career');
  expect(screen.content).toContain('2. Load Game');
  expect(screen.content).toContain('3. Help');
  expect(screen.content).toContain('4. Quit');
});
```

## Performance Criteria

### Response Times
- Input response: < 100ms
- Screen transition: < 200ms
- Save/Load: < 500ms
- Race calculation: < 1s

### Memory Usage
- Initial load: < 50MB
- After 1 hour play: < 100MB
- No memory leaks in training loop

## Automated Testing Implementation Plan

### Phase 1: Core Mechanics (Immediate)
1. Test main menu keyboard navigation
2. Test character creation flow
3. Test single training action
4. Test race execution

### Phase 2: Full Journeys (Next)
1. Complete career test
2. Save/load cycle test
3. Multiple races test
4. Energy management test

### Phase 3: Edge Cases (Later)
1. Rapid input handling
2. Screen resize handling
3. Corrupted save recovery
4. Network disconnection (future online)

## Success Metrics

### Must Pass (Launch Blocking)
- [ ] Can complete full career without errors
- [ ] All keyboard inputs work correctly
- [ ] Stats update as expected
- [ ] Races produce varied results
- [ ] Game exits cleanly

### Should Pass (Quality Bar)
- [ ] Save/load works reliably
- [ ] UI updates smoothly
- [ ] No visual glitches
- [ ] Help is accessible
- [ ] Feedback is immediate

### Nice to Pass (Polish)
- [ ] Animations are smooth
- [ ] Colors enhance understanding
- [ ] Sound effects (future)
- [ ] Achievements unlock
- [ ] Leaderboards work

## Testing Commands

```bash
# Run all tests
npm test

# Run journey tests
npm run test:journeys

# Run UI tests
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific journey
npm test -- --testNamePattern="New player can complete first career"
```

## Next Steps

1. **Implement Journey Tests**: Focus on core flows
2. **Fix Identified Issues**: Based on test failures
3. **Add Visual Regression**: Screenshot comparison
4. **Monitor Performance**: Track response times
5. **User Testing**: Get real player feedback

---

*This document guides all testing efforts. Update as new issues are discovered.*