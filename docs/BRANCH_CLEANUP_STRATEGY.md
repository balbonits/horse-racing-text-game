# Branch Cleanup Strategy

## Overview
This document outlines the automated and manual strategies for maintaining a clean Git repository by removing old, merged, and unused branches based on industry best practices.

## Industry Standards & Research

### GitFlow Best Practices
Based on research from Atlassian, GitHub, and GitLab documentation:

1. **Protected Branches**: Never delete `main`, `develop`, or active `release/*` branches
2. **Merged Feature Branches**: Delete after 3 months if merged to main
3. **Stale Branches**: Delete after 6 months if no activity and not merged
4. **Release Branches**: Archive after successful deployment, delete after 1 year
5. **Hotfix Branches**: Delete immediately after merge to both main and develop

### Automated Cleanup Rules

#### Time-Based Cleanup (Implemented in build script)
```javascript
// Features & fixes: 3 months after merge
if (branchAge > 3_MONTHS && isMergedToMain) {
    deleteCandidate = true;
}

// Stale unmerged: 6 months with no activity
if (branchAge > 6_MONTHS && !hasRecentActivity) {
    archiveCandidate = true;
}

// Release branches: 1 year after deployment
if (branchType === 'release' && deployedAge > 1_YEAR) {
    deleteCandidate = true;
}
```

#### Branch Type Classifications
- **`feature/*`**: User feature development
- **`fix/*`**: Bug fixes for development
- **`hotfix/*`**: Critical production fixes
- **`release/*`**: Release preparation
- **`archive/*`**: Historical snapshots (never delete)

## Implementation Strategy

### 1. Automated Daily Cleanup
```bash
# Add to CI/CD or cron job
npm run build:cleanup
```

### 2. Manual Monthly Review
```bash
# Review branches older than 30 days
git for-each-ref --format='%(refname:short) %(committerdate)' refs/remotes/origin | sort -k2

# Check merge status
git branch -r --merged main
git branch -r --no-merged main
```

### 3. Safe Deletion Process
```bash
# 1. Verify branch is merged
git merge-base --is-ancestor origin/feature/xyz origin/main

# 2. Create archive tag (if important)
git tag archive/feature-xyz origin/feature/xyz

# 3. Delete remote branch
git push origin --delete feature/xyz

# 4. Clean up local tracking
git remote prune origin
```

## Cleanup Workflow

### Weekly Automated Process
1. **Scan Remote Branches**: Identify branches by type and age
2. **Merge Status Check**: Verify if branches are merged to main
3. **Safety Checks**: Ensure no active PRs or recent commits
4. **Create Archive Tags**: For important historical branches
5. **Delete Merged Branches**: Remove old merged feature/fix branches
6. **Report Generation**: Log cleanup activities

### Monthly Manual Review
1. **Review Archive Candidates**: Unmerged branches older than 6 months
2. **Check Release Branches**: Verify successful deployments
3. **Stakeholder Notification**: Inform team of upcoming deletions
4. **Final Cleanup**: Delete confirmed unnecessary branches

## Safety Mechanisms

### Pre-Deletion Checks
```bash
# 1. Check for open PRs
gh pr list --head feature/xyz --state open

# 2. Check recent activity (commits in last 30 days)
git log --since="30 days ago" origin/feature/xyz

# 3. Check if branch is referenced in issues
gh issue list --search "feature/xyz"

# 4. Verify merge status
git merge-base --is-ancestor origin/feature/xyz origin/main
```

### Recovery Options
```bash
# 1. Recover from archive tag
git checkout -b feature/xyz-recovered archive/feature-xyz

# 2. Recover from reflog (within 30-90 days)
git reflog show origin/feature/xyz
git checkout -b feature/xyz-recovered <commit-hash>

# 3. Recover from GitHub API (if using GitHub)
gh api repos/:owner/:repo/branches/feature%2Fxyz
```

## Branch Lifecycle Management

### Feature Branch Lifecycle
```
feature/xyz
├── Created from develop
├── Active development (0-4 weeks)
├── PR to develop
├── Merged to develop
├── Grace period (3 months)
└── Automated deletion
```

### Release Branch Lifecycle
```
release/1.2.0
├── Created from develop
├── Release preparation (1-2 weeks)
├── PR to main
├── Merged to main + tagged
├── Merged back to develop
├── Production deployment
├── Archive period (1 year)
└── Manual deletion
```

