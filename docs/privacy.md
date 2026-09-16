# Privacy rules for this repository

This is a personal public GitHub repository. Treat every commit as world-readable.

## Never commit

- The Nexitally **Configuration File → Download** URL, or any other subscription URL that identifies an account.
- Account ids, dashboard cookies, invoice mail, or payment screenshots.
- A real Quantumult X profile exported from the device.
- Node hostnames, ports, passwords, UUIDs, Reality public keys, or short ids that came from a live subscription.
- `[mitm]` hostnames, rewrite tokens, or filter lists that are not already public.
- Company configuration, internal hostnames, or anything that is not a personal Quantumult X snippet.

The parser script itself contains none of those values. Keep it that way.

## Safe stand-ins

Use these in examples and docs:

| Kind | Stand-in |
| --- | --- |
| Host | `*.nodes.example.invalid` or `example.com` from the official sample |
| Password | `pwd` |
| UUID | `23ad6b10-8d1a-40f7-8ad0-e3e35cd32291` (official sample) |
| Reality pubkey / short id | The pair published in `crossutility/Quantumult-X` `sample.conf` |
| Subscription URL | `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` |

`example.invalid` is reserved for documentation. It will not resolve on a public network.

## Where the real URL lives

The private Nexitally URL belongs in the on-device `[server_remote]` line only. Quantumult X fetches it. The parser runs on the response. jsDelivr / GitHub serve the parser script, not the subscription.

A Gist, iCloud note shared publicly, screenshot, or chat paste of that URL is the same leak as committing it here.

## Reviewing a change

Before pushing:

1. `rg -n "http" examples docs README.md` and confirm every URL is a documentation placeholder, jsDelivr of this repo, or an official Quantumult X sample.
2. Confirm no `nexitally.com` (or current dashboard host) query strings appear.
3. Run `npm test`. Fixtures must stay fictional.

If a real profile is pasted into a fixture by mistake, rotate the Nexitally subscription credentials and rewrite the file before the next push.
