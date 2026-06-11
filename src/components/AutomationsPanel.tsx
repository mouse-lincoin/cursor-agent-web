"use client";

import { Bot, Play, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as settingsApi from "@/lib/api/settings-client";
import type { Automation, Project } from "@/types";

interface AutomationsPanelProps {
  projects: Project[];
}

export function AutomationsPanel({ projects }: AutomationsPanelProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    projectId: "",
    prompt: "",
    cron: "0 9 * * 1-5",
    runtime: "local" as const,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setAutomations(await settingsApi.fetchAutomations());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await settingsApi.createAutomation(form);
    setShowForm(false);
    setForm({ name: "", projectId: "", prompt: "", cron: "0 9 * * 1-5", runtime: "local" });
    refresh();
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-text-muted" />
          <h2 className="text-[15px] font-medium text-text-primary">Automations</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-elevated"
        >
          <Plus size={14} />
          新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-[12px] text-text-muted">
          本地 cron 调度，定时向 Agent 发送 prompt。Cron 格式：分 时 日 月 周（如 <code>0 9 * * 1-5</code> 工作日 9:00）
        </p>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-border bg-bg-surface p-4 space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="名称"
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-[13px] focus:outline-none"
              required
            />
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-[13px] focus:outline-none"
              required
            >
              <option value="">选择项目</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <textarea
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              placeholder="Prompt"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-bg-input px-3 py-2 text-[13px] focus:outline-none"
              required
            />
            <input
              value={form.cron}
              onChange={(e) => setForm({ ...form, cron: e.target.value })}
              placeholder="Cron 表达式"
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-[13px] font-mono focus:outline-none"
              required
            />
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-[13px] text-white hover:bg-accent-hover">
              创建
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-[13px] text-text-muted">加载中...</p>
        ) : automations.length === 0 ? (
          <p className="text-[13px] text-text-muted">暂无自动化任务</p>
        ) : (
          <div className="space-y-3">
            {automations.map((a) => (
              <div key={a.id} className="rounded-xl border border-border-subtle bg-bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-text-primary">{a.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${a.enabled ? "bg-green-950 text-green-300" : "bg-bg-elevated text-text-muted"}`}>
                        {a.enabled ? "启用" : "禁用"}
                      </span>
                      <span className="text-[10px] text-text-muted">{a.runtime}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-text-muted">{a.cron}</p>
                    <p className="mt-1 truncate text-[12px] text-text-secondary">{a.prompt}</p>
                    {a.lastRunAt && (
                      <p className="mt-1 text-[10px] text-text-muted">
                        上次: {new Date(a.lastRunAt).toLocaleString()} · {a.lastStatus}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => settingsApi.runAutomationNow(a.id).then(refresh)}
                      title="立即运行"
                      className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => settingsApi.toggleAutomation(a.id, !a.enabled).then(refresh)}
                      className="rounded-md px-2 py-1 text-[11px] text-text-secondary hover:bg-bg-elevated"
                    >
                      {a.enabled ? "禁用" : "启用"}
                    </button>
                    <button
                      onClick={() => settingsApi.deleteAutomation(a.id).then(refresh)}
                      className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
