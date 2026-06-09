import { apiError } from "@/lib/api/errors";
import { getSession } from "@/lib/store/data-store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) return apiError("会话不存在", 404);
  return Response.json({ session });
}
