import type { Run } from "@cursor/sdk";

interface ActiveRun {
  run: Run;
  sessionId: string;
}

const activeRuns = new Map<string, ActiveRun>();

export function registerRun(runId: string, run: Run, sessionId: string): void {
  activeRuns.set(runId, { run, sessionId });
}

export function unregisterRun(runId: string): void {
  activeRuns.delete(runId);
}

export function getActiveRun(runId: string): ActiveRun | undefined {
  return activeRuns.get(runId);
}

export async function cancelRun(runId: string): Promise<boolean> {
  const entry = activeRuns.get(runId);
  if (!entry) return false;
  if (entry.run.supports("cancel")) {
    await entry.run.cancel();
    return true;
  }
  return false;
}
