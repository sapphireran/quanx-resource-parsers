# Local replay

Quantumult X is the only runtime that matters on a device. The Node scripts in `scripts/` exist so this personal repo can **document and lock** the sieve without submitting a live URL to anyone.

## Commands

```bash
# One file → content or error on stdout
node scripts/replay.js examples/fixtures/managed-full-profile/input.conf

# Same file, with a keep/drop table
node scripts/replay.js examples/fixtures/managed-full-profile/input.conf --annotate

# Every catalog entry
node scripts/verify.js

# Markdown table of every fixture (stdout)
node scripts/replay.js --catalog --report
```

`npm test` is an alias for `node scripts/verify.js`.

## What the sandbox provides

`scripts/replay.js` reads `nexitally-node-parser.js` and evaluates it in a `vm` context with:

- `$resource.content` — file bytes, after optional catalog encode flags
- `$resource.link` / `.tag` / `.info` / `.user_agent` — empty strings unless you pass flags
- `$done(result)` — captured once; a second call is a hard failure
- `$notify` — no-op

It does not implement `$task`, `$httpClient`, or `$prefs`. The production script does not use them.

## Annotation uses the parser's own regexes

`--annotate` does not guess. It **extracts** the three regular expressions from the parser source (`section`, `supported`, `excluded`) plus the comment prefix the `filter` callback uses, then walks the same steps the script walks. If someone edits a regex and forgets the fixtures, verify fails. If someone edits a regex and the extractor cannot find it, replay refuses to annotate.

That is the whole point of a source-faithful companion: the docs are allowed to be wrong only if the extractor is wrong, and the extractor is a literal read of the file.

## Catalog encode flags

Some fixtures are stored as readable LF files and **re-encoded at load time**:

| Flag | Effect |
| --- | --- |
| `encode.bom: true` | Prepend U+FEFF |
| `encode.newlines: "crlf"` | `\n` → `\r\n` |
| `encode.newlines: "cr"` | `\n` → `\r` |

See `examples/catalog.json`. The on-disk `input.conf` stays grep-friendly.

## What we never do in replay

- Fetch `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`
- Read `$resource.link` from a real profile
- Write node passwords into the report beyond what the fixture already contains (and fixtures only contain placeholders)

If you want to replay a **private** download, save it outside the repo and pass the path to `replay.js`. Do not add that file to git.
