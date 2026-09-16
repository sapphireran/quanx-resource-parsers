# Scripts

Node helpers that pretend to be Quantumult X just enough to run the personal parsers on a computer.

| File | Purpose |
| --- | --- |
| `run-parser.js` | Load a parser, inject `$resource` / `$done`, print the result |
| `check-examples.js` | Walk `examples/*/manifest.json` and compare fixtures |

There are no npm packages to install. From the repository root:

```bash
node scripts/check-examples.js
node scripts/run-parser.js nexitally-node-parser.js examples/nexitally/fixtures/happy-path.conf
node scripts/run-parser.js --json nexitally-node-parser.js examples/nexitally/fixtures/missing-section.conf
```

`package.json` maps `npm test` and `npm run check-examples` to the checker.

Details: [`docs/local-verification.md`](../docs/local-verification.md).
