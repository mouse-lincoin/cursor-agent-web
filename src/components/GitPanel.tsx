"use client";

import {
  ArrowDown,
  ArrowUp,
  GitBranch,
  GitCommit,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as gitApi from "@/lib/api/git-client";
import type { GitBranchInfo, GitLogEntry, GitStatusResult } from "@/types/git";

type Tab = "changes" | "history" | "branches";

interface GitPanelProps {
  projectId: string;
  projectName: string;
}

function FileList({
  title,
  files,
  selected,
  onSelect,
  badge,
}: {
  title: string;
  files: { path: string; status?: string }[];
  selected: string | null;
  onSelect: (path: string) => void;
  badge?: string;
}) {
  if (files.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {title}
        {badge && (
          <span className="rounded-full bg-bg-elevated px-1.5 py-0.5 text-[10px]">{badge}</span>
        )}
      </div>
      <div className="space-y-0.5">
        {files.map((f) => (
          <button
            key={f.path}
            onClick={() => onSelect(f.path)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] ${
              selected === f.path
                ? "bg-bg-elevated text-text-primary"
                : "text-text-secondary hover:bg-bg-elevated/60"
            }`}
          >
            <span className="w-4 shrink-0 text-[10px] text-text-muted">{f.status ?? "M"}</span>
            <span className="truncate">{f.path}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function GitPanel({ projectId, projectName }: GitPanelProps) {
  const [tab, setTab] = useState<Tab>("changes");
  const [status, setStatus] = useState<GitStatusResult | null>(null);
  const [log, setLog] = useState<GitLogEntry[]>([]);
  const [branches, setBranches] = useState<GitBranchInfo | null>(null);
  const [diff, setDiff] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [commitMsg, setCommitMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, l, b] = await Promise.all([
        gitApi.fetchGitStatus(projectId),
        gitApi.fetchGitLog(projectId),
        gitApi.fetchGitBranches(projectId),
      ]);
      setStatus(s);
      setLog(l);
      setBranches(b);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function loadDiff(file: string, staged: boolean) {
    setSelectedFile(file);
    try {
      const d = await gitApi.fetchGitDiff(projectId, staged, file);
      setDiff(d || "(无差异)");
    } catch (err) {
      setDiff(err instanceof Error ? err.message : "加载 diff 失败");
    }
  }

  async function act(fn: () => Promise<void>) {
    setActing(true);
    setError(null);
    try {
      await fn();
      await refresh();
      setDiff("");
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "changes", label: "Changes" },
    { id: "history", label: "History" },
    { id: "branches", label: "Branches" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-text-muted" />
          <span className="text-[14px] font-medium text-text-primary">{projectName}</span>
          {status && (
            <span className="rounded-full border border-border bg-bg-surface px-2 py-0.5 text-[11px] text-text-secondary">
              {status.current}
              {status.tracking && (
                <span className="ml-1 text-text-muted">
                  ({status.ahead > 0 && `↑${status.ahead}`}
                  {status.behind > 0 && `↓${status.behind}`})
                </span>
              )}
            </span>
          )}
          {status?.conflicted && status.conflicted.length > 0 && (
            <span className="rounded-full bg-red-950 px-2 py-0.5 text-[11px] text-red-300">
              {status.conflicted.length} 冲突
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => act(() => gitApi.gitFetchRemote(projectId))}
            disabled={acting}
            title="Fetch"
            className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary disabled:opacity-50"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => act(() => gitApi.gitPull(projectId))}
            disabled={acting}
            title="Pull"
            className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary disabled:opacity-50"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => act(() => gitApi.gitPush(projectId))}
            disabled={acting}
            title="Push"
            className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary disabled:opacity-50"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-border-subtle px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-3 py-2 text-[12px] transition-colors ${
              tab === t.id
                ? "border-accent text-text-primary"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="shrink-0 border-b border-red-900/50 bg-red-950/30 px-4 py-2 text-[12px] text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-text-muted">
          <Loader2 size={16} className="animate-spin" />
          加载 Git 状态...
        </div>
      ) : tab === "changes" ? (
        <div className="flex flex-1 overflow-hidden">
          {/* File list */}
          <div className="w-[280px] shrink-0 overflow-y-auto border-r border-border-subtle p-3">
            {(status?.conflicted.length ?? 0) > 0 && (
              <FileList
                title="Conflicted"
                files={status!.conflicted.map((p) => ({ path: p, status: "C" }))}
                selected={selectedFile}
                onSelect={(f) => loadDiff(f, false)}
                badge="!"
              />
            )}
            <FileList
              title="Staged"
              files={status?.staged.map((f) => ({ path: f.path, status: f.index })) ?? []}
              selected={selectedFile}
              onSelect={(f) => loadDiff(f, true)}
            />
            <FileList
              title="Changes"
              files={status?.unstaged.map((f) => ({ path: f.path, status: f.working_dir })) ?? []}
              selected={selectedFile}
              onSelect={(f) => loadDiff(f, false)}
            />
            <FileList
              title="Untracked"
              files={status?.untracked.map((p) => ({ path: p, status: "?" })) ?? []}
              selected={selectedFile}
              onSelect={(f) => loadDiff(f, false)}
            />
            {status?.isClean && (
              <p className="px-2 text-[12px] text-text-muted">工作区干净，无变更</p>
            )}

            <div className="mt-4 flex flex-wrap gap-1">
              <button
                onClick={() => act(() => gitApi.gitStage(projectId))}
                disabled={acting}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-bg-elevated disabled:opacity-50"
              >
                <Plus size={11} /> Stage All
              </button>
              <button
                onClick={() => act(() => gitApi.gitUnstage(projectId))}
                disabled={acting}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-bg-elevated disabled:opacity-50"
              >
                <Minus size={11} /> Unstage All
              </button>
              <button
                onClick={() => act(() => gitApi.gitStash(projectId))}
                disabled={acting}
                className="rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-bg-elevated disabled:opacity-50"
              >
                Stash
              </button>
              <button
                onClick={() => act(() => gitApi.gitStashPop(projectId))}
                disabled={acting}
                className="rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-bg-elevated disabled:opacity-50"
              >
                Stash Pop
              </button>
            </div>

            {/* Commit */}
            <div className="mt-4 space-y-2">
              <textarea
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="Commit message"
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-bg-input px-3 py-2 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                onClick={() =>
                  act(async () => {
                    await gitApi.gitCommit(projectId, commitMsg);
                    setCommitMsg("");
                  })
                }
                disabled={acting || !commitMsg.trim() || (status?.staged.length ?? 0) === 0}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-[12px] text-white hover:bg-accent-hover disabled:opacity-50"
              >
                <GitCommit size={14} />
                Commit
              </button>
            </div>
          </div>

          {/* Diff viewer */}
          <div className="flex-1 overflow-auto p-4">
            {selectedFile ? (
              <div>
                <div className="mb-2 text-[12px] text-text-muted">{selectedFile}</div>
                <pre className="whitespace-pre-wrap rounded-lg border border-border bg-bg-surface p-4 font-mono text-[11px] leading-relaxed text-text-secondary">
                  {diff}
                </pre>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-text-muted">
                选择文件查看 diff
              </div>
            )}
          </div>
        </div>
      ) : tab === "history" ? (
        <div className="flex-1 overflow-y-auto p-4">
          {log.length === 0 ? (
            <p className="text-[13px] text-text-muted">暂无提交记录</p>
          ) : (
            <div className="space-y-2">
              {log.map((entry) => (
                <div
                  key={entry.hash}
                  className="rounded-lg border border-border-subtle bg-bg-surface px-4 py-3"
                >
                  <div className="mb-1 text-[13px] text-text-primary">{entry.message}</div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span className="font-mono">{entry.hash.slice(0, 7)}</span>
                    <span>{entry.author_name}</span>
                    <span>{new Date(entry.date).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 text-[12px] text-text-muted">
            当前分支: <span className="text-text-primary">{branches?.current}</span>
          </div>
          <div className="space-y-1">
            {branches?.all.map((b) => (
              <button
                key={b}
                onClick={() => act(() => gitApi.gitCheckout(projectId, b.replace(/^origin\//, "")))}
                disabled={acting || b === branches.current}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] ${
                  b === branches.current || b === `origin/${branches.current}`
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-secondary hover:bg-bg-elevated/60"
                } disabled:opacity-50`}
              >
                <GitBranch size={13} />
                {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
