# 06 — Device wiring

These snippets are for a **personal** Quantumult X profile. Replace the placeholder URL on the device only.

## Parser URL

Raw GitHub and jsDelivr both work. This repository is `sapphireran/quanx-resource-parsers` (the older `pang990801/…` URL in early notes pointed at the same personal account).

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Pinning `@main` follows the branch Quantumult X will re-fetch. After a parser change, refresh **Server Resources** so the app picks up the new script. jsDelivr can lag a few minutes behind GitHub.

Equivalent raw URL:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

## Server resource

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

| Parameter | Why |
| --- | --- |
| `tag=Nexitally` | Name shown under Server Resources; policy groups can target it |
| `opt-parser=true` | Runs `resource_parser_url` on this resource |
| `update-interval=21600` | Six hours. Raise it if you rarely need new nodes |
| `enabled=true` | Resource is live |

Never paste the real URL into this repository. The workbook copy lives at `workbook/profiles/server-remote.snippet.conf` with the placeholder intact.

## Policy that follows the resource

```ini
[policy]
static = Nexitally, Nexitally, img-url=https://example.invalid/nexitally.png
static = Proxy, Nexitally, direct
```

Quantumult X treats a policy member that matches a **resource tag** as “all servers from that resource.” You do not list `JP-Tokyo-01` by hand.

A more explicit form uses `resource-tag-regex`:

```ini
static = JP, resource-tag-regex=Nexitally, server-tag-regex=^JP-, img-url=https://example.invalid/jp.png
```

Those policy lines stay in the **local** profile. The parser never emits them.

## What you refresh

After the stable profile is imported:

1. Open **Server Resources**.
2. Pull to refresh **Nexitally**.
3. Confirm the node list is servers only — no `Traffic:` / `Expire:` / `[Premium]` rows.
4. Confirm `[policy]` and `[filter_remote]` in the local profile are unchanged.

If the refresh errors, use [08 — Failure playbook](08-failure-playbook.md). Do not re-download the vendor full configuration to “just get nodes back” unless you are ready to rebuild the local profile.
