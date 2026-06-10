import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { listProjectFiles } from "@/lib/projects/files";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const query = req.nextUrl.searchParams.get("q") ?? "";
    return Response.json({ files: listProjectFiles(id, query) });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "列出文件失败", 500);
  }
}
