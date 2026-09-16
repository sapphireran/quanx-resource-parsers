# Quantumult X server line reference

Personal cheat sheet for the line shapes `nexitally-node-parser.js` will **keep**. Values are from the official [Quantumult X sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf) or invented `example.com` stand-ins. They are not live nodes.

A parsed `[server_remote]` body is a newline-separated list of these lines, with **no** `[server_local]` header.

## Common fields

Most protocols share:

- `host:port` immediately after `protocol=`
- `password=` or a UUID in `password=`
- `tag=` — display name and the string policy regexes match
- `udp-relay=true|false`
- `fast-open=true|false`
- optional `server_check_url=`

TLS-ish protocols add some of:

- `over-tls=true`
- `tls-host=`
- `tls-verification=true|false`
- `tls-cert-sha256=` / `tls-pubkey-sha256=`
- `reality-base64-pubkey=` + `reality-hex-shortid=` (Reality replaces standard TLS)

The parser does not parse these fields. A line that starts with an allowed `protocol=` and does not hit the exclusion regex is forwarded whole.

## anytls

Official sample, standard TLS:

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
```

Official sample, Reality:

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

Official comment: AnyTLS already carries UDP over TCP; do not set `udp-over-tcp` separately.

## shadowsocks

```text
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=apple.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, tag=ss-obfs-http-02
shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, obfs=wss, obfs-uri=/ws, fast-open=false, udp-relay=false, tag=ss-ws-tls-01
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022-blake3-aes-128-gcm
```

SSR-style official sample still uses the `shadowsocks=` prefix:

```text
shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, ssr-protocol-param=def, obfs=tls1.2_ticket_fastauth, obfs-host=apple.com, tag=ssr
```

## vmess

```text
vmess=example.com:80, method=aes-128-gcm, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, aead=false, tag=vmess-02
vmess=example.com:443, method=chacha20-poly1305, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=wss, obfs-uri=/ws, fast-open=false, udp-relay=false, tag=vmess-ws-tls-01
```

## vless

Official note: `method` should be `none`.

```text
vless=example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=wss, obfs-uri=/ws, fast-open=false, udp-relay=false, tag=vless-ws-tls-01
vless=192.168.1.1:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, obfs-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, vless-flow=xtls-rprx-vision, tag=vless-tls-reality-vision-01
```

## trojan

```text
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01
trojan=192.168.1.1:443, password=pwd, obfs=wss, obfs-host=example.com, obfs-uri=/path, udp-relay=true, tag=trojan-wss-05
```

Official note: for Trojan WebSocket-over-TLS, use `obfs=wss` / `obfs-host` and do not also set `over-tls` / `tls-host`.

## http and socks5

```text
http=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=http-02
http=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tls-verification=true, tag=http-tls-01
socks5=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=socks5-02
socks5=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tls-verification=true, tag=socks5-tls-01
```

## Lines the Nexitally parser drops even when they look like servers

```text
ss=example.com:8388, method=aes-256-gcm, password=pwd, tag=short-name
shadowsocksr=example.com:443, method=aes-256-cfb, password=pwd, tag=ssr-wrong-prefix
anytls=example.com:443, password=pwd, over-tls=true, tag=[Premium] Reserved
anytls=example.com:443, password=pwd, over-tls=true, tag=Traffic Remaining
```

See [nexitally-parser.md](nexitally-parser.md) for the exact regexes.
