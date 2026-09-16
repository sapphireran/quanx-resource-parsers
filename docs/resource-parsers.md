# Quantumult X resource parsers

A resource parser is a small JavaScript file that Quantumult X downloads once (from `resource_parser_url`) and then runs locally against a remote or local resource. The parser does **not** fetch the subscription. Quantumult X fetches the resource, then hands the response body to the parser.

This repository's Nexitally parser is a server-resource parser: it turns a full managed Quantumult X configuration into a list of `[server_local]`-style lines that Quantumult X can attach as `[server_remote]`.

## Where the parser is configured

Two independent settings must both be present.

### 1. Global parser URL

In `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Equivalent raw GitHub URL:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Quantumult X has a single `resource_parser_url`. Every resource that sets `opt-parser=true` uses that same script. If you later switch this URL to a general-purpose converter (for example a Clash-to-QX parser), the Nexitally full-config extraction described here will stop running.

### 2. Per-resource opt-in

In `[server_remote]`:

```ini
<YOUR_PRIVATE_RESOURCE_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser` defaults to off. A resource without `opt-parser=true` is imported as-is. That is the correct behavior for an official server-only snippet; it is the wrong behavior for a full configuration that still contains `[general]`, `[policy]`, and `[filter_local]`.

Other useful `[server_remote]` fields (from the official sample configuration):

| Field | Role |
| --- | --- |
| `tag` | Label shown in the Quantumult X UI and available to the parser as `$resource.tag` |
| `update-interval` | Auto-refresh interval in seconds. `21600` is six hours. A negative value disables auto sync. The default is `86400` |
| `enabled` | Whether the resource is loaded |
| `as-policy` | Optional policy wrapper for the imported servers |
| `img-url` | Optional icon |
| `require-devices` | Optional Quantumult device-ID allow-list |

Keep the private URL only in the local profile. See [privacy.md](privacy.md).

## Runtime objects

Official sample: [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) (Quantumult X v1.0.8-build253 and later).

### Input: `$resource`

| Field | Meaning |
| --- | --- |
| `$resource.content` | UTF-8 body Quantumult X downloaded. This is the only field the Nexitally parser reads |
| `$resource.link` | Original URL, or a local path if the resource is a file under Quantumult X / Profiles |
| `$resource.tag` | The `tag=` value from the resource line (v1.0.10+) |
| `$resource.info` | `subscription-userinfo` response header, when present (v1.0.10+) |
| `$resource.user_agent` | User-Agent used for the current download. Empty on the first attempt; set during a UA retry (v1.5.6+) |

The Nexitally parser ignores `link`, `tag`, `info`, and `user_agent` on purpose. A parser that branched on the URL would be one leaked URL away from embedding account-specific logic in a public file.

### Output: `$done`

| Call | Meaning |
| --- | --- |
| `$done({ content: "..." })` | Success. For a server resource, `content` must be Quantumult X server lines, one per line, the same shape as `[server_local]` entries |
| `$done({ error: "..." })` | Hard failure. Quantumult X shows the message and does not update the resource |
| `$done({ retry: { user_agent: "..." } })` | Ask Quantumult X to re-download once with a different User-Agent (v1.5.6+). At most one retry per resource |

The official sample notes that HTTP request APIs and persistent storage are **not** available in the resource-parser sandbox. A parser cannot call out to another host, write files, or remember the previous run.

`$notify(title, subtitle, message)` is available, but this parser stays silent so a refresh does not spam notifications.

## What the parser must return

For `[server_remote]`, Quantumult X expects server lines, not a second full configuration.

Valid:

```ini
anytls=example.com:443, password=pwd, over-tls=true, tls-host=apple.com, udp-relay=true, tag=anytls-standard-tls-01
trojan=example.com:443, password=pwd, over-tls=true, tls-verification=true, tag=trojan-tls-01
```

Invalid as parser output:

```ini
[general]
resource_parser_url = ...

[server_local]
anytls=example.com:443, password=pwd, over-tls=true, tag=node-01

[policy]
static = Proxy, node-01, direct
```

If the parser returned that full file, Quantumult X would try to treat section headers and policy lines as servers. The Nexitally parser exists specifically to prevent that.

## Resource types the same API can serve

The same `$resource` / `$done` contract is used for:

- server resources (`[server_remote]`)
- filter resources (`[filter_remote]`)
- rewrite resources (`[rewrite_remote]`)

This repository only implements a server parser. Do not point `opt-parser=true` filter or rewrite resources at `nexitally-node-parser.js`. That script looks for `[server_local]` and will error on a rule list.

## Hash parameters versus this parser

Community converters such as KOP-XIAO's `resource-parser.js` read `#in=...&rename=...` fragments on the resource URL. Those parameters are **not** part of Quantumult X itself; they are a convention of that script.

`nexitally-node-parser.js` does not read the URL hash. Filtering and renaming stay in your local `[policy]` groups (`resource-tag-regex`, `server-tag-regex`) or in a later personal parser, if you add one. Mixing this extractor with a general-purpose converter on the same `resource_parser_url` is not supported.

## Local files

Quantumult X can parse a file under its Profiles directory:

```ini
[server_remote]
nexitally-full.conf, tag=Nexitally, opt-parser=true, enabled=true
```

That is useful when debugging: export or paste a **redacted** full configuration into the Profiles folder and refresh without touching the live subscription URL. The fixtures in `examples/fixtures/` are the same idea, run from Node instead of the app.

## Limits of the sandbox

- No `http://` / `https://` client APIs
- No `$persistentStore`
- No filesystem besides the `$resource.content` Quantumult X already loaded
- ES5-style JavaScript is the safe baseline. This parser uses `var`, `map`, and `filter` only
- The script is evaluated per refresh. There is no module system and no `require`

The Node helper `examples/run-fixtures.js` recreates `$resource` and `$done` so the same file can be exercised outside Quantumult X. It is a test double, not a second production runtime.
