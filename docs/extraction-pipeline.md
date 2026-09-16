# Extraction pipeline

`nexitally-node-parser.js` is a short script. This page is a walk of the committed source, not a rewrite of it.

## 1. Normalize the body

```javascript
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");
```

A Windows download often arrives as UTF-8 BOM + CRLF. Both are stripped before the section regex runs. Fixture: `managed-full-profile-crlf-bom`.

## 2. Cut the first `[server_local]`

```javascript
var match = text.match(/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i);
```

| piece | effect |
| --- | --- |
| `(?:^|\n)` | Heading may start the file or follow a newline. |
| `\s*` | Leading spaces/tabs on the heading line are fine. |
| `\[server_local\]` | Literal heading, case-insensitive (`i` flag). |
| `\s*\n` | Optional spaces, then a **required** newline. A glued `[server_local]anytls=...` does not match. |
| `([\s\S]*?)` | Non-greedy body. |
| `(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)` | Stop before the next `[heading]` or at EOF. |

Consequences worth remembering:

- `[Server_Local]` matches. `[ server_local ]` does not.
- The first heading wins. A second `[server_local]` later in the file is ignored.
- `[Premium]` as a later heading is a real terminator. Lines after it never enter the body.
- A heading mentioned only in a comment (`# [server_local]`) does not open a section.

If `match` is null the parser stops with `[server_local] section was not found.`

## 3. Filter each body line

```javascript
var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
var excluded = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
```

Order after `trim()`:

1. Drop empty lines.
2. Drop lines whose prefix is `;`, `#`, or `//`.
3. Drop lines that fail `supported`.
4. Drop lines that match `excluded` **anywhere**.
5. Drop lines already kept (exact string).

`http` does not swallow `https=`: after matching `http` the next characters must be whitespace or `=`. `https=` therefore fails `supported`. `Preset` contains `Reset` and fails `excluded`.

## 4. Return

No survivors → `no usable server entries were found.`

Otherwise → `$done({ content: servers.join("\n") })`.

The bench classifier in `bench/classify.js` repeats these steps so each fixture can show a reason code next to the parser output. `npm test` fails if the two ever disagree.
