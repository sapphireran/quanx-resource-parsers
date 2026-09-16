# Personal examples

Sanitized Quantumult X fixtures for `nexitally-node-parser.js`. Nothing here is a live Nexitally download.

## How to run

```bash
npm test
node bench/run.js --dump examples/cases/managed-full-profile.conf
node bench/run.js --why "anytls=example.com:443, password=pwd, tag=HK-Reset-01"
```

The bench evaluates the committed parser with Quantumult X `$resource` / `$done` globals. It does not fetch a URL and it throws if a script reads `$resource.link`.

## Catalog

| id | what it shows |
| --- | --- |
| `managed-full-profile` | Typical vendor full config: keep four nodes, drop banners / duplicate / `[Premium]` |
| `managed-full-profile-crlf-bom` | Same body after BOM + CRLF normalization |
| `official-seven-prefixes` | Official `anytls` / `shadowsocks` / `vmess` / `vless` / `trojan` / `http` / `socks5` samples |
| `anytls-reality` | AnyTLS Reality + SS2022 Reality (opaque extra fields) |
| `ssr-and-ss2022` | Official SSR and SS2022 `shadowsocks=` lines |
| `placeholders-en-zh` | `Traffic` / `Expire` / `Reset` / `Days Left` / `流量` / `到期` / `剩余` / `套餐` |
| `reset-substring-trap` | `HK-RST-01` kept; `HK-Reset-01` and `HK-Preset-01` dropped |
| `days-left-spacing` | `Days Left` dropped; `DaysLeft` and `Days_Left` kept |
| `premium-as-tag` | `[Premium]` inside `tag=` |
| `premium-as-section` | `[Premium]` as the next heading (section cut) |
| `false-friend-password` | `password=pwdTraffic` is excluded |
| `comments-duplicates` | `;` `#` `//` plus exact-line dedupe |
| `inline-hash-kept` | `#` mid-line is not a comment |
| `block-comment-not-recognized` | `/* */` is unsupported, not a comment |
| `mixed-case-header` | `[Server_Local]` / `AnyTLS=` |
| `leading-ws-header` | Indented heading, tab-prefixed server line |
| `server-local-at-eof` | Section is last in the file |
| `first-of-two-sections` | First `[server_local]` wins |
| `section-leak` | No leak from `[policy]` / `[filter_local]` / `[server_remote]` |
| `space-before-equals` | `anytls =host` is still supported |
| `http-vs-https` | `https=` / `socks=` / `ss=` drop |
| `ipv6-cjk-tags` | `2001:db8::` and CJK tags; `剩余-01` drops |
| `same-host-different-tag` | Dedup is exact-line, not host-based |
| `glued-header` | `[server_local]anytls=...` is not a section |
| `inner-spaced-header` | `[ server_local ]` is not a heading |
| `header-without-body-newline` | Heading at EOF without `\n` |
| `missing-server-local` / `commented-section-name` | Documented missing-section error |
| `empty-server-local` / `comments-only` / `unsupported-only` | Documented empty-result error |
| `html-interstitial` / `clash-yaml` / `base64-vmess` | Wrong payload shapes |

Expected keep lists live next to the `.conf` files as `.keep` sidecars. Error strings are pinned in `manifest.json`.

## Device snippets

`examples/profile/` is copy-paste for a **private** Quantumult X profile:

- `local-general.conf` — `resource_parser_url` pointing at this repository
- `local-server-remote.conf` — `opt-parser=true` with a URL **token**
- `local-policy.conf` — `resource-tag-regex=^Nexitally`

Replace `YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL` on the device only.

## Hosts

Fixtures use `*.example.invalid`, `example.com`, official Quantumult X sample passwords / UUIDs / Reality placeholders, and documentation IPv6 `2001:db8::/32`. Do not replace them with a real export.
