# Quantumult X resource parsers

Quantumult X can download a remote resource and then run a JavaScript parser against the response before the app stores the result. This repository uses that hook for one case: a managed **full configuration** that should become a **server-only** resource.

The notes below follow the official sample parser at [crossutility/Quantumult-X `resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) and the public Quantumult X sample configuration.

## Where parsers run

A parser is **not** a rewrite script, a task, or an HTTP backend. Those other script types have `$request` / `$response` / `$task` and may perform HTTP. A resource parser does not.

Quantumult X loads one parser URL from `[general]`:

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Each remote resource can opt in:

```ini
[server_remote]
https://example.test/resource, tag=Sample, opt-parser=true
```

The same parser URL is used for server, filter, and rewrite resources. A custom parser must therefore either understand the resource it is looking at or fail clearly. The Nexitally parser only understands a Quantumult X configuration that contains `[server_local]`. Pointing it at a Clash YAML file or a filter list is expected to error.

## Lifecycle

1. Quantumult X downloads the resource URL (or reads a local snippet).
2. It builds a `$resource` object from that download.
3. It evaluates the JavaScript at `resource_parser_url`.
4. The script must call `$done` exactly once.
5. Quantumult X stores `content` as the resource body, or surfaces `error`.

The official sample states that HTTP request APIs and persistent storage are **not** available in a resource parser. `$notify(title, subtitle, message)` is available. This repository's parser does not call `$notify`.

## `$resource`

| Field | Meaning |
| --- | --- |
| `$resource.content` | Response body as UTF-8 text |
| `$resource.link` | Original URL, or a local path for a snippet |
| `$resource.info` | `subscription-userinfo` response header, server resources, v1.0.10+ |
| `$resource.tag` | Resource tag from the `[server_remote]` line, v1.0.10+ |
| `$resource.user_agent` | User-Agent used for this download; empty on the first attempt, v1.5.6+ |

The Nexitally parser reads only `$resource.content`. It does not inspect the URL, because the URL is private and because the transform is defined entirely by the configuration text.

## `$done`

| Call | Result |
| --- | --- |
| `$done({ content: "..." })` | Replace the resource body with the string |
| `$done({ error: "..." })` | Fail the refresh and show the message |
| `$done({ retry: { user_agent: "..." } })` | Ask Quantumult X to download again with that User-Agent, at most once per resource, v1.5.6+ |

On current Quantumult X versions, `retry` wins over `content` / `error`. Older versions ignore `retry`. The official guidance is to include a fallback `content` or `error` if you use retry. This parser does not retry.

## What a server resource must look like after parsing

`[server_remote]` expects Quantumult X **server lines**, one per line, not another full configuration. Typical accepted prefixes:

- `anytls=`
- `shadowsocks=`
- `vmess=`
- `vless=`
- `trojan=`
- `http=`
- `socks5=`

A full Nexitally download also contains `[general]`, `[dns]`, `[policy]`, `[filter_local]`, and metadata rows that look like servers. Those extra sections are useful as a standalone profile and harmful as a remote **server** resource. The parser's only job is to cut the file down to the usable `[server_local]` rows.

## Hash parameters

Popular general-purpose parsers (for example KOP-XIAO's) read `#emoji=1&in=香港` from the resource URL. Those parameters are a convention of that script, not a Quantumult X language feature.

`nexitally-node-parser.js` ignores the URL hash. Filtering after import should be done with Quantumult X policy `server-tag-regex` values, or by editing the fixture/parser in this repository.

## Official sample behavior

The official `resource-parser.js` ignores `$resource.content` and returns two hardcoded Shadowsocks lines. It exists to document the globals and `$done` shape. It is not a subscription converter.

This repository's parser is the opposite: it is a narrow converter and contains no sample nodes.

## Local stand-in

`scripts/run-parser.js` evaluates the same file in Node with a sandbox `$resource` / `$done`. That is close enough to catch section, comment, and keyword bugs. It cannot prove Quantumult X UI behavior, TLS fingerprint handling, or `opt-parser` wiring. Use it for fixtures; use the app for the refresh path in `examples/walkthroughs/nexitally-local-refresh.md`.
