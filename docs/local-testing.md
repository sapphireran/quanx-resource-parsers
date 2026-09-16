# Local testing

Quantumult X is the real runtime. Node is the regression runtime. The two share one script: `nexitally-node-parser.js`.

## Requirements

- Node.js 18 or newer
- No npm dependencies
- No network

## Commands

```bash
npm test
# same thing:
node scripts/verify-examples.js

# one file, Quantumult X-style server lines on stdout
node scripts/run-parser.js examples/nexitally/happy-path/input.conf

# one file, full $done payload
node scripts/run-parser.js --json examples/nexitally/missing-server-local/input.conf

# reintroduce a BOM and Windows newlines (how the crlf-and-bom fixture is tested)
node scripts/run-parser.js --transform bom-crlf examples/nexitally/crlf-and-bom/input.conf
```

Exit codes for `run-parser.js`:

| Code | Meaning |
| --- | --- |
| 0 | `$done({ content })` |
| 1 | `$done({ error })` |
| 2 | usage, I/O, or harness failure (parser never called `$done`) |

## What the harness actually mocks

`scripts/lib/qx-parser-harness.js` creates a `vm` sandbox:

```js
{
  $resource: { content, link, info, tag, user_agent },
  $done(value) { /* capture */ },
  $notify() {},
  console
}
```

It then `runInNewContext` the parser file. That is enough for this script because the parser only reads `$resource.content` and calls `$done`.

The harness is **not**:

- a JavaScriptCore clone of Quantumult X
- an HTTP client
- a subscriber to Nexitally
- a place to put account cookies

Timeout is two seconds. The parser must stay a single synchronous pass.

## Fixture layout

```text
examples/nexitally/
  manifest.json          // cases[]: name, input, expected | expectedError, optional transform
  happy-path/
    input.conf
    expected.txt
  missing-server-local/
    input.conf
    expected-error.txt
  crlf-and-bom/
    input.conf           // stored as LF
    expected.txt
```

`transform` values:

| Value | Effect before `$resource.content` is set |
| --- | --- |
| omitted / `none` | use the file bytes decoded as UTF-8 |
| `bom` | strip any existing BOM, then prefix U+FEFF |
| `crlf` | normalize to LF, then LF → CRLF |
| `bom-crlf` | both of the above |

Keeping CRLF fixtures as LF in git avoids noisy diffs. The transform is part of the spec; `verify-examples.js` applies it the same way every run.

## Adding a case

1. Create `examples/nexitally/<name>/input.conf` with placeholder hosts only.
2. Produce the expected payload:

   ```bash
   node scripts/run-parser.js examples/nexitally/<name>/input.conf \
     > examples/nexitally/<name>/expected.txt
   ```

   For an error case, write the exact error string into `expected-error.txt`.
3. Append an object to `cases` in `manifest.json`.
4. Describe the case in `examples/README.md`.
5. Run `npm test`.

If the parser behavior is wrong, fix the parser, not the expected file. If the behavior change is deliberate, update the expected file and the docs in the same change.

## Redacting a real download (stay off git)

When a device refresh fails, you may want to run the parser on the body Quantumult X saw.

1. Copy the response to a file **outside this repository**.
2. Replace every hostname, password, UUID, and URL with the substitutions in [privacy.md](privacy.md).
3. Confirm the redacted file still has `[server_local]` and the same *kind* of lines (anytls vs comments vs traffic).
4. Run `node scripts/run-parser.js --json /tmp/redacted.conf`.
5. Delete the file. Do not `git add` it.

The public fixtures already cover the branches in the script. A redacted local file is only for "what did the vendor send today?"

## Why not a browser test

There is no web UI. The closest stand-in for a device refresh is `npm test` plus `run-parser.js` on the happy-path fixture. That is what CI-less personal use should run after every parser edit.
