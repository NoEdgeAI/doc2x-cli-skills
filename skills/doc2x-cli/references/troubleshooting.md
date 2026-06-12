# Doc2X CLI — Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

1. **"command not found" after install**
   - The npm global bin is not in PATH.
   - Run `npm config get prefix` and add `<prefix>/bin` to PATH.
   - On macOS/Linux: `export PATH="$(npm config get prefix)/bin:$PATH"` (add to `~/.bashrc` or `~/.zshrc`)

2. **npm install fails**
   - Retry with the npmjs registry:
     ```bash
     npm i -g @noedgeai-org/doc2x-cli@latest --registry=https://registry.npmjs.org
     ```
   - If this still fails, inspect local npm settings with `npm config list`.

3. **"404 Not Found" or "npm ERR! code E404" when installing**
   - Check that the package name is exactly `@noedgeai-org/doc2x-cli`.
   - Verify package availability and retry:
     ```bash
     npm view @noedgeai-org/doc2x-cli dist-tags.latest --registry=https://registry.npmjs.org
     npm i -g @noedgeai-org/doc2x-cli@latest --registry=https://registry.npmjs.org
     ```

4. **"Node.js version too old"**
   - Requires Node >= 22. Run `node --version` to check.
   - Upgrade via nvm: `nvm install 22 && nvm use 22`

### Authentication Issues

5. **Client mode failure — desktop app not running**
   - Ensure the Doc2X desktop app is installed and the user has logged in at least once.
   - The CLI tries the local server first (port 34123), then falls back to the encrypted storage file.
   - Storage paths:
     - macOS: `~/Library/Application Support/doc2x/doc2x-store-data.json`
     - Windows: `%APPDATA%/doc2x/doc2x-store-data.json`
     - Linux: `~/.config/doc2x/doc2x-store-data.json`

6. **OAuth mode failure — not logged in or expired**
   - Run `doc2x login` to authenticate via browser.
   - OAuth tokens auto-refresh using one-time-use refresh tokens.
   - If refresh fails, re-run `doc2x login`.
   - To clear stored credentials: `doc2x logout`
   - Token storage:
     - macOS: `~/Library/Application Support/doc2x/cli-oauth-tokens.json`
     - Windows: `%APPDATA%/doc2x/cli-oauth-tokens.json`
     - Linux: `~/.config/doc2x/cli-oauth-tokens.json`

### Input File Issues

7. **"File not found or not readable: <path>"** (exit code 3)
   - Check the file path is correct and the file exists.

8. **"File too large: X MB (max Y for Z)"** (exit code 3)
   - PDFs must be under 300 MB, images under 3 MB.

9. **"File is empty: <path>"** (exit code 3)
   - The input file has 0 bytes. Check if the file is corrupted.

10. **"Unsupported image format: .webp"** (exit code 3)
   - WebP and TIFF are not supported by the server.
   - Full error: `Unsupported image format: .webp. Server supports: png, jpg, jpeg, gif, bmp. Convert to PNG first: e.g. "convert input.webp output.png"`

### Validation Issues

11. **"doc2x is mandatory in --image-models and cannot be removed."** (exit code 1)
   - The `doc2x` OCR model cannot be removed from the image-models list.

12. **"Invalid <name>: "<value>". Valid values: <list>"** (exit code 1)
    - Enum options are strictly validated:
      - `--to`: none, md, tex, docx, html, pdf
      - `--image-hosting`: local, online
      - `--formula-mode`: normal, dollar
      - `--formula-level`: normal, onlyLine, processAll
      - `--docx-template`: default, general, academic, business, elegant, minimal, technical
      - `--translate-type`: md, pdf
      - `--target-language`: zh, en, ja, fr, ru, pt, pt-BR, es, de, ko, ar
      - `--pdf-font-strategy`: global-consistent (global consistency), page-optimal (single-page priority)
      - `--convert-trans`: both, origin, translate
      - `--ignore-translate-types`: table, code, figure, reference
13. **"Invalid batch action: "<value>". Use "parse" or "translate"."** (exit code 1)
    - The batch action must be exactly `parse` or `translate`.

14. **"No input files or directories specified."** (exit code 1)
    - Batch command requires at least one input file or directory.

### Subscription and Quota Issues

15. **"Model "<name>" requires a subscription."** (exit code 2)
    - Some OCR models (mathpix), translation models, and vision models need a paid subscription.
    - Full message variants:
      - `Mathpix OCR model requires a subscription. Upgrade at https://doc2x.noedgeai.com/ or remove 'mathpix' from --image-models.`
      - `Model "<name>" requires a subscription. Your current plan does not include this model. Upgrade at https://doc2x.noedgeai.com/ or use a free model.`
      - `One or more selected vision models require a subscription. Upgrade at https://doc2x.noedgeai.com/ or remove paid models from --vision-models.`

16. **"Insufficient quota: no available pages remaining (free: 0, subscription: 0)."** (exit code 2)
    - Both free pages and subscription pages are 0.
    - Full message: `Insufficient quota: no available pages remaining (free: 0, subscription: 0). Check your subscription or purchase more pages.`

### Config File Issues

17. **"Cannot read config file: <path>"** (exit code 1)
    - Config file does not exist or is not readable.

18. **"Invalid config file: <path> — <details>"** (exit code 1)
    - YAML or JSON syntax error in the config file.

### Server-side Issues

19. **Task failed** (exit code 4)
    - Server-side processing error. Check with `--verbose` for details.

20. **Export failed** (exit code 5)
    - Download or export failed. May be due to network issues.
    - The CLI retries downloads with exponential backoff (configurable via `--retry`).

21. **"Task limit exceeded" / concurrent task limit error**
    - Doc2X enforces a server-side limit on concurrent tasks per account.
    - **Cause**: Running multiple `doc2x` commands in parallel.
    - **Fix**: Always run doc2x commands sequentially — one at a time. Batch mode already enforces sequential execution (concurrency hardcoded to 1). Never launch multiple doc2x processes in parallel.

## Debugging Tips

- Add `--verbose` to see debug output: file validation details, quota check results, model validation, polling status, upload/download progress.
- Add `--json` to get machine-readable output for scripting and automation.
- Use `--quiet` to suppress all progress output except errors and final results.
- For batch jobs, use `--dry-run` first to verify file matching before processing.
- Check the batch report JSON file (default: `./doc2x-report.json`) for per-file status details.
