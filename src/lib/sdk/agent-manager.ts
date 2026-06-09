import { Agent, type SDKAgent } from "@cursor/sdk";
import { getApiKey } from "./config";

// In-memory cache: sessionId -> live SDK agent instance
const agentCache = new Map<string, SDKAgent>();

export async function createAgent(cwd: string, model: string): Promise<SDKAgent> {
  const agent = await Agent.create({
    apiKey: getApiKey(),
    model: { id: model },
    local: { cwd },
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
