# Nexitally example cases

Each folder under `cases/` is one parser input. The local runner treats the file
as `$resource.content` — the same body Quantumult X would pass after it
downloaded the managed full configuration.

## Case index

| Case | Expect | What it covers |
| --- | --- | --- |
| `typical-full-config` | servers | A complete fake profile: DNS, policy, filter, rewrite, plus a mixed `[server_local]` |
| `placeholders-and-traffic` | servers | Traffic / expiry / 套餐 / `[Premium]` rows dropped; real nodes kept |
| `comments-duplicates-crlf` | servers | `#` `;` `//` comments, duplicate lines, CRLF, leading BOM |
| `mixed-protocols` | servers | anytls, shadowsocks, vmess, vless, trojan, http, socks5 |
| `section-boundaries` | servers | `[server_local]` in the middle of the file; later sections must not leak |
| `missing-server-local` | error | Profile with no `[server_local]` at all |
| `empty-server-local` | error | Section present but only comments |
| `unsupported-only` | error | WireGuard / unknown lines that the parser does not emit |

## Quantumult X snippet

[`quanx-profile-snippet.conf`](quanx-profile-snippet.conf) is the *local* side:
how to attach the parser to `[server_remote]` without replacing the rest of a
stable profile. It uses a placeholder URL only.

## Regenerating expected output

After changing the parser, re-run verification. If a change is intentional:

```bash
node examples/scripts/run-example.js <case> --write-expected
node examples/scripts/verify-examples.js
```

Review the diff of `expected.txt` / `expected-error.txt` before committing.
