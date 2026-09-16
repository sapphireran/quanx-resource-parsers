# Writing a Quantumult X resource parser

This is a personal note on how `nexitally-node-parser.js` is structured,
for the next parser in this repository. It is not an official Quantumult
X SDK guide. The canonical sample is
[crossutility/Quantumult-X `resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js).

## Contract

Input:

- `$resource.content` — UTF-8 body of the URL Quantumult X fetched;
- `$resource.link` — that URL, including `#hash`;
- optionally `$resource.tag`, `$resource.info`, `$resource.user_agent`.

Output (exactly one `$done`):

- `{ content: "line\\nline" }` — success, Quantumult X format;
- `{ error: "human readable" }` — shown in the resource UI;
- `{ retry: { user_agent: "…" }, content or error }` — one UA retry
  (v1.5.6+). Unused here.

No HTTP, no `$persistentStore`, no `$notify` requirement. The function
should be referentially transparent given `(content, link)`.

## Keep one file Quantumult X can fetch

The app loads **one URL** of JavaScript. Bundlers, `import`, and
`node:fs` will not exist in that sandbox. Put the algorithm in the same
file the README tells people to subscribe to.

Node compatibility is an extra `module.exports` at the bottom, not a
second implementation.

## Stay conservative with syntax

Quantumult X uses JavaScriptCore. This repo uses `var` / `function` /
`RegExp` and avoids optional chaining, `const` in the parser file, and
ES modules. Tests may use whatever the local Node supports.

## Parse text, not HTML

If the provider wraps nodes in YAML, JSON, or HTML, decide explicitly
whether this repository should convert that format. The Nexitally parser
does not: it only understands Quantumult X `[server_local]` or a bare
list of Quantumult X server lines. A Clash converter is a different
script with different tests.

## Fail loud on empty output

Returning `{ content: "" }` looks like "zero nodes, success" and is easy
to miss in the UI. This parser returns `{ error }` when the section is
missing or every line was filtered. That is deliberate.

## Never put secrets in the script

The parser is fetched from GitHub on a public URL. Subscription hosts,
tokens, and live passwords belong in the on-device resource URL, not in
the script, README, or examples. See [Privacy](privacy.md).

## Test without the phone

1. Add a synthetic fixture under `examples/` with `.example.test` hosts.
2. Add the expected node list as `*.expected.txt`.
3. Cover the new branch in `tests/`.
4. `npm test`.

Only then refresh the resource in Quantumult X.

## Hash parameters

If you add a flag, document it in [hash-parameters.md](hash-parameters.md)
and parse it from `$resource.link` in `parseHashParams`. Do not invent a
second configuration channel. Do not collide with Shawn's flags unless
you intend to implement the same meaning.

## Checklist for a new parser file

- [ ] File-level comment: what provider, what it strips, what it never
      contains.
- [ ] Dual-mode `$done` / `module.exports`.
- [ ] Example fixture + expected snapshot.
- [ ] README row linking the raw GitHub URL.
- [ ] Privacy pass: no live URL, no live password.
