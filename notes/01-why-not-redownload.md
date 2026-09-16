# 01 — Why not re-download the managed file

Nexitally (and some other providers) ship a **complete** Quantumult X configuration through **Configuration File → Download**. That file is a full profile, not a server list.

## What a full profile overwrites

Re-importing the managed file replaces the active profile. Sections that a personal setup usually owns locally include:

| Section | Typical local content |
| --- | --- |
| `[general]` | `resource_parser_url`, excluded routes, DNS flags |
| `[dns]` | DoH / bootstrap servers |
| `[policy]` | Country groups, fallback, `resource-tag-regex` |
| `[server_local]` | Extra personal nodes, if any |
| `[filter_remote]` | Community or personal rule sets |
| `[filter_local]` | One-off `host` / `ip-cidr` exceptions |
| `[rewrite_local]` / `[task_local]` | Personal rewrites and cron tasks |
| `[mitm]` | Hostname list you actually decrypt |

Refreshing nodes by re-downloading the vendor file throws those sections away. The point of this parser is to stop doing that.

## What the parser changes about the workflow

1. Import a **stable** personal profile once. That profile keeps policies, filters, rewrites, and MITM.
2. Point `[server_remote]` at the same Nexitally Quantumult X URL the vendor already gave you.
3. Set `opt-parser=true` so Quantumult X runs `nexitally-node-parser.js` on the response.
4. Refresh **Server Resources → Nexitally** when nodes change.

The parser reads `[server_local]` out of the vendor file and returns only server lines. Quantumult X stores that result as the remote resource named `Nexitally` (or whatever `tag=` you chose). Policy groups can refer to that tag without listing every node.

## When to delete this layer

If Nexitally publishes an official **server-only** Quantumult X subscription, use that resource and remove `opt-parser=true` for this URL. The parser exists because the official download is a full profile.

## What the parser does not do

- It does not fetch the subscription. Quantumult X does.
- It does not rewrite `[policy]` or `[filter_*]`.
- It does not translate Clash YAML, Surge, or URI shares (`vmess://`, `ss://`).
- It does not keep traffic / expiry / `[Premium]` placeholders. Those are dashboard chrome, not nodes.
