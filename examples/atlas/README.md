# Parser atlas

Each case under `cases/<id>/` is a closed example of [`nexitally-node-parser.js`](../../nexitally-node-parser.js).

```
cases/<id>/
  input.conf              # synthetic Quantumult X (or HTML / YAML) body
  expected.txt            # kept server lines, or
  expected-error.txt      # exact $done({ error }) text
  notes.md                # why the case exists
```

[`catalog.json`](catalog.json) is the machine-readable index. [`annotated-walkthrough.md`](annotated-walkthrough.md) walks the managed-full-profile case line by line.

## Commands

```bash
# Replay every case through the real parser file and the tracer
npm test

# Print keep / drop reason codes for one file
node scripts/atlas.js trace examples/atlas/cases/managed-full-profile/input.conf

# Print the $done payload for one file
node scripts/atlas.js run examples/atlas/cases/glued-header/input.conf

# Markdown table of every case
node scripts/atlas.js gallery
```

## Adding a case

1. Create `cases/<id>/` with `input.conf`, `notes.md`, and either `expected.txt` or `expected-error.txt`.
2. Append an entry to `catalog.json`.
3. Run `npm test`.

The harness fails if:

- the real parser and the tracer disagree;
- a case is on disk but missing from the catalog;
- the catalog lists a case that has no input file;
- expected output does not match.

Use only `example.com` / `example.net` / `example.org` / `127.0.0.1` / `2001:db8::1` and the official sample placeholders.
