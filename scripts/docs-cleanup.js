#!/usr/bin/env node
/**
 * Documentation Cleanup Script
 * 
 * Consolidates and organizes project documentation
 * Moves outdated files to archive while preserving history
 */

const fs = require('fs');
const path = require('path');

class DocsCleanup {
    constructor() {
        this.docsDir = path.join(process.cwd(), 'docs');
        this.archivedDir = path.join(this.docsDir, 'archived');
        
        // Ensure archived directory exists
        if (!fs.existsSync(this.archivedDir)) {
            fs.mkdirSync(this.archivedDir, { recursive: true });
        }
    }

    /**
     * Main cleanup process
     */
    cleanup() {
        console.log('📚 Starting documentation cleanup...');
        console.log('=====================================');

        // Files to keep in main docs directory
        const keepFiles = new Set([
            'MASTER_DOCUMENTATION.md',
            'DEV_JOURNEY.md',
            'VERSIONING_STRATEGY.md',
            'BRANCH_CLEANUP_STRATEGY.md'
        ]);

        // Files to archive (move to archived folder)
        const archiveFiles = [
            'API_ARCHITECTURE.md',
            'HORSE_ARCHITECTURE.md', 
            'MODULAR_ARCHITECTURE.md',
            'RACE_SYSTEM_PLAN.md',
            'RACE_TYPES_AND_SURFACES.md',
            'STANDALONE_BUILD.md',
            'TDD_PLAN.md',
            'TESTING.md',
            'UX_FLOW_AND_RACING_MECHANICS.md',
            'UX_STRATEGY.md',
            'V1_ARCHITECTURE.md',
            'V1_BREEDING_SYSTEM.md',
            'V1_COMPLETION_REPORT.md',
            'V1_INTEGRATION_PLAN.md',
            'V1_NAME_GENERATION.md',
            'V1_RACE_DISTANCES.md',
            'V1_STABLE_OWNER_SYSTEM.md',
            'complete_project_docs.md'
        ];

        // Move files to archive
        let movedCount = 0;
        for (const filename of archiveFiles) {
            const sourceFile = path.join(this.docsDir, filename);
            const archiveFile = path.join(this.archivedDir, filename);
            
            if (fs.existsSync(sourceFile)) {
                try {
                    fs.renameSync(sourceFile, archiveFile);
                    console.log(`📦 Archived: ${filename}`);
                    movedCount++;
                } catch (error) {
                    console.error(`❌ Failed to archive ${filename}: ${error.message}`);
                }
            }
        }

        // Create archive index
        this.createArchiveIndex(archiveFiles);

        // Create main docs README
        this.createDocsReadme();

        console.log('');
        console.log(`✅ Cleanup complete! Archived ${movedCount} files`);
        console.log('📁 Main docs now contain only essential files');
        console.log('📦 Archived files available in docs/archived/');
    }

    /**
     * Create index file for archived documentation
     */
    createArchiveIndex(archivedFiles) {
        const indexContent = `# Archived Documentation

This directory contains historical documentation files that are no longer actively maintained but preserved for reference.

## Archived Files

### Architecture & Design Documents
${archivedFiles.filter(f => f.includes('ARCHITECTURE')).map(f => `- \`${f}\` - System architecture specifications`).join('\n')}

### V1 Development Documents  
${archivedFiles.filter(f => f.includes('V1_')).map(f => `- \`${f}\` - Version 1.0 development specifications`).join('\n')}

### Planning & Strategy Documents
${archivedFiles.filter(f => f.includes('PLAN') || f.includes('STRATEGY')).map(f => `- \`${f}\` - Development planning documents`).join('\n')}

### Race System Documents
${archivedFiles.filter(f => f.includes('RACE')).map(f => `- \`${f}\` - Race system specifications`).join('\n')}

### Other Documents
${archivedFiles.filter(f => !f.includes('ARCHITECTURE') && !f.includes('V1_') && !f.includes('PLAN') && !f.includes('STRATEGY') && !f.includes('RACE')).map(f => `- \`${f}\` - Legacy documentation`).join('\n')}

## Note

These files have been archived as part of documentation consolidation. All essential information has been integrated into the main documentation files:

