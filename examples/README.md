# Examples

Personal, synthetic Quantumult X files for this repository. They exist so the Nexitally parser can be explained and checked without a phone and without a live subscription.

## Layout

| Path | What it is |
| --- | --- |
| `nexitally/` | Fixtures for `nexitally-node-parser.js`, including success and error cases |
| `generic-server-local/` | Teaching parser that extracts `[server_local]` without Nexitally filters |
| `profile-snippets/` | Copy-paste `[general]`, `[server_remote]`, and `[policy]` fragments |

Each fixture directory that should be checked has a `manifest.json`. `scripts/check-examples.js` walks those manifests.

## Run every example

From the repository root, with Node.js 18 or newer:

```bash
npm test
```

Or:

```bash
node scripts/check-examples.js
```

Parse one file and print the Quantumult X `$done` result:

```bash
node scripts/run-parser.js \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/happy-path.conf

node scripts/run-parser.js --json \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/placeholders-only.conf
```

## Rules for adding examples

1. Use `example.com` or `example.invalid` hosts only.
2. Use obvious fake secrets (`example-password`, reserved UUIDs).
3. Never paste a Nexitally URL, account id, or a downloaded live profile.
4. Add both the input and the expected `$done` result.
5. Register the case in that folder's `manifest.json`.
6. Run `npm test` before committing.

See `docs/safety.md` and `docs/writing-a-parser.md` for the longer version.
