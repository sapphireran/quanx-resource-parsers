# Quantumult X resource parser runtime

Personal notes for writing and testing parsers in this repository. Canonical
behavior comes from Quantumult X itself:

- Official sample parser:
  <https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js>
- Official sample configuration:
  <https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf>
- Parameterized UI protocol (v1.5.6+):
  <https://github.com/crossutility/Quantumult-X/blob/master/parser-helper-protocol.md>

This file records the subset that the Nexitally parser actually uses.

## Where a parser sits in a profile

Quantumult X downloads a remote resource, optionally runs one JavaScript
parser against the response body, then stores the parser's `content` as the
resource body.

Two independent switches must both be on:

1. `[general]` must set `resource_parser_url` to a parser script URL.
2. The resource line must include `opt-parser=true`.

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_PROVIDER_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`resource_parser_url` is global. `opt-parser=true` is per resource. A rewrite or
filter resource can use a different parser only by changing the global URL or by
keeping `opt-parser=false` so that resource is stored unmodified.

## Inputs: `$resource`

Quantumult X injects a global `$resource` object. HTTP request APIs and
persistent storage are **not** available inside a resource parser.

| Field | Meaning | Used by this repo |
| --- | --- | --- |
| `$resource.content` | UTF-8 response body | Yes. This is the managed full configuration. |
| `$resource.link` | Original URL or local path | Reserved. The Nexitally parser does not read it, so a private subscription URL never has to be parsed in script. |
| `$resource.tag` | Resource `tag=` from the profile | No. The local profile already names the resource. |
| `$resource.info` | `subscription-userinfo` response header | No. Traffic/expiry placeholders in the body are dropped instead. |
| `$resource.user_agent` | UA for the current download / retry | No. Nexitally's Quantumult X configuration download does not need a UA retry. |

The parser must treat `$resource.content` as untrusted text:

- UTF-8 BOM (`U+FEFF`) may appear on the first line.
- Line endings may be LF or CRLF.
- Section headers may have surrounding whitespace.
- Comment prefixes are `;`, `#`, and `//`.

## Outputs: `$done`

The script must call `$done` exactly once with an object.

| Result | Quantumult X behavior |
| --- | --- |
| `{ content: "..." }` | Store that string as the resource body. For a server resource, each line is a server entry. |
| `{ error: "..." }` | Surface the message and keep the previous body if one exists. |
| `{ retry: { user_agent: "..." } }` | Re-download once with that UA (v1.5.6+). Older builds ignore `retry`. |

The Nexitally parser only returns `content` or `error`. It never retries and
never calls `$notify`.

Returned server content should be **only** Quantumult X server lines, one per
line, with no surrounding `[server_local]` header. `[server_remote]` resources
are already server lists.

## What a parser must not do

Official sample comments state that HTTP request and persistent storage APIs
are unsupported in this environment. In practice that means:

- Do not fetch a second URL from inside the parser. Quantumult X already
  fetched `$resource.link`.
- Do not write files, Keychain items, or `$prefs`.
- Do not log the subscription URL, node passwords, or account identifiers.
- Do not assume Node.js, `require`, or `fetch` exist when the script runs on
  device. Node is used only by the local example checker in this repository.

The checked-in parser stays on ES5 syntax (`var`, `function`, `Array#map`)
because Quantumult X runs JavaScriptCore, not Node 22.

## `opt-parser` and update interval

`update-interval` is seconds. `21600` is six hours. A negative value disables
automatic refresh.

The parser runs on every successful download, including manual refresh from
**Server Resources**. If the provider's full configuration has not changed, the
parser still runs; the output should be stable (same server lines, same order,
duplicates already removed).

## Local policy after parsing

The parser returns servers. It does **not** rewrite `[policy]`. Keep policy in
the local profile and select the imported servers with `resource-tag-regex`
and/or `server-tag-regex`:

```ini
[policy]
static = nexitally, resource-tag-regex=^Nexitally, img-url=https://example.com/icon.png
```

A local-profile snippet for that pattern lives under `examples/quantumult-x/`
once examples are added.

## Parameterized UI (`$parser`)

Quantumult X 1.5.6+ can render hash-parameter editors when the script defines:

- `$parser.hashSchema()`
- `$parser.hashToUI(hash)`
- `$parser.uiToHash(values)`

The Nexitally parser does not implement `$parser`. The private URL stays in
the local profile, and this extractor has no `in=` / `out=` hash filters. If
node filtering is needed, do it in a local policy or add a dedicated parser
later. Do not copy a giant third-party parser into this repository unless it is
personally maintained here.

## Local Node simulation

On a laptop, Quantumult X is not required to check extraction rules. A local
runner can inject `$resource` / `$done` and compare output to files under
`examples/`. That path never sends network requests and never needs a real
subscription URL.
