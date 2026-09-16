# Personal parser lab

Local toolkit for `nexitally-node-parser.js`. Nothing here talks to Nexitally or any other provider. Fixtures are sanitized Quantumult X text.

## Commands

```bash
npm test
node lab/run.js --dump lab/fixtures/nexitally-style-full.conf
node lab/run.js --explain lab/fixtures/nexitally-style-full.conf
node lab/run.js --matrix
node lab/run.js --gallery
```

`npm test` loads the real parser inside a Node `vm` sandbox with Quantumult X-shaped `$resource` / `$done` globals. `$resource.link` throws if the script ever tries to read the private URL.

## Layout

| Path | Role |
| --- | --- |
| [`harness.js`](harness.js) | Sandbox + line explainer |
| [`run.js`](run.js) | CLI |
| [`fixtures/catalog.json`](fixtures/catalog.json) | Fixture index |
| [`fixtures/`](fixtures/) | Input / expected pairs |
| [`profiles/`](profiles/) | Copy-paste Quantumult X snippets |
| [`gallery.html`](gallery.html) | Generated keep/drop gallery |

## Adding a fixture

1. Add `lab/fixtures/<id>.conf` using only `.example.invalid` hosts and placeholder secrets.
2. Add `.expected.txt` (parser content) or `.error.txt` (exact `$done({ error })` string).
3. Register the pair in `catalog.json`.
4. Run `npm test`.
5. Refresh `docs/keep-drop-matrix.md` and `lab/gallery.html` with `--matrix` and `--gallery`.

Do not paste a live Nexitally export into this folder.

## Why a lab instead of only a README

The keep/drop rules are short, but they interact: section boundaries, `[Premium]` as a later header, Chinese vs English info rows, and the `Reset` substring. The catalog is the source of truth. The README should link here rather than restate every edge case.
