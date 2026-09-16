# Walkthrough: `typical-full-config.conf`

This fixture is a shortened Nexitally-style **full** Quantumult X download. Hosts and passwords are fictional.

## Input (abbreviated)

The managed file contains more than nodes:

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js

[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=.

[server_local]
# Traffic: 12.34 GB / 500.00 GB
# Expire: 2026-12-31
anytls=hk-01.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Hong Kong 01
anytls=premium.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Osaka [Premium]
anytls=tw-05.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=Taipei 05 Reality

[filter_local]
geoip, cn, direct
final, Nexitally
```

## What is dropped

| Line | Reason |
| --- | --- |
| Everything in `[general]`, `[dns]`, `[policy]`, `[server_remote]`, `[filter_*]`, `[rewrite_remote]`, `[mitm]` | Outside `[server_local]` |
| `# Traffic: …`, `# Expire: …`, `# 流量: …` | Exclusion markers |
| `tag=Osaka [Premium]` | `[Premium]` placeholder |

## Output

The resource that `[server_remote]` should receive is only the kept server lines. See `typical-full-config.expected.txt`.

```ini
anytls=hk-01.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Hong Kong 01
anytls=jp-02.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Tokyo 02
anytls=sg-03.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Singapore 03
anytls=us-04.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Los Angeles 04
anytls=tw-05.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=Taipei 05 Reality
```

Personal policy groups that select `resource-tag-regex=^Nexitally` now see those five tags and nothing else from the managed file.

Run:

```bash
node scripts/run-nexitally-parser.js examples/nexitally/typical-full-config.conf
```
