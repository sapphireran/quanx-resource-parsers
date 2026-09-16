# Examples

Sanitized Quantumult X snippets for this personal repository. They exist so the Nexitally parser can be inspected, copied, and regression-checked without a live subscription.

Nothing in this directory is a working Nexitally account. Hosts use `example.com` and documentation IPv4 (`203.0.113.0/24`). Passwords, UUIDs, and Reality material are placeholders copied from the official Quantumult X `sample.conf` style. Do not replace these files with a real Configuration File download.

## Layout

| Path | What it is |
| --- | --- |
| [`fixtures/nexitally-full-config.sanitized.conf`](fixtures/nexitally-full-config.sanitized.conf) | A managed **full** Quantumult X profile in the shape Nexitally emits: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, rewrite, MITM. Line-by-line reading guide: [`fixtures/ANNOTATED.md`](fixtures/ANNOTATED.md). |
| [`fixtures/nexitally-parsed-servers.expected.txt`](fixtures/nexitally-parsed-servers.expected.txt) | Server-only text the parser should return from that full profile. |
| [`fixtures/comments-and-duplicates.conf`](fixtures/comments-and-duplicates.conf) | Comments, blank lines, and an exact duplicate server line. |
| [`fixtures/mixed-protocols.conf`](fixtures/mixed-protocols.conf) | One line each of AnyTLS, Shadowsocks, VMess, VLESS, Trojan, HTTP, and SOCKS5. |
| [`fixtures/crlf-and-bom.conf`](fixtures/crlf-and-bom.conf) | UTF-8 BOM plus CRLF line endings. |
| [`fixtures/unsupported-lines.conf`](fixtures/unsupported-lines.conf) | A supported server mixed with `wireguard` / `hysteria2` lines the parser ignores. |
| [`fixtures/missing-server-local.conf`](fixtures/missing-server-local.conf) | Full-looking profile with no `[server_local]` section. |
| [`fixtures/empty-server-local.conf`](fixtures/empty-server-local.conf) | `[server_local]` present but only comments and placeholders. |
| [`fixtures/premium-and-traffic-only.conf`](fixtures/premium-and-traffic-only.conf) | Only `[Premium]`, traffic, and expiry placeholder lines. |
| [`local-profile/quantumult-x-local.snippet.conf`](local-profile/quantumult-x-local.snippet.conf) | How a **personal** Quantumult X profile wires the parser. |
| [`parser-template.js`](parser-template.js) | Minimal custom resource-parser skeleton, not used in production. |

## How to use the fixtures

On a machine with Node.js:

```bash
npm test
```

That loads `nexitally-node-parser.js` in a Quantumult X-shaped sandbox (`$resource` / `$done`) and compares each fixture to the matching `*.expected.txt` or expected error.

To inspect one file by hand:

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sanitized.conf
```

## How this maps to Quantumult X

1. Quantumult X downloads **your** private Nexitally Configuration File URL as a `[server_remote]` resource.
2. Because `opt-parser=true`, it feeds the response body into `$resource.content`.
3. This parser keeps only usable `[server_local]` server lines.
4. Quantumult X treats that returned text as the server resource.

The sanitized full-config fixture is a stand-in for step 1. The expected files are a stand-in for step 3.

## What never belongs here

- The Nexitally Configuration File download URL
- Account IDs, invoices, or traffic numbers from a real dashboard
- Real node hostnames, passwords, or Reality keys
- A complete personal Quantumult X profile that includes those values

If you want to debug a live parse failure, copy the remote response to a **private** file outside this repository and run `node scripts/run-parser.js /path/to/private.conf`. See [docs/security.md](../docs/security.md).
