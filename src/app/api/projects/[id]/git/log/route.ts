import { NextRequest } from "next/server";
import { handleGitError, requireGitRepo } from "@/lib/git/route-helper";
import { gitLog } from "@/lib/git/service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const err = await requireGitRepo(id);
  if (err) return err;
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10);
    return Response.json({ log: await gitLog(id, limit) });
  } catch (e) {
    return handleGitError(e);
  }
}
