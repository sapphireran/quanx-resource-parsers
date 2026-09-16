# Source walkthrough

The production script is 38 lines. Every keep / drop decision in the examples is a consequence of those lines. This page quotes them in order.

The script is ES5 on purpose. Quantumult X's resource-parser host is not a current Node runtime.

## 1. Normalize the body

```javascript
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");
```

| Step | Effect | What it does *not* do |
| --- | --- | --- |
| `String(...)` | `undefined` / `null` become `""`. | It does not JSON-decode, Base64-decode, or YAML-parse. |
| `/^\uFEFF/` | Drops a single leading UTF-8 BOM. | A BOM in the middle of the file stays. |
| `/\r\n/g` | Turns Windows newlines into `\n`. | **Lone `\r` (classic Mac) is left as `\r`.** A file saved with CR-only line endings will usually fail the section match. |

After this, every later regex sees Unix newlines — unless the download used CR-only endings.

## 2. Find the first `[server_local]` section

```javascript
var match = text.match(
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
);
```

Read the pieces from left to right.

| Piece | Meaning |
| --- | --- |
| `(?:^|\n)` | The header starts at the beginning of the file **or** after a newline. A header glued to the previous line (`foo[server_local]`) does not match. |
| `\s*` | Leading spaces or tabs on the header line are fine. A leading `;` or `#` is **not** whitespace, so a commented header is ignored. |
| `\[server_local\]` | Literal brackets, no spaces inside. `[ server_local ]` does not match. |
| `\s*\n` | Optional spaces after `]`, then a **required newline**. `[server_local]anytls=...` on one line does not match. `[server_local]` at EOF with no newline after `]` does not match. |
| `([\s\S]*?)` | Capture the body, including blank lines, non-greedy. |
| `(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)` | Stop at the next INI section header (any name in `[...]` on its own line) **or** at end of file. |

Flags: `i` — `[SERVER_LOCAL]` and `[Server_Local]` both work.

Consequences that show up in fixtures:

- Two `[server_local]` blocks: only the **first** is captured. The lookahead treats the second header as a terminator.
- A later `[Premium]` **section** (not a tag) terminates the capture. Lines after that header are invisible to the filter.
- `[server_remote]`, `[filter_local]`, `[policy]` all terminate the same way.
- An HTML login page or a Clash `proxies:` document has no such header → first error path.

## 3. Missing section is fatal

```javascript
if (!match) {
  $done({ error: "Nexitally parser: [server_local] section was not found." });
}
```

No fallback, no "maybe these bare `anytls=` lines are a server list." A server-only snippet *without* the header is an error. That is deliberate: it is how we notice "Nexitally started shipping a flat list" or "the download is a captive portal."

## 4. Classify every line in the capture

```javascript
var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
var excluded  = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
var seen = {};
```

Then, for each raw line:

1. `trim()` — leading / trailing space and tabs go away. Interior spacing stays. Dedup keys are the **trimmed** string.
2. Drop empty lines.
3. Drop lines whose trimmed form starts with `;`, `#`, or `//`.
4. Drop lines that fail `supported`.
5. Drop lines that match `excluded` **anywhere** in the line.
6. Drop lines already in `seen`.
7. Otherwise keep, and record the trimmed line in `seen`.

Order matters. A commented `anytls=...` is a comment, not a server. A `vmess=...` line that also contains `Traffic` is excluded even though the prefix is supported.

## 5. Supported prefixes

`supported` is anchored at `^` **after trim** and allows spaces before `=`.

| Kept if it starts with | Not kept (common lookalikes) |
| --- | --- |
| `anytls=` | `anytls-reality=` as a scheme name (not used by QX; Reality is a *parameter*) |
| `shadowsocks=` | `ss=`, `ssr=`, `shadowsocks2022=` (the digits sit between the name and `=`) |
| `vmess=` | `vmess://` URI share links |
| `vless=` | `vless://` URI share links |
| `trojan=` | `trojan-go=` |
| `http=` | `https=` (the extra `s` breaks the alternation) |
| `socks5=` | `socks=`, `socks5h=` |

Case is ignored: `AnyTLS=`, `ShadowSocks=`, `HTTP=` all match.

SSR in Quantumult X is still a `shadowsocks=` line with `ssr-protocol=...`. Those lines **are** kept. A fictional `ssr=` prefix is not.

## 6. Excluded banners

`excluded` is **unanchored**. It fires if the token appears in the host, password, or tag.

| Token | Typical banner | Accidental hit (false friend) |
| --- | --- | --- |
| `[Premium]` | Placeholder row from the panel | A real node tagged `[Premium]` is dropped too. |
| `Traffic` | `Traffic: 128 GB` | Unlikely in a hostname; still substring-based. |
| `Expire` | `Expire: 2026-12-31` | **`unexpired` contains `Expire`.** |
| `Reset` | `Reset: 12 days` | **`Preset` contains `Reset`.** `tag=Preset-HK` is dropped. |
| `Days Left` | `Days Left: 12` | `DaysLeft` (no space) and `Days  Left` (two spaces) do **not** match. |
| `流量` / `到期` / `剩余` / `套餐` | 剩余流量, 到期时间, 套餐重置 | A password or tag that includes 套餐 is dropped. |

See [05-keep-drop-and-false-friends.md](05-keep-drop-and-false-friends.md) for the fixture that locks `Preset` / `unexpired`.

## 7. Empty usable set is fatal

```javascript
if (!servers.length) {
  $done({ error: "Nexitally parser: no usable server entries were found." });
} else {
  $done({ content: servers.join("\n") });
}
```

A file can *have* `[server_local]` and still fail: only comments, only banners, only unsupported schemes, or only duplicates of an already-dropped shape. The error string is the second one, not the first. Troubleshooting starts by asking which of the two you actually saw.

## 8. What the result looks like

Kept lines are joined with `\n`. There is no trailing newline added beyond the last line, no header, and no rewrite of fields (`udp-relay`, `tag`, Reality pubkey, …). The parser is a sieve, not a normalizer.
