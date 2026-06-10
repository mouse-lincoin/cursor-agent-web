import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitFetch } from "@/lib/git/service";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    await gitFetch(id);
    return Response.json({ ok: true });
  } catch (e) {
    return handleGitError(e);
  }
}
