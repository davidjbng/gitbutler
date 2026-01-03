# GitButler VSCode Extension - Development Guide

## Setup

```bash
cd apps/vscode
pnpm install
```

## Building

```bash
pnpm run build
```

This compiles TypeScript files from `src/` to `dist/`.

## Development

### Watch Mode

```bash
pnpm run watch
```

This watches for changes and recompiles automatically.

### Testing Locally

1. Build the extension: `pnpm run build`
2. Open VSCode to the `apps/vscode` directory
3. Press `F5` to open a new VSCode window with the extension loaded
4. Open a GitButler repository to see the extension in action

### Debugging

- Set breakpoints in the TypeScript source files
- Use the Debug Console in VSCode to inspect variables
- Check the Output panel for GitButler extension logs

## Packaging

To create a `.vsix` file for distribution:

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package the extension
vsce package
```

This creates a `gitbutler-0.1.0.vsix` file that can be installed.

## Installation

### From VSIX

```bash
code --install-extension gitbutler-0.1.0.vsix
```

### From Source

1. Copy the `apps/vscode` directory to your VSCode extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\gitbutler-0.1.0`
   - **macOS/Linux**: `~/.vscode/extensions/gitbutler-0.1.0`
2. Reload VSCode

## Architecture

### Files

- `src/extension.ts` - Main extension entry point, handles activation and commands
- `src/cli.ts` - Wrapper for calling the GitButler CLI with JSON output
- `src/treeProvider.ts` - Tree data provider for the SCM panel
- `src/types.ts` - TypeScript type definitions for CLI JSON output

### Data Flow

1. Extension activates when VSCode starts
2. Checks if workspace is a GitButler repository (`but status`)
3. If yes, creates tree view and starts watching for file changes
4. On refresh or file change, calls `but status --json --files`
5. Parses JSON output and updates tree view
6. User can click on files to open them

### Commands

- `gitbutler.refresh` - Manually refresh the status
- `gitbutler.openFile` - Open a file in the editor
- `gitbutler.showBranch` - Show branch details (placeholder)
- `gitbutler.showCommit` - Show commit details (placeholder)

## Requirements

- GitButler CLI (`but`) must be installed and in PATH
- VSCode 1.85.0 or higher
- Node.js 20.11 or higher

## Troubleshooting

### Extension doesn't activate

- Check that you're in a GitButler repository
- Verify `but` CLI is installed: `but --version`
- Check VSCode Output panel for errors

### Tree view is empty

- Try manually refreshing with the refresh button
- Check that `but status --json` works in the terminal
- Verify file permissions for the repository

### Files don't open

- Check that file paths are correct
- Verify workspace folder is properly configured
