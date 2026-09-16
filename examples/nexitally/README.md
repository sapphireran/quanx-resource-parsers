# Nexitally parser examples

Synthetic Quantumult X files that show what `nexitally-node-parser.js` keeps and what it drops.

Nothing in this folder is a real Nexitally export. Hosts use `example.com`. Passwords are `example-password`. UUIDs are reserved examples.

## What the happy-path file is modeling

Nexitally's **Configuration File → Download** URL returns a **full** Quantumult X profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters, rewrites, and sometimes MITM.

`fixtures/happy-path.conf` is a shortened version of that shape. The interesting part is `[server_local]`:

- two AnyTLS nodes and one Trojan node that should survive;
- a duplicate of the first AnyTLS line that should be removed;
- English traffic / expiry / reset banners that should be removed;
- a `[Premium]` placeholder that should be removed;
- a Chinese plan/traffic line that should be removed.

The parser returns only the three usable server lines. Quantumult X then stores those lines as the body of a `[server_remote]` resource.

## Fixture map

| Case | Input | Expected |
| --- | --- | --- |
| `happy-path` | managed full config | three server lines |
| `happy-path-crlf-bom` | same file + BOM + CRLF | same three lines |
| `missing-section` | no `[server_local]` | error |
| `placeholders-only` | only banners / Premium | error |
| `empty-section` | empty `[server_local]` | error |
| `duplicates-and-comments` | comments + duplicates | two unique lines |
| `mixed-protocols` | all seven accepted types | seven lines |
| `extra-sections` | servers then filters | first server only |
| `unsupported-protocols` | hy2 / tuic / wg / ssr / https | the AnyTLS line |
| `case-insensitive-header` | `[SERVER_LOCAL]` | one line |
| `chinese-exclusion` | 流量 / 到期 / 剩余 / 套餐 | two keepers |
| `server-local-at-eof` | section is last | two lines |
| `leading-whitespace-header` | padded header | one line |
| `spaced-equals` | `anytls =` | both lines, spacing kept |

The authoritative list is `manifest.json`. `npm test` reads that file.

## Walk the happy path by hand

```bash
node scripts/run-parser.js \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/happy-path.conf
```

You should see exactly the three lines in `fixtures/happy-path.expected.txt`.

```bash
node scripts/run-parser.js --json \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/missing-section.conf
```

You should see:

```json
{
  "error": "Nexitally parser: [server_local] section was not found."
}
```

## What these files deliberately omit

- No Nexitally subscription URL.
- No account id, token, or invoice data.
- No real node hostnames or passwords.
- No copy of a downloaded Nexitally profile.

If you need to debug a live refresh, redact a local copy on your machine. Do not add that copy to this repository. See `docs/safety.md`.
