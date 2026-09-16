# Troubleshooting

Work through these checks on the device first. If you need to change the parser, reproduce the failure with a sanitized fixture instead of exporting a live subscription.

## Parser never runs

Symptoms: the Nexitally resource imports a wall of `[general]` / `[policy]` text, or Quantumult X shows the raw configuration as servers.

1. Confirm `[general]` contains `resource_parser_url` pointing at this repository's `nexitally-node-parser.js`.
2. Confirm the resource line includes `opt-parser=true`.
3. Confirm you did not later replace `resource_parser_url` with a different community parser. Quantumult X has only one parser slot.
4. Force-refresh **Server Resources → Nexitally**. A parser URL change is not always picked up until the resource is updated.

The official sample configuration documents `opt-parser=true` on the `[server_remote]` line, not as a global default.

## `[server_local] section was not found`

The downloaded body did not contain a `[server_local]` header that the regex recognizes.

Typical causes:

| Cause | What to check |
| --- | --- |
| The URL is a server-only snippet already | You do not need this parser. Remove `opt-parser=true` |
| The URL is an HTML login page or a dashboard | The private configuration-download URL is wrong or expired. Fix it only in the local profile |
| The URL is Clash YAML / a URI list | This parser does not convert those formats |
| The section is named `[servers]` or `[Proxy]` | Not Quantumult X native. Do not add those names without a fixture |
| You tested a truncated paste that starts mid-file | Include the `[server_local]` header in the fixture |

Reproduce with `examples/fixtures/missing-server-local.conf`.

## `no usable server entries were found`

The header exists, but every line was a comment, an unknown prefix, a traffic/placeholder row, or a duplicate of a dropped line.

Typical causes:

| Cause | What to check |
| --- | --- |
| The section is only quota rows (`Traffic`, `到期`, `套餐`) | The subscription may be empty or expired. That is an account issue, not a parser bug |
| Nodes are URI lines (`ss://`, `vmess://`) | Out of scope. See [compatibility.md](compatibility.md) |
| Nodes use an unsupported prefix (`hysteria2=`, `tuic=`) | Add a fixture and an allow-list entry only if Quantumult X actually accepts that prefix |
| Every node tag contains `Traffic` or `[Premium]` | The exclusion regex is working as designed. Rename is a provider-side or local-fork change |

Reproduce with `examples/fixtures/only-traffic-and-premium.conf`.

## Nodes refresh but policy is empty

The parser succeeded; the local policy groups did not select the new tags.

- `resource-tag-regex` must match the **resource** `tag=` (for example `^Nexitally`), not a node name.
- `server-tag-regex` matches each server's `tag=` field.
- After the first import, open the policy and confirm candidates appear. A typo in the regex looks like "parser returned nothing."

See `examples/local-profile.sample.conf`.

## Duplicate nodes

The parser only collapses **identical** trimmed lines. Two lines that differ by a trailing space after trim will not collide (trim already ran). Two lines that differ by `udp-relay=true` versus `udp-relay=false` are different servers.

If Quantumult X still shows doubles, the second copy is usually:

- the same host still sitting in local `[server_local]` from an old full-config import, or
- a second `[server_remote]` line pointing at a similar URL

Remove the leftover local copies. Do not ask the parser to delete servers it never saw.

## AnyTLS lines appear but will not connect

The parser is a filter, not a protocol stack.

1. Confirm the Quantumult X build includes AnyTLS (v1.5.6+).
2. Confirm Reality nodes are not combined with TCP Fast Open. Official notes say the Reality Client Hello can exceed 1500 bytes.
3. Do not add `udp-over-tcp=` to AnyTLS; the official sample says AnyTLS already carries UDP over TCP.

## Refresh interval feels wrong

`update-interval=21600` is six hours. `86400` is the Quantumult X default (one day). A negative interval disables automatic sync. Manual refresh always works regardless of the interval.

## How to capture a failure without leaking the subscription

1. In Quantumult X, note only the parser error string.
2. Recreate the smallest input that should produce that error, using `example.com` and `password=pwd`.
3. Drop it in `examples/fixtures/`, add `examples/expected/`, and register it in `examples/manifest.json`.
4. Run `node examples/run-fixtures.js`.

If you cannot recreate it, the live body is probably HTML, YAML, or a URI list. Describe the **format**, not the contents.

## Fixture runner failures

```text
node examples/run-fixtures.js
```

| Runner message | Meaning |
| --- | --- |
| `$done was not called` | The parser threw or the script was edited into a function that returns instead of calling `$done` |
| `expected error … got content` | The fixture should have failed the section/filter checks |
| `content mismatch` | Extraction changed. Read the diff in the runner output before "fixing" the expected file — you may have a real regression |

The runner executes `nexitally-node-parser.js` in a Node `vm` sandbox. It does not download anything and it does not need Quantumult X.
