import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitRemotes } from "@/lib/git/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    return Response.json({ remotes: await gitRemotes(id) });
  } catch (e) {
    return handleGitError(e);
  }
}
