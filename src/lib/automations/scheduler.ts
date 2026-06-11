import cron, { type ScheduledTask } from "node-cron";
import { listAutomations } from "@/lib/store/data-store";
import { runAutomation } from "./runner";

const tasks = new Map<string, ScheduledTask>();
let started = false;

export function startScheduler(): void {
  if (started) return;
  started = true;
  reloadScheduler();
}

export function reloadScheduler(): void {
  for (const task of tasks.values()) task.stop();
  tasks.clear();

  for (const automation of listAutomations()) {
    if (!automation.enabled) continue;
    if (!cron.validate(automation.cron)) continue;

    const task = cron.schedule(automation.cron, () => {
      runAutomation(automation).catch((err) => {
        console.error(`[automation] ${automation.name} failed:`, err);
      });
    });
    tasks.set(automation.id, task);
  }
}

export function isSchedulerStarted(): boolean {
  return started;
}
