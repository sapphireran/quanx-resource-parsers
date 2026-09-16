# Privacy rules for this personal repository

This repository is public. Treat every commit as if a stranger will read it.

The Nexitally parser exists specifically so a **private** full-configuration
URL can stay on the device that runs Quantumult X. The parser script is
public. The subscription is not.

## Never commit

Do not add any of the following to git, a gist, a screenshot in this repo, or
a public CDN mirror:

- the Nexitally Configuration File download URL;
- any other subscription URL, token, or query string that identifies an
  account;
- account IDs, invoice IDs, or dashboard cookies;
- real node hostnames that are not already public documentation hosts;
- real passwords, UUIDs, Reality public keys, or short IDs from a paid plan;
- traffic remaining, reset dates, or expiry dates copied from a live profile;
- Quantumult X backups (`.conf`, `.txt`, or app exports) that still contain
  the items above.

If a file might contain a live URL, do not "sanitize it later." Write a new
fictional fixture instead.

## Safe substitutions used in examples

Examples in this repository use only documentation placeholders:

| Kind | Placeholder |
| --- | --- |
| Domain | `example.com`, `example.net`, `example.org` |
| IPv4 | `192.0.2.10`, `198.51.100.20`, `203.0.113.30` (TEST-NET) |
| Password | `pwd`, matching the official Quantumult X samples |
| UUID | `00000000-0000-0000-0000-000000000000` |
| Reality pubkey / short ID | the published Quantumult X sample values |
| Resource URL in usage snippets | `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` |

Those values are not accounts. They will not connect to a paid node.

## What the parser is allowed to contain

The committed parser may contain:

- public Quantumult X scheme names (`anytls`, `shadowsocks`, …);
- public section names (`[server_local]`);
- public filter words such as `Traffic`, `Expire`, and `[Premium]`;
- error strings that name the parser.

It must not contain a default subscription URL, even as a commented example
with a real host.

## Local Quantumult X profile

Keep the private URL only in the local Quantumult X configuration on your
own device:

```ini
[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

When sharing a profile with yourself across devices, use Quantumult X's own
sync mechanism or a private store. Do not paste the profile into this
repository "temporarily."

## Review checklist before a commit

1. `git diff` contains no `http` URL except documentation hosts, GitHub, or
   jsDelivr paths for **this** public parser.
2. No line looks like a real node hostname from a provider dashboard.
3. Example passwords are `pwd` or other obvious fakes.
4. Screenshots, if any, hide the resource URL and traffic banner.

If a secret is committed, rotate the provider subscription immediately and
rewrite git history before treating the leak as closed. Prefer not to get
there.
