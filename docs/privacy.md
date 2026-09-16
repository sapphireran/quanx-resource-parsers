# Privacy

This repository is public. Treat every commit, issue, screenshot, and fixture as if a stranger will clone it.

The parser is designed so the **script** holds no secrets. Your **Quantumult X profile** holds the secrets. Keep that split.

## What must never land in this repository

| Data | Why it is secret | Typical leak path |
| --- | --- | --- |
| Nexitally full-configuration URL | It is an unauthenticated download of every node and often the rest of the profile | Pasting into `README.md`, a Gist, an issue, or a screenshot of `[server_remote]` |
| Account id, token, or dashboard cookie | Full account takeover | Support dumps, HAR files |
| Real hostnames, ports, passwords, UUIDs | Anyone can use the nodes | "Sanitized" configs that only renamed the tag |
| `$resource.link` | Same as the subscription URL | Debug `console.log` inside a parser |
| `$resource.info` | Traffic and expiry for the account | Sharing a verbose parse dump |
| MITM hostnames you actually decrypt | Shows which sites you intercept | Copying a live `[mitm]` block into an example |

The examples use `.example.invalid`, `example-password`, `pwd`, and the Reality demo values from Quantumult X's own sample files. Copy that style.

## What the parser is allowed to contain

- Regular expressions for section headers and protocol prefixes
- The public exclude list (`[Premium]`, traffic / expiry keywords)
- Error strings
- Comments that say the script holds no subscription URL

If you add logging, log **counts** (`kept 17 servers`) or **shapes** (`prefix=anytls`), never the line itself.

## Redacting a live download before you debug

Do this on the device or in a private scratch file. Do not commit the scratch file.

1. Copy `$resource.content` out of Quantumult X only if you must.
2. Replace every hostname with `redacted-NN.example.invalid`.
3. Replace every `password=`, `username=`, and UUID with `example-password` / `name` / `00000000-0000-0000-0000-000000000000`.
4. Replace Reality public keys and short ids with the official sample values.
5. Delete `[server_remote]` lines that contain your URL, or replace the URL with `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`.
6. Delete `[mitm]` hostnames you actually use.
7. Confirm the redacted file still reproduces the bug, then add it under `examples/nexitally/`.

A redaction that keeps the original hostname is not a redaction.

## Screenshots and screen recordings

Crop or blur:

- the `[server_remote]` URL
- node hostnames in the Quantumult X server list
- traffic remaining / expiry banners
- any QR code that encodes a subscription

The walkthrough screenshots for this project, if any, should show **fixture output** (`npm test`, `--dump` on an example file), not a live Nexitally refresh.

## jsDelivr and GitHub raw

`resource_parser_url` is public by design: Quantumult X has to download the script. That URL is not a credential. Pinning a commit SHA only pins **script behavior**; it does not hide your subscription.

Do not put the subscription URL in a query string on the parser URL. This parser ignores `$resource.link` and does not read hash parameters.

## Issues and pull requests

When filing a personal note or a PR:

- Attach a fixture from `examples/nexitally/`, or a newly redacted one.
- Paste the **error string**, not the resource URL.
- If a reviewer asks for the live file, refuse and send the redacted fixture instead.

## Local git hygiene

```bash
# before you commit
git diff
git grep -nE 'https?://[^[:space:]]+' examples docs README.md
```

Allowed hits are `example.invalid`, GitHub / jsDelivr links to **this** repository, and official Quantumult X sample links. A Nexitally dashboard host or a personal domain is a stop-the-press leak.

If a secret is committed, rotate the provider subscription and treat the git history as public forever. Removing the file in a later commit is not enough.
