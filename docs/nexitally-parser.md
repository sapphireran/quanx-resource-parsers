# Nexitally node parser

`nexitally-node-parser.js` is a Quantumult X **resource parser**. Quantumult X downloads the Nexitally URL itself. The script only sees the response body and returns a server-only resource.

Nexitally's **Configuration File → Download** link is a complete Quantumult X profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, remote filter lists, and so on. Importing that file replaces the active profile. The parser exists so the same download can be attached under `[server_remote]` with `opt-parser=true`. Only the node lines are imported. Local policy, filter, and rewrite sections stay under personal control.

If Nexitally later publishes an official server-only Quantumult X subscription, prefer that resource and delete this parser from `[general]`.

## What the script does

1. Read `$resource.content` as UTF-8 text.
2. Strip a leading UTF-8 BOM and normalize `\r\n` to `\n`.
3. Locate the first `[server_local]` section (case-insensitive). The section runs until the next `[…]` header or end-of-file.
4. Keep a line when it is:
   - non-empty after trim;
   - not a comment starting with `;`, `#`, or `//`;
   - a supported Quantumult X server scheme;
   - free of the exclusion markers below;
   - not an exact duplicate of an earlier kept line.
5. `$done({ content })` with the kept lines joined by `\n`, or `$done({ error })` when the section is missing or nothing usable remains.

The script never reads `$resource.link`. The subscription URL stays on the device.

## Supported schemes

The leading token must be one of:

```
anytls
shadowsocks
vmess
vless
trojan
http
socks5
```

Unknown schemes (`hysteria2`, `wireguard`, …) are dropped. That list matches the protocols Quantumult X documents in `sample.conf` for `[server_local]`.

## Exclusion markers

A line is dropped when it matches any of these, case-insensitive, anywhere on the line:

| Marker | Typical source |
| --- | --- |
| `[Premium]` | Placeholder rows for a higher plan |
| `Traffic` | English quota banner |
| `Expire` | English expiry banner |
| `Reset` | Reset-cycle banner |
| `Days Left` | Remaining-days banner |
| `流量` | Chinese quota banner |
| `到期` | Chinese expiry banner |
| `剩余` | Chinese remaining-quota / remaining-days banner |
| `套餐` | Chinese plan banner |

A real node whose `tag=` contains one of those words is also dropped. That is intentional: Nexitally info rows are often formatted as fake servers.

## De-duplication

Keys are the full trimmed line, not the `tag=`. Two rows with the same host but different tags are both kept. The same line repeated after surrounding whitespace is kept once.

## Errors

| Situation | `$done({ error })` |
| --- | --- |
| No `[server_local]` section | `Nexitally parser: [server_local] section was not found.` |
| Section found but every line was a comment, unsupported, excluded, or a duplicate of an already-dropped set | `Nexitally parser: no usable server entries were found.` |

Quantumult X surfaces that string on the resource. The desktop harness prints the same text to stderr.

## What the script does not do

- It does not convert Clash, Surge, or SIP002 URI lists. The input is already Quantumult X.
- It does not rewrite names, add emoji, or force `udp-relay`. Use a general-purpose parser such as KOP-XIAO's if those transforms are needed after this one.
- It does not fetch URLs. HTTP APIs are unavailable inside a resource parser.
- It does not read or write the rest of the personal profile.

## Section regex

The extractor is:

```js
/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
```

Consequences:

- `[SERVER_LOCAL]` and padded `[server_local]` headers match.
- A later `[policy]` / `[filter_local]` / `[server_remote]` header ends the capture.
- If `[server_local]` is the last section, capture runs to end-of-file.
- A `[server_local]` header with no following newline does not match. Real Quantumult X profiles always put the header on its own line.

See `examples/nexitally/` for inputs that lock this behavior down.
