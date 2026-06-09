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

export interface DataStore {
  projects: Project[];
  sessions: AgentSession[];
  runs: RunRecord[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ModelInfo {
  id: string;
  label: string;
}

export interface UserProfile {
  name: string;
  plan: string;
}

// Legacy shape for sidebar grouping
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
