# Examples

Fictional Quantumult X fixtures for the personal parsers in this repository.

Nothing here is a live subscription. Hosts are `example.com` / TEST-NET,
passwords are `pwd`, and resource URLs are placeholders. See
[docs/privacy.md](../docs/privacy.md) before adding another file.

## Layout

| Path | Purpose |
| --- | --- |
| [nexitally/](nexitally/) | Typical Nexitally-style full configuration and the snippet the parser should return. |
| [nexitally/edge-cases/](nexitally/edge-cases/) | Missing sections, placeholders, unsupported schemes, section leakage, BOM/CRLF. |
| [nexitally/usage.quantumult.conf](nexitally/usage.quantumult.conf) | Local profile wiring. Replace the placeholder URL only on your device. |
| [manifest.json](manifest.json) | Machine-readable list of fixtures for `tools/run-examples.js`. |

## Run every fixture

```bash
node tools/run-examples.js
```

The runner loads each committed `*.js` parser, mocks `$resource` / `$done`,
and compares the result with the expected content or error string.

## Adding a fixture

1. Write the input with documentation placeholders only.
2. Write the expected snippet or record the exact `$done.error` string.
3. Append an object to `manifest.json`.
4. Re-run `node tools/run-examples.js`.

Do not check in a real Quantumult X export and "clean it up" in a later
commit.
