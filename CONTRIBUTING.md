# Contributing (personal)

This is a personal repository. The notes below are for future-me, and for anyone who opens a PR with a redacted fixture rather than a live subscription.

## Scope

In scope:

- Docs and examples that explain the existing Nexitally parser
- Fixtures that lock current behavior
- Small, fixture-covered parser fixes (a new protocol prefix, a narrower exclude regex)

Out of scope:

- Company code, internal tooling, or work profiles
- General Clash / Surge converters
- Anything that embeds a real Nexitally URL or node line

## How to add an example

1. Invent hosts under `.example.invalid`.
2. Use placeholder secrets (`example-password`, `pwd`, official Quantumult X Reality demo values).
3. Add `examples/nexitally/<name>.conf` plus exactly one of `<name>.expected.txt` or `<name>.error.txt`.
4. Describe the case in [`examples/README.md`](examples/README.md).
5. Run `npm test`.

The test harness evaluates `nexitally-node-parser.js` inside a `vm` sandbox. Do not copy the regexes into the test file. If a fixture needs BOM or a missing trailing newline, mark the file `binary` in [`.gitattributes`](.gitattributes) so Git does not rewrite it.

## How to change the parser

Change the script, update or add fixtures in the same commit, and run `npm test`. Keep the file free of `$resource.link`, `$resource.info`, `$notify`, `$task`, and `$persistentStore` — `tests/harness.js` rejects those strings.

## Privacy review before you commit

```bash
git diff
git grep -nE 'https?://[^[:space:]]+' examples docs README.md
npm test
```

Read [`docs/privacy.md`](docs/privacy.md). If a secret was committed, rotate the provider URL; rewriting history is not enough on a public clone.
