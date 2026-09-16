# Troubleshooting

Work through these in order. Most failures are “Quantumult X downloaded the wrong kind of body,” not a JavaScript exception.

## Quick isolation

1. In Quantumult X, open the Nexitally server resource and read the exact error string.
2. Confirm `resource_parser_url` points at this repository’s `nexitally-node-parser.js` and that `opt-parser=true` is on the resource line.
3. Replay the closest sanitized fixture with the local runner:

   ```bash
   node examples/run-parser.js --list
   node examples/run-parser.js --only no-server-local --verbose
   ```

The runner cannot fetch your private URL. Copy the downloaded body to a **local scratch file that you never commit**, redact hosts and passwords, then:

```bash
node examples/run-parser.js --input /path/to/redacted.conf --dump
```

`--dump` prints the parser result. Use it only on redacted input.

## Error: `[server_local]` section was not found

The parser never saw a line that looks like `[server_local]` followed by a newline.

Typical causes:

| Cause | What to check |
| --- | --- |
| The URL is a landing page or login HTML | The body starts with `<!DOCTYPE` or `<html`. The dashboard URL is not the configuration download. |
| The URL is Clash / SIP008 / base64 | No INI sections. You need a different parser, or the Quantumult X-specific download. |
| The URL is already a server-only list | There is no `[server_local]` wrapper. Point `[server_remote]` at it **without** this parser. |
| Header uses inner spaces | `[ server_local ]` does not match. |
| Header and first line are glued together | `[server_local]anytls=...` has no newline after the header. |
| You are looking at a Surge or Loon file | Section names differ. |

What does **not** cause this error: empty `[server_local]`, comment-only sections, or sections that contain only Premium / traffic lines. Those produce the next error.

## Error: no usable server entries were found

The section exists, but every line was dropped.

Typical causes:

| Cause | What to check |
| --- | --- |
| Only traffic / expiry comments | Lines such as `Traffic`, `Expire`, `Days Left`, `流量`, `到期`. |
| Only `[Premium]` placeholders | Those tags are excluded on purpose. |
| Wrong protocol prefixes | `ss=`, `shadowsocksr=`, Clash keys. Quantumult X wants `shadowsocks=`. |
| Every real node name contains an exclusion word | For example a tag `HK-Traffic-01` is dropped. See [nexitally-parser.md](nexitally-parser.md). |
| The section is only comments | `;` `#` `//` lines are ignored. |

Replay `placeholders-only` and `unsupported-prefixes` in [`../examples`](../examples/README.md) to see the same error on sanitized data.

## Resource refreshes but node count is lower than the dashboard

This is often correct:

- Duplicate lines are removed.
- `[Premium]` placeholders are removed.
- Info lines were never nodes.
- A second `[server_local]` section, if a provider ever emits one, is ignored.

Compare a redacted download against `typical-full-config` and `comments-and-duplicates`.

## Nodes appear twice

Usual cause: the same servers still exist in `[server_local]` from an old full-profile import, **and** they now also arrive through `[server_remote]`. Remove the local copies after the remote resource is healthy.

Less common: two remote resources point at the same URL, one with the parser and one without.

## Parser does not run

- Missing `resource_parser_url` in `[general]`.
- Resource line lacks `opt-parser=true`.
- Quantumult X still has an old parser cached. Re-save `[general]` or change the parser URL by adding a harmless query string while testing, then set it back.
- jsDelivr is serving a stale file. Switch to `raw.githubusercontent.com` while debugging.

## Nodes import but cannot connect

The parser does not validate TLS, Reality, or passwords. A kept line is the provider line. Check:

- Quantumult X version supports AnyTLS (see [compatibility](compatibility.md)).
- The device date is correct (TLS / Reality failures look like dead nodes).
- You did not accidentally refresh a redacted example file.

## Local runner disagrees with Quantumult X

The runner uses Node `vm` and the same script file. Disagreements usually mean:

- Quantumult X is not running the file you think (CDN cache, wrong branch).
- The body Quantumult X downloaded is not the file you tested (HTML, compression, different URL).
- You tested a fixture and compared it to a live account.

Dump the first 200 characters of a redacted live body (never commit it) and confirm it starts with an INI section, not HTML.

## Still stuck

Open an issue on this personal repository with:

- the **exact** parser error string
- Quantumult X version / build
- which sanitized fixture is the closest match
- a redacted snippet of the `[server_local]` header and a couple of **fake** server lines

Do not attach the real subscription URL or real node lines.
