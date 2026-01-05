/**
 * Type definitions for GitButler CLI JSON output
 * Based on the structures in crates/but/src/command/legacy/status/json.rs
 */

/**
 * JSON output for the `but status --json` command
 * This represents the status of the GitButler "workspace".
 */
export interface WorkspaceStatus {
	/** Represents uncommitted changes that are not assigned to any stack */
	unassignedChanges: FileChange[];
	/** The stacks that are applied in the current workspace */
	stacks: Stack[];
	/** The most recent common merge base between all applied stacks and the target upstream branch */
	mergeBase: Commit;
	/** Information about how ahead the target upstream branch is compared to the merge base */
	upstreamState: UpstreamState;
}

/** Represents the state of the upstream branch compared to the merge base */
export interface UpstreamState {
	/** The number of commits the upstream is ahead of the merge base */
	behind: number;
	/** The latest commit on the upstream branch */
	latestCommit: Commit;
	/** Timestamp of when the upstream branch was last fetched, in RFC3339 format */
	lastFetched?: string;
}

/** Represents a stack of branches applied in the current workspace */
export interface Stack {
	/** A unique ID specific to the current state of the workspace, to be used by other CLI operations (e.g `rub`) */
	cliId: string;
	/** Represents uncommitted changes assigned to this stack */
	assignedChanges: FileChange[];
	/** The branches that are part of this stack, newest first */
	branches: Branch[];
}

/** Represents a branch in the GitButler workspace */
export interface Branch {
	/** A unique ID specific to the current state of the workspace, to be used by other CLI operations (e.g `rub`) */
	cliId: string;
	/** The name of the branch, e.g. "feature/add-new-api" */
	name: string;
	/** The commits that are part of this branch, newest first */
	commits: Commit[];
	/** The commits that are only at the upstream of this branch, newest first */
	upstreamCommits: Commit[];
	/** Represents the status of the branch with respect to the upstream */
	branchStatus: BranchStatus;
	/** If but status was invoked with --review and if the branch has an associated review ID (eg. PR number), it will be present here */
	reviewId?: string;
}

/** The status of a branch with respect to its upstream */
export enum BranchStatus {
	/** Can push, but there are no changes to be pushed */
	NothingToPush = 'nothingToPush',
	/** Can push. This is the case when there are local changes that can be pushed to the remote. */
	UnpushedCommits = 'unpushedCommits',
	/** Can push, but requires a force push to the remote because commits were rewritten. */
	UnpushedCommitsRequiringForce = 'unpushedCommitsRequiringForce',
	/** Completely unpushed - there is no remote tracking branch so Git never interacted with the remote. */
	CompletelyUnpushed = 'completelyUnpushed',
	/** Fully integrated, no changes to push. */
	Integrated = 'integrated'
}

/** A commit that is in the GitButler workspace */
export interface Commit {
	/** A unique ID specific to the current state of the workspace, to be used by other CLI operations (e.g `rub`) */
	cliId: string;
	/** The commit ID (SHA-1 or SHA-256 depending on the repository configuration) */
	commitId: string;
	/** Timestamp of when the commit was created in format "YYYY-MM-DD HH:MM:SS +ZZZZ" */
	createdAt: string;
	/** The commit message */
	message: string;
	/** The name of the commit author */
	authorName: string;
	/** The email of the commit author */
	authorEmail: string;
	/** Whether the commit is in a conflicted state. Only applicable to local commits (and not to upstream commits) */
	conflicted?: boolean;
	/** If but status was invoked with --review and if the commit has an associated review ID (eg. Gerrit review number), it will be present here */
	reviewId?: string;
	/** If but status was invoked with --files, the list of file changes in this commit will be present here */
	changes?: FileChange[];
}

/** A change to a file in the repository */
export interface FileChange {
	/** A unique ID specific to the current state of the workspace, to be used by other CLI operations (e.g `rub`) */
	cliId: string;
	/** The file path, UTF-8 encoded (note - this can be lossy for some Operating Systems) */
	filePath: string;
	/** The type of change that happened to the file */
	changeType: ChangeType;
}

/** The type of change that happened to a file */
export enum ChangeType {
	/** The file was newly added (it was not tracked before) */
	Added = 'added',
	/** The file was deleted */
	Removed = 'removed',
	/** The file was modified */
	Modified = 'modified',
	/** The file was renamed */
	Renamed = 'renamed'
}
