# Examples

Fictional Quantumult X inputs and the exact `$done` payloads `nexitally-node-parser.js` must produce.

```text
examples/
  cases.json                 case list used by scripts/check-examples.js
  fixtures/                  managed-profile bodies (placeholders only)
  expected/*.servers         $done({content})
  expected/*.error           $done({error})
  profiles/                  stable local profile snippets, not parser input
  walkthrough.md             full-config replay
```

```bash
node scripts/run-parser.js examples/fixtures/nexitally-full-config.conf
npm run examples
```

Do not replace a fixture with a live Nexitally download. Use `private/` for that. Catalog: [docs/examples-catalog.md](../docs/examples-catalog.md).
