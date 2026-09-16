# Compatibility

Personal notes for the Nexitally node parser. Versions below are taken from Quantumult X's own sample configuration and resource-parser comments, not from a vendor compatibility matrix.

## Quantumult X versions

| Capability | First documented version | Relevance here |
| --- | --- | --- |
| Resource parsers (`$resource` / `$done`) | v1.0.8-build253 | Required |
| `$resource.info` and `$resource.tag` | v1.0.10-build277 | Unused by this parser; safe to ignore |
| AnyTLS server lines | v1.5.6 (around build 914–925) | Required for current Nexitally AnyTLS nodes |
| `$done({ retry: { user_agent } })` | v1.5.6-build921 | Unused; this parser does not retry |
| Reality (`reality-base64-pubkey`) on AnyTLS and others | documented in current `sample.conf` | Pass-through if the line is otherwise valid |

If Quantumult X is older than AnyTLS support, the parser can still emit `anytls=...` lines, but the app will not be able to use them. Upgrade the app rather than asking the parser to convert AnyTLS into another protocol.

## Supported server prefixes

The allow-list in `nexitally-node-parser.js` is:

```text
anytls
shadowsocks
vmess
vless
trojan
http
socks5
```

Matching is case-insensitive and requires `name=` at the start of the trimmed line (optional spaces around `=`).

Not matched, and therefore dropped:

| Prefix | Why it is dropped |
| --- | --- |
| `ss=`, `ssr=` | Quantumult X uses `shadowsocks=` even for SSR (`ssr-protocol=...`) |
| `socks=` | Official sample uses `socks5=` |
| `wireguard=` | Not in the current allow-list |
| `hysteria2=` / `hy2=` | Not in the current allow-list |
| `tuic=` | Not in the current allow-list |
| URI schemes (`ss://`, `vmess://`, `trojan://`) | This parser expects Quantumult X native lines, not a URI subscription |

If a future Nexitally full configuration starts emitting a new Quantumult X prefix, add it to the allow-list and add a fixture. Do not silently pass unknown lines; that is how `[policy]` leftovers leak into `[server_remote]`.

## AnyTLS

Official sample lines:

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

Notes from the official sample:

- AnyTLS natively transports UDP over TCP. Do not add `udp-over-tcp=` for AnyTLS.
- `reality-base64-pubkey` replaces standard TLS with Reality. When Reality is on, Quantumult X uses its iOS 26 Safari fingerprint and ignores customized ALPN and session-ticket settings.
- TCP Fast Open should stay off for Reality TLS because the Client Hello can exceed 1500 bytes.

The parser does not rewrite these fields. It only decides whether the line is a usable server.

## Lines the parser refuses even when the prefix is valid

A supported prefix is not enough. The exclusion regex drops any line that contains:

```text
[Premium]
Traffic
Expire
Reset
Days Left
流量
到期
剩余
套餐
```

Providers often encode quota and expiry as fake server rows (for example `shadowsocks=127.0.0.1:443, ..., tag=Traffic: 12GB`). Those rows are not connectable. Keeping them out of `[server_remote]` prevents policy groups from offering a "Traffic" node.

`[Premium]` placeholders are the same idea: a reserved slot, not a host.

The match is case-insensitive and applies to the **entire** line. A real node whose tag is `HK-Traffic-01` will also be dropped. If that happens, rename it in a local-only fork of the parser or ask the provider for a tag that does not contain those words. Do not weaken the filter in the public default without a fixture that shows the new behavior.

## Full-configuration layout

Nexitally's "Configuration File → Download" product is a complete Quantumult X profile. Typical section order (names vary):

```text
[general]
[dns]
[policy]
[server_remote]
[filter_remote]
[rewrite_remote]
[server_local]
[filter_local]
[rewrite_local]
[task_local]
[mitm]
```

The parser keeps only the body of `[server_local]`. Everything else — including the provider's `[policy]` and `[filter_remote]` — is discarded on purpose. Your local profile's policy and filters stay authoritative.

The section matcher is:

```text
(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)
```

It stops at the next INI-style section header. A `[server_local]` block at end-of-file is still captured. A file with no such header errors.

## Line endings and BOM

Managed downloads sometimes arrive as UTF-8 with BOM and/or CRLF. The parser strips a leading U+FEFF and normalizes `\r\n` to `\n` before matching. Fixtures `crlf-and-bom.conf` and `server-local-at-eof.conf` cover those shapes.

## What this parser will not become

- A Clash / Surge / Loon converter
- A URI-list (`ss://`, `vmess://`) decoder
- A rename / emoji / sort engine
- A filter or rewrite parser

Those tools exist elsewhere. This file has one job: extract connectable Quantumult X server lines from a managed full configuration.
