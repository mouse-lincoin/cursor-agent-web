"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  runId?: string;
  agentId?: string;
  errorType?: string;
  retryable?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({
  message,
  runId,
  agentId,
  errorType,
  retryable,
  onDismiss,
  onRetry,
}: ErrorBannerProps) {
  const label = errorType === "startup" ? "启动失败" : errorType === "run" ? "运行失败" : "错误";

  return (
    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-red-900/50 bg-red-950/30 px-4 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-red-300">
          <AlertCircle size={14} />
          {label}: {message}
        </div>
        {(runId || agentId) && (
          <div className="mt-0.5 font-mono text-[10px] text-red-400/70">
            {runId && <span>run: {runId} </span>}
            {agentId && <span>agent: {agentId}</span>}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="rounded px-2 py-0.5 text-[11px] text-red-200 hover:bg-red-900/40"
          >
            重试
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="rounded p-0.5 text-red-400 hover:bg-red-900/40">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
