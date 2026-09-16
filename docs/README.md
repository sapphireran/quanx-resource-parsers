# Documentation

Personal notes for the Quantumult X parsers in this repository. The committed examples are fictional. Live Nexitally URLs stay on the device, or under `private/` locally.

| Document | What it covers |
| --- | --- |
| [Resource parser contract](resource-parser-contract.md) | `$resource` / `$done`, official limits, how this repo differs from a general subscription converter |
| [Nexitally node parser](nexitally-node-parser.md) | Extraction rules, supported prefixes, exclusions, errors |
| [Quantumult X server lines](quantumult-x-server-lines.md) | The server prefixes used in the fixtures |
| [Usage](usage.md) | Wire the parser into a stable local profile |
| [Privacy](privacy.md) | What this repo must never contain |
| [Troubleshooting](troubleshooting.md) | Empty node lists, missing section, AnyTLS versions, CDN cache |
| [Local harness](local-harness.md) | Replay fixtures with Node without Quantumult X |
| [Example catalog](examples-catalog.md) | Every fixture and the assertion it encodes |

Related paths:

- Parser: [`nexitally-node-parser.js`](../nexitally-node-parser.js)
- Fixtures and expected output: [`examples/`](../examples/)
- Profile snippets: [`examples/profiles/`](../examples/profiles/)
