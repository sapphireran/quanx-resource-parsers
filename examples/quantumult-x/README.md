# Quantumult X wiring examples

Snippets for a **local** Quantumult X profile. They show how this repository's parser is attached to a private Nexitally full-configuration URL.

Copy the structure, not the placeholder URL. The string `YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL` must stay a placeholder in git.

| File | Purpose |
| --- | --- |
| [`general-resource-parser.conf`](general-resource-parser.conf) | `[general]` lines that register a custom resource parser |
| [`server-remote-nexitally.conf`](server-remote-nexitally.conf) | `[server_remote]` row with `opt-parser=true` |
| [`keep-local-policy.conf`](keep-local-policy.conf) | Local `[policy]` that continues to select Nexitally nodes by tag |
| [`full-local-profile.snippet.conf`](full-local-profile.snippet.conf) | Minimal local profile that combines the pieces |

Related: [Nexitally workflow](../../docs/nexitally.md) and [parser contract](../../docs/parser-contract.md).
