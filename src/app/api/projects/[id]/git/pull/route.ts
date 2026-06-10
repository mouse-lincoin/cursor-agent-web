import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitPull } from "@/lib/git/service";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const result = await gitPull(id);
    return Response.json({ ok: true, result });
  } catch (e) {
    return handleGitError(e);
  }
}
