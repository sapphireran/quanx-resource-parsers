# Quantumult X resource-parser contract

The parser is ordinary JavaScript, but it does **not** run in Node and it does **not** get a network stack. Quantumult X downloads the resource first, then evaluates the script against that payload.

Official sample: [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js). Official helper protocol (parameterized UI, unused here): [parser-helper-protocol.md](https://github.com/crossutility/Quantumult-X/blob/master/parser-helper-protocol.md).

## Inputs the runtime provides

| Binding | Meaning | Used by this parser? |
| --- | --- | --- |
| `$resource.content` | UTF-8 body of the download (or local snippet) | **Yes** — this is the only input. |
| `$resource.link` | Original URL or local path | No. The script never reads it, so the private URL never enters the parser source. |
| `$resource.tag` | `tag=` on the `[server_remote]` line (v1.0.10+) | No. |
| `$resource.info` | `subscription-userinfo` response header (v1.0.10+) | No. Traffic totals stay out of the result. |
| `$resource.user_agent` | UA for the current attempt (v1.5.6+) | No. The script does not retry. |

`$notify` exists in the resource-parser environment. This script does not call it. HTTP APIs and `$prefs` are **not** available in a resource parser. If a future personal parser needs a second download, Quantumult X will not allow it here.

## Outputs `$done` accepts

| Call | What Quantumult X does |
| --- | --- |
| `$done({ content: "..." })` | Treat the string as the resource body. For a server resource that should be one Quantumult X server line per line, no section headers. |
| `$done({ error: "..." })` | Surface the string in the resource UI. Nothing is imported. |
| `$done({ retry: { user_agent: "..." } })` | Re-download once with that UA (v1.5.6+). Unused here. |

This parser has exactly two error strings:

- `Nexitally parser: [server_local] section was not found.`
- `Nexitally parser: no usable server entries were found.`

A successful result is `servers.join("\n")` — **no trailing section name, no `[server_remote]` wrapper**. Quantumult X already knows the destination is a server resource.

## How a personal profile opts in

Two independent switches, both required:

1. `[general]` must set `resource_parser_url` to this script (raw GitHub, jsDelivr, or a local iCloud copy).
2. The `[server_remote]` line must include `opt-parser=true`.

Omitting `opt-parser=true` means Quantumult X will try to import the **raw managed profile** as if it were a server list. That is the failure mode this parser exists to prevent.

Hash parameters such as `#in=香港` are consumed by general-purpose parsers (for example KOP-XIAO's). **This** script ignores `$resource.link`, so those hash filters do nothing. Filter nodes in `[policy]` after import, not in a URL hash.

## What the Node replay approximates

`scripts/replay.js` loads the real parser file inside a `vm` sandbox and supplies `$resource` / `$done`. It is close enough to lock text behavior. It does not emulate Quantumult X's UI, retry budget, or `subscription-userinfo` header parsing — none of which this script reads.
