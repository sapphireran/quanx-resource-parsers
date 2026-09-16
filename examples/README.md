# Examples

Sanitized Quantumult X fixtures for the personal parsers in this repository.

These files are **not** a live subscription. Hostnames, passwords, UUIDs, and policy
names are invented so the parser can be exercised locally without any account data.

## Layout

```
examples/
  nexitally/                 Nexitally full-config → server-resource cases
    cases/<name>/
      input.conf             Fake managed Quantumult X configuration
      expected.txt           Server lines the parser should emit
      expected-error.txt     Exact error string, for failure cases
      notes.md               What the case is checking
    quanx-profile-snippet.conf
  scripts/
    run-example.js           Print one case: input summary + parser result
    verify-examples.js       Compare every case against its expected file
```

## Run locally

Requires Node.js 18+. No extra packages.

```bash
# verify every fixture
node examples/scripts/verify-examples.js

# inspect one case
node examples/scripts/run-example.js typical-full-config
node examples/scripts/run-example.js --list
```

The runner loads `nexitally-node-parser.js` inside a small sandbox that provides the
same `$resource` / `$done` globals Quantumult X injects. It never fetches a URL.

## What belongs here

- Invented hostnames (`*.example.test`) and placeholder credentials
- Comments, `[Premium]` rows, traffic/expiry rows, duplicates, CRLF, BOM
- Missing or empty `[server_local]` sections

## What must never be committed

- A real Nexitally (or any provider) subscription URL
- Account IDs, tokens, invoices, or traffic totals from a live profile
- Node passwords, UUIDs, SNI values, or hostnames from a paid plan
- A dumped Quantumult X profile that was actually used on a device

If a fixture starts to look like a real export, replace it with invented values
before committing. See [docs/privacy-and-secrets.md](../docs/privacy-and-secrets.md).
