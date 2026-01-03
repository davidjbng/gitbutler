import * as vscode from 'vscode';
import * as path from 'path';
import { GitButlerCLI } from './cli';
import { GitButlerTreeDataProvider } from './treeProvider';

let treeDataProvider: GitButlerTreeDataProvider | undefined;
let cli: GitButlerCLI | undefined;

export async function activate(context: vscode.ExtensionContext) {
	console.log('GitButler extension is now active');

	// Get the workspace folder
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		console.log('No workspace folder found, GitButler extension will not activate');
		return;
	}

	const workspaceRoot = workspaceFolders[0].uri.fsPath;

	// Initialize CLI
	cli = new GitButlerCLI(workspaceRoot);

	// Check if it's a GitButler repository
	const isGitButlerRepo = await cli.isGitButlerRepo();
	if (!isGitButlerRepo) {
		console.log('Not a GitButler repository, extension features disabled');
		// Still register commands but they'll show helpful messages
		registerCommands(context, false);
		return;
	}

	// Create tree data provider
	treeDataProvider = new GitButlerTreeDataProvider();

	// Register tree view
	const treeView = vscode.window.createTreeView('gitbutler.branches', {
		treeDataProvider: treeDataProvider,
		showCollapseAll: true
	});
	context.subscriptions.push(treeView);

	// Register commands
	registerCommands(context, true);

	// Initial load
	await refreshStatus();

	// Watch for file changes to refresh status
	const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
	fileWatcher.onDidChange(() => refreshStatus());
	fileWatcher.onDidCreate(() => refreshStatus());
	fileWatcher.onDidDelete(() => refreshStatus());
	context.subscriptions.push(fileWatcher);

	// Also refresh on window focus
	context.subscriptions.push(
		vscode.window.onDidChangeWindowState((state) => {
			if (state.focused) {
				refreshStatus();
			}
		})
	);
}

function registerCommands(context: vscode.ExtensionContext, isGitButlerRepo: boolean) {
	// Refresh command
	context.subscriptions.push(
		vscode.commands.registerCommand('gitbutler.refresh', async () => {
			if (!isGitButlerRepo) {
				vscode.window.showInformationMessage(
					'This is not a GitButler repository. Run "but init" in the terminal to initialize.'
				);
				return;
			}
			await refreshStatus();
		})
	);

	// Show branch details
	context.subscriptions.push(
		vscode.commands.registerCommand('gitbutler.showBranch', async (branchName: string) => {
			if (!isGitButlerRepo) {
				return;
			}
			vscode.window.showInformationMessage(`Branch: ${branchName}`);
		})
	);

	// Show commit details
	context.subscriptions.push(
		vscode.commands.registerCommand('gitbutler.showCommit', async (commitId: string) => {
			if (!isGitButlerRepo) {
				return;
			}
			vscode.window.showInformationMessage(`Commit: ${commitId}`);
		})
	);

	// Open file
	context.subscriptions.push(
		vscode.commands.registerCommand('gitbutler.openFile', async (filePath: string) => {
			if (!isGitButlerRepo) {
				return;
			}

			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				return;
			}

			const fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
			try {
				const document = await vscode.workspace.openTextDocument(fullPath);
				await vscode.window.showTextDocument(document);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to open file: ${filePath}`);
			}
		})
	);
}

async function refreshStatus() {
	if (!cli || !treeDataProvider) {
		return;
	}

	try {
		const status = await cli.getStatus(true);
		treeDataProvider.updateStatus(status);
	} catch (error) {
		console.error('Failed to refresh GitButler status:', error);
		// Don't show error to user on every refresh, just log it
		// User can manually refresh if they want
	}
}

export function deactivate() {
	console.log('GitButler extension is now deactivated');
}
