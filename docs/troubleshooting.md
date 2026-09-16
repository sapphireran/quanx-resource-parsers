# Troubleshooting

Replay the matching fixture before changing the parser. `node bench/run.js --dump examples/cases/<id>.conf` shows `$done` plus reason codes.

## Device symptom → fixture

| what you see | likely cause | replay |
| --- | --- | --- |
| “No custom resource parser” | `resource_parser_url` missing, stale, or not reloaded | Confirm [device-wiring.md](device-wiring.md); quit the app fully |
| Resource error: section was not found | Body is HTML, Clash, share links, or a profile without `[server_local]` | `html-interstitial`, `clash-yaml`, `base64-vmess`, `missing-server-local` |
| Resource error: no usable servers | Section exists but every line is a comment, banner, or unsupported prefix | `comments-only`, `placeholders-en-zh`, `unsupported-only` |
| Nodes include Traffic / 流量 / Expire | `opt-parser` is false, or a different parser is installed | `placeholders-en-zh` |
| A real-looking node named `HK-Reset-01` or `HK-Preset-01` is missing | `Reset` is a substring | `reset-substring-trap` |
| `DaysLeft-01` exists but `Days Left: 9` does not | Space in the token | `days-left-spacing` |
| `[Premium]` placeholder still listed | Parser not running | `premium-as-tag` |
| Nodes after a `[Premium]` heading are missing | That heading ended `[server_local]` | `premium-as-section` |
| Only the first vendor group appears | Two `[server_local]` blocks; first wins | `first-of-two-sections` |
| Policy group is empty | `tag=` / `resource-tag-regex` mismatch | [examples/profile/local-policy.conf](../examples/profile/local-policy.conf) |
| Parser URL still mentions an old personal username | Profile not updated | [device-wiring.md](device-wiring.md) |
| CRLF export “looks empty” on a laptop but works on the phone | BOM/CRLF; desktop tools must normalize | `managed-full-profile-crlf-bom` |

## Confirm the resource is a full config

A healthy vendor body contains a `[server_local]` heading followed by a newline, then `anytls=` / `shadowsocks=` lines. If you instead see `proxies:`, `<!DOCTYPE html>`, or `vmess://`, Quantumult X is downloading the wrong URL kind.

## Confirm the parser is this script

The global `resource_parser_url` must end with `sapphireran/quanx-resource-parsers` and `nexitally-node-parser.js`. A third-party “universal” parser will not implement these keep/drop rules.

## Local checks that do not need the app

```bash
npm test
node bench/run.js --dump examples/cases/managed-full-profile.conf
node bench/run.js --why "anytls=example.com:443, password=pwd, tag=HK-Reset-01"
```

`--why` wraps the line in a synthetic `[server_local]` section so you can see `excluded` / `unsupported` without building a whole file.
