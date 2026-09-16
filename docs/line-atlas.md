# Line atlas

Quantumult X server lines are `protocol=host:port, key=value, …, tag=Name`. This page lists the shapes the Nexitally parser **can keep**, the metadata it **drops**, and a few lookalikes that survive or fail for surprising reasons.

All examples use hosts and placeholder secrets from the official [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf). They are not Nexitally nodes.

## Protocols the parser accepts

The prefix is case-insensitive. Spaces around `=` are allowed.

| Prefix | Typical use | Notes |
| --- | --- | --- |
| `anytls=` | AnyTLS over standard TLS or Reality | UDP-over-TCP is native; no separate `udp-over-tcp` flag is required |
| `shadowsocks=` | Shadowsocks, SS2022, and many SSR-shaped lines | A line that starts with `shadowsocks=` is kept even when it also has `ssr-protocol=` |
| `vmess=` | VMess tcp / ws / wss / over-tls | Official sample UUID is a placeholder |
| `vless=` | VLESS; `method` should be `none` | Reality and `vless-flow` fields are preserved as-is |
| `trojan=` | Trojan TLS or `obfs=wss` | `over-tls` and `obfs=wss` should not be mixed |
| `http=` | HTTP / HTTPS proxy | `obfs` is not used on `http=` |
| `socks5=` | SOCKS5, optionally `over-tls=true` | `socks=` without `5` is **not** accepted |

### AnyTLS

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

Requires a Quantumult X build that implements AnyTLS (v1.5.6 and later).

### Shadowsocks / SS2022

```ini
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=apple.com, obfs-uri=/resource/file, udp-relay=false, tag=ss-obfs-http-01
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022-blake3-aes-128-gcm
```

### VMess / VLESS / Trojan / HTTP / SOCKS5

```ini
vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, udp-relay=false, tag=vmess-01
vless=example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, udp-relay=false, tag=vless-tls-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, udp-relay=false, tag=trojan-tls-01
http=example.com:80, username=name, password=pwd, udp-relay=false, tag=http-02
socks5=example.com:80, username=name, password=pwd, udp-relay=false, tag=socks5-02
```

IPv6 literals are kept if the line still matches a supported prefix:

```ini
vmess=[2001:db8::1]:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, tag=vmess-ipv6
```

## Lines the parser drops on purpose

Managed full configs often prepend account banners to `[server_local]`. Those lines may look like HTTP proxies:

```ini
http=127.0.0.1:80, tag=Traffic: 12.30 GB / 500.00 GB
http=127.0.0.1:80, tag=Expire: 2099-12-31
http=127.0.0.1:80, tag=Reset: 7 Days Left
http=127.0.0.1:80, tag=流量：12.30 GB / 500.00 GB
http=127.0.0.1:80, tag=到期：2099-12-31
http=127.0.0.1:80, tag=剩余：7 天
http=127.0.0.1:80, tag=套餐：Premium
anytls=example.com:443, password=pwd, over-tls=true, tag=HK [Premium]
```

Each of those matches the exclusion in [parser-specification.md](parser-specification.md) and is dropped.

Comments (`;`, `#`, `//`) and blank lines are dropped. Exact duplicates after trim keep the first copy.

## Lookalikes

| Line | Decision | Why |
| --- | --- | --- |
| `https=example.com:443, tag=HTTPS` | drop | Prefix is `https`, not `http` |
| `socks=example.com:1080, tag=SOCKS` | drop | Prefix is `socks`, not `socks5` |
| `hysteria2=example.com:443, tag=HY2` | drop | Not in the supported list |
| `static = Proxy, Node-A, Node-B` | drop | Policy syntax, not a server |
| `host, example.com, proxy` | drop | Filter syntax |
| `ANYTLS=example.com:443, password=pwd, tag=UP` | keep | Protocol match is case-insensitive |
| `anytls = example.com:443, password=pwd, tag=SP` | keep | Spaces around `=` are allowed |
| `anytls=example.com:443, password=pwd, tag=Reset-HK` | drop | Unanchored `Reset` |
| `anytls=example.com:443, password=pwd, tag=DaysLeft` | keep | `Days Left` requires a space |

The atlas cases under [`examples/atlas/cases/`](../examples/atlas/cases/) lock each of these rows to an expected file.
