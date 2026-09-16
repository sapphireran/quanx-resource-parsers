# Privacy and safety

This repository is public. Treat every commit as visible to the internet.

## Never commit

- The Nexitally (or any other) configuration download URL
- Account ids, tokens, invoice ids, or dashboard cookies
- Real node hosts, ports, passwords, UUIDs, or Reality keys from a live plan
- Quantumult X MITM `passphrase` / `p12` material
- A dumped live profile that still contains the items above

The parser file itself must stay free of those values. A parser that embeds a personal URL is a credential leak, not a convenience.

## Safe substitutes

| Live value | What to put in git |
| --- | --- |
| Private configuration URL | `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` |
| Node host | `*.example.test` |
| Password / UUID | `pwd`, `placeholder`, or the official sample UUID |
| Reality keys | The public sample values from Quantumult X `sample.conf` |
| Traffic banner | Fake numbers in fixtures (`128.50 GB`, `2099-12-31`) |

`examples/fixtures/` follows that table. If a fixture starts looking like a real export, delete it and regenerate from placeholders.

## Where the live URL may live

- The Quantumult X profile **on the device**
- An encrypted personal backup that is not this git remote
- A password manager note

It may not live in:

- this repository
- a public gist
- a public CDN file
- a screenshot attached to a public issue
- a chat log you later paste into an issue

## How the parser is supposed to handle secrets

Quantumult X downloads the private URL itself. The JavaScript only receives `$resource.content`. That is why the script can be public: the secret is the URL and the live node fields, not the transform.

When debugging:

1. Copy the downloaded body to a local file.
2. Replace hosts and secrets before sharing.
3. Run `node scripts/run-parser.js` on the sanitized copy.
4. If you need a new fixture, keep it sanitized and add it under `examples/`.

## jsDelivr and raw GitHub

The documented `resource_parser_url` values point at **this** repository. They fetch only `nexitally-node-parser.js`. They do not fetch your Quantumult X profile.

Do not publish a "helper" URL that proxies the Nexitally configuration through a personal server and then commit that helper URL here.

## Issue and pull-request hygiene

Before pasting Quantumult X output into a GitHub comment:

- strip `[server_remote]` lines that contain real URLs
- strip `[mitm]` credentials
- replace every live server line with a fixture-style placeholder
- confirm the paste still reproduces the bug

If it cannot be reproduced with a sanitized fixture, describe the structure (`[server_local]` missing, only `Traffic` rows, duplicate tags) instead of uploading the file.
