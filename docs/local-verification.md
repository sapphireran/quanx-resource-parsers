# Local verification

Quantumult X is the only runtime that matters in production. Node is used here so fixtures stay honest without pasting a private URL into the app every time the keyword list changes.

## Requirements

- Node.js 18 or newer (the scripts use `node:fs` / `node:vm` and no npm dependencies)
- A checkout of this repository

`npm install` is unnecessary. `package.json` only defines script aliases.

## Commands

```bash
# Print kept server lines, or exit 1 with the parser error
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sample.conf

# Same result as JSON { ok, kind, content|error, servers, serverCount }
node scripts/run-parser.js --json examples/fixtures/nexitally-missing-server-local.sample.conf

# Compare every examples/cases.json entry to its expected file
npm run verify
# or
node scripts/verify-examples.js

# Print case names and notes
npm run verify:list
```

## What the runner emulates

`scripts/run-parser.js` loads `nexitally-node-parser.js` in a fresh `vm` sandbox with:

| Global | Local stand-in |
| --- | --- |
| `$resource.content` | File bytes decoded as UTF-8 (BOM preserved so the parser can strip it) |
| `$resource.link` | Absolute path of the fixture |
| `$resource.tag` | `"Nexitally"` |
| `$resource.info` | `""` |
| `$resource.user_agent` | `""` |
| `$done` | Records the object and forbids a second call |
| `$notify` | No-op |

It does not implement Quantumult X UI, notifications, or User-Agent retry.

## What `verify` checks

For `expect.type = "content"`:

- `$done` returned `{ content }`
- the trimmed, LF-normalized string equals the expected file

For `expect.type = "error"`:

- `$done` returned `{ error }`
- the trimmed error string equals the expected file

The manifest is `examples/cases.json`. Adding a case is described in `examples/README.md`.

## Suggested personal loop

1. Change a fixture or the parser.
2. `node scripts/run-parser.js` on the smallest fixture that shows the change.
3. Update the matching `expected/` or `expected-errors/` file only when the new output is intentional.
4. `npm run verify`.
5. Refresh the Quantumult X server resource on a device before treating the change as done.

## Encoding notes

`examples/fixtures/nexitally-full-config.crlf-bom.sample.conf` is generated with a UTF-8 BOM and `CRLF`. Do not "fix" it to LF in an editor. If an editor strips the BOM, regenerate:

```bash
node -e '
const fs = require("fs");
const src = fs.readFileSync("examples/fixtures/nexitally-full-config.sample.conf", "utf8");
fs.writeFileSync(
  "examples/fixtures/nexitally-full-config.crlf-bom.sample.conf",
  "\uFEFF" + src.replace(/\n/g, "\r\n")
);
'
```

## Failure that is not a parser bug

If `verify` fails because a new keyword should be excluded, that is a product change: update the parser, add a fixture that would have leaked, and record the keyword in `docs/nexitally-node-parser.md`.

If `verify` fails because someone committed a live host, delete the fixture. Do not "fix" it by redacting in place if the secret was already pushed — rotate the node credential instead and rewrite the history only if you know you need to.
