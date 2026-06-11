import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { addAutomation, listAutomations } from "@/lib/store/data-store";
import type { AgentRuntime } from "@/types";

export async function GET() {
  return Response.json({ automations: listAutomations() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, projectId, prompt, cron, model = "composer-2.5", runtime = "local", enabled = true } = body;

    if (!name || !projectId || !prompt || !cron) {
      return apiError("请提供 name, projectId, prompt, cron");
    }

    const automation = addAutomation({
      id: crypto.randomUUID(),
      name,
      projectId,
      prompt,
      cron,
      model,
      runtime: runtime as AgentRuntime,
      enabled,
      createdAt: new Date().toISOString(),
    });

    const { reloadScheduler } = await import("@/lib/automations/scheduler");
    reloadScheduler();

    return Response.json({ automation }, { status: 201 });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "创建自动化失败", 500);
  }
}
