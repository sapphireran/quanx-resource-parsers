# Adding another personal parser

Keep this repo personal. A second script belongs here only if it extracts servers from **your** managed full configuration for another personal provider — not from work, and not from a live URL baked into the file.

## Contract

1. Content-only: read `$resource.content`. Do not read `$resource.link`.
2. Return Quantumult X server lines or a `$done({ error })` string.
3. Ship invented fixtures **before** changing keep/drop rules.
4. Never commit a subscription URL, account id, or live password.

## Suggested layout

```
<provider>-node-parser.js
examples/cases/<provider>-*.conf
docs/<provider>-pipeline.md
```

Add a `bench/rules-<provider>.js` only if the keep/drop regexes differ. Reuse `bench/sandbox.js`; it already injects `$resource` / `$done` and traps `link`.

## Fixture first

Copy the smallest failing vendor shape you care about, replace hosts with `*.example.invalid`, and pin a `.keep` sidecar or an `expect.error` string in `examples/manifest.json`. `npm test` must pass on the laptop before you refresh the phone.

## What not to add

- A general Clash / Surge converter. That is a different project.
- KOP-XIAO-style parameterized rewrite/filter parsing. This repo stays server-extraction-only.
- Company office, lab, or client profiles.

If Nexitally (or the new provider) ships an official server-only Quantumult X subscription, delete the parser instead of extending it.
