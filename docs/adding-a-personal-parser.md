# Adding another personal parser

Only do this for a second **personal** transform that Quantumult X cannot do with `opt-parser` off. Do not vendor a mega-parser and do not paste work code.

## Checklist

1. New file at repo root: `something-parser.js`, same ES5 style, same `$done` contract.
2. The file must not contain a subscription URL.
3. Docs: a short page under `docs/` describing the cut and the keep/drop rules, plus a link from `docs/README.md`.
4. Examples: a folder `examples/cases/<id>/` with synthetic input and expected output or error. Register it in `examples/catalog.json` with a `parser` field (default remains `nexitally-node-parser.js`).
5. `tools/qx-vm.js` already takes a script path; point the catalog at the new file.
6. If keep/drop reasons differ, add a classifier next to `tools/classify.js` rather than overloading Nexitally needles.
7. `npm test` (`node tools/check.js`) must pass.
8. README: one paragraph, not a second product pitch.

## Quantumult X constraint

There is still **one** `resource_parser_url`. Two parsers on one phone means two profiles, or a single dispatcher script that branches on `$resource.tag`. A dispatcher is easy to get wrong; prefer two profiles if the second transform is rare.

## What not to add

- Fetching. Resource parsers cannot.
- Base64 / protobuf Clash decoders copied from random gists without reading them.
- Anything that needs Node `require`, `fs`, or `fetch`.
