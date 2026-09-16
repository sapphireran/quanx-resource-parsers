# Personal contributions

This repository is Sapphire's **personal** Quantumult X parser kit.

Do not open a pull request that includes:

- employer or client configuration;
- a live Nexitally (or any other provider) subscription URL;
- node passwords, UUIDs, or account identifiers from a real profile;
- traffic totals, expiry dates, or user IDs copied from a paid dashboard.

Worked examples in `workbook/` must stay on documentation hosts (`*.example.invalid`, `example.com`, `192.0.2.0/24`, `2001:db8::/32`) and documentation secrets (`example-password`, the reserved UUID in the field notes).

```bash
npm test
```

That runs the workbook against `nexitally-node-parser.js` and a conservative secrets scan. Add a case by extending `workbook/cases.cjs`, then run `npm run materialize` so the on-disk `workbook/cases/<id>/` tree stays in sync.
