# Personal scope

This repository is a personal Quantumult X toolbox. It exists so a **stable local profile** can refresh Nexitally nodes without importing Nexitally's entire managed configuration over the top of that profile.

## In scope

- One resource parser: `nexitally-node-parser.js`.
- Documentation of that parser's actual regular expressions and `$done` results.
- Synthetic Quantumult X snippets that use `*.example.test` hosts and documented placeholder secrets.
- A Node replay that mocks `$resource` / `$done` so the fixtures can be checked without an iPhone.

## Out of scope

- Company repositories, company profiles, company filter lists, or any workplace device configuration.
- Live Nexitally (or any other provider) subscription URLs, account IDs, tokens, or node passwords.
- A general-purpose Clash / Surge / Shadowrocket converter. That is a different project. This parser only understands Quantumult X `[server_local]` text.
- Changing keep / drop rules in this pull request. The field guide and examples **lock current behavior**, including the awkward bits.

## What must never be committed

| Kind | Why |
| --- | --- |
| The private full-configuration URL from Nexitally's panel | It is an account credential in URL form. |
| Real node hostnames, ports that identify a paid slot, or real passwords | They are account material. |
| `subscription-userinfo` dumps from a live download | Traffic and expiry numbers identify an account. |
| A full personal Quantumult X profile from a device | It usually contains the URL above plus policy and MitM material. |

The on-device `[server_remote]` line should keep using the placeholder `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>`. Replace it only in the local profile that never leaves the phone.

## Why the examples still contain `password=`

Quantumult X server lines are not valid without a password field. Fixtures use values copied from the [official Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) (`pwd`, the sample UUID, the sample Reality pubkey) or the literal `placeholder-password`. None of those values point at a live service in this repository.
