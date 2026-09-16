# 04 — Keep / drop reason codes

The studio prints one code per input line. Codes are derived from the **same** regular expressions as `nexitally-node-parser.js`. They are documentation, not a second parser with different rules.

## Pipeline (first `[server_local]` only)

```text
normalize BOM + CRLF
        │
        ▼
 locate first  [server_local]  followed by a newline
        │
        ├─ no match  →  ERROR_NO_SECTION
        │
        ▼
 for each trimmed line inside that block
        │
        ├─ empty / whitespace          →  DROP_EMPTY
        ├─ starts with ;  #  //        →  DROP_COMMENT
        ├─ not a supported prefix      →  DROP_UNSUPPORTED
        ├─ matches the exclusion regex →  DROP_EXCLUDED
        ├─ exact duplicate after trim  →  DROP_DUPLICATE
        └─ otherwise                   →  KEEP
        │
        ▼
 no KEEP lines  →  ERROR_NO_USABLE
```

The section ends at the next INI header (`\n[something]`) or at EOF. A later `[Premium]`, `[filter_local]`, or second `[server_local]` is a terminator, not more server text.

## Codes

| Code | When |
| --- | --- |
| `KEEP` | Supported prefix, not excluded, first time this exact trimmed line appears |
| `DROP_EMPTY` | Blank after trim |
| `DROP_COMMENT` | Line starts with `;`, `#`, or `//` |
| `DROP_UNSUPPORTED` | Not `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, or `socks5` (optional spaces before `=`) |
| `DROP_EXCLUDED` | Line matches `[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, or `套餐` (case-insensitive, substring) |
| `DROP_DUPLICATE` | Same trimmed text already kept |
| `OUTSIDE_SECTION` | Line is before the first `[server_local]` or after the terminator |
| `SECTION_HEADER` | The `[server_local]` line itself (the capture starts on the next line) |
| `ERROR_NO_SECTION` | No `[server_local]` header followed by a newline |
| `ERROR_NO_USABLE` | Section found, but every line was dropped |

## Substring traps (replay these)

| Input fragment | Result | Why |
| --- | --- | --- |
| `tag=HK-Reset-01` | `DROP_EXCLUDED` | `Reset` is a substring |
| `tag=HK-Preset-01` | `DROP_EXCLUDED` | `preset` contains `reset` |
| `tag=HK-RST-01` | `KEEP` | `RST` does not match `Reset` |
| `tag=Days Left` | `DROP_EXCLUDED` | Space-sensitive token |
| `tag=DaysLeft` | `KEEP` | No space, so `Days Left` does not match |
| `[Premium]` as its own INI header | Terminates the section | Next `\n[…]` ends the capture |
| `[Premium]` in a server tag | `DROP_EXCLUDED` | Exclusion regex |

`studio/fixtures/reset-substring-trap` and `days-left-spacing` exist so these do not stay folklore.

## What the parser returns

- Success: `$done({ content })` where `content` is the `KEEP` lines joined by `\n`.
- Failure: `$done({ error })` with one of:

  ```text
  Nexitally parser: [server_local] section was not found.
  Nexitally parser: no usable server entries were found.
  ```
