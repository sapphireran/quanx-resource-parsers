# Examples index

Personal, synthetic Quantumult X snippets for this repository. Nothing here is a live subscription.

## Nexitally parser input / output

See [examples/nexitally/README.md](../examples/nexitally/README.md).

These files are the ones `npm test` parses. If you change the parser, update the `*.expected.txt` files in the same change.

## Wiring the parser into a local profile

See [examples/quantumult-x/README.md](../examples/quantumult-x/README.md).

| File | Copy into |
| --- | --- |
| `general-parser.snippet` | `[general]` |
| `server-remote.snippet` | `[server_remote]` |
| `policy-groups.snippet` | `[policy]` |
| `local-profile-skeleton.conf` | A new or existing local profile (placeholders only) |

Replace `<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>` with the URL Quantumult X should download. Never commit that replacement.

## Background reading

- [Resource-parser runtime](resource-parser-runtime.md)
- [Nexitally workflow](nexitally-workflow.md)
- [Keep vs drop](parser-keep-drop.md)
- [Privacy and safety](privacy-and-safety.md)
- [Troubleshooting](troubleshooting.md)
- [Local testing](local-testing.md)
