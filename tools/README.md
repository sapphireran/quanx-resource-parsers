# Tools

Local replay of `nexitally-node-parser.js`. These scripts never download a subscription. They exist so the fixtures in `examples/cases/` can be checked without Quantumult X.

| File | Role |
| --- | --- |
| `qx-vm.js` | `vm` sandbox with `$resource` / `$notify` / `$done` |
| `classify.js` | Keep/drop receipt; regexes must stay in the parser source |
| `ledger.js` | Print one receipt as JSON |
| `check.js` | Catalog + secret scan + invariants |
| `secrets.js` | Fail the check if a live-looking URL or key lands in git |
| `gallery.js` | Build `examples/gallery.html` |
| `seed-cases.js` | Regenerate fixture inputs from the in-script corpus |

```bash
node tools/check.js
node tools/check.js --write-expected --write-receipts --write-gallery
node tools/ledger.js examples/cases/typical-managed-full/input.conf
```

The sandbox must not grow `require`, `fs`, or `fetch`. If the parser starts needing those, it will break on the phone.
