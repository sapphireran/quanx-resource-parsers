# Quantumult X profile snippets

Copy these into a **local** Quantumult X profile. They assume you already have working filters and rewrites. Only the parser URL is public; the Nexitally configuration URL stays on the device.

Step-by-step: [Nexitally workflow](../../docs/nexitally-workflow.md).

## Files

| File | Section |
| --- | --- |
| [general-parser.snippet](general-parser.snippet) | `[general]` — install `nexitally-node-parser.js` |
| [server-remote.snippet](server-remote.snippet) | `[server_remote]` — download + parse |
| [policy-groups.snippet](policy-groups.snippet) | `[policy]` — select parsed nodes by resource tag |
| [local-profile-skeleton.conf](local-profile-skeleton.conf) | Minimal profile that combines the three snippets |

## After pasting

1. Replace the placeholder URL. The real value looks like a vendor configuration download, not a GitHub link.
2. Save the profile in Quantumult X.
3. Open **Server Resources**, select **Nexitally**, update.
4. Confirm the resource lists node tags (for example `HK-01`) rather than `[general]` / `[policy]` headers.
5. Send a request through the `Nexitally` policy group.

## What not to copy from Nexitally’s full file

- Their `[policy]` (it will fight your groups)
- Their `[filter_remote]` unless you explicitly want that baseline
- MITM hostnames you did not generate
- `resource_parser_url` pointing at a different community parser, unless you really mean to replace this one

Quantumult X allows only one `resource_parser_url`. If you already use KOP-XIAO’s parser for Clash subscriptions, you cannot also load `nexitally-node-parser.js` as a second parser. In that situation either convert Nexitally some other way, or keep this parser and convert other subscriptions elsewhere.
