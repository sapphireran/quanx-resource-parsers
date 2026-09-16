# Parser behavior

`nexitally-node-parser.js` is a Quantumult X resource parser. Quantumult X downloads the Nexitally URL itself, then runs this script against the response body. The script never opens a network connection and never reads persistent storage.

Official sandbox notes, from [crossutility/Quantumult-X `resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js):

- `$resource.content` is the UTF-8 body of the resource.
- `$resource.link` is the original URL or local path.
- `$resource.tag` is the `tag=` value on the `[server_remote]` line (v1.0.10-build277+).
- `$resource.info` is the `subscription-userinfo` response header when the server sends one (v1.0.10-build277+).
- `$resource.user_agent` is set only during a UA retry (v1.5.6-build921+).
- `$done({ content })` replaces the resource with Quantumult X server lines.
- `$done({ error })` fails the resource update.
- HTTP request APIs and persistent storage are not available in a resource parser.

This parser uses `$resource.content` and `$done` only. It does not read `$resource.info`, does not implement hash-parameter filtering, and does not request a User-Agent retry.

## Input

The expected input is a **full Quantumult X configuration**, the kind Nexitally ships through Configuration File → Download. The useful nodes live in `[server_local]`. Other sections (`[general]`, `[dns]`, `[policy]`, `[filter_local]`, `[filter_remote]`, `[rewrite_remote]`, `[server_remote]`) are ignored on purpose so a local profile can keep its own policies and rules.

The script:

1. Coerces `$resource.content` to a string.
2. Strips a leading UTF-8 BOM.
3. Normalizes `\r\n` to `\n`.
4. Captures the first `[server_local]` section, stopping at the next `[section]` header or end of file.

`[server_local]` must sit on its own line, which is how Quantumult X writes sections. A header with servers on the same line is not a valid Quantumult X section and will fail the lookup.

## Keep list

A trimmed line is kept when all of the following are true:

1. It is not empty.
2. It is not a comment. Comments start with `;`, `#`, or `//`.
3. It starts with a supported Quantumult X server type.
4. It does not match the exclusion pattern.
5. It has not already been seen in this parse (exact-line deduplication).

Supported types, case-insensitive:

| Prefix | Notes |
| --- | --- |
| `anytls=` | Native AnyTLS. Quantumult X 1.6.0 (store, 2026-05-21) and 1.5.6 TestFlight 914+ understand the official line format, including `over-tls=true` and Reality (`reality-base64-pubkey`, `reality-hex-shortid`). AnyTLS carries UDP over TCP; do not add `udp-over-tcp` yourself. |
| `shadowsocks=` | Includes Shadowsocks 2022 methods and SSR-style `ssr-protocol` lines that still use the `shadowsocks=` prefix. |
| `vmess=` | |
| `vless=` | Native VLESS since Quantumult X 1.5.5. |
| `trojan=` | |
| `http=` | |
| `socks5=` | |

Anything else (`hysteria2=`, `wireguard=`, `tuic=`, bare `ss://` URIs, Clash YAML, Surge lists) is dropped.

## Drop list

The exclusion pattern is case-insensitive:

```text
[Premium] | Traffic | Expire | Reset | Days Left | 流量 | 到期 | 剩余 | 套餐
```

Nexitally commonly encodes plan status as fake `shadowsocks=` / `anytls=` rows inside `[server_local]`. Those rows would otherwise appear as dead nodes. Premium inventory that Nexitally marks with `[Premium]` is also dropped because it is not part of the base plan.

The same tokens match anywhere on the line, including the `tag=`. A live node named `Reset-01` or `Traffic-Edge` would be dropped. If that collision appears in a real export, rename the fixture and the exclusion list together.

Exact duplicate lines are removed. First occurrence wins. Whitespace-only differences survive because the comparison runs after `trim()` but does not canonicalize field order.

## Output

On success the script returns only the kept server lines, joined with `\n`. There is no `[server_remote]` header, no policy block, and no trailing blank line beyond what `join` produces.

That body is what Quantumult X stores for the remote server resource. Existing `[policy]` groups that select `resource-tag-regex=^Nexitally` keep working because the resource tag stays on the `[server_remote]` line, not inside the parser output.

## Errors

| Condition | `$done({ error })` |
| --- | --- |
| No `[server_local]` section | `Nexitally parser: [server_local] section was not found.` |
| Section found, zero kept lines | `Nexitally parser: no usable server entries were found.` |

Both messages are covered by the fixtures in `docs/examples/`.

A Clash, Shadowrocket, or Surge subscription will take the first path. This parser is not a generic format converter. It will not accept Shawn's hash parameters (`#emoji=1&in=香港`) because it never reads `$resource.link`.

## What this parser does not do

- It does not fetch the Nexitally URL. Quantumult X does.
- It does not store the Nexitally URL, account id, or node password.
- It does not rewrite `[policy]`, `[filter_*]`, or `[rewrite_*]`.
- It does not convert non-Quantumult-X subscription formats.
- It does not implement the parser helper UI protocol (`$parser.hashSchema`, v1.5.6-build918+).
- It does not surface `$resource.info` traffic headers. Nexitally's full-configuration export puts traffic in `[server_local]` tags instead, and those tags are dropped.

## Compatibility

| Piece | Requirement |
| --- | --- |
| Resource parsers | Quantumult X v1.0.8-build253 or later |
| `$resource.tag` / `$resource.info` | v1.0.10-build277 or later (unused here, documented for the sandbox) |
| VLESS | Quantumult X 1.5.5 or later |
| AnyTLS | Quantumult X 1.6.0, or 1.5.6 TestFlight build 914 or later |
| Reality TLS on AnyTLS | Same AnyTLS builds; official field names as in `sample.conf` |

If Nexitally later publishes an official **server-only** Quantumult X subscription, point `[server_remote]` at that URL and remove this parser.
