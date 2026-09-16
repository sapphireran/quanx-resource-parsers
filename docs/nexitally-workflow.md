# Nexitally workflow

Nexitally ships Quantumult X nodes as a **managed full configuration** (Configuration File → Download). That file typically contains `[general]`, `[dns]`, `[policy]`, `[server_local]`, `[filter_remote]`, `[rewrite_remote]`, and other sections.

Re-downloading it is convenient the first time and destructive after that. Quantumult X replaces the active profile. Local policy groups, filter lists, rewrite sets, and MITM hostnames disappear.

## What this parser changes

1. Quantumult X downloads the private Nexitally URL as a **server resource**.
2. Because `opt-parser=true` is set, Quantumult X feeds the response into `nexitally-node-parser.js`.
3. The parser keeps only usable lines from the first `[server_local]` section.
4. Those lines are written into `[server_remote]` as if they had been a server-only subscription.

`[policy]`, `[filter_remote]`, `[rewrite_local]`, and the rest of the local profile are left alone.

```
Nexitally full config          This parser                 Local profile
---------------------          -----------                 -------------
[general]                  \                               [general]          (yours)
[dns]                       \                              [dns]              (yours)
[policy]                     }  discarded                  [policy]           (yours)
[server_local]  ------------>  keep usable servers  ---->  [server_remote]
[filter_remote]              }  discarded                  [filter_remote]    (yours)
[rewrite_remote]           /                               [rewrite_remote]   (yours)
```

## When to stop using it

If Nexitally publishes an official **server-only** Quantumult X subscription, point `[server_remote]` at that URL, set `opt-parser=false` (or omit it), and remove this parser from `resource_parser_url` if nothing else needs it.

## What refresh does *not* do

- It does not merge Nexitally's remote filters or rewrites into the local profile.
- It does not create policy groups. Bind refreshed nodes with `resource-tag-regex` in `[policy]` if a group should track the resource tag.
- It does not preserve `[Premium]` placeholders, traffic banners, or expiry lines. Those are dropped on purpose.
