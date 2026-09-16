# Local example runner

These scripts never download a subscription. They read files from
`examples/` and run the same extraction rules Quantumult X would run.

```bash
node scripts/check-examples.js
node scripts/run-parser.js examples/nexitally/managed-full-config.conf
node scripts/run-parser.js --json examples/nexitally/fixtures/missing-section.conf
```

`check-examples.js` also loads `nexitally-node-parser.js` inside a
`$resource` / `$done` sandbox so the Quantumult X entry path is covered, not
only the Node `require` export. It compares the Nexitally parser with
`examples/parser-template/resource-parser-template.js` so metadata filtering
stays an explicit Nexitally policy.
