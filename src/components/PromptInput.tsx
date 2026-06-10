"use client";

import { ChevronDown, File, Folder, Mic, Plus, Wand2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "@/lib/api/client";
import type { FileEntry, SkillInfo } from "@/types";

interface PromptInputProps {
  models: { id: string; label: string }[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onSubmit?: (prompt: string) => void;
  disabled?: boolean;
  projectId?: string | null;
  initialValue?: string;
  onInitialValueConsumed?: () => void;
}

type MenuType = "skill" | "file" | null;

export function PromptInput({
  models,
  selectedModel: controlledModel,
  onModelChange,
  onSubmit,
  disabled,
  projectId,
  initialValue,
  onInitialValueConsumed,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [internalModel, setInternalModel] = useState(models[0]?.id ?? "");
  const [modelOpen, setModelOpen] = useState(false);
  const [menuType, setMenuType] = useState<MenuType>(null);
  const [menuQuery, setMenuQuery] = useState("");
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModel = controlledModel ?? internalModel;
  const currentModel = models.find((m) => m.id === selectedModel);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      onInitialValueConsumed?.();
      textareaRef.current?.focus();
    }
  }, [initialValue, onInitialValueConsumed]);

  useEffect(() => {
    api.fetchSkills(projectId ?? undefined).then(setSkills).catch(() => {});
  }, [projectId]);

  const loadFiles = useCallback(
    async (query: string) => {
      if (!projectId) return;
      try {
        const list = await api.fetchProjectFiles(projectId, query);
        setFiles(list.filter((f) => !f.isDirectory).slice(0, 30));
      } catch {
        setFiles([]);
      }
    },
    [projectId]
  );

  function detectMenu(text: string) {
    const skillMatch = text.match(/\/([a-zA-Z0-9_-]*)$/);
    const fileMatch = text.match(/@([^\s]*)$/);
    if (fileMatch && projectId) {
      setMenuType("file");
      setMenuQuery(fileMatch[1]);
      loadFiles(fileMatch[1]);
      return;
    }
    if (skillMatch) {
      setMenuType("skill");
      setMenuQuery(skillMatch[1].toLowerCase());
      return;
    }
    setMenuType(null);
  }

  function handleChange(text: string) {
    setValue(text);
    detectMenu(text);
  }

  function insertSkill(skill: SkillInfo) {
    const newVal = value.replace(/\/[a-zA-Z0-9_-]*$/, `/${skill.name} `);
    setValue(newVal);
    setMenuType(null);
    textareaRef.current?.focus();
  }

  function insertFile(file: FileEntry) {
    const newVal = value.replace(/@[^\s]*$/, `@${file.path} `);
    setValue(newVal);
    setMenuType(null);
    textareaRef.current?.focus();
  }

  function handleModelSelect(id: string) {
    setInternalModel(id);
    onModelChange?.(id);
    setModelOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (menuType && e.key === "Escape") {
      setMenuType(null);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit?.(value.trim());
        setValue("");
        setMenuType(null);
      }
    }
  }

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(menuQuery) ||
      s.id.toLowerCase().includes(menuQuery)
  );

  return (
    <div className="relative w-full max-w-2xl">
      {menuType === "skill" && filteredSkills.length > 0 && (
        <div className="absolute bottom-full left-0 z-20 mb-2 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-bg-elevated py-1 shadow-xl">
          {filteredSkills.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => insertSkill(s)}
              className="flex w-full flex-col px-3 py-2 text-left hover:bg-bg-surface"
            >
              <span className="flex items-center gap-1.5 text-[12px] text-text-primary">
                <Wand2 size={12} className="text-accent" />
                {s.name}
                <span className="text-[10px] text-text-muted">({s.source})</span>
              </span>
              {s.description && (
                <span className="mt-0.5 truncate text-[11px] text-text-muted">{s.description}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {menuType === "file" && files.length > 0 && (
        <div className="absolute bottom-full left-0 z-20 mb-2 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-bg-elevated py-1 shadow-xl">
          {files.map((f) => (
            <button
              key={f.path}
              type="button"
              onClick={() => insertFile(f)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-text-secondary hover:bg-bg-surface hover:text-text-primary"
            >
              <File size={12} className="shrink-0 opacity-60" />
              <span className="truncate">{f.path}</span>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-bg-input shadow-lg shadow-black/20">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Plan, Build, / for skills, @ for context"
          rows={3}
          disabled={disabled}
          className="w-full resize-none rounded-t-2xl bg-transparent px-5 pt-5 pb-2 text-[15px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
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
            {projectId && (
              <button
                type="button"
                onClick={() => {
                  setValue((v) => v + "@");
                  setMenuType("file");
                  loadFiles("");
                }}
                title="引用文件"
                className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary"
              >
                <Folder size={16} />
              </button>
            )}
          </div>
          <button type="button" className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary">
            <Mic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
