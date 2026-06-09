import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getProject, removeProject, updateProject } from "@/lib/store/data-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return apiError("项目不存在", 404);
  return Response.json({ project });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return apiError("项目不存在", 404);

  const body = await req.json().catch(() => ({}));
  const updated = updateProject(id, {
    lastOpenedAt: body.lastOpenedAt ?? new Date().toISOString(),
  });
  return Response.json({ project: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!removeProject(id)) return apiError("项目不存在", 404);
  return Response.json({ ok: true });
}
