import { Agent } from "@cursor/sdk";
import { getProjectRepoUrl } from "@/lib/projects/repo";
import { getApiKey } from "@/lib/sdk/config";
import { getProject, updateAutomation } from "@/lib/store/data-store";
import type { Automation } from "@/types";

export async function runAutomation(automation: Automation): Promise<void> {
  const project = getProject(automation.projectId);
  if (!project) throw new Error("项目不存在");

  let repoUrl: string | undefined;
  if (automation.runtime === "cloud") {
    repoUrl = (await getProjectRepoUrl(automation.projectId)) ?? undefined;
    if (!repoUrl) throw new Error("Cloud 自动化需要 Git origin remote");
  }

  try {
    const result = await Agent.prompt(automation.prompt, {
      apiKey: getApiKey(),
      model: { id: automation.model },
      ...(automation.runtime === "cloud" && repoUrl
        ? { cloud: { repos: [{ url: repoUrl }], skipReviewerRequest: true } }
        : { local: { cwd: project.path } }),
    });

    updateAutomation(automation.id, {
      lastRunAt: new Date().toISOString(),
      lastStatus: result.status === "finished" ? "finished" : "error",
    });
  } catch {
    updateAutomation(automation.id, {
      lastRunAt: new Date().toISOString(),
      lastStatus: "error",
    });
    throw new Error("自动化执行失败");
  }
}
