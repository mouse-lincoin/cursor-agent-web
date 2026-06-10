"use client";

import { useEffect, useState } from "react";
import { MOCK_USER } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store/app-store";
import { AddProjectDialog } from "./AddProjectDialog";
import { ChatView } from "./ChatView";
import { ErrorBanner } from "./ErrorBanner";
import { GitPanel } from "./GitPanel";
import { HomeView } from "./HomeView";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

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
    errorMeta,
    planTemplate,
    view,
    setActiveProject,
    setActiveSession,
    setSelectedModel,
    addProject,
    newAgent,
    sendMessage,
    cancelStream,
    clearError,
    goHome,
    openGit,
    openPlanNewIdea,
    consumePlanTemplate,
    getProjectGroups,
  } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const topBarTitle =
    (view === "chat" || view === "git") && activeProject ? activeProject.name : "Home";

  async function handleSend(prompt: string) {
    setLastPrompt(prompt);
    await sendMessage(prompt);
  }

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
          projectPath={activeProject?.path}
          onHomeClick={goHome}
          onGitClick={() => openGit()}
          showGit={projects.length > 0}
        />

        {error && (
          <ErrorBanner
            message={error}
            runId={errorMeta?.runId}
            agentId={errorMeta?.agentId}
            errorType={errorMeta?.errorType}
            retryable={errorMeta?.retryable}
            onDismiss={clearError}
            onRetry={
              errorMeta?.retryable && lastPrompt
                ? () => {
                    clearError();
                    handleSend(lastPrompt);
                  }
                : undefined
            }
          />
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
            projectId={activeProjectId}
            onModelChange={setSelectedModel}
            onSubmit={handleSend}
            onCancel={cancelStream}
          />
        ) : (
          <HomeView
            models={models}
            selectedModel={selectedModel}
            isStreaming={isStreaming}
            hasProjects={projects.length > 0}
            projectId={activeProjectId ?? projects[0]?.id}
            planTemplate={planTemplate}
            onModelChange={setSelectedModel}
            onSubmit={handleSend}
            onPlanNewIdea={openPlanNewIdea}
            onAddProject={() => setAddProjectOpen(true)}
            onPlanTemplateConsumed={consumePlanTemplate}
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
