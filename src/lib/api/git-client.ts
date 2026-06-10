import type { GitBranchInfo, GitLogEntry, GitRemoteInfo, GitStatusResult } from "@/types/git";

async function gitFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `请求失败 (${res.status})`);
  return data as T;
}

export async function fetchGitStatus(projectId: string): Promise<GitStatusResult> {
  const data = await gitFetch<{ status: GitStatusResult }>(
    `/api/projects/${projectId}/git/status`
  );
  return data.status;
}

export async function fetchGitDiff(
  projectId: string,
  staged: boolean,
  file?: string
): Promise<string> {
  const params = new URLSearchParams({ staged: String(staged) });
  if (file) params.set("file", file);
  const data = await gitFetch<{ diff: string }>(
    `/api/projects/${projectId}/git/diff?${params}`
  );
  return data.diff;
}

export async function fetchGitLog(projectId: string, limit = 20): Promise<GitLogEntry[]> {
  const data = await gitFetch<{ log: GitLogEntry[] }>(
    `/api/projects/${projectId}/git/log?limit=${limit}`
  );
  return data.log;
}

export async function fetchGitBranches(projectId: string): Promise<GitBranchInfo> {
  return gitFetch<GitBranchInfo>(`/api/projects/${projectId}/git/branches`);
}

export async function fetchGitRemotes(projectId: string): Promise<GitRemoteInfo[]> {
  const data = await gitFetch<{ remotes: GitRemoteInfo[] }>(
    `/api/projects/${projectId}/git/remotes`
  );
  return data.remotes;
}

export async function gitCheckout(projectId: string, branch: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branch }),
  });
}

export async function gitStage(projectId: string, files?: string[]): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/stage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
}

export async function gitUnstage(projectId: string, files?: string[]): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/unstage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
}

export async function gitCommit(projectId: string, message: string): Promise<string> {
  const data = await gitFetch<{ hash: string }>(`/api/projects/${projectId}/git/commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return data.hash;
}

export async function gitPull(projectId: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/pull`, { method: "POST" });
}

export async function gitPush(projectId: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/push`, { method: "POST" });
}

export async function gitFetchRemote(projectId: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/fetch`, { method: "POST" });
}

export async function gitMerge(projectId: string, branch: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branch }),
  });
}

export async function gitStash(projectId: string, message?: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/stash`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export async function gitStashPop(projectId: string): Promise<void> {
  await gitFetch(`/api/projects/${projectId}/git/stash-pop`, { method: "POST" });
}
