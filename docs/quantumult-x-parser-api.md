# Quantumult X resource parser API

This note is a personal reference for writing Quantumult X resource parsers
in this repository. It is not an official Quantumult X document. Prefer the
upstream sample parser when the client behavior and this note disagree:

- https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js
- https://github.com/crossutility/Quantumult-X/blob/master/sample.conf

## What a resource parser does

Quantumult X can download a remote resource and pass the response through a
JavaScript parser before the content is stored as a server, filter, or rewrite
resource.

A parser is useful when the remote body is not already a Quantumult X resource
snippet. The Nexitally node parser in this repository is one such case: the
provider publishes a **full configuration**, and the parser keeps only the
usable `[server_local]` lines so they can be imported as `[server_remote]`.

The parser runs inside Quantumult X. It does not run on a public server, and
it does not see your Quantumult X profile except for the single resource being
refreshed.

## Enabling a parser

Two local settings are required.

In `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

On the resource line itself, set `opt-parser=true`:

```ini
[server_remote]
<YOUR_PRIVATE_RESOURCE_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

If `resource_parser_url` is missing, Quantumult X has no custom parser to run.
If `opt-parser=true` is missing, the downloaded body is stored as-is.

Replace `<YOUR_PRIVATE_RESOURCE_URL>` only in your local profile. Never commit
that URL to this repository.

## Runtime objects

Quantumult X injects a small set of globals. HTTP request APIs and persistent
storage APIs are **not** available in a resource parser.

| Object | Meaning |
| --- | --- |
| `$resource.link` | Original resource URL, or a local path for a local snippet. |
| `$resource.content` | Downloaded body as UTF-8 text. |
| `$resource.info` | `subscription-userinfo` response header, when present (v1.0.10+). |
| `$resource.tag` | Resource tag from the local profile (v1.0.10+). |
| `$resource.user_agent` | User-Agent used for the current download. Empty on the first attempt; set to the retry UA during a retry (v1.5.6+). |

This repository's Nexitally parser only reads `$resource.content`. It does not
read `$resource.link`, so a private subscription URL never becomes part of the
parser script.

## Return values

Call `$done(...)` exactly once.

| Return | Meaning |
| --- | --- |
| `$done({ content: "..." })` | Replace the resource body with the returned text. |
| `$done({ error: "..." })` | Fail the refresh and show the error in Quantumult X. |
| `$done({ retry: { user_agent: "..." } })` | Ask Quantumult X to re-download once with that User-Agent (v1.5.6+). |

On current Quantumult X versions, `retry` takes priority over `content` and
`error`. Older versions ignore `retry`, so official guidance is to still
include a `content` or `error` fallback when using retry.

This repository's Nexitally parser does not use retry. It either returns
server lines or a specific error.

## What the parser must return for servers

A `[server_remote]` parser should return **server lines only**. Do not wrap
the result in `[server_local]` or `[server_remote]` section headers. Do not
return `[policy]`, `[filter_local]`, `[rewrite_local]`, or `[mitm]`.

Each kept line should already be a Quantumult X server URI, for example:

```text
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, tag=ss-01
```

Those two examples are copied from the official Quantumult X sample style.
They are placeholders, not working accounts.

## Supported server prefixes in this repository

The Nexitally parser keeps lines whose first token is one of:

- `anytls=`
- `shadowsocks=`
- `vmess=`
- `vless=`
- `trojan=`
- `http=`
- `socks5=`

The comparison is case-insensitive. Lines that start with another scheme,
including Surge-style `ss://` URIs or Clash YAML, are dropped. If a future
personal parser needs those formats, add a dedicated converter instead of
widening this one silently.

## Comments and line endings

Quantumult X treats lines that start with `;`, `#`, or `//` as comments. The
Nexitally parser strips those lines after trimming whitespace.

The parser also:

- removes a leading UTF-8 BOM (`U+FEFF`);
- normalizes `\r\n` to `\n` before section matching.

That matters because some configuration downloads arrive as Windows text or
with a BOM from an editor export.

## Section extraction

Full Quantumult X configurations are INI-like. The Nexitally parser looks for
a `[server_local]` heading and reads until the next `[section]` heading or the
end of the file.

The next-section boundary is important. A managed full configuration usually
continues with `[server_remote]`, `[policy]`, `[filter_local]`, or similar.
Those later sections must not leak into the parsed server list.

See [nexitally-parser.md](nexitally-parser.md) for the exact keep/drop rules.

## Local verification

Quantumult X itself is the only complete runtime. For this personal
repository, `tools/run-examples.js` mocks `$resource` and `$done` in Node.js
and runs the published parser against the fictional fixtures under
`examples/`. That checks the keep/drop rules. It does not prove AnyTLS
connectivity or Quantumult X UI behavior.

```bash
node tools/run-examples.js
```
