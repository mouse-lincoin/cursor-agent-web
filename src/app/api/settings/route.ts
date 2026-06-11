import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getSettings, updateSettings } from "@/lib/store/data-store";

export async function GET() {
  return Response.json({ settings: getSettings() });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = updateSettings(body);
    const { reloadScheduler } = await import("@/lib/automations/scheduler");
    reloadScheduler();
    return Response.json({ settings });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "更新设置失败", 500);
  }
}
