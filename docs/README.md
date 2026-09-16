# Docs

Personal notes for the Quantumult X parsers in this repository.

| Page | Contents |
| --- | --- |
| [Architecture](architecture.md) | How the Nexitally parser turns a full profile into server lines |
| [Quantumult X setup](quantumult-x-setup.md) | `resource_parser_url`, `opt-parser=true`, refresh |
| [Hash parameters](hash-parameters.md) | `#in=` / `#out=` / `#regex=` / `#regout=` |
| [Privacy](privacy.md) | Subscription URLs stay on-device |
| [Local testing](local-testing.md) | `npm test` and `tools/run-parser.js` |
| [Troubleshooting](troubleshooting.md) | Common Quantumult X failures |
| [Writing a parser](writing-a-parser.md) | Checklist for another single-purpose script |
| [Example walkthrough](examples-walkthrough.md) | Line-level reading of the synthetic full profile |

Synthetic configs live in [`examples/`](../examples/README.md). Run them with
Node; do not paste a live Nexitally download into git.
