import simpleGit, { type SimpleGit } from "simple-git";
import { getProject } from "@/lib/store/data-store";
import type { GitBranchInfo, GitLogEntry, GitRemoteInfo, GitStatusResult } from "@/types/git";

export function getProjectGit(projectId: string): SimpleGit {
  const project = getProject(projectId);
  if (!project) throw new Error("项目不存在");
  return simpleGit(project.path);
}

export async function isGitRepo(projectId: string): Promise<boolean> {
  try {
    return await getProjectGit(projectId).checkIsRepo();
  } catch {
    return false;
  }
}

export async function gitStatus(projectId: string): Promise<GitStatusResult> {
  const git = getProjectGit(projectId);
  const s = await git.status();

  const staged: GitStatusResult["staged"] = [];
  const unstaged: GitStatusResult["unstaged"] = [];
  const conflicted = [...s.conflicted];

  for (const f of s.files) {
    if (f.index !== " " && f.index !== "?") {
      staged.push({ path: f.path, index: f.index, working_dir: f.working_dir });
    }
    if (f.working_dir !== " " && f.working_dir !== "?") {
      unstaged.push({ path: f.path, index: f.index, working_dir: f.working_dir });
    }
  }

  return {
    current: s.current ?? "HEAD detached",
    tracking: s.tracking,
    ahead: s.ahead,
    behind: s.behind,
    staged,
    unstaged,
    untracked: s.not_added,
    conflicted,
    isClean: s.isClean(),
  };
}

export async function gitDiff(projectId: string, staged: boolean, file?: string): Promise<string> {
  const git = getProjectGit(projectId);
  const args = staged ? ["--cached"] : [];
  if (file) args.push("--", file);
  return git.diff(args);
}

export async function gitLog(projectId: string, limit = 20): Promise<GitLogEntry[]> {
  const git = getProjectGit(projectId);
  const log = await git.log({ maxCount: limit });
  return log.all.map((e) => ({
    hash: e.hash,
    date: e.date,
    message: e.message,
    author_name: e.author_name,
  }));
}

export async function gitBranches(projectId: string): Promise<GitBranchInfo> {
  const git = getProjectGit(projectId);
  const summary = await git.branchLocal();
  const remote = await git.branch(["-r"]);
  const all = [...summary.all, ...remote.all.filter((b) => !b.includes("HEAD"))];
  return {
    current: summary.current,
    all: [...new Set(all)],
    branches: { current: summary.current, all: summary.all },
  };
}

export async function gitRemotes(projectId: string): Promise<GitRemoteInfo[]> {
  const git = getProjectGit(projectId);
  const remotes = await git.getRemotes(true);
  return remotes.map((r) => ({
    name: r.name,
    refs: { fetch: r.refs.fetch ?? "", push: r.refs.push ?? "" },
  }));
}

export async function gitCheckout(projectId: string, branch: string): Promise<void> {
  await getProjectGit(projectId).checkout(branch);
}

export async function gitStage(projectId: string, files?: string[]): Promise<void> {
  const git = getProjectGit(projectId);
  if (!files || files.length === 0) {
    await git.add(".");
  } else {
    await git.add(files);
  }
}

export async function gitUnstage(projectId: string, files?: string[]): Promise<void> {
  const git = getProjectGit(projectId);
  if (!files || files.length === 0) {
    await git.reset(["HEAD"]);
  } else {
    await git.reset(["HEAD", "--", ...files]);
  }
}

export async function gitCommit(projectId: string, message: string): Promise<string> {
  if (!message.trim()) throw new Error("commit message 不能为空");
  const result = await getProjectGit(projectId).commit(message.trim());
  return result.commit;
}

export async function gitPull(projectId: string): Promise<string> {
  const result = await getProjectGit(projectId).pull();
  return String(result.summary?.changes ?? "ok");
}

export async function gitPush(projectId: string): Promise<string> {
  await getProjectGit(projectId).push();
  return "pushed";
}

export async function gitFetch(projectId: string): Promise<void> {
  await getProjectGit(projectId).fetch();
}

export async function gitMerge(projectId: string, branch: string): Promise<string> {
  const result = await getProjectGit(projectId).merge([branch]);
  if (result.conflicts.length > 0) {
    throw new Error(`合并冲突: ${result.conflicts.join(", ")}`);
  }
  return String(result.summary?.changes ?? "merged");
}

export async function gitStash(projectId: string, message?: string): Promise<void> {
  const git = getProjectGit(projectId);
  if (message) await git.stash(["push", "-m", message]);
  else await git.stash();
}

export async function gitStashPop(projectId: string): Promise<void> {
  await getProjectGit(projectId).stash(["pop"]);
}
