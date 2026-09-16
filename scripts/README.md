# Personal scripts

Local Node helpers for the synthetic atlas. They are not loaded by Quantumult X.

| File | Role |
| --- | --- |
| `atlas.js` | Verify fixtures, print `$done` payloads, print keep/drop traces |
| `lib/qx-harness.js` | Inject `$resource` / `$done` and run the real parser file |
| `lib/nexitally-trace.js` | Independent trace that must stay identical to the parser |

```bash
npm test
node scripts/atlas.js trace examples/atlas/cases/days-left-spacing/input.conf
```

Quantumult X cannot `require()` these files. Device refreshes still use only `nexitally-node-parser.js`.
