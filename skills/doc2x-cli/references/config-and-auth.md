# Doc2X CLI — Configuration & Authentication Reference

## Installation

Install or update the CLI:

```bash
npm view @noedgeai-org/doc2x-cli dist-tags.latest
npm i -g @noedgeai-org/doc2x-cli@latest
```

## Authentication Modes

### Client Mode (`--auth-mode client`, default)

Reuses an authenticated Doc2X desktop client session. The CLI connects to the desktop client's local server at `http://127.0.0.1:34123` to fetch the session token.

**Fallback**: If the desktop client is not running, the CLI attempts to read the encrypted client storage file:
- **macOS**: `~/Library/Application Support/doc2x/doc2x-store-data.json`
- **Windows**: `%APPDATA%/doc2x/doc2x-store-data.json`
- **Linux**: `~/.config/doc2x/doc2x-store-data.json`

**Requirements**: The Doc2X desktop app must be installed, and the user must have logged in at least once.

### OAuth Mode (`--auth-mode oauth`)

Browser-based OAuth 2.0 login with PKCE. Run `doc2x login` to authenticate, then use `--auth-mode oauth` for subsequent commands. Tokens auto-refresh using one-time-use refresh tokens.

```bash
# Step 1: Login via browser (one-time)
doc2x login
# Or print URL instead of opening browser:
doc2x login --no-browser

# Step 2: Use oauth mode
doc2x parse ./file.pdf --auth-mode oauth

# Clear credentials
doc2x logout
```

**OAuth token storage:**
- macOS: `~/Library/Application Support/doc2x/cli-oauth-tokens.json`
- Windows: `%APPDATA%/doc2x/cli-oauth-tokens.json`
- Linux: `~/.config/doc2x/cli-oauth-tokens.json`

### Choosing the Right Mode

- **Has desktop client installed and logged in** → use client mode (default)
- **Server/CI environment or no desktop client** → use OAuth mode (`doc2x login` + `--auth-mode oauth`)

---

## Configuration File

Users can create a YAML or JSON config file to set persistent defaults.

```yaml
# doc2x.config.yaml
authMode: oauth
timeout: 60000
retry: 2
defaults:
  parse:
    to: md
    out: ./my-output
    imageHosting: local
    formulaMode: normal
    formulaLevel: normal
    imageModels: [doc2x]
    visionModels: []
    mergeCrossPageForms: false
    removeComments: false
    avoidIndentedCodeBlocks: false
    docxTemplate: default
    name: "{basename}"
    overwrite: false
  translate:
    translateType: md
    targetLanguage: zh
    targetModel: "72"
    termId: ""
    fontColorExtraction: false
    pdfFontStrategy: global-consistent
    ignoreTranslateTypes: []
    convertTrans: both
    contextualTranslation: false
  batch:
    glob: "**/*.{pdf,png,jpg,jpeg}"
    continueOnError: false
    skipExisting: true
    report: ./my-report.json
    dryRun: false
```

Use it with any command:

```bash
doc2x parse ./file.pdf --config ./doc2x.config.yaml
doc2x batch translate ./docs --config ./doc2x.config.yaml
```

**Option priority** (highest to lowest): CLI flags → config file defaults → built-in defaults.

Config option values:
- `docxTemplate`: `default`, `general`, `academic`, `business`, `elegant`, `minimal`, `technical`; V3 Word exports only.
- `pdfFontStrategy`: `global-consistent` (default) or `page-optimal`; fixed-layout PDF translation only.

**For translate commands**, config resolution merges: CLI args → global config → config.defaults.parse → config.defaults.translate → built-in defaults.

**For batch commands**, config resolution merges: CLI args → global config → config.defaults.parse → config.defaults.translate → config.defaults.batch → built-in defaults.

---

## Exit Codes

Useful for CI/CD scripting and error handling:

| Code | Name                  | Meaning                                                        |
|------|-----------------------|----------------------------------------------------------------|
| 0    | Success               | Command completed successfully                                 |
| 1    | ArgumentError         | Invalid CLI arguments or validation failure                    |
| 2    | AuthFailed            | Authentication/authorization failure (bad token, quota, subscription) |
| 3    | InputFileError        | Input file issue (not found, too large, empty, unsupported format)    |
| 4    | TaskFailed            | Server-side task execution failed                              |
| 5    | ExportFailed          | Export or download failed                                      |
| 6    | BatchPartialFailure   | Batch completed with one or more individual file failures      |

---

## Batch Processing Behavior

- **File resolution**: Directories are expanded using the `--glob` pattern (via `minimatch` with `matchBase`). Non-existent paths are silently skipped. Results are deduplicated and sorted.
- **Authentication**: Authenticated once before the batch starts; shared across all files.
- **Global preflight**: Quota check, model validation (image models, vision models, translate model) run once before any files are processed.
- **Per-file preflight**: File size validation and format check run for each individual file.
- **Skip existing**: When `--skip-existing` is true (default), the CLI resolves the expected output path and skips the file if it already exists.
- **Concurrency**: Hardcoded to 1 (sequential). Doc2X enforces a server-side concurrent task limit.
- **Error handling**: With `--continue-on-error`, the batch continues after individual failures and exits with code 6 (BatchPartialFailure). Without it, the batch stops at the first error.
- **Report**: A JSON report is always written to `--report` path with this structure:

```json
{
  "timestamp": "2025-03-31T12:00:00.000Z",
  "totalFiles": 10,
  "succeeded": 8,
  "failed": 1,
  "skipped": 1,
  "results": [
    {
      "file": "./docs/paper.pdf",
      "status": "success",
      "outputFiles": ["./output/paper.md"]
    },
    {
      "file": "./docs/broken.pdf",
      "status": "failed",
      "error": "File too large: 350 MB (max 300 MB for PDF)"
    },
    {
      "file": "./docs/existing.pdf",
      "status": "skipped"
    }
  ]
}
```

- **Dry run**: `--dry-run` lists matched files to stdout without processing any of them.
- **Progress**: Displays `[done/total] Processing: filename` during execution (suppressed in `--json` mode).
- **Duration**: Displays total batch time as `Xs` (< 60s) or `XmYs` (>= 60s).
