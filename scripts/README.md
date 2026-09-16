# Scripts

Desktop helpers for the personal Quantumult X parsers. They do not run inside the app.

| File | Role |
| --- | --- |
| `lib/quanx-resource-parser.js` | `vm` sandbox that supplies `$resource` and `$done` |
| `run-nexitally-parser.js` | Print parsed server lines or an error for one file |
| `test-nexitally-parser.js` | Walk `examples/nexitally/cases.json` |

```bash
node scripts/run-nexitally-parser.js examples/nexitally/typical-full-config.conf
node scripts/test-nexitally-parser.js
```

See [docs/local-testing.md](../docs/local-testing.md).
