# Privacy and safety

This repository is a **personal** Quantumult X helper. It must never contain:

- A Nexitally (or any provider) subscription or configuration URL
- Account numbers, tokens, cookies, or dashboard passwords
- Real node hosts, ports, or passwords from a live plan
- Company configuration, internal hostnames, or work-device profiles

The published parser is only a transformation. Quantumult X fetches the private URL **on the device**. The script in GitHub does not embed that URL and does not phone home.

## Placeholders used in examples

| Kind | What you will see |
| --- | --- |
| Hosts | `*.example.com`, `www.apple.com` as TLS SNI stand-ins |
| Passwords | `example-password-not-real`, `unused`, Quantumult X sample.conf dummy values |
| Reality fields | The public `sample.conf` demonstration pubkey / short id |
| Parser URL | `sapphireran/quanx-resource-parsers` on jsDelivr or raw.githubusercontent.com |

If a fixture starts to look like a real node list, delete it. Re-build from [examples/nexitally/full-config.sample.conf](../examples/nexitally/full-config.sample.conf).

## How to test a real download without leaking it

1. On your own machine, download the full configuration to a path **outside** this git checkout, or to a file that is gitignored.
2. Run `node test/harness.js /path/to/private.conf`.
3. Confirm the printed lines are servers you expect.
4. Delete the private file. Do not `git add` it. Do not paste it into a PR comment.

A `.gitignore` entry for `*.private.conf` and `private/` is there as a backstop, not as permission to store secrets in the working tree.

## Parser URL vs resource URL

| URL | Public? | Who fetches it |
| --- | --- | --- |
| `resource_parser_url` | Yes — this repo | Quantumult X, to load the JavaScript |
| Nexitally configuration URL in `[server_remote]` | **No** | Quantumult X, as you | 

Putting the parser on jsDelivr or GitHub is fine: it has no secrets. The `[server_remote]` URL is the secret.

## What the parser does **not** do

- It does not log `$resource.link`.
- It does not persist `$resource.info` (traffic headers).
- It does not send `$notify` (so a failed parse is visible only as a resource error).
- It does not retry with a custom User-Agent.

Those omissions are deliberate. A parser that notified the full body or wrote it to `$persistentStore` would be a leak.

## Reporting issues

Open an issue with:

- Quantumult X version
- Whether `[server_local]` exists in a **redacted** header list
- The exact `$done({ error })` string
- A fixture derived from the samples, not from your subscription

If the bug cannot be reproduced from a synthetic file, say so. Do not attach the original download.
