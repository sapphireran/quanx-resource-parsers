# Example catalog

Source of truth: [`examples/cases.json`](../examples/cases.json).

Hosts and secrets in these files are placeholders. See [privacy.md](privacy.md).

## Content cases

| Id | Fixture | Assertion |
| --- | --- | --- |
| `full-config` | `nexitally-full-config.conf` | Keep HK/JP/SG AnyTLS, SS, and VMess. Drop quota comments, the `[Premium]` US line, the duplicated HK line, and every section after `[server_local]`. |
| `mixed-protocols` | `nexitally-mixed-protocols.conf` | Forward all seven supported prefixes, including AnyTLS Reality. |
| `duplicates-and-meta` | `nexitally-duplicates-and-meta.conf` | Keep `KEEP-01` once (including a padded duplicate), plus `KEEP-02` and `KEEP-03`. Drop Premium, Traffic, Expire, `hysteria2`, `wireguard`, and `ss =`. |
| `section-order` | `nexitally-section-order.conf` | `[server_local]` may sit after `[filter_remote]`. Later `host, ...` filter lines must not appear in the output. |
| `indented-header` | `nexitally-indented-header.conf` | Leading spaces before `[server_local]` are accepted. |
| `uppercase-header` | `nexitally-uppercase-header.conf` | `[SERVER_LOCAL]`, `ANYTLS =`, and `Shadowsocks =` are accepted. Output preserves the original spelling. |
| `crlf-and-bom` | `nexitally-crlf-and-bom.conf` | UTF-8 BOM + CRLF still yields two AnyTLS lines separated by `\n`. |

## Error cases

| Id | Fixture | `$done({error})` |
| --- | --- | --- |
| `exclusion-in-tag` | `nexitally-exclusion-in-tag.conf` | `no usable server entries were found.` |
| `empty-section` | `nexitally-empty-section.conf` | `no usable server entries were found.` |
| `missing-section` | `nexitally-missing-section.conf` | `[server_local] section was not found.` |
| `comments-only` | `nexitally-comments-only.conf` | `no usable server entries were found.` |
| `header-no-newline` | `nexitally-header-no-newline.conf` | `[server_local] section was not found.` |
| `unsupported-only` | `nexitally-unsupported-only.conf` | `no usable server entries were found.` |
| `blank-content` | `nexitally-blank-content.conf` | `[server_local] section was not found.` |

Exact error strings live in `examples/expected/*.error`.

## Profile snippets

These are not parser fixtures. They show how a stable local profile should *reference* the parser.

| File | Role |
| --- | --- |
| [`examples/profiles/server-remote-snippet.conf`](../examples/profiles/server-remote-snippet.conf) | Minimum `[general]` + `[server_remote]` |
| [`examples/profiles/stable-profile-skeleton.conf`](../examples/profiles/stable-profile-skeleton.conf) | Longer profile that keeps policy / filter / rewrite locally |

## Walkthrough

[`examples/walkthrough.md`](../examples/walkthrough.md) runs `full-config` end to end with the local harness.
