# Doc2X CLI — Complete Command Reference

## Parse Command

```bash
doc2x parse <input> [options]
```

**Argument:** `<input>` (required) — Input file path (PDF or image).

**Supported input formats:**
- PDF files (up to 300 MB)
- Images: PNG, JPG, JPEG, GIF, BMP (up to 3 MB each)
- NOT supported: WebP, TIFF (rejected with suggestion to convert to PNG)
- Empty files are rejected

**Output formats** (`--to`):
| Format   | Flag        | Description                                             |
|----------|-------------|---------------------------------------------------------|
| None     | `--to none` | Parse only, no file export (metadata only)              |
| Markdown | `--to md`   | Default output format                                   |
| LaTeX    | `--to tex`  | LaTeX source                                            |
| Word     | `--to docx` | Microsoft Word                                          |
| HTML     | `--to html` | HTML document (client-side rendered with MathJax)       |
| PDF      | `--to pdf`  | Re-typeset PDF                                          |

**All parse options:**

| Option                             | Default      | Description                                               |
|------------------------------------|--------------|-----------------------------------------------------------|
| `--to <fmt>`                       | `md`         | Output format: none, md, tex, docx, html, pdf             |
| `--out <path>`                     | `./output`   | Output directory or file path                             |
| `--name <pattern>`                 | `{basename}` | Filename template: {basename}, {date}, {lang}             |
| `--overwrite`                      | false        | Overwrite existing output files                           |
| `--image-models <models...>`       | `[doc2x]`    | OCR models: doc2x (mandatory), optionally mathpix         |
| `--vision-models <models...>`      | `[]`         | LLM vision models (use IDs from `doc2x models list`)     |
| `--image-hosting <mode>`           | `local`      | Image source: local or online                             |
| `--formula-mode <mode>`            | `normal`     | Formula delimiters: normal or dollar                      |
| `--formula-level <level>`          | `normal`     | Formula downgrade: normal, onlyLine, processAll           |
| `--merge-cross-page-forms`         | false        | Merge tables spanning multiple pages                      |
| `--remove-comments`                | false        | Remove HTML comments from output                          |
| `--avoid-indented-code-blocks`     | false        | Code indentation compatibility mode                       |

**Warnings:**
- `--formula-mode dollar` is only effective when `--to md`. Using it with other formats logs a warning.
- `--image-hosting online` stores images for only 30 days.
- `--image-models` always requires `doc2x`; it cannot be removed. Adding `mathpix` requires a subscription.
- `--vision-models` accepts model IDs or names from `doc2x models list`. Some may require a subscription.

**Filename template variables:**
- `{basename}` — Original filename without extension
- `{date}` — Current date in YYYY-MM-DD format
- `{lang}` — Target language code (for translate; empty for parse)

**Processing pipeline (PDF):** upload → server-side parse → export → download (with zip extraction for md/tex/html)

**Processing pipeline (Image):** upload → doc2x OCR → optional Mathpix extension → optional LLM vision enhancement → export

**HTML export special behavior:** The CLI requests a Markdown export from the server, then renders it client-side to a full HTML document with embedded MathJax for formula rendering, styled with CSS (max-width 800px, system fonts, responsive images).

---

## Translate Command

```bash
doc2x translate <input> [options]
```

**Argument:** `<input>` (required) — Input PDF file path.

Inherits all parse options, plus translation-specific options:

| Option                             | Default  | Description                                               |
|------------------------------------|----------|-----------------------------------------------------------|
| `--translate-type <t>`             | `md`     | Translation mode: md (bilingual markdown) or pdf (typeset)|
| `--target-language <lang>`         | `zh`     | Target: zh, en, ja, fr, ru, pt, es, de, ko, ar           |
| `--target-model <id>`              | `72`     | Translation LLM model ID (see `doc2x models list`)       |
| `--term-id <id>`                   | `""`     | Custom glossary ID for domain-specific terms              |
| `--font-color-extraction`          | false    | Extract font color information                            |
| `--convert-trans <t>`              | `both`   | Export content: both, origin, or translate                 |
| `--contextual-translation`         | false    | Enable contextual translation enhancement                 |
| `--ignore-translate-types <t...>`  | `[]`     | Skip element types: table, code, figure, reference        |

