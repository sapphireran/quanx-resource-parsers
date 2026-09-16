# 05 — Server-line grammar this parser accepts

The parser is prefix-only. It does not validate methods, ports, or TLS fields. If the line starts with a supported `scheme=` (spaces around `=` allowed) and is not excluded, it is kept as-is.

## Supported prefixes

| Prefix | Official sample (from Quantumult X `sample.conf`) |
| --- | --- |
| `anytls=` | `anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01` |
| `shadowsocks=` | `shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=apple.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, tag=ss-obfs-http-02` |
| `vmess=` | `vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vmess-01` |
| `vless=` | `vless=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vless-01` |
| `trojan=` | `trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01` |
| `http=` | `http=example.com:80,fast-open=false, udp-relay=false, tag=http-01` |
| `socks5=` | `socks5=example.com:80,fast-open=false, udp-relay=false, tag=socks5-01` |

Case is ignored (`ANYTLS =`, `ShadowSocks=`). Replay: `protocol-case-and-spacing`.

## Reality (AnyTLS 1.6.x)

When `reality-base64-pubkey` is present, Quantumult X replaces standard TLS with Reality. The parser treats that as just another `anytls=` line:

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

The pubkey and short-id above are the **official sample.conf placeholders**, not a live node.

## Not supported (dropped as `DROP_UNSUPPORTED`)

These prefixes appear in other apps and are not Quantumult X `[server_local]` schemes this parser accepts:

- `wireguard=`
- `hysteria2=` / `hy2=`
- `tuic=`
- `ssr=` as a scheme (a `shadowsocks=` line with `ssr-protocol=` **is** kept)
- `static=`, `available=`, `url-latency-benchmark=` (policy lines)
- `host,`, `ip-cidr,`, `geoip,` (filter lines)

Replay: `unsupported-family` and `policy-lookalikes`.

## Comments

Quantumult X comments start with `;`, `#`, or `//`. A commented-out server is `DROP_COMMENT`, even if the rest of the line is a valid `anytls=`.
