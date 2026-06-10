import fs from "fs";
import os from "os";
import path from "path";
import type { SkillInfo } from "@/types";

const IGNORED = new Set(["node_modules", ".git", ".next", "dist", "build"]);

function parseFrontmatter(content: string): { name?: string; description?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const block = match[1];
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  let description = block.match(/^description:\s*>-?\s*\n([\s\S]*?)(?=\n\w|\n---|$)/m)?.[1];
  if (!description) {
    description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  }
  return { name, description: description?.replace(/\n\s+/g, " ").trim() };
}

function scanDir(dir: string, source: SkillInfo["source"]): SkillInfo[] {
  if (!fs.existsSync(dir)) return [];
  const skills: SkillInfo[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || IGNORED.has(entry.name)) continue;
    const skillFile = path.join(dir, entry.name, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;
    const content = fs.readFileSync(skillFile, "utf-8");
    const meta = parseFrontmatter(content);
    skills.push({
      id: entry.name,
      name: meta.name ?? entry.name,
      description: (meta.description ?? "").slice(0, 120),
      source,
    });
  }
  return skills;
}

export function listAvailableSkills(projectPath?: string): SkillInfo[] {
  const userSkillsDir = path.join(os.homedir(), ".cursor", "skills-cursor");
  const user = scanDir(userSkillsDir, "user");

  let project: SkillInfo[] = [];
  if (projectPath) {
    const projectSkillsDir = path.join(projectPath, ".cursor", "skills");
    project = scanDir(projectSkillsDir, "project");
  }

  return [...project, ...user];
}
