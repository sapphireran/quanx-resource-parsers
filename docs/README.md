# Personal docs

Notes for running and extending the Quantumult X parsers in this repository. This is a personal project. Nothing here is company documentation, and nothing here should contain a live subscription URL, account identifier, or node password.

## Contents

| Document | What it covers |
| --- | --- |
| [resource-parsers.md](resource-parsers.md) | How Quantumult X resource parsers work: `$resource`, `$done`, `opt-parser`, and the limits of the parser sandbox |
| [nexitally-parser.md](nexitally-parser.md) | Design of `nexitally-node-parser.js`: section extraction, protocol allow-list, traffic/placeholder filters, and duplicate removal |
| [privacy.md](privacy.md) | What this repository may contain and what must stay only in a local Quantumult X profile |
| [compatibility.md](compatibility.md) | Protocols, Quantumult X versions, and AnyTLS notes |
| [troubleshooting.md](troubleshooting.md) | Common refresh errors and how to isolate them without pasting a real subscription |
| [personal-workflow.md](personal-workflow.md) | A local-only workflow: import a stable profile, attach the parser, refresh servers, keep policy and filters local |

Companion fixtures live in [`../examples/`](../examples/README.md). Run them with:

```bash
node examples/run-fixtures.js
```

Those fixtures use only documented Quantumult X sample hosts (`example.com`, `apple.com`, `192.168.1.1`) and placeholder secrets from the official sample configuration. They are not a Nexitally subscription.
