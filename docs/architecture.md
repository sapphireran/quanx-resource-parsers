# Architecture

The Nexitally parser is a single JavaScript file that Quantumult X
downloads and runs in its resource-parser sandbox. The same file is also a
Node module so this repository can test it without the iOS/macOS app.

```
Nexitally dashboard
        │  full Quantumult X configuration URL (private, stays on device)
        ▼
Quantumult X  ──GET──►  provider response (UTF-8)
        │
        │  $resource.content = response body
        │  $resource.link    = resource URL, including "#..." hash
        ▼
nexitally-node-parser.js
        │  1. strip BOM / CRLF
        │  2. take [server_local], or fall back to a bare server list
        │  3. keep supported protocol lines
        │  4. drop traffic / expiry / [Premium] placeholders
        │  5. drop duplicates
        │  6. apply optional hash filters
        ▼
$done({ content }) or $done({ error })
        │
        ▼
[server_remote]  (nodes only; local [policy] / [filter_*] unchanged)
```

## Why a parser exists

Nexitally's **Configuration File → Download** product is a complete
Quantumult X profile. Importing it again overwrites `[policy]`,
`[filter_local]`, `[rewrite_local]`, and anything else you have edited.

Quantumult X can instead treat that same URL as a **server resource**. A
resource parser then:

- reads the full profile as opaque text;
- returns only server lines;
- leaves the rest of your local profile alone.

If Nexitally publishes an official server-only Quantumult X subscription,
point `[server_remote]` at that URL and remove this parser.

## Runtime constraints

The official sample parser
([`resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js))
states the sandbox rules this script follows:

| Available | Not available |
| --- | --- |
| `$resource.link` | HTTP requests |
| `$resource.content` | Persistent storage |
| `$resource.info` (`subscription-userinfo`, v1.0.10+) | Node.js APIs |
| `$resource.tag` (v1.0.10+) | |
| `$resource.user_agent` (v1.5.6+) | |
| `$done({content})` / `$done({error})` | |
| `$done({retry:{user_agent}})` (v1.5.6+) | |

This parser does not use `$notify`, `$task`, or retry-UA. It is a pure
function of the response body plus an optional URL hash.

The script stays on ES5-ish syntax (`var`, `function`, no optional
chaining) so older Quantumult X JavaScriptCore builds can load it.

## Dual-mode loading

```javascript
if (typeof $resource !== "undefined" && typeof $done === "function") {
  $done(parseResource($resource));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = NexitallyParser;
}
```

Quantumult X defines `$resource` / `$done` and does not use `module.exports`.
Node does the opposite. Requiring the file in tests therefore cannot
accidentally call `$done`.

## Pipeline details

### 1. Normalize

BOM (`U+FEFF`) is stripped. `\r\n` and `\r` become `\n`. Managed profiles
are often served with Windows newlines.

### 2. Find the node list

`extractSection` uses a case-insensitive `[server_local]` heading and
reads until the next `[section]` or end of file. Other sections
(`[policy]`, `[filter_local]`, `[rewrite_local]`, `[mitm]`) are ignored.

If that heading is missing, `looksLikeServerList` accepts a body that
already contains `anytls=` / `shadowsocks=` / … lines. That is the
fallback for a future server-only subscription.

### 3. Keep usable servers

A line is kept when all of these hold:

- not empty, not a comment (`;`, `#`, `//`);
- starts with a supported protocol token;
- does not look like a traffic/expiry/reset info node (unless `keep-info=1`);
- does not contain `[Premium]` (unless `keep-premium=1`);
- passes `in` / `out` / `regex` / `regout` if those hash params are present;
- has not already been seen (exact-line de-duplication).

Supported protocols: `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`,
`http`, `socks5`. Anything else (for example `wireguard=`) is dropped.

### 4. Return

On success the joined lines are `$done({ content })`. Quantumult X inserts
them into the tagged `[server_remote]` resource. On failure the error
string is shown in the app's resource UI.

## What this parser does not do

It is not a replacement for Shawn's general
[KOP-XIAO/QuantumultX resource-parser](https://github.com/KOP-XIAO/QuantumultX).
It does not convert Clash/Surge/Loon, rename with emoji, or parse
rewrite/filter modules. It only unwraps a Nexitally-style full
configuration (or a bare Quantumult X server list) into nodes.
