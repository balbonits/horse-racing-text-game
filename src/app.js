const blessed = require('blessed');

// Create a screen object
const screen = blessed.screen({
  smartCSR: true,
  title: 'Uma Musume Text Clone - Hello World',
  mouse: true,
  keys: true,
  vi: false
});

// Create a box for the main content
const mainBox = blessed.box({
  top: 'center',
  left: 'center',
  width: '80%',
  height: '70%',
  content: '',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    }
  }
});

// Create title box
const titleBox = blessed.box({
  top: 0,
  left: 'center',
  width: '80%',
  height: 3,
  content: '{center}{bold}🐴 Uma Musume Text Clone - Hello World! 🐴{/bold}{/center}',
  tags: true,
  style: {
    fg: 'yellow',
    bg: 'black'
  }
});

// Create clickable training buttons
const createButton = (parent, top, left, width, height, label, key) => {
  const button = blessed.box({
    parent: parent,
    top: top,
    left: left,
    width: width,
    height: height,
    content: `{center}${label}{/center}`,
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: '#888888'
      },
      hover: {
        bg: 'blue'
      }
    },
    mouse: true,
    clickable: true
  });
  
  button.on('click', () => {
    statusBar.setContent(`{center}${label} selected! (Key: ${key}) | Click buttons or use keys{/center}`);
    screen.render();
  });
  
  return button;
};

// Create menu options
const menuBox = blessed.box({
  parent: mainBox,
  top: 2,
  left: 2,
  width: '96%',
  height: '80%',
  content: `{center}{bold}Welcome to Terminal Horse Racing!{/bold}{/center}

{bold}Game Preview:{/bold}
┌─────────────────────────────────────────────┐
│ 🐎 Current Horse: Lightning Bolt           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Speed:   ████████░░ (80/100)               │
│ Stamina: ██████░░░░ (60/100)               │  
│ Power:   ███████░░░ (70/100)               │
│ Energy:  ███████░░░ (70/100)               │
└─────────────────────────────────────────────┘

{bold}Training Options (Click or use keys):{/bold}`,
  tags: true,
  style: {
    fg: 'white'
  }
});

// Create clickable training buttons
createButton(menuBox, 10, 2, 20, 3, '1. Speed Training', '1');
createButton(menuBox, 10, 24, 20, 3, '2. Stamina Training', '2');
createButton(menuBox, 10, 46, 20, 3, '3. Power Training', '3');
createButton(menuBox, 14, 2, 20, 3, '4. Rest Day', '4');
createButton(menuBox, 14, 24, 20, 3, '5. Social Time', '5');

// Add race info
const raceInfoBox = blessed.box({
  parent: menuBox,
  top: 18,
  left: 2,
  width: '90%',
  height: 8,
  content: `{bold}Race Schedule:{/bold}
  • Sprint Race (1200m)  - Next Sunday
  • Mile Race (1600m)    - In 2 weeks  
  • Long Race (2000m)    - Season Finale

{bold}Controls:{/bold} Keys 1-5, 'r' for races, 'q' to quit, 'h' for help
{bold}Mouse:{/bold} Click on training buttons above!`,
  tags: true,
  style: {
    fg: 'cyan'
  }
});

// Create status bar
const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  content: '{center}Press ESC or Ctrl+C to exit | Mouse enabled - click buttons or use keyboard{/center}',
  tags: true,
  style: {
    fg: 'black',
    bg: 'white'
  }
});

// Add boxes to screen
screen.append(titleBox);
screen.append(mainBox);
screen.append(statusBar);

// Handle key events
screen.key(['escape', 'q', 'C-c'], function() {
  return process.exit(0);
});

screen.key(['1', '2', '3', '4', '5'], function(ch) {
  const actions = {
    '1': 'Speed Training selected! 🏃‍♂️',
    '2': 'Stamina Training selected! 💪', 
    '3': 'Power Training selected! ⚡',
    '4': 'Rest Day selected! 😴',
    '5': 'Social Time selected! 👥'
  };
  
  statusBar.setContent(`{center}${actions[ch]} | Press ESC to exit{/center}`);
  screen.render();
});

screen.key(['r'], function() {
  statusBar.setContent('{center}Race schedule opened! 🏁 | Press ESC to exit{/center}');
  screen.render();
});

screen.key(['h'], function() {
  statusBar.setContent('{center}Help menu opened! 📖 | Press ESC to exit{/center}');
  screen.render();
});

// Initial render
screen.render();

console.log('\n🎮 Uma Musume Text Clone - Hello World Demo');
console.log('The terminal UI should now be displayed above.');
console.log('Try pressing 1-5, r, or h to see interactive features!');
console.log('Press ESC or Ctrl+C to exit.\n');