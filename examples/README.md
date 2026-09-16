# Parser examples

These files are synthetic. Hosts use `.example.test`. Passwords are the
literal string `placeholder-not-a-real-secret` or a nil UUID. None of them
are credentials.

| File | What it shows |
| --- | --- |
| `nexitally-full-config.example.conf` | A managed full Quantumult X profile: `[general]`, `[dns]`, `[policy]`, `[server_local]`, filters. The interesting part is `[server_local]`. |
| `nexitally-expected-servers.txt` | Default parser output for that full profile: usable servers only, one HK-01, no traffic/expiry/`[Premium]` rows. |
| `hash-in-hk.expected.txt` | Same profile with `#in=HK` on `$resource.link`. |
| `already-server-list.example.txt` | Provider already returned server lines. The parser still filters placeholders. |
| `already-server-list.expected.txt` | Output of the fallback path. |
| `quantumult-x.local.example.conf` | How a *local* profile points `[server_remote]` at Nexitally with `opt-parser=true`. |

## Run them

From the repository root:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf
```

The printed lines should match `nexitally-expected-servers.txt`.

Hash parameters ride on a placeholder link, never a real subscription URL:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf \
  --link 'https://subscription.example.test/quantumult-x#in=HK'
```

JSON is available for tests and editors:

```bash
node tools/run-parser.js examples/nexitally-full-config.example.conf --json
```

`npm test` re-parses these files and compares them to the `*.expected.txt`
snapshots, so the examples cannot drift from the parser.

## What to copy into Quantumult X

Only `quantumult-x.local.example.conf` is a profile sketch. Copy the
`resource_parser_url` line and the `[server_remote]` shape. Replace the
example URL with the private Nexitally configuration URL from the provider
dashboard. Leave that URL on the device.

A line-level reading of the full-config fixture is
[docs/examples-walkthrough.md](../docs/examples-walkthrough.md).

Do not paste a real Nexitally response into this folder.
