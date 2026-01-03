import { WorkspaceStatus } from './types';
import { spawn } from 'child_process';

/**
 * Utility class for executing GitButler CLI commands
 */
export class GitButlerCLI {
	private butPath: string;
	private workingDir: string;

	constructor(workingDir: string, butPath?: string) {
		this.workingDir = workingDir;
		// Default to 'but' in PATH if not specified
		this.butPath = butPath || 'but';
	}

	/**
	 * Execute a GitButler CLI command with JSON output
	 */
	private async executeCommand(args: string[]): Promise<string> {
		return await new Promise((resolve, reject) => {
			const allArgs = ['-C', this.workingDir, '--json', ...args];
			const process = spawn(this.butPath, allArgs);

			let stdout = '';
			let stderr = '';

			process.stdout.on('data', (data) => {
				stdout += data.toString();
			});

			process.stderr.on('data', (data) => {
				stderr += data.toString();
			});

			process.on('close', (code) => {
				if (code !== 0) {
					reject(new Error(`GitButler CLI exited with code ${code}: ${stderr}`));
				} else {
					resolve(stdout);
				}
			});

			process.on('error', (err) => {
				reject(new Error(`Failed to execute GitButler CLI: ${err.message}`));
			});
		});
	}

	/**
	 * Get the workspace status with branches, commits, and files
	 */
	async getStatus(showFiles: boolean = true): Promise<WorkspaceStatus> {
		const args = ['status'];
		if (showFiles) {
			args.push('--files');
		}

		const output = await this.executeCommand(args);
		return JSON.parse(output) as WorkspaceStatus;
	}

	/**
	 * Check if the current directory is a GitButler repository
	 */
	async isGitButlerRepo(): Promise<boolean> {
		try {
			// Try to execute status command - if it fails, it's not a GitButler repo
			await this.executeCommand(['status']);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Initialize a GitButler repository
	 */
	async init(): Promise<void> {
		await this.executeCommand(['init']);
	}
}
