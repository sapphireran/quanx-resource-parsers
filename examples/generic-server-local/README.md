# Generic `[server_local]` extractor

This folder is a teaching contrast, not a second production parser.

`extract-server-local.js` copies non-comment lines out of `[server_local]`. It does **not** drop traffic banners, expiry lines, or `[Premium]` placeholders. `nexitally-node-parser.js` does.

## Why it exists

When a Nexitally refresh looks "too empty" or "too full", compare the two parsers against the same synthetic file:

| File | Nexitally parser | Generic extractor |
| --- | --- | --- |
| `examples/nexitally/fixtures/placeholders-only.conf` | error: no usable servers | would keep the info lines |
| `examples/generic-server-local/fixtures/keep-info-lines.conf` | would keep only `Usable-HK` | keeps the Traffic line and `Usable-HK` |

That difference is the whole point of the Nexitally-specific exclusions.

## Run locally

```bash
node scripts/run-parser.js \
  examples/generic-server-local/extract-server-local.js \
  examples/generic-server-local/fixtures/keep-info-lines.conf

node scripts/check-examples.js
```

Do not point Quantumult X `resource_parser_url` at this file unless you are experimenting on purpose. The personal profile documented in this repo uses `nexitally-node-parser.js`.
