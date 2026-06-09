export interface AgentSession {
  id: string;
  title: string;
  isCloud?: boolean;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  sessions: AgentSession[];
}

export interface ProjectGroup {
  id: string;
  label: string;
  projects: Project[];
}

export interface UserProfile {
  name: string;
  plan: string;
  avatarUrl?: string;
}
