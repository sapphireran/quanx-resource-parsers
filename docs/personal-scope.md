# Personal scope

This repository is a personal Quantumult X toolbox. It is not an employer project and it must not grow company configuration.

## What is in scope

- One resource parser that reads a **Nexitally-managed full Quantumult X configuration** and returns server lines.
- Notes that describe that parser's keep/drop contract.
- Invented fixtures so the contract can be replayed on a desktop without a subscription.

## What must never be committed

| item | why |
| --- | --- |
| The Nexitally subscription / configuration-download URL | It identifies the account. Quantumult X stores it in the local profile. |
| Account id, token, invoice, or traffic totals | Metadata, not a node. The parser already drops those rows. |
| Live node hostnames, ports, passwords, UUIDs | Those are credentials. Fixtures use `*.example.invalid` and official sample fields. |
| Employer or client Quantumult X profiles | Out of scope for this repo. |
| A dump of `$resource.link` | The parser is content-only. The bench throws if a script reads `link`. |

`.gitignore` already drops `*.local.conf`, `secrets/`, `tmp/`, and `scratch/`. If you export a real profile to inspect a parser change, keep the file off git.

## Content-only contract

Quantumult X downloads the private URL, then hands the UTF-8 body to the parser as `$resource.content`. The script in this repo:

- may read `$resource.content`;
- must not read `$resource.link`;
- must not `$notify` account details;
- must not persist storage (resource parsers do not get HTTP or `$prefs`).

The official sample parser is [resource-parser.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js).

## Hosting names

The canonical GitHub path is `sapphireran/quanx-resource-parsers`. jsDelivr and raw GitHub URLs in the README use that path. An older personal username used to host the same files; update any local profile that still points there.
