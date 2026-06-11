"use client";

import { create } from "zustand";
import * as api from "@/lib/api/client";
import * as settingsApi from "@/lib/api/settings-client";
import type {
  AgentRuntime,
  AgentSession,
  AppSettings,
  AppView,
  ChatMessage,
  ModelInfo,
  Project,
  ProjectGroup,
} from "@/types";
import { DEFAULT_SETTINGS, PLAN_NEW_IDEA_TEMPLATE } from "@/types";

interface AppState {
  projects: Project[];
  sessions: AgentSession[];
  models: ModelInfo[];
  settings: AppSettings;
  messages: ChatMessage[];
  activeProjectId: string | null;
  activeSessionId: string | null;
  selectedModel: string;
  selectedRuntime: AgentRuntime;
  repoUrl: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  activeRunId: string | null;
  error: string | null;
  errorMeta: { runId?: string; agentId?: string; retryable?: boolean; errorType?: string } | null;
  planTemplate: string | null;
  view: AppView;

  init: () => Promise<void>;
  setActiveProject: (id: string | null) => void;
  setActiveSession: (id: string | null) => Promise<void>;
  setSelectedModel: (model: string) => void;
  setSelectedRuntime: (runtime: AgentRuntime) => void;
  addProject: (path: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  refreshRepoUrl: () => Promise<void>;
  newAgent: () => Promise<void>;
  sendMessage: (prompt: string) => Promise<void>;
  cancelStream: () => Promise<void>;
  clearError: () => void;
  goHome: () => void;
  openGit: (projectId?: string) => void;
  openAutomations: () => void;
  openCustomize: () => void;
  openSettings: () => void;
  openPlanNewIdea: () => void;
  consumePlanTemplate: () => void;
  getProjectGroups: () => ProjectGroup[];
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  sessions: [],
  models: [{ id: "composer-2.5", label: "Composer 2.5" }],
  settings: DEFAULT_SETTINGS,
  messages: [],
  activeProjectId: null,
  activeSessionId: null,
  selectedModel: "composer-2.5",
  selectedRuntime: "local",
  repoUrl: null,
  isLoading: false,
  isStreaming: false,
  activeRunId: null,
  error: null,
  errorMeta: null,
  planTemplate: null,
  view: "home",

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const [projects, sessions, models, settings] = await Promise.all([
        api.fetchProjects(),
        api.fetchSessions(),
        api.fetchModels(),
        settingsApi.fetchSettings(),
      ]);
      set({
        projects,
        sessions,
        models: models.length ? models : get().models,
        settings,
        selectedModel: models[0]?.id ?? "composer-2.5",
        selectedRuntime: settings.defaultRuntime,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "加载失败" });
    }
  },

  setActiveProject: (id) => {
    set({ activeProjectId: id });
    if (id) {
      api.touchProject(id).catch(() => {});
      get().refreshRepoUrl();
    }
  },

  setActiveSession: async (id) => {
    if (!id) {
      set({ activeSessionId: null, view: "home", messages: [] });
      return;
    }
    const session = get().sessions.find((s) => s.id === id);
    set({ isLoading: true, error: null });
    try {
      const messages = await api.fetchMessages(id);
      set({
        activeSessionId: id,
        activeProjectId: session?.projectId ?? get().activeProjectId,
        selectedRuntime: session?.runtime ?? "local",
        view: "chat",
        messages,
        isLoading: false,
      });
    } catch (err) {
      set({
        activeSessionId: id,
        view: "chat",
        messages: [],
        isLoading: false,
        error: err instanceof Error ? err.message : "加载会话失败",
      });
    }
  },

  setSelectedModel: (model) => set({ selectedModel: model }),

  setSelectedRuntime: (runtime) => {
    set({ selectedRuntime: runtime });
    if (runtime === "cloud") get().refreshRepoUrl();
  },

  refreshRepoUrl: async () => {
    const projectId = get().activeProjectId ?? get().projects[0]?.id;
    if (!projectId) return set({ repoUrl: null });
    const url = await settingsApi.fetchRepoUrl(projectId);
    set({ repoUrl: url });
  },

  addProject: async (path) => {
    const project = await api.addProject(path);
    set((s) => ({ projects: [project, ...s.projects], activeProjectId: project.id }));
    get().refreshRepoUrl();
  },

  removeProject: async (id) => {
    await api.removeProject(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      sessions: s.sessions.filter((sess) => sess.projectId !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
      activeSessionId:
        s.sessions.find((sess) => sess.id === s.activeSessionId)?.projectId === id
          ? null
          : s.activeSessionId,
      view:
        s.activeSessionId &&
        s.sessions.find((sess) => sess.id === s.activeSessionId)?.projectId === id
          ? "home"
          : s.view,
    }));
  },

  refreshSessions: async () => {
    const sessions = await api.fetchSessions();
    set({ sessions });
  },

  newAgent: async () => {
    const { activeProjectId, selectedModel, selectedRuntime, projects } = get();
    const projectId = activeProjectId ?? projects[0]?.id;
    if (!projectId) {
      set({ error: "请先添加一个项目目录" });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const session = await api.createSession(projectId, selectedModel, "New Agent", selectedRuntime);
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
    const { activeSessionId, activeProjectId, projects, selectedModel, selectedRuntime } = get();
    let sessionId = activeSessionId;

    set({ error: null, errorMeta: null });

    if (!sessionId) {
      const projectId = activeProjectId ?? projects[0]?.id;
      if (!projectId) {
        set({ error: "请先添加一个项目目录" });
        return;
      }
      set({ isLoading: true });
      try {
        const session = await api.createSession(
          projectId,
          selectedModel,
          prompt.slice(0, 60),
          selectedRuntime
        );
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
        const e = err as Error & { errorType?: string };
        set({
          isLoading: false,
          error: e.message ?? "创建失败",
          errorMeta: { errorType: e.errorType ?? "startup", retryable: true },
        });
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
      activeRunId: null,
    }));

    try {
      await api.sendPromptStream(sessionId!, prompt, {
        onStarted: (runId) => {
          set({ activeRunId: runId });
          set((s) => {
            const msgs = [...s.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") msgs[msgs.length - 1] = { ...last, runId };
            return { messages: msgs };
          });
        },
        onEvent: (event, data) => {
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
            const d = data as { status?: string; runId?: string };
            set((s) => {
              const msgs = [...s.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") {
                msgs[msgs.length - 1] = {
                  ...last,
                  isStreaming: false,
                  errorType: d.status === "error" ? "run" : undefined,
                };
              }
              return {
                messages: msgs,
                isStreaming: false,
                activeRunId: null,
                error: d.status === "error" ? "Agent 运行失败" : null,
                errorMeta: d.status === "error" ? { runId: d.runId, errorType: "run" } : null,
              };
            });
            get().refreshSessions();
          }
          if (event === "error") {
            const d = data as {
              message?: string;
              retryable?: boolean;
              runId?: string;
              agentId?: string;
              errorType?: string;
            };
            set((s) => {
              const msgs = [...s.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") {
                msgs[msgs.length - 1] = {
                  ...last,
                  content: last.content || `错误: ${d.message}`,
                  isStreaming: false,
                  errorType: (d.errorType as "startup" | "run") ?? "run",
                };
              }
              return { messages: msgs };
            });
            set({
              error: d.message ?? "运行失败",
              errorMeta: {
                runId: d.runId,
                agentId: d.agentId,
                retryable: d.retryable,
                errorType: d.errorType,
              },
            });
          }
        },
      });
    } catch (err) {
      const e = err as Error & { errorType?: string };
      set((s) => {
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant") {
          msgs[msgs.length - 1] = {
            ...last,
            content: last.content || `错误: ${e.message}`,
            isStreaming: false,
            errorType: (e.errorType as "startup" | "run") ?? "startup",
          };
        }
        return { messages: msgs, isStreaming: false, activeRunId: null };
      });
      set({
        error: e.message ?? "运行失败",
        errorMeta: { errorType: e.errorType ?? "startup", retryable: true },
      });
    }
  },

  cancelStream: async () => {
    const { activeSessionId, activeRunId } = get();
    if (!activeSessionId || !activeRunId) return;
    try {
      await api.cancelRun(activeSessionId, activeRunId);
      set((s) => {
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant" && last.isStreaming) {
          msgs[msgs.length - 1] = {
            ...last,
            content: last.content || "(已取消)",
            isStreaming: false,
          };
        }
        return { messages: msgs, isStreaming: false, activeRunId: null };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "取消失败" });
    }
  },

  clearError: () => set({ error: null, errorMeta: null }),

  goHome: () =>
    set({ view: "home", activeSessionId: null, messages: [], error: null, errorMeta: null }),

  openGit: (projectId) => {
    const id = projectId ?? get().activeProjectId ?? get().projects[0]?.id;
    if (!id) {
      set({ error: "请先添加一个项目目录" });
      return;
    }
    set({ activeProjectId: id, view: "git", activeSessionId: null, messages: [] });
  },

  openAutomations: () => set({ view: "automations", activeSessionId: null, messages: [] }),
  openCustomize: () => set({ view: "customize", activeSessionId: null, messages: [] }),
  openSettings: () => set({ view: "settings", activeSessionId: null, messages: [] }),

  openPlanNewIdea: () => set({ planTemplate: PLAN_NEW_IDEA_TEMPLATE, view: "home" }),
  consumePlanTemplate: () => set({ planTemplate: null }),

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
            .map((s) => ({ id: s.id, title: s.title, runtime: s.runtime })),
        })),
      },
    ];
  },
}));
