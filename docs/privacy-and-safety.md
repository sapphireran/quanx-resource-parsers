# Privacy and safety (personal repo)

This repository is public. Treat every commit as readable by anyone.

## Never commit

- Nexitally (or any provider) subscription URLs
- Account IDs, tokens, cookies, or invoice numbers
- Real node hostnames, IPs, ports tied to a live account
- Real passwords, UUIDs, Reality public keys, or short IDs from a live node
- Screenshots of Quantumult X that show those values
- MITM CA material, `hostname` decrypt lists tied to personal accounts
- Company configuration, internal hostnames, or work device IDs

The parser script itself contains none of that. Keep it that way.

## How examples stay fake

Fixtures under `examples/` use:

| Kind | Convention |
| --- | --- |
| Hosts | `*.example.test`, `example.com` |
| Passwords | `example-password-not-real` |
| UUIDs | RFC 4122-looking values with `00000000-` prefixes |
| Reality material | The same public sample strings Quantumult X uses in `sample.conf` |
| Tags | Region codes like `HK-01`, never account emails |

If a real configuration is used to debug a parser change, redact it **before**
it touches the working tree. Do not rely on `.gitignore` after the fact; if it
was staged, assume it leaked.

## Parser URL vs subscription URL

These two URLs are easy to mix up:

| URL | Public? | Where it lives |
| --- | --- | --- |
| Parser script (`nexitally-node-parser.js`) | Yes | README, `resource_parser_url` |
| Nexitally full-configuration download | No | Only on the device, in `[server_remote]` |

The parser URL may be jsDelivr or GitHub raw. The subscription URL must not.

## Issue reports and Gists

When asking for help, paste:

- The parser error string
- A redacted `[server_local]` excerpt with fake hosts
- Quantumult X version

Do not paste the full managed profile. Provider files often embed traffic
lines that identify the account.

## What the parser is not

This is not a traffic-circumvention guide, not a new protocol client, and not
a company tool. It rewrites text that Quantumult X already downloaded so the
local profile can keep its own filters and policies.

Do not add:

- Automatic subscription fetchers
- Credential storage
- Scripts that log `$resource.link`
- Copies of other people's full parser stacks unless they are personally
  maintained in this repo
