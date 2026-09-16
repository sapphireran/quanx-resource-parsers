# Personal Quantumult X parser notes

This folder is personal documentation for
[`sapphireran/quanx-resource-parsers`](https://github.com/sapphireran/quanx-resource-parsers).
It is not a company handbook and it does not ship secrets.

The repository exists because some providers, including Nexitally, publish a
**full Quantumult X configuration** instead of a server-only resource. Importing
that file replaces the active profile. A resource parser can keep the local
profile and refresh only the server list.

## Contents

| Document | What it covers |
| --- | --- |
| [quantumult-x-parser-runtime.md](quantumult-x-parser-runtime.md) | `$resource`, `$done`, `opt-parser`, and what a parser may not do |
| [nexitally-node-parser.md](nexitally-node-parser.md) | How the Nexitally `[server_local]` extractor works |
| [qx-server-line-cheatsheet.md](qx-server-line-cheatsheet.md) | Example Quantumult X server lines used in this repo |
| [privacy-and-safety.md](privacy-and-safety.md) | What must never be committed |
| [troubleshooting.md](troubleshooting.md) | Failures seen when wiring the parser into a local profile |
| [example-catalog.md](example-catalog.md) | Every checked-in fixture and the expected parser result |

Runnable copies of those fixtures live in [`../examples`](../examples).

## How to read this with the code

1. Read [quantumult-x-parser-runtime.md](quantumult-x-parser-runtime.md) so the
   Quantumult X contract is clear.
2. Read [nexitally-node-parser.md](nexitally-node-parser.md) for the extraction
   rules.
3. Open [`../nexitally-node-parser.js`](../nexitally-node-parser.js) next to
   [`../examples/nexitally/managed-full-config.conf`](../examples/nexitally/managed-full-config.conf).
4. Run `node scripts/check-examples.js` from the repository root. The checker
   loads the same parser Quantumult X would run.

## Scope

This repository currently maintains one production parser:

- `nexitally-node-parser.js` — extract `[server_local]` from a managed full
  configuration and return Quantumult X server lines for `[server_remote]`.

Examples may include extra Quantumult X sections (`[policy]`, `[filter_local]`,
`[rewrite_remote]`) so the parser can prove it **discards** them. Those extra
sections are fixtures, not a recommended public profile.
