# Quantumult X parser contract

Resource parsers are a Quantumult X feature (v1.0.8-build253 and later). The official sample lives at [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js). HTTP request APIs and persistent storage are **not** available in this sandbox.

## Inputs

| field | meaning | this parser |
| --- | --- | --- |
| `$resource.content` | UTF-8 body of the downloaded resource | **read** |
| `$resource.link` | Original URL or local path | **must not read** |
| `$resource.info` | `subscription-userinfo` response header (v1.0.10+) | unused |
| `$resource.tag` | Resource tag from the profile line (v1.0.10+) | unused |
| `$resource.user_agent` | UA for the current download (v1.5.6+) | unused |

`$notify(title, subtitle, message)` exists in the official sample comments. This parser does not call it.

## Outputs

| call | meaning |
| --- | --- |
| `$done({ content: "..." })` | Replacement body. For a server resource this is newline-joined Quantumult X server lines. |
| `$done({ error: "..." })` | Surface an error in the resource UI. |
| `$done({ retry: { user_agent: "..." } })` | Ask native to re-download once with another UA (v1.5.6+). Unused here. |

This parser returns one of two errors:

```
Nexitally parser: [server_local] section was not found.
Nexitally parser: no usable server entries were found.
```

## Wiring

`[general]` has a **single** `resource_parser_url`. Every remote resource with `opt-parser=true` shares that script.

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js

[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Flags that matter:

| flag | value | why |
| --- | --- | --- |
| `opt-parser` | `true` | Run the global parser on this resource. |
| `tag` | `Nexitally` | Policy `resource-tag-regex` binds to this. |
| `update-interval` | `21600` | Six hours. Negative disables auto sync. |
| `enabled` | `true` | Resource is live. |

If the UI says there is no custom parser, refresh resources and fully quit the app so it reloads `resource_parser_url`.

## Desktop stand-in

`bench/sandbox.js` injects `$resource` / `$done` in a Node `vm`. `$resource.link` throws. That is how `npm test` stays honest without an iPhone.
