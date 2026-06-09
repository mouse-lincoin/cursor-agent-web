"use client";

import { PromptInput } from "./PromptInput";
import { MessageStream } from "./MessageStream";
import type { ChatMessage, ModelInfo } from "@/types";

interface ChatViewProps {
  messages: ChatMessage[];
  models: ModelInfo[];
  selectedModel: string;
  isStreaming: boolean;
  onModelChange: (model: string) => void;
  onSubmit: (prompt: string) => void;
}

export function ChatView({
  messages,
  models,
  selectedModel,
  isStreaming,
  onModelChange,
  onSubmit,
}: ChatViewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageStream messages={messages} />
      <div className="shrink-0 border-t border-border-subtle px-6 py-4">
        <PromptInput
          models={models}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onSubmit={onSubmit}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
