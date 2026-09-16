# Resource parser environment

Quantumult X downloads a remote resource, then optionally runs a JavaScript
parser against the response body. The parser is **not** a Node program. It
runs in a small app-provided VM.

This note records the contract the Nexitally parser relies on. Official
Quantumult X builds evolve; if a field below disappears, the local example
runner in `examples/scripts/lib/run-parser.js` should be updated to match.

## How Quantumult X invokes a parser

1. The profile sets a global parser in `[general]`:

   ```ini
   resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
   ```

2. A `[server_remote]` (or filter / rewrite remote) line sets `opt-parser=true`.
3. Quantumult X GETs the remote URL on its own. The parser never sees the
   HTTP client and must not try to open a socket.
4. The VM loads the parser source and injects globals.
5. The script calls `$done({ … })` exactly once.

Pinning `@main` follows whatever is on the default branch. For a personal
profile that should not move underfoot, pin a commit SHA instead of `@main`.

## Injected globals used here

| Name | Role |
| --- | --- |
| `$resource.content` | Raw response body as a string. May include a UTF-8 BOM and CRLF. |
| `$done(result)` | Finish the parse. Must be called once. |

`$resource` can also expose the request URL and other metadata in some
Quantumult X versions. This parser ignores those fields on purpose: the
subscription URL is private and must not be logged or rewritten into the
output.

## Result object

Success:

```js
$done({ content: "anytls = …\nshadowsocks = …" });
```

Failure:

```js
$done({ error: "Nexitally parser: [server_local] section was not found." });
```

`content` is a newline-separated list of Quantumult X server lines. It is
**not** a full configuration. Quantumult X inserts those lines into the
server resource identified by the `[server_remote]` tag.

Do not wrap the result in `[server_local]` or `[server_remote]` headers.
Do not emit JSON.

## What the VM does not provide

Assume these are missing unless a later Quantumult X build documents them:

- `require`, `import`, `fs`, `path`, `http`, `https`
- `process`, `Buffer`, `setTimeout` (do not depend on timers)
- `console.log` visible to the user (errors go through `$done({ error })`)
- any persistent storage

The parser is therefore a single file of ES5-friendly JavaScript. The local
runner evaluates it with `vm.runInNewContext` and only injects `$resource`
and `$done`, which is a closer match than running the file under Node's
default globals.

## Input hygiene the parser must do itself

Remote bodies are messy:

- UTF-8 BOM (`U+FEFF`) at byte 0
- CRLF from Windows-side dashboards
- Comments starting with `#`, `;`, or `//`
- Duplicate server lines after a provider regenerates the list
- Info-only rows that look like servers (`tag=Traffic: …`)

`nexitally-node-parser.js` strips the BOM, normalizes newlines, then filters.
The `comments-duplicates-crlf` example exists so those steps stay covered.

## Timeouts and size

Keep the script small and linear. Quantumult X will not wait on a huge regex
backtrack. The section extractor is a single scan of the body; per-line work
is a handful of regex tests. If a future parser needs JSON parsing, prefer
`JSON.parse` on a bounded string over nested regular expressions.
