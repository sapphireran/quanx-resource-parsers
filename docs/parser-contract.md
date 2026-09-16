# Quantumult X resource parser contract

This repository's scripts run inside Quantumult X as **resource parsers**, not as rewrite scripts or HTTP rewrite workers. The official sample is [`resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js) in [crossutility/Quantumult-X](https://github.com/crossutility/Quantumult-X).

A parser does not fetch the subscription. Quantumult X downloads the resource, then hands the UTF-8 body to the script.

## Runtime

| Item | Behavior |
| --- | --- |
| Language | JavaScript as implemented by Quantumult X (ES5-safe style is the portable choice) |
| Entry | The script file referenced by `resource_parser_url` in `[general]` |
| Networking | HTTP request APIs are **not** available |
| Storage | Persistent storage APIs are **not** available |
| Notify | `$notify(title, subtitle, message)` is available; this repo does not use it |
| Completion | The script must call `$done` exactly once |

Local verification uses [`scripts/qx-parser-harness.js`](../scripts/qx-parser-harness.js), which injects the same globals and rejects a missing or double `$done`.

## Input: `$resource`

| Field | Since | Meaning |
| --- | --- | --- |
| `$resource.content` | v1.0.8 | UTF-8 body Quantumult X received |
| `$resource.link` | v1.0.8 | Original URL, or a local path for a file resource |
| `$resource.info` | v1.0.10 | `subscription-userinfo` response header, when the server sent one |
| `$resource.tag` | v1.0.10 | Tag from the `[server_remote]` / `[filter_remote]` / `[rewrite_remote]` line |
| `$resource.user_agent` | v1.5.6 | User-Agent used for this download. Empty on the first attempt |

The Nexitally parser reads **only** `$resource.content`. It must not read `$resource.link`. A private Nexitally URL in `link` must never be logged, notified, or written back into `content`.

## Output: `$done`

| Call | Meaning |
| --- | --- |
| `$done({ content: "..." })` | Replace the resource body with this UTF-8 string |
| `$done({ error: "..." })` | Fail the refresh and show the message |
| `$done({ retry: { user_agent: "..." } })` | Ask Quantumult X ≥ 1.5.6 to re-download once with that UA |

Priority on current Quantumult X: `retry` wins over `content` / `error`. Older builds ignore `retry`, so a retrying parser should still include a fallback `content` or `error`. This repository does not retry.

For a `[server_remote]` resource, `content` must be Quantumult X **server lines only**:

```text
anytls=host:443, password=..., over-tls=true, tag=Name
shadowsocks=host:443, method=..., password=..., tag=Name
```

Do not wrap the result in `[server_local]` or `[server_remote]`. Quantumult X already knows the destination section from the resource type.

## Enabling a custom parser

Quantumult X uses a single `resource_parser_url`. Put it in the **local** profile:

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

Raw GitHub is equivalent when jsDelivr is cached or blocked:

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

Each remote resource that should run the parser needs `opt-parser=true`:

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

`opt-parser=false` (the default) stores the downloaded body as-is. For a Nexitally *full* configuration that would import `[policy]` and filters as if they were server lines, which is why this parser exists.

## What a server line looks like

The official [`sample.conf`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf) is the syntax source of truth. Prefixes this parser accepts:

| Prefix | Notes |
| --- | --- |
| `anytls=` | Requires Quantumult X 1.5.6+ (AnyTLS). UDP is native; do not add `udp-over-tcp` |
| `shadowsocks=` | Includes 2022 methods and `obfs=over-tls` / `obfs=wss` |
| `vmess=` | UUID goes in `password=` |
| `vless=` | `method=none`; optional `vless-flow=` |
| `trojan=` | `over-tls=true` or `obfs=wss` |
| `http=` | Optional username / password / TLS |
| `socks5=` | Same optional TLS shape as `http=` |

Comments in Quantumult X start with `;`, `#`, or `//`. The parser drops those rows.

## Design rules used in this repo

1. **ES5.** `var`, `function`, no optional chaining, no `const`/`let` in the parser file itself. Quantumult X's JS host has historically lagged Node.
2. **No I/O.** If a transform needs a network call, it does not belong in a resource parser.
3. **Fail closed.** Missing `[server_local]` or zero usable rows is an error, not an empty success. An empty success looks like "the subscription deleted every node."
4. **Do not rewrite policy.** The point of parsing Nexitally's full file is to *avoid* replacing the local profile.
5. **Keep secrets out of git.** See [security.md](security.md).

## Local sandbox vs the app

| | Quantumult X | `scripts/qx-parser-harness.js` |
| --- | --- | --- |
| Downloads the URL | Yes | No — reads a file you already saved |
| Injects `$resource` | Yes | Yes |
| Requires `$done` | Yes | Yes, and rejects a second call |
| Honors `retry` | v1.5.6+ | Returned to the caller; no re-download |
| Node version | App JS host | Node 18+ on a laptop |

Use the harness for fixtures. Use the app to confirm AnyTLS handshake behavior and `opt-parser` UI flags.
