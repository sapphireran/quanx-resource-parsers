# Nexitally parser examples

These files are **synthetic**. They imitate a managed Quantumult X full configuration so the parser can be exercised without a private subscription URL.

| File | What it models | Expected parser output |
| --- | --- | --- |
| `full-config.sample.conf` | Full profile: AnyTLS nodes, quota rows, `[Premium]` placeholders, comments, a duplicate | `full-config.expected.txt` |
| `mixed-protocols.sample.conf` | Every protocol the parser keeps, plus an unsupported scheme | `mixed-protocols.expected.txt` |

## Run a sample through the parser

From the repository root, with Node.js 18+:

```bash
node test/harness.js examples/nexitally/full-config.sample.conf
```

The printed lines are what Quantumult X would store under `[server_remote]` after a successful parse. Compare them to the matching `*.expected.txt` file.

JSON mode is useful when a fixture is supposed to fail:

```bash
node test/harness.js --json test/fixtures/missing-server-local.conf
```

## What these samples deliberately include

- **Quota and expiry rows** whose `tag=` values contain `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, or `套餐`. The parser drops the whole line.
- **`[Premium]` in the node name.** Those entries are placeholders in Nexitally-style lists and are excluded.
- **Comment prefixes** `;`, `#`, and `//`, which Quantumult X treats as comments.
- **A duplicated server line.** The first copy is kept.
- **Sections other than `[server_local]`.** Policy, DNS, filters, and `[server_remote]` must not leak into the result.

## What these samples never include

- A real Nexitally download URL
- An account id, token, or live node password
- Someone else's subscription

When you test against a real download, keep that file on the device. Do not paste it into an issue, gist, or commit. See [Privacy and safety](../../docs/privacy-and-safety.md).
