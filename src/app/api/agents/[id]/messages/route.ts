import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getSession, getTranscript, saveTranscript } from "@/lib/store/data-store";
import type { ChatMessage } from "@/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getSession(id)) return apiError("会话不存在", 404);
  return Response.json({ messages: getTranscript(id) });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getSession(id)) return apiError("会话不存在", 404);
  const { messages } = await req.json();
  if (!Array.isArray(messages)) return apiError("messages 必须是数组");
  saveTranscript(id, messages as ChatMessage[]);
  return Response.json({ ok: true });
}
