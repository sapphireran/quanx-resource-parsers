# 04 — Server-line field guide

Quantumult X server lines are `scheme = arguments`, not URI shares. The Nexitally parser only cares about the scheme prefix. This note exists so fixtures stay readable and so a second personal parser can copy the same shapes.

## Prefixes the parser keeps

| Prefix | Typical arguments | Workbook |
| --- | --- | --- |
| `anytls` | `host:port`, `password`, `tls-host`, `tls-verification`, optional Reality fields | `managed-full-profile`, `quoted-overlong-params` |
| `shadowsocks` | `method`, `password`, optional `obfs`, `obfs-host` | `protocol-roster`, `managed-full-profile` |
| `vmess` | `method`, `password` (UUID), optional `obfs=ws` / `wss` | `protocol-roster` |
| `vless` | `method=none`, `password` (UUID), optional Reality / ws | `protocol-roster` |
| `trojan` | `password`, `over-tls`, `tls-host` | `protocol-roster` |
| `http` | optional `username` / `password`, `over-tls` | `protocol-roster` |
| `socks5` | optional `username` / `password`, `over-tls` | `protocol-roster` |

Spaces around `=` are allowed: `anytls = host` matches `supported`. Scheme case is ignored: `AnyTLS=` and `Shadowsocks=` keep (`protocol-mixed-case`).

## Prefixes the parser drops

Anything else is an unsupported family, including:

- `wireguard =`
- `hysteria2 =` / `hy2 =`
- `tuic =`
- `vmess://` / `ss://` / `trojan://` URI shares
- Clash `proxies:` mappings
- Policy lines (`static=`, `available=`, `round-robin=`)
- Filter lines (`host,`, `ip-cidr,`, `geoip,`)

See `unsupported-families` and `policy-lookalikes`.

## Arguments the parser does not interpret

These fields appear in fixtures so the samples look like real Quantumult X. The parser never splits on commas or reads them:

- `password`, `method`, `username`
- `obfs`, `obfs-host`, `obfs-uri`
- `over-tls`, `tls-host`, `tls-verification`, `tls13`
- `fast-open`, `udp-relay`
- `tag`
- Reality / AnyTLS extras (`public-key`, `short-id`, `server-name`)

A `tag` that contains `Traffic`, `Expire`, `Reset`, `Days Left`, `[Premium]`, `流量`, `到期`, `剩余`, or `套餐` is dropped even if the rest of the line is a valid node. Hosts and passwords are irrelevant to that decision.

## Documentation-only values

Use these in every committed sample:

```text
host:        jp.example.invalid:443
ipv4:        192.0.2.10:443
ipv6:        [2001:db8::10]:443
password:    example-password
uuid:        00000000-0000-4000-8000-000000000000
method:      chacha20-ietf-poly1305 | aes-128-gcm | none
```

Do not paste a vendor line and “just change the tag.”
