# Keep / drop rules and false friends

This page is the acceptance table the examples replay against. If a future edit of `nexitally-node-parser.js` changes a cell, `node scripts/verify.js` should fail until the fixture (or the script) is updated on purpose.

## Pipeline, in the order the script uses

```
raw body
  → strip one leading BOM
  → CRLF to LF   (CR-only unchanged)
  → first [server_local] … next [section] or EOF
        missing  → error: section was not found
  → each captured line, trimmed
        empty            → drop
        ^;  ^#  ^//      → drop   (comment)
        not supported=   → drop   (unsupported-prefix)
        excluded token   → drop   (info-or-premium)
        exact seen       → drop   (duplicate)
        else             → keep
  → zero keeps           → error: no usable server entries
  → else                 → content = keeps joined by \n
```

## Prefix roster

Kept prefixes, case-insensitive, optional spaces before `=`:

`anytls` · `shadowsocks` · `vmess` · `vless` · `trojan` · `http` · `socks5`

Dropped prefixes that people reasonably expect to work:

| Line starts with | Why it drops |
| --- | --- |
| `https=` | `http` is the only HTTP family prefix. |
| `socks=` | `socks5` is the only SOCKS prefix. |
| `ss=` / `ssr=` | Quantumult X writes `shadowsocks=`. |
| `shadowsocks2022=` | The `2022` sits between the name and `=`. Use `shadowsocks=` + `method=2022-blake3-...`. |
| `hysteria2=` / `hy2=` / `tuic=` / `wireguard=` | Not in the alternation. |
| `vmess://` / `ss://` | Share-URI schemes, not Quantumult X server lines. |
| `static=` / `available=` | Policy lines that leaked into the section. |
| `host,` / `ip-cidr,` | Filter rules that leaked into the section. |

## Banner roster

Dropped if the token appears **anywhere** in the trimmed line (`i` flag):

`[Premium]` · `Traffic` · `Expire` · `Reset` · `Days Left` · `流量` · `到期` · `剩余` · `套餐`

`Days Left` is the only English token that requires an interior space.

## False friends (locked by fixtures)

These are not bugs we are fixing in this PR. They are properties of unanchored `/Expire/` and `/Reset/`. The field guide records them so a later change is a decision, not an accident.

| Input fragment | Decision today | Why |
| --- | --- | --- |
| `tag=Preset-HK` | **drop** | `Preset` contains `Reset`. |
| `tag=unexpired-cache` | **drop** | `unexpired` contains `Expire`. |
| `tag=HK-01` (no token) | keep | Control row in the same fixture. |
| `tag=DaysLeft-01` | keep | `Days Left` needs the space. |
| `tag=Days Left-01` | drop | Exact token. |
| `password=placeholder-套餐` | drop | `套餐` is unanchored. |
| `tag=[Premium] HK` | drop | `[Premium]` is unanchored. |
| `anytls=..., tag=HK-01 # note` | keep | `#` is only special at the **start** of the trimmed line. |

If a real Nexitally tag ever ships as `Preset-*`, this parser will hide that node. Rename it in `[policy]` after import, or change `excluded` in a dedicated PR that updates the fixture.

## Section-shape traps

| Shape | Result | Fixture |
| --- | --- | --- |
| `[server_local]` then nodes, then `[filter_local]` | Nodes kept; filters ignored | `managed-full-profile` |
| `[server_local]` at EOF | Nodes kept | `section-at-eof` |
| `[ server_local ]` (spaces inside brackets) | Section not found | `inner-spaced-header` |
| `[server_local]anytls=...` (no newline after `]`) | Section not found | `glued-header` |
| `[server_local]` with no newline before EOF | Section not found | `header-no-newline` |
| `; [server_local]` then a real header later | The comment is skipped; the real header is used | `commented-section-name` |
| Two `[server_local]` blocks | First block only | `first-of-two-sections` |
| `[server_local]` then a `[Premium]` **section** | Capture stops at `[Premium]` | `premium-as-section` |
| CR-only newlines | Usually section not found | `cr-only-newlines` (encode flag) |
| UTF-8 BOM + CRLF | Kept after normalize | `bom-crlf` (encode flag) |

## Dedup

Dedup is exact equality of the **trimmed** line. The same host with a different `tag=` is two servers. The same line written twice with different leading tabs is one server.

## Comments

| Form | Decision |
| --- | --- |
| `; shadowsocks=...` | drop (comment) |
| `# anytls=...` | drop (comment) |
| `// vmess=...` | drop (comment) |
| `/* vmess=... */` | drop (unsupported-prefix) — not a comment |
| `! anytls=...` | drop (unsupported-prefix) |
| `anytls=..., tag=HK # leftover` | keep (inline `#` is not a comment) |
