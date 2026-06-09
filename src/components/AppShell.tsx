"use client";

import { useState } from "react";
import { MOCK_MODELS, MOCK_PROJECT_GROUPS, MOCK_USER } from "@/lib/mock-data";
import { HomeView } from "./HomeView";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [activeSessionId] = useState<string | undefined>("s1");

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar
        groups={MOCK_PROJECT_GROUPS}
        user={MOCK_USER}
        activeSessionId={activeSessionId}
        onNewAgent={() => {}}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar projectName="Home" />
        <HomeView
          models={MOCK_MODELS}
          onSubmit={(prompt) => console.log("submit:", prompt)}
          onPlanNewIdea={() => console.log("plan new idea")}
        />
      </main>
    </div>
  );
}
