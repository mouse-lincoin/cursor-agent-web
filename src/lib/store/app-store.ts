"use client";

import { create } from "zustand";
import * as api from "@/lib/api/client";
import type { AgentSession, ChatMessage, ModelInfo, Project, ProjectGroup } from "@/types";

interface AppState {
  projects: Project[];
  sessions: AgentSession[];
  models: ModelInfo[];
  messages: ChatMessage[];
  activeProjectId: string | null;
  activeSessionId: string | null;
  selectedModel: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  view: "home" | "chat" | "git";

  init: () => Promise<void>;
  setActiveProject: (id: string | null) => void;
  setActiveSession: (id: string | null) => void;
  setSelectedModel: (model: string) => void;
  addProject: (path: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  newAgent: () => Promise<void>;
  sendMessage: (prompt: string) => Promise<void>;
  goHome: () => void;
  openGit: (projectId?: string) => void;
  getProjectGroups: () => ProjectGroup[];
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  sessions: [],
  models: [{ id: "composer-2.5", label: "Composer 2.5" }],
  messages: [],
  activeProjectId: null,
  activeSessionId: null,
  selectedModel: "composer-2.5",
  isLoading: false,
  isStreaming: false,
  error: null,
  view: "home",

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const [projects, sessions, models] = await Promise.all([
        api.fetchProjects(),
        api.fetchSessions(),
        api.fetchModels(),
      ]);
      set({
        projects,
        sessions,
        models: models.length ? models : get().models,
        selectedModel: models[0]?.id ?? "composer-2.5",
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "加载失败" });
    }
  },

  setActiveProject: (id) => {
    set({ activeProjectId: id });
    if (id) api.touchProject(id).catch(() => {});
  },

  setActiveSession: (id) => {
    const session = get().sessions.find((s) => s.id === id);
    set({
      activeSessionId: id,
      activeProjectId: session?.projectId ?? get().activeProjectId,
      view: id ? "chat" : "home",
      messages: [],
    });
  },

  setSelectedModel: (model) => set({ selectedModel: model }),

  addProject: async (path) => {
    const project = await api.addProject(path);
    set((s) => ({ projects: [project, ...s.projects], activeProjectId: project.id }));
  },

  removeProject: async (id) => {
    await api.removeProject(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      sessions: s.sessions.filter((sess) => sess.projectId !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
      activeSessionId: s.sessions.find((sess) => sess.id === s.activeSessionId)?.projectId === id
        ? null
        : s.activeSessionId,
      view: s.activeSessionId && s.sessions.find((sess) => sess.id === s.activeSessionId)?.projectId === id
        ? "home"
        : s.view,
    }));
  },

  refreshSessions: async () => {
    const sessions = await api.fetchSessions();
    set({ sessions });
  },

  newAgent: async () => {
    const { activeProjectId, selectedModel, projects } = get();
    const projectId = activeProjectId ?? projects[0]?.id;
    if (!projectId) {
      set({ error: "请先添加一个项目目录" });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const session = await api.createSession(projectId, selectedModel);
      set((s) => ({
        sessions: [session, ...s.sessions],
        activeSessionId: session.id,
        activeProjectId: projectId,
        messages: [],
        view: "home",
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "创建失败" });
    }
  },

  sendMessage: async (prompt) => {
    const { activeSessionId, activeProjectId, projects, selectedModel } = get();
    let sessionId = activeSessionId;

    set({ error: null });

    // Create session on first message if needed
    if (!sessionId) {
      const projectId = activeProjectId ?? projects[0]?.id;
      if (!projectId) {
        set({ error: "请先添加一个项目目录" });
        return;
      }
      set({ isLoading: true });
      try {
        const session = await api.createSession(projectId, selectedModel, prompt.slice(0, 60));
        sessionId = session.id;
        set((s) => ({
          sessions: [session, ...s.sessions],
          activeSessionId: session.id,
          activeProjectId: projectId,
          view: "chat",
          isLoading: false,
        }));
        await get().refreshSessions();
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : "创建失败" });
        return;
      }
    } else {
      set({ view: "chat" });
    }

    const userMsg = api.buildUserMessage(prompt);
    const assistantMsg = api.buildAssistantMessage();
    set((s) => ({
      messages: [...s.messages, userMsg, assistantMsg],
      isStreaming: true,
    }));

    try {
      await api.sendPromptStream(sessionId!, prompt, (event, data) => {
        if (event === "message") {
          const d = data as { text?: string };
          if (d.text) {
            set((s) => {
              const msgs = [...s.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") {
                msgs[msgs.length - 1] = { ...last, content: last.content + d.text };
              }
              return { messages: msgs };
            });
          }
        }
        if (event === "done") {
          set((s) => {
            const msgs = [...s.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, isStreaming: false };
            }
            return { messages: msgs, isStreaming: false };
          });
          get().refreshSessions();
        }
      });
    } catch (err) {
      set((s) => {
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant" && !last.content) {
          msgs[msgs.length - 1] = {
            ...last,
            content: `错误: ${err instanceof Error ? err.message : "运行失败"}`,
            isStreaming: false,
          };
        }
        return {
          messages: msgs,
          isStreaming: false,
          error: err instanceof Error ? err.message : "运行失败",
        };
      });
    }
  },

  goHome: () => set({ view: "home", activeSessionId: null, messages: [] }),

  openGit: (projectId) => {
    const id = projectId ?? get().activeProjectId ?? get().projects[0]?.id;
    if (!id) {
      set({ error: "请先添加一个项目目录" });
      return;
    }
    set({ activeProjectId: id, view: "git", activeSessionId: null, messages: [] });
  },

  getProjectGroups: () => {
    const { projects, sessions } = get();
    if (projects.length === 0) {
      return [{ id: "empty", label: "Projects", projects: [] }];
    }
    return [
      {
        id: "projects",
        label: "Projects",
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          path: p.path,
          sessions: sessions
            .filter((s) => s.projectId === p.id)
            .map((s) => ({ id: s.id, title: s.title })),
        })),
      },
    ];
  },
}));
