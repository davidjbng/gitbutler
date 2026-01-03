import * as vscode from 'vscode';
import {
	WorkspaceStatus,
	Stack,
	Branch,
	Commit,
	FileChange,
	BranchStatus,
	ChangeType
} from './types';

/**
 * Tree item types for different levels in the hierarchy
 */
export enum TreeItemType {
	UnassignedChanges = 'unassignedChanges',
	Stack = 'stack',
	Branch = 'branch',
	Commit = 'commit',
	File = 'file',
	MergeBase = 'mergeBase',
	UpstreamState = 'upstreamState'
}

/**
 * Custom tree item for GitButler views
 */
export class GitButlerTreeItem extends vscode.TreeItem {
	constructor(
		public readonly type: TreeItemType,
		public readonly label: string,
		public readonly data: any,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
		this.setupItem();
	}

	private setupItem(): void {
		switch (this.type) {
			case TreeItemType.UnassignedChanges:
				this.iconPath = new vscode.ThemeIcon('files');
				this.contextValue = 'unassignedChanges';
				break;

			case TreeItemType.Stack:
				this.iconPath = new vscode.ThemeIcon('git-branch');
				this.contextValue = 'stack';
				break;

			case TreeItemType.Branch:
				const branch = this.data as Branch;
				this.iconPath = new vscode.ThemeIcon('git-branch');
				this.contextValue = 'branch';
				this.description = this.getBranchDescription(branch);
				this.tooltip = this.getBranchTooltip(branch);
				break;

			case TreeItemType.Commit:
				const commit = this.data as Commit;
				this.iconPath = new vscode.ThemeIcon('git-commit');
				this.contextValue = 'commit';
				this.description = this.formatCommitDate(commit.createdAt);
				this.tooltip = this.getCommitTooltip(commit);
				break;

			case TreeItemType.File:
				const file = this.data as FileChange;
				this.iconPath = this.getFileIcon(file.changeType);
				this.contextValue = 'file';
				this.command = {
					command: 'gitbutler.openFile',
					title: 'Open File',
					arguments: [file.filePath]
				};
				break;

			case TreeItemType.MergeBase:
				this.iconPath = new vscode.ThemeIcon('git-merge');
				this.contextValue = 'mergeBase';
				break;

			case TreeItemType.UpstreamState:
				this.iconPath = new vscode.ThemeIcon('cloud');
				this.contextValue = 'upstreamState';
				break;
		}
	}

	private getBranchDescription(branch: Branch): string {
		const parts: string[] = [];

		if (branch.commits.length > 0) {
			parts.push(`${branch.commits.length} commit${branch.commits.length !== 1 ? 's' : ''}`);
		}

		if (branch.branchStatus === BranchStatus.UnpushedCommits) {
			parts.push('unpushed');
		} else if (branch.branchStatus === BranchStatus.UnpushedCommitsRequiringForce) {
			parts.push('force push required');
		} else if (branch.branchStatus === BranchStatus.CompletelyUnpushed) {
			parts.push('not pushed');
		}

		return parts.join(' • ');
	}

	private getBranchTooltip(branch: Branch): string {
		const lines: string[] = [branch.name];

		if (branch.reviewId) {
			lines.push(`Review: ${branch.reviewId}`);
		}

		lines.push(`Status: ${this.formatBranchStatus(branch.branchStatus)}`);
		lines.push(`Commits: ${branch.commits.length}`);

		if (branch.upstreamCommits.length > 0) {
			lines.push(`Upstream commits: ${branch.upstreamCommits.length}`);
		}

		return lines.join('\n');
	}

	private formatBranchStatus(status: BranchStatus): string {
		switch (status) {
			case BranchStatus.NothingToPush:
				return 'Up to date';
			case BranchStatus.UnpushedCommits:
				return 'Unpushed commits';
			case BranchStatus.UnpushedCommitsRequiringForce:
				return 'Force push required';
			case BranchStatus.CompletelyUnpushed:
				return 'Not pushed';
			case BranchStatus.Integrated:
				return 'Integrated';
			default:
				return 'Unknown';
		}
	}

	private getCommitTooltip(commit: Commit): string {
		const lines: string[] = [
			commit.message,
			'',
			`Author: ${commit.authorName} <${commit.authorEmail}>`,
			`Date: ${commit.createdAt}`,
			`SHA: ${commit.commitId}`
		];

		if (commit.conflicted) {
			lines.push('⚠️ Has conflicts');
		}

		if (commit.reviewId) {
			lines.push(`Review: ${commit.reviewId}`);
		}

		return lines.join('\n');
	}

	private formatCommitDate(dateStr: string): string {
		try {
			const date = new Date(dateStr);
			const now = new Date();
			const diff = now.getTime() - date.getTime();
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));

