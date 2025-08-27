#!/usr/bin/env node
/**
 * Build Script for Horse Racing Text Game
 * 
 * Automates version management, git tagging, and release processes
 * Based on GitFlow and semantic versioning conventions
 * 
 * Usage:
 *   npm run build:major    # 1.0.0 -> 2.0.0
 *   npm run build:minor    # 1.0.0 -> 1.1.0  
 *   npm run build:patch    # 1.0.0 -> 1.0.1
 *   npm run build:release  # Create release branch
 *   npm run build:hotfix   # Create hotfix branch
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
    constructor() {
        this.packagePath = path.join(__dirname, '../package.json');
        this.versionPath = path.join(__dirname, '../src/version.js');
        this.changelogPath = path.join(__dirname, '../CHANGELOG.md');
        
        this.package = require(this.packagePath);
        this.currentVersion = this.package.version;
        this.buildDate = new Date().toISOString().split('T')[0];
        this.gitCommit = this.getGitCommit();
        this.gitBranch = this.getGitBranch();
    }

    // Git utility methods
    getGitCommit() {
        try {
            return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
        } catch (e) {
            return '';
        }
    }

    getGitBranch() {
        try {
            return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        } catch (e) {
            return '';
        }
    }

    isGitClean() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            return status.trim() === '';
        } catch (e) {
            return false;
        }
    }

    // Version calculation
    bumpVersion(type) {
        const [major, minor, patch] = this.currentVersion.split('.').map(Number);
        
        switch (type) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
            default:
                throw new Error(`Invalid version type: ${type}`);
        }
    }

    // Update version files
    updatePackageJson(newVersion) {
        this.package.version = newVersion;
        fs.writeFileSync(this.packagePath, JSON.stringify(this.package, null, 2) + '\n');
        console.log(`✓ Updated package.json to ${newVersion}`);
    }

    updateVersionJs(newVersion) {
        const [major, minor, patch] = newVersion.split('.').map(Number);
        
        const versionContent = `/**
 * Version Management System
 * 
 * Central version configuration for the Horse Racing Text Game.
 * This file is updated by the build script during releases.
 */

