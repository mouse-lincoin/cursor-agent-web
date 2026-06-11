"use client";

import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import * as settingsApi from "@/lib/api/settings-client";
import { RuntimeToggle } from "./RuntimeToggle";
import type { AppSettings } from "@/types";

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.fetchSettings().then(setSettings);
  }, []);

  async function patch(partial: Partial<AppSettings>) {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings(partial);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-text-muted">
        加载设置...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border-subtle px-6 py-4">
        <Settings size={18} className="text-text-muted" />
        <h2 className="text-[15px] font-medium text-text-primary">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          <section>
            <h3 className="mb-2 text-[13px] font-medium text-text-primary">默认 Runtime</h3>
            <p className="mb-3 text-[12px] text-text-muted">新建 Agent 时的默认运行环境</p>
            <RuntimeToggle
              value={settings.defaultRuntime}
              onChange={(v) => patch({ defaultRuntime: v })}
              disabled={saving}
            />
          </section>

          <section>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-bg-surface px-4 py-3">
              <div>
                <div className="text-[13px] text-text-primary">沙箱模式</div>
                <div className="text-[11px] text-text-muted">限制 Agent 工具调用（shell/edit 需沙箱审批）</div>
              </div>
              <input
                type="checkbox"
                checked={settings.sandboxMode}
                onChange={(e) => patch({ sandboxMode: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
            </label>
          </section>

          <section>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-bg-surface px-4 py-3">
              <div>
                <div className="text-[13px] text-text-primary">分屏视图</div>
                <div className="text-[11px] text-text-muted">对话时右侧显示 Git 面板</div>
              </div>
              <input
                type="checkbox"
                checked={settings.splitView}
                onChange={(e) => patch({ splitView: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
            </label>
          </section>

          <section className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-[12px] text-text-muted">
            <p>API Key 通过 <code>.env</code> 中的 <code>CURSOR_API_KEY</code> 配置。</p>
            <p className="mt-2">数据存储：<code>~/.cursor-agent-web/data.json</code></p>
          </section>
        </div>
      </div>
    </div>
  );
}