			if (days === 0) {
				return 'today';
			} else if (days === 1) {
				return 'yesterday';
			} else if (days < 7) {
				return `${days} days ago`;
			} else if (days < 30) {
				return `${Math.floor(days / 7)} weeks ago`;
			} else if (days < 365) {
				return `${Math.floor(days / 30)} months ago`;
			} else {
				return `${Math.floor(days / 365)} years ago`;
			}
		} catch {
			return dateStr;
		}
	}

	private getFileIcon(changeType: ChangeType): vscode.ThemeIcon {
		switch (changeType) {
			case ChangeType.Added:
				return new vscode.ThemeIcon('diff-added');
			case ChangeType.Removed:
				return new vscode.ThemeIcon('diff-removed');
			case ChangeType.Modified:
				return new vscode.ThemeIcon('diff-modified');
			case ChangeType.Renamed:
				return new vscode.ThemeIcon('diff-renamed');
			default:
				return new vscode.ThemeIcon('file');
		}
	}
}

/**
 * Tree data provider for GitButler branches view
 */
export class GitButlerTreeDataProvider implements vscode.TreeDataProvider<GitButlerTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<GitButlerTreeItem | undefined | null | void> =
		new vscode.EventEmitter<GitButlerTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<GitButlerTreeItem | undefined | null | void> =
		this._onDidChangeTreeData.event;

	private status: WorkspaceStatus | null = null;

	/**
	 * Update the tree with new status data
	 */
	updateStatus(status: WorkspaceStatus): void {
		this.status = status;
		this._onDidChangeTreeData.fire();
	}

	/**
	 * Clear the tree
	 */
	clear(): void {
		this.status = null;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: GitButlerTreeItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: GitButlerTreeItem): Promise<GitButlerTreeItem[]> {
		if (!this.status) {
			return [];
		}

		// Root level - show main sections
		if (!element) {
			const items: GitButlerTreeItem[] = [];

			// Unassigned changes
			if (this.status.unassignedChanges.length > 0) {
				items.push(
					new GitButlerTreeItem(
						TreeItemType.UnassignedChanges,
						`Unassigned Changes (${this.status.unassignedChanges.length})`,
						this.status.unassignedChanges,
						vscode.TreeItemCollapsibleState.Expanded
					)
				);
			}

			// Stacks
			for (const stack of this.status.stacks) {
				const stackLabel = this.getStackLabel(stack);
				items.push(
					new GitButlerTreeItem(
						TreeItemType.Stack,
						stackLabel,
						stack,
						vscode.TreeItemCollapsibleState.Expanded
					)
				);
			}

			// Upstream state
			if (this.status.upstreamState.behind > 0) {
				items.push(
					new GitButlerTreeItem(
						TreeItemType.UpstreamState,
						`Upstream (${this.status.upstreamState.behind} commits ahead)`,
						this.status.upstreamState,
						vscode.TreeItemCollapsibleState.Collapsed
					)
				);
			}

			return items;
		}

		// Children for each type
		switch (element.type) {
			case TreeItemType.UnassignedChanges:
				return (element.data as FileChange[]).map(
					(file) =>
						new GitButlerTreeItem(
							TreeItemType.File,
							file.filePath,
							file,
							vscode.TreeItemCollapsibleState.None
						)
				);

			case TreeItemType.Stack:
				const stack = element.data as Stack;
				const items: GitButlerTreeItem[] = [];

				// Assigned changes
				if (stack.assignedChanges.length > 0) {
					items.push(
						new GitButlerTreeItem(
							TreeItemType.UnassignedChanges,
							`Uncommitted Changes (${stack.assignedChanges.length})`,
							stack.assignedChanges,
							vscode.TreeItemCollapsibleState.Collapsed
						)
					);
				}

				// Branches
				for (const branch of stack.branches) {
					items.push(
						new GitButlerTreeItem(
							TreeItemType.Branch,
							branch.name,
							branch,
							vscode.TreeItemCollapsibleState.Expanded
						)
					);
				}

				return items;

			case TreeItemType.Branch:
				const branch = element.data as Branch;
				return branch.commits.map((commit) => {
					const shortMessage = commit.message.split('\n')[0].substring(0, 80);
					return new GitButlerTreeItem(
						TreeItemType.Commit,
						shortMessage,
						commit,
						commit.changes && commit.changes.length > 0
							? vscode.TreeItemCollapsibleState.Collapsed
							: vscode.TreeItemCollapsibleState.None
					);
				});

			case TreeItemType.Commit:
				const commit = element.data as Commit;
				if (commit.changes) {
					return commit.changes.map(
						(file) =>
							new GitButlerTreeItem(
								TreeItemType.File,
								file.filePath,
								file,
								vscode.TreeItemCollapsibleState.None
							)
					);
				}
				return [];

			case TreeItemType.UpstreamState:
				// Could show upstream commits here
				return [];

			default:
				return [];
		}
	}

	private getStackLabel(stack: Stack): string {
		if (stack.branches.length === 0) {
			return 'Stack (no branches)';
		}

		const mainBranch = stack.branches[0];
		const totalCommits = stack.branches.reduce((sum, b) => sum + b.commits.length, 0);

		if (stack.branches.length === 1) {
			return mainBranch.name;
		}

		return `${mainBranch.name} (+${stack.branches.length - 1} more, ${totalCommits} commits)`;
	}
}
