# Nexitally node parser

`nexitally-node-parser.js` is a Quantumult X resource parser. It turns a managed **full** Quantumult X configuration into a server-only body that `[server_remote]` can store.

It contains no subscription URL, account id, or node password.

## Why it exists

Nexitally's Quantumult X download is a complete profile. Importing that file is fine once. Re-downloading it later replaces the active profile, including personal `[policy]`, `[filter_remote]`, `[rewrite_local]`, and `[mitm]` sections.

Quantumult X already has a better primitive for "refresh these nodes": `[server_remote]`. That section wants server lines, not a second copy of the whole profile. The parser is the adapter between those two shapes.

If Nexitally later publishes an official server-only Quantumult X subscription, delete this adapter.

## Contract

**Input:** `$resource.content` is a Quantumult X configuration (or a fragment that still contains a `[server_local]` section). UTF-8 BOM and `CRLF` are allowed.

**Output:**

- `$done({ content })` — kept server lines joined by `\n`
- `$done({ error })` — no `[server_local]` section, or no usable rows after filtering

The script does not notify, retry, or read `$resource.link`.

## Algorithm

The implementation is intentionally small. The steps are:

1. Coerce `$resource.content` to a string.
2. Strip a leading UTF-8 BOM.
3. Normalize `\r\n` to `\n`.
4. Find the first `[server_local]` section, case-insensitive, allowing whitespace around the header.
5. Capture until the next INI section header or end of file.
6. Split on newlines, trim each row.
7. Drop blank rows and comments (`;`, `#`, `//`).
8. Keep rows whose first token is a supported protocol.
9. Drop rows that match the metadata / Premium keyword list.
10. Drop exact duplicate rows, keeping the first copy.
11. Return the remaining rows, or an error if the list is empty.

Supported protocols:

```text
anytls shadowsocks vmess vless trojan http socks5
```

Excluded keyword pattern:

```text
[Premium] | Traffic | Expire | Reset | Days Left | 流量 | 到期 | 剩余 | 套餐
```

## Worked example

`examples/fixtures/nexitally-full-config.sample.conf` includes, among other lines:

```ini
[server_local]
shadowsocks=info.example.test:443, method=aes-128-gcm, password=placeholder, tag=Traffic: 128.50 GB / 500 GB
anytls=unused.example.test:443, password=unused, over-tls=true, tls-host=unused.example.test, udp-relay=true, tag=[Premium] Reserved Slot
anytls=hk-01.example.test:443, password=example-password-hk01, over-tls=true, tls-host=cdn.example.test, udp-relay=true, tag=HK-01 AnyTLS
anytls=hk-01.example.test:443, password=example-password-hk01, over-tls=true, tls-host=cdn.example.test, udp-relay=true, tag=HK-01 AnyTLS
```

The first row matches `Traffic`. The second matches `[Premium]`. The fourth is a duplicate of the third. The parser keeps one `HK-01` line.

The same fixture also has `[policy]` and `[filter_local]` after `[server_local]`. Those sections are not scanned for nodes. See `examples/fixtures/nexitally-section-boundaries.sample.conf`.

## Error strings

The messages are stable so local verification can pin them:

| Situation | `error` |
| --- | --- |
| No `[server_local]` header | `Nexitally parser: [server_local] section was not found.` |
| Section found, zero keepers | `Nexitally parser: no usable server entries were found.` |

A missing section is different from an empty section on purpose. The first usually means the wrong URL or a non-Quantumult-X body. The second usually means the upstream only shipped quota rows.

## What the parser does not do

- It does not decode `ss://` / `vmess://` / Clash / Surge.
- It does not honor `#in=` / `#out=` / `#rename=` hash parameters.
- It does not rewrite `tag=` values or add emoji.
- It does not merge `[server_local]` from more than one section. A second `[server_local]` later in the file is ignored.
- It does not treat a `tag=` collision as a duplicate unless the entire line matches.
- It does not strip `udp-relay`, `tls-verification`, or Reality fields.

## Quantumult X wiring

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. A full configuration loaded without the parser will not populate a server resource correctly.

jsDelivr caches by git ref. After a parser change, either wait, pin a commit SHA in the jsDelivr URL, or use the raw GitHub URL.

## Local verification

```bash
npm run verify
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sample.conf
```

The Node runner is documented in [local-verification.md](local-verification.md). The fixture catalog is in [../examples/README.md](../examples/README.md).

## Compatibility

Tested against Quantumult X configurations that embed AnyTLS nodes. The app must support both AnyTLS and resource parsers. Official AnyTLS support is documented in Quantumult X 1.5.6 (build 925) notes used by other converters; older builds will not understand `anytls=` lines even if this parser emits them.
