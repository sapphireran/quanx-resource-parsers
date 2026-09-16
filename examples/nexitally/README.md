# Nexitally fixtures

Each `*.conf` is a fake Quantumult X body. The parser sees that string as `$resource.content`.

## typical-full-config

A shortened managed profile: `[general]`, `[dns]`, `[policy]`, a dummy `[server_remote]`, a populated `[server_local]`, then `[filter_local]`.

`[server_local]` includes:

- traffic / expiry comments in English and Chinese
- two AnyTLS nodes that should survive
- a `[Premium]` placeholder
- an exact duplicate of `HK-01`
- shadowsocks, vmess, vless, trojan, http, socks5
- `ss=` and `shadowsocksr=` lines that must not survive
- a node tagged `套餐余量` that the exclusion regex drops

Expected keepers: HK-01, JP-01, SS-01, VMess-01, VLESS-01, Trojan-01, HTTP-01, SOCKS-01.

## section-at-eof

No section follows `[server_local]`. The regex must consume through end of file rather than requiring a later `[...]` header.

## mixed-case-header

`[SERVER_LOCAL]` with a single AnyTLS line. Confirms the `i` flag on the section regex.

## crlf-and-bom

The runner builds this case in memory from `crlf-and-bom.source.conf` by prefixing U+FEFF and joining with `\r\n`. The committed source file is LF-only so git stays readable; the manifest sets `"transform": "bom-crlf"`.

## comments-and-duplicates

Three comment styles, a blank line, a real node, a duplicate of that node, and a second distinct node. Expected: two lines, original order.

## spaced-protocol-equals

`anytls = node.example.com:443, ...` must pass `supported` because the regex allows `\s*=`.

## unsupported-prefixes

`ss=` and `shadowsocksr=` only. Expected error: no usable servers. Documents that official Quantumult X SSR samples must start with `shadowsocks=`.

## placeholders-only

Premium tag plus `剩余` / `流量` lines. Expected error: no usable servers.

## empty-server-local

Header, blank lines, next section. Expected error: no usable servers.

## no-server-local

A plausible profile that never declares `[server_local]`. Expected error: section not found. This is also what HTML or Clash input looks like to the regex (no match).

## inner-spaced-header

`[ server_local ]` is **not** accepted. Expected error: section not found.

## glued-header

`[server_local]anytls=...` on one line. Expected error: section not found.

## second-section-ignored

Two `[server_local]` blocks. Only `FIRST-01` from the first block is returned. `SECOND-01` is a regression guard.

## exclusion-substring

`tag=HK-01` kept, `tag=HK-Traffic-01` dropped. Makes the substring rule obvious so a future change is deliberate.
