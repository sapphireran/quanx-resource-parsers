# Personal Nexitally workflow

Nexitally can hand out a complete Quantumult X configuration. Importing that file is convenient the first time and destructive after you have a stable local profile.

This workflow keeps your `[policy]`, `[filter_remote]`, `[rewrite_local]`, and MITM hostnames, and only refreshes the node list.

## The problem

Nexitally's **Configuration File → Download** URL is a full profile:

```ini
[general]
[dns]
[policy]
[server_local]
[filter_remote]
[filter_local]
[rewrite_remote]
[rewrite_local]
[mitm]
```

If Quantumult X treats that URL as a **configuration** download, the next refresh replaces the active profile.

If Quantumult X treats that URL as a **server resource** without a parser, it stores the whole profile text as if those lines were servers. That does not produce a usable node list.

The parser in this repository sits between those two mistakes. Quantumult X downloads the full file as a server resource, the parser returns only `[server_local]` entries, and the rest of your profile stays yours.

## One-time setup

### 1. Keep a local profile that you own

Build or import a Quantumult X profile you are willing to maintain: filters, policies, rewrites, MITM hostnames. Do not let a provider overwrite it again.

### 2. Install the parser

Add a `resource_parser_url` in `[general]`. Copy from `examples/profile-snippets/general-parser.conf`.

If that field is already set to a community parser you still need, stop and read `docs/quantumult-x-resource-parsers.md`. Quantumult X only loads one parser script.

### 3. Add Nexitally as a server resource

In the Nexitally dashboard, copy the Quantumult X **full configuration** URL. Paste it only into Quantumult X:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`tag=Nexitally` is the name policies will match. `opt-parser=true` is required. `update-interval=21600` is six hours; change it if you want.

### 4. Point a policy at the resource tag

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally
static = Proxy, Nexitally, DIRECT
```

`resource-tag-regex` matches the `[server_remote]` tag. It does not parse node names. For a Hong Kong slice of the same resource, add `server-tag-regex`.

### 5. Refresh once

In Quantumult X: **Server Resources → Nexitally → update**.

On success you should see node names, not `[general]` keys, not Traffic/Expire banners, and not `[Premium]` rows.

## Regular use

- Refresh **Server Resources → Nexitally** when nodes change.
- Leave `[policy]` and filters alone unless you changed them on purpose.
- If Nexitally publishes an official **server-only** Quantumult X subscription, switch `[server_remote]` to that URL and set `opt-parser=false` (or remove the parser). This script is a workaround, not a permanent protocol.

## What you should never do

- Do not re-download Nexitally's full configuration as the active profile "just to get new nodes".
- Do not put the Nexitally URL in this git repository, a public Gist, a screenshot, or a chat log.
- Do not commit a live export to `examples/`. The files there are synthetic.

## Mental model

```
Nexitally dashboard
        │
        │  private full-configuration URL
        ▼
Quantumult X downloads the body into a [server_remote] slot
        │
        │  opt-parser=true
        ▼
nexitally-node-parser.js
        │
        │  $done({ content: server lines })
        ▼
Server Resources → Nexitally
        │
        │  resource-tag-regex=^Nexitally
        ▼
Your local policies and filters
```

The parser never sees your filters. It never writes them back. The only data that crosses the parser boundary is the downloaded Nexitally body and the returned server lines.
