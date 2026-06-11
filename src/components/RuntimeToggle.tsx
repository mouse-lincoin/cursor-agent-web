"use client";

import { Cloud, User } from "lucide-react";
import type { AgentRuntime } from "@/types";

interface RuntimeToggleProps {
  value: AgentRuntime;
  onChange: (v: AgentRuntime) => void;
  disabled?: boolean;
  repoUrl?: string | null;
}

export function RuntimeToggle({ value, onChange, disabled, repoUrl }: RuntimeToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex rounded-lg border border-border bg-bg-surface p-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("local")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors ${
            value === "local" ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
          } disabled:opacity-50`}
        >
          <User size={12} />
          Local
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("cloud")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors ${
            value === "cloud" ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
          } disabled:opacity-50`}
        >
          <Cloud size={12} />
          Cloud
        </button>
      </div>
      {value === "cloud" && (
        <p className="text-[10px] text-text-muted">
          {repoUrl ? `repo: ${repoUrl}` : "需要 Git origin remote"}
        </p>
      )}
    </div>
  );
}
