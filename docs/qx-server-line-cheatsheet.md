# Quantumult X server line cheatsheet

Personal reference for the server-line shapes this repository's examples use.
Syntax follows the official
[sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf)
from `crossutility/Quantumult-X`. Values here are fake.

A resource parser that feeds `[server_remote]` should emit **these line
shapes**, not URI schemes (`ss://`, `vmess://`) and not Clash YAML.

## Common fields

| Field | Role |
| --- | --- |
| `tag=` | Display name. Required in practice if a policy should match the node. |
| `udp-relay=` | UDP through the proxy. AnyTLS carries UDP over TCP natively. |
| `fast-open=` | TCP Fast Open. Leave off for Reality TLS (Client Hello can exceed 1500 bytes). |
| `over-tls=` / `obfs=` | TLS or obfuscation. AnyTLS uses `over-tls=true`. |
| `tls-host=` / `obfs-host=` | SNI / Host. |
| `tls-verification=` | Certificate check. Examples keep it omitted or `true`. |
| `server_check_url=` | Optional per-node HTTP HEAD URL for latency tests. |

Comment prefixes inside `[server_local]` are `;`, `#`, and `//`. The Nexitally
parser drops those lines.

## AnyTLS

Nexitally's current Quantumult X export is AnyTLS-heavy. Two official shapes:

Standard TLS:

```
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
```

Reality TLS (setting `reality-base64-pubkey` replaces standard TLS):

```
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

Do not add `udp-over-tcp` for AnyTLS. Quantumult X documents that AnyTLS
already transports UDP over TCP.

## Shadowsocks

```
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=apple.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, tag=ss-obfs-http-01
```

```
shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, obfs=wss, obfs-uri=/ws, fast-open=false, udp-relay=false, tag=ss-ws-tls-01
```

## VMess / VLESS

```
vmess=example.com:443, method=chacha20-poly1305, password=00000000-0000-4000-8000-000000000001, obfs=wss, obfs-uri=/ws, fast-open=false, udp-relay=false, tag=vmess-ws-tls-01
```

```
vless=example.com:443, method=none, password=00000000-0000-4000-8000-000000000001, obfs=over-tls, fast-open=false, udp-relay=false, tag=vless-tls-01
```

VLESS `method` should be `none`.

## Trojan

```
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01
```

WebSocket over TLS uses `obfs=wss` instead of `over-tls` + `tls-host`.

## HTTP / SOCKS5

```
http=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=http-02
```

```
socks5=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tls-verification=true, fast-open=false, udp-relay=false, tag=socks5-tls-01
```

## Lines the Nexitally parser will drop

These are **not** connectable servers. They appear in managed profiles as UI
rows. The parser's `excluded` regex is aimed at them:

```
shadowsocks=invalid.example.test:1, method=aes-128-gcm, password=example-password-not-real, tag=Traffic 12.3 GB / 200 GB
shadowsocks=invalid.example.test:1, method=aes-128-gcm, password=example-password-not-real, tag=Expire 2099-01-01
shadowsocks=invalid.example.test:1, method=aes-128-gcm, password=example-password-not-real, tag=[Premium] Upgrade
```

## Section that must not leak

A managed file may include:

```
[policy]
static = PROXY, HK-01, JP-01, img-url=https://example.com/icon.png
```

If the extractor's section regex is too greedy, `static = ...` could be
emitted as a "server". The current parser stops at the next `[header]`, and
the `supported` prefix list would still reject `static =`. The
`managed-full-config` example asserts both protections: the expected output
file contains only `anytls=` / other server prefixes.
