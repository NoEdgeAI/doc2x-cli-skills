# Doc2X CLI — Configuration & Authentication Reference

## Authentication Modes

### Client Mode (`--auth-mode client`, default)

Reuses an authenticated Doc2X desktop client session. The CLI connects to the desktop client's local server at `http://127.0.0.1:34123` to fetch the session token.

**Fallback**: If the desktop client is not running, the CLI attempts to read the encrypted client storage file:
- **macOS**: `~/Library/Application Support/doc2x/doc2x-store-data.json`
- **Windows**: `%APPDATA%/doc2x/doc2x-store-data.json`
- **Linux**: `~/.config/doc2x/doc2x-store-data.json`

**Requirements**: The Doc2X desktop app must be installed, and the user must have logged in at least once.

### API Mode (`--auth-mode api`)

Uses a refresh token directly. Tokens are automatically refreshed (12-hour lifetime).

```bash
# Set via environment variable (recommended)
export DOC2X_TOKEN="your-refresh-token-here"
doc2x parse ./file.pdf --auth-mode api

# Or pass inline
doc2x parse ./file.pdf --auth-mode api --token "your-refresh-token-here"
```

### Choosing the Right Mode

- **Has desktop client installed and logged in** → use client mode (default)
- **Server/CI environment or no desktop client** → use API mode with `DOC2X_TOKEN`

---

## Configuration File

Users can create a YAML or JSON config file to set persistent defaults.

```yaml
# doc2x.config.yaml
authMode: api
token: your-refresh-token
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
    name: "{basename}"
    overwrite: false
  translate:
    translateType: md
    targetLanguage: zh
    targetModel: "72"
    termId: ""
    fontColorExtraction: false
    ignoreTranslateTypes: []
    convertTrans: both
    contextualTranslation: false
  batch:
    glob: "**/*.{pdf,png,jpg,jpeg}"
    concurrency: 1
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
- **Concurrency**: Controlled by `--concurrency` (default: 1, sequential). Uses `p-limit` for concurrency control. **Must stay at 1** — Doc2X enforces a server-side concurrent task limit; higher values cause "task limit exceeded" errors.
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
