import { Agent, type SDKAgent } from "@cursor/sdk";
import { getApiKey } from "./config";
import type { AgentRuntime } from "@/types";

const agentCache = new Map<string, SDKAgent>();

export interface CreateAgentOptions {
  cwd: string;
  model: string;
  runtime?: AgentRuntime;
  repoUrl?: string;
  sandbox?: boolean;
  name?: string;
}

export async function createAgent(opts: CreateAgentOptions): Promise<SDKAgent> {
  const { cwd, model, runtime = "local", repoUrl, sandbox, name } = opts;

  if (runtime === "cloud") {
    if (!repoUrl) throw new Error("Cloud Agent 需要 Git 仓库 URL（origin remote）");
    const agent = await Agent.create({
      apiKey: getApiKey(),
      model: { id: model },
      name,
      cloud: {
        repos: [{ url: repoUrl }],
        skipReviewerRequest: true,
      },
    });
    return agent;
  }

  const agent = await Agent.create({
    apiKey: getApiKey(),
    model: { id: model },
    name,
    local: {
      cwd,
      ...(sandbox ? { sandboxOptions: { enabled: true } } : {}),
    },
  });
  return agent;
}

export async function getOrResumeAgent(sessionId: string, agentId: string): Promise<SDKAgent> {
  const cached = agentCache.get(sessionId);
  if (cached) return cached;

  const agent = await Agent.resume(agentId, {
    apiKey: getApiKey(),
  });
  agentCache.set(sessionId, agent);
  return agent;
}

export function cacheAgent(sessionId: string, agent: SDKAgent): void {
  agentCache.set(sessionId, agent);
}

export function getAgentId(agent: SDKAgent): string {
  return agent.agentId;
}
