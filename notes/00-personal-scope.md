# 00 — Personal scope

This repository holds **personal** Quantumult X resource parsers. It is not a work project, a client deliverable, or a place to park employer profiles.

## What belongs here

- Parser scripts that extract a server list from a managed full configuration you already download on your own device.
- Documentation of how those scripts behave.
- Invented fixtures that exercise keep / drop / error paths.
- Local runners that mock the Quantumult X `$resource` / `$done` globals.

## What must never be committed

| Class | Examples | Why |
| --- | --- | --- |
| Live subscription URLs | Nexitally Configuration File → Download link, tokenized CDN URLs | Anyone with the URL can pull the account's node list |
| Account identifiers | User IDs, invoice numbers, dashboard tokens | Ties the repo to a paid account |
| Real node secrets | Passwords, UUIDs, Reality public keys from a live profile | Those secrets are the nodes |
| Live metadata | Real traffic totals, real expiry dates | Identifies the subscriber |
| Company material | Employer Surge/QX/Clash profiles, internal hostnames | Out of scope for this repo |

The Nexitally URL stays in the **device** profile, in `[server_remote]`. It does not belong in git, a public Gist, a screenshot of this repo, or a jsDelivr-hosted snippet.

## Hosts and secrets used in examples

Workbook fixtures are allowed to look like Quantumult X, but they must stay on documentation ranges:

- DNS: `*.example.invalid`, `example.com`, `example.org`
- IPv4: `192.0.2.0/24` (TEST-NET-1)
- IPv6: `2001:db8::/32`
- Passwords: `example-password`
- UUID: `00000000-0000-4000-8000-000000000000`

`workbook/scan-secrets.js` rejects committed files that look like they escaped from a real export.

## Relationship to Quantumult X

Quantumult X fetches the managed configuration itself. The parser only sees the response body. Publishing a parser is not the same as publishing a subscription.
