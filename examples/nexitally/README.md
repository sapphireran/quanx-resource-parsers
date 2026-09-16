# Nexitally examples

These files imitate Nexitally's **full Quantumult X configuration** download.
They are not copied from a live account.

The parser under test is [`../../nexitally-node-parser.js`](../../nexitally-node-parser.js).

## Happy path

| File | Role |
| --- | --- |
| [managed-full-config.conf](managed-full-config.conf) | Redacted managed profile with `[server_local]` plus extra sections |
| [expected-servers.txt](expected-servers.txt) | Server lines the parser must return for that file |
| [local-profile-snippet.conf](local-profile-snippet.conf) | How a *local* profile should reference the private URL |

## Fixtures

Inputs live in [`fixtures/`](fixtures/). Expected bodies and errors are listed
in [fixtures.json](fixtures.json).

| Name | What it proves |
| --- | --- |
| `managed-full-config` | Extra sections, comments, and metadata rows are stripped |
| `mixed-protocols` | All supported type prefixes survive |
| `duplicates-and-premium` | Exact-line dedup and `[Premium]` / traffic drops |
| `crlf-and-bom` | UTF-8 BOM and CRLF do not change the server list |
| `header-case-and-spacing` | `[SERVER_LOCAL]` and `anytls =` still parse |
| `section-at-eof` | Capture still works when no section follows |
| `missing-section` | Error when `[server_local]` is absent |
| `empty-servers` | Section exists but nothing is connectable |
| `already-a-server-list` | A bare node list (no section header) is rejected |
| `policy-must-not-leak` | `[policy]` after `[server_local]` never appears in output |

## Private URL placeholder

`local-profile-snippet.conf` uses:

```ini
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>
```

Replace that on the device only. Do not replace it in git.
