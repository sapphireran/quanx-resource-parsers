# Quantumult X server line reference

Personal cheat sheet for the prefixes `nexitally-node-parser.js` accepts.
These are Quantumult X *resource* lines, not Clash or Surge URIs.

A kept line looks like:

```text
<protocol> = <host>:<port>, key=value, key=value, tag=<name>
```

The parser does not validate keys or hostnames. If the prefix is supported
and the line is not an info placeholder, it is forwarded unchanged.

## Supported prefixes

| Prefix | Typical use in this repo | Notes |
| --- | --- | --- |
| `anytls` | Nexitally AnyTLS nodes | Requires a Quantumult X build that understands AnyTLS |
| `shadowsocks` | SS / SS2022 style rows | Also used by providers for dummy traffic banners |
| `vmess` | VMess + WS/TLS | `password` is the UUID |
| `vless` | VLESS + WS/TLS | `method=none` is common |
| `trojan` | Trojan-over-TLS | |
| `http` | HTTP / HTTPS proxies | |
| `socks5` | SOCKS5 proxies | |

The match is case-insensitive and requires `=` after the prefix
(`anytls = …` and `AnyTLS=` both work).

## Intentionally unsupported

Anything else is dropped. The `unsupported-only` example uses invented
`wireguard =` and `hy2 =` rows so a future prefix does not slip through
unreviewed.

Add a prefix only when:

1. A real personal subscription emits it.
2. The installed Quantumult X version can consume it as a server resource.
3. A sanitized fixture and expected file are added under `examples/`.

## Lines that look like servers but are not

Providers often encode account status as dummy `shadowsocks` rows:

```text
shadowsocks = 127.0.0.1:1, method=aes-128-gcm, password=placeholder, tag=Traffic: 128.00 GB
shadowsocks = 127.0.0.1:1, method=aes-128-gcm, password=placeholder, tag=Expire: 2099-12-31
shadowsocks = 127.0.0.1:1, method=aes-128-gcm, password=placeholder, tag=[Premium]
shadowsocks = 127.0.0.1:1, method=aes-128-gcm, password=placeholder, tag=流量: 12.30 GB
```

The exclusion regex in the parser looks for:

- `[Premium]`
- `Traffic`, `Expire`, `Reset`, `Days Left`
- `流量`, `到期`, `剩余`, `套餐`

A real node whose *tag* contains those words will also be dropped. Give
personal nodes boring tags (`HK-Central-01`) so they never collide.

## Comments and blanks

These are ignored, after trim:

```text
; semicolon (Quantumult X style)
# hash
// slash
```

Inline comments after a server line are **not** stripped. If a provider
appends `// note` on the same line, Quantumult X will see it as part of
the server parameters. None of the current fixtures do that.

## Section boundaries

Only lines inside `[server_local]` are candidates. The extractor stops at the
next `[section]` header. A `shadowsocks =` line under `[filter_local]` is not
a server — see `section-boundaries`.

`[server_remote]` in the *managed* full config is the provider's own remote
list. It is ignored. The personal profile has a separate `[server_remote]`
that points at the full-config URL and this parser.

## Local runner

To print what the parser would keep for a fixture:

```bash
node examples/scripts/run-example.js mixed-protocols
```

Do not point the runner at a live export. Invent the input or redact it
first.
