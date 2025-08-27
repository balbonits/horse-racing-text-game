# Standalone Terminal Build System

## Overview

The Horse Racing Text Game v1.0 includes a standalone build system that packages the Node.js application into single executable files for Windows, macOS, and Linux. Users can run the game directly without installing Node.js or dependencies.

## Build Tools

### Primary: pkg
We use [pkg](https://github.com/vercel/pkg) to compile Node.js applications into executables:
- **Lightweight**: Creates small, fast executables
- **Cross-platform**: Builds for Windows, macOS, Linux
- **Self-contained**: Includes Node.js runtime and dependencies
- **Terminal-optimized**: Perfect for CLI applications

### Alternative: nexe (backup)
[nexe](https://github.com/nexe/nexe) provides similar functionality with different trade-offs:
- **Smaller binaries**: More aggressive compression
- **Flexible**: More configuration options
- **Slower builds**: Takes longer to compile

## Build Configuration

### Package.json Build Scripts

```json
{
  "scripts": {
    "build": "npm run build:all",
    "build:all": "npm run build:win && npm run build:mac && npm run build:linux",
    "build:win": "pkg . --targets node16-win-x64 --output dist/horse-racing-game-win.exe",
    "build:mac": "pkg . --targets node16-macos-x64 --output dist/horse-racing-game-macos",
    "build:linux": "pkg . --targets node16-linux-x64 --output dist/horse-racing-game-linux",
    "build:current": "pkg . --output dist/horse-racing-game",
    "prebuild": "npm run test && npm run lint",
    "postbuild": "npm run package:dist"
  },
  "pkg": {
    "scripts": "src/**/*.js",
    "assets": [
      "src/data/**/*",
      "package.json"
    ],
    "outputPath": "dist/"
  }
}
```

### pkg Configuration

```json
{
  "pkg": {
    "scripts": [
      "src/**/*.js"
    ],
    "assets": [
      "src/data/**/*",
      "src/ui/templates/**/*",
      "package.json",
      "README.md"
    ],
    "targets": [
      "node16-win-x64",
      "node16-macos-x64", 
      "node16-linux-x64"
    ],
    "outputPath": "dist/",
    "options": [
      "--compress",
      "--no-bytecode"
    ]
  }
}
```

## Build Process

### 1. Pre-build Validation
```bash
# Run all tests
npm test

# Lint code
npm run lint

# Verify dependencies
npm audit

# Check build environment
node --version
npm --version
```

### 2. Asset Preparation
- Copy game data files
- Optimize images and resources
- Validate save file compatibility
- Package terminal fonts/themes

### 3. Cross-platform Compilation
```bash
# Build for all platforms
npm run build:all

# Or build individually
npm run build:win    # Windows .exe
npm run build:mac    # macOS binary
npm run build:linux  # Linux binary
```

### 4. Post-build Validation
- Test each executable
- Verify file sizes
- Check permissions
- Validate functionality

## Distribution Structure

```
dist/
├── horse-racing-game-win.exe      # Windows executable
├── horse-racing-game-macos        # macOS executable  
├── horse-racing-game-linux        # Linux executable
├── README.txt                     # Quick start guide
├── CHANGELOG.md                   # Version history
└── packages/                      # Platform-specific packages
    ├── horse-racing-game-win.zip
    ├── horse-racing-game-mac.zip
    └── horse-racing-game-linux.tar.gz
```

## Platform-Specific Considerations

### Windows (.exe)
- **Size**: ~50-80MB depending on dependencies
- **Requirements**: Windows 10+ (x64)
- **Installation**: Download and run - no installation needed
- **Saves**: Stored in `%APPDATA%/horse-racing-game/`
- **Permissions**: May trigger SmartScreen on first run

### macOS
- **Size**: ~60-90MB 
- **Requirements**: macOS 10.14+ (x64)
- **Installation**: Download, may need to allow in Security & Privacy
- **Saves**: Stored in `~/Library/Application Support/horse-racing-game/`
- **Signing**: Unsigned - users need to allow execution

### Linux
- **Size**: ~50-70MB
- **Requirements**: Most modern Linux distributions (x64)
- **Installation**: Download, make executable: `chmod +x horse-racing-game-linux`
- **Saves**: Stored in `~/.config/horse-racing-game/`
- **Dependencies**: Should be fully self-contained

## Build Scripts

### build.js (Build Automation)
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildSystem {
    async build() {
        console.log('🏗️  Starting Horse Racing Game build...');
        
        // Pre-build checks
        await this.preBuildValidation();
        
        // Clean dist directory
        await this.cleanDist();
        
        // Build for all platforms
        await this.buildAllPlatforms();
        
        // Post-build validation
        await this.postBuildValidation();
        
        // Package for distribution
        await this.packageDistribution();
        
        console.log('✅ Build completed successfully!');
    }
}
```

### release.js (Release Automation)
```javascript
#!/usr/bin/env node

class ReleaseSystem {
    async release(version) {
        // Update version numbers
        await this.updateVersion(version);
        
        // Build all platforms
        await this.buildAll();
        
        // Run comprehensive tests
        await this.runReleaseTests();
        
        // Create release packages
        await this.createPackages();
        
        // Generate checksums
        await this.generateChecksums();
        
        // Create release notes
        await this.createReleaseNotes();
    }
}
```

## Size Optimization

### Dependency Analysis
```bash
# Analyze bundle size
npm run analyze-bundle

# Remove unused dependencies
npm prune --production

# Check for duplicate modules
npm dedupe
```

### Code Optimization
- Remove development-only code
- Minify assets where possible
- Compress images and data files
- Tree-shake unused modules

### Asset Management
```javascript
// Only include production assets
const productionAssets = [
    'src/data/races.json',
    'src/data/horses.json',
    'package.json'
];
```

## Testing Standalone Builds

### Automated Testing
```bash
# Test Windows build (on Windows)
./dist/horse-racing-game-win.exe --test

# Test macOS build (on macOS) 
./dist/horse-racing-game-macos --test

# Test Linux build (on Linux)
./dist/horse-racing-game-linux --test
```

### Manual Testing Checklist
- [ ] Game starts without errors
- [ ] All menus navigate correctly
- [ ] Save/load functionality works
- [ ] Race simulations complete
- [ ] Career mode functions end-to-end
- [ ] Breeding system operates correctly
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable

## Distribution

### GitHub Releases
```yaml
# .github/workflows/release.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm install
    - run: npm test
    - run: npm run build:current
    - name: Upload artifacts
      uses: actions/upload-artifact@v2
      with:
        name: game-${{ matrix.os }}
        path: dist/
```

### Manual Distribution
1. **Build locally**: `npm run build:all`
2. **Test executables** on target platforms
3. **Package releases**: ZIP/TAR files with documentation
4. **Upload** to GitHub Releases or hosting platform
5. **Update documentation** with download links

## Troubleshooting

### Common Build Issues

**"Cannot resolve module"**
- Add missing modules to pkg assets
- Check file paths are correct
- Ensure all dependencies are listed

**"Executable too large"**
- Remove unused dependencies
- Exclude development files
- Use compression options

**"Permission denied"**
- Check executable permissions
- Verify platform-specific requirements
- Add code signing (for production)

### Platform-Specific Issues

**Windows SmartScreen**
- Expected for unsigned executables
- Users can click "More info" → "Run anyway"
- Consider code signing for production

**macOS Gatekeeper**
- Right-click → "Open" to bypass
- System Preferences → Security & Privacy → Allow
- Consider notarization for production

**Linux Dependencies**
- Should be fully self-contained
- Test on multiple distributions
- Check libc compatibility

## Development Workflow

### Local Testing
```bash
# Test current platform build
npm run build:current
./dist/horse-racing-game --version

# Quick iteration
npm run dev              # Development mode
npm run build:current    # Test build
./dist/horse-racing-game # Test executable
```

### CI/CD Integration
- Automated builds on push
- Cross-platform testing
- Release artifact generation
- Distribution automation

## Future Enhancements

### v1.1+
- **Auto-updater**: Check for new versions
- **Installer packages**: MSI, DMG, DEB packages
- **Code signing**: Remove security warnings
- **Crash reporting**: Telemetry for issues

### v2.0+
- **Plugin system**: Modular extensions
- **Theme packages**: Customizable UI themes
- **Language packs**: Localization support
- **Cloud integration**: Online features

---

*This build system enables easy distribution of the Horse Racing Text Game as a standalone application that works out-of-the-box on any modern desktop system.*