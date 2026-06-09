import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getDirName, validateProjectPath } from "@/lib/projects/path";
import { addProject, listProjects } from "@/lib/store/data-store";

export async function GET() {
  return Response.json({ projects: listProjects() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pathInput = body?.path;
    if (!pathInput || typeof pathInput !== "string") {
      return apiError("请提供 path 字段");
    }

    const validation = validateProjectPath(pathInput);
    if (!validation.ok) return apiError(validation.error);

    const now = new Date().toISOString();
    const project = addProject({
      id: crypto.randomUUID(),
      name: getDirName(validation.path),
      path: validation.path,
      addedAt: now,
      lastOpenedAt: now,
    });

    return Response.json({ project }, { status: 201 });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "创建项目失败", 500);
  }
}
