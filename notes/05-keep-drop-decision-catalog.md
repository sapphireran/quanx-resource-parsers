# 05 — Keep / drop decision catalog

Decisions below match `nexitally-node-parser.js` as committed on `main`. The workbook traces the same rules (`npm run trace`).

## Section selection

| Input shape | Section found? | Case |
| --- | --- | --- |
| Typical full profile with `[server_local]` then `[filter_local]` | yes, first block only | `managed-full-profile` |
| Header spelled `[Server_Local]` | yes | `header-mixed-case` |
| Spaces before `[server_local]` | yes | `header-indented` |
| `[ server_local ]` | no | `inner-spaced-header` |
| `[server_local]` glued to the first server | no | `glued-header` |
| `[server_local]` without a following newline | no | `header-no-newline` |
| Section is last in the file | yes, to EOF | `section-at-eof` |
| Two `[server_local]` blocks | yes, first only | `first-of-two-server-local` |
| Only `[server_remote]` | no | `server-remote-only` |
| Empty file | no | `empty-file` |
| HTML login / payment interstitial | no | `html-interstitial` |
| Clash YAML | no | `clash-yaml` |
| Preamble text, then a valid header | yes | `preamble-banner` |
| `[Premium]` as the next section | yes, cut before `[Premium]` | `premium-section-terminator` |

Missing section is always:

`Nexitally parser: [server_local] section was not found.`

## Line classification (inside the slice)

| Line (trimmed) | Action | Reason |
| --- | --- | --- |
| empty / whitespace | drop | empty |
| `; comment` / `# comment` / `// comment` | drop | comment |
| `anytls = host:443, …, tag=JP-01` | keep | supported prefix |
| `AnyTLS=host:443, …` | keep | prefix is case-insensitive |
| `anytls = host…` (spaces around `=`) | keep | `\s*` in `supported` |
| `\tanytls = host…` | keep | trim before test |
| `shadowsocks=` / `vmess=` / `vless=` / `trojan=` / `http=` / `socks5=` | keep | roster |
| `wireguard = …` | drop | unsupported-prefix |
| `vmess://eyJ…` | drop | unsupported-prefix |
| `static=Nexitally, JP-01` | drop | unsupported-prefix |
| `host, example.invalid, direct` | drop | unsupported-prefix |
| `…, tag=Traffic: 12GB` | drop | excluded substring `Traffic` |
| `…, tag=Expire: 2099-12-31` | drop | `Expire` |
| `…, tag=Reset in 5 days` | drop | `Reset` |
| `…, tag=HK-Reset-01` | drop | `Reset` substring trap |
| `…, tag=Days Left: 12` | drop | `Days Left` |
| `…, tag=DaysLeft: 12` | keep | space required |
| `…, tag=流量: 12GB` | drop | `流量` |
| `…, tag=到期: 2099-12-31` | drop | `到期` |
| `…, tag=剩余: 12` | drop | `剩余` |
| `…, tag=套餐: Premium` | drop | `套餐` |
| `…, tag=[Premium] Reserved` | drop | `[Premium]` |
| duplicate of an earlier kept line | drop | duplicate |
| same server with different spacing before trim, identical after | drop | duplicate-after-trim |

Zero keepers after the loop:

`Nexitally parser: no usable server entries were found.`

## False friends worth remembering

1. **`Reset` is not only a dashboard word.** A perfectly real node named `HK-Reset-01` is discarded. Prefer names like `HK-RST-01` in a personal profile if you ever tag nodes yourself.
2. **`Days Left` is a phrase.** `DaysLeft` survives. Do not “fix” one without noticing the other.
3. **`[Premium]` as a section header** is a fence, not a line filter. Servers *after* that header are not classified; they never enter the loop.

## How to extend the catalog

Add a row here and a case in `workbook/cases.cjs` in the same change. If the script and the table disagree, the script is the behavior; fix the table.
