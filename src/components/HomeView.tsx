"use client";

import { Lightbulb } from "lucide-react";
import { PromptInput } from "./PromptInput";

interface HomeViewProps {
  models: { id: string; label: string }[];
  selectedModel: string;
  isStreaming: boolean;
  hasProjects: boolean;
  onModelChange: (model: string) => void;
  onSubmit?: (prompt: string) => void;
  onPlanNewIdea?: () => void;
  onAddProject?: () => void;
}

export function HomeView({
  models,
  selectedModel,
  isStreaming,
  hasProjects,
  onModelChange,
  onSubmit,
  onPlanNewIdea,
  onAddProject,
}: HomeViewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        {!hasProjects && (
          <div className="rounded-lg border border-border bg-bg-surface px-4 py-3 text-center text-[13px] text-text-secondary">
            尚未添加项目。{" "}
            <button onClick={onAddProject} className="text-accent hover:underline">
              添加本地目录
            </button>{" "}
            后即可开始 Agent 对话。
          </div>
        )}

        <PromptInput
          models={models}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onSubmit={onSubmit}
          disabled={isStreaming || !hasProjects}
        />

        <button
          onClick={onPlanNewIdea}
          disabled={!hasProjects || isStreaming}
          className="flex items-center gap-2 rounded-full border border-border bg-bg-surface px-4 py-2 text-[13px] text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary disabled:opacity-50"
        >
          <Lightbulb size={15} className="opacity-70" />
          Plan New Idea
          <kbd className="ml-1 rounded border border-border bg-bg-base px-1.5 py-0.5 text-[10px] text-text-muted">
            Tab
          </kbd>
        </button>
      </div>

      <p className="mt-auto pb-6 text-center text-[12px] text-text-muted">
        Use automations to save time on repetitive tasks with always-on agents.
      </p>
    </div>
  );
}
