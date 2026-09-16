# Quantumult X resource parser API

A resource parser is a JavaScript file Quantumult X downloads once (from `resource_parser_url` in `[general]`) and then runs locally against a resource that has `opt-parser=true`.

The Nexitally parser in this repository is **not** a general subscription converter. It does not speak Clash, Surge, or SIP002. It only reshapes a Quantumult X full configuration into a Quantumult X server list. Use a general parser (for example the widely used KOP-XIAO script) when you need format conversion or hash parameters such as `in=`, `emoji=`, or `rename=`.

## Where the parser is attached

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Quantumult X:

1. Fetches `resource_parser_url` and caches the script.
2. Fetches the private resource URL with its own HTTP stack.
3. Invokes the script with that response as `$resource.content`.
4. Replaces the resource body with whatever the script passes to `$done`.

The parser never sees other users' traffic. It runs on the device that owns the subscription URL.

## Runtime limits

The official sample (`resource-parser.js`) states that **HTTP request APIs and persistent storage are not available** inside a resource parser. That is why this repository's parser is a single synchronous pass over `$resource.content`. It cannot:

- fetch a second URL
- write a cache file
- call `$task.fetch`
- read `$persistentStore`

If a future parser needs a retry with a different User-Agent, Quantumult X v1.5.6+ exposes `$done({ retry: { user_agent } })`. The Nexitally parser does not use that path: Nexitally's full-configuration download is already Quantumult X text.

## Input object

Values below come from the official sample comments and the community parser wiki. Field availability is version-gated.

| Field | Since | Meaning |
| --- | --- | --- |
| `$resource.content` | v1.0.8-build253 | UTF-8 body of the downloaded resource |
| `$resource.link` | v1.0.8-build253 | Original URL, or a local path for a snippet |
| `$resource.info` | v1.0.10-build277 | `subscription-userinfo` response header, when present |
| `$resource.tag` | v1.0.10-build277 | The `tag=` value from `[server_remote]` |
| `$resource.user_agent` | v1.5.6-build921 | User-Agent used for this download; empty on the first attempt |

The Nexitally parser reads **only** `$resource.content`. It must not log, return, or embed `$resource.link`. That field is the private subscription URL.

`$resource.info` is unused on purpose. Traffic and expiry already arrive as comments or dummy nodes inside Nexitally's `[server_local]` section; the parser strips those instead of re-encoding header metadata.

## Output object

Call `$done` exactly once.

| Payload | Effect |
| --- | --- |
| `{ content: "..." }` | Resource body becomes this UTF-8 string |
| `{ error: "..." }` | Quantumult X keeps the previous servers (if any) and shows the message |
| `{ retry: { user_agent: "..." } }` | v1.5.6+: re-download once with that UA, then parse again |

Priority on v1.5.6+: `retry` wins over `content` / `error`. Older builds ignore `retry`. The official sample therefore recommends always including a fallback `content` or `error` when you retry. This parser never retries.

An empty successful `content` is a real update. That is why the Nexitally parser errors when `[server_local]` is missing or contains no usable lines: succeeding with an empty string would clear the server resource.

## What a server resource must look like after parsing

`[server_remote]` expects **server lines**, not a full configuration. Official shapes (trimmed from `sample.conf` / `server-complete.snippet`):

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, tag=ss-01
vmess=example.com:443, method=none, password=<uuid>, obfs=over-tls, tag=vmess-tls-01
vless=example.com:443, method=none, password=<uuid>, obfs=wss, obfs-uri=/ws, tag=vless-ws-tls-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, tag=trojan-tls-01
http=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tag=http-tls-01
socks5=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tag=socks5-tls-01
```

AnyTLS support requires Quantumult X 1.5.6 (build 914) or later. Standard TLS and Reality TLS are both one line; Reality replaces standard TLS when `reality-base64-pubkey` is set. AnyTLS carries UDP over TCP natively, so `udp-over-tcp` is unnecessary.

## Comments

Quantumult X treats a line as a comment when it starts with `;`, `#`, or `//`. The Nexitally parser uses the same prefixes after trimming.

## Parser UI parameters (not used here)

Quantumult X v1.5.6+ can render a parameter form when a parser publishes a `$parser` helper protocol. This repository does not implement that protocol. Filtering stays hardcoded: supported prefixes in, traffic / premium / expiry out. If you need interactive `in=` / `out=` / `rename=` controls, use a general parser on a **server-only** subscription, not this script.

## Related official files

| File | Why it matters |
| --- | --- |
| `sample.conf` | Documents `resource_parser_url`, `[server_local]`, and the AnyTLS notes |
| `resource-parser.js` | Canonical `$resource` / `$done` comments and the UA-retry contract |
| `server-complete.snippet` | Dense list of legal server lines for every supported protocol |

Community wikis that restate the same API (useful for the `$resource.info` / `$resource.tag` table) include [Lᴜᴄʏ's Tool — 资源解析器](https://wiki.repcz.link/quantumultx/parser/). Prefer the official sample when the two disagree.
