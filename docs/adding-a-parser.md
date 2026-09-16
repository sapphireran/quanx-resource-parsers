# Adding another personal parser

This repo started with one provider. A second parser is worth adding only
when a *personal* subscription is distributed as a full Quantumult X
configuration (or another blob that is not already a server resource).

Do not add parsers for employers, clients, or shared team profiles.

## Checklist

1. **Confirm the product gap.** If the provider already offers a Quantumult X
   server-only subscription, use that. A parser is a workaround.
2. **Keep secrets out.** The new script gets the same header comment as
   `nexitally-node-parser.js`: no URL, no account id, no password.
3. **One file, ES5-friendly.** No `require`, no fetch, one `$done`.
4. **Add fixtures first.** Invent a full-config `input.conf` that shows the
   section you will extract, plus at least one failure case.
5. **Reuse the runner.** Point a new directory under `examples/<name>/cases/`
   or extend `examples/scripts/lib/cases.js` if the layout changes.
6. **Document the why.** A short `docs/<name>.md` that states what the
   official download overwrites and how to attach the parser.

## Suggested skeleton

```js
/*
 * Quantumult X resource parser for <provider> managed full configurations.
 *
 * Contains no subscription URL, account identifier, node password, or
 * other private information.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

var match = text.match(/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i);

if (!match) {
  $done({ error: "<provider> parser: [server_local] section was not found." });
} else {
  // filter lines — copy the Nexitally approach unless the provider format differs
  $done({ content: /* joined server lines */ });
}
```

Change the section name if the provider uses `[Server]` or a JSON body.
If the body is JSON, `JSON.parse` inside a `try/catch` and `$done({ error })`
on failure. Do not add a dependency.

## Tests that should exist on day one

| Case | Purpose |
| --- | --- |
| typical full config | Happy path, mixed sections |
| placeholders | Traffic / expiry rows dropped |
| missing section | Clear error |
| empty section | Clear error |
| section boundaries | No leak from the next `[…]` block |

Wire them the same way as `examples/nexitally/cases/*` so
`verify-examples.js` stays the only command to remember.

## Profile attachment

Each parser that needs a different URL still shares one
`resource_parser_url` in Quantumult X. The app uses a single global parser
for every `opt-parser=true` resource.

Consequences:

- A second parser file is useful when you **switch** the global URL, or
  when you keep two Quantumult X profiles (one per provider).
- A single parser that understands both full-config shapes is better if
  both resources are refreshed inside one profile.

Do not try to download a second JavaScript file from inside the parser.
The VM is not a package manager.
