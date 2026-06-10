import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitCheckout } from "@/lib/git/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const { branch } = await req.json();
    if (!branch) return apiError("请提供 branch");
    await gitCheckout(id, branch);
    return Response.json({ ok: true });
  } catch (e) {
    return handleGitError(e);
  }
}
