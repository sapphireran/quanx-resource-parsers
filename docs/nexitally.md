# Nexitally node parser

`nexitally-node-parser.js` is a personal Quantumult X resource parser. It extracts usable server lines from Nexitally's managed **full configuration** and returns only those lines to `[server_remote]`.

The script contains no subscription URL, account id, node password, or other private data. Quantumult X downloads the Nexitally configuration itself. The parser only reads `$resource.content`.

## Why this parser exists

Nexitally's Quantumult X export is a complete profile:

- `[general]`
- `[dns]`
- `[policy]`
- `[server_local]`
- `[filter_remote]` / `[filter_local]`
- `[rewrite_remote]` / `[rewrite_local]`
- `[mitm]`
- other sections Nexitally chooses to ship

That file is meant to be imported as **Configuration File → Download**. Doing that replaces the active profile. Local policy groups, filter lists, rewrite lists, and MITM hostnames disappear.

The useful part for an already-stable profile is the `[server_local]` section. This parser turns that section into an independently refreshable server resource.

If Nexitally later publishes an official server-only Quantumult X subscription, use that resource and remove this parser.

## What the parser keeps

A line is kept when all of the following are true:

1. It sits inside `[server_local]` (case-insensitive section header).
2. It is not a comment. Comments are lines that start with `;`, `#`, or `//`.
3. It starts with a supported Quantumult X server prefix:
   - `anytls=`
   - `shadowsocks=`
   - `vmess=`
   - `vless=`
   - `trojan=`
   - `http=`
   - `socks5=`
4. It does not look like traffic, expiry, or placeholder metadata. The exclusion pattern is:

   `[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`
5. It is not a duplicate of an earlier kept line. Comparison is the full trimmed line.

Supported prefixes are matched case-insensitively.

## What the parser drops

| Input | Reason |
| --- | --- |
| Every section except `[server_local]` | Those belong in the local profile, not in a server resource |
| Blank lines and comments | They are not servers |
| Lines that are not Quantumult X server lines | Avoid importing policy or filter text as nodes |
| Traffic / expiry / package info nodes | They are status labels, not usable proxies |
| `[Premium]` placeholders | They are locked or advertising rows |
| Exact duplicate server lines | One copy is enough |

The parser does **not**:

- rewrite hostnames, ports, or passwords
- add emoji, rename tags, or sort nodes
- read `$resource.link` or `$resource.tag`
- retry the download with another User-Agent
- convert Clash, Surge, or SIP008 subscriptions

Those jobs belong to a general-purpose parser such as KOP-XIAO's resource parser, or to Nexitally if they ship a server-only feed.

## End-to-end setup

Assume you already have a Quantumult X profile you want to keep: policies, filters, rewrites, MITM.

### 1. Copy your private Nexitally Quantumult X URL

In the Nexitally dashboard, open the Quantumult X full-configuration download URL. Keep that URL in the Quantumult X app only. Do not paste it into this repository, a public Gist, a screenshot, or a chat log you do not control.

### 2. Point Quantumult X at this parser

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Older bookmarks that still use the previous GitHub username `pang990801` should be updated to `sapphireran`.

### 3. Add the private URL as a server resource

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is required. Without it, Quantumult X tries to import the full configuration as a server list and the refresh fails or pollutes the node list.

### 4. Refresh only the server resource

After saving the profile:

1. Open **Server Resources**.
2. Find the `Nexitally` tag.
3. Refresh that resource.

`[policy]`, `[filter_remote]`, `[rewrite_remote]`, and local MITM settings stay as you left them. New or removed Nexitally nodes appear on the next successful refresh.

### 5. Point policies at the resource

If a policy should follow the Nexitally list, use `resource-tag-regex` instead of hard-coding node names:

```ini
[policy]
static = Nexitally, resource-tag-regex=^Nexitally, server-tag-regex=., img-url=https://raw.githubusercontent.com/crossutility/Quantumult-X/master/quantumult-x.png
```

`resource-tag-regex=^Nexitally` matches the `[server_remote]` tag. `server-tag-regex=.` keeps every node from that resource. Tighten the server regex if you only want a region.

## Error messages

The parser has two explicit failures:

| Message | Meaning |
| --- | --- |
| `Nexitally parser: [server_local] section was not found.` | The download is not a full Quantumult X configuration, the section name changed, or the body is empty / HTML / JSON |
| `Nexitally parser: no usable server entries were found.` | `[server_local]` existed but every line was a comment, metadata row, or unsupported prefix |

See [troubleshooting.md](troubleshooting.md) for recovery steps.

## Compatibility

- Requires a Quantumult X build that supports resource parsers (`resource_parser_url`, `opt-parser`).
- AnyTLS lines need Quantumult X **1.5.6** (build 914) or later.
- Reality parameters (`reality-base64-pubkey`, `reality-hex-shortid`) need a build that already understands them. The parser does not interpret those fields; it only forwards the line.
- Tested against configurations whose live nodes are AnyTLS. Mixed Shadowsocks / VMess / VLESS / Trojan / HTTP / SOCKS5 lines are accepted when they appear in `[server_local]`.

## Local check

From the repository root, with Node.js installed:

```bash
node scripts/run-nexitally-parser.js
```

That command runs the checked-in fixtures under `examples/fixtures/`. It is the fastest way to see what the parser keeps and drops without opening Quantumult X.

To parse one file:

```bash
node scripts/run-nexitally-parser.js examples/fixtures/typical-full-config.input.conf
```
