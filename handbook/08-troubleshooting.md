# 08 — Troubleshooting

Start from the **device symptom**, then replay the matching fixture. Do not paste a live profile into the repo; copy the *shape* into a new sanitized case.

| Symptom on the phone | Likely cause | Fixture / check |
| --- | --- | --- |
| Resource error: section was not found | Body is HTML, Clash YAML, or a server-only list under `[server_remote]` | `html-interstitial`, `clash-yaml`, `wrong-section-server-remote`, `missing-server-local` |
| Resource error: no usable servers | Section exists but every line is a banner, comment, or unsupported scheme | `empty-usable`, `placeholders-only`, `unsupported-family` |
| Resource shows the entire vendor profile | `opt-parser` is false, or `resource_parser_url` did not load | `studio/profiles/server-remote.snippet.conf` |
| Traffic / 套餐 rows appear as nodes | Parser not running | Same as above; those lines are `DROP_EXCLUDED` when the parser runs (`info-banners-en-zh`) |
| A node named `HK-Reset-01` or `Preset` is missing | Exclusion substring `Reset` | `reset-substring-trap` |
| `DaysLeft` kept, `Days Left` dropped | Space-sensitive token | `days-left-spacing` |
| Nodes after `[Premium]` missing | `[Premium]` is an INI terminator | `premium-as-section` |
| Second `[server_local]` ignored | First-section-only capture | `first-of-two-server-local` |
| Header looks right but errors | Glued header, inner space, or no newline after `]` | `glued-header`, `inner-spaced-header`, `header-no-newline` |
| Mixed-case `[Server_Local]` works | Header match is case-insensitive | `header-mixed-case` |
| Duplicate node appears once | Exact trimmed-line dedupe | `comments-and-duplicates` |
| Policy / filter lines inside the section vanish | Unsupported prefixes | `policy-lookalikes`, `filter-rules-inside-section` |
| Parser URL change has no effect | App cache | Force-quit after resource refresh (handbook 06) |

## Error strings (exact)

```text
Nexitally parser: [server_local] section was not found.
Nexitally parser: no usable server entries were found.
```

The studio compares these byte-for-byte.

## What not to do

- Do not commit the private URL “just to reproduce.”
- Do not add `console.log` of `$resource.content` from a live refresh.
- Do not file a fixture that still contains a real hostname. Replace it with `example.com` or `192.0.2.10` first.
