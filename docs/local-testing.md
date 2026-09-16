# Local testing

Quantumult X is the only runtime that matters for a resource parser. The Node harness exists so fixtures can be checked on a desktop without pasting a live subscription into the app.

## Requirements

- Node.js 18+ (any current LTS is fine; the scripts use `fs`, `path`, and `vm` only)
- This repository, nothing installed from npm

## Commands

From the repository root:

```bash
npm test
node scripts/run-nexitally-parser.js examples/nexitally/typical-full-config.conf
node scripts/run-nexitally-parser.js examples/nexitally/missing-server-local.conf --json
```

`npm test` reads `examples/nexitally/cases.json` and compares each fixture to its `expected` file or `error` string.

## How the sandbox works

`scripts/lib/quanx-resource-parser.js` loads `nexitally-node-parser.js` into `vm.runInNewContext` with:

```js
{
  $resource: { content, link, info, tag, user_agent },
  $done: function (value) { /* capture */ },
  $notify: function () {},
  console: console
}
```

The parser file is not rewritten. A change to `$done` behavior in Quantumult X would require updating this sandbox.

Limits:

- No HTTP. A parser that called `$task.fetch` would throw.
- 5 second CPU timeout per run.
- `$done` must be called exactly once with an object.

## Adding coverage

Follow `examples/README.md`. Keep hosts on `example.invalid` and passwords fictional. After editing the parser's exclusion list or supported schemes, update both the matching fixture and [nexitally-parser.md](nexitally-parser.md).

## What this does not replace

- An on-device refresh of **Server Resources → Nexitally**
- Latency tests against real nodes
- AnyTLS compatibility of a specific Quantumult X build

Use the fixtures to lock extraction rules. Use the phone to confirm the resource imports.
