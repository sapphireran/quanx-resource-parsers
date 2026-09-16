# Troubleshooting the Nexitally parser

Symptoms below assume the parser URL is in `[general]` and the private Nexitally full-configuration URL is a `[server_remote]` row with `opt-parser=true`.

## Resource shows `[server_local] section was not found`

Quantumult X downloaded something that is not a full Quantumult X profile, or the profile has no `[server_local]` block.

Check:

- The URL is **Configuration File → Download**, not a Clash / Surge / SIP002 link.
- The download is not an HTML login page. Open the URL on the phone's browser once; a profile starts with `[general]` or a comment, not `<!DOCTYPE`.
- The body is not gzip/binary. Quantumult X should decode HTTP content-encoding before `$resource.content`. If a desktop dump looks like binary, the URL is wrong.

The `examples/nexitally/missing-server-local.conf` fixture reproduces this error.

## Resource shows `no usable server entries were found`

The `[server_local]` section exists but every line was a comment, an unsupported scheme, a quota / `[Premium]` row, or a duplicate of a dropped set.

Check:

- Quantumult X is new enough for AnyTLS if the nodes are `anytls=`.
- Info banners (`Traffic`, `Expire`, `流量`, `套餐`, …) are not the only rows.
- A plan-upgrade placeholder tagged `[Premium]` is not the only remaining node.

Desktop: run the saved body through the harness (still do not commit it):

```bash
node scripts/run-nexitally-parser.js /path/to/local-copy.conf
```

## Nodes refresh but policy / filters change

The parser is not attached (`opt-parser` is missing or `resource_parser_url` is empty) and Quantumult X imported the full managed profile as if it were a server list. Confirm the `[server_remote]` line includes `opt-parser=true` and that `[general]` points at `nexitally-node-parser.js`.

After a correct parse, `[policy]`, `[filter_remote]`, and `[rewrite_remote]` in the personal profile must be unchanged. Only the Nexitally resource's node list updates.

## Parser URL fails to load

The jsDelivr line in the README tracks `main`:

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/pang990801/quanx-resource-parsers@main/nexitally-node-parser.js
```

If jsDelivr is stale, pin a commit SHA instead of `main`, or use the raw GitHub URL for the same file. Do not switch to an unrelated community parser unless the Nexitally resource is removed.

## Duplicate nodes

The parser de-duplicates exact trimmed lines only. Two rows that differ by a single field both appear. Clean those on the provider side or filter later with a general-purpose parser.

## Desktop harness disagrees with the app

The harness executes the same file in Node's `vm`. Differences usually mean the app did not receive the same `$resource.content` (HTML interstitial, different URL, truncated download). Compare a local save of the body, not the on-screen node list.

## Official server-only subscription appears

If Nexitally ships a server-only Quantumult X resource, point `[server_remote]` at that URL, set `opt-parser=false` (or omit it), and delete `resource_parser_url` if nothing else needs it.
