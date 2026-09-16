# Troubleshooting

All of the error strings below are produced by `nexitally-node-parser.js` or by Quantumult X itself. Pair them with the fixtures in [`examples/nexitally/`](../examples/nexitally/).

## Parser errors

### `Nexitally parser: [server_local] section was not found.`

The downloaded body is not a Quantumult X full profile, or the section header is absent.

Check:

1. The `[server_remote]` URL is the Nexitally **Quantumult X configuration file** URL, not a Clash YAML, Surge conf, or base64 v2ray subscription.
2. You did not paste a filtered "nodes only" page that already omitted `[server_local]`.
3. The file is not HTML (login wall, CDN error page). Save the resource once and look at the first lines.

Reproduce locally with [`examples/nexitally/missing-server-local.conf`](../examples/nexitally/missing-server-local.conf):

```bash
node scripts/run-parser.js examples/nexitally/missing-server-local.conf
```

### `Nexitally parser: no usable server entries were found.`

`[server_local]` existed but every row was a comment, a traffic/expiry banner, a `[Premium]` placeholder, or an unsupported prefix.

Check:

1. The account actually has nodes (not only a traffic billboard).
2. Node types are in the accepted set (`anytls`, `shadowsocks`, `vmess`, `vless`, `trojan`, `http`, `socks5`). Hysteria2 / WireGuard / SSR are dropped.
3. You are not looking at a fixture that was *designed* to be empty.

Reproduce with [`examples/nexitally/no-usable-servers.conf`](../examples/nexitally/no-usable-servers.conf).

## Quantumult X UI / config problems

### Resource refreshes but the node list looks like a whole profile

`opt-parser` is off. The raw download includes `[policy]` and filters, which Quantumult X cannot treat as servers.

Fix the resource line:

```ini
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

### Parser never runs

- `[general]` has no `resource_parser_url`, or it still points at another script (for example KOP-XIAO's generic parser).
- jsDelivr is serving a cached older file. Switch to the `raw.githubusercontent.com` URL or pin a commit SHA:

  ```ini
  resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@<commit>/nexitally-node-parser.js
  ```

- The resource line has `enabled=false`.

### AnyTLS nodes appear, then fail to connect

The parser only copies text. Handshake support is a Quantumult X version concern. AnyTLS needs **1.5.6 (build 914)+**. Reality-style AnyTLS needs a build that implements `reality-base64-pubkey` / `reality-hex-shortid`.

### Traffic / Expire rows still show up

1. Confirm `opt-parser=true` and that *this* repository's parser is the one in `[general]`.
2. Check whether the banner text uses a new wording that is not in the exclude list (`Traffic`, `Expire`, `Reset`, `Days Left`, `流量`, `到期`, `剩余`, `套餐`, `[Premium]`).
3. Add a **sanitized** fixture that demonstrates the new wording and extend the exclude regex. Do not attach a real subscription dump to an issue.

### Duplicates remain

The parser deduplicates on the **entire trimmed line**. Two rows with the same host but different `tag=` values are kept. That is intentional: they are different Quantumult X servers.

### Policy groups are empty after a refresh

The parser does not write `[policy]`. Empty groups usually mean:

- `resource-tag-regex` does not match the `[server_remote]` tag (`Nexitally`).
- `server-tag-regex` is tighter than the node names Nexitally currently ships.
- The refresh failed (see parser errors above) and the resource is empty.

See [`examples/quantumult-x/keep-local-policy.conf`](../examples/quantumult-x/keep-local-policy.conf).

### CRLF or a UTF-8 BOM

Windows-saved or dashboard-exported files may start with `U+FEFF` and use `\r\n`. The parser strips both. Covered by [`examples/nexitally/crlf-and-bom.conf`](../examples/nexitally/crlf-and-bom.conf).

## Local harness mismatches

If `node scripts/check-examples.js` fails on your machine:

1. Confirm Node.js ≥ 18 (`node -v`).
2. Do not re-save `crlf-and-bom.conf` with an editor that strips the BOM or converts CRLF to LF.
3. Expected files must contain only server lines. A trailing section header in an `*.expected.txt` file is a fixture bug, not a parser bug.

## Things this parser will not fix

- A wrong or expired Nexitally URL (Quantumult X fails before `$resource.content` is a profile).
- TLS / Reality / cipher mismatches on the server side.
- Filter or rewrite updates. Those stay in your local profile by design.
- Multi-provider conversion (Clash → Quantumult X). Use a dedicated converter or Nexitally's official Quantumult X export.
