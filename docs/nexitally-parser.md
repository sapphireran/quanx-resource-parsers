# Nexitally node parser

`nexitally-node-parser.js` is a Quantumult X resource parser for one personal use case: Nexitally distributes a **full** Quantumult X configuration, and re-importing that file overwrites a locally maintained profile. The parser turns the embedded `[server_local]` section into a server-only resource so nodes can refresh without replacing `[policy]`, `[filter_remote]`, or `[mitm]`.

If Nexitally later publishes an official server-only Quantumult X subscription, delete `resource_parser_url` (or stop setting `opt-parser=true` on that resource) and use the official list.

## Why a parser instead of "Download configuration"

| Path | What Quantumult X does | What happens to a personal profile |
| --- | --- | --- |
| Configuration File → Download | Replaces the active configuration | Local policy names, filter order, MITM hostnames, and rewrite resources disappear |
| `[server_remote]` without `opt-parser` | Imports the body as server lines | A full `.conf` is not a server list; section headers become garbage nodes |
| `[server_remote]` + this parser | Downloads the full file, then keeps only usable `[server_local]` lines | Local sections stay untouched; only the Nexitally server set updates |

The third path is the one this repository exists for.

## Processing pipeline

The script is intentionally linear. Each step has a fixture in `examples/fixtures/`.

```text
$resource.content
        │
        ▼
 strip UTF-8 BOM (U+FEFF)
        │
        ▼
 normalize CRLF → LF
        │
        ▼
 locate [server_local] … next [section] or EOF
        │
        ├─ missing ──► $done({ error: "[server_local] section was not found." })
        │
        ▼
 split lines, trim
        │
        ▼
 drop empty / comment lines (; # //)
        │
        ▼
 keep allow-listed protocol prefixes only
        │
        ▼
 drop traffic / expiry / [Premium] / 套餐 rows
        │
        ▼
 drop exact-line duplicates (first occurrence wins)
        │
        ├─ nothing left ──► $done({ error: "no usable server entries were found." })
        │
        ▼
 $done({ content: lines joined by \n })
```

### 1. BOM and newlines

```javascript
var text = String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n");
```

`$resource.content` is coerced to a string so a missing body becomes `""` and fails the section match instead of throwing. Only a leading BOM is removed. A BOM in the middle of the file is not expected from Quantumult X.

`\r` that is not part of `\r\n` is left alone. If a future download used bare CR, add a fixture before changing this.

### 2. Section extraction

```javascript
var match = text.match(
  /(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
);
```

Properties:

- Case-insensitive header (`[Server_Local]` still matches)
- Optional spaces around the header
- Non-greedy body so the first following `[...]` header wins
- Works when `[server_local]` is the last section

The header line itself is not included in the capture. A file whose only content is `[server_local]` with no trailing newline currently fails the match (the pattern requires `\n` after the header). Real Quantumult X configurations always have a newline; `examples/fixtures/header-without-body.conf` documents the empty-body error path.

### 3. Comments and blanks

A line is dropped when, after trim, it is empty or matches `^(?:;|#|\/\/)`.

Inline comments after a server line are **not** stripped. Quantumult X sample lines do not use trailing comments. If a provider starts appending `# remark` on the same line, add a fixture before inventing a stripper — `#` also appears inside URIs and tags.

### 4. Protocol allow-list

```javascript
var supported = /^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i;
```

Unknown prefixes are discarded rather than forwarded. That is the difference between an extractor and `cat`. See [compatibility.md](compatibility.md) for prefixes that are intentionally omitted.

### 5. Traffic and placeholder exclusion

```javascript
var excluded = /(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i;
```

These words appear in two common shapes:

```ini
shadowsocks=127.0.0.1:443, method=chacha20, password=pwd, tag=Traffic: 88.0 GB
anytls=example.com:443, password=pwd, over-tls=true, tag=HK-01 [Premium]
```

Both are dropped. The first is a dashboard row. The second is a reserved slot. Remaining lines are treated as connectable.

### 6. Deduplication

```javascript
if (seen[line]) return false;
seen[line] = true;
```

The key is the entire trimmed line, not the `tag=`. Two hosts that share a tag but differ elsewhere both survive. Two copies of the same line collapse to one. Order is first-seen.

This is enough for a provider that repeats the same row in `[server_local]`. It is not a fuzzy "same hostname" merge.

## Error strings

Stable strings so troubleshooting docs and the fixture runner can match them:

| Condition | `$done` payload |
| --- | --- |
| No `[server_local]` header | `{ error: "Nexitally parser: [server_local] section was not found." }` |
| Header present, zero usable lines | `{ error: "Nexitally parser: no usable server entries were found." }` |
| At least one usable line | `{ content: "<line>\\n<line>..." }` |

Errors never include `$resource.link` or `$resource.content`. See [privacy.md](privacy.md).

## What the parser does not do

- It does not rewrite `tag=`, add emoji, or sort by region.
- It does not read `#in=` / `#out=` hash parameters.
- It does not convert Clash, Surge, or URI subscriptions.
- It does not merge with servers already in the local `[server_local]`.
- It does not inspect `[server_remote]` inside the downloaded file. If Nexitally nested another subscription there, those URLs are ignored (and must not be copied into this repo).

Policy grouping stays in the local profile:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=., img-url=https://example.com/icon.png
available = Nexitally-Auto, resource-tag-regex=^Nexitally, server-tag-regex=^(HK|TW|SG|JP)
```

See `examples/local-profile.sample.conf`.

## Changing the script

Keep changes small and fixture-backed:

1. Add or edit a file under `examples/fixtures/`.
2. Add the expected content or error under `examples/expected/`.
3. Register the case in `examples/manifest.json`.
4. Run `node examples/run-fixtures.js`.
5. Only then edit `nexitally-node-parser.js`.

Prefer a new fixture over widening a regex "just in case." The exclusion list in particular is easy to over-fit to one provider screenshot.

## Hosting the script

Quantumult X downloads `resource_parser_url` as plain JavaScript. jsDelivr and raw.githubusercontent.com both work:

```text
https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Pinning a commit (`@<sha>`) is safer than `@main` if you want a frozen extractor. A personal profile can pin; this documentation uses `@main` so clones stay simple.

Older notes in this repo mentioned `pang990801/quanx-resource-parsers`. That was the same personal project under a previous GitHub username. New profiles should use `sapphireran/quanx-resource-parsers`.
