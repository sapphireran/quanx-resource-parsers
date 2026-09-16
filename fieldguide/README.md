# Personal field guide

This folder is a **source-faithful companion** for the one parser in this personal repository: `nexitally-node-parser.js`.

It is not a second parser. It does not change Quantumult X behavior. It records, in writing and in replayable fixtures, what the existing script already does when a managed **full configuration** lands in `$resource.content`.

| Note | Where |
| --- | --- |
| What this repo will and will not hold | [01-personal-scope.md](01-personal-scope.md) |
| Why a server resource exists at all | [02-the-nexitally-problem.md](02-the-nexitally-problem.md) |
| `$resource` / `$done` contract | [03-qx-resource-contract.md](03-qx-resource-contract.md) |
| Line-by-line reading of the parser | [04-source-walkthrough.md](04-source-walkthrough.md) |
| Keep / drop rules and false-friend traps | [05-keep-drop-and-false-friends.md](05-keep-drop-and-false-friends.md) |
| Wiring it on a personal device | [06-device-setup.md](06-device-setup.md) |
| Replaying fixtures on a laptop | [07-local-replay.md](07-local-replay.md) |
| What the two error strings mean | [08-troubleshooting.md](08-troubleshooting.md) |
| Adding another *personal* parser later | [09-adding-another-parser.md](09-adding-another-parser.md) |
| 中文速查 | [zh-速查.md](zh-速查.md) |
| One-page pipeline sketch | [pipeline.html](pipeline.html) |

Sanitized inputs and expected outputs live in [`../examples`](../examples). Run them with:

```bash
node scripts/verify.js
node scripts/replay.js examples/fixtures/managed-full-profile/input.conf --annotate
```

The replay scripts never download a subscription. They only read files you already have on disk.
