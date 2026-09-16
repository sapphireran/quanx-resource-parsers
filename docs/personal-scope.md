# Personal scope

This repository belongs to a single Quantumult X user. It stores:

- resource-parser scripts that run **on device**, after Quantumult X has already fetched a private URL;
- documentation of that on-device transform;
- **synthetic** Quantumult X snippets used to explain and regression-check the transform.

It does not store:

- a Nexitally (or any other provider) subscription URL, token, or account id;
- live node hostnames, ports that identify a real deployment, or real passwords;
- company source code, internal docs, or work configuration;
- a general-purpose subscription converter meant to replace [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX) `resource-parser.js`.

## Why a tiny parser instead of a mega-parser

The official-style mega parsers take Clash / Surge / QX / SIP002 input and emit QX. This script does one job: given a **full Quantumult X configuration** that already uses QX server syntax, copy the usable `[server_local]` lines into a `[server_remote]` body.

That job is small on purpose. A mega-parser is the wrong layer if the provider already speaks Quantumult X.

## What “personal” means for files

| Kind | Allowed in git | Notes |
| --- | --- | --- |
| Parser script | Yes | Must not embed a fetch URL |
| Docs | Yes | Use placeholders |
| Example configs | Yes | Hosts under `*.example.test` or RFC 3849/5737 docs ranges |
| Example passwords | Yes | `pwd`, `placeholder`, or the UUID from Quantumult X’s public `sample.conf` |
| Reality pubkey | Yes | Only the sample value from Quantumult X’s public `sample.conf` |
| Private Nexitally URL | **No** | Stays in the on-device `[server_remote]` line |
| `subscription-userinfo` dumps | **No** | That header is account-shaped |

`tools/check.js` secret-scans the tree on every run. A leak fails the check the same way a wrong fixture does.
