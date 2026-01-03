# VSCode Extension UI Layout

## Tree View Structure

The GitButler extension adds a "GitButler Branches" view to the Source Control panel in VSCode. Here's what users will see:

```
📁 SOURCE CONTROL
   ├── 🔄 GitButler Branches (with refresh button)
   │   
   │   ├── 📄 Unassigned Changes (3)
   │   │   ├── 📝 src/main.ts (modified)
   │   │   ├── ➕ src/new-file.ts (added)
   │   │   └── ➖ old-file.ts (deleted)
   │   │
   │   ├── 🌿 feature/add-authentication
   │   │   ├── 📝 Uncommitted Changes (2)
   │   │   │   ├── 📝 src/auth.ts (modified)
   │   │   │   └── ➕ src/login.ts (added)
   │   │   │
   │   │   ├── 📋 Add login functionality (2 days ago)
   │   │   │   ├── 📝 src/auth.ts
   │   │   │   └── 📝 src/types.ts
   │   │   │
   │   │   └── 📋 Setup authentication module (3 days ago)
   │   │       └── 📝 src/auth.ts
   │   │
   │   └── 🌿 fix/bug-123 (2 commits • unpushed)
   │       ├── 📋 Fix null pointer error (yesterday)
   │       │   └── 📝 src/utils.ts
   │       │
   │       └── 📋 Add null checks (yesterday)
   │           └── 📝 src/utils.ts
   │
   └── ☁️ Upstream (5 commits ahead)
```

## UI Elements

### Icons
- 🌿 Branch icon (git-branch)
- 📋 Commit icon (git-commit)
- 📝 Modified file (diff-modified)
- ➕ Added file (diff-added)
- ➖ Removed file (diff-removed)
- 🔄 Renamed file (diff-renamed)
- ☁️ Upstream indicator (cloud)
- 🔄 Refresh button (refresh)

### Tooltips

**Branch Tooltip Example:**
```
feature/add-authentication
Status: Unpushed commits
Commits: 2
```

**Commit Tooltip Example:**
```
Add login functionality

Author: John Doe <john@example.com>
Date: 2024-01-01 14:30:00 +0000
SHA: abc123def456
```

### Interactive Elements

1. **Refresh Button**: Top-right of the view, manual refresh
2. **File Click**: Opens file in editor
3. **Collapsible Sections**: Expand/collapse branches, commits, and file lists

### Context Menu (Future)

Right-clicking on items could show:
- Branch: Apply, Unapply, Delete, Push
- Commit: Reword, Squash, Amend
- File: Open, Show Diff, Revert

## View States

### Empty State (Not a GitButler Repo)
```
📁 SOURCE CONTROL
   └── 🔄 GitButler Branches
       └── ℹ️ This is not a GitButler repository
           Run "but init" to initialize
```

### Loading State
```
📁 SOURCE CONTROL
   └── 🔄 GitButler Branches
       └── ⏳ Loading...
```

### Error State
```
📁 SOURCE CONTROL
   └── 🔄 GitButler Branches
       └── ⚠️ Failed to load GitButler status
           Click refresh to try again
```

## Color Scheme

The extension uses VSCode's built-in color scheme:
- **Modified files**: Yellow/Orange icon
- **Added files**: Green icon
- **Removed files**: Red icon
- **Branches**: Theme-adaptive colors
- **Commits**: Dimmed text for descriptions

## Responsive Behavior

- Automatically refreshes on file changes (debounced 500ms)
- Updates when window regains focus
- Collapses/expands state is preserved
- Scroll position maintained on refresh

## Integration

The view integrates seamlessly with VSCode's Source Control panel, appearing alongside:
- Git changes view
- Timeline view
- Other SCM providers

Users can toggle visibility via:
- View → Source Control → GitButler Branches
- Command Palette → "GitButler: Refresh"
