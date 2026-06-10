export interface Project {
  id: string;
  name: string;
  path: string;
  addedAt: string;
  lastOpenedAt: string;
}

export interface AgentSession {
  id: string;
  projectId: string;
  agentId: string;
  title: string;
  model: string;
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

export interface DataStore {
  projects: Project[];
  sessions: AgentSession[];
  runs: RunRecord[];
  transcripts: SessionTranscript[];
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
    sessions: { id: string; title: string }[];
  }[];
}

export const PLAN_NEW_IDEA_TEMPLATE = `I have a new idea I'd like to plan. Please help me:
1. Ask clarifying questions about the goal and constraints
2. Identify risks and dependencies
3. Propose a phased implementation plan

My idea: `;
