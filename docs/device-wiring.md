# Device wiring

Copy these fragments into a **private** Quantumult X profile. Leave the Nexitally URL as a token in git.

## Parser URL

One line in `[general]`. Prefer this repository:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Pin a commit instead of `@main` / `main` if you want the script to stop moving:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@<commit>/nexitally-node-parser.js
```

An older personal username used to host the same files. Update any profile that still points there.

## Server resource

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

The URL is the vendor **full Quantumult X configuration** download, not a Clash YAML and not a share-link dump.

`opt-parser=true` is required. Without it Quantumult X stores the raw full config as if it were a server list.

## Policy

Server lines returned by the parser inherit the resource `tag`. Bind them without listing every node:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=.*, img-url=https://example.com/icon.png
available = Nexitally-available, resource-tag-regex=^Nexitally, server-tag-regex=.*
url-latency-benchmark = Nexitally-bench, resource-tag-regex=^Nexitally, server-tag-regex=.*, check-interval=600, alive-checking=false, tolerance=100
```

Ready-to-copy files: [examples/profile/](../examples/profile/).

## First refresh

1. Confirm `[general]` has the `sapphireran` parser URL.
2. Add the `[server_remote]` line with `opt-parser=true`.
3. Save the profile.
4. Open **Server Resources**, select **Nexitally**, refresh.
5. Confirm the node list is servers only — no Traffic / 流量 / `[Premium]` rows.
6. Confirm a Nexitally policy group is populated.

Local `[filter_remote]`, `[rewrite_remote]`, and MITM settings should be unchanged after the refresh.
