# Personal docs

These notes are for the personal Quantumult X parsers in this repository. They describe how the parsers behave, how to wire them into a local profile, and how to check the checked-in examples without opening Quantumult X.

Nothing here is a provider support document. The Nexitally subscription URL, account identifier, and node credentials stay in your local Quantumult X configuration only.

## Start here

| Document | When to read it |
| --- | --- |
| [Resource parser contract](resource-parser-contract.md) | You want the Quantumult X `$resource` / `$done` surface this repo depends on. |
| [Nexitally node parser](nexitally.md) | You want to keep a stable personal profile and refresh only Nexitally servers. |
| [Examples catalog](../examples/README.md) | You want synthetic fixtures and expected parser output. |
| [Troubleshooting](troubleshooting.md) | A resource refresh failed, nodes vanished, or the whole profile was overwritten. |
| [Writing another personal parser](writing-parsers.md) | You want to add a second personal parser without copying private data into the repo. |
| [Privacy rules](privacy.md) | You are about to commit, paste a config, or host a Gist. |

## Local checks

The parsers themselves are Quantumult X scripts. The Node harness in `scripts/` only exists so the examples can be verified on a laptop or in CI:

```bash
node scripts/verify-examples.js
```

That command does not download any subscription. It feeds the synthetic files under `examples/` into `nexitally-node-parser.js` and compares the result with the checked-in expected output.

## Official Quantumult X references

These are the upstream documents the personal notes summarize. Prefer them when Quantumult X behavior changes:

- [Official sample configuration](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample.conf)
- [Official sample resource parser](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js)
- [Parser helper protocol](https://github.com/crossutility/Quantumult-X/blob/master/parser-helper-protocol.md) (parameterized UI, Quantumult X v1.5.6+)
