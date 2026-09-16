# Troubleshooting

Work down this list. Most failures are wiring, not regex.

## Resource shows the parser error about `[server_local]`

The body Quantumult X downloaded is not a QX full configuration.

| Likely body | What to do |
| --- | --- |
| HTML / login page | The private URL expired or needs a cookie Quantumult X does not send. Open the URL in a throwaway browser **on the phone’s copy-out flow you already use**, then paste a fresh URL only into `[server_remote]`. |
| Clash YAML (`proxies:`) | Wrong download format in the provider dashboard. Pick Quantumult X, not Clash. |
| SIP002 / `vmess://` list | Same — need the QX full config. |
| Server lines with no `[server_local]` | The parser cannot see a section. Either wrap them (not this script’s job) or use a server-only resource without `opt-parser`. |
| Servers only under `[server_remote]` | The cut looks for `[server_local]` specifically. |

Replay a saved body (redact hosts first):

```bash
node tools/ledger.js /path/to/redacted.conf
```

## Resource shows “no usable server entries”

`[server_local]` existed but every line was blank, comment, unsupported, info, or `[Premium]`.

Open the receipt. If every real node is `DROP_INFO` because tags contain `Reset` or `Traffic`, that is the substring trap documented in [extraction-ledger.md](extraction-ledger.md). Do not rename live nodes in git examples; rename them only in a private local override if you must.

## Nodes refresh but policy is empty / wrong

The parser did its job; the profile’s `[policy]` does not select the resource.

- `resource-tag-regex` must match the `[server_remote]` `tag=` (`Nexitally` vs `nexitally` is regex-sensitive unless you write both).
- After replacing a full Nexitally profile once, local groups may have been overwritten. Re-apply [`examples/profile/03-policy-kept-local.snippet.conf`](../examples/profile/03-policy-kept-local.snippet.conf).

## Other remote resources started failing after setting `resource_parser_url`

Quantumult X has one parser. Anything else with `opt-parser=true` is now running **this** Nexitally script. Turn `opt-parser` off on Clash/Surge resources, or stop using this as the global parser.

## AnyTLS lines missing on an older app build

The parser **keeps** `anytls=` lines. An old Quantumult X that does not speak AnyTLS will still *store* them and then fail to connect. Upgrade the app; do not strip AnyTLS in the parser.

## Duplicates remain

Dedup is exact-line. `tag=JP-A` and `tag=JP-A ` after trim are the same; `tag=JP-A` and `tag=JP-A-backup` are not.

## BOM / CRLF from a Windows paste

The script strips a leading BOM and maps CRLF → LF before the section regex. `examples/cases/bom-crlf` wraps a LF fixture with both at check time.

## Parser URL 404

The historical jsDelivr path under `pang990801/quanx-resource-parsers` may 404 depending on which GitHub user jsDelivr hashed. Prefer:

```text
https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```
