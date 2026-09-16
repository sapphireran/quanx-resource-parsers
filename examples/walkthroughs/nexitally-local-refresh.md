# Walkthrough: keep a local Quantumult X profile, refresh only Nexitally nodes

This is a personal setup path. It assumes:

- Quantumult X already has a working local profile (filters, rewrites, MITM, policies you chose)
- Nexitally currently ships a **full** Quantumult X configuration, not a server-only subscription
- You can copy the private configuration URL from Nexitally's panel on your own device

The parser never sees that URL. Quantumult X downloads the resource, then hands the response body to `nexitally-node-parser.js`.

## 1. Keep the current profile

In Quantumult X, export or confirm the profile you actually use. The point of this parser is to stop replacing that file every time Nexitally rotates nodes.

Do **not** use **Configuration File → Download** from Nexitally as the daily update path. That download is a whole profile. It will overwrite `[policy]`, `[filter_remote]`, `[rewrite_local]`, and `[mitm]`.

## 2. Point `[general]` at this parser

Add one of these lines. Prefer the jsDelivr URL unless it is stale:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Quantumult X allows only one `resource_parser_url`. If you already use a general-purpose parser (for Clash or Surge subscriptions), you cannot stack two parser URLs. In that case either:

- convert the Nexitally full config locally with `node scripts/run-parser.js` and host the server-only result yourself, or
- keep this parser and convert other resources some other way

This repository's parser is intentionally narrow. It does not implement emoji, rename, or `in=` / `out=` hash parameters.

## 3. Add the private URL as a server resource

Under `[server_remote]`:

```ini
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Without it, Quantumult X will try to load the full configuration as if it were already a server list.

Suggested interval: `21600` seconds (6 hours). Negative values disable auto-sync.

Keep the real URL on the device only. If you back up the profile to a git repo, replace the URL with the placeholder from `examples/snippets/server-remote.snippet.conf` first.

## 4. Point policies at the resource tag

`tag=Nexitally` on the `[server_remote]` line is the resource tag. Local policies can select those servers without listing each node:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=.
available = Nexitally-Auto, resource-tag-regex=^Nexitally, server-tag-regex=.
```

`server-tag-regex` then filters **node** names (`HK-01`, `JP-01`, …), which is useful once Nexitally's tags are stable.

## 5. Refresh only the resource

1. Open **Server Resources**.
2. Find the row tagged `Nexitally`.
3. Refresh that row.
4. Confirm the node list no longer contains traffic, expiry, or `[Premium]` rows.
5. Confirm your filter and rewrite sections are unchanged.

If the resource shows an error, read `docs/troubleshooting.md`. The two parser errors are:

- `[server_local] section was not found`
- `no usable server entries were found`

## 6. Reproduce the same transform on a computer

When something looks wrong in the app, copy the downloaded body to a file on disk (or use a sanitized fixture) and run:

```bash
node scripts/run-parser.js /path/to/downloaded-body.conf
```

Compare that output to the node list Quantumult X displayed. If they match, the parser did its job and the remaining issue is policy, filter, or the upstream file. If they do not match, file a personal note with a sanitized fixture — never the live URL.

## 7. When to delete this layer

If Nexitally publishes an official Quantumult X **server-only** subscription, use that URL directly with `opt-parser=false` (or omit `opt-parser`) and remove `resource_parser_url` if nothing else needs it.
