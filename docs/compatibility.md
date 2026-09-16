# Compatibility

## Quantumult X versions

| Feature | First version called out by official docs | Needed here? |
| --- | --- | --- |
| Resource parsers (`$resource` / `$done`) | v1.0.8-build253 | Yes |
| `$resource.info`, `$resource.tag` | v1.0.10-build277 | No (unused) |
| `opt-parser` on a remote resource | Present in current `sample.conf` | Yes |
| User-Agent retry (`$resource.user_agent`) | v1.5.6-build921 | No (unused) |
| Parameterized parser UI (`$parser`) | v1.5.6-build918 | No (unused) |
| AnyTLS server lines | Quantumult X 1.5.6 (build 925, community reports) | Yes if the subscription is AnyTLS |

Minimum practical setup for current Nexitally AnyTLS nodes: a Quantumult X build that supports both resource parsers and AnyTLS. Older builds can still run the parser and will keep `shadowsocks=` / `vmess=` / `trojan=` lines, but they will not connect to `anytls=` servers.

## Parser script

- Language: conservative JavaScript, no Node APIs.
- Encoding: UTF-8. A leading BOM is stripped.
- Newlines: CRLF is folded to LF before matching.
- Section names: INI-style `[server_local]`, case-insensitive.

## Protocol prefixes the parser forwards

These are the official Quantumult X keys from `sample.conf`:

- `anytls`
- `shadowsocks`
- `vmess`
- `vless`
- `trojan`
- `http`
- `socks5`

The parser does not implement those protocols. It only decides which lines Quantumult X will receive.

## CDN versus GitHub raw

| URL | Use |
| --- | --- |
| `https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js` | Debugging, immediate `main` |
| `https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js` | Everyday `resource_parser_url` |

Pin a commit on jsDelivr (`@<sha>`) if you want a frozen parser. `@main` moves.

## Platforms

Quantumult X is an iOS / Apple platform app. The files in `examples/` run on any machine with Node.js 18+ so the transform can be reviewed on a laptop. They are not a Quantumult X substitute.
