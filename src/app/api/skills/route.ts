import { NextRequest } from "next/server";
import { listAvailableSkills } from "@/lib/skills/scanner";
import { getProject } from "@/lib/store/data-store";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const projectPath = projectId ? getProject(projectId)?.path : undefined;
  return Response.json({ skills: listAvailableSkills(projectPath) });
}
