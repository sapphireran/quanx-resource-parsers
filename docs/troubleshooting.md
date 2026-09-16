# Troubleshooting

Personal checklist for the Nexitally parser. Start with the Quantumult X error text if there is one.

## Parser errors

### `Nexitally parser: [server_local] section was not found.`

Quantumult X downloaded something that is not a Quantumult X profile with `[server_local]`, or the section header is missing.

Check, in order:

1. The `[server_remote]` URL is Nexitally's **Quantumult X full configuration** URL, not a Clash / Surge / base64 subscription.
2. `opt-parser=true` is set. Without it you will not see this parser error; you will see a useless raw body instead.
3. The download is not an HTML login page or a CDN error document. Open the URL only on a private device if you must inspect it, then delete the copy.
4. Compare the shape (not the secrets) with `examples/nexitally/fixtures/missing-section.conf`.

### `Nexitally parser: no usable server entries were found.`

`[server_local]` existed, but every line was a comment, an unsupported protocol, an excluded banner, or a duplicate of an already dropped line.

Common causes:

- Nexitally returned only Traffic / Expire / `[Premium]` rows (expired plan, or a dashboard placeholder).
- The nodes use a protocol this parser does not list.
- The section is present and empty.

Reproduce with:

```bash
node scripts/run-parser.js --json \
  nexitally-node-parser.js \
  examples/nexitally/fixtures/placeholders-only.conf
```

If a live export (kept only on your machine) has real nodes and still fails, look at each line against `docs/parser-contract.md`. A tag that contains `Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, or `套餐` is dropped even if the rest of the line is a real server.

## Quantumult X UI problems

### Refresh stores a whole profile as "servers"

`opt-parser=true` is missing, or `resource_parser_url` is empty. Quantumult X is saving the downloaded full configuration as the resource body.

### Refresh uses the wrong parser

`resource_parser_url` already points at a community parser. Quantumult X will not also load `nexitally-node-parser.js`. Either switch the profile to this script or stop using this script in that profile.

### Nodes refresh but policies stay empty

The policy is matching the wrong thing.

- `resource-tag-regex=^Nexitally` must match the `[server_remote]` `tag=`.
- `server-tag-regex` matches individual node tags **after** parse. It will not match `Nexitally` unless a node is actually named that.

See `examples/profile-snippets/policy-with-resource-tag.conf`.

### Traffic or `[Premium]` rows appear as nodes

You are not running this parser. Confirm the parser URL, `opt-parser=true`, and that the resource actually refreshed after the last profile edit.

If you pointed Quantumult X at `examples/generic-server-local/extract-server-local.js` by mistake, switch back. That teaching script keeps info lines on purpose.

### Duplicate node names

The parser only collapses **exact** duplicate lines. Two servers with the same `tag=` and different hosts are both kept. Rename in a policy, or live with both; this script does not rewrite tags.

### AnyTLS nodes missing on an older Quantumult X

The parser will still return `anytls=` lines. An older client that does not speak AnyTLS will show them as unsupported. Update Quantumult X, or ignore those rows. The script does not convert AnyTLS to another protocol.

## Local checker problems

### `npm test` fails on a machine with old Node

Use Node 18+. The scripts use `fs`, `path`, and `vm` only.

### A fixture fails after you edited the parser

That is the checker doing its job. Update the expected files if the new behavior is intentional, or fix the parser if it is not. Do not weaken a fixture to hide a live-profile leak.

### You want to test a redacted live export

Keep that file outside the repository. Run:

```bash
node scripts/run-parser.js --json nexitally-node-parser.js /path/to/redacted-local-copy.conf
```

Read `docs/safety.md` before you create that copy.
