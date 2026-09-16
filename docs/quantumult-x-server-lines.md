# Quantumult X server lines used in the examples

Fixtures copy the official `[server_local]` shapes from [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf). Hosts and secrets are placeholders.

A server line is:

```text
<protocol>=<host>:<port>, <key>=<value>, ..., tag=<name>
```

The parser does not validate keys. If the prefix is supported and the line is not excluded, the whole trimmed line is forwarded.

## AnyTLS

Quantumult X 1.5.6+ understands AnyTLS. UDP is native; `udp-over-tcp` is unnecessary.

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=..., reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

`examples/fixtures/nexitally-mixed-protocols.conf` keeps one standard TLS line and one Reality line.

## Shadowsocks

```text
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=..., udp-relay=true, tag=ss2022
```

Optional fields seen in managed files include `obfs`, `obfs-host`, `obfs-uri`, `fast-open`, `udp-over-tcp`, and Reality keys. The parser forwards them unchanged.

## VMess / VLESS / Trojan

```text
vmess=example.com:80, method=aes-128-gcm, password=<uuid>, fast-open=false, udp-relay=false, tag=vmess-01
vless=example.com:443, method=none, password=<uuid>, obfs=over-tls, tag=vless-tls-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, tag=trojan-tls-01
```

## HTTP / SOCKS5

```text
http=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=http-02
socks5=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=socks5-02
```

## Comments

Quantumult X treats a line as a comment when it starts with `;`, `#`, or `//`. The parser uses the same rule after trim. A leftover `;anytls=...` line is not a server.

## What is not a Quantumult X server line

These appear in other clients and are dropped here:

```text
ss = host:port, password=..., tag=...
hysteria2 = host:port, password=..., tag=...
wireguard = host:port, tag=...
tuic = host:port, password=..., tag=...
```

See `nexitally-unsupported-only` in the [example catalog](examples-catalog.md).
