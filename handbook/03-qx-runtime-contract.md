# 03 — Quantumult X resource-parser contract

Official sample: [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) (Quantumult X v1.0.8-build253 and later). HTTP request and persistent-storage APIs are **not** available in this sandbox.

## Input: `$resource`

| Field | Meaning |
| --- | --- |
| `$resource.content` | UTF-8 body Quantumult X just downloaded |
| `$resource.link` | Original URL or local path. **This parser ignores it.** |
| `$resource.info` | `subscription-userinfo` response header (v1.0.10+). Unused here. |
| `$resource.tag` | Resource tag from the `[server_remote]` line (v1.0.10+). Unused here. |
| `$resource.user_agent` | UA for the current download; set after a retry (v1.5.6+). Unused here. |

`$notify(title, subtitle, message)` exists in the official environment. This parser does not call it.

## Output: `$done(...)`

| Call | Effect |
| --- | --- |
| `$done({ content: "..." })` | Replaces the resource body with the string |
| `$done({ error: "..." })` | Shows the error on the resource |
| `$done({ retry: { user_agent: "..." } })` | Re-download once with that UA (v1.5.6+). Unused here. |

On current Quantumult X, `retry` wins over `content` / `error`. Older builds ignore `retry` and use `content` / `error` as a fallback. This parser only returns `content` or `error`.

## How the device enables it

1. One line under `[general]`:

   ```ini
   resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
   ```

2. On the server resource, `opt-parser=true`:

   ```ini
   [server_remote]
   YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
   ```

Without `opt-parser=true`, Quantumult X stores the raw full profile as if it were a server list.

## What the local studio injects

`studio/lib/sandbox.js` evaluates the real parser file in a Node `vm` with:

- `$resource.content` set from a fixture
- `$resource.link` as a getter that **throws** if the script reads it
- `$done` that records exactly one result
- no `$task`, `$httpClient`, or `$prefs`

That is enough to replay keep/drop behavior without fetching a URL.
