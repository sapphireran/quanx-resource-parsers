# Nexitally node parser

`nexitally-node-parser.js` turns Nexitally's **managed full Quantumult X configuration** into a server-only resource.

Nexitally's dashboard action **Configuration File → Download** is a complete profile, not a node list. Importing it again overwrites `[policy]`, `[filter_remote]`, `[rewrite_local]`, and `[mitm]`. The parser exists so Quantumult X can refresh *nodes* without taking that overwrite.

If Nexitally later publishes an official Quantumult X **server-only** subscription, prefer that URL and delete this parser from `[general]`.

## Intended data flow

```text
Nexitally dashboard
        │
        │  private full-configuration URL
        ▼
Quantumult X  (downloads the body; parser never sees the URL)
        │
        │  $resource.content = full profile text
        ▼
nexitally-node-parser.js
        │
        │  extract [server_local]
        │  drop comments, banners, [Premium] rows, duplicates
        ▼
$done({ content: server lines })
        │
        ▼
[server_remote] resource tagged "Nexitally"
```

The parser does not contain a Nexitally host, account id, or password. Quantumult X keeps the URL on the device.

## What gets extracted

The script looks for a `[server_local]` section, using a case-insensitive header and allowing leading whitespace:

```text
(?:^|\n)\s*\[server_local\]\s*\n
```

It then reads until the next INI-style section header (`[policy]`, `[filter_local]`, …) or end of file.

Each remaining line is kept only when **all** of the following are true:

1. After trim, the line is non-empty.
2. It is not a comment (`;`, `#`, `//`).
3. It starts with a supported prefix: `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5` (case-insensitive, spaces allowed before `=`).
4. It does **not** match the placeholder / traffic banner pattern:

   ```text
   [Premium] | Traffic | Expire | Reset | Days Left | 流量 | 到期 | 剩余 | 套餐
   ```

5. The exact trimmed line has not already been seen.

Kept lines are joined with `\n` and returned as `content`.

## Why banners are dropped

Nexitally (and similar managed profiles) often encode account status as fake server rows so they appear in the node list:

- `tag=Traffic: 12.3 GB / 500 GB`
- `tag=Expire: 2099-12-31`
- `tag=剩余流量 200GB`
- `tag=[Premium] Tokyo` for an upsell node the account cannot use

Those rows are not usable proxies. Leaving them in `[server_remote]` pollutes policy groups that match `resource-tag-regex=^Nexitally` and makes latency tests fail. The examples in [`examples/nexitally/placeholders-and-duplicates.conf`](../examples/nexitally/placeholders-and-duplicates.conf) show the exact filters.

## What is left alone

The parser never emits:

- `[general]`, `[dns]`, `[policy]`
- `[filter_local]` / `[filter_remote]`
- `[rewrite_local]` / `[rewrite_remote]`
- `[mitm]`
- `[server_remote]` lines that happened to be inside the downloaded file

Your local profile keeps its own policy tree. See [`examples/quantumult-x/keep-local-policy.conf`](../examples/quantumult-x/keep-local-policy.conf).

## Device setup

1. Import or keep a **stable** local Quantumult X profile (filters, rewrites, MITM, policies).
2. Set `resource_parser_url` to this repository's parser. Snippet: [`examples/quantumult-x/general-resource-parser.conf`](../examples/quantumult-x/general-resource-parser.conf).
3. In the Nexitally dashboard, copy the **Quantumult X full-configuration** URL. This is private.
4. Add it under `[server_remote]` with `opt-parser=true`. Snippet: [`examples/quantumult-x/server-remote-nexitally.conf`](../examples/quantumult-x/server-remote-nexitally.conf).
5. Refresh **Server Resources → Nexitally**.
6. Confirm the node list has country/city tags and does **not** contain Traffic / Expire / `[Premium]` rows.

A combined reading copy lives in [`examples/quantumult-x/full-local-profile.snippet.conf`](../examples/quantumult-x/full-local-profile.snippet.conf).

## Update interval

`update-interval=21600` (six hours) is a reasonable default for a node list that changes when Nexitally rotates hosts. Use a larger value if you prefer manual refresh. A negative interval disables automatic sync.

## Compatibility

| Requirement | Why |
| --- | --- |
| Quantumult X with resource parsers | `$resource` / `$done` API |
| Quantumult X 1.5.6+ if the list includes AnyTLS | AnyTLS landed in 1.5.6 (build 914) |
| `opt-parser=true` on the Nexitally resource | Otherwise the full profile is stored raw |
| UTF-8 body | The parser strips a leading BOM and normalizes CRLF |

Clash, Surge, or Shadowrocket exports are out of scope. If `[server_local]` is missing, the parser errors instead of guessing another format.

## Local check without the app

```bash
node scripts/run-parser.js examples/nexitally/typical-full-profile.conf
node scripts/check-examples.js
```

These commands read fixtures from disk. They never contact Nexitally.
