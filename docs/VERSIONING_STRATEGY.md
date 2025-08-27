# Versioning & Branching Strategy

## Version Numbering System

We follow **Semantic Versioning (SemVer)** with game-specific adaptations:

### Format: `MAJOR.MINOR.PATCH-TAG`

- **MAJOR**: Breaking changes, complete rewrites, or fundamental gameplay changes
- **MINOR**: New features, significant improvements, backward-compatible additions
- **PATCH**: Bug fixes, balance adjustments, minor improvements
- **TAG**: Pre-release identifiers (alpha, beta, rc)

### Examples:
- `1.0.0` - First stable release with core features
- `1.1.0` - Added breeding system
- `1.1.1` - Fixed breeding stat calculation bug
- `2.0.0-alpha` - Major UI overhaul in testing
- `2.0.0-rc.1` - Release candidate for v2

## Branch Strategy

### Core Branches (Protected)

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Requires PR with reviews
- **Merges from**: `release/*` branches only
- **Tags**: Official version tags (e.g., `v1.0.0`)

#### `develop`
- **Purpose**: Integration branch for next release
- **Protection**: Requires PR with passing tests
- **Merges from**: `feature/*`, `fix/*` branches
- **Merges to**: `release/*` branches

### Working Branches

#### `feature/*`
- **Naming**: `feature/trainer-personalities`, `feature/breeding-ui`
- **Purpose**: New features and enhancements
- **Lifetime**: Until merged to `develop`
- **Base**: Branch from `develop`
- **Merge**: PR to `develop`

#### `fix/*`
- **Naming**: `fix/race-calculation`, `fix/save-corruption`
- **Purpose**: Bug fixes for development
- **Lifetime**: Until merged to `develop`
- **Base**: Branch from `develop`
- **Merge**: PR to `develop`

#### `hotfix/*`
- **Naming**: `hotfix/critical-crash`, `hotfix/save-load-error`
- **Purpose**: Critical production fixes
- **Lifetime**: Until merged to both `main` and `develop`
- **Base**: Branch from `main`
- **Merge**: PR to `main` AND `develop`

### Release Branches

#### `release/*`
- **Naming**: `release/1.1.0`, `release/2.0.0`
- **Purpose**: Release preparation and testing
- **Lifetime**: Until release is finalized
- **Base**: Branch from `develop`
- **Merge**: PR to `main` (and back to `develop`)
- **Activities**:
  - Final testing
  - Documentation updates
  - Version bumping
  - Release notes preparation

### Archive Branches

#### `archive/*`
- **Naming**: `archive/v1`, `archive/legacy-ui`
- **Purpose**: Historical snapshots
- **Lifetime**: Permanent
- **Base**: Tagged releases
- **No merges**: Read-only reference

## Version Management

### Version Files

#### `package.json`
```json
{
  "name": "horse-racing-text-game",
  "version": "1.0.0",
  "gameVersion": {
    "major": 1,
    "minor": 0,
    "patch": 0,
    "tag": "stable"
  }
}
```

#### `src/version.js`
```javascript
module.exports = {
  VERSION: '1.0.0',
  BUILD_DATE: '2025-01-27',
  CODENAME: 'Thunder Runner',
  
  // Compatibility checks
  MIN_SAVE_VERSION: '1.0.0',
  MAX_SAVE_VERSION: '1.x.x',
  
  // Feature flags
  FEATURES: {
    breeding: true,
    trainers: true,
    legacy: false,
    multiplayer: false
  }
};
```

### Version Display

In-game version display:
```
Horse Racing Text Game v1.0.0
"Thunder Runner" - Built: 2025-01-27
```

## Release Process

### 1. Feature Development
```bash
# Create feature branch
git checkout develop
git checkout -b feature/new-trainer-system

# Work on feature with TDD
# Write tests → Implement → Document

# Push and create PR
git push origin feature/new-trainer-system
# PR → develop (requires review)
```

### 2. Release Preparation
```bash
# When ready for release
git checkout develop
git checkout -b release/1.1.0

# Update versions
npm version minor  # Updates package.json
# Update src/version.js manually
# Update CHANGELOG.md

# Final testing and fixes
# Only bug fixes allowed, no new features

git push origin release/1.1.0
```

