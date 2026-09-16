# Why a server resource

Nexitally's Quantumult X export is a **full configuration**: `[general]`, `[dns]`, `[policy]`, `[server_local]`, `[filter_local]`, and whatever else the vendor wrote that week.

**Configuration File → Download** replaces the active profile. That is convenient on day one and destructive later: local policy names, filter lists, rewrite resources, and MITM settings disappear.

## The split this parser implements

1. Import (or rebuild) a **stable personal profile** once.
2. Put the vendor full-configuration URL on `[server_remote]` with `opt-parser=true`.
3. Let this script extract `[server_local]` and return only server lines.
4. Point a policy at `resource-tag-regex=^Nexitally`.

Refreshing **Server Resources → Nexitally** updates nodes. It does not rewrite the rest of the profile.

```
vendor full config  --(Quantumult X download)-->  $resource.content
        |                                              |
        |                                         this parser
        |                                              |
        +-- [policy] / [filter_*] discarded            +-- server lines
                                                       |
                                                       v
                                              [server_remote] tag=Nexitally
```

## When to delete the parser

If Nexitally publishes an official **server-only** Quantumult X subscription (a list of `anytls=` / `shadowsocks=` lines, not a full `.conf`), use that resource and remove `opt-parser=true` plus this script. The parser exists because the managed download is a full profile.

## What the parser does not do

- It does not convert Clash, Surge, or sing-box YAML.
- It does not fetch a URL. There is no subscription endpoint in the script.
- It does not rewrite policy or filter sections from the vendor file.
- It does not keep traffic / expiry / `[Premium]` rows, even if they use a supported prefix.
