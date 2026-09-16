# Examples

Sanitized Quantumult X inputs for `nexitally-node-parser.js`. Every host, password, and account field is a placeholder. These files are for reading and local verification. They are not a subscription.

## What each folder is for

| Path | Purpose |
| --- | --- |
| `fixtures/` | Fake full configurations and focused edge cases |
| `expected/` | Server lines the parser should keep |
| `expected-errors/` | Exact `$done({ error })` messages |
| `snippets/` | Copy-paste fragments for a **local** Quantumult X profile |
| `cases.json` | Manifest used by `npm run verify` |
| `walkthroughs/` | Step-by-step personal setup notes |

## Run a fixture locally

Quantumult X injects `$resource` and `$done`. The local runner recreates that contract in Node so you can inspect output without pasting a private URL into a public tool.

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.sample.conf
node scripts/run-parser.js --json examples/fixtures/nexitally-missing-server-local.sample.conf
npm run verify
```

`npm run verify` compares every case in `cases.json` to the expected files.

## Fixture catalog

### `nexitally-full-config.sample.conf`

A compact Nexitally-style **full** Quantumult X configuration:

- `[general]`, `[dns]`, `[policy]`, `[server_remote]`, `[server_local]`, `[filter_local]`
- traffic / expiry / remaining-data metadata lines
- a `[Premium]` placeholder
- four usable AnyTLS nodes, including one Reality node
- an exact duplicate of `HK-01`

Expected keepers: `HK-01`, `HK-02`, `JP-01`, `SG-01`. Everything else is dropped.

### `nexitally-full-config.crlf-bom.sample.conf`

The same full config saved with a UTF-8 BOM and Windows `CRLF` line endings. Quantumult X resources sometimes arrive this way. The parser normalizes both before it searches for `[server_local]`.

### `nexitally-duplicates-and-meta.sample.conf`

Comments (`;`, `#`, `//`), blank lines, metadata keywords in English and Chinese, leading/trailing whitespace, and an exact duplicate. Only `USABLE-A` and `USABLE-B` remain.

### `nexitally-mixed-protocols.sample.conf`

One line for each protocol the parser currently accepts, plus schemes it must ignore (`hysteria2`, `wireguard`, `unknown=`). Also checks that `shadowsocks =` with spaces around `=` is still accepted.

### `nexitally-section-boundaries.sample.conf`

A valid node under `[server_local]`, then look-alike node lines under `[policy]` and `[filter_local]`. Those later lines must not appear in the resource.

### `nexitally-case-and-header-variants.sample.conf`

`[Server_Local]` plus `AnyTLS=`, `ShadowSocks=`, and `TROJAN=`. The section and protocol checks are case-insensitive. The section is also the last section in the file.

### Error fixtures

| File | Expected error |
| --- | --- |
| `nexitally-missing-server-local.sample.conf` | `[server_local]` was not found |
| `nexitally-empty-servers.sample.conf` | section exists, but only metadata / unsupported lines remain |
| `nexitally-comments-only.sample.conf` | commented servers are not uncommented |

## Snippets

Use these in a **local** Quantumult X profile. Do not commit a filled-in private URL.

1. `snippets/general-parser.snippet.conf` — set `resource_parser_url`
2. `snippets/server-remote.snippet.conf` — add the private Nexitally URL with `opt-parser=true`
3. `snippets/policy-with-resource-tag.snippet.conf` — optional policy groups keyed by `tag=Nexitally`
4. `snippets/local-profile-skeleton.snippet.conf` — a minimal stable profile that refreshes only nodes

## Add a case

1. Put a sanitized input in `fixtures/`.
2. Run `node scripts/run-parser.js examples/fixtures/<name>.sample.conf` and save the output under `expected/` or `expected-errors/`.
3. Append an entry to `cases.json`.
4. Run `npm run verify`.
5. Describe the case in this file and in `docs/nexitally-node-parser.md` if the behavior is part of the public contract.

Never add a live subscription body, account id, or real node password.
