import fs from "fs";
import path from "path";
import { getProject } from "@/lib/store/data-store";
import type { FileEntry } from "@/types";

const IGNORED = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".npm-cache",
  "coverage",
]);

const MAX_RESULTS = 200;

function isInsideRoot(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
}

export function listProjectFiles(projectId: string, query = ""): FileEntry[] {
  const project = getProject(projectId);
  if (!project) throw new Error("项目不存在");

  const root = project.path;
  const results: FileEntry[] = [];
  const q = query.toLowerCase();

  function walk(dir: string, depth: number) {
    if (results.length >= MAX_RESULTS || depth > 4) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORED.has(entry.name) || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (!isInsideRoot(root, full)) continue;

      const rel = path.relative(root, full);
      const name = entry.name;

      if (!q || rel.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
        results.push({ path: rel, name, isDirectory: entry.isDirectory() });
      }

      if (entry.isDirectory()) walk(full, depth + 1);
      if (results.length >= MAX_RESULTS) return;
    }
  }

  walk(root, 0);
  return results.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.path.localeCompare(b.path);
  });
}
