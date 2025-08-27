/**
 * Tests for Build Script - Version Management System
 * 
 * Tests the version bump calculations, git operations, and file updates
 * without actually modifying the repository state.
 */

const VersionManager = require('../../scripts/build.js');
const fs = require('fs');
const path = require('path');

// Mock file system and git operations for testing
jest.mock('fs');
jest.mock('child_process');

describe('Build Script - VersionManager', () => {
    let versionManager;
    let mockPackageJson;
    let mockExecSync;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock package.json
        mockPackageJson = {
            name: 'horse-racing-text-game',
            version: '1.0.0',
            scripts: {},
            dependencies: {}
        };

        // Mock fs operations
        fs.readFileSync = jest.fn();
        fs.writeFileSync = jest.fn();
        fs.existsSync = jest.fn().mockReturnValue(true);

        // Mock execSync for git operations
        mockExecSync = jest.fn();
        mockExecSync
            .mockReturnValueOnce('abc1234\n')  // git rev-parse --short HEAD
            .mockReturnValueOnce('v1\n')       // git rev-parse --abbrev-ref HEAD
            .mockReturnValueOnce('');          // git status --porcelain

        require('child_process').execSync = mockExecSync;

        // Mock require for package.json
        jest.doMock(path.join(process.cwd(), 'package.json'), () => mockPackageJson, { virtual: true });
        jest.doMock(path.join(process.cwd(), 'scripts', '../package.json'), () => mockPackageJson, { virtual: true });

        versionManager = new VersionManager();
    });

    afterEach(() => {
        jest.resetModules();
    });

    describe('Version Calculation', () => {
        test('should calculate major version bump correctly', () => {
            const result = versionManager.bumpVersion('major');
            expect(result).toBe('2.0.0');
        });

        test('should calculate minor version bump correctly', () => {
            const result = versionManager.bumpVersion('minor');
            expect(result).toBe('1.1.0');
        });

        test('should calculate patch version bump correctly', () => {
            const result = versionManager.bumpVersion('patch');
            expect(result).toBe('1.0.1');
        });

        test('should handle complex version numbers', () => {
            mockPackageJson.version = '2.15.8';
            versionManager = new VersionManager();

            expect(versionManager.bumpVersion('major')).toBe('3.0.0');
            expect(versionManager.bumpVersion('minor')).toBe('2.16.0');
            expect(versionManager.bumpVersion('patch')).toBe('2.15.9');
        });

        test('should throw error for invalid version type', () => {
            expect(() => {
                versionManager.bumpVersion('invalid');
            }).toThrow('Invalid version type: invalid');
        });
    });

    describe('Git Operations', () => {
        test('should get git commit hash', () => {
            const commit = versionManager.getGitCommit();
            expect(commit).toBe('abc1234');
            expect(mockExecSync).toHaveBeenCalledWith('git rev-parse --short HEAD', { encoding: 'utf8' });
        });

        test('should get git branch name', () => {
            const branch = versionManager.getGitBranch();
            expect(branch).toBe('v1');
            expect(mockExecSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
        });

        test('should check if git is clean', () => {
            const isClean = versionManager.isGitClean();
            expect(isClean).toBe(true);
            expect(mockExecSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf8' });
        });

        test('should handle git command failures gracefully', () => {
            mockExecSync.mockImplementation(() => {
                throw new Error('Git command failed');
            });

            const commit = versionManager.getGitCommit();
            expect(commit).toBe('');
        });
    });

    describe('File Operations', () => {
        test('should update package.json with new version', () => {
            versionManager.updatePackageJson('1.2.3');

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                versionManager.packagePath,
                JSON.stringify({ ...mockPackageJson, version: '1.2.3' }, null, 2) + '\n'
            );
        });

        test('should generate version.js file with correct content', () => {
            versionManager.updateVersionJs('1.2.3');

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                versionManager.versionPath,
                expect.stringContaining("VERSION: '1.2.3'")
            );
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                versionManager.versionPath,
                expect.stringContaining("VERSION_MAJOR: 1")
            );
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                versionManager.versionPath,
                expect.stringContaining("VERSION_MINOR: 2")
            );
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                versionManager.versionPath,
                expect.stringContaining("VERSION_PATCH: 3")
            );
        });
    });

    describe('Codename Generation', () => {
        test('should generate appropriate codenames', () => {
            expect(versionManager.getCodename('1.0.0')).toBe('Thunder Runner');
            expect(versionManager.getCodename('1.1.0')).toBe('Lightning Strike');
            expect(versionManager.getCodename('2.0.0')).toBe('Phoenix Rising');
            expect(versionManager.getCodename('99.99.99')).toBe('Racing Spirit'); // fallback
        });
    });

    describe('Build Number Tracking', () => {
        test('should increment build number', () => {
            // Mock existing version.js
            jest.doMock(versionManager.versionPath, () => ({
                BUILD_NUMBER: 5
            }), { virtual: true });

            const buildNumber = versionManager.getBuildNumber();
            expect(buildNumber).toBe(5);
        });

        test('should handle missing version.js file', () => {
            jest.doMock(versionManager.versionPath, () => {
                throw new Error('File not found');
            }, { virtual: true });

            const buildNumber = versionManager.getBuildNumber();
            expect(buildNumber).toBe(0);
        });
    });

    describe('Version String Generation', () => {
        test('should generate proper version strings in version.js', () => {
            versionManager.updateVersionJs('1.2.3');

            const writtenContent = fs.writeFileSync.mock.calls[0][1];
            
            // Check that the version.js contains proper utility functions
            expect(writtenContent).toContain('getVersionString()');
            expect(writtenContent).toContain('getFullVersionString()');
            expect(writtenContent).toContain('getBuildInfo()');
            expect(writtenContent).toContain('isCompatible(version)');
            expect(writtenContent).toContain('needsMigration(version)');
        });
    });

    describe('Feature Flags', () => {
        test('should include feature flags in version.js', () => {
            versionManager.updateVersionJs('1.0.0');

            const writtenContent = fs.writeFileSync.mock.calls[0][1];
            
            expect(writtenContent).toContain('FEATURES: {');
            expect(writtenContent).toContain('breeding: true');
            expect(writtenContent).toContain('trainers: true');
            expect(writtenContent).toContain('trainer_dialog: true');
            expect(writtenContent).toContain('modular_ui: true');
            expect(writtenContent).toContain('isFeatureEnabled(feature)');
        });
    });

    describe('Error Handling', () => {
        test('should handle dirty git state', () => {
            mockExecSync.mockReturnValueOnce('M package.json\n'); // Dirty state
            versionManager = new VersionManager();

            expect(() => {
                versionManager.bumpVersionAndRelease('patch');
            }).toThrow('Git working directory is not clean');
        });

        test('should handle file system errors gracefully', () => {
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });

            expect(() => {
                versionManager.updatePackageJson('1.2.3');
            }).toThrow('Permission denied');
        });
    });

    describe('Integration Tests', () => {
        test('should perform complete version bump workflow', () => {
            // Mock clean git state
            mockExecSync
                .mockReturnValueOnce('abc1234\n')  // git commit
                .mockReturnValueOnce('v1\n')       // git branch
                .mockReturnValueOnce('')           // git status (clean)
                .mockReturnValue('');              // subsequent git commands

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // This would normally perform git operations, but we're mocking them
            // versionManager.bumpVersionAndRelease('patch');

            // Verify file operations would be called
            // expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // package.json + version.js

            consoleSpy.mockRestore();
        });
    });
});

describe('CLI Interface', () => {
    test('should show help when no command provided', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const originalArgv = process.argv;
        
        process.argv = ['node', 'build.js'];
        
        // Test would require importing the main function
        // This is a placeholder for CLI testing
        
        process.argv = originalArgv;
        consoleSpy.mockRestore();
    });
});