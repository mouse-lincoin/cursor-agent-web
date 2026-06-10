import { NextRequest } from "next/server";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitUnstage } from "@/lib/git/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const body = await req.json().catch(() => ({}));
    await gitUnstage(id, body.files);
    return Response.json({ ok: true });
  } catch (e) {
    return handleGitError(e);
  }
}
