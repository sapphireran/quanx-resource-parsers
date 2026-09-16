# Troubleshooting

Personal checklist for the Nexitally parser. Start with the message Quantumult X shows on the server resource, then confirm the same result with `node scripts/run-parser.js` on a sanitized copy of the body.

## Resource error: `[server_local]` section was not found

The parser never saw a `[server_local]` header.

Usual causes:

1. `opt-parser` is off, and you are looking at a different failure mode. Turn it on and refresh again.
2. The URL is not a Quantumult X configuration. Some dashboards have Clash, Surge, and Quantumult X buttons. The parser only accepts the Quantumult X full-configuration body.
3. The body is HTML (login page, WAF challenge, expired link).
4. The section is named something else (`[servers]`, `[Proxy]`, Clash `proxies:`).

What to do:

- Save the downloaded body locally.
- Confirm it contains a line that matches `[server_local]` after BOM / CRLF normalization.
- If it does not, this parser cannot help. Use the official server-only subscription if one exists, or convert with a different tool offline.

## Resource error: no usable server entries were found

`[server_local]` exists, but every row was a comment, an unsupported scheme, a duplicate of a dropped row, or metadata.

Usual causes:

1. The upstream only shipped quota banners (`Traffic`, `Expire`, `剩余`, `套餐`).
2. Every node is tagged `[Premium]` and you are on a plan that does not unlock them.
3. Nodes use a scheme the parser does not list (`hysteria2=`, URI schemes, Clash maps).
4. The usable nodes were commented out with `;`.

What to do:

- Count raw lines under `[server_local]` that start with `anytls=` or `shadowsocks=` and do **not** contain the excluded keywords.
- If that count is zero, the parser is working and the upstream file has no keepers.
- If that count is non-zero and the Node runner still errors, file a sanitized fixture. The section regex or keyword list may need a personal tweak.

## Resource refreshes but nodes include traffic rows

The parser is not running.

- Confirm `[general]` has `resource_parser_url` pointing at this repository.
- Confirm the `[server_remote]` line has `opt-parser=true`.
- Confirm Quantumult X is not using a cached older parser. jsDelivr can lag; try the raw GitHub URL or pin a commit SHA.
- Run the fixture `examples/fixtures/nexitally-full-config.sample.conf`. If local output is clean, the app-side wiring is the problem.

## Resource refreshes, nodes look right, but policies are empty

The parser only emits server lines. Policies are local.

- `resource-tag-regex` must match the `[server_remote]` **tag**, default `Nexitally`.
- `server-tag-regex` must match **node** tags (`HK-01`), not the resource tag.
- After the first successful refresh, open the policy and confirm it is bound to the resource, not to stale hardcoded names from an old full-profile import.

## Whole profile was overwritten

That is the original Nexitally **Configuration File → Download** path, not this parser.

Restore the previous Quantumult X profile if you have a backup. Then follow `examples/walkthroughs/nexitally-local-refresh.md` so later updates only touch `[server_remote]`.

## Duplicate nodes remain

The parser deduplicates **exact lines** after trim. Two rows that differ by a trailing parameter or a tag suffix are both kept.

If Nexitally emits the same host twice with different tags, keep both or filter with `server-tag-regex`. Do not expect the parser to guess which tag is canonical.

## Local runner works, Quantumult X does not

Differences that are out of scope for `scripts/run-parser.js`:

- Quantumult X version without AnyTLS
- download failure (the parser never runs)
- a different `resource_parser_url` still installed
- device-only profile syntax that was not copied into the file you tested

Re-export the resource body from the app if possible and run the Node runner on that exact text (after sanitizing for git).

## I need a general-purpose converter

This parser will not grow into a Clash / Surge / `ss://` Swiss army knife. Those tools already exist. Use one of them offline, or use a general Quantumult X parser as `resource_parser_url` and give up this narrow adapter — Quantumult X only loads one parser URL.
