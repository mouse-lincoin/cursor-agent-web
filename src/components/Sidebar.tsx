"use client";

import {
  Bot,
  ChevronDown,
  ChevronRight,
  Filter,
  FolderPlus,
  GitBranch,
  PanelLeft,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { useState } from "react";
import type { ProjectGroup, UserProfile } from "@/types";

interface SidebarProps {
  groups: ProjectGroup[];
  user: UserProfile;
  activeProjectId?: string | null;
  activeSessionId?: string | null;
  onNewAgent?: () => void;
  onSelectSession?: (sessionId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onAddProject?: () => void;
}

function SessionItem({
  title,
  isActive,
  onClick,
}: {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
        isActive
          ? "bg-bg-elevated text-text-primary"
          : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
      }`}
    >
      <GitBranch size={13} className="shrink-0 opacity-60" />
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </button>
  );
}

function ProjectItem({
  id,
  name,
  sessions,
  isActiveProject,
  activeSessionId,
  onSelectProject,
  onSelectSession,
}: {
  id: string;
  name: string;
  sessions: { id: string; title: string }[];
  isActiveProject?: boolean;
  activeSessionId?: string | null;
  onSelectProject?: (id: string) => void;
  onSelectSession?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(sessions.length > 0 || isActiveProject);

  return (
    <div>
      <button
        onClick={() => {
          if (sessions.length > 0) setExpanded(!expanded);
          onSelectProject?.(id);
        }}
        className={`flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
          isActiveProject
            ? "bg-bg-elevated/40 text-text-primary"
            : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
        }`}
      >
        {sessions.length > 0 ? (
          expanded ? (
            <ChevronDown size={13} className="shrink-0 opacity-50" />
          ) : (
            <ChevronRight size={13} className="shrink-0 opacity-50" />
          )
        ) : (
          <span className="w-[13px]" />
        )}
        <span className="min-w-0 flex-1 truncate">{name}</span>
      </button>
      {expanded && sessions.length > 0 && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border-subtle pl-2">
          {sessions.map((s) => (
            <SessionItem
              key={s.id}
              title={s.title}
              isActive={s.id === activeSessionId}
              onClick={() => onSelectSession?.(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  groups,
  user,
  activeProjectId,
  activeSessionId,
  onNewAgent,
  onSelectSession,
  onSelectProject,
  onAddProject,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border-subtle bg-bg-sidebar">
      <div className="flex items-center gap-1 px-3 py-3">
        <button className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary">
          <PanelLeft size={16} />
        </button>
        <button className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary">
          <Search size={16} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={onNewAgent}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-bg-surface px-3 py-2 text-[13px] font-medium text-text-primary transition-colors hover:bg-bg-elevated"
        >
          <span className="flex items-center gap-2">
            <Plus size={15} />
            New Agent
          </span>
          <kbd className="rounded border border-border bg-bg-base px-1.5 py-0.5 text-[10px] text-text-muted">
            ⌘N
          </kbd>
        </button>
      </div>

      <nav className="space-y-0.5 px-3 pb-3">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-text-primary">
          <Bot size={15} className="opacity-70" />
          Automations
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-text-primary">
          <SlidersHorizontal size={15} className="opacity-70" />
          Customize
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-3">
        {groups.map((group) => (
          <div key={group.id} className="mb-3">
            <div className="mb-1 flex items-center justify-between px-2">
              {group.label && (
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {group.label}
                </span>
              )}
              <button
                onClick={onAddProject}
                title="添加项目"
                className="rounded p-0.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary"
              >
                <FolderPlus size={13} />
              </button>
            </div>
            <div className="space-y-0.5">
              {group.projects.length === 0 ? (
                <button
                  onClick={onAddProject}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-text-muted hover:bg-bg-elevated/60 hover:text-text-secondary"
                >
                  <FolderPlus size={13} />
                  添加本地目录...
                </button>
              ) : (
                group.projects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    sessions={project.sessions}
                    isActiveProject={project.id === activeProjectId}
                    activeSessionId={activeSessionId}
                    onSelectProject={onSelectProject}
                    onSelectSession={onSelectSession}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border-subtle px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated">
            <User size={14} className="text-text-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-text-primary">{user.name}</div>
            <div className="text-[11px] text-text-muted">{user.plan}</div>
          </div>
          <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
            <Filter size={14} />
          </button>
          <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
