# Quantumult X resource-parser API

This repository only uses the official resource-parser contract. The canonical sample is:

[https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js)

The profile field is documented in [sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf).

## Where a parser is attached

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

The value may be an `https://` URL or a filename under Quantumult X's Scripts directory. There is a single parser slot for the profile. Every resource that sets `opt-parser=true` uses that script.

```ini
[server_remote]
https://example.com/private-full-config, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Without `opt-parser=true`, Quantumult X expects the body to already be Quantumult X server lines (or another built-in subscription flavor). A full `[general]` / `[server_local]` document will not import as nodes.

Parsers also apply to `[filter_remote]` and `[rewrite_remote]` when those lines set `opt-parser=true`. This Nexitally script is **not** written for those sections. Do not enable `opt-parser` on filter or rewrite resources while this file is the profile parser.

## Input object: `$resource`

| Field | When | Meaning |
| --- | --- | --- |
| `$resource.content` | always | UTF-8 body of the downloaded (or local) resource |
| `$resource.link` | always | Original URL, or a local path for a snippet |
| `$resource.info` | v1.0.10+ | `subscription-userinfo` response header, if the server sent one |
| `$resource.tag` | v1.0.10+ | `tag=` from the profile line |
| `$resource.user_agent` | v1.5.6+ | UA used for this download; empty on the first attempt |

The Nexitally parser reads only `$resource.content`.

## Output: `$done`

| Call | Effect |
| --- | --- |
| `$done({ content: "..." })` | Replace the resource body with this text |
| `$done({ error: "..." })` | Fail the refresh; Quantumult X shows the string |
| `$done({ retry: { user_agent: "..." } })` | v1.5.6+: download once more with that UA, then parse again |

HTTP request APIs and `$prefs` are **not** available in a resource parser. The official sample states this explicitly. If a transformation needs a second network hop, it does not belong in this kind of script.

`$notify(title, subtitle, message)` is available. This parser does not notify; a failed `$done({ error })` is enough.

## What a server parser must return

For `[server_remote]`, `content` should be Quantumult X **server lines**, one per line, with no `[server_local]` header:

```text
anytls = example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
shadowsocks = example.com:443, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=ss2022
```

Syntax for each family is defined in the official `sample.conf` `[server_local]` comments. AnyTLS (standard TLS and Reality) requires Quantumult X 1.5.6 or newer.

## Parameterized UI (`$parser`)

v1.5.6+ can render a hash-parameter editor if a parser publishes `$parser.hashSchema`. That protocol is documented in [parser-helper-protocol.md](https://github.com/crossutility/Quantumult-X/blob/master/parser-helper-protocol.md).

This repository does not implement `$parser`. The Nexitally script has no `#in=` / `#rename=` flags. A general-purpose parser such as KOP-XIAO's `resource-parser.js` is the right tool for those features — after you already have a server-only body.

## Minimal custom parser

[`examples/parser-template.js`](../examples/parser-template.js) is a skeleton that only strips a BOM and echoes content. Use it as a starting point for a *different* personal parser. Do not replace `nexitally-node-parser.js` with the template.

## Official versus personal parsers

| | Official sample | KOP-XIAO parser | This repo |
| --- | --- | --- | --- |
| Purpose | API demonstration | Multi-format convert + filter | Extract `[server_local]` from one vendor's full profile |
| Hash parameters | no | yes | no |
| Safe as the only `resource_parser_url` | yes (returns samples) | yes, if you rely on its flags | only if Nexitally is the resource that sets `opt-parser=true` |

If you already use KOP-XIAO's parser globally, you cannot also point `resource_parser_url` at this file. Options:

- Use this file as the profile parser and do **not** set `opt-parser` on other resources.
- Keep KOP-XIAO as the profile parser and paste a **private** copy of `nexitally-node-parser.js` logic into a local wrapper (not published here).
- Convert the Nexitally file once offline, host the server-only result yourself, and skip `opt-parser` for that resource.

The first option is what the personal snippets in `examples/local-profile/` describe.
