# Privacy and secrets

A Quantumult X full configuration is an account dump. It usually contains the
subscription URL, node hostnames, passwords or UUIDs, SNI values, and
traffic/expiry banners. This repository must stay free of all of that.

## Rules

1. **Never commit a live URL.** The Nexitally download link is a capability.
   Anyone who has it can refresh the node list. Keep it in the on-device
   `[server_remote]` line only.
2. **Never commit a real profile export.** "Just this once" is how hostnames
   and passwords leak into public git history.
3. **Never put account identifiers in issues, commit messages, or examples.**
   That includes invoice numbers, mailbox names, and telegram handles used as
   login IDs.
4. **Treat jsDelivr / raw GitHub URLs as public.** `resource_parser_url` points
   at the parser source, which is intentionally public. It must not embed a
   token or a personal CDN path that requires auth.

## What the parser is allowed to contain

The JavaScript in this repo may include:

- section names (`[server_local]`)
- protocol prefixes (`anytls`, `shadowsocks`, …)
- generic exclusion keywords (`Traffic`, `Expire`, `流量`, `[Premium]`)
- error strings

It may not include:

- a default subscription URL
- a hard-coded password, UUID, or SNI
- a personal email, device name, or iCloud account

## Example fixtures

Files under `examples/` use the reserved `example.test` suffix and passwords
such as `example-anytls-password`. Those strings are part of the test surface.
If a fixture is replaced with a real export, delete the file and rewrite it
with invented values before the next commit.

A quick self-check before committing:

```bash
# these should never match a live provider host or a real token
git grep -nE 'nexitally\\.(com|net|app)|token=|uuid=|sub\\?|password=[^e]'
```

The pattern is deliberately coarse. Read the hits. Invented `password=example-…`
values are fine; anything that looks like a production hostname is not.

## If something leaked

1. Remove the file in a new commit (history still has it).
2. Rotate the provider password / regenerate the subscription URL on the
   provider dashboard.
3. If the leak reached GitHub, treat the URL as burned even after a force-push.
   Force-pushing does not erase forks, clones, or CDN caches.

## Quantumult X side

`opt-parser=true` matters for privacy as well as correctness. Without it,
Quantumult X stores the raw full configuration as the server resource — policy,
rewrite, and MITM hostnames included. With the parser enabled, the stored
resource is the extracted server list only.
