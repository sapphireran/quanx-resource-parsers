# Personal notes

Working notes for the Quantumult X parsers in this repository. They are written
for the repo owner (and anyone else who clones it). Nothing here is a vendor
document and nothing here is company material.

## Read in this order

1. [Privacy and secrets](privacy-and-secrets.md) — what must never land in git
2. [Nexitally node parser](nexitally-node-parser.md) — what the script does, line by line
3. [Resource parser environment](resource-parser-environment.md) — `$resource` / `$done`
4. [Server line reference](quanx-server-line-reference.md) — prefixes the parser keeps
5. [Troubleshooting](troubleshooting.md) — empty lists, stale nodes, parser errors
6. [Adding another personal parser](adding-a-parser.md) — if a second provider appears

Runnable fixtures live in [`examples/`](../examples/README.md). After a parser
edit, run:

```bash
node examples/scripts/verify-examples.js
```

## Scope

This repository is a thin personal layer on top of Quantumult X:

- Quantumult X downloads the managed full configuration.
- A resource parser extracts `[server_local]`.
- The rest of a stable local profile (`[policy]`, `[filter_*]`, rewrite, MITM)
  stays on the device.

The parsers do not implement a proxy protocol, do not talk to a provider API,
and do not store credentials.
