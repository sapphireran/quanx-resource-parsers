# Quantumult X resource parsers

This repository holds small, personal resource parsers. A resource parser is a JavaScript file Quantumult X downloads once, then runs locally every time a remote resource is refreshed.

Official sample parser:

<https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js>

Official sample configuration:

<https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf>

## What a parser is for

Quantumult X can attach a parser to three kinds of remote resources:

| Resource section | Typical input | Typical output |
| --- | --- | --- |
| `[server_remote]` | a provider config, subscription, or snippet | Quantumult X server lines |
| `[filter_remote]` | a rule list or module | Quantumult X filter rules |
| `[rewrite_remote]` | a rewrite list or module | Quantumult X rewrite rules |

The Nexitally parser in this repository only handles **server** resources. It turns a managed **full Quantumult X configuration** into a server-only snippet.

A parser is not a rewrite script and not a task script. It does not sit on HTTP request or response paths. It only transforms a downloaded resource before Quantumult X imports that resource.

## How Quantumult X invokes a parser

1. You set `resource_parser_url` under `[general]`.
2. You add a remote resource (for servers, a `[server_remote]` line).
3. You enable the parser on that resource with `opt-parser=true`.
4. Quantumult X downloads the resource itself.
5. Quantumult X runs the parser against the downloaded body.
6. Quantumult X imports whatever the parser returns as `content`.

The parser never sees your Apple ID, iCloud files, or other local profile sections. It only sees the one resource Quantumult X just downloaded plus a few metadata fields.

## Runtime APIs

These objects are available inside a resource parser. They come from Quantumult X, not from Node.js.

| Object | Meaning |
| --- | --- |
| `$resource.link` | Original resource URL, or a local path for a snippet |
| `$resource.content` | Downloaded body as UTF-8 text |
| `$resource.info` | `subscription-userinfo` response header, server resources, v1.0.10+ |
| `$resource.tag` | Resource tag from the `[server_remote]` line, v1.0.10+ |
| `$resource.user_agent` | User-Agent used for this download; empty on the first attempt, v1.5.6+ |

Return values:

| Call | Meaning |
| --- | --- |
| `$done({ content: "..." })` | Parsed resource Quantumult X should import |
| `$done({ error: "..." })` | Fail the refresh and show the message |
| `$done({ retry: { user_agent: "..." } })` | Re-download once with that User-Agent, v1.5.6+ |

`$notify(title, subtitle, message)` is also available. HTTP request APIs and persistent storage are **not** available in a resource parser. If a parser needs a network call, it is the wrong tool: Quantumult X must download the resource first.

## Constraints that matter in practice

- Write conservative JavaScript. Quantumult X's parser environment is not a current Node.js or browser runtime. Avoid `const`/`let` if you want the widest compatibility; the Nexitally parser uses `var`.
- Do not use `require`, `import`, `fs`, `fetch`, or `$task.fetch`.
- Normalize `\r\n` and a leading UTF-8 BOM. Provider files often arrive with both.
- Treat the input as untrusted text. A parser should fail with `$done({ error })` instead of throwing.
- Return **only** the resource type Quantumult X asked for. A server parser should return server lines, not a full configuration.
- Never embed a subscription URL, account id, or node password in the parser file. Those belong in the local Quantumult X profile only.

## Enabling a parser

Under `[general]`:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

jsDelivr mirror:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Then mark the remote resource as parser-enabled:

```ini
[server_remote]
<YOUR_PRIVATE_RESOURCE_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=true` is per resource. Other remote resources keep their current behavior.

`resource_parser_url` is a single global slot. Quantumult X does not attach a different parser file per resource. Keep parsers in this repository small and purpose-specific. If two providers need different transforms, either:

- give each resource a URL that already returns Quantumult X servers and leave `opt-parser` off; or
- keep one parser that can recognize the incoming shape and branch, without reading private URLs from the script itself.

## Related official fields on `[server_remote]`

Copied from the official sample configuration, because they show up next to `opt-parser`:

| Parameter | Role |
| --- | --- |
| `tag` | Name shown in the Quantumult X UI |
| `opt-parser` | Run `resource_parser_url` on this resource |
| `update-interval` | Auto-refresh interval in seconds; negative disables auto sync |
| `as-policy` | Import the resource as a policy as well as servers |
| `img-url` | Optional icon |
| `enabled` | Whether the resource is active |
| `require-devices` | Restrict the line to listed Quantumult device IDs |

The default sync interval for remote resources is `86400` seconds. The Nexitally examples use `21600` (six hours) because node lists change more often than filter lists.

## Local fixtures

The parser environment can be approximated on a desktop with Node.js. See [examples/README.md](../examples/README.md) and [scripts/run-nexitally-parser.js](../scripts/run-nexitally-parser.js). That runner is for documentation and regression checks. It is not a Quantumult X substitute.
