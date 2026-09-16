# Quantumult X server lines

The Nexitally parser keeps a line when it starts with a known scheme and does not look like a quota banner. The shapes below are copied from the official `sample.conf` / `server-complete.snippet` and rewritten onto `*.example.invalid` hosts. They are not live nodes.

## Common fields

A server line is `scheme=host:port` plus comma-separated `key=value` fields. `tag=` is the display name shown in the node list. Comments in a profile start with `;`, `#`, or `//`.

`udp-relay` is independent of the parser. AnyTLS natively carries UDP over TCP; the official sample still sets `udp-relay=true` on those rows.

## AnyTLS

Requires a Quantumult X build that documents AnyTLS (1.5.6+ in the public sample). Standard TLS:

```ini
anytls=hk-01.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Hong Kong 01
```

Reality replaces standard TLS when `reality-base64-pubkey` is set. The pubkey and short id below are the official sample values:

```ini
anytls=tw-05.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=Taipei 05 Reality
```

## Shadowsocks

```ini
shadowsocks=ss.nodes.example.invalid:80, method=chacha20, password=pwd, obfs=http, obfs-host=www.apple.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, tag=Shadowsocks HTTP
```

`obfs=tls` is the shadowsocks simple-obfs plugin. `obfs=over-tls` is real TLS. Those are different settings.

## VMess / VLESS

```ini
vmess=vmess.nodes.example.invalid:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, fast-open=false, udp-relay=false, tag=VMess TLS
vless=vless.nodes.example.invalid:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, fast-open=false, udp-relay=false, tag=VLESS TLS
```

The UUID above is the official sample password, not an account identifier from this repository.

## Trojan / HTTP / SOCKS5

```ini
trojan=trojan.nodes.example.invalid:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=Trojan TLS
http=http.nodes.example.invalid:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=HTTP
socks5=socks.nodes.example.invalid:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=SOCKS5
```

## Lines the parser drops

```ini
hysteria2=hy2.nodes.example.invalid:443, password=pwd, tag=Unsupported Hysteria2
anytls=premium.nodes.example.invalid:443, password=pwd, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=Osaka [Premium]
# Traffic: 12.34 GB / 500.00 GB
```

See [nexitally-parser.md](nexitally-parser.md) for the full exclusion list and `examples/nexitally/mixed-protocols.conf` for a fixture that includes both kept and dropped rows.
