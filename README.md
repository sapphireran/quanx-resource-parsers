# QuanX Resource Parsers

Personal Quantumult X resource parsers. This repository is not a company project and does not ship anyone's subscription URL.

The only production script today is [`nexitally-node-parser.js`](nexitally-node-parser.js). It turns Nexitally's managed **full Quantumult X configuration** into a server-only `[server_remote]` body so a refresh updates nodes without replacing your local `[policy]`, `[filter_*]`, `[rewrite_*]`, or DNS.

## Why this exists

Nexitally's Quantumult X download is a complete profile. Importing it again overwrites the personal configuration you have already tuned. A resource parser lets Quantumult X download that same file as a **server resource**, keep the `[server_local]` entries, and throw the rest away.

Longer version: [docs/why-a-server-resource.md](docs/why-a-server-resource.md).

If Nexitally publishes an official server-only Quantumult X subscription, use that and delete this layer.

## Usage

Add the parser under `[general]`. Either URL is fine:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add **your** private Nexitally Quantumult X Configuration File URL as a server resource:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the device. Never commit it here, to a public Gist, or to another public host.

After a stable profile is in place, refresh **Server Resources → Nexitally**. Do not re-download the vendor Configuration File.

A copy-paste snippet, plus iCloud / pinned-SHA variants, lives in [`examples/local-profile/`](examples/local-profile/quantumult-x-local.snippet.conf).

## What the parser keeps and drops

From `[server_local]` it keeps Quantumult X server lines whose prefix is:

`anytls` · `shadowsocks` · `vmess` · `vless` · `trojan` · `http` · `socks5`

It drops:

- comments (`;`, `#`, `//`) and blank lines
- exact duplicate lines (first copy wins)
- traffic / expiry / reset placeholders (`Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`)
- `[Premium]` inventory placeholders
- every other INI section (`[policy]`, `[filter_local]`, `[rewrite_local]`, `[mitm]`, …)

It contains no subscription URL, account id, node password, or other private data.

Worked internals: [docs/nexitally-parser.md](docs/nexitally-parser.md).

## Examples

Sanitized fixtures in [`examples/fixtures/`](examples/README.md) stand in for a live Nexitally download. Hosts are `example.com`; passwords are placeholders.

| Fixture | Expected result |
| --- | --- |
| `nexitally-full-config.sanitized.conf` ([annotated](examples/fixtures/ANNOTATED.md)) | Eight server lines, no metadata nodes |
| `comments-and-duplicates.conf` | Comments gone, duplicates collapsed |
| `mixed-protocols.conf` | One line per supported family |
| `crlf-and-bom.conf` | Same nodes after BOM + CRLF cleanup |
| `unsupported-lines.conf` | `wireguard` / `hysteria2` / `ss=` dropped |
| `missing-server-local.conf` | Error: section not found |
| `empty-server-local.conf` | Error: no usable servers |
| `premium-and-traffic-only.conf` | Error: no usable servers |

Inspect one file without Quantumult X:

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sanitized.conf
```

## Docs

| Document | Topic |
| --- | --- |
| [docs/why-a-server-resource.md](docs/why-a-server-resource.md) | Full profile vs `[server_remote]` |
| [docs/nexitally-parser.md](docs/nexitally-parser.md) | Section regex, allow-list, exclusions |
| [docs/quantumult-x-resource-parser-api.md](docs/quantumult-x-resource-parser-api.md) | Official `$resource` / `$done` contract |
| [docs/security.md](docs/security.md) | What must never land in git |
| [docs/troubleshooting.md](docs/troubleshooting.md) | The two parser errors and common misses |
| [docs/compatibility.md](docs/compatibility.md) | Protocols and Quantumult X versions |

## Development

The script Quantumult X downloads is still a single file at the repo root. Node is only used in this clone to keep the examples honest.

```bash
npm test
npm run verify-examples
```

`scripts/qx-parser-sandbox.js` loads the parser with `$resource` and `$done`, the same globals the official [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) documents. There are no npm dependencies.

## Compatibility

Tested against Quantumult X configurations that embed AnyTLS nodes. Importing those lines requires a Quantumult X build that supports AnyTLS (1.5.6+) and resource parsers. See [docs/compatibility.md](docs/compatibility.md).

## License

MIT. Personal use, no warranty. See [LICENSE](LICENSE).
