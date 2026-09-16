# Replay studio

Local stand-in for Quantumult X's resource-parser sandbox. It evaluates `nexitally-node-parser.js` against sanitized fixtures and prints the keep/drop reason codes from [handbook/04-keep-drop-reason-codes.md](../handbook/04-keep-drop-reason-codes.md).

```bash
npm test
node studio/replay.js explain managed-full-profile
node studio/replay.js why "anytls=example.com:443, password=pwd, tag=HK-Reset-01"
```

Open [report/gallery.html](report/gallery.html) after `node studio/replay.js report` for a static table of every case.

Fixtures use official Quantumult X sample hosts and secrets only. The private Nexitally URL is never fetched.
