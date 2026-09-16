# Nexitally node parser

Script: [`../nexitally-node-parser.js`](../nexitally-node-parser.js)

This parser is a personal workaround for Nexitally's **Configuration File →
Download** Quantumult X export. That export is a complete profile. Using it as
the active configuration overwrites `[general]`, `[policy]`, `[filter_*]`,
and `[rewrite_*]`.

The intended use is:

1. Keep a stable local Quantumult X profile.
2. Add the private Nexitally configuration URL as a `[server_remote]`
   resource with `opt-parser=true`.
3. Let this script strip the managed file down to server lines.

If Nexitally later publishes an official server-only Quantumult X subscription,
prefer that URL and remove this parser.

## Input shape

The downloaded body looks like a Quantumult X configuration, not a bare
node list. The only section this parser reads is `[server_local]`.

Typical extra sections in a managed file (all discarded):

- `[general]`
- `[dns]`
- `[policy]`
- `[filter_remote]` / `[filter_local]`
- `[rewrite_remote]` / `[rewrite_local]`
- `[mitm]`
- `[server_remote]` (the provider's own remote nodes, if any)

The extractor stops at the next `[section]` header or at end of file. That
boundary is what prevents `[policy]` lines from leaking into the server
resource.

A redacted managed-file fixture lives under `examples/nexitally/` once that
directory is added.

## Extraction steps

The script is deliberately small. The steps are:

1. Coerce `$resource.content` to a string.
2. Strip a leading UTF-8 BOM.
3. Normalize `\r\n` and leftover `\r` to `\n`.
4. Find `[server_local]` with a case-insensitive header match.
5. Capture until the next `[...]` header.
6. Split on newlines and `trim()` each line.
7. Drop empty lines and comments (`;`, `#`, `//`).
8. Keep lines whose first token is a supported server type.
9. Drop traffic / expiry / `[Premium]` placeholders.
10. Drop exact-line duplicates, keeping the first occurrence.
11. `$done({ content })` with the kept lines joined by `\n`, or `$done({ error })`.

### Supported server types

The type is the token before `=`:

```
anytls
shadowsocks
vmess
vless
trojan
http
socks5
```

Whitespace around `=` is allowed (`anytls = host:443, ...`). Types are matched
case-insensitively.

Unsupported types (WireGuard, hysteria, and anything else) are ignored rather
than passed through. Quantumult X would not import them as `[server_remote]`
lines anyway.

### Excluded placeholder lines

Nexitally (and similar managed profiles) sometimes inject non-connectable
rows into `[server_local]` so the app UI can show plan metadata. Those rows are
not servers. The parser drops a line if it matches any of:

| Pattern | Why |
| --- | --- |
| `[Premium]` | Placeholder node, not a live endpoint |
| `Traffic` / `流量` / `套餐` | Plan quota, not a host |
| `Expire` / `到期` | Expiry date disguised as a node tag |
| `Reset` / `Days Left` / `剩余` | Billing cycle metadata |

The check runs against the **whole line**, so a real node whose tag happens to
contain those words would also be dropped. That is intentional for this
personal parser: Nexitally's metadata rows are the thing being filtered, and
live node tags in the fixtures do not use those words.

### Deduplication

Dedup is exact-string after trim. Two lines that differ only by `tag=` are
different servers. Two copies of the same line collapse to one. Order of first
occurrence is preserved so policy `url-latency-benchmark` sees a stable list.

## Output shape

Success is a newline-separated list of Quantumult X server lines, **without** a
section header:

```
anytls=hk-01.example.test:443, password=example-password-not-real, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=HK-01
anytls=jp-01.example.test:443, password=example-password-not-real, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=JP-01
```

Quantumult X stores that body on the `[server_remote]` resource tagged
`Nexitally` (or whatever `tag=` you set locally).

## Error strings

| Error | Meaning |
| --- | --- |
| `Nexitally parser: [server_local] section was not found.` | The URL is probably already a server list, HTML, or another client's format. |
| `Nexitally parser: no usable server entries were found.` | The section existed but every line was a comment, placeholder, duplicate, or unsupported type. |

Those strings are stable. Example fixtures and the checker assert them.

## What stays local

The parser never needs:

- The Nexitally subscription URL
- Account id / token
- Node passwords from a real account

Those belong only in the on-device Quantumult X profile. Examples in this
repository use `*.example.test` hosts and `example-password-not-real`.

## Dual-mode export

On device, Quantumult X defines `$resource` and `$done`. The script is written
so a local Node checker can call the same extraction rules without sending
network requests.

## Maintenance checklist

When Nexitally changes the managed file:

1. Save a **redacted** copy of the new `[server_local]` shape (replace hosts,
   passwords, and any account text).
2. Confirm the extractor still returns only live server lines.
3. If a new protocol prefix appears, add it to the `supported` regex **and** to
   [qx-server-line-cheatsheet.md](qx-server-line-cheatsheet.md).
4. If a new metadata tag appears, add it to the `excluded` regex.
