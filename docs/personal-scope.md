# Personal scope

This repository is a personal Quantumult X toolkit. It exists so a Nexitally **full configuration** can be turned into a refreshable **server resource** without replacing the rest of a local profile.

## In scope

- The Quantumult X resource parser `nexitally-node-parser.js`.
- Documentation of that parser's keep / drop rules.
- Synthetic Quantumult X snippets that use only public example hosts and placeholder secrets from [Quantumult X `sample.conf`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf).
- A local Node harness that replays those snippets against the real parser file.

## Out of scope

- Company, employer, or client configuration of any kind.
- Live subscription URLs, account identifiers, invoices, or traffic balances.
- Real node hostnames, ports, passwords, UUIDs, Reality keys, or TLS pins from a paid plan.
- Social-media integrations, telemetry, or third-party account APIs.
- Changes that rewrite live Nexitally lines into a different protocol or rename nodes.

## Privacy rules

Keep the private Nexitally Quantumult X URL only in the local `[server_remote]` line on the device. Do not paste it into this repository, a public Gist, a screenshot, or a CDN cache.

The parser itself must stay free of:

- subscription URLs;
- account IDs;
- node passwords or UUIDs from a real plan;
- `subscription-userinfo` values.

`$resource.content` is supplied by Quantumult X at refresh time. The script never fetches the subscription itself.

## Why the examples are synthetic

Nexitally's download is a complete profile. Publishing even a redacted copy of a live download is a poor habit: leftover tags, check URLs, or policy names still identify an account. The atlas fixtures are invented Quantumult X text that follows the same *shape* as a managed full config.
