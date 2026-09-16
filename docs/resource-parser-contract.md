# Quantumult X resource-parser contract

Notes for this personal parser, aligned with the official example at [crossutility/Quantumult-X `resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) and the sample keys in [`sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf).

## Where the parser is installed

Quantumult X has a **single** `[general]` key:

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr is a cache of the same file and can lag `main`:

```ini
;resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

The raw GitHub URL is the source of truth for this repository.

Each remote resource opts in separately:

```ini
[server_remote]
<url>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Other remotes should leave the parser off unless they are also Nexitally full configs.

Resource parsers require Quantumult X **v1.0.8-build253** or later.

## Sandbox globals

| Name | Official meaning | This parser |
| --- | --- | --- |
| `$resource.link` | Original URL or local path | unused; lab harness throws if read |
| `$resource.content` | UTF-8 body | only input |
| `$resource.info` | `subscription-userinfo` header (v1.0.10-build277+) | unused |
| `$resource.tag` | Resource tag (v1.0.10-build277+) | unused |
| `$resource.user_agent` | Current download UA (v1.5.6-build921+) | unused |
| `$done({ content })` | Replace the resource body | success path |
| `$done({ error })` | Surface an error in the client | both failure paths |
| `$done({ retry: { user_agent } })` | Re-download once with a new UA (v1.5.6+) | unused |
| `$notify` | iOS notification | unused |
| HTTP / `$prefs` | Not supported in resource parsers | unused |

The official file states: *HTTP request and persistent storage related APIs are not supported in resource parser.*

## What this parser is not

Public generic parsers (KOP-XIAO and others) accept Clash, Surge, and URI subscriptions, plus `#emoji=1&in=香港` hash parameters and a `$parser` UI schema (v1.5.6+, [parser-helper-protocol.md](https://github.com/crossutility/Quantumult-X/blob/master/parser-helper-protocol.md)).

This personal script does none of that. It expects a Quantumult X full configuration and emits Quantumult X server lines. Hash parameters on the private URL are ignored because the script never inspects `$resource.link`.

## Profile parameters that still matter

These are Quantumult X client keys, not parser APIs:

| Key | Typical personal value |
| --- | --- |
| `tag` | `Nexitally` — used by `resource-tag-regex` in `[policy]` |
| `opt-parser` | `true` for this resource |
| `update-interval` | seconds; `21600` is six hours; negative disables auto sync |
| `enabled` | `true` |
| `as-policy` | optional; not required if local `[policy]` already groups the tag |
| `img-url` | optional icon |

See [`lab/profiles/`](../lab/profiles/) for copy-paste fragments.