- **[MASTER_DOCUMENTATION.md](../MASTER_DOCUMENTATION.md)** - Complete project guide
- **[DEV_JOURNEY.md](../DEV_JOURNEY.md)** - Development history  
- **[VERSIONING_STRATEGY.md](../VERSIONING_STRATEGY.md)** - Version management
- **[BRANCH_CLEANUP_STRATEGY.md](../BRANCH_CLEANUP_STRATEGY.md)** - Git workflow

*Archived on: ${new Date().toISOString()}*
`;

        const indexPath = path.join(this.archivedDir, 'README.md');
        fs.writeFileSync(indexPath, indexContent);
        console.log('📋 Created archive index: archived/README.md');
    }

    /**
     * Create main docs README
     */
    createDocsReadme() {
        const readmeContent = `# Project Documentation

## 📚 Essential Documentation

This directory contains the core documentation for the Horse Racing Text Game project.

### 📖 **Start Here**
- **[MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md)** - Complete project guide and consolidated documentation

### 📈 **Development & History**  
- **[DEV_JOURNEY.md](DEV_JOURNEY.md)** - Complete development chronology and decisions
- **[VERSIONING_STRATEGY.md](VERSIONING_STRATEGY.md)** - Version management and release strategy
- **[BRANCH_CLEANUP_STRATEGY.md](BRANCH_CLEANUP_STRATEGY.md)** - Git branch management and cleanup

### 📦 **Archived Documentation**
- **[archived/](archived/)** - Historical documentation files (preserved for reference)

## 🚀 Quick Navigation

**For New Developers**: Start with [MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md) for a complete overview.

**For Development History**: Check [DEV_JOURNEY.md](DEV_JOURNEY.md) for detailed development decisions.

**For Release Management**: See [VERSIONING_STRATEGY.md](VERSIONING_STRATEGY.md) for version control practices.

**For Legacy Information**: Browse [archived/](archived/) for historical specifications and planning documents.

---

*Documentation last organized: ${new Date().toLocaleDateString()}*
`;

        const readmePath = path.join(this.docsDir, 'README.md');
        fs.writeFileSync(readmePath, readmeContent);
        console.log('📝 Created docs README.md');
    }

    /**
     * List current documentation structure
     */
    listDocs() {
        console.log('📚 Current Documentation Structure');
        console.log('==================================');
        
        const mainDocs = fs.readdirSync(this.docsDir)
            .filter(file => file.endsWith('.md'))
            .sort();
            
        console.log('\n📁 Main Documentation:');
        mainDocs.forEach(file => {
            console.log(`   ${file}`);
        });

        if (fs.existsSync(this.archivedDir)) {
            const archivedDocs = fs.readdirSync(this.archivedDir)
                .filter(file => file.endsWith('.md'))
                .sort();
                
            console.log('\n📦 Archived Documentation:');
            archivedDocs.forEach(file => {
                console.log(`   archived/${file}`);
            });
        }
    }

    /**
     * Show help information
     */
    help() {
        console.log(`
📚 Documentation Cleanup Tool

Usage:
  npm run docs:cleanup     Clean and organize documentation
  npm run docs:list        List current documentation structure
  npm run docs:help        Show this help

What this tool does:
  • Moves outdated documentation to archived/ folder
  • Creates master documentation index
  • Preserves all historical information
  • Organizes docs for easier navigation

Files kept in main docs/:
  • MASTER_DOCUMENTATION.md (consolidated guide)
  • DEV_JOURNEY.md (development history)
  • VERSIONING_STRATEGY.md (version management)
  • BRANCH_CLEANUP_STRATEGY.md (git workflow)

Files moved to archived/:
  • All V1_*.md files
  • Architecture specifications
  • Planning documents
  • Legacy documentation
        `);
    }
}

// CLI Interface
function main() {
    const cleanup = new DocsCleanup();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'cleanup':
                cleanup.cleanup();
                break;
            case 'list':
                cleanup.listDocs();
                break;
            case 'help':
            default:
                cleanup.help();
        }
    } catch (error) {
        console.error(`❌ Docs cleanup error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DocsCleanup;