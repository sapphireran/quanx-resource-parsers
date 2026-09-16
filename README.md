# QuanX Resource Parsers

Personal Quantumult X resource parsers. This repository is not company code.

The first parser extracts **nodes only** from a Nexitally-managed **full Quantumult X configuration**, so a local profile can refresh servers without downloading and replacing the entire config.

## Nexitally node parser

`nexitally-node-parser.js` runs inside Quantumult X's resource-parser sandbox:

1. Quantumult X downloads the private Nexitally URL.
2. The script reads `$resource.content`, finds `[server_local]`, and keeps supported server lines.
3. `$done({ content })` returns those lines to `[server_remote]`.

The script contains no subscription URL, account id, node password, or other private data. Traffic / expiry / plan placeholders and `[Premium]` stubs are dropped. Duplicate lines are dropped.

It is **not** a generic Clash/Surge converter. Quantumult X allows one `resource_parser_url`; enable `opt-parser` on the Nexitally resource only.

## Quick start

Add the parser to `[general]`. The raw GitHub URL is the source of truth. jsDelivr is a cache and can lag behind `main`.

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

```ini
;resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then add the **private** Nexitally Quantumult X full-configuration URL as a server resource. Do not import that file as the active profile.

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Keep that URL on the device. Do not commit it here, gist it, or paste it into an issue.

Refresh **Server Resources → Nexitally**. Local `[policy]`, `[filter_remote]`, and `[rewrite_remote]` sections stay as they are.

A longer profile fragment is in [`docs/examples/quantumult-x.profile.snippet.conf`](docs/examples/quantumult-x.profile.snippet.conf).

## Example transformation

The sanitized fixture [`docs/examples/nexitally-full-config.sample.conf`](docs/examples/nexitally-full-config.sample.conf) is a miniature Nexitally-style export: DNS, policy, filters, traffic rows, a `[Premium]` stub, a duplicate AnyTLS line, official AnyTLS / Reality / Shadowsocks 2022 / VMess / VLESS / Trojan / HTTP / SOCKS5 lines, and an unsupported `hysteria2` line.

The parser output is exactly [`docs/examples/nexitally-server-remote.expected.txt`](docs/examples/nexitally-server-remote.expected.txt):

```text
anytls=hk-iplc-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=HK IPLC 01
anytls=jp-iepl-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=JP IEPL 01
anytls=sg-anycast-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=SG Anycast Reality 01
shadowsocks=us-ss-01.example.invalid:443, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, obfs=over-tls, obfs-host=www.apple.com, tls-verification=true, udp-relay=true, tag=US SS2022 01
vmess=us-vmess-01.example.invalid:443, method=chacha20-poly1305, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=wss, obfs-host=www.apple.com, obfs-uri=/ws, udp-relay=true, tag=US VMess 01
vless=us-vless-01.example.invalid:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, obfs-host=www.apple.com, udp-relay=true, tag=US VLESS 01
trojan=us-trojan-01.example.invalid:443, password=placeholder, over-tls=true, tls-host=www.apple.com, tls-verification=true, udp-relay=true, tag=US Trojan 01
http=helper.example.invalid:443, username=demo, password=placeholder, over-tls=true, tls-host=www.apple.com, tls-verification=true, tag=Helper HTTP 01
socks5=helper.example.invalid:1080, username=demo, password=placeholder, tag=Helper SOCKS5 01
```

Replay that parse without Quantumult X:

```bash
node docs/examples/run-examples.js
```

Hosts use `*.example.invalid`. Secrets are placeholders. Do not paste a live export into these files.

## Why

Nexitally distributes a complete Quantumult X configuration through **Configuration File → Download**. Re-downloading it replaces the whole active profile. A resource parser turns `[server_local]` into an independently refreshable `[server_remote]` resource.

If Nexitally later publishes an official server-only Quantumult X subscription, use that URL and remove this parser.

## Compatibility

- Resource parsers: Quantumult X v1.0.8-build253 or later.
- AnyTLS nodes: Quantumult X 1.6.0 (App Store, 2026-05-21) or 1.5.6 TestFlight build 914 or later.
- VLESS nodes: Quantumult X 1.5.5 or later.
- Tested against Nexitally-style configurations that embed AnyTLS, including Reality, in `[server_local]`.

## Docs

| Document | Contents |
| --- | --- |
| [Usage](docs/usage.md) | Install, `opt-parser`, refresh workflow, troubleshooting. |
| [Parser behavior](docs/parser-behavior.md) | Keep/drop rules, sandbox APIs, error strings, version matrix. |
| [Examples](docs/examples/README.md) | Fixtures, expected output, local runner. |
