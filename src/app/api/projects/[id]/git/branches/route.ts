import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitBranches } from "@/lib/git/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    return Response.json(await gitBranches(id));
  } catch (e) {
    return handleGitError(e);
  }
}
