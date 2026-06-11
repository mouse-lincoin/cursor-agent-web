import simpleGit from "simple-git";
import { getProject } from "@/lib/store/data-store";

export async function getProjectRepoUrl(projectId: string): Promise<string | null> {
  const project = getProject(projectId);
  if (!project) return null;
  try {
    const git = simpleGit(project.path);
    if (!(await git.checkIsRepo())) return null;
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin");
    return origin?.refs.fetch ?? origin?.refs.push ?? null;
  } catch {
    return null;
  }
}
