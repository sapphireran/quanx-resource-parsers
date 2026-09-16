# 07 — Local workbook

The workbook evaluates the committed parser with the same globals Quantumult X injects. It does not download anything.

## Commands

```bash
npm test              # workbook + secrets scan
npm run workbook      # cases only
npm run trace         # keep/drop reason for every input line
npm run book          # rebuild workbook/book.html
npm run materialize   # write workbook/cases/<id>/ from cases.cjs
npm run scan          # secrets scan only
```

Node 18+ is enough. There are no npm dependencies.

## Layout

| Path | Role |
| --- | --- |
| `workbook/cases.cjs` | Source of truth: id, title, input, expected |
| `workbook/cases/<id>/` | Materialized `input.conf`, `expected.txt` / `expected-error.txt`, `notes.md` |
| `workbook/sandbox.cjs` | `$resource` / `$done` + `vm` isolate |
| `workbook/run.js` | Compares parser output to expected |
| `workbook/trace.js` | Prints the decision catalog for one or all cases |
| `workbook/scan-secrets.js` | Rejects live URLs and non-documentation secrets |
| `workbook/build-book.js` | Static HTML gallery |
| `workbook/profiles/` | Copy-paste Quantumult X snippets with placeholders |

## Adding a case

1. Append an object to `CASES` in `workbook/cases.cjs`.
2. Run `node workbook/run.js --update` only if you intend to snapshot a new expected value after changing the parser. Prefer writing `expected` by hand from [05 — Keep / drop catalog](05-keep-drop-decision-catalog.md).
3. `npm run materialize`
4. `npm test`

## What “pass” means

For `expect: "content"`, the parser must `$done({ content })` with exactly the joined expected lines (LF, no trailing newline).

For `expect: "error"`, the parser must `$done({ error })` with exactly the expected message.

The harness fails if the parser calls `$done` twice, throws, or returns an unexpected shape.

## Viewing the book

```bash
python3 -m http.server --directory workbook 8765
```

Open `http://127.0.0.1:8765/book.html`. The page is static: case bodies are inlined at build time so it also works from a local file URL.
