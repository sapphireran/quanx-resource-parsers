# 02 — Why a server resource exists

Nexitally (and similar providers) expose **Configuration File → Download**. That file is a complete Quantumult X profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, `[filter_local]`, `[rewrite_local]`, and often extra banners.

Importing that download **replaces the active profile**. Local policy groups, filter lists, rewrite sets, and MitM settings disappear.

## The intended split

| Lives on the device | Comes from the vendor download |
| --- | --- |
| `[general]` (including `resource_parser_url`) | The private full-config URL, fetched by Quantumult X |
| `[policy]` regex groups that match node tags | Lines inside `[server_local]` |
| `[filter_remote]` / `[filter_local]` | — |
| `[rewrite_remote]` / `[rewrite_local]` | — |
| `[server_remote]` entry that *points at* the private URL | — |

The parser's only job is:

1. Receive the downloaded full profile as `$resource.content`.
2. Cut out the first `[server_local]` block.
3. Keep Quantumult X server lines.
4. Drop comments, traffic/expiry banners, `[Premium]` placeholders, unsupported prefixes, and exact duplicates.
5. Return the remaining lines as the body of a `[server_remote]` resource.

After that, refreshing **Server Resources → Nexitally** updates nodes without touching the rest of the profile.

## What this parser is not

- It is not a Clash / Surge / V2RayN converter.
- It is not Shawn's parameterized resource-parser (`#emoji=1&in=香港`).
- It does not read `$resource.link`. Quantumult X already fetched the URL.
- It does not rewrite node names, add emoji, or sort by region.

If the vendor later publishes an official **server-only** Quantumult X subscription, use that resource and delete this parser layer.
