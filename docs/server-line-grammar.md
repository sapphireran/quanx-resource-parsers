# Server line grammar

The parser does not validate fields. If the prefix is allowed and no exclusion token appears, the line is forwarded as-is. Quantumult X then parses the node.

Official shapes below are taken from [sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf) and appear uncommented in `examples/cases/official-seven-prefixes.conf`.

## Prefixes this parser keeps

```
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=apple.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, tag=ss-obfs-http-01
vmess=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vmess-01
vless=example.com:80, method=none, password=23ad6b10-8d1a-40f7-8ad0-e3e35cd32291, fast-open=false, udp-relay=false, tag=vless-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, fast-open=false, udp-relay=false, tag=trojan-tls-01
http=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=http-02
socks5=example.com:80, username=name, password=pwd, fast-open=false, udp-relay=false, tag=socks5-02
```

## AnyTLS

Nexitally's current Quantumult X export uses AnyTLS. Official notes: UDP is native (no separate `udp-over-tcp`); `reality-base64-pubkey` switches standard TLS to Reality.

```
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, reality-base64-pubkey=k4Uxez0sjl8bKaZH2Vgi8-WDFshML51QkxKFLWFIONk, reality-hex-shortid=0123456789abcdef, udp-relay=true, tag=anytls-reality-tls-01
```

The parser treats Reality fields as opaque. Fixture: `anytls-reality`.

## Shadowsocks 2022 and SSR

Still `shadowsocks=`. The method / `ssr-protocol` fields do not matter to the keep/drop regex.

```
shadowsocks=example.com:80, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022-blake3-aes-128-gcm
shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, ssr-protocol-param=def, obfs=tls1.2_ticket_fastauth, obfs-host=apple.com, tag=ssr
```

## Hosts

IPv6 literals use brackets, as in documentation-prefix fixtures:

```
anytls=[2001:db8::10]:443, password=pwd, over-tls=true, tls-host=apple.com, tag=香港-01
```

CJK tags are fine unless they contain `流量` / `到期` / `剩余` / `套餐`.

## What is not a server line

Share links (`vmess://`, `ss://`), Clash `proxies:` YAML, Surge modules, and HTML login pages never produce a `[server_local]` body this parser accepts. Those fixtures all end in the missing-section error.
