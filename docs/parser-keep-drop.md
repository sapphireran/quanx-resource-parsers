# Keep vs drop (Nexitally parser)

Every non-comment line inside `[server_local]` is classified independently. Matching is case-insensitive.

## Kept

The line must start with one of these schemes (optional spaces are trimmed first):

`anytls=` · `shadowsocks=` · `vmess=` · `vless=` · `trojan=` · `http=` · `socks5=`

Examples (placeholders):

```ini
anytls=hk-1.example.com:443, password=example-password-not-real, over-tls=true, tls-host=www.example.com, udp-relay=true, tag=HK-01
shadowsocks=ss.example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss-2022
vmess=vmess.example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, tag=vmess-01
vless=vless.example.com:443, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, obfs=over-tls, tag=vless-tls-01
trojan=trojan.example.com:443, password=example-password-not-real, over-tls=true, tag=trojan-tls-01
http=http.example.com:80, username=example-user, password=example-password-not-real, tag=http-01
socks5=socks.example.com:80, username=example-user, password=example-password-not-real, tag=socks5-01
```

## Dropped — comments and blanks

```ini
;anytls=commented.example.com:443, password=example-password-not-real, over-tls=true, tag=HK-commented
#anytls=hash.example.com:443, password=example-password-not-real, over-tls=true, tag=HK-hash
//anytls=slash.example.com:443, password=example-password-not-real, over-tls=true, tag=HK-slash
```

## Dropped — quota, expiry, plan, premium placeholders

The **whole line** is discarded if it contains any of these substrings:

| Token | Typical `tag=` |
| --- | --- |
| `Traffic` | `Traffic: 12.34 GB / 500 GB` |
| `Expire` | `Expire: 2099-12-31` |
| `Reset` | `Reset: 1st of month` |
| `Days Left` | `Days Left: 30` |
| `流量` | `流量 12.34 GB` |
| `到期` | `到期 2099-12-31` |
| `剩余` | `剩余 20 天` |
| `套餐` | `套餐 Standard` |
| `[Premium]` | `SG-01 [Premium]` |

A real node whose name happens to include those tokens will also be dropped. Rename it on the vendor side or fork the regex if that happens.

## Dropped — unknown schemes

```ini
wireguard=wg.example.com:51820, private-key=not-a-real-key, tag=wg-01
hysteria=hy.example.com:443, password=example-password-not-real, tag=hy-01
```

## Dedup

```ini
anytls=hk-1.example.com:443, password=example-password-not-real, over-tls=true, tls-host=www.example.com, udp-relay=true, tag=HK-01
anytls=hk-1.example.com:443, password=example-password-not-real, over-tls=true, tls-host=www.example.com, udp-relay=true, tag=HK-01
```

Result: one line. Comparison is the entire trimmed line, not `tag=` alone.

## Outside `[server_local]`

`[general]`, `[dns]`, `[policy]`, `[server_remote]`, `[filter_local]`, `[rewrite_local]`, `[mitm]` — ignored. See `test/fixtures/surrounding-sections.conf`.
