# Personal operator handbook

Working notes for this personal Quantumult X parser repo. Nothing here is company configuration.

The committed parser turns a **managed full Quantumult X profile** into a **server-only resource**. Quantumult X downloads the private URL on the device. The script only sees `$resource.content`.

| Chapter | Topic |
| --- | --- |
| [01](01-personal-scope.md) | What belongs in this public repo |
| [02](02-why-a-server-resource.md) | Why not re-download the vendor profile |
| [03](03-qx-runtime-contract.md) | Official `$resource` / `$done` contract |
| [04](04-keep-drop-reason-codes.md) | Keep / drop codes the studio prints |
| [05](05-line-grammar.md) | Server-line prefixes this parser accepts |
| [06](06-device-wiring.md) | Local `[general]` + `[server_remote]` wiring |
| [07](07-replay-studio.md) | Local replay without a phone |
| [08](08-troubleshooting.md) | Device symptoms → fixture to replay |
| [09](09-adding-another-personal-parser.md) | Checklist for a second *personal* parser |
| [10](10-zh-速查.md) | Short Chinese index |

Replay every claim against a sanitized fixture:

```bash
npm test
node studio/replay.js explain managed-full-profile
```
