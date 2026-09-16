# Examples

Every file under `examples/` is **fictional**. Hostnames use `example.com` / `example.net`. Passwords and UUIDs are placeholders. Do not paste a live Nexitally export into this tree.

## What is covered

`examples/nexitally/manifest.json` lists the fixtures that `npm test` (or `node scripts/verify-examples.js`) runs against `nexitally-node-parser.js`.

| Case | What it shows |
| --- | --- |
| `happy-path-full-profile` | A whole Quantumult X profile. Only `[server_local]` servers survive. Traffic lines, a `[Premium]` placeholder, an exact duplicate, and an unsupported `ssr` line are dropped. |
| `mixed-protocols-keep-supported-drop-unknown` | The seven supported prefixes stay. `ssr`, `wireguard`, and `hysteria2` do not. |
| `comments-and-blanks` | `;`, `#`, and `//` comments, plus blank lines, are ignored. |
| `duplicates-first-wins` | Exact trimmed copies collapse to the first line. A different `tag=` is a different line. |
| `premium-and-traffic-excluded` | English and Chinese traffic / expiry / plan keywords, and `[Premium]`, never become nodes. |
| `section-order-and-case` | `[SERVER_LOCAL]` matches. Neighboring `[policy]` / `[filter_local]` lines never leak into the output. |
| `crlf-and-bom` | The harness reapplies a UTF-8 BOM and CRLF so the parser's first two normalizations are tested. |
| `server-local-until-eof` | When `[server_local]` is the last section, parsing continues to end of file. |
| `whitespace-around-equals` | `anytls=`, `shadowsocks =`, and `vmess  =` are all accepted. |
| `missing-server-local` | Missing section → `$done({ error })`. |
| `empty-server-local` | Empty section → `$done({ error })`. |
| `only-comments-and-excluded` | Comments + excluded + unsupported lines still count as "no usable servers". |

## Snippets for a private profile

These are copy-paste fragments for a **local** Quantumult X configuration. They still use placeholder URLs.

- [`nexitally/snippets/general-parser.conf`](nexitally/snippets/general-parser.conf) — `resource_parser_url`
- [`nexitally/snippets/server-remote.conf`](nexitally/snippets/server-remote.conf) — `[server_remote]` with `opt-parser=true`
- [`nexitally/snippets/policy-unchanged.conf`](nexitally/snippets/policy-unchanged.conf) — policy groups that keep using a resource tag

## Run one fixture by hand

```bash
node scripts/run-parser.js examples/nexitally/happy-path/input.conf
node scripts/run-parser.js --json examples/nexitally/missing-server-local/input.conf
node scripts/run-parser.js --transform bom-crlf examples/nexitally/crlf-and-bom/input.conf
```

See [docs/local-testing.md](../docs/local-testing.md) for the sandbox that stands in for Quantumult X.
