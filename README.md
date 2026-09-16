# QuanX Resource Parsers

Personal Quantumult X resource parsers. **Not company code.**

The first parser turns a Nexitally-managed **full Quantumult X configuration** into a server-only resource so a local profile can refresh nodes without **Configuration File → Download** replacing `[policy]`, filters, and rewrites.

## Nexitally node parser

[`nexitally-node-parser.js`](nexitally-node-parser.js) runs in Quantumult X's resource-parser sandbox:

1. Quantumult X downloads the private Nexitally URL on-device.
2. The script reads `$resource.content` only, extracts the first `[server_local]` section, and keeps supported server lines.
3. `$done({ content })` returns those lines to `[server_remote]`.

| Keep | Drop |
| --- | --- |
| `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5` | comments, exact duplicates, `[Premium]` stubs, traffic / expiry / plan rows (`Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`) |

The file contains no subscription URL, account id, or live node password. See [docs/privacy.md](docs/privacy.md).

It is not a Clash/Surge converter. Quantumult X has one `resource_parser_url`; set `opt-parser=true` only on the Nexitally resource.

## Quick start

Raw GitHub is the source of truth. jsDelivr can lag `main`.

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

```ini
;resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Add the **private** Nexitally full-configuration URL as a server resource. Do not import that download as the active profile.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep the URL on the device. Do not commit it here.

Refresh **Server Resources → Nexitally**. Longer fragments: [`lab/profiles/`](lab/profiles/).

## Example

[`lab/fixtures/nexitally-style-full.conf`](lab/fixtures/nexitally-style-full.conf) is a sanitized Nexitally-style export (Chinese tags, traffic rows, a `[Premium]` section, a duplicate). The parser output is:

```text
anytls=hk-iplc-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=香港 IPLC 01
anytls=jp-iepl-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=日本 IEPL 01
anytls=sg-anycast-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=新加坡 Anycast 01
```

Replay without Quantumult X (Node.js 18+):

```bash
npm test
node lab/run.js --explain lab/fixtures/nexitally-style-full.conf
```

Open the generated gallery at [`lab/gallery.html`](lab/gallery.html) after `npm run gallery`.

## Docs

| Path | Topic |
| --- | --- |
| [docs/lab-notebook.md](docs/lab-notebook.md) | Why this exists |
| [docs/parser-spec.md](docs/parser-spec.md) | Extract / filter / error contract |
| [docs/resource-parser-contract.md](docs/resource-parser-contract.md) | Official `$resource` / `$done` surface |
| [docs/server-line-grammar.md](docs/server-line-grammar.md) | AnyTLS / Reality field names |
| [docs/migration-cookbook.md](docs/migration-cookbook.md) | Profile migration |
| [docs/keep-drop-matrix.md](docs/keep-drop-matrix.md) | Catalog counts |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Failed refresh |
| [docs/zh/README.md](docs/zh/README.md) | 中文 |
| [lab/README.md](lab/README.md) | Fixture catalog and CLI |

## Compatibility

- Resource parsers: Quantumult X v1.0.8-build253+
- AnyTLS: Quantumult X 1.6.0 (App Store, 2026-05-21) or 1.5.6 TestFlight build 914+
- If Nexitally publishes an official server-only Quantumult X subscription, use that and remove this parser

## License

[MIT](LICENSE)