**Translation pipeline:** upload → parse → translate → export

**Fixed-layout PDF translation** (`--translate-type pdf`): The exported file always uses `.pdf` extension, regardless of the `--name` pattern.

---

## Batch Command

```bash
doc2x batch <action> [inputs...] [options]
```

**Arguments:**
- `<action>` (required) — Action: `parse` or `translate`
- `[inputs...]` (optional) — Input files or directories

Inherits all parse and translate options. Batch-specific options:

| Option                  | Default                       | Description                                 |
|-------------------------|-------------------------------|---------------------------------------------|
| `--glob <pattern>`      | `**/*.{pdf,png,jpg,jpeg}`     | Glob pattern for matching files in dirs     |
| `--concurrency <n>`     | `1`                           | Number of parallel tasks (**keep at 1**, see warning below) |
| `--continue-on-error`   | false                         | Keep processing after individual failures   |
| `--skip-existing`       | true                          | Skip files with existing output             |
| `--report <path>`       | `./doc2x-report.json`         | JSON report output path                     |
| `--dry-run`             | false                         | List matched files without processing       |

**CRITICAL: Keep concurrency at 1.** Doc2X enforces a server-side concurrent task limit. Setting `--concurrency` above 1, or running multiple `doc2x` commands in parallel, will trigger "task limit exceeded" errors. Always process files sequentially.

**Validation:**
- `<action>` must be `parse` or `translate` — otherwise: `Invalid batch action: "<value>". Use "parse" or "translate".`
- At least one input file or directory must be specified — otherwise: `No input files or directories specified.`

---

## Models Command

```bash
doc2x models list          # Table output (columns: Model ID, Name, Subscription, Flags)
doc2x models list --json   # JSON output (array of model objects)
```

---

## Term Commands (Glossary Management)

**List all glossaries:**
```bash
doc2x term list              # Table (columns: ID, Description, Created)
doc2x term list --json       # JSON output
```

**Create a new glossary:**
```bash
doc2x term create --name "Medical Terms"
# Output: Glossary created: <id>
# JSON: {"termId":"<id>"}
```
- `--name <name>` (required) — Glossary name/description

**View glossary entries:**
```bash
doc2x term items --term-id <glossary-id>         # Table (columns: ID, Original, Translation, Created)
doc2x term items --term-id <glossary-id> --json   # JSON output
```
- `--term-id <id>` (required) — Glossary ID

**Import terms from CSV:**
```bash
doc2x term import --term-id <glossary-id> --file ./terms.csv
# Output: Imported <count> term(s)
# JSON: {"imported":<count>}
```
- `--term-id <id>` (required) — Target glossary ID
- `--file <path>` (required) — CSV file path

**CSV format** (RFC 4180, supports quoted fields and escaped quotes):
```csv
origin,translate,originLang,translateLang
neural network,神经网络,en,zh
transformer,变换器,en,zh
```

- Header row auto-detected if it contains "origin" or "translate" (case-insensitive)
- Language codes: zh, en, ja, fr, ru, pt, es, de, ko, ar
- Default language pair: English origin → Chinese translation (if columns omitted)
- Empty lines are filtered out; at least one valid entry is required

---

## Global Options

These apply to all commands:

| Option              | Default    | Description                                     |
|---------------------|------------|-------------------------------------------------|
| `--config <path>`   | (none)     | Path to config file (YAML or JSON)              |
| `--auth-mode <m>`   | `client`   | Authentication mode: api or client              |
| `--token <t>`       | (none)     | Refresh token for API mode (or `DOC2X_TOKEN`)   |
| `--timeout <ms>`    | `60000`    | API request timeout in milliseconds             |
| `--retry <n>`       | `2`        | Retry count for downloads/exports               |
| `--json`            | false      | Output results as JSON                          |
| `--quiet`           | false      | Only output errors and final results            |
| `--verbose`         | false      | Output debug information                        |
| `--no-color`        | false      | Disable colored output (auto-detected in non-TTY) |

**Environment variables:**
- `DOC2X_TOKEN` — Refresh token for API mode (fallback if `--token` not provided)
- `NO_COLOR` — Set to any value to disable ANSI color output
