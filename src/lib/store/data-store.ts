import fs from "fs";
import os from "os";
import path from "path";
import type { AgentSession, DataStore, Project, RunRecord } from "@/types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(os.homedir(), ".cursor-agent-web");
const DATA_FILE = path.join(DATA_DIR, "data.json");

function emptyStore(): DataStore {
  return { projects: [], sessions: [], runs: [] };
}

function readStore(): DataStore {
  try {
    if (!fs.existsSync(DATA_FILE)) return emptyStore();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as DataStore;
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
  store.projects = store.projects.filter((p) => p.id !== id);
  store.sessions = store.sessions.filter((s) => s.projectId !== id);
  writeStore(store);
  return store.projects.length < before;
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
