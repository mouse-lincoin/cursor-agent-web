import { apiError } from "@/lib/api/errors";
import { getProjectRepoUrl } from "@/lib/projects/repo";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = await getProjectRepoUrl(id);
  if (!url) return apiError("未找到 Git origin remote", 404);
  return Response.json({ url });
}
