# Troubleshooting

## "No custom resource parser"

`[general]` is missing `resource_parser_url`, the URL 404s, or Quantumult
X cached an empty parser.

1. Confirm the line is exactly one `resource_parser_url = …` pointing at
   `nexitally-node-parser.js` on this repository (or a commit SHA).
2. Long-press the home button → refresh. Quit the app and reopen.
3. Open the parser URL in Safari. You should see the JavaScript source,
   not a GitHub HTML page.

## Resource update fails with `[server_local] was not found`

The body was not a Nexitally-style full profile and did not look like a
Quantumult X server list.

Typical causes:

- The URL is an HTML dashboard, not the configuration download.
- The URL is a Clash/Surge YAML. This parser does not convert those.
- The download requires a cookie or UA that Quantumult X did not send.

Save the body (on device) and check that it contains a `[server_local]`
heading or lines starting with `anytls=` / `shadowsocks=` / ….

## "no usable server entries were found"

`[server_local]` existed but every line was a comment, unsupported
protocol, traffic/expiry placeholder, `[Premium]` stub, or hash-filtered
out. Loosen `#in=` / `#regex=` or inspect the raw section.

## Nodes look like a whole config (policies, filters)

`opt-parser=true` is missing on the `[server_remote]` line, so Quantumult
X stored the unparsed profile. Add the flag and refresh.

## Parser never runs because another parser is installed

Quantumult X has a single `resource_parser_url`. Shawn's general parser
and this file cannot both occupy that field.

Options:

- If you only need Nexitally unwrapping, use this file.
- If you need Clash conversion / emoji / rename for other resources, keep
  Shawn's parser and do **not** send Nexitally's full profile through it
  unless you know that parser's Quantumult-X-profile behavior. A safer
  split is: keep the general parser globally, and host a second device
  profile for Nexitally-only experiments — or wait for an official
  server-only Nexitally subscription.

## Hash filters seem ignored

The `#…` fragment must sit on the **resource URL**, before the comma
that starts `tag=` / `opt-parser=`.

Wrong:

```ini
https://subscription.example.test/qx, tag=Nexitally#in=HK, opt-parser=true
```

Right:

```ini
https://subscription.example.test/qx#in=HK, tag=Nexitally, opt-parser=true
```

## AnyTLS nodes import but do not connect

Parsing succeeded; the Quantumult X build or the node parameters are the
problem. Confirm the app version includes AnyTLS (1.5.6 series). This
repository cannot test live handshakes.

## Duplicate HK-01 in the app, not in parser output

The Node fixtures de-duplicate exact lines. If the provider emits two
lines that differ only by a hidden parameter, both survive. Compare the
full lines, not just `tag=`.

## jsDelivr still shows an old script

jsDelivr caches `@main`. Use
`https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js`
or pin `@<sha>`.

## I need to file an issue

See [Privacy](privacy.md). Paste the parser error string and a redacted
line shape, not a live profile.
