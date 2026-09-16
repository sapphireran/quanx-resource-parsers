# Examples

Personal, redacted Quantumult X fixtures for
[`sapphireran/quanx-resource-parsers`](https://github.com/sapphireran/quanx-resource-parsers).

Nothing in this directory is a live subscription. Hosts are `*.example.test`,
passwords are `example-password-not-real`, and the Nexitally configuration URL
is never stored here.

## Layout

| Path | Purpose |
| --- | --- |
| [nexitally/](nexitally/) | Managed full-configuration inputs and expected server lists |
| [quantumult-x/](quantumult-x/) | Local-profile snippets that *consume* the parsed resource |

## How to run them

From the repository root:

```bash
node scripts/check-examples.js
node scripts/run-parser.js examples/nexitally/managed-full-config.conf
```

The catalog of fixtures is [../docs/example-catalog.md](../docs/example-catalog.md).

## What a fixture is allowed to contain

A managed-file fixture **should** include leftover Quantumult X sections
(`[policy]`, `[filter_remote]`, `[rewrite_remote]`, `[mitm]`) so the parser
can prove it discards them.

A fixture **must not** include:

- A real provider URL
- Real node hostnames
- Account identifiers
- Traffic numbers from a live invoice

See [../docs/privacy-and-safety.md](../docs/privacy-and-safety.md).
