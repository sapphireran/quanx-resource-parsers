# Local harness

Quantumult X is not required to inspect what `nexitally-node-parser.js` will emit. Node 18+ is enough.

## Run one file

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.conf
node scripts/run-parser.js --json examples/fixtures/nexitally-missing-section.conf
```

Success prints server lines to stdout and exits `0`. A parser `$done({error})` is written to stderr and exits `1`.

`--json` wraps the same result:

```json
{
  "ok": true,
  "count": 5,
  "content": "anytls = ..."
}
```

## Check every committed example

```bash
npm run examples
# or
node scripts/check-examples.js
```

`examples/cases.json` lists fixture / expected pairs. Content cases compare `$done({content})`. Error cases compare `$done({error})`.

Regenerate expected files only after reading the diff and deciding the new output is correct:

```bash
npm run examples:update
```

## How the sandbox works

`scripts/lib/qx-parser-vm.js` reads the parser source and `vm.runInNewContext`s it with:

- `$resource.content`, `.link`, `.tag`, `.info`, `.user_agent`
- `$done` (exactly once)
- `$notify` as a no-op

There is no `$task`, `$httpClient`, or persistent store. That matches the official resource-parser limitation.

A 2 second timeout stops a parser that never calls `$done`.

## GitHub Actions

[`.github/workflows/examples.yml`](../.github/workflows/examples.yml) runs `node scripts/check-examples.js` on push and pull request.

## Private files

Replay a local download that must not be committed:

```bash
node scripts/run-parser.js private/nexitally-latest.conf
```

Do not add private files to `examples/cases.json`.
