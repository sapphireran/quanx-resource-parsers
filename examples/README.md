# Examples

Synthetic Quantumult X snippets used to document and verify the personal parsers. Hosts are `*.example.test` or the official `example.com` samples. Passwords and UUIDs are placeholders from [Quantumult X sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf) or the obvious `example-password` stand-in.

These files are **not** a live subscription. Running the harness does not touch a network.

## Layout

```text
examples/
  README.md                          ← this file
  nexitally/
    full-config.conf                 happy path: managed full profile
    expected-servers.txt             exact $done({content}) for full-config
    personal-profile-snippet.conf    local [general]/[server_remote]/[policy]
    missing-section.conf             no [server_local]
    info-only.conf                   section exists, every line is a placeholder
    section-at-eof.conf              [server_local] is the last section
    comments-and-duplicates.conf     comment prefixes + exact-line dedupe
    unsupported-scheme.conf          wireguard / hysteria lines dropped
    crlf-bom.conf                    generated at verify time from full-config
  generic/
    server-remote-template.conf      empty personal remote + policy skeleton
```

`crlf-bom.conf` is not checked in. `scripts/verify-examples.js` builds a CRLF + UTF-8 BOM copy of `full-config.conf` in memory so the parser's newline and BOM normalization stays covered without storing a second binary-ish file.

## Run the fixtures

```bash
node scripts/verify-examples.js
node scripts/run-parser.js nexitally-node-parser.js examples/nexitally/full-config.conf
```

`verify-examples.js` compares parser output with `expected-servers.txt` and checks the error strings for the failure fixtures.

## What each Nexitally fixture proves

| File | Parser result | Why it exists |
| --- | --- | --- |
| `full-config.conf` | 8 server lines | Mixed AnyTLS / SS / VMess / VLESS / Trojan / HTTP / SOCKS5, plus info rows, a duplicate, comments, and the surrounding managed sections. |
| `missing-section.conf` | error | Download was not a Quantumult X config, or `[server_local]` is absent. |
| `info-only.conf` | error | Section is present but every line matches the traffic / expiry / `[Premium]` filter. |
| `section-at-eof.conf` | 2 server lines | The section matcher must work when no later `[section]` header exists. |
| `comments-and-duplicates.conf` | 1 server line | `;`, `#`, `//`, blanks, and an exact duplicate are dropped. |
| `unsupported-scheme.conf` | 1 server line | `wireguard=` / `hysteria=` do not leak into `[server_remote]`. |

## Adding a fixture

1. Keep structure, invent hosts.
2. Put the expected `$done({content})` body in a sibling `expected-*.txt` when the case succeeds.
3. Register the case in `scripts/verify-examples.js`.
4. Follow [docs/privacy.md](../docs/privacy.md).
