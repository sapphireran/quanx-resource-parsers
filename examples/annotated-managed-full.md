# Annotated typical managed-full fixture

Source: [`cases/typical-managed-full/input.conf`](cases/typical-managed-full/input.conf)

This file is shaped like a Nexitally **full** Quantumult X configuration, not like a server-only snippet. Every hostname is fake.

## Sections the parser never returns

`[general]`, `[dns]`, `[policy]`, `[server_remote]`, `[filter_local]`, `[rewrite_local]`, `[mitm]` exist so the fixture looks like an import-the-whole-profile download. The cut starts at `[server_local]` and stops at `[server_remote]`. Policy groups in the fixture are **provider** policy, which is exactly what a personal profile should not refresh from the subscription.

## Lines inside `[server_local]`

| Kind | Example tag | Decision |
| --- | --- | --- |
| English banners | `Traffic: 12.3/100GB`, `Expire: 2099-12-31`, `Reset: 5 Days Left` | `DROP_INFO` |
| Chinese banners | `流量` `到期` `剩余` `套餐` | `DROP_INFO` |
| Upsell | `JP-01 [Premium]` | `DROP_INFO` (`[Premium]`) |
| AnyTLS | `JP-Tokyo-A` | `KEEP` |
| AnyTLS + Reality | `JP-Osaka-B` | `KEEP` |
| Shadowsocks | `HK-A` | `KEEP` |
| VMess | `SG-A` | `KEEP` |
| VLESS | `US-A` | `KEEP` |
| Trojan | `DE-A` | `KEEP` |
| HTTP helper | `Helper-HTTP` | `KEEP` |
| SOCKS5 helper | `Helper-SOCKS5` | `KEEP` |
| Copy-paste of `JP-Tokyo-A` | same full line | `DROP_DUPLICATE` |
| Whole-line comments | `;` `#` `//` | `COMMENT` |
| Other schemes | `HY-Drop`, `WG-Drop`, `HTTPS-Drop` | `DROP_SCHEME` |

Expected keeps, in order: Tokyo AnyTLS, Osaka Reality, HK Shadowsocks, SG VMess, US VLESS, DE Trojan, HTTP helper, SOCKS5 helper. Eight lines. See `expected.txt`.

## What a personal profile should do instead

Copy [`profile/assembled-personal-profile.snippet.conf`](profile/assembled-personal-profile.snippet.conf). That file **does not** include `[server_local]`. It points `[server_remote]` at a placeholder URL with `opt-parser=true` and selects nodes with `resource-tag-regex=Nexitally`.
