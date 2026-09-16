# Troubleshooting

Personal notes for the Nexitally parser. Quantumult X error banners are short; the parser's `$done({ error })` text is the useful part.

## Refresh fails with `[server_local] section was not found`

The downloaded body is not a full Quantumult X configuration, or the section header is missing.

Check:

1. **The URL is the Quantumult X full-configuration download**, not a Clash YAML, SIP008 JSON, Surge profile, or HTML login page.
2. **`opt-parser=true` is set.** Without the parser, Quantumult X will not turn a full config into servers. The parser error above still means the body itself had no `[server_local]` block.
3. **The dashboard session is valid.** An expired cookie often returns an HTML sign-in page. Save that body on a computer (never commit it) and search for `[server_local]`. If you see `<html` or `{`, the URL is wrong or blocked.
4. **The provider renamed the section.** This parser only looks for `[server_local]`. A file that only has `[server_remote]` or raw server lines will fail here on purpose. If Nexitally ships a server-only list, drop this parser and import that list directly.

Local reproduction:

```bash
node scripts/run-nexitally-parser.js examples/fixtures/missing-server-local.input.conf
```

## Refresh fails with `no usable server entries were found`

`[server_local]` was present, but every line was dropped.

Usual causes:

- The section only contains comments.
- The only uncommented rows are traffic / expiry / `[Premium]` placeholders.
- The lines use a prefix this parser does not accept (`wireguard=`, `hysteria2=`, a Surge `ss://` URI, a `proxies:` YAML block).

Compare against [examples/fixtures/empty-server-local.input.conf](../examples/fixtures/empty-server-local.input.conf) and [examples/fixtures/comments-duplicates-meta.input.conf](../examples/fixtures/comments-duplicates-meta.input.conf).

If live nodes use a new Quantumult X prefix, add that prefix to `supported` in `nexitally-node-parser.js` and add a fixture. Do not paste a live line into the fixture; rewrite it with `example.com` first.

## Nodes import but look like the whole profile

`opt-parser` is off, or `resource_parser_url` is empty. Quantumult X then tries to treat the full configuration as a server snippet. Enable the parser and refresh again.

## Nodes import, but policies and filters were replaced

The full Nexitally configuration was imported as a **profile**, not as a server resource. That is **Configuration File → Download**. Restore the previous profile from iCloud or a local backup, then use `[server_remote]` as described in [nexitally.md](nexitally.md).

## AnyTLS lines disappear or Quantumult X rejects them

The Quantumult X build is older than AnyTLS support (1.5.6 / build 914). The parser will still return the lines. The app will not understand them. Update Quantumult X, or wait for Nexitally to publish a protocol your build supports.

## Duplicate nodes

The parser removes **exact** duplicate lines only. Two lines that differ by `tag=` or a single flag both survive. If Nexitally ships the same host twice with different tags, that is intentional on their side.

## Parser URL will not load

Quantumult X must be able to download `resource_parser_url` without going through a broken proxy path. Try:

1. The GitHub raw URL first.
2. The jsDelivr URL if GitHub is unreachable.
3. A local copy of `nexitally-node-parser.js` copied into Quantumult X's script folder, with `resource_parser_url` pointed at that local file.

Do not paste the Nexitally subscription URL into `resource_parser_url`. That field is the parser script, not the node list.

## Local runner passes, Quantumult X still fails

The desktop runner only mocks `$resource.content` and `$done`. Differences that still happen on-device:

- Quantumult X downloaded a different body (redirect, WAF, cookie).
- The live file uses a section the fixtures do not cover.
- The app version rejects a server field the parser forwarded unchanged.

Save the live body on the device if Quantumult X offers a view-source / share action, redact it, and run the redacted file through `scripts/run-nexitally-parser.js` before changing the parser.

## jsDelivr is serving an old script

jsDelivr caches git references. After a parser change:

- Prefer the GitHub raw URL for testing, or
- Pin `@<commit>` instead of `@main` once the change is confirmed.

Do not purge caches by committing a private URL as a query string. There is no query string that belongs on this parser.
