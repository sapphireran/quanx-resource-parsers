# Local testing

Quantumult X is the only runtime that matters in production, but the parser is ordinary JavaScript plus two globals. `test/harness.js` provides those globals in Node so examples stay honest.

## Requirements

- Node.js 18 or later (no npm dependencies)
- The repository root as the working directory

```bash
node test/nexitally-node-parser.test.js
# or
npm test
```

## Parse one file

```bash
node test/harness.js examples/nexitally/full-config.sample.conf
node test/harness.js --json test/fixtures/missing-server-local.conf
```

Exit status is `1` when the parser returns `{ error }`, `2` when usage is wrong, `0` on a content result.

## How the shim works

`vm.runInNewContext` loads `nexitally-node-parser.js` with:

```js
{
  $resource: { content, link, info, tag, user_agent },
  $done: function (value) { /* capture */ }
}
```

The parser file is not rewritten. If someone adds a second `$done` call, the harness throws. If `$done` is never called, the harness throws. Timeouts are 5 seconds, which is far above a linear scan of a profile.

This is **not** a full Quantumult X emulator. It will not:

- Download URLs
- Honor `#in=` / `#rename=` hash parameters (this parser ignores them anyway)
- Apply `as-policy=` or `resource-tag-regex`
- Implement `$notify`

Those behaviors belong to the app. The harness only checks the extract/filter/dedupe logic.

## Golden files

Documented samples live under `examples/nexitally/`:

| Input | Expected `$done({ content })` |
| --- | --- |
| `full-config.sample.conf` | `full-config.expected.txt` |
| `mixed-protocols.sample.conf` | `mixed-protocols.expected.txt` |

Error cases and leak tests live under `test/fixtures/`. Expected content, when needed, uses the same `*.expected.txt` suffix.

When you change filter regexes in `nexitally-node-parser.js`, run the suite. If a sample’s meaning changed, update the matching `expected.txt` in the same commit and mention why in the commit message.

## Regenerating an expected file

```bash
node test/harness.js examples/nexitally/full-config.sample.conf \
  > examples/nexitally/full-config.expected.txt
```

Inspect the diff. Do not redirect first and ask questions later — quota rows accidentally kept would be committed as “correct”.

## Adding a fixture checklist

1. Use only `example.com` (or other documentation hosts) and obviously fake secrets.
2. State in a header comment what the file is proving.
3. Cover one behavior. A kitchen-sink file already exists (`full-config.sample.conf`).
4. Wire it in `test/nexitally-node-parser.test.js`.
5. Run `npm test`.

## CI

`.github/workflows/test.yml` runs the same Node command on pushes and pull requests. A failing golden file should fail the pull request.
