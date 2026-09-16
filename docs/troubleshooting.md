# Troubleshooting

Work through these in order. Most failures are “the parser never ran” or “the body is not a full configuration”, not a bug in the filter regex.

## The resource shows a parser error: `[server_local]` was not found

The downloaded body is not a Quantumult X full configuration, or the section header is missing.

- Open the same URL in a browser **on a device that is allowed to download it**, save the body locally, and confirm it contains a line `[server_local]`.
- If you see Clash YAML, a base64 blob, or a Surge profile, this parser will not convert it. It only extracts Quantumult X `[server_local]`.
- If you see a bare list of `anytls=` lines with no section headers, you already have a server resource. Point `[server_remote]` at that URL and set `opt-parser=false` (or omit it).
- Confirm the URL is the **Quantumult X configuration** download, not a generic “subscription” link meant for another client.

Do not paste the real body into a GitHub issue. Redact it down to section headers and fake hosts, or run the local harness on a copy that never leaves your machine. See [Privacy and safety](privacy-and-safety.md).

## The resource shows: no usable server entries were found

`[server_local]` existed but every line was a comment, a quota row, a `[Premium]` placeholder, or an unsupported scheme.

- Compare the section to [examples/nexitally/full-config.sample.conf](../examples/nexitally/full-config.sample.conf). Quota tags (`Traffic`, `流量`, …) are dropped on purpose.
- If the only remaining nodes are `[Premium]` placeholders, the paid/standard mix may have changed. The parser will not import those placeholders.
- AnyTLS lines must start with `anytls=` (no leading spaces after trim). A vendor-specific prefix will fail the scheme check.

## The resource contains the whole profile (policy, filters, MITM)

`opt-parser=true` is missing, or `resource_parser_url` is empty.

1. Check `[general]` for `resource_parser_url` pointing at `nexitally-node-parser.js`.
2. Check the `[server_remote]` line includes `opt-parser=true`.
3. Update the parser URL itself (long-lived jsDelivr cache — pin `@main` or switch to `raw.githubusercontent.com`).
4. In the app, disable and re-enable the resource, then update.

## Nodes appear, but AnyTLS connections fail

The parser only copies lines. It does not speak AnyTLS.

- Quantumult X must be **1.5.6** or later (AnyTLS landed in that line; Reality TLS uses `reality-base64-pubkey=`).
- `over-tls=true` and `tls-host=` must match what the vendor deployed. The sample files use `www.example.com` / `www.apple.com` as stand-ins.
- UDP: AnyTLS transports UDP over TCP; you do not need `udp-over-tcp=` on these lines.

## Duplicate names in the UI

The parser de-duplicates **exact full lines**. Two nodes with the same `tag=` but different hosts are both kept. Quantumult X may then rename the second. That is app behavior, not the parser collapsing tags.

## jsDelivr serves an old parser

jsDelivr’s `gh/user/repo@main` URL can lag. Switch `resource_parser_url` to the raw GitHub URL, or append a dummy query only if Quantumult X still fetches it (many clients ignore cache-busters on parser URLs — changing the URL path or host is more reliable).

After a GitHub username change (`pang990801` → `sapphireran`), update the parser URL. Redirects are not something to depend on inside Quantumult X.

## Local harness disagrees with the app

The harness evaluates the same file with `$resource` / `$done` shims. If Node passes and the app fails, the **downloaded body** differs (redirect, HTML interstitial, gzip decoded differently, extra banner). Save the body Quantumult X actually received if the app exposes it; otherwise download the URL with the same User-Agent the app uses.

```bash
node test/harness.js --json /path/to/saved-body.conf
```

## Adding a regression

1. Put a redacted `.conf` in `examples/nexitally/` or `test/fixtures/`.
2. Capture output with `node test/harness.js that.conf > sibling.expected.txt`.
3. Add an `assertServers` / `assertError` call in `test/nexitally-node-parser.test.js`.
4. Run `npm test`.

Never commit a file that contains a live subscription URL or a real node password.
