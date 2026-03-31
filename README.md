# Doc2X CLI Skill

Agent skill for installing, configuring, and using **@noedgeai/doc2x-cli** — a CLI tool for document parsing, translation, and batch processing. Works with Claude Code, Codex CLI, and any agent supporting the [Agent Skills](https://agentskills.io) standard.

## Available Skills

| Skill | Description |
|-------|-------------|
| `doc2x-cli` | Parse PDFs/images to Markdown, LaTeX, Word, HTML, or PDF. Translate documents to 10 languages. Batch-process directories in parallel. Manage translation glossaries. |

## Installation

### Claude Code

```bash
# Personal scope — all your projects
cp -r skills/doc2x-cli ~/.claude/skills/doc2x-cli

# Project scope — shared with collaborators
cp -r skills/doc2x-cli .claude/skills/doc2x-cli
```

Or load as a plugin (includes plugin manifest):

```bash
claude --plugin-dir ./doc2x-cli-skill
```

### Codex CLI / Other Agent Skills Agents

```bash
# User scope — all your projects
cp -r skills/doc2x-cli ~/.agents/skills/doc2x-cli

# Repo scope — this project only
cp -r skills/doc2x-cli .agents/skills/doc2x-cli
```

### Verify

- **Claude Code**: type `/doc2x-cli` — it should appear in autocomplete.
- **Codex CLI**: skill is auto-discovered after copy.

## Usage

**Claude Code:**

```
/doc2x-cli
/doc2x-cli how to parse a PDF to Markdown
/doc2x-cli batch processing setup
```

**Codex CLI:**

```
$doc2x-cli help me convert PDFs
```

**Any agent** — describe your task naturally:

```
I need to convert a batch of PDF files to Markdown using doc2x
```

## Skill Structure

```
doc2x-cli/
├── SKILL.md                   # Entry point
├── agents/
│   └── agent.yaml             # Codex agent interface
└── references/
    ├── command-reference.md    # All commands, options, formats
    ├── config-and-auth.md     # Auth, config schema, exit codes
    └── troubleshooting.md     # Error messages, debugging tips
```

## Uninstall

```bash
# Claude Code
rm -rf ~/.claude/skills/doc2x-cli    # personal
rm -rf .claude/skills/doc2x-cli      # project

# Codex / Agents standard
rm -rf ~/.agents/skills/doc2x-cli    # user
rm -rf .agents/skills/doc2x-cli      # repo
```

## Requirements

The skill itself has no dependencies. The CLI tool it covers requires:

- Node.js >= 22
- npm (configure registry first: `npm config set @noedgeai:registry=https://npm.pkg.github.com`, then `npm i -g @noedgeai/doc2x-cli`)
- A Doc2X account ([doc2x.noedgeai.com](https://doc2x.noedgeai.com/))

## Links

- [Doc2X Official Website](https://doc2x.noedgeai.com/)
- [Agent Skills Standard](https://agentskills.io)
