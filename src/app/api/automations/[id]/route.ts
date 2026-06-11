import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { runAutomation } from "@/lib/automations/runner";
import { getAutomation, removeAutomation, updateAutomation } from "@/lib/store/data-store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getAutomation(id)) return apiError("自动化不存在", 404);
  const body = await req.json();
  const automation = updateAutomation(id, body);
  const { reloadScheduler } = await import("@/lib/automations/scheduler");
  reloadScheduler();
  return Response.json({ automation });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!removeAutomation(id)) return apiError("自动化不存在", 404);
  const { reloadScheduler } = await import("@/lib/automations/scheduler");
  reloadScheduler();
  return Response.json({ ok: true });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const automation = getAutomation(id);
  if (!automation) return apiError("自动化不存在", 404);
  try {
    await runAutomation(automation);
    return Response.json({ ok: true });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "执行失败", 500);
  }
}
