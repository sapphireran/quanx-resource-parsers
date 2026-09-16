# Local verification

Quantumult X is the only runtime that matters on a phone. The Node helpers in this repository exist so example files stay honest on a computer.

Requires Node.js 18 or newer. There are no npm dependencies.

## Check every fixture

```bash
npm test
```

or

```bash
node scripts/check-examples.js
```

The checker reads every `examples/*/manifest.json`, runs the named parser inside a Quantumult X-shaped sandbox (`$resource`, `$done`, `$notify`), and compares the result to the expected content or error string.

A passing run prints one `ok` line per case and a `passed` / `failed` summary.

## Parse one file

Print the returned server list:

```bash
node scripts/run-parser.js \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/happy-path.conf
```

Print the raw `$done` object, including errors:

```bash
node scripts/run-parser.js --json \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/missing-section.conf
```

## What the sandbox provides

`scripts/run-parser.js` uses Node's `vm` module. The parser source is executed with:

```javascript
{
  $resource: {
    content: "<file contents>",
    link: "https://example.invalid/nexitally-full-config",
    info: "",
    tag: "Nexitally",
    user_agent: ""
  },
  $done: function (value) { /* captured */ },
  $notify: function () {}
}
```

Manifest cases may override `$resource` fields through a `resource` object. The Nexitally fixtures do not, because the production script ignores those fields.

Optional `transforms` on a case:

| Name | Effect |
| --- | --- |
| `bom` | prefix a UTF-8 BOM |
| `crlf` | convert newlines to CRLF |

`happy-path-crlf-bom` uses both. The expected file is still the LF happy-path output, because the parser normalizes input.

## What local checks cannot prove

- That Quantumult X downloaded the live Nexitally URL successfully.
- That AnyTLS works on a given Quantumult X build.
- That a policy `resource-tag-regex` is wired the way you think.

Those still need a refresh on the device. Use the synthetic fixtures to prove the **script**, and the phone to prove the **subscription**.

## Adding a case

1. Write `examples/<parser>/fixtures/<name>.conf` with reserved example data.
2. Write the expected server list or decide the exact error string.
3. Append an object to that folder's `manifest.json`.
4. Run `npm test`.

See `docs/writing-a-parser.md` if the new case belongs to a new script.
