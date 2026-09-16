# Resource parser contract

Quantumult X can run a JavaScript resource parser against a remote or local resource before the result is stored as servers, filters, or rewrites. This repository only ships **server** parsers. They turn a downloaded body into Quantumult X server lines.

The official sample parser is [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js). The notes below are the subset this repo relies on.

## Where the parser is configured

Two independent settings must both be present:

1. A global parser URL in `[general]`.
2. `opt-parser=true` on the specific resource that should run through that parser.

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_RESOURCE_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`resource_parser_url` is a single script for the whole profile. Quantumult X does not select a different parser per resource. If you later add a second personal parser, you either:

- keep one focused parser and accept that every `opt-parser=true` resource uses it; or
- replace the global URL with a small dispatcher that inspects `$resource.tag` or `$resource.link` and then applies the matching extract logic.

Do not put the private resource URL in this repository. The placeholder above is the only form that belongs in docs.

## What Quantumult X passes in

The parser runs in Quantumult X's resource-parser environment. HTTP request APIs and persistent storage are **not** available. The input object is `$resource`:

| Field | Meaning |
| --- | --- |
| `$resource.content` | UTF-8 body Quantumult X just downloaded, or the local snippet text. |
| `$resource.link` | Original URL or local path of the resource. |
| `$resource.info` | `subscription-userinfo` response header, when present (v1.0.10+). |
| `$resource.tag` | The `tag=` value from the `[server_remote]` line (v1.0.10+). |
| `$resource.user_agent` | User-Agent used for this download. Empty on the first attempt; set to the retry UA after `$done({retry: ...})` (v1.5.6+). |

The Nexitally parser only reads `$resource.content`. It never follows `$resource.link` and never logs it.

## What the parser must return

Call `$done` exactly once:

| Return | Effect |
| --- | --- |
| `$done({content: "..."})` | Success. For a server resource, `content` must be Quantumult X server lines, one server per line. |
| `$done({error: "..."})` | Failure. Quantumult X shows the message and keeps the previous successful snapshot when it has one. |
| `$done({retry: {user_agent: "..."}})` | Ask Quantumult X to download once more with that User-Agent, then run the parser again. At most one retry per resource. |

A server resource should **not** return a full Quantumult X configuration. Returning `[general]`, `[policy]`, or `[filter_local]` from a `[server_remote]` parser is the failure mode this Nexitally parser exists to prevent.

Successful `content` looks like this:

```text
anytls=hk-01.example.test:443, password=example-password, over-tls=true, tls-host=www.apple.com, udp-relay=true, tag=HK-01
shadowsocks=sg-01.example.test:443, method=2022-blake3-aes-128-gcm, password=BJDBGeLKx/JbEACCSN5rRg==, udp-relay=true, tag=SG-01
```

There is no wrapping `[server_local]` header in the returned body. Quantumult X already knows the destination is a server resource.

## Supported server line prefixes

Quantumult X server lines start with a scheme and `=`. The Nexitally parser keeps these prefixes and drops everything else:

| Prefix | Typical use |
| --- | --- |
| `anytls=` | AnyTLS over standard TLS or Reality. Requires Quantumult X 1.5.6+. |
| `shadowsocks=` | Shadowsocks / ShadowsocksR-style lines Quantumult X accepts. |
| `vmess=` | VMess. |
| `vless=` | VLESS. `method` should be `none`. |
| `trojan=` | Trojan over TLS or `obfs=wss`. |
| `http=` | HTTP / HTTPS proxy. |
| `socks5=` | SOCKS5 / SOCKS5-TLS. |

Lines that start with `;`, `#`, or `//` are comments and are dropped. Empty lines are dropped. Duplicate exact lines are dropped. Lines whose text matches traffic, expiry, or `[Premium]` placeholders are dropped even if they use a supported prefix.

Official field-level examples live in the [Quantumult X sample.conf `[server_local]` section](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf).

## How Quantumult X applies the result

```text
Quantumult X
  │
  ├─ GET private resource URL
  │     (parser never sees the token; the app downloads it)
  │
  ├─ run resource_parser_url with $resource.content
  │
  ├─ store returned server lines under the [server_remote] tag
  │
  └─ policy groups with resource-tag-regex / server-tag-regex
        pick those servers up on the next evaluation
```

Refreshing **Server Resources → Nexitally** updates only that resource. It does not rewrite `[policy]`, `[filter_remote]`, `[rewrite_local]`, or `[mitm]` in the active profile.

Importing a provider's **full configuration file** is a different action. That path replaces the whole profile. See [Nexitally node parser](nexitally.md#why-a-parser-exists).

## Hash parameters on the resource URL

Generic parsers such as KOP-XIAO's `resource-parser.js` read `#key=value&...` after the resource URL (`emoji`, `in`, `out`, `rename`, and so on). Those parameters are **not** sent to the origin server; Quantumult X keeps them on the client.

The Nexitally parser in this repository ignores the URL hash. Filtering and renaming stay in your local `[policy]` groups. If you need hash-parameter behavior, point `resource_parser_url` at a general parser instead of this one, or add a personal dispatcher as described above.

## Local reproduction

On a machine with Node.js, the same `$resource` / `$done` contract can be simulated:

```bash
node scripts/run-parser.js nexitally-node-parser.js examples/nexitally/full-config.conf
```

The harness injects `$resource.content` from the file and prints the `$done` payload. It is not a Quantumult X emulator. It is enough to lock the extract / exclude / dedupe rules against the synthetic fixtures.
