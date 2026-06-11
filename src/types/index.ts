export interface Project {
  id: string;
  name: string;
  path: string;
  addedAt: string;
  lastOpenedAt: string;
}

export type AgentRuntime = "local" | "cloud";

export interface AgentSession {
  id: string;
  projectId: string;
  agentId: string;
  title: string;
  model: string;
  runtime: AgentRuntime;
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RunRecord {
  id: string;
  agentSessionId: string;
  prompt: string;
  status: "running" | "finished" | "error" | "cancelled";
  startedAt: string;
  finishedAt?: string;
}

export interface SessionTranscript {
  sessionId: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface Automation {
  id: string;
  name: string;
  projectId: string;
  prompt: string;
  cron: string;
  model: string;
  runtime: AgentRuntime;
  enabled: boolean;
  lastRunAt?: string;
  lastStatus?: "finished" | "error";
  createdAt: string;
}

export interface AppSettings {
  defaultRuntime: AgentRuntime;
  sandboxMode: boolean;
  splitView: boolean;
}

export interface RuleInfo {
  id: string;
  name: string;
  path: string;
  source: "user" | "project";
  preview: string;
}

export interface DataStore {
  projects: Project[];
  sessions: AgentSession[];
  runs: RunRecord[];
  transcripts: SessionTranscript[];
  automations: Automation[];
  settings: AppSettings;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  runId?: string;
  errorType?: "startup" | "run";
}

export interface ModelInfo {
  id: string;
  label: string;
}

export interface SkillInfo {
  id: string;
  name: string;
  description: string;
  source: "user" | "project";
}

export interface FileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
}

export interface UserProfile {
  name: string;
  plan: string;
}

export interface ProjectGroup {
  id: string;
  label: string;
  projects: {
    id: string;
    name: string;
    path: string;
    sessions: { id: string; title: string; runtime?: AgentRuntime }[];
  }[];
}

export type AppView = "home" | "chat" | "git" | "automations" | "customize" | "settings";

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRuntime: "local",
  sandboxMode: false,
  splitView: false,
};

export const PLAN_NEW_IDEA_TEMPLATE = `I have a new idea I'd like to plan. Please help me:
1. Ask clarifying questions about the goal and constraints
2. Identify risks and dependencies
3. Propose a phased implementation plan

My idea: `;
