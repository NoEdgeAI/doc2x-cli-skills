# Account, task records and durable receipts

Requires CLI 0.2.0 or newer. Check `doc2x --version` before using these commands. All examples obey the skill's sequential task execution rule.

## Account and model choice

```bash
doc2x account status --json
doc2x models list --json
doc2x models show 10001 --json
doc2x models guide
```

`account status` uses the selected OAuth/desktop identity and reports a minimal account ID, membership expiry, shared PDF/image parse-page quota and point balance. Do not add old image quota fields to shared page quota. Point raw units and display values are distinct (100 units per point); points are not cash. Unknown fields are null; query failure is not zero balance. A snapshot does not reserve quota or guarantee the cost of a future batch.

Models come from the live service list. Free/10001 is the default when available. `subscriptionRequired` is not a complete price quote. Unknown context length, pricing and recommended use cases remain null. Use a small representative document to evaluate quality; use `--term-id` for domain terminology and consider `--contextual-translation`. Do not silently switch to a paid model. Formula/table quality also depends on OCR and layout. There is no verified automatic model-quality ranking or custom endpoint option.

## Receipts

```bash
doc2x translate ./paper.pdf --translate-type pdf --receipt ./paper-run.json --json
doc2x parse ./paper.pdf --to none --receipt ./parse-only.json --json
```

Every attempt automatically writes a receipt under `<out>/.doc2x-receipts/`; `--receipt` specifies a fresh single-task path. It includes `schemaVersion`, `attemptId`, `taskIds`, `stages`, `status`, `outputFiles`, `artifacts`, `parameters` and `usage`. Existing receipt files are not overwritten by a new attempt. Keep the receipt when a task fails; stderr JSON also contains it. Do not reconstruct task IDs from human progress text.

IDs are persisted as soon as received. Parsing/translation success and export/download failure are separate states. `--to none` is success with skipped export, not a skipped task. SIGINT/SIGTERM saves an interruption; after SIGKILL or power loss the last running checkpoint can remain. A stopped CLI does not cancel the remote task.

```bash
doc2x records show --parse-id op_example --json
doc2x records show --translate-id ot_example --json
doc2x records list --kind translate --limit 20 --json
doc2x usage show --translate-id ot_example --json
```

Use the real IDs from `taskIds`. `records list` counts source documents, includes their result records, and returns `nextCursor` for `--cursor`; the service's ten-source page size is handled internally. It does not return document content or line coordinates. Retention and metadata availability limit history; it is not an exhaustive failure ledger. `unknown` task status does not prove failure.

`usage show` reads only usage already available in single-task details. `reported_by_task` means tokens/points were reported, not that settlement/refund is confirmed. Empty zero defaults are `unconfirmed`; parsing consumption is `not_provided`. **There is no consumption-history command or `usage list`; do not bypass OAuth restrictions, call billing-history endpoints, or switch to a desktop account to obtain restricted history.**

Batch reports update after each completed/failed file and include `unprocessed`; per-file receipts retain in-flight IDs. First failure stops new work unless `--continue-on-error` is explicit. No resume/re-export command is introduced in this release: don't invent one. Query existing IDs and explain the known state before proposing a new quota-consuming task.

Receipts contain local paths and task metadata. They exclude access tokens and signed URLs, but should still be reviewed before sharing. JSON stdout is machine-readable; failure JSON is on stderr with a nonzero exit code.
