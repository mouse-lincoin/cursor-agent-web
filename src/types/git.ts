export interface GitFileStatus {
  path: string;
  index: string;
  working_dir: string;
}

export interface GitStatusResult {
  current: string;
  tracking: string | null;
  ahead: number;
  behind: number;
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: string[];
  conflicted: string[];
  isClean: boolean;
}

export interface GitLogEntry {
  hash: string;
  date: string;
  message: string;
  author_name: string;
}

export interface GitBranchInfo {
  current: string;
  all: string[];
  branches: {
    current: string;
    all: string[];
  };
}

export interface GitRemoteInfo {
  name: string;
  refs: { fetch: string; push: string };
}
