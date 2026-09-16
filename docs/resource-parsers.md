# Quantumult X resource parsers

This note is the personal working model used in this repository. It is not a substitute for [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) or the official [`resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) sample.

## What a resource parser is

Quantumult X can download a remote resource and then run a JavaScript file against the response **on the device**. The script sees the body, optionally some metadata, and must call `$done(...)` with either rewritten text or an error.

Typical uses:

- convert a vendor format into Quantumult X server lines
- strip extra sections from a full configuration so only servers remain
- filter, rename, or otherwise reshape an already-valid resource

This repository only does the second job, and only for Nexitally's full Quantumult X configuration. It is not a general Clash / Surge / V2RayN converter. For that class of work, people usually point `resource_parser_url` at a general parser such as KOP-XIAO's. You can keep a general parser **or** this one, not both: Quantumult X has a single `resource_parser_url`.

## Where it is wired

Two places must agree:

1. `[general] resource_parser_url = <https URL of a .js file>`
2. On the remote resource line, `opt-parser=true`

Without (1), the app reports that no custom parser is configured. Without (2), Quantumult X imports the downloaded body as-is.

Server resources live under `[server_remote]`:

```ini
[server_remote]
https://example.com/private-full-config, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`update-interval` is seconds. `21600` is six hours. A negative value disables automatic refresh.

The downloaded URL is fetched by Quantumult X. The parser never sees your account cookie store beyond whatever the HTTP response body already contains, and **this repository must never contain that URL**.

## Runtime API (the subset this repo cares about)

Globals available to a resource parser (official sample, Quantumult X ≥ 1.0.8, with later additions noted):

| Object | Role |
| --- | --- |
| `$resource.link` | Original URL or local path |
| `$resource.content` | Response body, UTF-8 |
| `$resource.info` | `subscription-userinfo` response header (server resources, v1.0.10+) |
| `$resource.tag` | Resource `tag=` (v1.0.10+) |
| `$resource.user_agent` | User-Agent used for this download; empty on the first try (v1.5.6+) |

Outputs:

| Call | Meaning |
| --- | --- |
| `$done({ content: "..." })` | Use this text as the imported resource |
| `$done({ error: "..." })` | Fail the refresh and show the message |
| `$done({ retry: { user_agent: "..." } })` | Re-download once with that User-Agent (v1.5.6+). At most one retry. Older builds ignore `retry`. |

HTTP request APIs and persistent storage are **not** available in a resource parser. If a script needs a second network hop, it does not belong in this slot.

`$notify(title, subtitle, message)` exists. The Nexitally parser does not use it.

v1.5.6 also added an optional `$parser` helper-protocol so a script can describe hash-query UI controls. This repository does not implement that protocol.

## What the return value must look like

For a **server** resource, `$done({ content })` must be Quantumult X server lines, one per node, the same shape as `[server_local]` entries:

```text
shadowsocks=ui-a.example.com:80, method=chacha20, password=pwd, tag=Tag-A
```

Do not wrap the result in `[server_local]` / `[server_remote]` section headers. Quantumult X is already importing the result *as* a server resource.

Do not return a full profile. Returning `[policy]` or `[filter_local]` from a server parser is how people accidentally smash a working configuration.

## `[server_local]` vs `[server_remote]`

| | `[server_local]` | `[server_remote]` |
| --- | --- | --- |
| Where the lines live | Inside the active profile | Downloaded (and optionally parsed) on a schedule |
| Who updates them | You, or a full-profile replace | The remote URL + optional parser |
| Nexitally full download | Ships nodes here | Not used unless you add it |

Nexitally's **Configuration File → Download** product is a complete profile. Re-importing it replaces `[general]`, `[policy]`, filters, rewrites, and MITM along with the nodes. The parser exists so you can keep a stable local profile and treat Nexitally as one refreshable server resource.

## Execution model used in this repo

```text
Quantumult X                      This repository
────────────                      ───────────────
GET <private Nexitally URL>
        │
        ▼
 $resource.content  ─────────►  nexitally-node-parser.js
                                    strip BOM / CRLF
                                    find [server_local]
                                    keep supported server lines
                                    drop comments, dupes, traffic, [Premium]
                                    │
 $done({ content })  ◄──────────────┘
        │
        ▼
 [server_remote] tag=Nexitally
```

`scripts/lib/qx-parser-harness.js` is a Node `vm` sandbox that supplies the same two globals so examples can run on a laptop. It is not a Quantumult X emulator beyond `$resource` / `$done` / `$notify`.

## Choosing a parser URL

Prefer a URL you control:

- `https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js`
- `https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js`

Pinning `@<git-sha>` on jsDelivr, or a raw URL that includes a commit SHA, stops a later `main` push from changing device behavior without you noticing.

Do not commit a `file://` path or a LAN URL that only works on one machine unless that profile stays private.

## Related official files

- [Official resource parser sample](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js)
- [Parser helper protocol (v1.5.6+)](https://github.com/crossutility/Quantumult-X/blob/master/parser-helper-protocol.md)
- [sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) — `resource_parser_url` and `[server_remote]` parameter comments
