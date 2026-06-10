import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitCommit } from "@/lib/git/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const { message } = await req.json();
    if (!message?.trim()) return apiError("请提供 commit message");
    const hash = await gitCommit(id, message);
    return Response.json({ ok: true, hash });
  } catch (e) {
    return handleGitError(e);
  }
}