### 3. Release Finalization
```bash
# After testing complete
# PR → main (requires review)

# After merge to main
git checkout main
git pull
git tag -a v1.1.0 -m "Release v1.1.0: Trainer System"
git push origin v1.1.0

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

### 4. Hotfix Process
```bash
# Critical bug in production
git checkout main
git checkout -b hotfix/save-corruption

# Fix issue with tests
# Update patch version

git push origin hotfix/save-corruption
# PR → main (expedited review)

# After merge
git tag -a v1.0.1 -m "Hotfix v1.0.1: Save corruption fix"
git push origin v1.0.1

# Merge to develop
git checkout develop
git merge main
```

## Changelog Management

### `CHANGELOG.md` Format
```markdown
# Changelog

All notable changes documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
### Added
- Feature currently in development

## [1.1.0] - 2025-01-28
### Added
- Trainer personality system with 3 unique trainers
- Stat-based dialog responses
- Relationship tracking

### Changed
- Improved stat generation with 9 variation patterns
- Enhanced breeding inheritance calculations

### Fixed
- Race result calculation overflow
- Save file corruption on special characters

## [1.0.0] - 2025-01-27
### Added
- Initial release
- Core training mechanics
- Race simulation
- Save/load system
```

## Version Compatibility

### Save File Compatibility
```javascript
// In save system
const saveData = {
  version: '1.1.0',
  timestamp: Date.now(),
  data: { /* game data */ }
};

// Version check on load
function loadSave(saveData) {
  if (!isCompatibleVersion(saveData.version)) {
    return migrateSaveData(saveData);
  }
  return saveData;
}
```

### Migration Strategy
- **Major versions**: May break compatibility, offer migration tool
- **Minor versions**: Backward compatible, auto-migrate
- **Patch versions**: Fully compatible, no migration needed

## Git Commit Standards

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature (MINOR version)
- `fix`: Bug fix (PATCH version)
- `BREAKING`: Breaking change (MAJOR version)
- `docs`: Documentation only
- `style`: Code style (formatting, etc)
- `refactor`: Code restructuring
- `test`: Test additions/fixes
- `chore`: Build process, dependencies

### Examples
```bash
feat(breeding): add genetic inheritance system

Implement realistic genetic inheritance with:
- Parent stat averaging with ±15% variation
- Breed characteristic preservation
- Hybrid vigor for crossbreeding

Closes #42

---

fix(save): prevent corruption on special characters

Escape special characters in horse names before 
JSON serialization to prevent save file corruption.

Fixes #55

---

BREAKING(ui): migrate from blessed to terminal-kit

Complete UI framework migration. Saves from v1.x
will need migration tool to work with v2.0.

Migration tool: scripts/migrate-v1-saves.js
```

## Release Schedule

### Version Cadence
- **MAJOR**: 6-12 months (significant milestones)
- **MINOR**: 4-6 weeks (feature releases)
- **PATCH**: As needed (bug fixes)

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped correctly
- [ ] Migration guide (if needed)
- [ ] Release notes drafted
- [ ] Performance benchmarks run
- [ ] Cross-platform testing complete

## Version History Tracking

### Release Tags
```bash
# List all versions
git tag -l "v*"

# Get release info
git show v1.0.0

# Diff between versions
git diff v1.0.0..v1.1.0
```

### Branch Archive
After major versions, archive old branches:
```bash
git checkout main
git branch archive/v1-legacy v1
git push origin archive/v1-legacy
git branch -d v1  # Delete local
git push origin --delete v1  # Delete remote
```

## Implementation Priority

### Immediate Actions
1. Create `develop` branch from current `main`
2. Implement version.js file
3. Set up branch protection rules
4. Create initial CHANGELOG.md
5. Tag current state as v1.0.0

### Next Steps
1. Migrate current v1 work to proper release branch
2. Establish PR templates
3. Set up automated version bumping
4. Create release automation scripts

---

This strategy ensures clean version history, predictable releases, and maintainable codebase growth.