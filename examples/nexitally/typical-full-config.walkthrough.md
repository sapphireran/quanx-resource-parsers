# Walkthrough: `typical-full-config.conf`

This is the annotated version of the main happy-path fixture. The parser never sees this markdown; it only sees the sibling `.conf` file as `$resource.content`.

## Lines that never reach the filter

Everything outside `[server_local]` is discarded by the section regex, including:

| Block | Why it is ignored |
| --- | --- |
| `[general]` / `resource_parser_url` | Wrong section. Also, a live parser URL does not belong inside a downloaded Nexitally body. |
| `[dns]` | Not servers. |
| `[policy]` | Local policy must stay in the device profile, not in the remote resource. |
| `[server_remote]` / `[filter_remote]` | Remote lists from the managed full config would fight a personal profile. |
| `[filter_local]` / `[rewrite_local]` / `[mitm]` | Same reason. The whole point of the parser is to leave these on the device. |

## Lines inside `[server_local]`

| Line (abbreviated) | Result | Rule |
| --- | --- | --- |
| `# Traffic: 12.3 GB / 500 GB` | drop | Comment prefix `#` |
| `# Expire: 2026-12-31` | drop | Comment prefix `#` |
| `# Days Left: 106` | drop | Comment prefix `#` |
| `# 流量：12.3 GB` / `# 到期：...` | drop | Comment prefix `#` |
| `; leftover dashboard comment` | drop | Comment prefix `;` |
| `// another comment style` | drop | Comment prefix `//` |
| `anytls=... tag=HK-01` | **keep** (1) | `anytls=` prefix, no exclusion keyword |
| `anytls=... tag=JP-01` | **keep** (2) | same |
| `anytls=... tag=[Premium] SG-VIP` | drop | `[Premium]` substring |
| second `anytls=... tag=HK-01` | drop | exact duplicate of the first kept line |
| `shadowsocks=... tag=SS-01` | **keep** (3) | official prefix |
| `vmess=... tag=VMess-01` | **keep** (4) | official prefix |
| `vless=... tag=VLESS-01` | **keep** (5) | official prefix |
| `trojan=... tag=Trojan-01` | **keep** (6) | official prefix |
| `http=... tag=HTTP-01` | **keep** (7) | official prefix |
| `socks5=... tag=SOCKS-01` | **keep** (8) | official prefix |
| `ss=... tag=Bare-SS` | drop | `ss=` is not `shadowsocks=` |
| `shadowsocksr=...` | drop | extra `r` before `=` |
| `anytls=... tag=套餐余量` | drop | `套餐` substring |

Expected `$done({ content })` therefore has **eight** lines, in that keep order. See `typical-full-config.expected.txt`.

## Reproduce

```bash
node examples/run-parser.js --only typical-full-config --verbose --dump
```
