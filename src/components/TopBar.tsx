"use client";

import { ChevronDown, Cloud, ExternalLink, GitBranch, LayoutGrid, MoreHorizontal, User } from "lucide-react";
import type { AgentRuntime } from "@/types";

interface TopBarProps {
  projectName?: string;
  projectPath?: string;
  runtime?: AgentRuntime;
  onHomeClick?: () => void;
  onGitClick?: () => void;
  showGit?: boolean;
}

export function TopBar({
  projectName = "Home",
  projectPath,
  runtime = "local",
  onHomeClick,
  onGitClick,
  showGit,
}: TopBarProps) {
  const editorUrl = projectPath
    ? `cursor://file/${encodeURIComponent(projectPath)}`
    : undefined;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-text-primary transition-colors hover:bg-bg-elevated"
        >
          {projectName}
          <ChevronDown size={14} className="text-text-muted" />
        </button>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-2.5 py-0.5 text-[11px] text-text-secondary">
          {runtime === "cloud" ? (
            <Cloud size={11} className="text-accent" />
          ) : (
            <User size={11} className="text-success" />
          )}
          <span>{runtime === "cloud" ? "Cloud" : "Local"}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {showGit && (
          <button
            onClick={onGitClick}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <GitBranch size={13} />
            Git
          </button>
        )}
        {editorUrl ? (
          <a
            href={editorUrl}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            Editor Window
            <ExternalLink size={12} className="opacity-60" />
          </a>
        ) : (
          <button
            disabled
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-text-muted opacity-50"
          >
            Editor Window
            <ExternalLink size={12} className="opacity-60" />
          </button>
        )}
        <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
          <MoreHorizontal size={16} />
        </button>
        <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
          <LayoutGrid size={16} />
        </button>
      </div>
    </header>
  );
}
