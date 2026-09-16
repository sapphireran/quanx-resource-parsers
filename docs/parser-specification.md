# Parser specification

This page is a line-for-line contract for [`nexitally-node-parser.js`](../nexitally-node-parser.js). The atlas harness treats a disagreement between this document and the script as a bug.

## 1. Normalize the resource body

```javascript
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");
```

| Input detail | Effect |
| --- | --- |
| Missing `$resource.content` | Treated as `""` |
| UTF-8 BOM at byte 0 | Stripped |
| Windows `\r\n` | Converted to `\n` |
| Lone `\r` | Left unchanged |
| Encoding | Quantumult X already decodes the download as UTF-8 |

## 2. Locate the first `[server_local]` section

```javascript
/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
```

The match is case-insensitive and not global. **The first hit wins.**

A header counts only when:

1. It sits at the start of the file or after a newline.
2. Optional horizontal whitespace may precede `[`.
3. The name is `server_local` (any case).
4. Optional horizontal whitespace may follow `]`.
5. A **newline** follows that whitespace. A header glued to the next token is not a header.

The section body is the non-greedy run after that newline, ending at either:

- a later line that looks like `[section-name]` (optional surrounding whitespace), or
- the end of the file.

`[Premium]`, `[policy]`, `[filter_local]`, and `[SERVER_REMOTE]` all terminate the body. A tag such as `tag=HK [Premium]` does **not** terminate the section: it is not a line of its own.

If the header is missing, glued, or not followed by a newline:

```text
Nexitally parser: [server_local] section was not found.
```

## 3. Classify every line in that body

Each body line is `trim()`-ed, then checked in this order:

| Order | Test | Result | Reason code |
| --- | --- | --- | --- |
| 1 | Empty after trim | drop | `empty` |
| 2 | Starts with `;`, `#`, or `//` | drop | `comment` |
| 3 | Does not match a supported protocol prefix | drop | `unsupported` |
| 4 | Matches the metadata / placeholder exclusion | drop | `excluded-metadata` |
| 5 | Exact duplicate of an earlier kept line | drop | `duplicate` |
| 6 | Otherwise | keep | `usable-server` |

Supported prefix (case-insensitive, optional spaces around `=`):

```text
^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=
```

`https=`, `socks=`, `hysteria2=`, `tuic=`, `wireguard=`, and `static=` are unsupported. A ShadowsocksR line that still begins with `shadowsocks=` is treated as supported.

Exclusion (case-insensitive, substring anywhere on the trimmed line):

```text
(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)
```

Notes that follow from the literal pattern:

- `Days Left` requires that single space. `DaysLeft` and `Days  Left` are **not** excluded by this rule.
- `Reset`, `Traffic`, and `Expire` are unanchored English words. A node tag such as `Reset-HK` is dropped.
- `[Premium]` in a tag drops that one line; a later `[Premium]` *section header* also ends the body.

Duplicates are compared after trim. The first copy is kept.

## 4. Return content or the empty-usable error

If at least one line was kept:

```javascript
$done({ content: servers.join("\n") });
```

The returned body is server lines only. There is no `[server_local]` wrapper. Quantumult X writes those lines into the server resource.

If the section existed but every line was dropped:

```text
Nexitally parser: no usable server entries were found.
```

## 5. What the parser never does

- Fetch a URL. Quantumult X already downloaded `$resource.content`.
- Inspect `$resource.link`, `$resource.info`, `$resource.tag`, or `$resource.user_agent`.
- Retry with a different User-Agent.
- Rename nodes, add emoji, or force `udp-relay` / `fast-open`.
- Read a second `[server_local]` section.
- Keep policy, filter, rewrite, MITM, or DNS lines, even when they appear inside the matched body.
