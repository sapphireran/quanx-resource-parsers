# Example catalog

Every redacted fixture in this repository and what the Nexitally parser
should do with it. Run the lot with:

```bash
node scripts/check-examples.js
```

Manifest: [`../examples/nexitally/fixtures.json`](../examples/nexitally/fixtures.json)

Hosts are `*.example.test`. Passwords are `example-password-not-real`.
There is no live Nexitally URL in git.

## Server extraction fixtures

### `managed-full-config`

- Input: [`../examples/nexitally/managed-full-config.conf`](../examples/nexitally/managed-full-config.conf)
- Expected: [`../examples/nexitally/expected-servers.txt`](../examples/nexitally/expected-servers.txt)

A full-looking Quantumult X profile: `[general]`, `[dns]`, `[policy]`,
`[server_remote]`, `[server_local]`, filters, rewrites, MITM.

Must keep `HK-01`, `JP-01`, `SG-01`, `US-01`. Must drop the duplicate
`HK-01`, commented leftovers, traffic/expiry/`[Premium]` rows, and every
section other than `[server_local]`.

### `mixed-protocols`

- Input: [`../examples/nexitally/fixtures/mixed-protocols.conf`](../examples/nexitally/fixtures/mixed-protocols.conf)
- Expected: [`../examples/nexitally/expected/mixed-protocols.txt`](../examples/nexitally/expected/mixed-protocols.txt)

One line each of `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`,
`http`, `socks5`. A `wireguard=` line is ignored, not an error.

### `duplicates-and-premium`

- Input: [`../examples/nexitally/fixtures/duplicates-and-premium.conf`](../examples/nexitally/fixtures/duplicates-and-premium.conf)
- Expected: [`../examples/nexitally/expected/duplicates-and-premium.txt`](../examples/nexitally/expected/duplicates-and-premium.txt)

Three copies of `HK-01` become one. `HK-01-ALT` is a different line (same
host, different tag) and is kept. Every metadata keyword in the `excluded`
regex has a dedicated drop row.

### `crlf-and-bom`

- Input: [`../examples/nexitally/fixtures/crlf-and-bom.conf`](../examples/nexitally/fixtures/crlf-and-bom.conf)
- Expected: same as `managed-full-config`

UTF-8 BOM + CRLF copy of the happy-path file. `.gitattributes` pins
`eol=crlf` so the fixture does not silently become LF.

### `header-case-and-spacing`

- Input: [`../examples/nexitally/fixtures/header-case-and-spacing.conf`](../examples/nexitally/fixtures/header-case-and-spacing.conf)
- Expected: [`../examples/nexitally/expected/header-case-and-spacing.txt`](../examples/nexitally/expected/header-case-and-spacing.txt)

`[SERVER_LOCAL]` and `anytls =` / `shadowsocks  =` still parse. Output keeps
the inner spacing around `=` after trim.

### `section-at-eof`

- Input: [`../examples/nexitally/fixtures/section-at-eof.conf`](../examples/nexitally/fixtures/section-at-eof.conf)
- Expected: [`../examples/nexitally/expected/section-at-eof.txt`](../examples/nexitally/expected/section-at-eof.txt)

`[server_local]` is the last section. The capture must run to EOF, not
require a following header.

### `policy-must-not-leak`

- Input: [`../examples/nexitally/fixtures/policy-must-not-leak.conf`](../examples/nexitally/fixtures/policy-must-not-leak.conf)
- Expected: [`../examples/nexitally/expected/policy-must-not-leak.txt`](../examples/nexitally/expected/policy-must-not-leak.txt)

The following `[policy]` block contains `http=` and `socks5=` lines that
would look like servers if the extractor were greedy. Only `HK-01` may
appear in the output.

## Error fixtures

### `missing-section`

- Input: [`../examples/nexitally/fixtures/missing-section.conf`](../examples/nexitally/fixtures/missing-section.conf)
- Error: `Nexitally parser: [server_local] section was not found.`

### `empty-servers`

- Input: [`../examples/nexitally/fixtures/empty-servers.conf`](../examples/nexitally/fixtures/empty-servers.conf)
- Error: `Nexitally parser: no usable server entries were found.`

### `already-a-server-list`

- Input: [`../examples/nexitally/fixtures/already-a-server-list.txt`](../examples/nexitally/fixtures/already-a-server-list.txt)
- Error: `Nexitally parser: [server_local] section was not found.`

A bare node list is what an official server-only subscription looks like. This
parser should refuse it rather than pass it through.

## Quantumult X `$done` runtime

`scripts/check-examples.js` additionally loads the parser inside a sandbox
that only defines `$resource` and `$done` (no Node `module`). That guards the
on-device entry path. The sandbox uses a fake
`https://example.test/private-nexitally-url` link to prove the script does not
need to read `$resource.link`.

## Parser template contrast

[`../examples/parser-template/resource-parser-template.js`](../examples/parser-template/resource-parser-template.js)
extracts `[server_local]` **without** Nexitally metadata filters. On
`managed-full-config.conf` it keeps the `Traffic` / `[Premium]` rows that the
production parser drops. That difference is checked as
`template:managed-full-config-keeps-metadata`.

On `mixed-protocols` the two parsers must agree, because that fixture has no
metadata rows.

Walkthrough of the production extraction:
[`../examples/nexitally/before-after.md`](../examples/nexitally/before-after.md).

## Local profile snippets (not parser inputs)

These are not in `fixtures.json`. They are copy-paste shapes for a personal
device profile:

| File | Use |
| --- | --- |
| [`../examples/nexitally/local-profile-snippet.conf`](../examples/nexitally/local-profile-snippet.conf) | Minimum `[server_remote]` + policy |
| [`../examples/quantumult-x/resource-parser-wiring.conf`](../examples/quantumult-x/resource-parser-wiring.conf) | Global parser URL vs per-resource `opt-parser` |
| [`../examples/quantumult-x/policy-with-nexitally-resource.conf`](../examples/quantumult-x/policy-with-nexitally-resource.conf) | `resource-tag-regex` / `server-tag-regex` |
| [`../examples/quantumult-x/keep-local-filters.conf`](../examples/quantumult-x/keep-local-filters.conf) | Filters that must survive a node refresh |

Replace `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` only on the device.
