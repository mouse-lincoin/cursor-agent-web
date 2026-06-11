import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getProjectRepoUrl } from "@/lib/projects/repo";
import { cacheAgent, createAgent, getAgentId } from "@/lib/sdk/agent-manager";
import { addSession, getProject, getSettings, listSessions } from "@/lib/store/data-store";
import type { AgentRuntime } from "@/types";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  return Response.json({ sessions: listSessions(projectId) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      model = "composer-2.5",
      title = "New Agent",
      runtime: bodyRuntime,
    } = body ?? {};

    if (!projectId) return apiError("请提供 projectId");

    const project = getProject(projectId);
    if (!project) return apiError("项目不存在", 404);

    const settings = getSettings();
    const runtime: AgentRuntime = bodyRuntime ?? settings.defaultRuntime;

    let repoUrl: string | undefined;
    if (runtime === "cloud") {
      repoUrl = (await getProjectRepoUrl(projectId)) ?? undefined;
      if (!repoUrl) {
        return apiError("Cloud Agent 需要项目配置 Git origin remote", 400);
      }
    }

    const agent = await createAgent({
      cwd: project.path,
      model,
      runtime,
      repoUrl,
      sandbox: settings.sandboxMode,
      name: title,
    });

    const agentId = getAgentId(agent);
    const now = new Date().toISOString();
    const sessionId = crypto.randomUUID();

    const session = addSession({
      id: sessionId,
      projectId,
      agentId,
      title,
      model,
      runtime,
      repoUrl,
      createdAt: now,
      updatedAt: now,
    });

    cacheAgent(sessionId, agent);

    return Response.json({ session }, { status: 201 });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "创建 Agent 失败", 500);
  }
}
