#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

/**
 * Terminal Launcher for Uma Musume Text-Based Clone
 * Opens the game in a new terminal window for better experience
 */

class TerminalLauncher {
  constructor() {
    this.platform = os.platform();
    this.appPath = path.join(__dirname, 'app.js');
  }

  // Get the appropriate terminal command for the current platform
  getTerminalCommand() {
    switch (this.platform) {
      case 'win32':
        // Windows - try PowerShell first, then cmd
        if (this.hasCommand('powershell')) {
          return {
            command: 'powershell',
            args: [
              '-NoExit',
              '-Command',
              `& {
                Write-Host '🐴 Uma Musume Text-Based Clone 🐴' -ForegroundColor Yellow
                Write-Host 'Starting game in terminal mode...' -ForegroundColor Cyan
                Write-Host ''
                $env:LAUNCHED_FROM_LAUNCHER='true'; node "${this.appPath.replace(/\\/g, '\\\\')}"
              }`
            ]
          };
        } else {
          return {
            command: 'cmd',
            args: ['/k', `set LAUNCHED_FROM_LAUNCHER=true && node "${this.appPath}"`]
          };
        }

      case 'darwin':
        // macOS - use Terminal.app
        return {
          command: 'osascript',
          args: [
            '-e',
            `tell application "Terminal" to do script "echo '🐴 Uma Musume Text-Based Clone 🐴'; echo 'Starting game...'; echo ''; export LAUNCHED_FROM_LAUNCHER=true; node '${this.appPath}'"`
          ]
        };

      case 'linux':
        // Linux - try various terminal emulators
        const terminals = [
          'gnome-terminal',
          'konsole',
          'xterm',
          'xfce4-terminal',
          'terminator'
        ];

        for (const terminal of terminals) {
          if (this.hasCommand(terminal)) {
            if (terminal === 'gnome-terminal') {
              return {
                command: terminal,
                args: ['--', 'bash', '-c', `echo "🐴 Uma Musume Text-Based Clone 🐴"; echo "Starting game..."; echo ""; export LAUNCHED_FROM_LAUNCHER=true; node "${this.appPath}"; read -p "Press Enter to exit..."`]
              };
            } else if (terminal === 'konsole') {
              return {
                command: terminal,
                args: ['-e', 'bash', '-c', `echo "🐴 Uma Musume Text-Based Clone 🐴"; echo "Starting game..."; echo ""; export LAUNCHED_FROM_LAUNCHER=true; node "${this.appPath}"; read -p "Press Enter to exit..."`]
              };
            } else {
              return {
                command: terminal,
                args: ['-e', `bash -c "export LAUNCHED_FROM_LAUNCHER=true; node \\"${this.appPath}\\""`]
              };
            }
          }
        }

        // Fallback to direct execution if no terminal found
        console.log('⚠️  No suitable terminal emulator found, running directly...');
        return null;

      default:
        console.log(`⚠️  Unsupported platform: ${this.platform}, running directly...`);
        return null;
    }
  }

  // Check if a command exists on the system
  hasCommand(command) {
    try {
      const checkCmd = this.platform === 'win32' ? 'where' : 'which';
      const result = require('child_process').execSync(`${checkCmd} ${command}`, { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      return result.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  // Launch the game in a new terminal
  async launch() {
    console.log('🎮 Uma Musume Text-Based Clone Launcher');
    console.log('=====================================');
    
    const terminalCmd = this.getTerminalCommand();
    
    if (!terminalCmd) {
      console.log('🚀 Starting game directly in current terminal...\n');
      this.runDirectly();
      return;
    }

    try {
      console.log(`🔧 Platform: ${this.platform}`);
      console.log(`📱 Opening new terminal window...`);
      console.log('💡 Close this window after the game starts in the new terminal.\n');

      // Spawn the new terminal process
      const child = spawn(terminalCmd.command, terminalCmd.args, {
        detached: true,
        stdio: 'ignore'
      });

      child.unref(); // Allow the parent process to exit independently

      // Wait a moment for the terminal to launch
      setTimeout(() => {
        console.log('✅ Game should now be running in a new terminal window!');
        console.log('💡 If the terminal didn\'t open, you can run: npm run start:direct');
        
        // Exit the launcher after successful spawn
        if (this.platform !== 'win32') {
          process.exit(0);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Failed to open new terminal window:', error.message);
      console.log('🔄 Falling back to direct execution...\n');
      this.runDirectly();
    }
  }

  // Fallback: run the game directly in the current terminal
  runDirectly() {
    try {
      console.log('🎯 Loading game...\n');
      require(this.appPath);
    } catch (error) {
      console.error('❌ Failed to start the game:', error.message);
      console.error('🐛 Please check that all dependencies are installed: npm install');
      process.exit(1);
    }
  }

  // Display help information
  displayHelp() {
    console.log(`
🎮 Uma Musume Text-Based Clone Launcher
=====================================

Usage:
  npm start              Launch game in new terminal window
  npm run start:direct   Run game directly in current terminal
  npm run dev            Development mode with auto-restart

Options:
  --help, -h            Show this help message
  --direct              Skip launcher and run directly
  --debug               Show debug information

Platform Support:
  ✅ Windows (PowerShell/CMD)
  ✅ macOS (Terminal.app)
  ✅ Linux (GNOME Terminal, Konsole, XTerm, etc.)

Controls:
  1-5       Training options
  R         Race schedule
  S         Save game
  L         Load game
  H         Help
  Q/ESC     Quit game

For more information, see README.md
`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    const launcher = new TerminalLauncher();
    launcher.displayHelp();
    return;
  }

  if (args.includes('--direct')) {
    const launcher = new TerminalLauncher();
    launcher.runDirectly();
    return;
  }

  if (args.includes('--debug')) {
    console.log('🔍 Debug Info:');
    console.log(`Platform: ${os.platform()}`);
    console.log(`Architecture: ${os.arch()}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Working Directory: ${process.cwd()}`);
    console.log('');
  }

  // Launch the game
  const launcher = new TerminalLauncher();
  await launcher.launch();
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  console.log('🔄 Falling back to direct execution...\n');
  const launcher = new TerminalLauncher();
  launcher.runDirectly();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
});

// Run the launcher
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Launcher failed:', error.message);
    process.exit(1);
  });
}

module.exports = TerminalLauncher;