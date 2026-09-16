# Documentation

Personal notes and references for the Quantumult X resource parsers in this repository. Nothing here is a provider document, and nothing here should include a private subscription URL.

| Document | What it covers |
| --- | --- |
| [Resource parser API](resource-parser-api.md) | Official Quantumult X parser globals, return values, and constraints |
| [Nexitally parser](nexitally-parser.md) | How `nexitally-node-parser.js` extracts `[server_local]` |
| [Workflow](workflow.md) | End-to-end setup that keeps an existing local Quantumult X profile |
| [Troubleshooting](troubleshooting.md) | Common Quantumult X errors and how to isolate them |
| [Writing a parser](writing-a-parser.md) | Conventions for another full-config extractor in this repo |
| [Privacy](privacy.md) | What never to commit, paste, or host |
| [Compatibility](compatibility.md) | Quantumult X versions and protocol prefixes |
| [Server line reference](qx-server-line-reference.md) | Sanitized Quantumult X server-line shapes the parser accepts |

Runnable fixtures live in [`../examples`](../examples/README.md). Run them with:

```bash
node examples/run-parser.js
```
