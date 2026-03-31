---
name: doc2x-cli
description: "Installs and operates @noedgeai/doc2x-cli for document parsing, translation, and batch processing. Trigger when user mentions doc2x, doc2x-cli, PDF to Markdown, PDF OCR, document translation, batch PDF conversion, or bilingual PDF. Covers parse, translate, batch, models, and term commands. Do NOT trigger for general PDF viewing, browser-based PDF tools, or non-doc2x workflows."
license: MIT
metadata:
  author: noedgeai
  version: "0.1.0"
---

# Doc2X CLI

CLI tool for parsing PDFs/images to Markdown, LaTeX, Word, HTML, or PDF — and translating documents to 10 languages with bilingual output.

$ARGUMENTS

## Quick Reference

| Task | Command |
|------|---------|
| Parse PDF → Markdown | `doc2x parse ./paper.pdf` |
| Parse PDF → Word | `doc2x parse ./paper.pdf --to docx` |
| Parse image → Markdown | `doc2x parse ./scan.png --to md` |
| Translate → Chinese | `doc2x translate ./paper.pdf` |
| Translate → English HTML | `doc2x translate ./paper.pdf --target-language en --to html` |
| Bilingual PDF | `doc2x translate ./paper.pdf --translate-type pdf --target-language en` |
| Batch parse | `doc2x batch parse ./docs --concurrency 4` |
| Batch translate | `doc2x batch translate ./docs --glob "**/*.pdf" --target-language en` |
| List models | `doc2x models list` |
| Manage glossary | `doc2x term list` |

## Install

```bash
node --version                    # Must be >= 22
npm config set @noedgeai:registry=https://npm.pkg.github.com   # Required: point @noedgeai scope to GitHub Packages
npm i -g @noedgeai/doc2x-cli
doc2x --help                      # Verify
```

**CRITICAL:** Node.js >= 22 is required. The `@noedgeai` scope is hosted on GitHub Packages — you must configure the registry before installing. If `command not found` after install, run `npm config get prefix` and add `<prefix>/bin` to PATH.

## Authentication

```bash
# Client mode (default) — reuses Doc2X desktop app session
doc2x parse ./file.pdf

# API mode — for CI/servers, no desktop app needed
export DOC2X_TOKEN="your-refresh-token"
doc2x parse ./file.pdf --auth-mode api

# Or inline
doc2x parse ./file.pdf --auth-mode api --token "your-token"
```

Client mode connects to the desktop client at `127.0.0.1:34123`. Falls back to encrypted storage at:
- macOS: `~/Library/Application Support/doc2x/doc2x-store-data.json`
- Windows: `%APPDATA%/doc2x/doc2x-store-data.json`
- Linux: `~/.config/doc2x/doc2x-store-data.json`

## Commands

### parse

```bash
doc2x parse <input> [options]
```

Converts PDF or image to another format. Supported inputs: PDF (≤300 MB), PNG/JPG/JPEG/GIF/BMP (≤3 MB). **Not supported:** WebP, TIFF.

```bash
doc2x parse ./paper.pdf                                # → Markdown (default)
doc2x parse ./paper.pdf --to docx --out ./results      # → Word
doc2x parse ./paper.pdf --to tex                        # → LaTeX
doc2x parse ./paper.pdf --to html                       # → HTML (client-rendered with MathJax)
doc2x parse ./paper.pdf --to pdf                        # → Re-typeset PDF
doc2x parse ./paper.pdf --to none --json                # Parse only, no export
doc2x parse ./scan.png --to md                          # Image OCR
doc2x parse ./paper.pdf --image-models doc2x mathpix   # With Mathpix (subscription)
doc2x parse ./paper.pdf --name "{basename}-{date}"      # Custom filename
```

**IMPORTANT:** `--formula-mode dollar` only works with `--to md`. `--image-hosting online` stores images for only 30 days. `doc2x` in `--image-models` is mandatory and cannot be removed.

Load `references/command-reference.md` for the full option table.

### translate

```bash
doc2x translate <input> [options]
```

Inherits all parse options. Adds translation to bilingual Markdown or typeset PDF.

```bash
doc2x translate ./paper.pdf                                          # → Chinese (default)
doc2x translate ./paper.pdf --target-language en --to html           # → English HTML
doc2x translate ./paper.pdf --translate-type pdf --target-language en # → Bilingual PDF
doc2x translate ./paper.pdf --target-language en --term-id glossary1 # With glossary
doc2x translate ./paper.pdf --target-language ja --convert-trans translate  # Translation only
doc2x translate ./paper.pdf --ignore-translate-types table code      # Skip tables/code
doc2x translate ./paper.pdf --contextual-translation                 # Enhanced context
```

Languages: `zh en ja fr ru pt es de ko ar`. Fixed-layout PDF (`--translate-type pdf`) always exports as `.pdf` regardless of `--name`.

### batch

```bash
doc2x batch <parse|translate> [inputs...] [options]
```

```bash
doc2x batch parse ./docs --concurrency 4                             # Parallel parse
doc2x batch translate ./papers --glob "**/*.pdf" --target-language en # Batch translate
doc2x batch parse ./docs --dry-run                                    # Preview matches
doc2x batch parse ./docs --continue-on-error --report ./report.json  # Fault-tolerant
```

Defaults: `--glob "**/*.{pdf,png,jpg,jpeg}"`, `--concurrency 1`, `--skip-existing true`, `--report ./doc2x-report.json`. Exit code 6 when some files fail with `--continue-on-error`.

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
| `--auth-mode` | `client` | `api` or `client` |
| `--token <t>` | — | Refresh token (or `DOC2X_TOKEN` env) |
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

Load `references/troubleshooting.md` for the full list (19 error scenarios with exact messages).

Common issues:
- `command not found` → `npm config get prefix`, add `<prefix>/bin` to PATH
- Auth failure (client) → desktop app must be running and logged in
- Auth failure (API) → check `DOC2X_TOKEN` is set and valid (12h lifetime, auto-refreshes)
- `Unsupported image format` → convert WebP/TIFF to PNG first
- `Model requires subscription` → upgrade at https://doc2x.noedgeai.com/
- `Insufficient quota` → free + subscription pages exhausted

## References

- `references/command-reference.md`: Complete option tables for all commands, supported formats, processing pipelines
- `references/config-and-auth.md`: Authentication details, full config schema, batch behavior, exit codes
- `references/troubleshooting.md`: All error messages with exit codes, validation rules, debugging tips
