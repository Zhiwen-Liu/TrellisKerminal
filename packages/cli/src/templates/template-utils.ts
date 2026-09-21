/**
 * Shared utilities for platform template modules.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface AgentTemplate {
  name: string;
  content: string;
}

export interface TemplateReader {
  readTemplate: (relativePath: string) => string;
  listFiles: (dir: string) => string[];
  listMdAgents: (dir?: string) => AgentTemplate[];
}

/**
 * Create a template reader bound to the caller's directory.
 * Usage: `const { readTemplate, listMdAgents } = createTemplateReader(import.meta.url);`
 */
export function createTemplateReader(importMetaUrl: string): TemplateReader {
  const __dirname = dirname(fileURLToPath(importMetaUrl));

  function readTemplate(relativePath: string): string {
    return readFileSync(join(__dirname, relativePath), "utf-8");
  }

  function listFiles(dir: string): string[] {
    try {
      // Only regular files — skip dirs like __pycache__ that break readTemplate.
      return readdirSync(join(__dirname, dir), { withFileTypes: true })
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .sort();
    } catch {
      return [];
    }
  }

  /** Read all .md agent files from a subdirectory */
  function listMdAgents(dir = "agents"): AgentTemplate[] {
    return listFiles(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({
        name: f.replace(".md", ""),
        content: readTemplate(`${dir}/${f}`),
      }));
  }

  return {
    readTemplate,
    listFiles,
    listMdAgents,
  };
}
