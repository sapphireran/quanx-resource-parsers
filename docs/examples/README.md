# Usage examples

These fixtures are the local stand-in for a Nexitally Quantumult X full-configuration download. They exist so the README and usage guide can show a complete before/after without copying a real account export.

## Run

From the repository root, with Node.js 18 or later:

```bash
node docs/examples/run-examples.js
```

The runner loads `nexitally-node-parser.js` inside a Quantumult X-shaped sandbox (`$resource` / `$done`), feeds each fixture, and compares the result with the committed expected files.

## Files

| File | Role |
| --- | --- |
| `nexitally-full-config.sample.conf` | Sanitized full configuration: `[server_local]` plus ignored policy, DNS, and filter sections. |
| `nexitally-server-remote.expected.txt` | Server lines Quantumult X should receive after the parser runs. |
| `quantumult-x.profile.snippet.conf` | Local profile fragment: parser URL, `opt-parser`, and policy tags. |
| `error-missing-section.sample.conf` | Profile with no `[server_local]`. |
| `error-missing-section.expected.txt` | Exact `$done({ error })` message for that case. |
| `error-no-usable-servers.sample.conf` | `[server_local]` that contains only placeholders. |
| `error-no-usable-servers.expected.txt` | Exact `$done({ error })` message for that case. |
| `run-examples.js` | Sandbox runner and checks, including BOM / CRLF normalization. |

## What the happy-path fixture exercises

The sample `[server_local]` includes:

- English and Chinese traffic / expiry / plan placeholders
- a `[Premium]` AnyTLS stub
- comments (`;`, `#`, `//`) and blank lines
- a duplicated AnyTLS line
- AnyTLS (standard TLS and Reality)
- Shadowsocks 2022, VMess, VLESS, Trojan, HTTP, and SOCKS5
- an unsupported `hysteria2` line

Only the nine distinct supported servers remain in `nexitally-server-remote.expected.txt`. `[policy]`, `[filter_local]`, and `[server_remote]` never appear in the parser output.

## What these files are not

- Not a Nexitally subscription.
- Not a complete Quantumult X profile you should import as-is.
- Not a place to paste a live configuration. If a fixture needs a new protocol example, keep using `*.example.invalid` hosts and placeholder secrets.
