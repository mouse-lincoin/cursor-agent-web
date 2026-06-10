import { CursorAgentError } from "@cursor/sdk";
import { apiError } from "@/lib/api/errors";
import { getOrResumeAgent } from "@/lib/sdk/agent-manager";
import { SSE_HEADERS } from "@/lib/sdk/config";
import { registerRun, unregisterRun } from "@/lib/sdk/run-manager";
import { encodeSSE } from "@/lib/sdk/sse";
import { addRun, appendToTranscript, getSession, updateRun, updateSession } from "@/lib/store/data-store";
import type { ChatMessage } from "@/types";

function extractAssistantText(event: { type: string; message?: { content?: { type: string; text?: string }[] } }): string {
  if (event.type !== "assistant" || !event.message?.content) return "";
  return event.message.content
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text!)
    .join("");
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  try {
    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return apiError("请提供 prompt");
    }

    const session = getSession(sessionId);
    if (!session) return apiError("会话不存在", 404);

    const agent = await getOrResumeAgent(sessionId, session.agentId);
    const run = await agent.send(prompt);
    const runId = run.id;
    const startedAt = new Date().toISOString();

    registerRun(runId, run, sessionId);

    addRun({
      id: runId,
      agentSessionId: sessionId,
      prompt,
      status: "running",
      startedAt,
    });

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: startedAt,
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: startedAt,
      isStreaming: true,
      runId,
    };
    appendToTranscript(sessionId, [userMsg]);

    if (session.title === "New Agent") {
      updateSession(sessionId, { title: prompt.slice(0, 60) + (prompt.length > 60 ? "..." : "") });
    } else {
      updateSession(sessionId, {});
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let assistantText = "";

        try {
          controller.enqueue(
            encoder.encode(encodeSSE("started", { runId, agentId: session.agentId }))
          );

          for await (const event of run.stream()) {
            const text = extractAssistantText(event as Parameters<typeof extractAssistantText>[0]);
            if (text) assistantText += text;
            controller.enqueue(encoder.encode(encodeSSE("message", { event, text })));
          }

          const result = await run.wait();
          const status = result.status === "finished" ? "finished" : result.status === "cancelled" ? "cancelled" : "error";
          updateRun(runId, { status, finishedAt: new Date().toISOString() });

          const finalAssistant: ChatMessage = {
            ...assistantMsg,
            content: assistantText || (status === "error" ? "运行失败，请检查 Agent 日志" : ""),
            isStreaming: false,
            errorType: status === "error" ? "run" : undefined,
          };
          appendToTranscript(sessionId, [finalAssistant]);

          controller.enqueue(
            encoder.encode(
              encodeSSE("done", {
                status: result.status,
                runId,
                agentId: session.agentId,
                assistantText,
                errorType: status === "error" ? "run" : undefined,
              })
            )
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "运行失败";
          const retryable = err instanceof CursorAgentError ? err.isRetryable : false;
          const errorType = err instanceof CursorAgentError ? "startup" : "run";
          updateRun(runId, { status: "error", finishedAt: new Date().toISOString() });

          appendToTranscript(sessionId, [
            {
              ...assistantMsg,
              content: `错误: ${message}`,
              isStreaming: false,
              errorType,
            },
          ]);

          controller.enqueue(
            encoder.encode(encodeSSE("error", { message, retryable, runId, agentId: session.agentId, errorType }))
          );
        } finally {
          unregisterRun(runId);
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return apiError(`Agent 启动失败: ${err.message}`, 502);
    }
    return apiError(err instanceof Error ? err.message : "发送失败", 500);
  }
}