module.exports = {
    // Current version - Updated by build script
    VERSION: '${newVersion}',
    VERSION_MAJOR: ${major},
    VERSION_MINOR: ${minor},
    VERSION_PATCH: ${patch},
    VERSION_TAG: '',
    
    // Build metadata
    BUILD_DATE: '${this.buildDate}',
    BUILD_NUMBER: ${this.getBuildNumber() + 1},
    CODENAME: '${this.getCodename(newVersion)}',
    
    // Git information - Updated by build script
    GIT_COMMIT: '${this.gitCommit}',
    GIT_BRANCH: '${this.gitBranch}',
    
    // Compatibility ranges
    SAVE_COMPATIBILITY: {
        MIN_VERSION: '1.0.0',  // Minimum save file version we can load
        MAX_VERSION: '1.x.x',  // Maximum save file version we support
        CURRENT_FORMAT: '1.0'  // Current save format version
    },
    
    // Feature flags for version-specific features
    FEATURES: {
        breeding: true,
        trainers: true,
        trainer_dialog: true,
        modular_ui: true,
        stat_patterns: true,
        legacy_system: false,
        multiplayer: false,
        advanced_genetics: false,
        weather_system: false
    },
    
    // Version comparison utilities
    isCompatible(version) {
        if (!version) return false;
        
        const [major, minor] = version.split('.').map(Number);
        const [minMajor, minMinor] = this.SAVE_COMPATIBILITY.MIN_VERSION.split('.').map(Number);
        
        // Check minimum version
        if (major < minMajor || (major === minMajor && minor < minMinor)) {
            return false;
        }
        
        // Check maximum version (only major version matters for compatibility)
        if (major > this.VERSION_MAJOR) {
            return false;
        }
        
        return true;
    },
    
    needsMigration(version) {
        if (!version) return true;
        
        const [major, minor, patch] = version.split('.').map(Number);
        
        // Different major version always needs migration
        if (major !== this.VERSION_MAJOR) return true;
        
        // Same major, older minor might need migration
        if (minor < this.VERSION_MINOR) return true;
        
        return false;
    },
    
    getVersionString() {
        let version = \`v\${this.VERSION}\`;
        if (this.VERSION_TAG) {
            version += \`-\${this.VERSION_TAG}\`;
        }
        return version;
    },
    
    getFullVersionString() {
        let version = this.getVersionString();
        if (this.CODENAME) {
            version += \` "\${this.CODENAME}"\`;
        }
        if (this.BUILD_DATE) {
            version += \` (\${this.BUILD_DATE})\`;
        }
        return version;
    },
    
    getBuildInfo() {
        return {
            version: this.VERSION,
            build: this.BUILD_NUMBER,
            date: this.BUILD_DATE,
            commit: this.GIT_COMMIT,
            branch: this.GIT_BRANCH,
            codename: this.CODENAME
        };
    },
    
    // Get feature availability
    isFeatureEnabled(feature) {
        return this.FEATURES[feature] === true;
    },
    
    // Version history for changelog display
    HISTORY: [
        {
            version: '1.0.0',
            date: '2025-01-27',
            codename: 'Thunder Runner',
            highlights: [
                'Modular UI Architecture with Blessed.js',
                'Trainer Dialog System (3 personalities)',
                'Advanced Stat Generation (9 patterns)',
                'Genetic Inheritance System',
                'Comprehensive TDD test suite (70 tests)'
            ]
        }
    ]
};
`;
        
        fs.writeFileSync(this.versionPath, versionContent);
        console.log(`✓ Updated src/version.js to ${newVersion}`);
    }

    getBuildNumber() {
        try {
            const version = require(this.versionPath);
            return version.BUILD_NUMBER || 0;
        } catch (e) {
            return 0;
        }
    }

    getCodename(version) {
        // Version codenames based on horse racing themes
        const codenames = {
            '1.0': 'Thunder Runner',
            '1.1': 'Lightning Strike',
            '1.2': 'Storm Chaser',
            '2.0': 'Phoenix Rising',
            '2.1': 'Golden Gallop',
            '3.0': 'Midnight Champion'
        };
        
        const [major, minor] = version.split('.');
        const key = `${major}.${minor}`;
        return codenames[key] || 'Racing Spirit';
    }

    // Git operations
    createBranch(branchName) {
        try {
            execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
            console.log(`✓ Created and switched to branch: ${branchName}`);
        } catch (e) {
            console.error(`✗ Failed to create branch: ${branchName}`);
            throw e;
        }
    }

    commitChanges(version, message) {
        try {
            execSync('git add package.json src/version.js', { stdio: 'inherit' });
            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
            console.log(`✓ Committed version bump to ${version}`);
        } catch (e) {
            console.error(`✗ Failed to commit changes`);
            throw e;
        }
    }

    createTag(version, message) {
        try {
            execSync(`git tag -a v${version} -m "${message}"`, { stdio: 'inherit' });
            console.log(`✓ Created tag: v${version}`);
        } catch (e) {
            console.error(`✗ Failed to create tag: v${version}`);
            throw e;
        }
    }

    pushChanges(includeTags = false) {
        try {
            execSync(`git push origin ${this.gitBranch}`, { stdio: 'inherit' });
            if (includeTags) {
                execSync('git push origin --tags', { stdio: 'inherit' });
            }
            console.log(`✓ Pushed changes to origin/${this.gitBranch}`);
        } catch (e) {
            console.error(`✗ Failed to push changes`);
            throw e;
        }
    }

    // Main build operations
    bumpVersionAndRelease(type) {
        console.log(`🚀 Starting ${type} version bump...`);
        
        // Validate git state
        if (!this.isGitClean()) {
            throw new Error('Git working directory is not clean. Please commit or stash changes.');
        }

        // Calculate new version
        const newVersion = this.bumpVersion(type);
        console.log(`📦 Bumping version: ${this.currentVersion} → ${newVersion}`);

        // Update files
        this.updatePackageJson(newVersion);
        this.updateVersionJs(newVersion);

        // Git operations
        const commitMessage = `chore(release): bump version to ${newVersion}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
        
        this.commitChanges(newVersion, commitMessage);
        this.createTag(newVersion, `Release v${newVersion}`);

        console.log(`✅ Version ${newVersion} ready for release!`);
        console.log(`\n📋 Next steps:`);
        console.log(`   git push origin main --tags    # Push to remote`);
        console.log(`   npm publish                    # Publish to npm (if applicable)`);
    }

    createReleaseBranch() {
        console.log(`🌿 Creating release branch...`);
        
        if (!this.isGitClean()) {
            throw new Error('Git working directory is not clean. Please commit or stash changes.');
        }

        // Switch to develop (or main if develop doesn't exist)
        try {
            execSync('git checkout develop', { stdio: 'inherit' });
        } catch (e) {
            console.log('No develop branch found, using main');
            execSync('git checkout main', { stdio: 'inherit' });
        }

        // Pull latest changes
        execSync('git pull', { stdio: 'inherit' });

        // Calculate next minor version for release branch
        const nextVersion = this.bumpVersion('minor');
        const releaseBranch = `release/${nextVersion}`;

        this.createBranch(releaseBranch);
        console.log(`✅ Release branch ${releaseBranch} created!`);
        console.log(`\n📋 Release workflow:`);
        console.log(`   1. Make final adjustments and bug fixes`);
        console.log(`   2. Run: npm run build:minor`);
        console.log(`   3. Create PR to main branch`);
        console.log(`   4. After merge, create PR back to develop`);
    }

    createHotfixBranch() {
        console.log(`🔥 Creating hotfix branch...`);
        
        if (!this.isGitClean()) {
            throw new Error('Git working directory is not clean. Please commit or stash changes.');
        }

        // Switch to main
        execSync('git checkout main', { stdio: 'inherit' });
        execSync('git pull', { stdio: 'inherit' });

        // Calculate next patch version for hotfix
        const nextVersion = this.bumpVersion('patch');
        const hotfixBranch = `hotfix/${nextVersion}`;

        this.createBranch(hotfixBranch);
        console.log(`✅ Hotfix branch ${hotfixBranch} created!`);
        console.log(`\n📋 Hotfix workflow:`);
        console.log(`   1. Fix the critical issue`);
        console.log(`   2. Run: npm run build:patch`);
        console.log(`   3. Create PR to main branch`);
        console.log(`   4. After merge, cherry-pick to develop`);
    }

    // Cleanup old branches (based on GitFlow best practices)
    cleanupOldBranches() {
        console.log(`🧹 Cleaning up old branches...`);
        
        try {
            // Get all remote branches
            const remoteBranches = execSync('git branch -r', { encoding: 'utf8' })
                .split('\n')
                .map(branch => branch.trim())
                .filter(branch => branch && !branch.includes('->'));

            // Identify branches to clean up (older than 3 months)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const branchesToDelete = [];

            for (const branch of remoteBranches) {
                const branchName = branch.replace('origin/', '');
                
                // Skip protected branches
                if (['main', 'develop'].includes(branchName)) continue;
                
                // Skip current release/hotfix branches (assume they're active)
                if (branchName.startsWith('release/') || branchName.startsWith('hotfix/')) {
                    // Could add logic to check if they're merged
                    continue;
                }

                // Check if feature/fix branches are older than 3 months and merged
                if (branchName.startsWith('feature/') || branchName.startsWith('fix/')) {
                    try {
                        const lastCommit = execSync(`git log -1 --format=%ct origin/${branchName}`, { encoding: 'utf8' });
                        const commitDate = new Date(parseInt(lastCommit.trim()) * 1000);
                        
                        if (commitDate < threeMonthsAgo) {
                            // Check if merged to main
                            try {
                                execSync(`git merge-base --is-ancestor origin/${branchName} origin/main`, { stdio: 'pipe' });
                                branchesToDelete.push(branchName);
                            } catch (e) {
                                console.log(`⚠️  Branch ${branchName} is old but not merged to main`);
                            }
                        }
                    } catch (e) {
                        console.log(`⚠️  Could not check commit date for ${branchName}`);
                    }
                }
            }

            if (branchesToDelete.length === 0) {
                console.log('✅ No old branches to clean up');
                return;
            }

            console.log(`📋 Found ${branchesToDelete.length} old merged branches to delete:`);
            branchesToDelete.forEach(branch => console.log(`   - ${branch}`));

            // In a real scenario, you might want to prompt for confirmation
            console.log('\n⚠️  This is a dry run. To actually delete branches, uncomment the deletion code.');
            
            // Uncomment these lines to actually delete branches
            // for (const branch of branchesToDelete) {
            //     try {
            //         execSync(`git push origin --delete ${branch}`, { stdio: 'inherit' });
            //         console.log(`✓ Deleted remote branch: ${branch}`);
            //     } catch (e) {
            //         console.error(`✗ Failed to delete branch: ${branch}`);
            //     }
            // }

        } catch (e) {
            console.error('Failed to cleanup branches:', e.message);
        }
    }

    // Show current version info
    showVersionInfo() {
        console.log(`📦 Current Version Info:`);
        console.log(`   Version: ${this.currentVersion}`);
        console.log(`   Branch: ${this.gitBranch}`);
        console.log(`   Commit: ${this.gitCommit}`);
        console.log(`   Build Date: ${this.buildDate}`);
    }
}

