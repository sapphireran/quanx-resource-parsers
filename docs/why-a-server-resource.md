# Why a server resource instead of a full profile

Nexitally's Quantumult X download is a **complete configuration**: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, rewrite, MITM. Quantumult X's **Configuration File → Download** path replaces the active profile with that file.

That is convenient the first time you import a vendor profile. It is destructive every time after that.

## What a full-profile refresh overwrites

A personal Quantumult X setup usually accumulates:

- Policy groups that mix Nexitally nodes with other subscriptions
- Remote filter lists (region, ads, Apple, streaming)
- Local `filter_local` exceptions (home LAN, work split-tunnel)
- Rewrite / MITM hostnames
- DNS overrides (`no-ipv6`, DoH, `dns_exclusion_list`)
- Other `[server_remote]` subscriptions

Re-importing Nexitally's full file resets all of those to whatever the vendor shipped that day.

## What `[server_remote]` keeps

A server resource is only a list of Quantumult X server lines. Refreshing it updates nodes and leaves every other section alone.

The catch: Nexitally does not (or did not, when this parser was written) publish a server-only Quantumult X subscription. The downloadable artifact is still the full profile, with nodes buried in `[server_local]`.

## What the parser changes

```
Nexitally full Quantumult X file
        │
        │  Quantumult X downloads this as a [server_remote] body
        ▼
nexitally-node-parser.js
        │
        │  keep [server_local] server lines
        │  drop comments, duplicates, traffic / expiry / [Premium]
        ▼
plain server list  →  Quantumult X [server_remote] resource
```

Your local profile then looks like the snippet in [`examples/local-profile/quantumult-x-local.snippet.conf`](../examples/local-profile/quantumult-x-local.snippet.conf):

1. `[general] resource_parser_url` points at this script.
2. `[server_remote]` lists the **private** Nexitally Configuration File URL with `opt-parser=true`.
3. `[policy]` selects those nodes with `resource-tag-regex`.

After a stable profile is imported once, later updates are **Server Resources → Nexitally → refresh**, not another full download.

## When to stop using this parser

If Nexitally publishes an official Quantumult X **server-only** subscription (a file that is already just `anytls = ...` / `shadowsocks = ...` lines), point `[server_remote]` at that URL and set `opt-parser=false` or remove `opt-parser`. Delete `resource_parser_url` if nothing else needs it.

This repo is a personal compatibility layer, not a substitute for a vendor server resource.
