import fs from "fs";
import os from "os";
import path from "path";
import type { RuleInfo } from "@/types";

function scanRulesDir(dir: string, source: RuleInfo["source"]): RuleInfo[] {
  if (!fs.existsSync(dir)) return [];
  const rules: RuleInfo[] = [];

  function walk(current: string, rel = "") {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const full = path.join(current, e.name);
      const relPath = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        walk(full, relPath);
      } else if (e.name.endsWith(".md") || e.name.endsWith(".mdc")) {
        const content = fs.readFileSync(full, "utf-8").slice(0, 300);
        rules.push({
          id: `${source}:${relPath}`,
          name: e.name.replace(/\.(md|mdc)$/, ""),
          path: full,
          source,
          preview: content.replace(/^---[\s\S]*?---\n/, "").trim().slice(0, 200),
        });
      }
    }
  }

  walk(dir);
  return rules;
}

export function listRules(projectPath?: string): RuleInfo[] {
  const userDir = path.join(os.homedir(), ".cursor", "rules");
  const user = scanRulesDir(userDir, "user");

  let project: RuleInfo[] = [];
  if (projectPath) {
    project = scanRulesDir(path.join(projectPath, ".cursor", "rules"), "project");
  }

  return [...project, ...user];
}
