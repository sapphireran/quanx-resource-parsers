# Quantumult X resource-parser contract

The canonical sample is [crossutility/Quantumult-X `resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) (v1.0.8-build253 and later notes in-file). This repo’s scripts target that environment, not Node and not Surge.

## How a parser is attached

1. Put **one** `resource_parser_url` in `[general]`. Quantumult X uses a single parser script for every resource that opts in.
2. On a `[server_remote]`, `[filter_remote]`, or `[rewrite_remote]` line, set `opt-parser=true`.
3. On refresh, Quantumult X downloads the resource, then runs the parser with that body.

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`update-interval` is seconds. `21600` is six hours. A negative interval disables auto-sync.

## Globals that exist

| Name | Role |
| --- | --- |
| `$resource.content` | UTF-8 body of the download (or local snippet) |
| `$resource.link` | Original URL, or a path for a local resource |
| `$resource.tag` | Resource `tag=` (v1.0.10-build277+, server resources) |
| `$resource.info` | `subscription-userinfo` response header (same vintage, server resources) |
| `$resource.user_agent` | UA used for this attempt; empty on the first download (v1.5.6-build921+) |
| `$notify(title, subtitle, message)` | Optional UI ping |
| `$done(result)` | **Required.** Ends the script |

HTTP request APIs and persistent storage are **not** available. A parser that calls `$task.fetch` is not a resource parser.

This Nexitally script reads `$resource.content` only. It ignores link, tag, info, and user-agent on purpose: the transform is a pure function of the body.

## `$done` payloads

Exactly one call. Newer Quantumult X prefers `retry` over `content` / `error` when both are present.

```javascript
$done({ content: "anytls=...\nshadowsocks=..." });
$done({ error: "Nexitally parser: [server_local] section was not found." });
$done({
  content: fallbackForOldClients,
  retry: { user_agent: "AnyUserAgent/1.0" },
});
```

A retry is allowed **once**. If `$resource.user_agent` is already non-empty, a second `retry` is ignored. This parser does not retry; Nexitally’s full-config body is already QX text.

## What `[server_remote]` expects back

`content` must be Quantumult X **server lines**, not a second full profile. No `[server_local]` header. No `[policy]`. One server per line, `scheme=host:port, …, tag=Name`.

`error` surfaces in the resource’s update UI. Prefer a short, stable sentence; the fixtures pin the two messages this parser emits.

## Local Node replay

`tools/qx-vm.js` loads `nexitally-node-parser.js` in a `vm` sandbox that only provides `$resource`, `$notify`, and `$done`. That is how examples are checked without a phone. The sandbox must not grow extra APIs — if the parser starts depending on Node, it will break in Quantumult X.
