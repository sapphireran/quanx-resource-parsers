# Quantumult X runtime

`nexitally-node-parser.js` is a **resource parser**, not a rewrite script. Quantumult X loads it when a remote resource has `opt-parser=true` and `[general]` defines `resource_parser_url`.

The official sample is [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) (Quantumult X v1.0.8-build253 and later).

## Inputs

| Object | Meaning | Used by this parser? |
| --- | --- | --- |
| `$resource.content` | UTF-8 body of the downloaded resource | Yes |
| `$resource.link` | Original URL or local path | No |
| `$resource.info` | `subscription-userinfo` response header (v1.0.10+) | No |
| `$resource.tag` | Resource tag from the `[server_remote]` line (v1.0.10+) | No |
| `$resource.user_agent` | Current download UA; set after a retry (v1.5.6+) | No |

HTTP request APIs and persistent storage are **not** available inside a resource parser. `$notify(title, subtitle, message)` is available but unused here.

## Outputs

| Call | Meaning |
| --- | --- |
| `$done({ content: "..." })` | Replace the resource with the returned text |
| `$done({ error: "..." })` | Fail the refresh and show the message |
| `$done({ retry: { user_agent: "..." } })` | Re-download once with that UA (v1.5.6+). Unused here |

This parser only returns `content` or `error`.

## How Quantumult X finds the script

`resource_parser_url` is a single URL in `[general]`. Every resource with `opt-parser=true` shares that script. A generic parser such as [KOP-XIAO/QuantumultX `resource-parser.js`](https://github.com/KOP-XIAO/QuantumultX) can convert Clash / Surge / V2RayN subscriptions. This repository's script is narrower: it only understands a Quantumult X full config that already contains `[server_local]`.

Do not point `resource_parser_url` at this script if other resources still need a general-purpose converter. Either:

- use one parser that can handle every enabled `opt-parser=true` resource, or
- disable `opt-parser` on resources that are already Quantumult X server lists.

## Local replay

Node does not provide `$resource` or `$done`. [`scripts/lib/qx-harness.js`](../scripts/lib/qx-harness.js) injects both, loads the real parser file, and returns the same `{ content }` or `{ error }` object Quantumult X would receive.
