---
name: doc2x-cli
description: "Installs and operates @noedgeai-org/doc2x-cli for document parsing, translation, and batch processing. Trigger when user mentions doc2x, doc2x-cli, PDF to Markdown, PDF OCR, document translation, batch PDF conversion, or bilingual PDF. Covers install, update, parse, translate, batch, login, logout, models, and term commands. Do NOT trigger for general PDF viewing, browser-based PDF tools, or non-doc2x workflows."
license: MIT
metadata:
  author: noedgeai
  version: "0.1.5"
---

# Doc2X CLI

CLI tool for parsing PDFs/images to Markdown, LaTeX, Word, HTML, or PDF — and translating documents to 11 languages with bilingual output.

**IMPORTANT — Serial execution only:** Doc2X enforces a server-side concurrent task limit. You MUST run all doc2x commands sequentially — never launch multiple `doc2x` processes in parallel (no concurrent Agent tool calls, no background tasks, no `&`). Batch commands always run sequentially (concurrency is hardcoded to 1). Violating this causes "task limit exceeded" errors.

**IMPORTANT — Stable versions only:** NEVER install or use beta, alpha, rc, or any pre-release versions of `@noedgeai-org/doc2x-cli`. Always use the `@latest` tag explicitly when installing or updating. If `npm outdated` or `npm view` shows a pre-release version (e.g., `1.2.0-beta.1`), ignore it and stick with the latest stable release.

$ARGUMENTS

## Quick Reference

| Task | Command |
|------|---------|
| Parse PDF → Markdown | `doc2x parse ./paper.pdf` |
| Parse PDF → Word | `doc2x parse ./paper.pdf --to docx --docx-template academic` |
| Parse image → Markdown | `doc2x parse ./scan.png --to md` |
| Translate → Chinese | `doc2x translate ./paper.pdf` |
| Translate → English HTML | `doc2x translate ./paper.pdf --target-language en --to html` |
| Bilingual PDF | `doc2x translate ./paper.pdf --translate-type pdf --target-language en --pdf-font-strategy page-optimal` |
| Batch parse | `doc2x batch parse ./docs` |
| Batch translate | `doc2x batch translate ./docs --glob "**/*.pdf" --target-language en` |
| List models | `doc2x models list` |
| Manage glossary | `doc2x term list` |
| Login (OAuth) | `doc2x login` |
| Logout | `doc2x logout` |

## Preflight — run once before first doc2x command

**You MUST perform these checks at the start of every conversation before running any doc2x command.** Do not skip this even if the user appears to have doc2x installed.

### 1. Check Node.js version

```bash
node --version
```

Node.js must be >= 22. Tell the user to upgrade first if it is lower.

### 2. Check if doc2x CLI is installed

```bash
doc2x --version
```

- **"command not found"** → CLI is not installed. Go to step 3.
- **Version number shown** → CLI is installed. Go to step 4.

### 3. Install (if not installed)

```bash
npm i -g @noedgeai-org/doc2x-cli@latest
doc2x --help
```

If `command not found` after install: run `npm config get prefix` and tell the user to add `<prefix>/bin` to their PATH.

After successful install, proceed to the user's request — skip step 4.

### 4. Check for updates (if already installed)

```bash
npm view @noedgeai-org/doc2x-cli dist-tags.latest
```

Compare the output with the currently installed version. If a newer stable version is available, update:

```bash
npm i -g @noedgeai-org/doc2x-cli@latest
```

**CRITICAL:** Always use `dist-tags.latest` to find the stable version. NEVER use `npm outdated` (it may resolve to beta/pre-release versions). NEVER install a version containing `-beta`, `-alpha`, `-rc`, or any pre-release suffix.

Inform the user of the version change before proceeding.

## Authentication

```bash
# Client mode (default) — reuses Doc2X desktop app session
doc2x parse ./file.pdf

# OAuth mode — for CI/servers, no desktop app needed
doc2x login                                   # Opens browser for OAuth login (PKCE)
doc2x parse ./file.pdf --auth-mode oauth      # Uses stored OAuth credentials

# Print login URL instead of opening browser
doc2x login --no-browser

# Clear stored OAuth credentials
doc2x logout
```

Client mode connects to the desktop client at `127.0.0.1:34123`. Falls back to encrypted storage at:
- macOS: `~/Library/Application Support/doc2x/doc2x-store-data.json`
- Windows: `%APPDATA%/doc2x/doc2x-store-data.json`
- Linux: `~/.config/doc2x/doc2x-store-data.json`

OAuth mode stores credentials at:
- macOS: `~/Library/Application Support/doc2x/cli-oauth-tokens.json`
- Windows: `%APPDATA%/doc2x/cli-oauth-tokens.json`
- Linux: `~/.config/doc2x/cli-oauth-tokens.json`

## Commands

### parse

```bash
doc2x parse <input> [options]
```

Converts PDF or image to another format. Supported inputs: PDF (≤300 MB), PNG/JPG/JPEG/GIF/BMP (≤3 MB). **Not supported:** WebP, TIFF.

