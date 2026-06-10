import { NextRequest } from "next/server";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitDiff } from "@/lib/git/service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const staged = req.nextUrl.searchParams.get("staged") === "true";
    const file = req.nextUrl.searchParams.get("file") ?? undefined;
    const diff = await gitDiff(id, staged, file);
    return Response.json({ diff });
  } catch (e) {
    return handleGitError(e);
  }
}