// CLI Interface
function main() {
    const versionManager = new VersionManager();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'major':
                versionManager.bumpVersionAndRelease('major');
                break;
            case 'minor':
                versionManager.bumpVersionAndRelease('minor');
                break;
            case 'patch':
                versionManager.bumpVersionAndRelease('patch');
                break;
            case 'release':
                versionManager.createReleaseBranch();
                break;
            case 'hotfix':
                versionManager.createHotfixBranch();
                break;
            case 'cleanup':
                versionManager.cleanupOldBranches();
                break;
            case 'info':
                versionManager.showVersionInfo();
                break;
            default:
                console.log(`
🐎 Horse Racing Text Game - Build Script

Usage:
  npm run build:major     # 1.0.0 -> 2.0.0 (breaking changes)
  npm run build:minor     # 1.0.0 -> 1.1.0 (new features)
  npm run build:patch     # 1.0.0 -> 1.0.1 (bug fixes)
  npm run build:release   # Create release/x.x.x branch
  npm run build:hotfix    # Create hotfix/x.x.x branch
  npm run build:cleanup   # Clean up old merged branches
  npm run build:info      # Show current version info

Examples:
  npm run build:minor     # Most common for feature releases
  npm run build:patch     # For bug fix releases
  npm run build:release   # Start release preparation
                `);
        }
    } catch (error) {
        console.error(`❌ Build failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = VersionManager;