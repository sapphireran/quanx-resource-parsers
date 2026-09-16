# Security and privacy

This is a personal parser repository. The scripts are public; **your Nexitally account is not**.

## What this repository must never contain

| Kind | Examples | Why |
| --- | --- | --- |
| Subscription URL | Nexitally "Configuration File" link, tokenized CDN URLs | Anyone with the URL can fetch your nodes |
| Account identifiers | User id, invite code, dashboard cookie | Ties the file to a person |
| Node secrets | Real `password=`, UUIDs, Reality short ids from a live plan | Those *are* the credentials |
| Traffic dumps | Unredacted `[server_local]` from a live refresh | Same as publishing the node list |
| Device identifiers | Quantumult `require-devices=` ids | Identifies a phone or Mac |

The live parser file is written so it does not need any of the above. If a future change would require embedding a host or token, that change is wrong for this repo.

## What the examples use instead

| Real value | Stand-in in git |
| --- | --- |
| Nexitally configuration URL | `YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL` |
| Node host | `*.example.invalid` (RFC 2606 / reserved invalid TLD) |
| Password | `placeholder-password` |
| UUID | `00000000-0000-4000-8000-00000000000x` |
| Sample 2022 key | The public value from Quantumult X `sample.conf` |
| Policy icon | `https://example.invalid/icon.png` |

`example.com` appears only when quoting official Quantumult X documentation. New fixtures should prefer `example.invalid` so they cannot resolve.

## How Quantumult X keeps the secret

1. You paste the private URL into **local** `[server_remote]`.
2. Quantumult X downloads it with the app's network stack.
3. The parser receives `$resource.content` only.
4. This repository's parser does not read `$resource.link` and does not call `$notify` with the body.

A generic third-party parser that logs `$resource.link` or posts the body elsewhere is a different trust decision. Do not point `resource_parser_url` at a script you have not read.

## Reviews and issues

When filing a GitHub issue or sending a fixture:

1. Replace every hostname with `something.example.invalid`.
2. Replace every password / UUID.
3. Delete `[mitm]` hostnames that are yours.
4. Delete the `[server_remote]` URL line entirely, or keep the placeholder token.

The local command `node scripts/run-parser.js` reads a **file path**. It is safe for sanitized fixtures. It is not a place to paste a live URL; the harness will not fetch it, and a saved live body would still be a secret on disk.

## jsDelivr and GitHub raw

`resource_parser_url` points at a **public** JavaScript file. That is intentional: the script has no credentials. Pinning a commit SHA avoids surprise updates:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@<full-sha>/nexitally-node-parser.js
```

Review the file at that SHA before pinning.

## Threat model (personal)

| Event | Impact | Mitigation |
| --- | --- | --- |
| This git repo leaks | None for the account, if no URL was committed | Keep using placeholders |
| jsDelivr or GitHub is compromised | A malicious parser could rewrite nodes | Pin a SHA; read diffs before moving `@main` |
| Device backup includes the QX profile | The private URL is in the backup | Treat iCloud / Finder backups as secret |
| Screenshot of Server Resources | May show node hosts | Crop before posting |

There is no company tenant, shared CI secret, or org parser host in this repository. Do not copy company subscription URLs or internal parser scripts into these personal docs.
