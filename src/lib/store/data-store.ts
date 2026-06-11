import fs from "fs";
import os from "os";
import path from "path";
import type {
  AgentSession,
  AppSettings,
  Automation,
  ChatMessage,
  DataStore,
  Project,
  RunRecord,
  SessionTranscript,
} from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(os.homedir(), ".cursor-agent-web");
const DATA_FILE = path.join(DATA_DIR, "data.json");

function emptyStore(): DataStore {
  return { projects: [], sessions: [], runs: [], transcripts: [], automations: [], settings: { ...DEFAULT_SETTINGS } };
}

function readStore(): DataStore {
  try {
    if (!fs.existsSync(DATA_FILE)) return emptyStore();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DataStore>;
    const sessions = (parsed.sessions ?? []).map((s) => ({
      ...s,
      runtime: s.runtime ?? "local",
    }));
    return {
      projects: parsed.projects ?? [],
      sessions,
      runs: parsed.runs ?? [],
      transcripts: parsed.transcripts ?? [],
      automations: parsed.automations ?? [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: DataStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function listProjects(): Project[] {
  return readStore().projects.sort(
    (a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
  );
}

export function getProject(id: string): Project | undefined {
  return readStore().projects.find((p) => p.id === id);
}

export function addProject(project: Project): Project {
  const store = readStore();
  if (store.projects.some((p) => p.path === project.path)) {
    throw new Error("该项目路径已注册");
  }
  store.projects.push(project);
  writeStore(store);
  return project;
}

export function updateProject(id: string, patch: Partial<Project>): Project | undefined {
  const store = readStore();
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  store.projects[idx] = { ...store.projects[idx], ...patch };
  writeStore(store);
  return store.projects[idx];
}

export function removeProject(id: string): boolean {
  const store = readStore();
  const before = store.projects.length;
  const removedSessionIds = store.sessions.filter((s) => s.projectId === id).map((s) => s.id);
  store.projects = store.projects.filter((p) => p.id !== id);
  store.sessions = store.sessions.filter((s) => s.projectId !== id);
  store.transcripts = store.transcripts.filter((t) => !removedSessionIds.includes(t.sessionId));
  store.runs = store.runs.filter((r) => !removedSessionIds.includes(r.agentSessionId));
  store.automations = store.automations.filter((a) => a.projectId !== id);
  writeStore(store);
  return store.projects.length < before;
}

export function getSettings(): AppSettings {
  return readStore().settings;
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const store = readStore();
  store.settings = { ...store.settings, ...patch };
  writeStore(store);
  return store.settings;
}

export function listAutomations(): Automation[] {
  return readStore().automations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAutomation(id: string): Automation | undefined {
  return readStore().automations.find((a) => a.id === id);
}

export function addAutomation(automation: Automation): Automation {
  const store = readStore();
  store.automations.push(automation);
  writeStore(store);
  return automation;
}

export function updateAutomation(id: string, patch: Partial<Automation>): Automation | undefined {
  const store = readStore();
  const idx = store.automations.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  store.automations[idx] = { ...store.automations[idx], ...patch };
  writeStore(store);
  return store.automations[idx];
}

export function removeAutomation(id: string): boolean {
  const store = readStore();
  const before = store.automations.length;
  store.automations = store.automations.filter((a) => a.id !== id);
  writeStore(store);
  return store.automations.length < before;
}

export function listSessions(projectId?: string): AgentSession[] {
  const sessions = readStore().sessions;
  if (!projectId) return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return sessions
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getSession(id: string): AgentSession | undefined {
  return readStore().sessions.find((s) => s.id === id);
}

export function addSession(session: AgentSession): AgentSession {
  const store = readStore();
  store.sessions.push(session);
  store.transcripts.push({ sessionId: session.id, messages: [], updatedAt: session.createdAt });
  writeStore(store);
  return session;
}

export function updateSession(id: string, patch: Partial<AgentSession>): AgentSession | undefined {
  const store = readStore();
  const idx = store.sessions.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  store.sessions[idx] = { ...store.sessions[idx], ...patch, updatedAt: new Date().toISOString() };
  writeStore(store);
  return store.sessions[idx];
}

export function addRun(run: RunRecord): RunRecord {
  const store = readStore();
  store.runs.push(run);
  writeStore(store);
  return run;
}

export function updateRun(id: string, patch: Partial<RunRecord>): RunRecord | undefined {
  const store = readStore();
  const idx = store.runs.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  store.runs[idx] = { ...store.runs[idx], ...patch };
  writeStore(store);
  return store.runs[idx];
}

export function getTranscript(sessionId: string): ChatMessage[] {
  const store = readStore();
  return store.transcripts.find((t) => t.sessionId === sessionId)?.messages ?? [];
}

export function saveTranscript(sessionId: string, messages: ChatMessage[]): void {
  const store = readStore();
  const now = new Date().toISOString();
  const idx = store.transcripts.findIndex((t) => t.sessionId === sessionId);
  const entry: SessionTranscript = { sessionId, messages, updatedAt: now };
  if (idx === -1) store.transcripts.push(entry);
  else store.transcripts[idx] = entry;
  writeStore(store);
}

export function appendToTranscript(sessionId: string, newMessages: ChatMessage[]): ChatMessage[] {
  const existing = getTranscript(sessionId);
  const merged = [...existing, ...newMessages];
  saveTranscript(sessionId, merged);
  return merged;
}
