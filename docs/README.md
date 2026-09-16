# Docs

Personal notes for the Quantumult X resource parsers in this repository. They describe how Quantumult X calls a parser, what `nexitally-node-parser.js` actually does, and how to keep private subscription data off GitHub.

This is not vendor documentation. For the product itself, start from the official sample files:

- [sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf)
- [resource-parser.js](https://github.com/crossutility/Quantumult-X/blob/master/resource-parser.js)
- [server-complete.snippet](https://github.com/crossutility/Quantumult-X/blob/master/server-complete.snippet)

## Contents

| Page | Use it when |
| --- | --- |
| [Quantumult X resource parser API](quantumult-x-resource-parser-api.md) | You need the `$resource` / `$done` contract, version gates, or the difference between this focused parser and a general-purpose one |
| [Nexitally node parser](nexitally-node-parser.md) | You want the extract → filter → dedupe pipeline, the regular expressions, and the documented caveats |
| [Troubleshooting](troubleshooting.md) | A resource refresh fails, nodes vanish, or a full configuration overwrites the local profile |
| [Privacy](privacy.md) | You are about to commit, screenshot, or paste a Quantumult X profile |

Worked inputs and outputs live in [`examples/`](../examples/README.md). Run them with `npm test`.
