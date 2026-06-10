"use client";

import { Square } from "lucide-react";
import { PromptInput } from "./PromptInput";
import { MessageStream } from "./MessageStream";
import type { ChatMessage, ModelInfo } from "@/types";

interface ChatViewProps {
  messages: ChatMessage[];
  models: ModelInfo[];
  selectedModel: string;
  isStreaming: boolean;
  projectId?: string | null;
  onModelChange: (model: string) => void;
  onSubmit: (prompt: string) => void;
  onCancel?: () => void;
}

export function ChatView({
  messages,
  models,
  selectedModel,
  isStreaming,
  projectId,
  onModelChange,
  onSubmit,
  onCancel,
}: ChatViewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageStream messages={messages} />
      <div className="shrink-0 border-t border-border-subtle px-6 py-4">
        {isStreaming && onCancel && (
          <div className="mb-2 flex justify-center">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-3 py-1 text-[12px] text-text-secondary hover:bg-bg-elevated"
            >
              <Square size={12} className="fill-current" />
              停止生成
            </button>
          </div>
        )}
        <PromptInput
          models={models}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onSubmit={onSubmit}
          disabled={isStreaming}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
