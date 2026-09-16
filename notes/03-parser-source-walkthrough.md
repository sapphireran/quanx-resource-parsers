# 03 — Source walkthrough

This note reads `nexitally-node-parser.js` in source order. The script is short; every branch matters.

## 1. Normalize the body

```js
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");
```

`String(undefined)` is `"undefined"` in some sloppy wrappers; the `|| ""` guard avoids that. Only a leading BOM is stripped. A BOM in the middle of the file would be left alone and would fail the section regex.

CR-only (`\r`) line endings are not rewritten. That is an accepted limitation: Quantumult X and this workbook feed LF or CRLF.

## 2. Slice `[server_local]`

```js
var match = text.match(
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
);
```

| Piece | Meaning |
| --- | --- |
| `(?:^|\n)` | Header at byte 0 or after a newline |
| `\s*` | Leading indent on the header line |
| `\[server_local\]` | Case-insensitive section name |
| `\s*\n` | Optional trailing space, then a **required** newline |
| `([\s\S]*?)` | Body, non-greedy |
| `(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)` | Stop before the next `[section]` line, or at EOF |

Consequences, each covered by a workbook case:

- `[Server_Local]` matches (`header-mixed-case`).
- `  [server_local]` matches (`header-indented`).
- `[ server_local ]` does **not** match (`inner-spaced-header`).
- `[server_local]anytls = …` on one line does **not** match (`glued-header`).
- A file that is only `[server_local]` with no trailing newline does **not** match (`header-no-newline`).
- The first header wins (`first-of-two-server-local`).
- `[Premium]`, `[policy]`, `[filter_local]`, `[server_remote]` all terminate the slice (`premium-section-terminator`, `section-fence-filter-policy`).

No match → `$done({ error: "Nexitally parser: [server_local] section was not found." })`.

## 3. Keep / drop each line

```js
var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
var excluded  = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
```

After `trim()`:

1. Empty → drop.
2. Line starts with `;`, `#`, or `//` → drop.
3. Line does not match `supported` → drop.
4. Line matches `excluded` **anywhere** → drop.
5. Exact trimmed duplicate → drop.
6. Otherwise keep, in file order.

`supported` only checks the prefix. Parameters are not parsed. A well-formed `anytls =` line and a garbage `anytls = not-a-host` line are treated the same.

`excluded` is a substring test. `tag=HK-Reset-01` is dropped because of `Reset` (`substring-reset-trap`). `DaysLeft` without a space is **not** dropped. That asymmetry is part of the current script, not a bug in the workbook.

## 4. Emit

Zero keepers → `$done({ error: "Nexitally parser: no usable server entries were found." })`.

Otherwise `$done({ content: servers.join("\n") })`. There is no trailing newline after the last server. Quantumult X accepts that.

## What the script never does

- It does not validate host:port.
- It does not decode URI shares (`vmess://`, `ss://`).
- It does not read Clash YAML.
- It does not consult `$resource.link` or HTTP status text. An HTML login page fails because it has no `[server_local]`, not because the parser sniffed `<!doctype`.
