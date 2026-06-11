"use client";

import { FileText, SlidersHorizontal, Wand2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import * as settingsApi from "@/lib/api/settings-client";
import type { RuleInfo, SkillInfo } from "@/types";

interface CustomizePanelProps {
  projectId?: string | null;
}

export function CustomizePanel({ projectId }: CustomizePanelProps) {
  const [rules, setRules] = useState<RuleInfo[]>([]);
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [tab, setTab] = useState<"rules" | "skills">("rules");

  const refresh = useCallback(async () => {
    const [r, s] = await Promise.all([
      settingsApi.fetchRules(projectId ?? undefined),
      api.fetchSkills(projectId ?? undefined),
    ]);
    setRules(r);
    setSkills(s);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border-subtle px-6 py-4">
        <SlidersHorizontal size={18} className="text-text-muted" />
        <h2 className="text-[15px] font-medium text-text-primary">Customize</h2>
      </div>

      <div className="flex shrink-0 gap-1 border-b border-border-subtle px-6">
        {(["rules", "skills"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-[12px] capitalize ${
              tab === t ? "border-accent text-text-primary" : "border-transparent text-text-muted"
            }`}
          >
            {t === "rules" ? "Rules" : "Skills"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "rules" ? (
          rules.length === 0 ? (
            <p className="text-[13px] text-text-muted">
              未找到规则。在 <code>~/.cursor/rules</code> 或项目 <code>.cursor/rules</code> 中添加 .md 文件。
            </p>
          ) : (
            <div className="space-y-3">
              {rules.map((r) => (
                <div key={r.id} className="rounded-xl border border-border-subtle bg-bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-text-muted" />
                    <span className="text-[13px] font-medium text-text-primary">{r.name}</span>
                    <span className="text-[10px] text-text-muted">({r.source})</span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">{r.preview}</p>
                  <p className="mt-1 font-mono text-[10px] text-text-muted">{r.path}</p>
                </div>
              ))}
            </div>
          )
        ) : skills.length === 0 ? (
          <p className="text-[13px] text-text-muted">
            未找到技能。在 <code>~/.cursor/skills-cursor</code> 或项目 <code>.cursor/skills</code> 中添加。
          </p>
        ) : (
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.id} className="rounded-xl border border-border-subtle bg-bg-surface p-4">
                <div className="flex items-center gap-2">
                  <Wand2 size={14} className="text-accent" />
                  <span className="text-[13px] font-medium text-text-primary">{s.name}</span>
                  <span className="text-[10px] text-text-muted">({s.source})</span>
                </div>
                {s.description && (
                  <p className="mt-2 text-[12px] text-text-secondary">{s.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
