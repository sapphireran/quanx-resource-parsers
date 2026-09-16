# Folio bench

A desktop stand-in for Quantumult X's resource-parser sandbox.

## Commands

```bash
npm test
node bench/run.js --dump examples/cases/managed-full-profile.conf
node bench/run.js --why "anytls=example.com:443, password=pwd, tag=HK-Preset-01"
npm run gallery
```

`--check` does four things:

1. Evaluates `nexitally-node-parser.js` in a Node `vm` with `$resource` / `$done`.
2. Walks the same keep/drop rules and fails if the classifier drifts from `$done`.
3. Asserts the parser file still contains the regex literals in `bench/rules.js` and never mentions `$resource.link`.
4. Scans the tree for live-looking URLs, then confirms `bench/gallery.html` and `docs/keep-drop-matrix.md` match the current fixtures.

## Privacy contract

`$resource.link` is a Proxy trap. The committed parser must only read `$resource.content`. Quantumult X, not this repo, downloads the private Nexitally URL.

## Files

| path | role |
| --- | --- |
| `rules.js` | Regexes mirrored from the parser |
| `sandbox.js` | `vm` + `$resource` / `$done` |
| `classify.js` | Per-line reason codes |
| `secrets.js` | URL / live-hint scan |
| `gallery.js` | Static HTML renderer |
| `run.js` | CLI |
| `gallery.html` | Generated gallery (open locally) |
