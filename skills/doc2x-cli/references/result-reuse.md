# Reuse parsing and translation results

Requires CLI **0.3.0** functionality: verify `doc2x export --help` and the `--reuse` option in `doc2x parse --help` / `doc2x translate --help`. Installing this skill does not install or upgrade the CLI. Check the stable npm version using the entrypoint's preflight. If stable is still 0.2.0, it cannot run these commands; keep the receipt and explain the version requirement. Never invent a successful re-export or repeat processing to simulate it.

## Parse once, export several formats

Run commands sequentially:

```bash
doc2x parse ./paper.pdf --to none --receipt ./parsed.json
doc2x export --receipt ./parsed.json --to md,docx,html --out ./exports
```

If `parsed.json` already identifies the desired result, skip the first command. Formats are comma-separated and duplicates are removed. `none` is only for initial processing; it is not an export format. PDF parse results support `md,tex,docx,html,pdf`.

Outputs go into separate format directories, such as `exports/md/paper.md`, `exports/docx/paper.docx`, and `exports/html/paper.html`. Keep adjacent image/resource files. Separating formats also prevents HTML's intermediate Markdown from replacing the requested Markdown export.

## Translate once, export several formats

```bash
doc2x translate ./paper.pdf --translate-type md --target-language en --to none --receipt ./translated.json
doc2x export --receipt ./translated.json --to md,docx,html --convert-trans translate --out ./translated-exports
```

This reuses the translation task, including its original language/model/glossary. For reflowed translation, `--convert-trans both|origin|translate` chooses exported content. The formats are `md,tex,docx,html,pdf`.

Preserved-layout (`--translate-type pdf`) tasks support only `--to pdf` with `--convert-trans both`. Export cannot convert a fixed-layout translation into reflowed Word or change its target language/model. A different processing mode is a separate task that can consume quota, so explain it before starting one. Do not silently change modes to obtain more formats.

## Reuse with a file identity check

```bash
doc2x parse ./paper.pdf --reuse ./parsed.json --to tex --out ./more-exports
doc2x translate ./paper.pdf --reuse ./translated.json --to docx --out ./more-translations
```

New receipts store SHA-256 and size of the actual uploaded bytes. Renamed identical files match; changed content at the same path does not. The receipt must match the command (`parse` or `translate`). Do not change processing parameters with `--reuse`; omit them to use the retained result. Output format, Word template and reflowed content selection may change.

Only processing options explicitly supplied on the `--reuse` command line are checked against the retained task. Config-file defaults for language, model, glossary and image models do not change or reject it. Known equivalent language/model identifiers and reordered option lists are accepted. `export --receipt` selects the result directly and does not compare processing defaults.

`export --receipt` selects a task explicitly and does not require the original input file. It supports legacy 0.2.0 PDF receipts, which lack fingerprints; those receipts cannot verify file identity with `--reuse`. Do not match files by name alone or fabricate a receipt around an unrelated task ID. Ordinary `parse`/`translate` without `--reuse` starts a new workflow, not an automatic content-cache lookup.

New single-model Doc2X image OCR receipts can export `md,tex,docx`. Legacy image receipts or combined Mathpix/vision results lack sufficient reusable metadata and are rejected. Keep their original downloads. Each receipt from a batch can be exported individually, sequentially; there is no automatic batch resume.

## Expiry, account selection and download failures

- The reuse window is conservatively **less than 30 days from the original attempt/task creation**. Exactly 30 days is expired. A re-export or changed receipt modification time does not restart the clock.
- The CLI queries retained metadata using the currently selected OAuth/desktop account before export. Missing, deleted, expired or inaccessible metadata stops the operation. Authentication/network failures do not create replacement tasks or switch accounts automatically. Missing or future creation timestamps also fail.
- Each export obtains a fresh download URL. A signed URL expiring does not itself mean the parse/translation task must be rerun. Retry `export` against the retained receipt.
- Export errors, partial download failures, and unsupported combinations never fall back to uploading, parsing or translating. Read the error and receipt; retry only the failed/missing formats when the cause allows it. `result_expired` and `result_time_invalid` require resolving retention/clock issues, `local_storage_failed` requires fixing storage or permissions, and `download_link_unavailable` allows requesting a fresh export URL while the result remains available. The same rules apply if the 30-day boundary is crossed between formats. Do not promise that every possible export is free: the guarantee is no new parsing or translation submission, not a billing quote or refund.
- Prefer `--image-hosting local` for durable results and preserve the resource bundle. Online images have a separate 30-day lifetime. Neither local receipts nor re-export extend remote retention. Already downloaded files remain usable after the remote result expires.

An expired result requires an explicitly requested new processing task, which can consume quota. Explain this before starting it. Do not delete old local files or receipts as an expiry workaround.

## Receipts and export options

The source receipt is never overwritten. The export writes a new receipt under `<out>/.doc2x-receipts/`; use `export --result-receipt ./export-run.json` to select a fresh path. For `parse/translate --reuse`, `--receipt ./export-run.json` selects the new receipt. It preserves the original task ID, original creation time, completed artifact paths and failure checkpoint.

Existing output files require a different `--out` root or explicit `--overwrite`. Useful export options include `--docx-template`, `--convert-trans`, `--formula-mode`, `--formula-level`, `--image-hosting`, `--merge-cross-page-forms`, `--remove-comments`, `--avoid-indented-code-blocks`, `--name`, and global authentication/download options. `--name` cannot contain directory separators. `--retry` is limited to 0–10 for reuse exports.

Export-option precedence is command line, config defaults, recorded receipt options, then built-in defaults. New receipts record formula level, table merging and comment/code handling along with the existing export settings. Missing options in older receipts use the current defaults. An explicitly recorded online-image setting is inherited unless overridden; pass `--image-hosting local` when making a durable local bundle. For parsing, `{lang}` expands to an empty string in every format and in overwrite checks.

Receipts contain local paths, file fingerprints and task metadata. Keep them private unless reviewed; do not put real receipts, credentials, signed URLs or document contents in public bug reports or commits.
