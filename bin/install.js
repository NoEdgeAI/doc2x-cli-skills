#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillSrc = resolve(__dirname, "..", "skills", "doc2x-cli");

const args = process.argv.slice(2);

// --project: install to .claude/skills in current working directory
// default:   install to ~/.claude/skills (personal scope)
const isProject = args.includes("--project");
const targetBase = isProject
  ? resolve(process.cwd(), ".claude", "skills")
  : resolve(homedir(), ".claude", "skills");

const targetDir = join(targetBase, "doc2x-cli");

if (!existsSync(skillSrc)) {
  console.error("Error: skill source not found at", skillSrc);
  process.exit(1);
}

mkdirSync(targetBase, { recursive: true });
cpSync(skillSrc, targetDir, { recursive: true });

const scope = isProject ? "project" : "personal";
console.log(`doc2x-cli skill installed (${scope}): ${targetDir}`);
console.log('Verify: ask Claude Code to use the doc2x-cli skill. This installer does not create a slash command.');
