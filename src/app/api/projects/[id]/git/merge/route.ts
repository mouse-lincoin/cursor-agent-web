import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitMerge } from "@/lib/git/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const { branch } = await req.json();
    if (!branch) return apiError("请提供 branch");
    const result = await gitMerge(id, branch);
    return Response.json({ ok: true, result });
  } catch (e) {
    return handleGitError(e);
  }
}
