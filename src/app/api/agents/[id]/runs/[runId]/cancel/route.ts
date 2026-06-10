import { apiError } from "@/lib/api/errors";
import { cancelRun, getActiveRun, unregisterRun } from "@/lib/sdk/run-manager";
import { getSession, updateRun } from "@/lib/store/data-store";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; runId: string }> }) {
  const { id: sessionId, runId } = await params;

  const session = getSession(sessionId);
  if (!session) return apiError("会话不存在", 404);

  const entry = getActiveRun(runId);
  if (!entry || entry.sessionId !== sessionId) {
    return apiError("运行不存在或已结束", 404);
  }

  const cancelled = await cancelRun(runId);
  if (!cancelled) return apiError("该运行不支持取消", 400);

  updateRun(runId, { status: "cancelled", finishedAt: new Date().toISOString() });
  unregisterRun(runId);

  return Response.json({ ok: true, runId });
}
