"use client";

import { FolderPlus, X } from "lucide-react";
import { useState } from "react";

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (path: string) => Promise<void>;
}

export function AddProjectDialog({ open, onClose, onAdd }: AddProjectDialogProps) {
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!path.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onAdd(path.trim());
      setPath("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[15px] font-medium text-text-primary">
            <FolderPlus size={16} />
            添加本地项目
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-bg-elevated hover:text-text-secondary"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="mb-1 block text-[12px] text-text-secondary">目录绝对路径</label>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="~/Projects/my-app 或 /Users/you/project"
            className="mb-3 w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            autoFocus
          />
          {error && <p className="mb-3 text-[12px] text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-[13px] text-text-secondary hover:bg-bg-elevated"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !path.trim()}
              className="rounded-lg bg-accent px-3 py-1.5 text-[13px] text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "添加中..." : "添加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
