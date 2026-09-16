# Personal docs

This folder is the operator notebook for a **personal** Quantumult X setup. Nothing here is company software, a product, or a subscription service.

Start here:

| Doc | What it is for |
| --- | --- |
| [personal-scope.md](personal-scope.md) | What this repo will and will not contain |
| [why-a-server-resource.md](why-a-server-resource.md) | Why a parser exists instead of re-downloading a full profile |
| [qx-resource-parser-contract.md](qx-resource-parser-contract.md) | `$resource` / `$done` as Quantumult X actually implements it |
| [extraction-ledger.md](extraction-ledger.md) | Line-by-line keep / drop rules for `nexitally-node-parser.js` |
| [device-wiring.md](device-wiring.md) | How to attach the parser on a phone without replacing `[policy]` |
| [keep-drop-receipts.md](keep-drop-receipts.md) | How the local ledger tools explain a parse |
| [troubleshooting.md](troubleshooting.md) | Failures that look like “the parser is broken” |
| [privacy.md](privacy.md) | What must never land in git |
| [adding-a-personal-parser.md](adding-a-personal-parser.md) | Checklist if a second personal parser is added later |
| [zh-cheatsheet.md](zh-cheatsheet.md) | 中文速查 |

Runnable examples live in [`../examples/`](../examples/README.md). The Node ledger in [`../tools/`](../tools/README.md) replays the **real** parser file inside a Quantumult X–shaped `$resource` / `$done` sandbox. It never downloads a subscription.
