# Nexitally examples

These files imitate a Nexitally **managed full Quantumult X configuration**
closely enough to exercise `nexitally-node-parser.js`. They are not a
provider dump and will not connect to any paid node.

## Typical success path

| File | Role |
| --- | --- |
| [input-full-config.conf](input-full-config.conf) | Fictional full profile: `[general]`, `[server_local]`, `[policy]`, filters. |
| [expected-servers.snippet](expected-servers.snippet) | Server lines the parser must return, in file order. |
| [usage.quantumult.conf](usage.quantumult.conf) | How to attach the private URL as `[server_remote]` on a device. |

`input-full-config.conf` includes the keep/drop mix documented in
[docs/nexitally-parser.md](../../docs/nexitally-parser.md):

- usable `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and
  `socks5` lines;
- an exact duplicate of the first AnyTLS line;
- `[Premium]`, `Traffic`, `Expire`, `Days Left`, and Chinese quota labels;
- later sections that must not leak into the snippet.

## Edge cases

| File | Expected result |
| --- | --- |
| [edge-cases/missing-server-local.conf](edge-cases/missing-server-local.conf) | Error: section not found. |
| [edge-cases/empty-server-local.conf](edge-cases/empty-server-local.conf) | Error: no usable servers. |
| [edge-cases/placeholders-only.conf](edge-cases/placeholders-only.conf) | Error: no usable servers. |
| [edge-cases/unsupported-schemes.conf](edge-cases/unsupported-schemes.conf) | Error: no usable servers. |
| [edge-cases/comments-and-duplicates.conf](edge-cases/comments-and-duplicates.conf) | One unique shadowsocks line. |
| [edge-cases/section-leak-guard.conf](edge-cases/section-leak-guard.conf) | Only the `[server_local]` node; ignore `[server_remote]` / `[policy]`. |
| [edge-cases/heading-case.conf](edge-cases/heading-case.conf) | `[SERVER_LOCAL]` is accepted. |
| [edge-cases/crlf-and-bom.source.conf](edge-cases/crlf-and-bom.source.conf) | Same keep/drop after the runner applies a UTF-8 BOM and CRLF. |

## What success looks like in Quantumult X

After a refresh of the **Nexitally** server resource:

- the resource contains only `scheme=host:port, ...` lines;
- policy groups that match the `Nexitally` resource tag see those nodes;
- `[policy]`, `[filter_remote]`, and DNS in the **local** profile are
  unchanged.

If the resource still looks like a full configuration, `opt-parser` is not
on. See [docs/troubleshooting.md](../../docs/troubleshooting.md).
