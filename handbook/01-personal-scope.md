# 01 — Personal scope

This repository is a **personal** Quantumult X helper. It is not a workplace config dump and it is not a subscription host.

## What this repo may contain

- The parser script (`nexitally-node-parser.js`) with **no** live URL, account id, or node password.
- Invented fixtures that use documentation hosts (`example.com`, `apple.com`, `192.0.2.0/24`, `2001:db8::/32`) and official Quantumult X sample secrets (`pwd`, the documented sample UUID, the documented Reality demo pubkey).
- Local profile **snippets** that keep the private download URL as `YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL`.
- Notes about how Quantumult X resource parsers behave.

## What must never be committed

| Kind | Examples |
| --- | --- |
| Live subscription URL | Any `https://` host that actually serves a paid profile |
| Account identifiers | User id, invoice id, dashboard token |
| Real node secrets | Hostnames, passwords, UUIDs, Reality keys from a live node |
| Traffic / expiry of a real account | Used GB, reset day, remaining days |
| Company or employer config | Any profile, filter, or rewrite from work |
| Device identifiers | Quantumult device IDs from Settings → About |

`.gitignore` drops `*.local.conf`, `secrets/`, `scratch/`, and `tmp/` so a phone export is harder to add by accident. `node studio/replay.js scan` also rejects files that look like live URLs or non-sample credentials.

## Hosting names

The GitHub owner of this personal repo is `sapphireran`. Older notes that mention `pang990801` refer to a previous username of the same personal account, not a second project.

Canonical parser URLs:

```text
https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

## One parser per profile

Quantumult X accepts a **single** `resource_parser_url` under `[general]`. This script is written to be that parser for a Nexitally-style full profile. It does not implement Shawn's general-purpose parameter language (`#in=香港&emoji=1`). If a future personal parser is added, decide which one the device points at.
