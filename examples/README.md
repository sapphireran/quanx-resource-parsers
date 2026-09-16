# Examples

Sanitized Quantumult X snippets used to document and locally exercise the personal parsers in this repository.

Every hostname ends in `example.invalid`. Passwords, Reality parameters, and tags are copied from the official Quantumult X `sample.conf` / `server-complete.snippet` style or are obviously fake. Do not paste a real Nexitally download, subscription URL, account id, or node password into this tree.

## Layout

| Path | Role |
| --- | --- |
| `nexitally/cases.json` | Manifest consumed by `scripts/test-nexitally-parser.js` |
| `nexitally/*.conf` | Inputs that stand in for `$resource.content` |
| `nexitally/*.expected.txt` | Exact server lines the parser must return |
| `nexitally/local-profile.conf` | How a personal profile wires the parser through `[server_remote]` |

`local-profile.conf` is a usage sketch, not a parser fixture. It is omitted from `cases.json` because it never contains a Nexitally `[server_local]` block.

## Nexitally fixtures

| Case | What it proves |
| --- | --- |
| `typical-full-config` | A managed full profile is reduced to AnyTLS server lines. Policy, filter, rewrite, and traffic banners stay out of the result. |
| `mixed-protocols` | `anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, and `socks5` are kept. Unknown schemes such as `hysteria2` are dropped. |
| `duplicates-and-placeholders` | Exact-line de-duplication after trim. `[Premium]`, Traffic / Expire / Reset / Days Left, and the Chinese 流量 / 到期 / 剩余 / 套餐 markers are excluded even when they appear in a `tag=`. |
| `comments-whitespace-and-crlf` | A UTF-8 BOM, `\r\n` newlines, padded `[server_local]`, and `;` / `#` / `//` comments do not break extraction. |
| `section-case-and-trailing-content` | `[SERVER_LOCAL]` matches. The section may run to end-of-file. |
| `missing-server-local` | Profiles that only have `[server_remote]` fail with a clear error. |
| `empty-server-local` | A present but comment-only section fails instead of returning an empty resource. |
| `traffic-only` | A section that contains only quota / expiry / `[Premium]` rows fails the same way. |

## Running a fixture

From the repository root, with Node.js:

```bash
node scripts/run-nexitally-parser.js examples/nexitally/typical-full-config.conf
node scripts/test-nexitally-parser.js
```

The runner injects `$resource` and `$done` so the Quantumult X script can execute unchanged on a desktop. It does not download any subscription.

## Adding a fixture

1. Add `examples/nexitally/<name>.conf` with fictional servers only.
2. If the case should succeed, add `<name>.expected.txt` with one server line per row and no trailing blank line after the last entry (the test trims the final newline).
3. If the case should fail, omit the expected file and record the exact `error` string in `cases.json`.
4. Append an object to the `cases` array in `cases.json`.
5. Run `node scripts/test-nexitally-parser.js`.
