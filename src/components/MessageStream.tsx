"use client";

import { Loader2 } from "lucide-react";
import type { ChatMessage } from "@/types";

interface MessageStreamProps {
  messages: ChatMessage[];
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
          isUser
            ? "bg-accent text-white"
            : "border border-border bg-bg-surface text-text-primary"
        }`}
      >
        <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
        {message.isStreaming && (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Loader2 size={12} className="animate-spin" />
            生成中...
          </span>
        )}
      </div>
    </div>
  );
}

export function MessageStream({ messages }: MessageStreamProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-text-muted">
        发送消息开始对话
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
}
