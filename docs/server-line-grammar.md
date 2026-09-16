# Quantumult X server-line grammar (personal reference)

Field names below come from the official [`sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) (v1.5.5 / 1.6.0 comments). This page is a reading guide for fixtures, not a second parser.

The Nexitally parser does **not** validate fields. If a line has a supported prefix and is not excluded, it is forwarded unchanged.

## Prefixes the parser keeps

```text
anytls=host:port, ...
shadowsocks=host:port, ...
vmess=host:port, ...
vless=host:port, ...
trojan=host:port, ...
http=host:port, ...
socks5=host:port, ...
```

The prefix is case-insensitive. Spaces may appear before `=`.

## AnyTLS (Quantumult X 1.6.0 / 1.5.6 TestFlight 914+)

Official comment: AnyTLS natively transports UDP over TCP; do not set `udp-over-tcp` separately. Setting `reality-base64-pubkey` replaces standard TLS with Reality.

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

Nexitally-managed exports I care about are AnyTLS-heavy. Older Quantumult X builds will show those nodes as unsupported even if this parser forwards them.

## Reality (1.5.5+)

When an over-TLS server line includes `reality-base64-pubkey`, Quantumult X uses Reality instead of standard TLS. Official note: iOS 26 Safari fingerprint is used; custom ALPN and session-ticket settings are ignored; TCP Fast Open should stay off because the Client Hello can exceed 1500 bytes.

Reality can appear on AnyTLS, Shadowsocks (`obfs=over-tls` or `wss`), VMess, VLESS, Trojan, HTTP, and SOCKS5. The parser keeps all of those prefixes.

## Shadowsocks notes the fixtures rely on

- `obfs=over-tls` is real TLS. `obfs=tls` is the shadowsocks obfuscation plugin. They are not the same.
- SS2022 methods in the official sample: `2022-blake3-aes-128-gcm`, `2022-blake3-aes-256-gcm`.
- `udp-over-tcp=sp.v1` / `sp.v2` are Xray / sing-box flavours. The python SSR server does not do UDP-over-TCP for SS2022.

## VLESS

Official sample: `method` should be `none`. Vision is `vless-flow=xtls-rprx-vision` on a Reality line.

## HTTP and SOCKS5

`obfs` is not used for HTTP. Trojan websocket uses `obfs=wss` and must not also set `over-tls` / `tls-host`.

## What the parser drops even when the grammar is valid

A grammatically valid AnyTLS line is still dropped when the **entire line** matches the info/premium regex. That is why `tag=剩余流量` disappears and why `tag=Preset 01` disappears (`Reset` is a substring). See [parser-spec.md](parser-spec.md) and the lab matrix.

## Prefixes the parser does not keep

Quantumult X may gain more protocols. Until this script lists them, they are dropped:

- `hysteria2`, `tuic`, `wireguard`, `ssh` (lab: [`unsupported-family.conf`](../lab/fixtures/unsupported-family.conf))
- Policy definitions (`static=`, `available=`) if they are mistakenly pasted into `[server_local]`
