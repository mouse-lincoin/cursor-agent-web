import { NextRequest } from "next/server";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitStash } from "@/lib/git/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const body = await req.json().catch(() => ({}));
    await gitStash(id, body.message);
    return Response.json({ ok: true });
  } catch (e) {
    return handleGitError(e);
  }
}
