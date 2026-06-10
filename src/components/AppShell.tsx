"use client";

import { useEffect, useState } from "react";
import { MOCK_USER } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store/app-store";
import { AddProjectDialog } from "./AddProjectDialog";
import { ChatView } from "./ChatView";
import { GitPanel } from "./GitPanel";
import { HomeView } from "./HomeView";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const {
    init,
    projects,
    models,
    messages,
    activeProjectId,
    activeSessionId,
    selectedModel,
    isLoading,
    isStreaming,
    error,
    view,
    setActiveProject,
    setActiveSession,
    setSelectedModel,
    addProject,
    newAgent,
    sendMessage,
    goHome,
    openGit,
    getProjectGroups,
  } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const topBarTitle =
    (view === "chat" || view === "git") && activeProject ? activeProject.name : "Home";

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar
        groups={getProjectGroups()}
        user={MOCK_USER}
        activeProjectId={activeProjectId}
        activeSessionId={activeSessionId}
        onNewAgent={newAgent}
        onSelectSession={(id) => setActiveSession(id)}
        onSelectProject={(id) => setActiveProject(id)}
        onAddProject={() => setAddProjectOpen(true)}
        onOpenGit={openGit}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          projectName={topBarTitle}
          onHomeClick={goHome}
          onGitClick={() => openGit()}
          showGit={projects.length > 0}
        />

        {error && (
          <div className="border-b border-red-900/50 bg-red-950/30 px-4 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}

        {isLoading && !isStreaming ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-text-muted">
            加载中...
          </div>
        ) : view === "git" && activeProjectId && activeProject ? (
          <GitPanel projectId={activeProjectId} projectName={activeProject.name} />
        ) : view === "chat" ? (
          <ChatView
            messages={messages}
            models={models}
            selectedModel={selectedModel}
            isStreaming={isStreaming}
            onModelChange={setSelectedModel}
            onSubmit={sendMessage}
          />
        ) : (
          <HomeView
            models={models}
            selectedModel={selectedModel}
            isStreaming={isStreaming}
            hasProjects={projects.length > 0}
            onModelChange={setSelectedModel}
            onSubmit={sendMessage}
            onPlanNewIdea={() =>
              sendMessage("Help me plan a new idea. Ask clarifying questions first.")
            }
            onAddProject={() => setAddProjectOpen(true)}
          />
        )}
      </main>

      <AddProjectDialog
        open={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        onAdd={addProject}
      />
    </div>
  );
}