### Hotfix Branch Lifecycle
```
hotfix/1.1.1
├── Created from main
├── Critical fix (hours-days)
├── PR to main
├── Merged to main + tagged
├── Cherry-picked to develop
└── Immediate deletion
```

## Configuration

### Build Script Configuration
```javascript
// In scripts/build.js
const CLEANUP_CONFIG = {
    FEATURE_BRANCH_TTL: 3 * 30 * 24 * 60 * 60 * 1000, // 3 months
    STALE_BRANCH_TTL: 6 * 30 * 24 * 60 * 60 * 1000,   // 6 months
    RELEASE_BRANCH_TTL: 12 * 30 * 24 * 60 * 60 * 1000, // 1 year
    
    PROTECTED_BRANCHES: ['main', 'develop'],
    ARCHIVE_IMPORTANT: true,
    DRY_RUN: true, // Set false to actually delete
};
```

### Git Hooks Integration
```bash
# .git/hooks/post-merge
#!/bin/sh
# Auto-cleanup after successful merges
if [ "$1" = "main" ]; then
    npm run build:cleanup
fi
```

## Monitoring & Reporting

### Weekly Cleanup Report
```
🧹 Branch Cleanup Report - Week of 2025-01-27

📊 Repository Stats:
   Total branches: 47
   Active branches: 12
   Stale branches: 8
   Archived: 3

🗑️  Branches Deleted (5):
   - feature/old-ui-system (merged 4 months ago)
   - fix/memory-leak (merged 3 months ago)
   - feature/experimental-ai (merged 5 months ago)

📦 Branches Archived (2):
   - release/0.9.0 (deployed 8 months ago)
   - hotfix/critical-save-fix (applied 1 year ago)

⚠️  Manual Review Required (3):
   - feature/new-genetic-system (unmerged, 4 months old)
   - fix/race-conditions (has open PR)
   - release/2.0.0-alpha (active development)
```

### Monthly Health Check
```bash
# Repository health metrics
npm run build:info
git branch -a | wc -l        # Total branches
git tag | wc -l              # Total tags
du -sh .git                  # Repository size
```

## Emergency Procedures

### Accidental Branch Deletion
1. **Check Reflog**: `git reflog show origin/branch-name`
2. **Check Archive Tags**: `git tag -l "archive/*"`
3. **GitHub Recovery**: Use GitHub web interface or API
4. **Contact Team**: Verify if anyone has local copies

### Repository Size Issues
1. **Large Branch Count**: Run aggressive cleanup
2. **Large .git Size**: Consider `git gc --aggressive`
3. **Historical Cleanup**: Use BFG Repo-Cleaner for large files

## Tools & Commands Reference

### Useful Git Commands
```bash
# List branches by last commit date
git for-each-ref --sort=-committerdate refs/remotes

# Find merged branches
git branch -r --merged main | grep -v main

# Find branches with no recent activity
git for-each-ref --format='%(refname:short) %(committerdate)' | \
    awk '$2 < "'$(date -d '3 months ago' '+%Y-%m-%d')'"'

# Clean up local tracking branches
git remote prune origin

# Remove local branches that track deleted remotes
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

### GitHub CLI Commands
```bash
# List branches with PR status
gh pr list --state all --json headRefName,state,updatedAt

# Check branch protection rules
gh api repos/:owner/:repo/branches/main/protection

# Bulk delete branches
gh api --method DELETE repos/:owner/:repo/git/refs/heads/feature/xyz
```

## Implementation Checklist

- [x] Research industry best practices
- [x] Create automated cleanup script
- [x] Define branch lifecycle rules
- [x] Implement safety mechanisms
- [x] Create monitoring/reporting system
- [ ] Set up CI/CD integration
- [ ] Configure GitHub branch protection
- [ ] Train team on new workflow
- [ ] Schedule monthly review meetings

## Best Practices Summary

1. **Automate Everything**: Use scripts for consistent cleanup
2. **Safety First**: Always verify merge status before deletion
3. **Archive Important**: Create tags for historically significant branches
4. **Regular Maintenance**: Weekly automated + monthly manual review
5. **Team Communication**: Notify before major cleanups
6. **Recovery Ready**: Document recovery procedures
7. **Monitor Health**: Track repository size and branch count
8. **Protect Main**: Never delete protected branches

---

*This strategy follows industry standards from GitFlow, GitHub Flow, and enterprise Git practices. Adjust timelines based on team size and development velocity.*