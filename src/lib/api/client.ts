import { parseSSEChunk } from "@/lib/sdk/sse";
import type { AgentSession, ChatMessage, FileEntry, ModelInfo, Project, SkillInfo } from "@/types";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `请求失败 (${res.status})`);
  return data as T;
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await handleResponse<{ projects: Project[] }>(await fetch("/api/projects"));
  return data.projects;
}

export async function addProject(path: string): Promise<Project> {
  const data = await handleResponse<{ project: Project }>(
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    })
  );
  return data.project;
}

export async function removeProject(id: string): Promise<void> {
  await handleResponse(await fetch(`/api/projects/${id}`, { method: "DELETE" }));
}

export async function touchProject(id: string): Promise<void> {
  await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

export async function fetchSessions(projectId?: string): Promise<AgentSession[]> {
  const url = projectId ? `/api/agents?projectId=${projectId}` : "/api/agents";
  const data = await handleResponse<{ sessions: AgentSession[] }>(await fetch(url));
  return data.sessions;
}

export async function createSession(projectId: string, model: string, title?: string): Promise<AgentSession> {
  const data = await handleResponse<{ session: AgentSession }>(
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, model, title }),
    })
  );
  return data.session;
}

export async function fetchMessages(sessionId: string): Promise<ChatMessage[]> {
  const data = await handleResponse<{ messages: ChatMessage[] }>(
    await fetch(`/api/agents/${sessionId}/messages`)
  );
  return data.messages;
}

export async function fetchModels(): Promise<ModelInfo[]> {
  const data = await handleResponse<{ models: ModelInfo[]; warning?: string }>(await fetch("/api/models"));
  return data.models;
}

export async function fetchSkills(projectId?: string): Promise<SkillInfo[]> {
  const url = projectId ? `/api/skills?projectId=${projectId}` : "/api/skills";
  const data = await handleResponse<{ skills: SkillInfo[] }>(await fetch(url));
  return data.skills;
}

export async function fetchProjectFiles(projectId: string, query = ""): Promise<FileEntry[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  const data = await handleResponse<{ files: FileEntry[] }>(
    await fetch(`/api/projects/${projectId}/files${params}`)
  );
  return data.files;
}

export async function cancelRun(sessionId: string, runId: string): Promise<void> {
  await handleResponse(
    await fetch(`/api/agents/${sessionId}/runs/${runId}/cancel`, { method: "POST" })
  );
}

export interface StreamCallbacks {
  onEvent: (event: string, data: unknown) => void;
  onStarted?: (runId: string) => void;
}

export async function sendPromptStream(
  sessionId: string,
  prompt: string,
  callbacks: StreamCallbacks | ((event: string, data: unknown) => void)
): Promise<void> {
  const onEvent = typeof callbacks === "function" ? callbacks : callbacks.onEvent;
  const onStarted = typeof callbacks === "function" ? undefined : callbacks.onStarted;

  const res = await fetch(`/api/agents/${sessionId}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "请求失败" }));
    const e = new Error(err.error ?? `请求失败 (${res.status})`) as Error & { errorType?: string };
    e.errorType = "startup";
    throw e;
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("无法读取响应流");

  const decoder = new TextDecoder();
  let buffer = "";
  let streamError: Error | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { events, remainder } = parseSSEChunk(buffer);
    buffer = remainder;
    for (const e of events) {
      if (e.event === "started") {
        const d = e.data as { runId?: string };
        if (d.runId) onStarted?.(d.runId);
      }
      onEvent(e.event, e.data);
      if (e.event === "error") {
        const d = e.data as { message?: string; errorType?: string };
        streamError = new Error(d.message ?? "运行失败") as Error & { errorType?: string };
        (streamError as Error & { errorType?: string }).errorType = d.errorType ?? "run";
      }
    }
  }

  if (streamError) throw streamError;
}

export function buildUserMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}

export function buildAssistantMessage(content = "", runId?: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    isStreaming: true,
    runId,
  };
}
