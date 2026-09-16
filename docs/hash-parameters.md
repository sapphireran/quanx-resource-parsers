# Hash parameters

Quantumult X passes the resource URL to the parser as `$resource.link`.
A `#fragment` on that URL is available to the script. `[server_remote]`
options after the comma (`tag=`, `opt-parser=`, `update-interval=`) are
not part of `$resource.link`.

```ini
[server_remote]
https://subscription.example.test/quantumult-x#in=HK+SG&out=VIP, tag=Nexitally, opt-parser=true, enabled=true
```

This parser implements a **small** subset of the community parser
conventions. It does not implement emoji, rename, sort, or rewrite/filter
conversion.

## Parameters

| Key | Applies to | Meaning |
| --- | --- | --- |
| `in` | node `tag=` | Keep the line if the tag contains **any** of the `+`-separated keywords. |
| `out` | node `tag=` | Drop the line if the tag contains **any** of the `+`-separated keywords. |
| `regex` | full line | Keep the line if this regular expression matches (case-insensitive). |
| `regout` | full line | Drop the line if this regular expression matches (case-insensitive). |
| `keep-info` | full line | `1` / `true` / `yes` keeps traffic/expiry placeholder nodes. |
| `keep-premium` | full line | `1` / `true` / `yes` keeps `[Premium]` placeholder nodes. |

`in` and `out` are case-insensitive substring checks. They do not use
regular expressions. `.` is a literal character, not "AND".

`regex` / `regout` are JavaScript `RegExp` patterns with the `i` flag.
An invalid pattern returns a parser error instead of a node list.

Keyword matching uses `+` as OR. Do **not** decode `+` as a space. A
space inside a keyword must be percent-encoded as `%20`.

## Examples

Keep Hong Kong and Singapore tags:

```text
#in=HK+SG
```

Drop tags containing `VIP`:

```text
#out=VIP
```

Keep only AnyTLS lines:

```text
#regex=^anytls\s*=
```

Drop websocket transports:

```text
#regout=obfs=wss
```

Debug: keep dashboard placeholders (not for daily use):

```text
#keep-info=1&keep-premium=1
```

Combined:

```text
#in=HK+SG&regout=^http\s*=
```

Locally:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf \
  --link 'https://subscription.example.test/quantumult-x#in=HK'
```

That command should match `examples/hash-in-hk.expected.txt`.

## Encoding

| Character in a value | In the URL |
| --- | --- |
| space | `%20` |
| `&` | `%26` |
| `#` | `%23` |
| `+` (literal plus, rare) | `%2B` |

`in=Hong%20Kong` becomes the keyword `Hong Kong`.
`in=HK+SG` stays two keywords, `HK` and `SG`.

## What is not supported

- `emoji`, `rename`, `replace`, `sort`, `udp`, `tfo`, `cert`
- `in` / `out` AND via `.`
- filter/rewrite `inhn` / `outhn` / `policy`
- `$parser` UI schema (Quantumult X v1.5.6 helper protocol)

Those belong in a general-purpose parser. This one only unwraps
Nexitally-style node lists.
