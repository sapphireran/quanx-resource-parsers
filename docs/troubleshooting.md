# Troubleshooting

These are the failure modes that show up when using the personal Nexitally parser with a stable Quantumult X profile. None of the fixes require pasting a subscription URL into this repository.

## Quantumult X says there is no custom parser

**Symptom:** enabling `opt-parser` warns that no custom resource parser is configured.

**Check:**

1. `[general]` contains `resource_parser_url` pointing at `nexitally-node-parser.js`.
2. The URL is reachable from the device. Raw GitHub and jsDelivr are both listed in [nexitally.md](nexitally.md).
3. The profile was saved, the app was fully quit, and then reopened. Quantumult X reads `[general]` at launch.

A stale jsDelivr cache can serve an older `main` commit. Pinning `@main` is usually enough; if a just-pushed parser change is missing, use the raw GitHub URL or pin a commit SHA in the jsDelivr path.

## Refresh reports `[server_local] section was not found`

The parser received a body that is not a Quantumult X configuration, or the section header is missing.

Typical causes:

| Cause | What to look at |
| --- | --- |
| Auth or expired link | The downloaded body is HTML, JSON, or a short error string instead of INI-like sections. |
| You pointed `[server_remote]` at a server-only subscription | A server-only list has no `[server_local]` header. Do not run this parser on that URL; set `opt-parser=false` or remove `resource_parser_url` for that resource. |
| The provider renamed the section | Open one download on the device (share sheet / copy) and search for `[server_local]`. If the header is gone, this parser cannot extract nodes. |
| Local snippet without a trailing newline after the header | The matcher requires `[server_local]` followed by a newline, then the entries. |

Recovery:

1. Temporarily download the managed file once and confirm it still contains `[server_local]`.
2. Keep that file off git, off iCloud public folders, and off Gists.
3. If the body is an error page, renew the Nexitally Quantumult X URL in the provider dashboard and update only the local `[server_remote]` line.

The synthetic counterpart is `examples/nexitally/missing-section.conf`.

## Refresh reports `no usable server entries were found`

The section was found, but every line was dropped.

The parser drops:

- blank lines;
- `;` / `#` / `//` comments;
- lines that do not start with `anytls=`, `shadowsocks=`, `vmess=`, `vless=`, `trojan=`, `http=`, or `socks5=`;
- lines containing `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`, or `[Premium]`;
- exact duplicate lines after trim.

If the managed file only contains info-style placeholders, the parser is working as designed. The synthetic counterpart is `examples/nexitally/info-only.conf`.

If real nodes are also being dropped, a node **tag** may include one of those tokens (for example `tag=HK Traffic 01`). Rename that case in a personal fork of the parser; do not weaken the filter in `main` just to keep a single oddly named node if it also lets placeholders through.

## Nodes appear, but they include Traffic / Expire / `[Premium]` rows

`opt-parser` is off, or a different global parser is installed.

1. Confirm the `[server_remote]` line has `opt-parser=true`.
2. Confirm `resource_parser_url` is this repository's `nexitally-node-parser.js`, not a generic converter that preserves info nodes.
3. Refresh the Nexitally resource again.

## The whole profile was replaced

That is not a parser failure. **Configuration File → Download** (or importing a `.conf` / QR of the managed profile) overwrites the active Quantumult X configuration.

Restore the previous profile from Quantumult X iCloud / backup if you have one. After that, only refresh **Server Resources → Nexitally**.

## AnyTLS lines are missing on the device but present in the fixture run

The Node harness will still emit `anytls=` lines. Quantumult X versions before 1.5.6 do not understand that scheme and will ignore or reject them.

Upgrade Quantumult X, or accept that only `shadowsocks` / `vmess` / `vless` / `trojan` / `http` / `socks5` nodes from the same resource will show up.

Reality fields (`reality-base64-pubkey`, `reality-hex-shortid`) are passed through unchanged. If a node fails to connect, that is a server or client TLS issue, not an extract issue.

## Policy groups are empty after a successful refresh

The resource stored nodes, but no group selects them.

- Give the resource a stable `tag=` (`Nexitally`).
- Use `resource-tag-regex=^Nexitally` on the policy group, or list the group as `as-policy=` on the resource line.
- Do not depend on copying every new node name into `[policy]` by hand.

See `examples/nexitally/personal-profile-snippet.conf`.

## Local harness disagrees with Quantumult X

`scripts/run-parser.js` only mocks `$resource` and `$done`. It does not:

- download the private URL;
- apply Quantumult X's own server-line validation;
- honor `#emoji=` / `#in=` hash parameters;
- emulate TLS or connectivity.

If the harness matches `examples/nexitally/expected-servers.txt` and the device still disagrees, the device downloaded a different body. Compare section headers and line prefixes, not live hostnames, in a private local copy.

## How to capture a body for debugging without leaking it

1. Reproduce the refresh once.
2. Save the downloaded configuration to the device's Quantumult X data folder or a local file that is **not** in this clone.
3. Redact every hostname, password, UUID, and URL.
4. If you still need a fixture, add a new synthetic file under `examples/` that preserves only the structure (section order, comment style, info-line wording).

Never attach an unredacted managed configuration to a GitHub issue or commit.
