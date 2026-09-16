# Nexitally node parser

`nexitally-node-parser.js` turns a Nexitally **full Quantumult X configuration** into a list of server lines that `[server_remote]` can import.

It does not fetch anything. Quantumult X downloads the private URL; the script only reads `$resource.content`.

## Why it exists

Nexitally's in-app **Configuration File → Download** returns a complete profile: DNS, policy groups, filters, rewrites, MITM, and `[server_local]` nodes.

Re-downloading that file is convenient the first time and destructive after you have a working local setup. The parser keeps the nodes and throws the rest away.

If Nexitally later publishes an official server-only Quantumult X subscription, use that and delete this layer.

## Pipeline

The script is one pass. There are no network calls and no persistent store.

1. **Coerce and normalize.** `String($resource.content || "")`, strip a leading UTF-8 BOM, rewrite `\r\n` to `\n`.
2. **Locate `[server_local]`.** Case-insensitive. Optional spaces around the bracket name. The section must be followed by a newline. Capture until the next INI section header or end of file.
3. **Split, trim, drop blanks.**
4. **Drop comments** whose trimmed form starts with `;`, `#`, or `//`.
5. **Keep supported prefixes only:** `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`, with optional spaces before `=`.
6. **Drop excluded keywords** anywhere on the line (tag or body): `[Premium]`, `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`.
7. **Deduplicate** exact trimmed lines. The first copy wins.
8. **`$done`:** `{ content: lines.join("\n") }` or one of the two error strings below.

```text
Nexitally parser: [server_local] section was not found.
Nexitally parser: no usable server entries were found.
```

The first error means the download was not a Quantumult X profile with that section (wrong URL, HTML login page, Clash YAML, empty body). The second means the section existed but every line was a comment, unsupported protocol, or excluded placeholder.

## Supported vs dropped lines

Kept (after the other filters):

```text
anytls = host:443, password=..., over-tls=true, tag=Name
shadowsocks = host:8388, method=chacha20-ietf-poly1305, password=..., tag=Name
vmess = host:443, method=aes-128-gcm, password=..., tag=Name
vless = host:443, method=none, password=..., tag=Name
trojan = host:443, password=..., over-tls=true, tag=Name
http = host:8443, username=..., password=..., tag=Name
socks5 = host:1080, username=..., password=..., tag=Name
```

Dropped even when they look like nodes:

```text
ssr = ...
wireguard = ...
hysteria2 = ...
anytls = ..., tag=[Premium] Placeholder
shadowsocks = ..., tag=Traffic 12.3 GB
# Expire: 2026-12-31
```

Dedup is **string equality after trim**, not a semantic compare. These two are different lines and both survive:

```text
shadowsocks = host:8388, method=chacha20-ietf-poly1305, password=x, tag=A
shadowsocks = host:8388, method=chacha20-ietf-poly1305, password=x, tag=B
```

A later copy that matches the first line **exactly** is removed. Leading spaces on the later copy do not create a second node; they are trimmed first. See `examples/nexitally/duplicates/`.

## What the parser never touches

- `[general]`, `[dns]`, `[policy]`, `[filter_local]`, `[filter_remote]`, `[rewrite_*]`, `[task_local]`, `[mitm]`
- The resource URL, `$resource.link`, `$resource.info`, `$resource.tag`
- Node names, methods, passwords, or SNI on lines that pass the filters
- Your local profile after import. Refreshing **Server Resources → Nexitally** only replaces that resource's server list.

## Device setup

1. Put the parser URL in `[general]` (see `examples/nexitally/snippets/general-parser.conf`).
2. Add the **private** Nexitally full-configuration URL under `[server_remote]` with `opt-parser=true` (`examples/nexitally/snippets/server-remote.conf`).
3. Point policy groups at `resource-tag-regex=^Nexitally` rather than at names that only existed in the old full-profile `[server_local]` block (`examples/nexitally/snippets/policy-unchanged.conf`).
4. Import the stable profile once. Afterwards, refresh the Nexitally **server resource**, not Configuration File → Download.

## Compatibility

- Requires a Quantumult X build that implements resource parsers (`resource_parser_url` + `opt-parser`).
- AnyTLS lines need a Quantumult X version that understands `anytls =`.
- The parser itself is ES5-style (`var`, `function`) so it stays inside the QX JavaScript dialect.

Tested shape: Nexitally full configurations that embed AnyTLS and the usual HTTP-family proxies inside `[server_local]`. The fixtures in `examples/nexitally/` are the regression stand-in for that shape, using placeholder hosts only.

## Change checklist

If you edit `nexitally-node-parser.js`:

1. Update or add a fixture under `examples/nexitally/`.
2. Run `npm test`.
3. Mention the behavior change in the root README "Why" / this page.
4. Keep secrets out of the diff. See [privacy.md](privacy.md).
