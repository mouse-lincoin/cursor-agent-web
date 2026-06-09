"use client";

import { ChevronDown, Mic, Plus } from "lucide-react";
import { useState } from "react";

interface PromptInputProps {
  models: { id: string; label: string }[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onSubmit?: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({
  models,
  selectedModel: controlledModel,
  onModelChange,
  onSubmit,
  disabled,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [internalModel, setInternalModel] = useState(models[0]?.id ?? "");
  const [modelOpen, setModelOpen] = useState(false);

  const selectedModel = controlledModel ?? internalModel;
  const currentModel = models.find((m) => m.id === selectedModel);

  function handleModelSelect(id: string) {
    setInternalModel(id);
    onModelChange?.(id);
    setModelOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit?.(value.trim());
        setValue("");
      }
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-bg-input shadow-lg shadow-black/20">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Plan, Build, / for skills, @ for context"
          rows={3}
          disabled={disabled}
          className="w-full resize-none rounded-t-2xl bg-transparent px-5 pt-5 pb-2 text-[15px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary"
            >
              <Plus size={18} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelOpen(!modelOpen)}
                className="flex items-center gap-1 rounded-full border border-border bg-bg-surface px-3 py-1 text-[12px] text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                {currentModel?.label ?? "Select model"}
                <ChevronDown size={12} className="opacity-60" />
              </button>
              {modelOpen && (
                <div className="absolute bottom-full left-0 z-10 mb-1 min-w-[180px] rounded-lg border border-border bg-bg-elevated py-1 shadow-xl">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleModelSelect(m.id)}
                      className={`flex w-full px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-bg-surface ${
                        m.id === selectedModel ? "text-text-primary" : "text-text-secondary"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary"
          >
            <Mic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
