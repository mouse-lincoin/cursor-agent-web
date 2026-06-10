import { apiError } from "@/lib/api/errors";
import { isGitRepo } from "./service";

export async function requireGitRepo(projectId: string) {
  const isRepo = await isGitRepo(projectId);
  if (!isRepo) return apiError("该目录不是 Git 仓库", 400);
  return null;
}

export function handleGitError(err: unknown) {
  const message = err instanceof Error ? err.message : "Git 操作失败";
  return apiError(message, 500);
}
