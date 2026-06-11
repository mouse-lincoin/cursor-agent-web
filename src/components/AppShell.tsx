"use client";

import { useEffect, useState } from "react";
import { MOCK_USER } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store/app-store";
import { AddProjectDialog } from "./AddProjectDialog";
import { AutomationsPanel } from "./AutomationsPanel";
import { ChatView } from "./ChatView";
import { CustomizePanel } from "./CustomizePanel";
import { ErrorBanner } from "./ErrorBanner";
import { GitPanel } from "./GitPanel";
import { HomeView } from "./HomeView";
import { SettingsPanel } from "./SettingsPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const store = useAppStore();
  const {
    init,
    projects,
    models,
    settings,
    messages,
    activeProjectId,
    activeSessionId,
    selectedModel,
    selectedRuntime,
    repoUrl,
    isLoading,
    isStreaming,
    error,
    errorMeta,
    planTemplate,
    view,
    sessions,
    setActiveProject,
    setActiveSession,
    setSelectedModel,
    setSelectedRuntime,
    addProject,
    newAgent,
    sendMessage,
    cancelStream,
    clearError,
    goHome,
    openGit,
    openAutomations,
    openCustomize,
    openSettings,
    openPlanNewIdea,
    consumePlanTemplate,
    getProjectGroups,
  } = store;

  useEffect(() => {
    init();
  }, [init]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const topBarTitle =
    (view === "chat" || view === "git") && activeProject ? activeProject.name : "Home";
  const runtimeLabel = activeSession?.runtime ?? selectedRuntime;

  async function handleSend(prompt: string) {
    setLastPrompt(prompt);
    await sendMessage(prompt);
  }

  const chatContent = (
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
  );

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
        onOpenAutomations={openAutomations}
        onOpenCustomize={openCustomize}
        onOpenSettings={openSettings}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          projectName={topBarTitle}
          projectPath={activeProject?.path}
          runtime={runtimeLabel}
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
        ) : view === "automations" ? (
          <AutomationsPanel projects={projects} />
        ) : view === "customize" ? (
          <CustomizePanel projectId={activeProjectId ?? projects[0]?.id} />
        ) : view === "settings" ? (
          <SettingsPanel />
        ) : view === "chat" ? (
          settings.splitView && activeProjectId && activeProject ? (
            <div className="flex flex-1 overflow-hidden">
              <div className="flex min-w-0 flex-1 flex-col border-r border-border-subtle">
                {chatContent}
              </div>
              <div className="w-[40%] min-w-[320px] shrink-0">
                <GitPanel projectId={activeProjectId} projectName={activeProject.name} />
              </div>
            </div>
          ) : (
            chatContent
          )
        ) : (
          <HomeView
            models={models}
            selectedModel={selectedModel}
            selectedRuntime={selectedRuntime}
            repoUrl={repoUrl}
            isStreaming={isStreaming}
            hasProjects={projects.length > 0}
            projectId={activeProjectId ?? projects[0]?.id}
            planTemplate={planTemplate}
            onModelChange={setSelectedModel}
            onRuntimeChange={setSelectedRuntime}
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
