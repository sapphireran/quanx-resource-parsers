# Privacy rules for this repository

This is a personal public repository. Treat every commit as visible to the internet.

## Never commit

- Nexitally or any other provider subscription URL
- Account ids, dashboard tokens, invoice ids
- Node passwords, UUIDs that are not the official Quantumult X sample UUID
- Reality public keys or short ids copied from a live subscription
- Quantumult device IDs from **Settings → Misc Settings → About**
- MITM CA material, custom hostnames that identify a workplace, or `passphrase` lines
- Screenshots of the Quantumult X UI that still show a URL or email
- Exported full configurations that came from a real dashboard

If a file would work as a drop-in replacement for a live profile, it does not belong here.

## Safe to commit

- Parser source that reads `$resource.content` and returns `$done({ content })`
- Documentation that uses placeholders such as `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`
- Fixtures that use `example.com`, `192.0.2.0/24` documentation addresses, and the passwords from the [official Quantumult X sample.conf](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf)
- Expected parser output derived from those fixtures

The official sample UUID `23ad6b10-8d1a-40f7-8ad0-e3e35cd32291` and the sample Reality key material in `sample.conf` are documentation values. Do not replace them with values from a paid subscription.

## Where private data lives

| Item | Location |
| --- | --- |
| Nexitally Quantumult X URL | Local Quantumult X `[server_remote]` only |
| Parser script | This repository or a CDN that mirrors it |
| Local policies, filters, MITM | Local Quantumult X profile |
| Fixture files | This repository, synthetic only |

Quantumult X downloads the private URL on-device. The parser runs on-device. GitHub and jsDelivr only host the parser script.

## If something private is committed

1. Rotate the leaked credential or subscription URL at the provider.
2. Remove the file from git history. Deleting it in a later commit is not enough.
3. Assume mirrors (jsDelivr, Google cache, forks) still have the old blob for a while.

Do not open an issue that pastes the leaked URL. Rotate first, then mention that a URL was published without repeating it.

## Parser design choices that keep secrets out

- The script does not read `$resource.link`. A leaked parser file therefore cannot reveal which URL you subscribe to.
- The script does not log `$resource.content`.
- The script does not call `$notify` with node lines.
- Examples use `opt-parser=true` so Quantumult X, not a gist, holds the private body.

When adding another parser, keep the same constraints. See [adding-a-parser.md](adding-a-parser.md).
