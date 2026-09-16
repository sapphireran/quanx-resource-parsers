# Extraction ledger

This is a receipt of what `nexitally-node-parser.js` actually does. The regexes below are copied from the script. `tools/check.js` fails if the script drifts away from them.

## 0. Normalize the body

```javascript
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");
```

| Input quirk | After normalize |
| --- | --- |
| Missing `$resource.content` | `""` |
| UTF-8 BOM | Stripped only at index 0 |
| Windows CRLF | LF |
| Bare CR (`\r` without `\n`) | Unchanged (a later section match may fail) |

## 1. Cut the first `[server_local]` section

```javascript
/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
```

Read it as five facts:

1. The header may sit at the start of the file or after a newline.
2. Horizontal whitespace **before** `[server_local]` is allowed (`  [server_local]`).
3. Inner spaces are **not** allowed (`[ server_local ]` does not match).
4. A newline **after** the header is required. `[server_local]anytls=…` on one line is a miss → `$done({error})`.
5. The body is non-greedy until the next line that looks like `[anything]` (optional surrounding spaces) **or** EOF.

The next-section lookahead is why a later `[filter_local]`, `[policy]`, or even `[Premium]` **ends** the cut. Lines after that header never reach the keep/drop filter.

Two `[server_local]` blocks: the first wins. The second is after a `[…]` terminator or is simply never seen.

No match at all →

```text
Nexitally parser: [server_local] section was not found.
```

Typical misses: Clash YAML, an HTML interstitial, a server-only snippet that never used a section header, or servers sitting under `[server_remote]` instead.

## 2. Filter lines inside the cut

Each line is `trim()`’d, then run through this order. First failure wins.

| Order | Test | Decision |
| --- | --- | --- |
| 1 | empty after trim | drop (blank) |
| 2 | trimmed line starts with `;` or `#` or `//` | drop (comment) |
| 3 | does not match `^(?:anytls\|shadowsocks\|vmess\|vless\|trojan\|http\|socks5)\s*=` (case-insensitive) | drop (unsupported scheme) |
| 4 | matches `(?:\[Premium\]\|Traffic\|Expire\|Reset\|Days Left\|流量\|到期\|剩余\|套餐)` | drop (info / placeholder) |
| 5 | exact trimmed line already kept | drop (duplicate) |
| 6 | otherwise | keep, in file order |

Zero keeps after the loop →

```text
Nexitally parser: no usable server entries were found.
```

Otherwise `$done({ content: servers.join("\n") })`. No trailing newline is added after the last server.

## 3. Scheme list, including the near-misses

`http` is kept. `https=` is **not**: the pattern is `http\s*=`, so `https=` has an extra `s` before `=`.

`socks5` is kept. `socks=` is not.

`shadowsocks` is kept, including SS2022 methods and `ssr-protocol=` extras. A line that starts `shadowsocksr=` or `ssr=` is not.

`anytls` is kept, including Reality (`reality-base64-pubkey`, `reality-hex-shortid`).

`hysteria`, `hysteria2`, `tuic`, `wireguard`, `vmess://` URI lines, and Clash `- name:` mappings are unsupported.

Space before `=` is allowed (`AnyTLS =host:443, …`) because of `\s*=`.

## 4. Info / placeholder substring traps

The exclude regex is **unanchored**. It fires on any substring of the trimmed line, including `tag=` and `password=`.

| Needle | Drops | Does not drop |
| --- | --- | --- |
| `[Premium]` | `tag=JP-01 [Premium]` | `tag=JP-01 Premium` (no brackets) |
| `Traffic` | `tag=Traffic: 12GB` | — |
| `Expire` | `tag=Expire: 2099-12-31` | — |
| `Reset` | `tag=Reset: 5 Days Left`, `tag=Reset-Node` | `tag=restart-01` |
| `Days Left` | needs the space | `tag=DaysLeft` |
| `流量` `到期` `剩余` `套餐` | Chinese banners | — |

False friends worth remembering:

- `password=TrafficJam` is dropped.
- `tag=Reset-HK-01` is dropped even if it is a real node name.
- `tag=Days Left-01` is dropped; `tag=DaysLeft-01` is kept.

Do not “fix” these in the parser unless a real Nexitally dump requires it. The fixtures lock current behavior.

## 5. Comments are whole-line only

`;`, `#`, and `//` apply only at the start of the **trimmed** line. An inline `#` inside a tag stays. `/* block */` is not a comment; the line is then usually dropped as an unsupported scheme.

A commented header `; [server_local]` is not a header. The real header must still appear later, un-commented.

## 6. Dedup key

Dedup is the full trimmed line, not `(host, port, tag)`. Two nodes on the same host with different tags are both kept. A true copy-paste duplicate is kept once (first occurrence).

## 7. What is never returned

- `[general]`, `[dns]`, `[policy]`, filters, rewrites, MITM
- Provider traffic/expiry placeholders
- `[Premium]` upsell rows
- Duplicate rows
- Anything after the section cut
