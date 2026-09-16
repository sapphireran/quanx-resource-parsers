# Examples

Personal, anonymized fixtures for the parsers in this repository. They are written so you can read a Quantumult X resource as Quantumult X would download it, then see exactly what a parser should return.

Nothing in this directory is a live subscription. Hosts use `.example.invalid`. Passwords, usernames, and public keys are placeholders copied from the official Quantumult X sample style (`pwd`, `example-password`, documented Reality demo values). Do not paste a real Nexitally URL, account id, or node password into any file here.

## Layout

```text
examples/
  README.md                          this file
  nexitally/                         input/output pairs for nexitally-node-parser.js
  quantumult-x/                      local-profile snippets you copy into Quantumult X
```

Each Nexitally fixture is a pair:

| File | Meaning |
| --- | --- |
| `*.conf` | Fake `$resource.content` (a full Quantumult X configuration, or a fragment of one) |
| `*.expected.txt` | Successful parser output: server lines only, one per line, no trailing section headers |
| `*.error.txt` | Expected `$done({ error })` message when the parser should refuse the input |

The repository test harness treats these pairs as the source of truth. If you change a fixture, update its expected file in the same commit and run `npm test`.

## How a fixture maps to Quantumult X

Quantumult X downloads **your** private full-configuration URL, then runs the resource parser locally:

```text
private Nexitally URL
        │
        ▼
  $resource.content     = the downloaded bytes (UTF-8)
  $resource.link        = the URL (the Nexitally parser never reads this)
  $resource.tag         = the [server_remote] tag, e.g. Nexitally
        │
        ▼
  nexitally-node-parser.js
        │
        ├── $done({ content })  → [server_remote] server list
        └── $done({ error })    → Quantumult X shows the error on that resource
```

The `*.conf` files are stand-ins for `$resource.content`. They include surrounding sections (`[general]`, `[policy]`, `[filter_remote]`, …) because that is what Nexitally's **Configuration File → Download** product actually returns. The parser must ignore those sections and keep only usable `[server_local]` lines.

## Nexitally fixtures

| Fixture | What it exercises |
| --- | --- |
| `typical-full-config` | A complete fake managed profile: AnyTLS nodes, a `[Premium]` placeholder, a duplicate, traffic comments, and leftover policy/filter sections |
| `mixed-protocols` | Every protocol prefix the parser accepts (`anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`) |
| `traffic-and-premium` | Non-comment lines that mention traffic, expiry, reset, days left, 流量 / 到期 / 剩余 / 套餐, or `[Premium]` |
| `duplicates-and-comments` | `;` / `#` / `//` comments, blank lines, indentation, and exact-line deduplication |
| `section-boundary` | A server-looking line **after** `[filter_local]` must not leak into the result |
| `case-insensitive-header` | `[SERVER_LOCAL]` is accepted |
| `leading-whitespace-header` | A padded `[server_local]` header is accepted |
| `unsupported-protocol` | Unknown prefixes such as `hysteria2=` are dropped |
| `premium-as-section-header` | A standalone `[Premium]` line looks like a new INI section, so later servers are **not** captured |
| `crlf-and-bom` | UTF-8 BOM + Windows `CRLF` line endings |
| `missing-server-local` | No `[server_local]` section → error |
| `empty-usable-servers` | Section exists but every line is a comment or an excluded info node → error |
| `header-only-no-newline` | `[server_local]` with no newline after the header → treated as missing |

Read [`docs/nexitally-node-parser.md`](../docs/nexitally-node-parser.md) for the matching rules behind these cases.

## Quantumult X snippets

Files under `quantumult-x/` are fragments you paste into **your local** profile. They never contain a Nexitally URL.

1. [`general-resource-parser.snippet.conf`](quantumult-x/general-resource-parser.snippet.conf) — point `[general]` at this repository's parser.
2. [`server-remote.snippet.conf`](quantumult-x/server-remote.snippet.conf) — add a `[server_remote]` line with `opt-parser=true`.
3. [`keep-local-policy.snippet.conf`](quantumult-x/keep-local-policy.snippet.conf) — keep `[policy]` / `[filter_remote]` local so refreshing nodes does not wipe the rest of the profile.
4. [`local-profile.snippet.conf`](quantumult-x/local-profile.snippet.conf) — a minimal composed profile that shows the three pieces together.

Replace the `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` token on your device only.

## Preview a fixture without Quantumult X

From the repository root (Node.js 18+):

```bash
npm test
node tests/run.js --dump examples/nexitally/typical-full-config.conf
```

`--dump` prints the parser result for one file so you can compare it with the matching `*.expected.txt` while editing.

## Adding a fixture

1. Invent hosts under `.example.invalid` and obviously fake secrets.
2. Save the input as `examples/nexitally/<name>.conf`.
3. Save the expected `$done` payload as `<name>.expected.txt` or `<name>.error.txt`.
4. Mention the new row in the table above.
5. Run `npm test`.

Never commit a real subscription URL, a captured `$resource.link`, or a production node line. See [`docs/privacy.md`](../docs/privacy.md).
