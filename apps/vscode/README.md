# GitButler VSCode Extension

A Visual Studio Code extension that provides visualization of GitButler virtual branches, commits, and files - similar to the built-in Git extension.

## Features

- **Virtual Branches View**: Displays all your GitButler virtual branches in the Source Control panel
- **Commit Visualization**: Shows commits for each branch with their messages, authors, and dates
- **File Changes**: Displays file changes in commits and uncommitted changes
- **Stack Support**: Visualizes stacked branches with clear hierarchy
- **Upstream Status**: Shows how many commits your branches are ahead or behind
- **Interactive Files**: Click on any file to open it in the editor
- **Real-time Updates**: Automatically refreshes when files change

## Requirements

- [GitButler CLI (`but`)](https://github.com/gitbutlerapp/gitbutler) must be installed and available in your PATH
- A GitButler-initialized repository

## Installation

1. Copy the extension directory to your VSCode extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions`
   - **macOS/Linux**: `~/.vscode/extensions`

2. Or install the `.vsix` package:
   ```bash
   code --install-extension gitbutler-0.1.0.vsix
   ```

## Usage

1. Open a GitButler repository in VSCode
2. The extension will automatically activate and display the "GitButler Branches" view in the Source Control panel
3. If the repository is not yet initialized with GitButler, run `but init` in the terminal

### Commands

- **Refresh**: Manually refresh the GitButler status
- **Open File**: Click on any file to open it

## How It Works

The extension uses the GitButler CLI with JSON output mode to retrieve repository status:

```bash
but status --json --files
```

This provides structured data about:

- Virtual branches and their stacks
- Commits on each branch
- File changes (uncommitted and committed)
- Upstream status

## Development

```bash
# Install dependencies
pnpm install

# Build the extension
pnpm run build

# Watch for changes
pnpm run watch
```

## Architecture

- `extension.ts`: Main extension activation and command registration
- `cli.ts`: GitButler CLI wrapper for executing commands with JSON output
- `treeProvider.ts`: Tree data provider for rendering branches, commits, and files
- `types.ts`: TypeScript type definitions matching the GitButler CLI JSON output

## License

Same as the main GitButler project
