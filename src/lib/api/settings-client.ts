import type { AgentRuntime, AppSettings, Automation, RuleInfo } from "@/types";

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `请求失败 (${res.status})`);
  return data as T;
}

export async function fetchSettings(): Promise<AppSettings> {
  const data = await handle<{ settings: AppSettings }>(await fetch("/api/settings"));
  return data.settings;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const data = await handle<{ settings: AppSettings }>(
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
  return data.settings;
}

export async function fetchAutomations(): Promise<Automation[]> {
  const data = await handle<{ automations: Automation[] }>(await fetch("/api/automations"));
  return data.automations;
}

export async function createAutomation(input: {
  name: string;
  projectId: string;
  prompt: string;
  cron: string;
  model?: string;
  runtime?: AgentRuntime;
}): Promise<Automation> {
  const data = await handle<{ automation: Automation }>(
    await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
  return data.automation;
}

export async function toggleAutomation(id: string, enabled: boolean): Promise<void> {
  await handle(
    await fetch(`/api/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    })
  );
}

export async function deleteAutomation(id: string): Promise<void> {
  await handle(await fetch(`/api/automations/${id}`, { method: "DELETE" }));
}

export async function runAutomationNow(id: string): Promise<void> {
  await handle(await fetch(`/api/automations/${id}`, { method: "POST" }));
}

export async function fetchRules(projectId?: string): Promise<RuleInfo[]> {
  const url = projectId ? `/api/customize/rules?projectId=${projectId}` : "/api/customize/rules";
  const data = await handle<{ rules: RuleInfo[] }>(await fetch(url));
  return data.rules;
}

export async function fetchRepoUrl(projectId: string): Promise<string | null> {
  try {
    const data = await handle<{ url: string }>(await fetch(`/api/projects/${projectId}/repo-url`));
    return data.url;
  } catch {
    return null;
  }
}
