# Nexitally parser contract

This is the keep / drop specification for `nexitally-node-parser.js`. The Node checker treats the examples as the executable version of this page.

## Input

`$resource.content` is treated as a UTF-8 Quantumult X document.

Before matching:

1. a leading UTF-8 BOM is stripped;
2. CRLF newlines are folded to LF.

`$resource.link`, `$resource.tag`, `$resource.info`, and `$resource.user_agent` are ignored.

## Section isolation

The parser looks for a `[server_local]` header, case-insensitive, with optional surrounding whitespace. The header must sit on its own line.

Everything after that newline and before the next `[section]` header (or the end of the file) is the candidate body.

Consequences:

- `[SERVER_LOCAL]` works.
- `  [server_local]  ` works.
- `[server_remote]`, `[filter_local]`, `[rewrite_local]`, and `[mitm]` after the section are not read.
- A file with no `[server_local]` section returns:

  `Nexitally parser: [server_local] section was not found.`

See `examples/nexitally/fixtures/extra-sections.conf` and `missing-section.conf`.

## Line rules, in order

Each candidate line is trimmed. Then:

| Step | Rule | Result |
| --- | --- | --- |
| 1 | empty line | drop |
| 2 | starts with `;`, `#`, or `//` | drop |
| 3 | does not match a supported protocol | drop |
| 4 | matches the exclusion regex | drop |
| 5 | exact duplicate of an earlier kept line | drop |
| 6 | otherwise | keep, original trimmed text |

If nothing remains:

`Nexitally parser: no usable server entries were found.`

## Supported protocols

A line must match this regular expression, case-insensitive:

```text
^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=
```

Whitespace before `=` is allowed. The parser does not rewrite the line, so `anytls = host:443, ...` is kept with the space.

Not supported, and therefore dropped:

- `hysteria2=`, `tuic=`, `wireguard=`
- a bare `ssr=` type (Quantumult X usually encodes SSR as `shadowsocks` plus `ssr-protocol`)
- `https=` (the accepted HTTP type is `http=`)

`http=` is anchored as `http\s*=`, so `https=` does not sneak through.

## Exclusions

A line is dropped if it matches this regular expression, case-insensitive:

```text
(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)
```

These words appear in managed profiles as fake nodes or as banners inside a real-looking server line. Typical tags:

- `Traffic: 128.50 GB`
- `Expire: 2026-12-31`
- `Reset: 7 Days Left`
- `[Premium]` / `[Premium] Upgrade`
- `套餐流量剩余 50GB`

The match is against the **whole line**, not only `tag=`. A password or host that contained `Traffic` would also be dropped. That is acceptable for this personal parser; Nexitally info rows are the target, and example fixtures use those words only in tags.

## Deduplication

Dedup is exact-string after trim. Two lines that differ by a single flag are both kept. Two copies of the same line are collapsed to one, first occurrence wins.

## Output

Success:

```javascript
$done({ content: servers.join("\n") });
```

The string is server lines separated by `\n`. There is no trailing section header and no extra blank line added by the parser.

Failure:

```javascript
$done({ error: "Nexitally parser: ..." });
```

The script never returns `retry`.

## Worked happy path

Input (abridged from `examples/nexitally/fixtures/happy-path.conf`):

```ini
[server_local]
anytls=node-01.example.com:443, ..., tag=Nexitally-HK-01
anytls=node-02.example.com:443, ..., tag=Nexitally-JP-01
anytls=node-01.example.com:443, ..., tag=Nexitally-HK-01
anytls=info.example.com:443, ..., tag=Traffic: 128.50 GB
shadowsocks=1.1.1.1:1, ..., tag=[Premium] Upgrade
trojan=node-03.example.com:443, ..., tag=Nexitally-SG-01
```

Output:

```ini
anytls=node-01.example.com:443, ..., tag=Nexitally-HK-01
anytls=node-02.example.com:443, ..., tag=Nexitally-JP-01
trojan=node-03.example.com:443, ..., tag=Nexitally-SG-01
```

## Contrast with the generic extractor

`examples/generic-server-local/extract-server-local.js` stops after steps 1, 2, and 5. It does not apply protocol or exclusion filters. Use it when you want to see the raw `[server_local]` body.

The Nexitally parser is intentionally stricter so Traffic / Expire / `[Premium]` rows never appear as pingable servers.
