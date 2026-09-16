# Nexitally parser examples

These fixtures are **fictional** Quantumult X documents. They exist so the Nexitally parser can be exercised without a live subscription.

Every hostname uses the reserved `example.invalid` suffix. Passwords are the literal string `placeholder-password` or the documented Quantumult X sample values. Do not replace them with a real Nexitally URL, account id, or node password in a commit, gist, or issue.

## What a Nexitally download looks like

Nexitally's **Configuration File → Download** action returns a *full* Quantumult X profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, and so on. Re-importing that file replaces the active profile.

The parser treats that download as a `[server_remote]` payload. It keeps only usable rows from `[server_local]` and drops:

- comments (`;`, `#`, `//`)
- empty lines
- traffic / expiry / reset / days-left banners (English and Chinese)
- `[Premium]` placeholder nodes
- exact-line duplicates

The surrounding policy and filter sections are ignored on purpose. They stay in *your* local profile.

## Cases

| Id | Input | Expected behavior |
| --- | --- | --- |
| `typical-full-profile` | Full sanitized profile with nodes, banners, comments, and a duplicate | Three server lines, in source order |
| `mixed-protocols` | All currently accepted prefixes plus unsupported types | Seven server lines; WireGuard / Hysteria2 / SSR dropped |
| `placeholders-and-duplicates` | Traffic, expire, reset, Chinese banners, Premium rows, duplicates | Two usable AnyTLS lines |
| `spacing-and-case` | Indented `[server_local]`, mixed-case prefixes, spaces around `=` | Three lines preserved as written (after trim) |
| `crlf-and-bom` | UTF-8 BOM + CRLF line endings | Same two servers as a normal LF file |
| `server-local-at-eof` | `[server_local]` is the last section | Reads through end of file |
| `missing-server-local` | Policy / remote servers only | Error: section not found |
| `no-usable-servers` | Comments, banners, unsupported types | Error: no usable entries |

The machine-readable list lives in [`manifest.json`](manifest.json).

## How to run them

From the repository root, with Node.js 18+:

```bash
node scripts/check-examples.js
node scripts/run-parser.js examples/nexitally/typical-full-profile.conf
```

`check-examples.js` loads `nexitally-node-parser.js` inside a Quantumult X-shaped sandbox (`$resource` / `$done`) and compares each case to its expected file or error fragment.

## Adding a fixture

1. Write a sanitized `.conf` under this directory.
2. If the case should succeed, add a sibling `*.expected.txt` that is **only** the server lines the parser must emit, joined by `\n` and ending with a newline.
3. Register the case in `manifest.json`.
4. Run `node scripts/check-examples.js`.

Never paste a real subscription body into a fixture. If you need a new edge case, invent hosts under `example.invalid`.

`crlf-and-bom.conf` is marked `-text` in `.gitattributes` so Git does not strip the UTF-8 BOM or rewrite CRLF to LF.