```bash
doc2x parse ./paper.pdf                                # → Markdown (default)
doc2x parse ./paper.pdf --to docx --docx-template academic # → Word
doc2x parse ./paper.pdf --to tex                        # → LaTeX
doc2x parse ./paper.pdf --to html                       # → HTML (client-rendered with MathJax)
doc2x parse ./paper.pdf --to pdf                        # → Re-typeset PDF
doc2x parse ./paper.pdf --to none --json                # Parse only, no export
doc2x parse ./scan.png --to md                          # Image OCR
doc2x parse ./paper.pdf --image-models doc2x mathpix   # With Mathpix (subscription)
doc2x parse ./paper.pdf --name "{basename}-{date}"      # Custom filename
```

**IMPORTANT:** `--formula-mode dollar` only works with `--to md`. `--image-hosting online` stores images for only 30 days. `doc2x` in `--image-models` is mandatory and cannot be removed. `--docx-template` applies to V3 Word exports (`--to docx`) only. Values: `default`, `general`, `academic`, `business`, `elegant`, `minimal`, `technical`.

Load `references/command-reference.md` for the full option table.

### translate

```bash
doc2x translate <input> [options]
```

Inherits all parse options. Adds translation to bilingual Markdown or typeset PDF.

```bash
doc2x translate ./paper.pdf                                          # → Chinese (default)
doc2x translate ./paper.pdf --target-language en --to html           # → English HTML
doc2x translate ./paper.pdf --translate-type pdf --target-language en --pdf-font-strategy page-optimal # → Bilingual PDF
doc2x translate ./paper.pdf --target-language en --to docx --docx-template technical # → Translated Word
doc2x translate ./paper.pdf --target-language en --term-id glossary1 # With glossary
doc2x translate ./paper.pdf --target-language ja --convert-trans translate  # Translation only
doc2x translate ./paper.pdf --ignore-translate-types table code      # Skip tables/code
doc2x translate ./paper.pdf --contextual-translation                 # Enhanced context
```

Languages: `zh en ja fr ru pt pt-BR es de ko ar`.

Fixed-layout PDF (`--translate-type pdf`) always exports `.pdf`. `--pdf-font-strategy`: `global-consistent` (default) or `page-optimal`.

Do not suggest `combinedTranslate` or combined-output CLI flags; the current stable CLI does not expose them.

### batch

```bash
doc2x batch <parse|translate> [inputs...] [options]
```

```bash
doc2x batch parse ./docs                                             # Sequential parse
doc2x batch translate ./papers --glob "**/*.pdf" --target-language en # Batch translate
doc2x batch parse ./docs --dry-run                                    # Preview matches
doc2x batch parse ./docs --continue-on-error --report ./report.json  # Fault-tolerant
```

**CRITICAL:** Batch always runs sequentially (concurrency hardcoded to 1). Running multiple `doc2x` commands in parallel will trigger "task limit exceeded" errors. Always process one `doc2x` command at a time.

Defaults: `--glob "**/*.{pdf,png,jpg,jpeg}"`, `--skip-existing true`, `--report ./doc2x-report.json`. Exit code 6 when some files fail with `--continue-on-error`.

### login / logout

```bash
doc2x login               # Opens browser for OAuth login
doc2x login --no-browser   # Print login URL instead
doc2x logout               # Clear stored OAuth credentials
```

### models list

```bash
doc2x models list          # Table: Model ID, Name, Subscription, Flags
doc2x models list --json   # JSON array
```

### term (glossary management)

```bash
doc2x term list                                            # List glossaries
doc2x term create --name "Medical Terms"                   # Create → returns ID
doc2x term items --term-id <id>                            # View entries
doc2x term import --term-id <id> --file ./terms.csv        # Import CSV
```

CSV format (RFC 4180): `origin,translate,originLang,translateLang`. Header auto-detected. Default: en→zh.

## Global Options

| Option | Default | Description |
|--------|---------|-------------|
| `--config <path>` | — | Config file (YAML/JSON) |
| `--auth-mode` | `client` | `client` or `oauth` |
| `--timeout <ms>` | `60000` | API timeout |
| `--retry <n>` | `2` | Download retry count |
| `--json` | false | JSON output |
| `--quiet` | false | Errors only |
| `--verbose` | false | Debug output |
| `--no-color` | false | Disable colors (also `NO_COLOR` env) |

## Config File

```bash
doc2x parse ./file.pdf --config ./doc2x.config.yaml
```

Priority: CLI flags > config > built-in defaults. Load `references/config-and-auth.md` for full schema.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Invalid arguments |
| 2 | Auth/quota/subscription failure |
| 3 | Input file error (missing, too large, unsupported) |
| 4 | Server task failed |
| 5 | Export/download failed |
| 6 | Batch partial failure |

## Troubleshooting

Load `references/troubleshooting.md` for the full list (21 error scenarios with exact messages).

Common issues:
- `command not found` → `npm config get prefix`, add `<prefix>/bin` to PATH
- Install/update failure → retry with `npm i -g @noedgeai-org/doc2x-cli@latest --registry=https://registry.npmjs.org`
- Auth failure (client) → desktop app must be running and logged in
- Auth failure (OAuth) → run `doc2x login` to re-authenticate via browser
- `Unsupported image format` → convert WebP/TIFF to PNG first
- `Model requires subscription` → upgrade at https://doc2x.noedgeai.com/
- `Insufficient quota` → free + subscription pages exhausted

## References

- `references/command-reference.md`: Complete option tables for all commands, supported formats, processing pipelines
- `references/config-and-auth.md`: Authentication details, full config schema, batch behavior, exit codes
- `references/troubleshooting.md`: All error messages with exit codes, validation rules, debugging tips
