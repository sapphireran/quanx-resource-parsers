# Nexitally node parser

`nexitally-node-parser.js` is a Quantumult X resource parser for one personal
use case: Nexitally's **managed full Quantumult X configuration**.

Nexitally's Configuration File → Download product is a complete profile. If
that file is imported as the active Quantumult X configuration, it replaces
`[policy]`, `[filter_remote]`, DNS, and every other local section. The parser
exists so the same download can be attached as a `[server_remote]` resource
instead. Quantumult X still fetches the private URL. The parser then keeps
only usable server lines.

This document describes the keep/drop rules as implemented today. The
fictional fixtures under `examples/nexitally/` are the executable form of the
same rules.

## Why a parser is needed

| Approach | What happens |
| --- | --- |
| Import the Nexitally full configuration as the active profile | Replaces the whole local profile on every refresh. |
| Point `[server_remote]` at the same URL **without** a parser | Quantumult X stores a full configuration where it expected server lines. |
| Point `[server_remote]` at the same URL **with** this parser | `[server_local]` is extracted, placeholders are dropped, and only server lines are stored. |

If Nexitally later publishes an official server-only Quantumult X
subscription, prefer that resource and remove this parser.

## Inputs the parser does not contain

The committed script has no:

- subscription URL;
- account identifier;
- node password;
- traffic quota;
- expiry date.

Quantumult X downloads the private resource and passes the body in
`$resource.content`. The parser only reads that string.

## Processing steps

The script is intentionally small. The steps below match the current file
line-for-line.

### 1. Normalize the downloaded body

```text
String($resource.content || "")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n/g, "\n")
```

- Missing content becomes an empty string.
- A leading UTF-8 BOM is removed so `[server_local]` can match at column 0.
- CRLF is folded to LF so the section regex can use `\n`.

### 2. Extract `[server_local]`

```text
/(?:^|\n)\s*\[server_local\]\s*\n([\s\S]*?)(?=\n\s*\[[^\]]+\]\s*(?:\n|$)|$)/i
```

The heading is case-insensitive, so `[SERVER_LOCAL]` is accepted.

The capture group is the text **after** the heading and **before**:

- the next INI-style `[section]` heading, or
- the end of the file.

If the heading is absent, the parser returns:

```text
Nexitally parser: [server_local] section was not found.
```

That usually means the URL is already a server-only snippet, a Clash or
Surge subscription, or an HTML error page.

### 3. Split, trim, and drop comments

Each remaining line is trimmed. Empty lines are dropped. Lines that start
with `;`, `#`, or `//` are dropped.

Inline comments after a server URI are **not** stripped. A line must be a
comment in full, matching Quantumult X's own comment rule.

### 4. Keep supported schemes only

A line is kept only when it matches:

```text
/^(?:anytls|shadowsocks|vmess|vless|trojan|http|socks5)\s*=/i
```

Everything else is dropped, including:

- Surge `ss://`, `vmess://`, `trojan://` URIs;
- Clash YAML maps;
- leftover `[general]` keys if a section boundary failed;
- informational `tag=`-only lines that are not server URIs.

### 5. Drop traffic, expiry, and `[Premium]` placeholders

A line is dropped when it matches:

```text
/(?:\[Premium\]|Traffic|Expire|Reset|Days Left|流量|到期|剩余|套餐)/i
```

Nexitally-style full configurations often insert pseudo-nodes that carry
quota or plan text instead of a usable endpoint. Those lines are not useful
in `[server_remote]`, and they pollute policy groups that match `.*`.

The same rule also drops a real node whose tag happens to contain one of
those words. That is deliberate and documented: this parser prefers a clean
server list over preserving every marketing or quota label. If a future
personal node name needs one of those words, rename it in the local profile
or fork the excluded regex.

### 6. Drop exact duplicate lines

The parser records each kept line in an object keyed by the full trimmed
line. The first copy is kept. Later identical copies are dropped.

This is exact-string deduplication. Two servers with the same host and
different tags are both kept. Two copies of the same line are not.

### 7. Return content or an error

If at least one line remains:

```text
$done({ content: servers.join("\n") })
```

If the section existed but every line was filtered:

```text
Nexitally parser: no usable server entries were found.
```

The result is a newline-separated snippet with **no trailing section
header**. That is the format Quantumult X expects for a server resource.

## What is intentionally left alone

The parser does not:

- rename nodes;
- add emoji or region flags;
- force `udp-relay`, `fast-open`, or TLS verification;
- sort by region;
- read `$resource.link` or `$resource.info`;
- fetch any additional URL;
- write files or use persistent storage.

Those behaviors belong in a general-purpose parser. This script only
converts one managed full configuration into a server list.

## Worked example

The fictional file `examples/nexitally/input-full-config.conf` contains:

- two usable AnyTLS nodes;
- one exact duplicate of the first node;
- traffic / expiry / leftover-days / Chinese-quota pseudo-nodes;
- a `[Premium]` placeholder;
- later `[policy]`, `[filter_local]`, and `[server_remote]` sections that
  must not leak.

The expected snippet is
`examples/nexitally/expected-servers.snippet`: two AnyTLS lines, in file
order, with the duplicate and every placeholder removed.

Run the same case locally with:

```bash
node tools/run-examples.js
```

## Compatibility

- Quantumult X must support resource parsers (`opt-parser=true`).
- AnyTLS lines require a Quantumult X build that understands `anytls=`.
  Official sample notes place AnyTLS around 1.5.6.
- The parser itself is ES5-style JavaScript (`var`, no optional chaining) so
  it stays conservative inside the Quantumult X JS runtime.

## Related files

- [quantumult-x-parser-api.md](quantumult-x-parser-api.md) — runtime globals.
- [troubleshooting.md](troubleshooting.md) — refresh failures.
- [privacy.md](privacy.md) — what must never be committed.
- [../examples/nexitally/README.md](../examples/nexitally/README.md) — fixtures.
