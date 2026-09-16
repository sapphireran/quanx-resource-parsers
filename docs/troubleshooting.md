# Troubleshooting

Refresh errors come from Quantumult X (download / parser URL) or from this script (`$done({ error })`).

## Parser errors

### `[server_local] section was not found`

The downloaded body is not a Quantumult X full config, or the header is malformed.

Typical causes:

| Cause | What to check |
| --- | --- |
| Official server-only subscription | The body is already `anytls=…` lines with no section header. Disable `opt-parser` |
| Clash / Surge / YAML | Wrong URL. This parser does not convert those formats |
| HTML interstitial | Login page, WAF, or CDN challenge. Open the URL on the device (not in this repo) |
| Glued header | `[server_local]anytls=…` on one line. The spec requires a newline after `]` |
| Header without a following newline | `[server_local]` as the last characters of the file |

Replay a saved **synthetic** fixture with `node scripts/atlas.js run examples/atlas/cases/missing-server-local/input.conf`. Never save a live download into the repo.

### `no usable server entries were found`

The section matched, but every line was a comment, unsupported prefix, metadata banner, `[Premium]` placeholder, or duplicate.

Typical causes:

- The plan listing is only traffic / expiry HTTP stubs.
- Node tags include `Reset`, `Traffic`, `Expire`, or `[Premium]`.
- The only servers use `hysteria2=`, `tuic=`, `socks=`, or `https=`.

`node scripts/atlas.js trace <file>` prints a reason code per line.

## Quantumult X errors that are not this script

| Symptom | Likely cause |
| --- | --- |
| “No custom resource parser” | `resource_parser_url` missing or the app has not reloaded `[general]` |
| Parser downloaded but nodes unchanged | `opt-parser` is false, or another resource parser is configured |
| Empty resource after a successful HTTP 200 | The remote returned an empty body before the parser ran |
| Nodes refresh, policies do not | Expected. Bind groups with `resource-tag-regex` |
| AnyTLS lines appear but will not connect | Quantumult X build is older than AnyTLS support |

## Things that look like bugs and are not

- A second `[server_local]` later in the file is ignored. The first match wins.
- `[Premium]` as its **own section** ends the body. Nodes after that header are invisible.
- `DaysLeft` (no space) is kept. `Days Left` is dropped.
- Lone `\r` line breaks are not normalized. A body that uses only CR may fail to find the section.

## Privacy while debugging

Copy reason codes and synthetic fixtures, not live URLs. If a refresh must be inspected on the device, do it inside Quantumult X. Do not paste the private Nexitally URL into issues, commits, or chat.
