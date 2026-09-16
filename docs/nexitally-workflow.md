# Nexitally node workflow

Nexitally can export a **full Quantumult X configuration**. That file is convenient for a first import and inconvenient afterwards: downloading it again overwrites `[policy]`, `[filter_remote]`, `[rewrite_local]`, MITM hostnames, and every other local section.

`nexitally-node-parser.js` is a personal workaround for that mismatch. Quantumult X still downloads the managed full configuration (the URL never leaves the device), but the parser keeps only the nodes.

This project is **not** affiliated with Nexitally or with Quantumult X. If Nexitally publishes an official server-only Quantumult X subscription, use that and delete this parser from `[general]`.

## What you keep locally vs what you refresh

| Stays in your profile | Comes from the parsed resource |
| --- | --- |
| `[general]` DNS / check URLs / `resource_parser_url` | Server lines extracted from `[server_local]` |
| `[dns]` | |
| `[policy]` groups, including `resource-tag-regex=^Nexitally` | |
| `[filter_local]` / `[filter_remote]` | |
| `[rewrite_local]` / `[rewrite_remote]` | |
| `[mitm]` | |

After a refresh, Quantumult X replaces the **Nexitally** server resource. Policy groups that select that resource by tag pick up new nodes without a full-profile import.

## One-time setup

1. Finish a working local profile (filters, rewrites, MITM, policy). Export or snapshot it. Do not rely on Nexitally’s full file as the long-term profile.
2. Set the parser URL in `[general]`. Copy from [general-parser.snippet](../examples/quantumult-x/general-parser.snippet).
3. Add a `[server_remote]` line whose URL is **your** Nexitally Quantumult X configuration URL, with `opt-parser=true`. Copy the shape from [server-remote.snippet](../examples/quantumult-x/server-remote.snippet).
4. Add a policy group that selects `resource-tag-regex=^Nexitally` (or whatever `tag=` you chose). Copy from [policy-groups.snippet](../examples/quantumult-x/policy-groups.snippet).
5. In the app: **Server Resources → Nexitally → update**. The resource should list individual nodes (`HK-01`, …), not a pasted full config.
6. Confirm `[policy]`, `[filter_remote]`, and rewrite sections are still yours.

A complete skeleton that wires these pieces together is [local-profile-skeleton.conf](../examples/quantumult-x/local-profile-skeleton.conf).

## Why `[server_local]` and not `[server_remote]`

The managed download is a profile. Nodes live under `[server_local]` inside that payload. `[server_remote]` inside the same payload, if present, points at *other* URLs and is ignored.

The parser’s section regex is:

```text
(?:^|\n)\s*\[server_local\]\s*\n  … until the next  \n\s*\[[^\]]+\]
```

If Nexitally ever ships a body that is already a bare server list (no `[server_local]` header), this parser will return an error. That is intentional: it refuses to guess. At that point an official server resource is the right tool.

## What is stripped

| Pattern (case-insensitive) | Why |
| --- | --- |
| `tag` / line contains `[Premium]` | Placeholder rows in mixed lists |
| `Traffic`, `Expire`, `Reset`, `Days Left` | English quota / expiry rows disguised as servers |
| `流量`, `到期`, `剩余`, `套餐` | Chinese quota / expiry / plan rows |
| Duplicate full lines | Refresh noise |
| `;` `#` `//` comments and blank lines | Not servers |
| Any scheme other than the seven listed in the runtime doc | Avoid forwarding unknown syntax into `[server_remote]` |

Examples of dropped vs kept lines live in [examples/nexitally/full-config.sample.conf](../examples/nexitally/full-config.sample.conf).

## Refresh cadence

`update-interval=21600` (six hours) is a reasonable default for node lists that change when a provider rotates hosts. Use a larger value if you prefer manual updates only. `update-interval=-1` disables automatic sync; you still refresh from the resource’s context menu.

After you import a *stable* local profile, you should not need to open Nexitally’s “Download configuration” again unless you want a vendor-provided filter/rewrite baseline. Nodes come through the resource.

## When to stop using this parser

- Nexitally offers a Quantumult X **server** subscription (a list of `anytls=` / `shadowsocks=` lines, not a full profile).
- You no longer use AnyTLS / Nexitally.
- Quantumult X itself grows a “import servers from profile URL” option.

Remove `opt-parser=true` from the resource (or delete the resource) and clear `resource_parser_url` if nothing else needs a parser.
