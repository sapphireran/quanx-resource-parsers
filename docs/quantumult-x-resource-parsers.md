# Quantumult X resource parsers

A resource parser is a small JavaScript file that Quantumult X runs **on the device** after it downloads a remote resource. The script sees the response body, optionally rewrites it, and returns text that Quantumult X stores as that resource.

This repository uses that hook for one personal job: turn Nexitally's **full configuration** response into a **server-only** resource.

Official sample parser:

https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js

Official sample profile (shows `resource_parser_url` and `opt-parser=true`):

https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf

## Where parsers run

Quantumult X can attach a parser to:

- `[server_remote]` — server subscriptions and server snippets
- `[filter_remote]` — filter / rule lists
- `[rewrite_remote]` — rewrite resources

This repo only documents the server case. The Nexitally parser must return Quantumult X **server lines**, not a full profile.

## Enabling a parser

Two switches have to be on at once.

1. `[general]` names the script:

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Quantumult X loads **one** `resource_parser_url` per profile. If you already use a large community parser (for Clash / Surge conversion), you cannot also point this field at the Nexitally script. In that situation, either:

- keep the community parser and do not use this script; or
- use this script in a profile that does not need the community parser.

2. The resource that needs rewriting sets `opt-parser=true`:

```ini
[server_remote]
https://example.invalid/private-full-config, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

Without `opt-parser=true`, Quantumult X stores the downloaded body as-is. For Nexitally that body is a full profile, which is the problem this parser exists to avoid.

## Objects the script may read

Quantumult X injects globals. HTTP request helpers and persistent storage are **not** available inside a resource parser.

| Object | Meaning |
| --- | --- |
| `$resource.content` | UTF-8 body of the download |
| `$resource.link` | Original URL or local path |
| `$resource.info` | `subscription-userinfo` response header (v1.0.10+) |
| `$resource.tag` | Resource `tag=` from the profile (v1.0.10+) |
| `$resource.user_agent` | User-Agent used for this download (v1.5.6+). Empty on the first try |

`$notify(title, subtitle, message)` is available. This repository's parser does not use it.

The Nexitally parser only reads `$resource.content`. It ignores link, tag, and userinfo on purpose so the script contains no account-specific logic.

## Values the script may return

Call `$done` exactly once.

| Return | Effect |
| --- | --- |
| `$done({ content: "..." })` | Resource body becomes this string |
| `$done({ error: "..." })` | Refresh fails and Quantumult X shows the message |
| `$done({ retry: { user_agent: "..." } })` | Re-download once with that User-Agent (v1.5.6+) |

On current Quantumult X, `retry` wins over `content` / `error`. Older builds ignore `retry`. The Nexitally parser does not retry; Nexitally's full-configuration URL is already a Quantumult X document.

## What a server resource must look like after parse

Each kept line is one Quantumult X server. Typical shapes, taken from the official sample and rewritten with reserved examples:

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, tag=ss-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, tag=trojan-tls-01
```

Do not wrap the result in `[server_local]` or `[server_remote]`. Do not return `[policy]`, `[filter_local]`, or `[mitm]`. Quantumult X already knows the result belongs to a server resource.

## Execution limits that matter here

- The script must be self-contained. There is no `require`, no `fetch`, and no disk.
- Syntax has to stay compatible with the Quantumult X JavaScript engine. The parsers in this repo stick to `var`, string methods, and regular expressions.
- Work should finish quickly. These scripts scan one UTF-8 document.

The Node helpers under `scripts/` re-create `$resource` and `$done` so the same files can be checked on a computer. They are not a second parser runtime for the phone.

## Community parsers vs this parser

Popular community parsers (for example the widely used `resource-parser.js` with `#in=` / `#emoji=` hash parameters) convert **many subscription formats** and then filter by node name.

This repository's Nexitally parser does something narrower:

1. assume the download is already a Quantumult X profile;
2. read `[server_local]` only;
3. drop banners and placeholders that are not real nodes.

It does not implement `#in=` hash filters. If you need region slices, use Quantumult X `server-tag-regex` on a policy, or filter after the resource has been parsed. See `examples/profile-snippets/policy-with-resource-tag.conf`.
