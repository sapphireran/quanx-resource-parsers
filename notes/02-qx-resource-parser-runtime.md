# 02 — Quantumult X resource-parser runtime

`nexitally-node-parser.js` is written for the Quantumult X resource-parser sandbox, not for Node.js and not for a browser.

## Globals this parser uses

| Name | Role in this script |
| --- | --- |
| `$resource.content` | Response body Quantumult X already downloaded |
| `$done({ content })` | Replace the resource with the extracted server list |
| `$done({ error })` | Fail the refresh and surface a message in the app |

The script never reads `$resource.link`. That is deliberate: the parser must not depend on, log, or echo the private URL.

## Globals this parser does not use

Quantumult X also exposes `$task.fetch`, `$notify`, and (in other script types) `$prefs`. This parser is a pure function of `$resource.content`. Keeping it fetch-free means:

- it cannot leak the subscription URL to a third party;
- the workbook can evaluate the same file with a tiny `$resource` / `$done` stub.

## Success and failure shapes

```js
$done({ content: "anytls = jp.example.invalid:443, password=example-password, tag=JP-01\n…" });
$done({ error: "Nexitally parser: [server_local] section was not found." });
$done({ error: "Nexitally parser: no usable server entries were found." });
```

There is no partial success. Either the resource becomes a newline-separated server list, or the refresh fails.

## Text normalization Quantumult X will not do for you

The script itself:

1. coerces `$resource.content` with `String(… || "")`;
2. strips a leading UTF-8 BOM (`\uFEFF`);
3. rewrites `\r\n` to `\n`.

That is why the workbook's `bom-crlf` case still extracts servers. A managed file saved on Windows is a normal input, not a special profile type.

## What “running it in Node” means

`workbook/sandbox.cjs` defines `$resource` and `$done`, then `vm.runInNewContext`s the real parser file. That is an evaluation harness, not a reimplementation. If the parser script changes, the workbook exercises the new bytes.

Do not `require()` the parser from Node as a module. It is not a module: it reads globals and calls `$done`.
