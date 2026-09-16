# Personal lab notebook

This is a personal Quantumult X note, not a product spec and not company work.

## Problem

Nexitally's Quantumult X distribution is a **full configuration**: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, and sometimes extra stubs such as `[Premium]`. The in-app path **Configuration File → Download** replaces the active profile.

That is convenient the first time and destructive the second time. Local policy groups, filter remotes, rewrite snippets, and device-specific `[general]` keys disappear.

Nexitally does not currently publish a Quantumult X **server-only** subscription that I want to point `[server_remote]` at. Until it does, the useful part of the download is the `[server_local]` list.

## Approach

Quantumult X can attach a **resource parser** to a remote resource (`opt-parser=true`). The client downloads the private URL, evaluates a JavaScript file, and uses `$done({ content })` as the resource body.

`nexitally-node-parser.js` is that file:

1. Ignore every section except the first `[server_local]`.
2. Keep supported Quantumult X server prefixes.
3. Drop comments, traffic/expiry placeholders, `[Premium]` stubs, and exact duplicates.
4. Fail loudly if the section is missing or empty after filtering.

The local profile then lists:

```ini
[server_remote]
<private URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Refreshing **Server Resources → Nexitally** updates nodes. `[policy]` stays mine.

## Non-goals

- Not a generic Clash / Surge / Loon converter. Those already exist (for example KOP-XIAO's public parser). This script assumes Quantumult X server lines.
- Not a second `resource_parser_url`. Quantumult X has one global parser. Enable `opt-parser` only on the Nexitally resource.
- Not a hash-parameter UI (`$parser.hashSchema`). There is nothing to toggle; the filter is fixed.
- Not a User-Agent retry helper. A managed full config does not need `$done({ retry })`.
- Not a traffic dashboard. Info rows are dropped, not rewritten into notifications.

## Why the filter is conservative

Managed exports often inject fake "nodes" whose tags are remaining quota, expiry dates, or an upsell (`[Premium]`). Those lines parse as `anytls=...` so a naive section dump would create useless servers. The excluded regex is intentionally a substring list, which also means `Reset` matches inside `Preset`. That tradeoff is documented in [`reset-substring`](../lab/fixtures/reset-substring.conf) rather than papered over.

## Success criteria

- Re-download of the Nexitally file is no longer required after the first local profile is in place.
- A Node replay of sanitized fixtures (`npm test`) matches committed expected files.
- The parser file still contains no URL, account id, or live password.

If Nexitally ships an official server-only Quantumult X subscription, delete this layer and point `[server_remote]` at that URL with `opt-parser=false`.
