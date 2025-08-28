# Horse Racing Game v1.0 - Standalone Distribution

## Download & Play Immediately

**No Node.js installation required!** Choose your platform and start playing:

### Windows
```bash
# Download and run
horse-racing-game-win.exe
```

### macOS  
```bash
# Make executable and run
chmod +x horse-racing-game-macos
./horse-racing-game-macos
```

### Linux
```bash  
# Make executable and run
chmod +x horse-racing-game-linux
./horse-racing-game-linux
```

## Command Line Options

```bash
# Start normally with splash screen
./horse-racing-game-macos

# Skip splash screen, go straight to main menu
./horse-racing-game-macos --no-splash

# Quick start with test character (for testing)
./horse-racing-game-macos --quick-start

# Enable debug mode with verbose logging  
./horse-racing-game-macos --debug

# Show version information
./horse-racing-game-macos --version

# Show help and all available options
./horse-racing-game-macos --help
```

## What's New in v1.0

### 🏗️ **Revolutionary Architecture**
- **Horse Racing API**: Complete separation of game logic from UI
- **Cross-Platform**: Windows, macOS, Linux standalone executables
- **Event-Driven**: Modern architecture supporting future expansion

### 🐎 **Horse Specialization System**
- **3 Unique Breeds**: 
  - **Thoroughbred**: Balanced and versatile (+10% speed/stamina training)
  - **Arabian**: Endurance specialist (+40% stamina training, dominates long races)  
  - **Quarter Horse**: Sprint demon (+30% speed training, explosive in short races)

- **4 Racing Styles**:
  - **Front Runner**: Lead from start, control the pace
  - **Stalker**: Balanced positioning, tactical flexibility
  - **Closer**: Save energy for devastating late kicks
  - **Wire-to-Wire**: Rare perfect pacing style for elite horses

### 🏁 **Enhanced Racing**
- **Dynamic Race Names**: 2000+ authentic combinations 
- **Track Conditions**: Dirt (Fast/Good/Muddy/Sloppy) and Turf (Firm/Good/Yielding/Soft)
- **Weather Effects**: Clear/Cloudy/Windy/Rainy conditions
- **Strategic Depth**: Breed + Style + Surface combinations create unique builds

### 🎮 **Game Features**
- **24-Turn Careers**: Extended gameplay with 4 major races
- **Advanced Save System**: Multiple save slots with full persistence
- **Professional UI**: Clean terminal interface with progress bars
- **Comprehensive Help**: Built-in help system and command options

## Quick Start Guide

1. **Download** the executable for your platform
2. **Run** the executable (make it executable on macOS/Linux first)
3. **Create** your horse with a unique name
4. **Train** strategically using 5 training types
5. **Race** in 4 major competitions throughout your career
6. **Specialize** with breeds and racing styles for optimal performance

## Game Controls

### Main Menu
- `1` - Start New Career
- `2` - Tutorial (Coming in v2)  
- `3` - Load Game
- `4` - Help
- `Q` - Quit

### Character Creation
- **Type name** and press ENTER
- `G` - Generate name suggestions
- `1-6` - Select from generated names
- `Q` - Back to main menu

### Training
- `1` - Speed Training (15 energy)
- `2` - Stamina Training (10 energy)
- `3` - Power Training (15 energy)  
- `4` - Rest Day (+30 energy)
- `5` - Media Day (+15 energy, builds relationships)
- `S` - Save Game
- `Q` - Quit to Main Menu

### Racing
- `1` - Front Runner Strategy
- `2` - Mid Pack Strategy  
- `3` - Late Closer Strategy
- **ENTER** - Continue/Fast forward

## System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18+)
- **RAM**: 64MB minimum
- **Disk Space**: 50MB
- **Display**: Terminal/Command line support

## File Locations

### Save Files
- **Windows**: `%APPDATA%/horse-racing-game/saves/`  
- **macOS**: `~/Library/Application Support/horse-racing-game/saves/`
- **Linux**: `~/.config/horse-racing-game/saves/`

### Logs (Debug Mode)
- **All Platforms**: Same directory as save files, `debug.log`

## Troubleshooting

### "Permission denied" (macOS/Linux)
```bash
chmod +x horse-racing-game-macos
# or
chmod +x horse-racing-game-linux
```

### "File cannot be opened" (macOS)
Right-click → Open → "Open anyway" (first time only)

### Game won't start
1. Try with `--debug` flag to see error messages
2. Check terminal/command prompt for error output
3. Ensure you have sufficient permissions

### Save files not working
1. Check file permissions in save directory
2. Try running with administrator/sudo (not recommended long-term)
3. Check available disk space

## Technical Details

- **Engine**: Node.js v18 (embedded, no installation required)
- **Architecture**: Event-driven, async/await based API
- **Performance**: O(1) input handling, efficient memory usage
- **Saves**: JSON format, human-readable
- **Executable Size**: ~40MB (includes Node.js runtime)

## What's Coming in v2

- **Named Rivals**: Memorable competitors with backstories
- **Rich Storylines**: Dynamic narrative generation
- **Enhanced Commentary**: Context-aware race descriptions  
- **Web Interface**: Optional browser-based UI
- **Multiplayer**: Tournament and competition modes
- **i18n/Localization**: Multiple language support

## Feedback & Support

Found a bug or have suggestions? 

- **Issues**: Report at project repository
- **Discussions**: Community feedback and ideas  
- **API Documentation**: See `docs/HORSE_RACING_API.md`

---

**Enjoy your horse racing career!** 🏇

*Horse Racing Game v1.0 - Built with the Horse Racing API*