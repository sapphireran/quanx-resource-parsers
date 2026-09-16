# Private local files

Put real Quantumult X profiles, Nexitally download bodies, and subscription URLs here.

This directory is gitignored except for this README. The committed examples under `examples/fixtures/` are fictional. Do not copy a live `[server_local]` dump into `examples/`.

Suggested names:

```text
private/nexitally-latest.conf
private/stable-profile.local.conf
```

Parse a private file without publishing it:

```bash
node scripts/run-parser.js private/nexitally-latest.conf
```
