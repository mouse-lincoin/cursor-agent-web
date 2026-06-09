import fs from "fs";
import path from "path";

export function resolveProjectPath(input: string): string {
  const expanded = input.startsWith("~")
    ? path.join(process.env.HOME ?? "", input.slice(1))
    : input;
  return path.resolve(expanded);
}

export function validateProjectPath(input: string): { ok: true; path: string } | { ok: false; error: string } {
  let resolved: string;
  try {
    resolved = resolveProjectPath(input);
  } catch {
    return { ok: false, error: "无效路径" };
  }

  if (!fs.existsSync(resolved)) {
    return { ok: false, error: "路径不存在" };
  }

  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    return { ok: false, error: "路径必须是目录" };
  }

  return { ok: true, path: resolved };
}

export function getDirName(dirPath: string): string {
  return path.basename(dirPath);
}
