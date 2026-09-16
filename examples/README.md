# Examples

Personal, sanitized examples for the parsers in this repository.

| Directory | What it covers |
| --- | --- |
| [`nexitally/`](nexitally/) | Fixture Quantumult X documents and expected parser output |
| [`quantumult-x/`](quantumult-x/) | Local profile snippets that attach the parser |

Nothing in these directories is a live subscription. Hosts end in `example.invalid`. The token `YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL` is a placeholder and must remain one in git.

```bash
node scripts/check-examples.js
```

See [security notes](../docs/security.md) before adding a new file.
