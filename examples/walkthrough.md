# Walkthrough: sanitized full configuration

This page reads `fixtures/nexitally-full-config.sample.conf` the way the parser does. The file is a teaching stand-in. It uses hosts and sample secrets from Quantumult X's official `sample.conf`. It is not a Nexitally download.

## Sections the parser ignores

Everything above `[server_local]` is provider policy, DNS, and remote resource lists. Re-importing those would overwrite a personal profile. The parser never returns them.

| Section | Why it is discarded |
| --- | --- |
| `[general]` | Would replace `resource_parser_url`, check URLs, and UDP lists |
| `[dns]` | Personal DNS (DoH / no-ipv6) stays local |
| `[policy]` | Provider group names rarely match a hand-built tree |
| `[server_remote]` | May contain other URLs; this repo must not copy them |
| `[filter_remote]` / `[rewrite_remote]` | Filter and rewrite stay on the lists you chose |
| `[filter_local]` / `[mitm]` | Hostname and LAN rules are profile-specific |

After `[server_local]`, `[filter_local]` and `[mitm]` close the sample file. The section regex stops at the first following `[...]` header, so those blocks are out of the capture.

## Rows inside `[server_local]`

### Dashboard rows (dropped)

```ini
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=Traffic: 88.0 GB
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=Expire: 2099-01-01
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=Reset: 7 Days Left
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=流量: 88.0 GB
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=套餐到期 2099-01-01
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=剩余 12 天
```

The prefix `shadowsocks=` is allow-listed, but the exclusion regex matches `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `套餐`, `到期`, and `剩余`. Loopback quota rows are a common provider pattern. They must not become policy candidates.

### Comments (dropped)

```ini
; Comments in all three Quantumult X styles.
# hash comment
// slash comment
```

Official Quantumult X comments are lines that *start* with `;`, `#`, or `//`. The parser uses the same rule.

### Duplicate AnyTLS (kept once)

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01
```

First-seen wins. The expected file contains a single `tag=HK-01` line.

### Premium placeholder (dropped)

```ini
anytls=example.com:8443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01 [Premium]
```

`[Premium]` is in the exclusion list. Port `8443` versus `443` does not matter; the keyword is enough.

### Remaining official-sample protocols (kept)

```ini
anytls=... tag=JP-01          # Reality sample line
trojan=... tag=SG-01
vmess=...  tag=US-01
vless=...  tag=US-02
http=...   tag=HTTP-01
socks5=... tag=SOCKS-01
shadowsocks=... tag=SS-01
```

These match the allow-list and do not contain exclusion keywords. They appear in `expected/nexitally-full-config.txt` in this order.

### Unknown prefixes and URI schemes (dropped)

```ini
hysteria2=example.com:443, password=pwd, tag=HY2-dropped
tuic=example.com:443, password=pwd, tag=TUIC-dropped
ss://YWVzLTI1Ni1nY206cHdk@example.com:443#dropped
```

The parser is not a multi-format converter. Unknown prefixes stay out of `[server_remote]` so a future provider experiment cannot inject non-QX lines into a personal profile.

## Expected output

Eight lines, no section headers, no comments, no quota rows. Compare with:

```bash
node examples/run-fixtures.js
```

The runner diffs parser output against `expected/nexitally-full-config.txt`.

## What a live refresh should look like in the app

If the parser is attached correctly, Quantumult X's Nexitally resource shows **node names** (`HK-01`, `JP-01`, …), not `[general]` or `static = PROXY`. If you see section headers in the server list, `opt-parser` is off or a different parser is installed. See [../docs/troubleshooting.md](../docs/troubleshooting.md).
