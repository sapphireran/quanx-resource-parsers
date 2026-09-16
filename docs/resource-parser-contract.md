# Quantumult X resource parser contract

This repository implements a **narrow server-resource parser**, not a general subscription converter.

Quantumult X downloads a remote resource, then optionally runs one JavaScript file declared in `[general]`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

A profile can declare only one `resource_parser_url`. Individual remote lines opt in with `opt-parser=true`.

## Runtime objects

The official sample parser documents these inputs and outputs. HTTP request helpers and persistent storage are **not** available in this environment.

| Name | Role |
| --- | --- |
| `$resource.link` | Original URL or local path of the resource |
| `$resource.content` | UTF-8 body Quantumult X just downloaded |
| `$resource.info` | `subscription-userinfo` response header, when present (v1.0.10+) |
| `$resource.tag` | `tag=` value of the remote resource (v1.0.10+) |
| `$resource.user_agent` | User-Agent for the current download; empty on the first attempt (v1.5.6+) |
| `$done({content})` | Replace the resource body with Quantumult X text |
| `$done({error})` | Fail the refresh and show the message |
| `$done({retry: {user_agent}})` | Ask native to re-download once with another UA (v1.5.6+) |

`$notify` exists in some parser builds. This repository does not rely on it.

## What a server parser must return

For `[server_remote]`, `content` must be Quantumult X **server lines**, one per line. It must not be a full profile. Sections such as `[policy]`, `[filter_local]`, and `[mitm]` belong in the local profile, not in the parser output.

Valid prefixes are the ones Quantumult X already understands in `[server_local]` / `[server_remote]`. This parser keeps:

```text
anytls
shadowsocks
vmess
vless
trojan
http
socks5
```

It does not emit Clash YAML, Surge lists, base64 URI blobs, or Hysteria2 / TUIC / WireGuard lines.

## What this parser deliberately ignores

The Nexitally script does **not** implement the parameter language used by community converters (`#emoji=1`, `#in=香港`, `#rename=...`). Those parameters are consumed by a different parser. Pointing `resource_parser_url` at this file and then appending `#in=...` to the Nexitally URL will not filter nodes.

This parser also does not:

- fetch anything itself (Quantumult X already fetched `$resource.content`);
- rewrite tags, icons, or `udp-relay`;
- preserve traffic / expiry dashboard rows;
- keep `[Premium]` placeholders;
- touch filter or rewrite resources.

## Local replay

`scripts/lib/qx-parser-vm.js` loads the parser into a Node `vm` sandbox with `$resource` and `$done`. That is how `examples/` stay honest. See [local-harness.md](local-harness.md).

## Official references

- [Quantumult X `resource-parser.js`](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js)
- [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf)
