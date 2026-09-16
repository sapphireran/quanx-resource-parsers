# Quantumult X resource parser API

Notes for the personal scripts in this repository. The authoritative sample is [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) in `crossutility/Quantumult-X`. Field names below follow that file and the Quantumult X 1.5.x comments.

## Where a parser is attached

`[general]` accepts one parser URL for the profile:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

Each remote resource that should go through that parser sets `opt-parser=true`:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`update-interval` is seconds. `21600` is six hours. A negative interval disables automatic refresh.

`resource-parser.js` in the official repository is a stub that returns two sample Shadowsocks lines. It is useful as an API reminder, not as a Nexitally converter.

## Input: `$resource`

| Field | Meaning |
| --- | --- |
| `$resource.content` | UTF-8 body of the downloaded resource |
| `$resource.link` | Original URL, or a local path for a snippet |
| `$resource.info` | `subscription-userinfo` response header (v1.0.10+) |
| `$resource.tag` | `tag=` on the `[server_remote]` line (v1.0.10+) |
| `$resource.user_agent` | User-Agent used for this download (v1.5.6+). Empty on the first attempt |

The Nexitally parser only reads `$resource.content`. The other fields are listed so a future personal parser can use them without rediscovering the names.

Quantumult X does **not** expose HTTP request or persistent-storage APIs inside a resource parser. `$task.fetch`, `$prefs`, and similar rewrite/task objects are unavailable. A parser that needs a second download must return `$done({ retry: { user_agent } })` instead.

## Output: `$done`

Exactly one of these shapes is useful:

```js
$done({ content: "shadowsocks=…\nanytls=…" });
$done({ error: "Nexitally parser: [server_local] section was not found." });
$done({ retry: { user_agent: "AnyUserAgent/1.0" } });
```

| Payload | Effect |
| --- | --- |
| `{ content }` | Replaces the resource body with the string |
| `{ error }` | Marks the resource failed and shows the message |
| `{ retry: { user_agent } }` | Re-downloads once with that User-Agent (v1.5.6+). At most one retry per resource |

On 1.5.6+, `retry` wins over `content` / `error` when both are present. Older builds ignore `retry`, so a fallback `content` or `error` can be included for compatibility. The Nexitally parser does not retry.

`$notify(title, subtitle, message)` is mentioned in the official sample. These personal scripts do not call it.

## Server resource result

For a `[server_remote]` entry the returned `content` must be Quantumult X server lines, one per row, the same shape as `[server_local]`. Do not wrap the result in another `[server_local]` header. Quantumult X already knows the resource type from the section that referenced the URL.

## Desktop stand-in

`scripts/lib/quanx-resource-parser.js` builds a `vm` sandbox with `$resource` and `$done` and executes the script file unchanged. That is the only supported way to run these parsers outside the app. See [local-testing.md](local-testing.md).
