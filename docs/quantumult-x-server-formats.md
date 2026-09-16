# Quantumult X server line formats

The Nexitally parser does not re-encode nodes. It keeps a line as-is when the line looks like a Quantumult X server entry and does not look like account metadata.

The shapes below are taken from the public [Quantumult X `sample.conf`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf). Placeholder hosts and passwords only.

## Lines the parser accepts

The first token, case-insensitive, must be one of:

`anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`

A single optional run of whitespace is allowed before `=`.

### AnyTLS

Quantumult X documents AnyTLS as natively carrying UDP over TCP, so `udp-over-tcp` is unnecessary. Reality replaces standard TLS when `reality-base64-pubkey` is set.

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

### Shadowsocks

```ini
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022
shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, obfs=wss, obfs-uri=/ws, udp-relay=true, tag=ss-wss
```

`obfs=tls` is the Shadowsocks obfuscation plugin. `obfs=over-tls` is real TLS. They are not interchangeable.

### VMess and VLESS

```ini
vmess=example.com:443, method=chacha20-poly1305, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=wss, obfs-uri=/ws, tag=vmess-wss
vless=example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, tag=vless-tls
```

VLESS `method` is `none` in the official sample. Reality and `vless-flow=xtls-rprx-vision` are optional fields the parser does not rewrite.

### Trojan, HTTP, SOCKS5

```ini
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, tag=trojan-tls
http=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tls-verification=true, tag=http-tls
socks5=example.com:80, username=name, password=pwd, udp-relay=false, tag=socks5
```

Trojan websocket-over-TLS uses `obfs=wss` and must not also set `over-tls` / `tls-host`.

## Lines the parser drops even when the prefix matches

A matching prefix is not enough. The line is discarded when it contains any of these substrings (case-insensitive):

| Token | Typical upstream use |
| --- | --- |
| `[Premium]` | Reserved / unpaid placeholder node |
| `Traffic` / `Expire` / `Reset` / `Days Left` | English quota rows |
| `流量` / `到期` / `剩余` / `套餐` | Chinese quota rows |

Managed full configurations often encode quota as fake `shadowsocks=` or `anytls=` rows so a whole-profile import still shows a banner node. Those rows are not usable servers.

## Lines the parser never accepts

Anything that does not start with a supported prefix is ignored, including:

- comments starting with `;`, `#`, or `//`
- blank lines
- `hysteria2=`, `wireguard=`, `tuic=`, and other schemes Quantumult X may or may not understand later
- policy, filter, rewrite, DNS, and MITM lines
- URI schemes (`ss://`, `vmess://`, `trojan://`)

URI conversion is out of scope. If an upstream stops shipping Quantumult X lines, this parser should be replaced, not extended ad hoc inside the resource-parser sandbox.

## Duplicates

After trim, exact duplicate lines are kept once, in first-seen order. The parser does not compare by `tag=` alone. Two different host lines that share a tag are both kept.

## What this file is not

It is not a complete Quantumult X protocol reference. TLS pinning, ALPN hex, UDP-over-TCP versions, and Reality fingerprints are documented in the official sample configuration. This page only records the subset that affects whether `nexitally-node-parser.js` keeps a line.
