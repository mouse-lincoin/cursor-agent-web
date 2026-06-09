import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { cacheAgent, createAgent, getAgentId } from "@/lib/sdk/agent-manager";
import { addSession, getProject, listSessions } from "@/lib/store/data-store";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  return Response.json({ sessions: listSessions(projectId) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, model = "composer-2.5", title = "New Agent" } = body ?? {};

    if (!projectId) return apiError("请提供 projectId");

    const project = getProject(projectId);
    if (!project) return apiError("项目不存在", 404);

    const agent = await createAgent(project.path, model);
    const agentId = getAgentId(agent);
    const now = new Date().toISOString();
    const sessionId = crypto.randomUUID();

    const session = addSession({
      id: sessionId,
      projectId,
      agentId,
      title,
      model,
      createdAt: now,
      updatedAt: now,
    });

    cacheAgent(sessionId, agent);

    return Response.json({ session }, { status: 201 });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "创建 Agent 失败", 500);
  }
}
