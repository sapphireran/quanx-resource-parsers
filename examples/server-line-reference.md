# Server line reference

Quantumult X server resources are plain text. Each live node is one line. The Nexitally parser keeps a line when the trimmed text starts with one of the prefixes below and does not match the metadata exclusion list.

The examples use documentation hosts and the sample credentials from the [official sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf). They are not a Nexitally subscription.

## Prefixes the parser accepts

| Prefix | Typical use in this repository |
| --- | --- |
| `anytls=` | Current Nexitally Quantumult X nodes |
| `shadowsocks=` | Older or mixed lists; also a common disguise for traffic rows |
| `vmess=` | Mixed lists |
| `vless=` | Mixed lists |
| `trojan=` | Mixed lists |
| `http=` | Mixed lists |
| `socks5=` | Mixed lists |

The match is case-insensitive. `AnyTLS=` and `anytls=` are the same prefix.

## Lines the parser rejects even with a valid prefix

The exclusion regex is:

```text
(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)
```

It is applied to the **whole line**, not only `tag=`. A live node whose tag contains `Traffic` will be dropped. That is intentional: Nexitally-style status rows use those words.

## Comment markers

Quantumult X treats a line as a comment when it starts with `;`, `#`, or `//`. The parser uses the same rule after trim.

## Minimal examples

Standard AnyTLS (Quantumult X 1.5.6+):

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
```

AnyTLS with Reality (same build family; parser forwards the fields unchanged):

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

Shadowsocks 2022:

```ini
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022-blake3-aes-128-gcm
```

VMess, VLESS, Trojan, HTTP, SOCKS5:

```ini
vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vmess-01
vless=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vless-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01
http=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=http-02
socks5=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=socks5-02
```

## Status rows that should not become nodes

```ini
shadowsocks=192.0.2.1:1, method=aes-128-gcm, password=pwd, tag=Traffic: 128 GB
shadowsocks=192.0.2.1:1, method=aes-128-gcm, password=pwd, tag=Expire: 2099-01-01
shadowsocks=192.0.2.1:1, method=aes-128-gcm, password=pwd, tag=流量: 128 GB
shadowsocks=192.0.2.1:1, method=aes-128-gcm, password=pwd, tag=到期: 2099-01-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, tag=[Premium] HK-99
```

These appear in `typical-full-config` and `comments-duplicates-meta`. The expected files contain none of them.

## What a `[server_remote]` resource should look like after parsing

The parser output is **only** server lines, one per line, no section header:

```ini
anytls=hk-01.example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=HK-01
anytls=jp-01.example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=JP-01
```

Quantumult X wraps that text in the `Nexitally` resource tag you set on the `[server_remote]` line. Do not return a second `[server_local]` header. Do not return `[policy]` or `[filter_local]`.
