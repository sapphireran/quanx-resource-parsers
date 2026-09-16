# Before and after the Nexitally parser

This is a condensed view of
[input-full-config.conf](input-full-config.conf) and
[expected-servers.snippet](expected-servers.snippet). The full files are the
source of truth. Hosts and passwords remain documentation placeholders.

## Before: managed full configuration (abridged)

Quantumult X downloads a complete profile. Only the `[server_local]` block
is relevant to this parser. Later sections are shown to make the leak-guard
obvious.

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js

[server_local]
anytls=hk-01.example.com:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Nexitally-HK-01
anytls=jp-01.example.com:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Nexitally-JP-01
anytls=hk-01.example.com:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Nexitally-HK-01
shadowsocks=sg-01.example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, udp-relay=false, tag=Nexitally-SG-01
vmess=info.example.com:80, method=none, password=00000000-0000-0000-0000-000000000000, tag=Expire: 2099-12-31
anytls=premium.example.com:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Nexitally-US-Premium [Premium]

[server_remote]
https://www.example.com/other-server.snippet, tag=ExampleOther, enabled=false

[policy]
static = Nexitally, Nexitally-HK-01, Nexitally-JP-01, direct
```

## After: server resource snippet

`$done({ content })` returns only usable, unique Quantumult X server lines.
No section headers. No quota nodes. No `[policy]`.

```text
anytls=hk-01.example.com:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Nexitally-HK-01
anytls=jp-01.example.com:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Nexitally-JP-01
shadowsocks=sg-01.example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, udp-relay=false, tag=Nexitally-SG-01
```

The abridged "after" block above omits the other kept schemes (`vmess`,
`vless`, `trojan`, `http`, `socks5`) that appear in the full expected
snippet. Run the complete fixture with:

```bash
node tools/run-examples.js
```

## What was dropped in this abridged view

| Line | Reason |
| --- | --- |
| Second `Nexitally-HK-01` AnyTLS line | Exact duplicate of the first kept line. |
| `Expire: 2099-12-31` | Quota / expiry placeholder. |
| `Nexitally-US-Premium [Premium]` | Premium placeholder tag. |
| `[server_remote]` URL | Different section; not a local server URI. |
| `[policy]` group | Local profile concern, not a server resource. |

The live device profile should already contain its own `[policy]` groups.
Refreshing the Nexitally **server resource** updates nodes only.
