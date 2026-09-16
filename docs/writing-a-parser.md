# Writing another personal parser

This repository is a small collection of **personal** Quantumult X resource
parsers. Add a new script only when a real local profile needs it. Do not
import company subscriptions, internal hosts, or work configuration files.

The Nexitally parser is the template: one input format, one output format,
no network calls, no secrets.

## Decide whether a new parser is warranted

Write a new file when the remote body is a different format, not when you
only want a different keep/drop list for Nexitally.

| Situation | Action |
| --- | --- |
| Same Nexitally full configuration, different excluded words | Fork `nexitally-node-parser.js` or add a documented regex change. |
| Another provider also publishes a Quantumult X **full** configuration | Copy the Nexitally structure, change the section/filter rules, give it a new filename. |
| Clash, Surge, or base64 subscription | Write a dedicated converter. Do not stretch the Nexitally regex. |
| Official server-only Quantumult X snippet | No parser. Use `[server_remote]` without `opt-parser`. |

## File layout

Keep the public surface small:

```text
<provider>-<purpose>-parser.js
docs/<provider>-parser.md
examples/<provider>/
  README.md
  input-*.conf
  expected-*.snippet
  edge-cases/
examples/manifest.json
```

Rules:

- One parser file at the repository root, matching the Nexitally script.
- Documentation that states the input format, keep/drop rules, and a
  no-secrets guarantee.
- Fictional fixtures that exercise the happy path and the error paths.
- A manifest entry so `tools/run-examples.js` runs the new cases.

Do not add a `src/` tree, a bundler, or a dependency just to share one
script with Quantumult X.

## Parser skeleton

Quantumult X evaluates the file as a script, not as a Node module. Use the
same globals as the official sample:

```javascript
/*
 * Quantumult X resource parser for <one personal input format>.
 *
 * Quantumult X fetches the private resource. This file only reads
 * $resource.content. It contains no subscription URL or account data.
 */

var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");

// extract, filter, dedupe

if (!usable) {
  $done({ error: "<parser name>: <specific failure>" });
} else {
  $done({ content: usable.join("\n") });
}
```

Stay on ES5-style JavaScript (`var`, `function`, no optional chaining) unless
you have confirmed the Quantumult X build you use supports newer syntax.

Never call HTTP APIs from the parser. The official sample states that HTTP
request and persistent storage APIs are unavailable here anyway.

## Keep the contract narrow

A server parser should return server lines only.

- Do not emit `[server_local]` or `[server_remote]` wrappers.
- Do not rewrite the user's `[policy]` groups.
- Do not log `$resource.link`. That value can be the private URL.
- Do not embed a default resource URL "for convenience."

Error strings should name the parser and the failed check. They should not
echo the private URL or a node password.

## Add fixtures before relying on a live refresh

For each new parser, add at least:

1. One typical success input and its exact expected snippet.
2. One missing-section or unknown-format input that returns `$done.error`.
3. One input where the section exists but every line is filtered.
4. One input that proves later INI sections do not leak.

Use only the placeholders in [privacy.md](privacy.md).

Register the cases in `examples/manifest.json`. The runner loads the
committed parser file and compares `$done` against the fixture.

```bash
node tools/run-examples.js
```

## Local Quantumult X wiring

Document the two local settings in the new README, using a placeholder URL:

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/<public-user>/<public-repo>@main/<parser>.js

[server_remote]
<YOUR_PRIVATE_RESOURCE_URL>, tag=<Name>, opt-parser=true, update-interval=21600, enabled=true
```

The `resource_parser_url` may be public. The resource URL must stay local.

## Review questions

Before committing a new parser:

1. Can a stranger read the script and learn an account URL or password? If
   yes, stop.
2. Does every fixture use `example.com` / TEST-NET / `pwd`?
3. Does the parser still do one job if you delete every comment?
4. Do the examples fail `node tools/run-examples.js` when you break the
   keep/drop rule on purpose?

If those answers are not clean, the script is not ready for this repository.
